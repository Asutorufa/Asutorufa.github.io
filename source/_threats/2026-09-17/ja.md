---
id: "2026-09-17"
title: "Threat Intelligence Daily · 2026-09-17"
date: "2026-09-17"
updated: "2026-09-17 23:00:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "Cisco は、実際の攻撃で悪用されている CVSS 10.0 の ISE 認証バイパス脆弱性を公開した。ESET は FamousSparrow が中南米の政府機関に新型バックドア SparroWocky を展開していることを報告し、CrowdStrike は npm 経由で配布された PhantomRaven 情報窃取マルウェアを分析した。Malwarebytes は大規模な T-Mobile テーマの SMS フィッシングを追跡し、JVN は東北電力「よりそうeねっと」の修正済みハードコード鍵問題を公開した。"
total: 5
critical: 1
high: 2
medium: 1
low: 1
exploited: 3
tags:
  - active-exploitation
  - zero-day
  - authentication-bypass
  - cyber-espionage
  - supply-chain
  - phishing
  - mobile-security
  - Cisco-ISE
  - FamousSparrow
  - SparroWocky
  - PhantomRaven
  - npm
  - T-Mobile
  - Yorisou-e-Net
  - CVE-2026-75553
  - CVE-2026-76460
cves:
  - CVE-2026-75553
  - CVE-2026-76460
iocs:
  - 38.54.57.17
  - t-mobile.biktpw.top
  - t-mobile.cugbjl.top
  - t-mobile.cymfjd.top
---

## 昨日からの変化

- **NEW — Cisco ISE:** Cisco は CVE-2026-76460 を公開した。ISE / ISE-PIC の認証を回避できる CVSS 10.0 の脆弱性で、実際の攻撃での悪用が確認されている。
- **NEW — FamousSparrow:** ESET は、中南米の政府機関を標的とする新しい C++ バックドア SparroWocky を報告した。
- **NEW — PhantomRaven:** CrowdStrike は、PhantomRaven 情報窃取マルウェアを含む悪意ある npm パッケージを、金銭目的のバグバウンティ参加者に関連付けた。
- **NEW — T-Mobile phishing:** Malwarebytes は、1,000 種類を超える類似 SMS テンプレートと少なくとも 81 個の短命ドメインを確認した。
- **NEW — よりそうeねっと:** JVN は CVE-2026-75553 を公開した。Android / iOS 版 2.8.0 でハードコードされた暗号鍵が修正されている。

## 優先対応

- **Immediate:** Cisco ISE / ISE-PIC を更新する。CVE-2026-76460 に回避策はない。更新完了までは管理インターフェースへの到達元を制限し、公開されていたシステムの不審なアクセスを確認する。
- **Today:** 中南米の組織は、Windows 上の SparroWocky IOC、不審なサービスまたは Run-key 永続化、443/8080 への直接 C2 接続、説明できない BOF 実行を調査する。
- **Today:** npm 依存関係の導入履歴と開発端末を確認し、PhantomRaven に関連する信頼できないパッケージを探す。実行が確認された場合は、露出した可能性のある資格情報とトークンをローテーションする。
- **Monitor:** T-Mobile のポイント失効を装う SMS ドメインをフィルタし、メッセージ内リンクではなく公式アプリまたは公式サイトから通知を確認するよう案内する。

## 重点脅威

### Cisco ISE CVE-2026-76460 が実際の攻撃で悪用されている

**Severity:** Critical  
**Status:** Confirmed active exploitation  
**CVSS:** 10.0  
**CVE:** CVE-2026-76460  
**Affected:** Cisco Identity Services Engine (ISE) / ISE Passive Identity Connector (ISE-PIC)

Cisco によると、未認証のリモート攻撃者は影響を受ける API エンドポイントへ細工したリクエストを送り、Web 管理インターフェースの認証を回避できる。アドバイザリは 9 月 16 日に公開され、修正版が提供されている。回避策はない。Cisco PSIRT は実際の攻撃での悪用を確認している。

#### 推奨対応

利用中の ISE 系列に対応する修正版へ更新する。更新完了までは管理インターフェースを信頼できる管理ネットワークに限定する。認証、API、管理操作のログを確認し、正規管理者に対応しないアクセスを調査する。

#### Sources

