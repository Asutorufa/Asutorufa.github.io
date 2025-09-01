---
title: QdrantでHybrid Search
abbrlink: '1755854433972'
date: 2025-08-22 17:20:33
updated: 2025-08-22 17:20:33
tags:
  - llm
  - rag
  - text embedding
  - sparse vector
  - vector database
  - hybrid search
categories:
- llm
language: ja
---

密ベクトルは現在ではText Embeddingサービスや`vllm`などを使えば簡単に生成をてきる。  
疎ベクトルは色々と探しましたが、直接利用できるサービスがあまりはない、自分で用意しなければならない。
`Qdrant`が提供する`fastembed`は利用できますけど、対応している疎ベクトルモデルが少ないため、最後的に`sentence_transformers`の`SparseEncoder`を利用することにしました。

例えば、以下のようなドキュメントがあるとします：

```python
docx = [
    "test1",
    "test2",
    "test3",
    "test4",
]
```

戻り値の形式がわかりにくく、少し混乱しました：

```python
document_embeddings.coalesce().indices().cpu().numpy() = 
    [[ 0 0 0 0 1 1 1 2 2 2 3 3 ] [ 5 25 29 56 4035 4038 4059 1 2 3 98 67 54]]

document_embeddings.coalesce().values().cpu().numpy() = 
    [0.03429046 0.02966345 0.03258647 0.03258648 0.03258649 0.03137818 0.0306967 0.04750843 0.0475084 0.0475085 0.03258612 0.03137328]
```

Qdrant疎ベクトル形式の引数要求は以下のようになります：

```python
indices = [ 5   25   29 ... ]
values =  [ 0.03429046 0.02966345 0.03258647 ... ]
```

最後はなんとかわかりました、実は：

- `indices`の1次元目が `0` の要素が、`docs[0]` ("test1") に対応します。
- `indices`の1次元目が `1` の要素が、`docs[1]` ("test2") に対応します。
- ...

したがって、疎ベクトルは以下のようになります。
<!--more-->
- `test1`
  - indicesは`[5 25 29 56 4035]`
  - valuesは `[0.03429046 0.02966345 0.03258647 0.03258648]`  
- `test2`
  - indicesは`[4035 4038 4059]`
  - valuesは `[0.03258649 0.03137818 0.0306967]`  
- ...  
- ...  

以下は実装した例のコードです。`FastAPI`でhttpサービスを提供します。

```python
# sentence_transformersはtorchを依存している
# intelのMacはもうtorchを利用できないです、LinuxやArmのMacは必要です
from sentence_transformers import SparseEncoder
import uvicorn
from pydantic import BaseModel
from fastapi import FastAPI
from typing import List

class TextResponse(BaseModel):
    values: list[float]
    indices: list[int]


class TextRequest(BaseModel):
    text: list[str]
    query: bool = False


app = FastAPI()

@app.post("/sparse_embedding")
async def sparse_embedding(req: TextRequest):
    if req.query:
        # クエリー時はencode_queryを推薦するみたいです
        document_embeddings = model.encode_query(req.text)
    else:
        document_embeddings = model.encode_document(req.text)

    # torchのTesnorをnumpy配列に変換する
    indices = document_embeddings.coalesce().indices().cpu().numpy()
    values = document_embeddings.coalesce().values().cpu().numpy()

    indices_index = indices[0].tolist()
    indices_value = indices[1].tolist()

    data: List[TextResponse] = [
        TextResponse(indices=[], values=[]) for _ in range(len(req.text))
    ]

    # indexを基に、対応するindicesとvaluesを抽出します
    for index, i in enumerate(indices_index):
        data[i].indices.append(int(indices_value[index]))
        data[i].values.append(float(values[index]))

    return data


model = SparseEncoder(
    # オフライン環境では、モデルフィルが格納されたディレクトリを指定します、例え：/data/splade-v3
    "naver/splade-v3", device="cuda:" + str(args.cuda) if args.cuda != -1 else "cpu"
)

# HTTPのサービスを起動します
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

Qdrant Collectionを作成する

```go
qdrant.CreateCollection(context.TODO(), &qdrant.CreateCollection{
  CollectionName: collectionName,
  Timeout:        proto.Uint64(120),
  SparseVectorsConfig: &qdrant.SparseVectorConfig{
   Map: map[string]*qdrant.SparseVectorParams{
    "sparse": {// 疎ベクトルの設定
     Index: &qdrant.SparseIndexConfig{
      OnDisk: proto.Bool(false),
     },
    },
   },
  },
  VectorsConfig: &qdrant.VectorsConfig{
   Config: &qdrant.VectorsConfig_ParamsMap{
    ParamsMap: &qdrant.VectorParamsMap{
     Map: map[string]*qdrant.VectorParams{
      "dense": {// 密ベクトルの設定
       Distance: qdrant.Distance_Cosine,
       //　TextEmbeddingモデルに従って、例えば：voyage-3-large　1024 (default), 256, 512, 2048
       Size:     1024,
      },
     },
    },
   },
  },
})
```

ドキュメントの追加

```go
 texts := []string{"test1", "test2"}


// 密ベクトルを生成する
embeddings, err := q.embedding.TextEmbedding(ctx, texts...)
// 疎ベクトルを生成する
sparseEmbeddings, err := q.sparse.Embedding(ctx, sparse.EmbeddingRequest{ Text: texts..., Query: false })

 var points []*qdrant.PointStruct

 for i, c := range embeddings {
  points = append(points, &qdrant.PointStruct{
   Id: qdrant.NewIDUUID(uuid.New()),
   Vectors: qdrant.NewVectorsMap(map[string]*qdrant.Vector{
    "dense":  qdrant.NewVectorDense(toFloat32(c)),
    "sparse": qdrant.NewVectorSparse(sparseEmbeddings[i].Indices, sparseEmbeddings[i].Values),
   }),
   Payload: qdrant.NewValueMap(map[string]any{ "docx": texts[i] }),
  })
 }

 result, err := q.qdrant.Upsert(ctx, &qdrant.UpsertPoints{
  CollectionName: q.collection,
  Points:         points,
  Wait:           proto.Bool(true),
 })
```

ハイブリッド検索（Hybird Search）

```go
 embeddings, err := q.embedding.TextEmbedding(ctx, prompt)
 sparseEmbeddings, err := q.sparse.Embedding(ctx, sparse.EmbeddingRequest{Text: []string{prompt},　Query: true })

// Hybird Search時はSearchではなくQuery APIを使用する必要があります
 rsp, err := q.qdrant.GetPointsClient().Query(ctx, &qdrant.QueryPoints{
  CollectionName: q.collection,
  Query: &qdrant.Query{
   Variant: &qdrant.Query_Fusion{
    // Reciprocal Rank Fusion (RRF) を使って結果を統合します
    Fusion: qdrant.Fusion_RRF,
   },
  },
  Prefetch: []*qdrant.PrefetchQuery{
   {
    Using: proto.String("dense"),
    Query: qdrant.NewQueryDense(toFloat32(embeddings[0])),
    Limit: proto.Uint64(max(100, numDocuments)),
   },
   {
    Using: proto.String("sparse"),
    Query: qdrant.NewQuerySparse(sparseEmbeddings[0].Indices, sparseEmbeddings[0].Values),
    Limit: proto.Uint64(max(100, numDocuments)),
   },
  },
  WithPayload: qdrant.NewWithPayloadEnable(true),
  Limit:       proto.Uint64(max(50, numDocuments)),
 })

/*
    Rerank など
*/
```
