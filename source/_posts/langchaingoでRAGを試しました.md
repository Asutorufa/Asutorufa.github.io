---
title: langchaingoでRAGを試しました
date: 2024-11-06 10:37:12
updated: 2024-11-06 10:37:12
tags:
  - llm
  - rag
  - text embedding
categories:
  - llm
language:
---

> 日本語はまだ勉強中ですから、変などころあるなら、ぜひコメントしてください。

## RAGとは

RAGはRetrieval augmented generationの略です。  
大規模言語モデル内容生成する前に、promptによる外部のデーターベースに知識を検索、元のprompt組み合わせて、アウトプットを改善するための技術です。  

例えば：

ユーザ：今日の注目の新聞は何ですか？

gemini：

```md
今日の注目の新聞記事については、リアルタイムで変化するため、特定の新聞社名を挙げて「今日の注目の記事はこれです」と断言することは難しいです。
```

chatgpt:

```md
本日（2024年11月6日）の日本の注目ニュースは次のような内容が含まれている可能性があります：

アメリカ大統領選挙の最新動向 - 特に若い世代の投票行動や政策への関心が注目されています。
国内経済とインフレの動き - 日本の物価高騰が続き、家計への影響や政府の対応が議論されています。
アジアの地政学的緊張 - 日本周辺地域の安全保障に関連する動向が続いています。
以上の内容が注目ニュースとして考えられますが、詳細については直接ニュースソースで確認されるとよいでしょう。
```

geminiはリアルタイムによっての内容は回答できません。  
chatgptはRAGか、Function Callingか、どちかを使えていると思います。  
今回はgolang+langchaingo+ollama+qdrantでRAGに実験してみます。

## 準備
<!--more-->
### ollamaをインストール

```shell
curl -fsSL https://ollama.com/install.sh | sh
```

### qdrantのコンテナを実行

```shell
mkdir -p ~/.config/qdrant
docker run -p 6333:6333 -p 6334:6334 \
    -v ~/.config/qdrant:/qdrant/storage:z \
    qdrant/qdrant
```

### bge-large-en-v1.5をollamaで実行

知識をベクトルデータベースに保存してにはText Embedingモデルが必要です。今回はbge-large-en-v1.5を使うことになりました。  

ollamaのモデルライブラリーはbge-large-en-v1.5がありませんので、bge-large-en-v1.5をGGUFに変換することが必要です。  

git-lfsとcmakeをインストール

```shell
sudo apt install git-lfs cmake
git lfs install
git clone https://huggingface.co/BAAI/bge-large-en-v1.5
```

llama.cppをクローン

```shell
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp/
# python仮想環境はおすすめです
sudo apt install python3.12-venv
python3 -m venv python-venv
./python-venv/bin/pip3  install -r requirements.txt
```

GGUFに変換

```shell
 ./llama.cpp/python-venv/bin/python3 ./llama.cpp/convert_hf_to_gguf.py ./bge-large-en-v1.5/
cd bge-large-en-v1.5/
echo "FROM ./bge-large-en-v1.5-F16.gguf" > Modelfile
ollama create bge-large-en-v1.5-F16 -f Modelfile
# embedingモデルはollamaで直接実行はできませんです
# Error: "bge-large-en-v1.5-F16" does not support generate
# ここは試してみてだけです
ollama run bge-large-en-v1.5-F16
```

### Qwen2.5をollamaで実行

```shell
# 32bは20GBのGPUメモリ(VRAM)が必要です
# CPUもできるですが、非常に重いですから
# 3bや7bや14bなどもぜひ使ってみてください
ollama run qwen2.5:32b-instruct
```

## 実現

### text embedder

```golang
import (
 "github.com/tmc/langchaingo/embeddings"
 "github.com/tmc/langchaingo/llms/ollama"
 "github.com/tmc/langchaingo/vectorstores/qdrant"
)

 llm, err := ollama.New(
  ollama.WithModel("bge-large-en-v1.5-F16"),
  ollama.WithServerURL("http://localhost:11434"),
 )
 if err != nil {
 panic(err)
 }

 embeder, err := embeddings.NewEmbedder(llm)
 if err != nil {
 panic(err)
 }

qu,err := url.Parse("http://localhost:6333")
if err != nil {
 panic(err)
}

 qd, err := qdrant.New(
  qdrant.WithURL(*qu),
  qdrant.WithCollectionName("test"),
  qdrant.WithEmbedder(embeder),
 )
 if err != nil {
  return nil, err
 }
```

テキストを導入

```golang

// TextToChunks テキストを分割
func TextToChunks(r io.Reader, chunkSize, chunkOverlap int) ([]schema.Document, error) {
 // 新たなドキュメンタリーローダーを作成
 docLoaded := documentloaders.NewText(r)
 // テキストを再帰的に分割し方法
 split := textsplitter.NewRecursiveCharacter()
 // 分割サイズを設定
 split.ChunkSize = chunkSize
 // 重なるサイズを設定
 split.ChunkOverlap = chunkOverlap
 // ロードして分割する
 docs, err := docLoaded.LoadAndSplit(context.Background(), split)
 if err != nil {
  panic(err)
 }
 return docs, nil
}

  docs, err := TextToChunks(strings.NewReader(`テストテキスト`), 300, 20)
  if err != nil {
  panic(err)
  }


// ベクトルデーターベースに導入
 _, err := qd.AddDocuments(context.TODO(), docs)
 if err != nil {
  panic(err)
 }
```

### RAG

知識を検索

```golang
 optionsVector := []vectorstores.Option{
  vectorstores.WithScoreThreshold(0.80),
 }

 retriever := vectorstores.ToRetriever(qd, 10, optionsVector...)

 docRetrieved, err := retriever.GetRelevantDocuments(context.Background(), prompt)
 if err != nil {
  panic(err)
 }
```

llmで予測する

```golang
 llm, err := ollama.New(
  ollama.WithModel("qwen2.5:32b-instruct"),
  ollama.WithServerURL("http://localhost:11434"),
 )
 if err != nil {
 panic(err)
 }

 var msgs []llms.MessageContent

 for _, doc := range docRetrieved {
  msgs = append(msgs, llms.TextParts(llms.ChatMessageTypeAI,  doc.PageContent))
 }

 msgs = append(msgs, llms.TextParts(llms.ChatMessageTypeHuman, prompt))

 _, err := llm.GenerateContent(ctx, msgs,
  llms.WithTemperature(0.3),
  llms.WithStreamingFunc(func(ctx context.Context, chunk []byte) error {
 // 結果をストリームで標準出力に出力して
  fmt.Print(string(chunk))
   return nil
  }),
 )
 if err != nil {
 panic(err)
 }
```

<!-- 

標準出力：ひょうじゅんしゅつりょく 

-->

## 参考

- <https://tech.takuyakobayashi.jp/2024/06/14/526>
- <https://aws.amazon.com/jp/what-is/retrieval-augmented-generation/>
- <https://wiki.eryajf.net/pages/6bd394/#前置准备>
- <https://forbesjapan.com/articles/detail/72042>
- <https://en.wikipedia.org/wiki/Retrieval-augmented_generation>
