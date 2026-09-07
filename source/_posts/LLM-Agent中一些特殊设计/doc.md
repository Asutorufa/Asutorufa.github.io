---
title: "LLM Agent中一些特殊设计"
abbrlink: "1782195801077"
date: 2026-06-23 14:23:21
updated: 2026-06-23 14:23:21
tags: []
categories: []
language: zh-Hans
wip: true
---

## 服务提供商

目前基本只有三种接口

- OpenAI
  - Chat Compelete(当前第三方服务使用居多，问题也最多)
  - Responses(GPT 5+)
- Anthropic
- Gemini

其中OpenAI Responses, Anthropic, Gemini这三个接口设计基本差不多，都可承载思维链，每次可输入多个Content内容，且可输入媒体（图片等）等，这三个的接口比较好统一，转换起来也不复杂。\
但是OpenAI Chat Compelete就比较麻烦了，第三方服务用的最多，处理起来也最麻烦，因为它最初设计时最没有承载思维链的功能，导致各家存放的地方都不一样，有些服务商还强制Reason模型回放思维链。\
为了统一接口，这里OpenAI Chat Compelete只能暴力转换了，设计依旧按照其余的接口设计来。比如类似：

```go
type Message struct {
	Parts []MessagePart `json:"content_parts"`
}

type MessagePart struct {
	Text             *MessageTextPart         `json:"text"`
	Image            *MessageImagePart        `json:"image"`
	ToolCall         *MessageToolCallPart     `json:"tool_call"`
	ToolCallResponse *MessageToolResponsePart `json:"tool_call_response"`
	// ...
	// ...
	Thinking *MessageThinkingPart `json:"thinking"`
}
```

因为Chat Compelete不支持承载多个Part，所以我们每次只需要将`Parts`以扁平化的方式拆为Chat Compelete的结构即可，存储也很简单，每个`Parts`只存一个内容即可，这样即使切换模型，其他模型生成的历史内容也可以正常使用。

### 思维链回放

对于闭源模型，比如GPT,Claude等，他们思维链不是公开的，甚至会有加密来防止你对思维链进行修改，所以为了能得到更好的生成结果，以及节省成本，请求时最好带上这些完整的加密内容。比如：

- Anthropic

```go
type ThinkingBlockParam struct {
	Signature string `json:"signature" api:"required"` <-- 
	Thinking  string `json:"thinking" api:"required"`
}
```

- OpenAI Responses

```go
type ResponseReasoningItem struct {
	// The unique identifier of the reasoning content.
	ID string `json:"id" api:"required"`
	// Reasoning summary content.
	Summary []ResponseReasoningItemSummary `json:"summary" api:"required"`
	// Reasoning text content.
	Content []ResponseReasoningItemContent `json:"content"`
	// The encrypted content of the reasoning item - populated when a response is
	// generated with `reasoning.encrypted_content` in the `include` parameter.
	EncryptedContent string `json:"encrypted_content" api:"nullable"` <--
	// The status of the item. One of `in_progress`, `completed`, or `incomplete`.
	// Populated when items are returned via API.
	//
	// Any of "in_progress", "completed", "incomplete".
	Status ResponseReasoningItemStatus `json:"status"`
}
```

对于Chat Compelete来说，因为不同服务商的存储思维链的字段都不一样，适配起来很麻烦，所以最好直接存思维链的原始数据结构，回放时直接塞入原始数据。比如可以加个类似下面的字段：

```go
type MessageThinkingPart struct {
	Summary string `json:"summary"` // 展示用，不进行回放
	Raw     struct {
		Kind       string         `json:"kind"`
		Vllm       jsontext.Value `json:"vllm"`
		Openrouter jsontext.Value `json:"openrouter"`
		// ...
		// ...
		Minimax jsontext.Value `json:"minimax"`
	} `json:"raw"`
}
```

生成时直接将`Raw`中的原始json塞入请求的字段即可。

### 缓存

OpenAI,Anthropic,Gemini 都支持输入缓存，命中缓存后的价格回降低非常多。比如GPT-5.5：

- 未命中缓存的价格为 $0.005/1K
- 命中缓存的价格为 $0.0005/1k

但是命中缓存有着严格要求，比如：

- 使用前缀匹配，所以每次请求时，历史消息的内容，思维链，顺序都不能变化
- 可使用的Tools不能发生变化
- System Prompt 不能发生变化
- ...

所以在设计Agent循环逻辑，及Prompt时，如果想尽量节省成本，则需要考虑在此方面进行优化。

Vllm目前也支持前缀缓存，不过需要在启动时主动打开：

```shell
vllm serve --enable-prefix-caching ...
```

## Skills

Skill 更像提前预制好的Prompt+Tools，可以作为一种拓展给Agent用，现在不少Skills甚至自带Script等让Agent来执行。

