---
title: Resume
date: 2017-10-08 10:01:32
type: resume
language: ja
---

職務経歴書

## 基本情報

|key|value|
|---|-----|
|Name||
|Blog|[asutorufa.github.io](https://asutorufa.github.io/)|
|Github|[Asutorufa](https://github.com/Asutorufa)|

## スキル

### 言語

- Go
- Javascript/Typescript
- Kotlin
- Rust

### フレームワーク

- Android
- React
- Next.js

### その他

- LLM(RAG, Function calling)
- Kubernetes
- Docker/Podman
- Hyperledger Fabric
- Electron
- Libvirtd/KVM

## 自然言語

- 中国語 - ネイティブ
- 日本語 - JLPT N2 (141)
- 英語 - ドキュメント読み書きレベル

## 強み

- やったことはないが興味があるもの

## 職務経歴

### yyyy/mm - 現在 : 社2

職務: インフラエンジェニア・バクアンドエンジェニア

### yyyy/mm - yyyy/mm: 社1

職務: バクアンドエンジェニア

## ソフトウェア開発経歴

### 社内検視システムの運用・保守

- 技術
  - Kubernetes
  - Helm
  - Prometheus, loki, Promtail, Opentemetry

### 社内ライセンスシステム

- Goで開発
- CRMと連携してライセンスを自動的に生成する
- SaaSスシテムと連携してDeploymentを自動的に作成する・削除する

### 社内SaaSシステム

- KubernetesでSaaSシステムを運用(3 masters, 6 workers)
- Prometheus, Grafana, Loki, Promtailなどでスシテムを監視・larkにアラート通知
- GoでSaaSのコントローラを実現、主にKubernetesを操作

#### タスク自動運行AIの開発

- Goで開発
- Qwen2/Deepseekは基本のモデルとして
- Redisで分散ロックを実現
- 中国語と英語のシステムプロンプトのデザインと実現
- Function Callingを実現
- Clickhouseで歴史とキャッシュを保存
- Terrafromでシステムを運用

#### サンドボックスの開発

- Goで開発
- LibvirtdとKVMで仮想マシン運行
- 仮想マシンのネトワークをコントロールのためGoでソフトウェアルーターを開発

#### ログゲートウェイの開発

- ログ索引のためBleveでログの索引を保存
- 索引言語のASTを実現
- ログをフィルタリングのためエイホ–コラシック法，grok（正規表現RegExpと似ている）などの実現
- BBoltDBとSQLiteに統計データとフィルタルールを保存

#### BaaS(Blockchain as Service)　システム開発

- 技術
  - Hyperledger Fabric
  - Go
  - Kubernetes

## 業務外活動

### オープンソースプロジェクト

- [yuhaiin](https://github.com/yuhaiin)

実績：

- 各種プロキシプロトコルの実現
- 各種DNSプロトコルの実現
- ルールマーチの実現
- Webページの実現
- Android UIの実現

### オープンソース貢献

- exit process after stopped && read logs with previous time [logcatviewer #1](https://github.com/kyze8439690/logcatviewer/pull/1)
- remove install_airgap_tarball grep error output [rancher/rke2 #4501](https://github.com/rancher/rke2/pull/4501)
- Add support for stream writer and reader [go-openssl #26](https://github.com/Luzifer/go-openssl/pull/26)
- Fix panic when reading incomplete blocks from underlying reader [go-openssl #27](https://github.com/Luzifer/go-openssl/pull/27)
- only check KeepAliveInterval if keep alives are enabled [go-yamux #113](https://github.com/libp2p/go-yamux/pull/113)
- check deadline before sending a message [go-yamux #114](https://github.com/libp2p/go-yamux/pull/114)
- SocketGet support udp and ipv6 [netlink #911](https://github.com/vishvananda/netlink/pull/911)
- net/dns: close ctx when close dns directManager [tailscale #11555](https://github.com/tailscale/tailscale/pull/11555)
- fix build ReJITEnterLeaveHooks bug when use dotnet runtime [microsoft/clr-samples #23](https://github.com/microsoft/clr-samples/pull/23)
- fix(deps): fix test/tools ginkgo typo [containers/buildah #5455](https://github.com/containers/buildah/pull/5455) - [release v1.38.0](https://github.com/containers/buildah/releases/tag/v1.38.0)
- set: add set support auto-merge [google/nftables #271](https://github.com/google/nftables/pull/271)
- consumer add support custom logger [aliyun/aliyun-log-go-sdk #293](https://github.com/aliyun/aliyun-log-go-sdk/pull/293)
- add support set subPath for persistence [qdrant/qdrant-helm #271](https://github.com/qdrant/qdrant-helm/pull/271)
- add s3 UsePathStyle flag [tailscale/go-cache-plugin #12](https://github.com/tailscale/go-cache-plugin/pull/12)
- Fix get client version [qdrant/go-client #74](https://github.com/qdrant/go-client/pull/74)
- fix maxMapSize typo in aix, android, solaris [etcd-io/bbolt #988](https://github.com/etcd-io/bbolt/pull/988)
- remove empty layer after delete or update value [coder/hnsw #11](https://github.com/coder/hnsw/pull/11)
- add discovery config to make iscsiadm discovery target [kubernetes-csi/csi-driver-iscsi #350](https://github.com/kubernetes-csi/csi-driver-iscsi/pull/350)