- [Cisco — Identity Services Engine Authentication Bypass Vulnerability](https://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-ISE-ABP-VNSW7Tn5.html)

### FamousSparrow が中南米政府機関へ SparroWocky を展開

**Severity:** High  
**Status:** Confirmed cyber-espionage campaign  
**Threat actor:** FamousSparrow  
**Malware:** SparroWocky  
**Affected:** ESET が観測した中南米の政府機関

ESET はこのキャンペーンと SparroWocky を高い確度で FamousSparrow に帰属させている。2025 年半ば以降、ESET のテレメトリで確認された標的の 90% が中南米にある。モジュール型 C++ バックドアは、ファイルやコマンドの実行、TCP プロキシ、ファイル流出、スクリーンショット、Beacon Object File の実行に対応する。永続化には Windows サービスまたは Run key を使い、C2 は通常 IP アドレスの 443 番ポートへ直接接続し、一部では 8080 も使う。

#### 推奨対応

- ESET が公開した IOC でエンドポイントを検索し、未知のインフラに対する 443/8080 の直接通信を確認する。
- 不審なサービスや Run-key 永続化を、ファイル流出や周期的なスクリーンショット取得と合わせて調査する。
- アルゼンチン、エクアドル、グアテマラ、ホンジュラス、パナマ、ペルー、プエルトリコ、ベネズエラの政府組織は、このキャンペーンを優先してハンティング対象に含める。

#### IOC

- `38.54.57.17` — ESET が観測した SparroWocky C2。

#### Sources

- [ESET Research — Beware the SparroWock: The backdoor that bites, the commands that catch](https://www.welivesecurity.com/en/eset-research/beware-sparrowock-backdoor-bites-commands-catch/)

### PhantomRaven が悪意ある npm パッケージから配布

**Severity:** High  
**Status:** Confirmed malicious-package campaign  
**Malware:** PhantomRaven  
**Affected:** 悪意ある npm パッケージを導入した開発者と組織

CrowdStrike は、金銭目的の攻撃者が JavaScript 製情報窃取マルウェア PhantomRaven を npm から配布していたことを確認した。攻撃者はバグバウンティにも参加しており、記録された事例の一つでは、dependency confusion による侵害後に潜在的な被害組織へ連絡していた。CrowdStrike はコードの特徴とトークン分析から、LLM が開発に使われた可能性が高いと評価している。この評価は、悪意あるパッケージの配布とマルウェア動作が確認されている事実とは分けて扱う必要がある。

#### 推奨対応

- 最近追加された npm 依存関係を確認し、通常のレビューや lockfile 変更手順を通らず導入されたパッケージを優先して調べる。
- 信頼できないパッケージを実行した開発端末と CI worker を確認する。露出が確認された場合は、リポジトリ、クラウド、CI、パッケージレジストリの資格情報をローテーションする。
- 対応優先度はパッケージの由来と実際の挙動で判断する。LLM 利用の有無は修復手順を変えない。

#### Sources

- [CrowdStrike — PhantomRaven: An LLM-Generated Information Stealer Developed for Bug Bounty Hunting](https://www.crowdstrike.com/en-us/blog/phantomraven-llm-generated-information-stealer-for-bug-bounty-hunting/)

## その他の注目項目

### T-Mobile ポイント失効 SMS が短命なフィッシングドメインをローテーション

**Severity:** Medium  
**Status:** Confirmed phishing campaign  
**Affected:** T-Mobile 利用者および T-Mobile を装う SMS の受信者

Malwarebytes は 5 月初旬からこのキャンペーンを追跡している。データには 1,000 種類を超える類似メッセージテンプレートがあり、4 か月で少なくとも 81 個のドメインが使われた。SMS は架空のポイント残高と迫った失効日を提示し、`t-mobile.<domain>.top` 形式のローテーションするサイトへ誘導する。目的は資格情報、個人情報、支払い情報、認証コードの取得である。

#### 推奨対応

既知のキャンペーンドメインをブロックし、適切な環境では `t-mobile.*.top` の命名パターンも検知する。利用者は未承諾 SMS のリンクを開かず、T-Mobile の公式アプリまたはサイトを独立して開いて通知を確認する。

#### IOC

- `t-mobile.biktpw.top`
- `t-mobile.cugbjl.top`
- `t-mobile.cymfjd.top`

#### Sources

- [Malwarebytes — T-Mobile rewards points expiry texts are a phishing scam](https://www.malwarebytes.com/blog/threat-intel/2026/09/t-mobile-rewards-points-expiry-texts-are-a-phishing-scam)

### 「よりそうeねっと」アプリにハードコードされた暗号鍵

**Severity:** Low  
**Status:** Fixed; no confirmed exploitation  
**CVSS:** 2.4  
**CVE:** CVE-2026-75553  
**Affected:** 東北電力「よりそうeねっと」Android / iOS 版 2.8.0 未満

JVN によると、物理アクセスが可能な攻撃者は影響を受けるアプリからハードコードされた暗号鍵を取得できる。2.8.0 以降で修正済み。JVN は実際の攻撃での悪用を報告していない。

#### 推奨対応

Android / iOS アプリを 2.8.0 以降へ更新する。攻撃には物理アクセスが必要で、影響も機密性に限定されるため、本日のネットワーク経由で悪用可能な項目より優先度は低い。

#### Sources

- [JVN — JVN#93985674](https://jvn.jp/jp/JVN93985674/index.html)

## 本日の所見

- 本日の脆弱性では Cisco ISE だけが、未認証のネットワーク到達性と実際の攻撃での悪用を同時に満たす。新規公開されたローカル／モバイル問題より先に修正する根拠になる。
- SparroWocky と PhantomRaven では検知対象が異なる。前者は公開済みインフラを持つエンドポイント向け諜報バックドアで、後者は開発依存関係から入り、ビルド環境の資格情報を露出させる可能性がある。
- T-Mobile キャンペーンはドメインを継続的に変更するため、個別ドメインのブロックだけでは有効期間が短い。SMS の内容、ドメイン命名パターン、公式アプリからの確認を組み合わせる方が変種を広く扱える。