Skill实现起来并不复杂，目前主要问题是没有一种通用的规范来规定Skill应该如何编写，各家提供的方式都不一样，虽然有 [agentskills](https://agentskills.io/)，但这个目前貌似也只能作为一种参考，而不是规范。如果想用目前互联网中已经存在的Skill，还是需要对不同的平台单独进行适配。\
其次审核也是大问题，Skill中自带的大量工具和脚本很难进行审核，甚至最近还出现了巨多的供应链攻击。

### MCP

虽然很早就提出了MCP，但目前来看，它完全可以被SKills替代，并且MCP的设计也是一言难尽，最初的协议大量使用stdio实现，没有考虑跨进程的问题，后期又添加很多不同的远程实现，比如SSE，Websocket等，明明从一开始就可以选择一种相对通用的方式来实现。\
还好现在即使Agent只支持SKills也完全够用了，不需要考虑MCP的复杂逻辑。

## SubAgent

SubAgent相比于Agent，更像是提供了用来节省成本及并发的工具。SubAgent在目前的Agent设计中是不可或缺的，他的好处有很多：

- 根据不同任务设计不同的流程及Prompt，甚至可以给不同的任务指定不同的模型，复杂任务用参数比较大的模型，简单任务则用价格比较低的模型。
- 执行历史不会进入Main Agent中，减少上下文长度。
- 可同时进行多个任务，并且可以是非阻塞的，每完成一个任务就可以将结果传给Main Agent。

但为了实现这些功能，实现逻辑则变得复杂很多：

- 为了防止任务泄漏，需要完整实现一个任务管理系统。
- 为了保证任务执行的效果，需要Main Agent能尽可能的提取及总结有效的上下文给SubAgent
- 要求模型的能力，模型的能力太低的话，可能连处理单纯的Tool Call都费劲，更不要说一整套SubAgent了。

## 对话回放及压缩

### 回放

不同LLM服务商提供的接口有着不同的限制，这也表示我们需要尽量设置一种通用的方式来回放对话。比如zenai，它的接口限制很严格：

- reasoning模型必须回放思维链，如果思维链为空接口直接报错
- 每个tools的请求必须有回复，并且必须在该tools请求的下一个message中回复，比如anthropic的接口单个message是允许放多个tools请求和回复的，这时我们就没有办法一个一个回复tools了，必须等他们都执行完然后全部放在一个message中。
- ...

最好找一种限制并集来每次对LLM的请求进行处理，比如每次过滤掉没有tools回复的请求（在对话意外中断/用户主动中断时会发生）。

### 压缩

目前LLM模型都有上下文大小的限制，这也表示对话长度是无法无限增大的，需要我们定期去压缩，而且需要平衡成本和压缩效果。压缩也需要考虑一些问题：

- 压缩后如何保证LLM不忘掉当前用户的prompt
- 压缩后如何保证LLM不忘掉历史对话中用户的个性化配置
- 因为压缩会导致前缀缓存失效，所以还需考虑如何在最大节省成本的情况下实现最好的压缩效果

同样我们需要找到一个比较均衡的办法来实现压缩逻辑，比如：

- 压缩后依旧保留最后一次用户的prompt和最后两条消息，那么压缩过程将会被分为

  ```mermaid
  flowchart TD
    subgraph History["Compressible History"]
        A["Old History"]
        C["Current History"]
    end

    B["Current Prompt"]
    D["Last 2 Messages"]

    A --> B --> C --> D
  ```

  先压缩当前prompt之前的历史，如果没有就压缩当前prompt至最后两条消息之间的历史。
  顺序不要变，也不要直接`Old History`和`Current History`拼一起压缩，这样很有可能改变语义导致LLM错误理解被压缩的历史消息。

- 为了不让LLM忘掉对话中用户的一些个性化设置，可以结合记忆一起使用，最好让LLM在压缩的过程中一起输出可被记忆的信息，比如：

  - 长期记忆：比如 今后应该怎样怎样做，某个东西其实是某某东西 等，这种很明显不需要用户去反复提示LLM，尤其每次对话一压缩就需要用户再次提示这种东西，用户体验也很差。
  - 短期记忆：比如 这三天会怎么怎么样，今天怎么怎么样， 这种记忆不会一直有效，所以在实现时可以加上ttl，到期后直接淘汰掉没用的记忆，防止记忆越加越多。

## 记忆

除了上述对话压缩中提到的记忆功能，为了提高效率和减少成本，同样需要对记忆功能进行特殊设计：

为了防止LLM反复调用查找记忆，我们同样需要对记忆实现总结功能：

- 每次记忆发生变化后，将新增的记忆和旧的总结文本结合组合让LLM生成新的总结文本，总结逻辑是：
  - 移除相悖的记忆，以新的为准，比如用户可能会改变某种之前的个性化设置
  - 合并相同的记忆，语义相似的记忆直接合并并总结为新的记忆
  - 保留对话可能频繁使用的记忆，比如个性化设置，输出要求等

- 短期记忆可能比较多，可以只取最近一段时间内的进行总结，更久远的则可让LLM主动搜索
