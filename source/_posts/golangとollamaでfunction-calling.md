---
title: golangとollamaでfunction calling
tags:
  - llm
  - function calling
  - text embedding
categories:
  - llm
language: ja
abbrlink: '23567986'
date: 2024-11-11 19:11:06
updated: 2024-11-11 19:11:06
---

今回はollamaのオフィシャルクライアントでfuncation callingを使いたいです。　　
前回はlangchaingoで使っただけと、試してたらollamaの引数toolsは無効です、githubの実例[ollama_functions_example](https://github.com/tmc/langchaingo/blob/main/examples/ollama-functions-example/ollama_functions_example.go)はsystem messageとtoolsのjsonを組み合わせて内容を生成する。例えば：

```go
func systemMessage() string {
 bs, err := json.Marshal(functions)
 if err != nil {
  log.Fatal(err)
 }

 return fmt.Sprintf(`You have access to the following tools:

%s

To use a tool, respond with a JSON object with the following structure: 
{
 "tool": <name of the called tool>,
 "tool_input": <parameters for the tool matching the above JSON schema>
}
`, string(bs))
}
```

これはちょっと優雅でない、`ollama/api`を使いたいと思います。

## function callingとは
<!-- more -->
llmのレスポンスが外部関数の呼び出しを検知し、関数の結果を組み合わせて内容を生成する機能です。　　
例えば：「東京の天気は？」はpromptをとして、「晴れです」と生成する。　　
大勢のllmはfunction callingをtoolと読んでいる、呼び出しどき引数として引き渡して内容を生成する。　　

<!-- 
primjs can't support exclude languages,
so we direct use hexo tag system
 -->

{% mermaid sequenceDiagram %}
    actor ユーザ
    ユーザ->>サーバー: 東京の天気は？
    サーバー->>llm: promptとtools
    llm--)サーバー: 関数を呼び出し<br/>引数（東京）を返す
    サーバー->>外部サービス: 東京の天気を取得
    外部サービス--)サーバー: 天気を返す
    サーバー->>llm: 天気をpromptに追加
    llm-->>サーバー: 生成する内容を返す
    サーバー->>ユーザ: 内容を返す
{% endmermaid %}

<!-- 
取得：しゅとく
 -->

## goで実現

関数と引数の説明(Description)は自然な言葉で良いです、一般的なプログラミングとはちょっと違うと思います。  

toolsの定義  

```go
import "github.com/ollama/ollama/api"

tools := api.Tool{
      Type: "function",
      Function: api.ToolFunction{
       Name:        "getCurrentWeather",
       Description: "Get the current weather for a city",
       Parameters: struct {
        Type       string   "json:\"type\""
        Required   []string "json:\"required\""
        Properties map[string]struct {
         Type        string   "json:\"type\""
         Description string   "json:\"description\""
         Enum        []string "json:\"enum,omitempty\""
        } "json:\"properties\""
       }{
        Type:     "object",
        Required: []string{"city"},
        Properties: map[string]struct {
         Type        string   "json:\"type\""
         Description string   "json:\"description\""
         Enum        []string "json:\"enum,omitempty\""
        }{
         "city": {
          Type:        "string",
          Description: "The city to get the weather for",
         },
        },
       },
      },
     }
```

外部サービスの呼び出しを実現

```go
processToolCall := func(cr api.Chat.Response) (string, error) {
   for _, v := range cr.Message.ToolCalls {
      if v.Function.Name == "getCurrentWeather" {
        return fmt.Sprintf("the weather of %v is 64 and sunny", v.Function.Arguments["city"]), nil
      }
   }
  return "", errors.ErrUnsupported
}
```

chains を実現

```go
uri, err := url.Parse("http://localhost:11434")
if err != nil {
  panic(err)
}

client := api.NewClient(uri, &http.Client{})

messages := []api.Message{
  {
   Role:    "user",
   Content: prompt,
  },
}

ctx := context.TODO()

err := o.llm.Chat(ctx,
  &api.ChatRequest{
   Model:    "qwen2.5:32b-instruct",
   Stream:   lo.ToPtr(false),
   Messages: messages,
   Options: map[string]interface{}{
    "temperature": 0.3,
   },
   Tools: []api.Tool{tools},
  },
  func(cr api.ChatResponse) error {
      msg,err := processToolCall(cr)
      if err != nil {
        return err
      }

     messages = append(messages, api.Message{
      Role:    "tool",
      Content: msg,
     })
   return nil
  },
)
if err != nil {
  panic(err)
}

err = o.llm.Chat(ctx,
  &api.ChatRequest{
   Model:    "qwen2.5:32b-instruct",
   Stream:   lo.ToPtr(false),
   Messages: messages,
   Options: map[string]interface{}{
    "temperature": 0.3,
   },
  },
  func(cr api.ChatResponse) error {
   fmt.Print(cr.Message.Content)
   return nil
  },
)
if err != nil {
  panic(err)
}
```

## 実行

prompt：`東京の天気は？`  
返事：　`東京の天気は晴れで、温度は約64°F（約18°C）です`

## 参考

<https://zenn.dev/kazuwombat/articles/1f39f003298028>
