---
id: "2026-09-20"
title: "脅威インテリジェンス日報 · 2026-09-20"
date: "2026-09-20"
updated: "2026-09-20 23:00:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "ConoHa WING は一部顧客の Web サーバー領域への第三者による不正アクセスを公表し、426アカウントへの影響を確認した。Checkmarx は実行点を install script から通常の library runtime に移した npm malware campaign を報告。Linux kernel では修正済みの4件の local root 脆弱性について動作する exploit が公開された。"
total: 3
critical: 0
high: 3
medium: 0
low: 0
exploited: 2
tags:
  - incident-response
  - web-hosting
  - ConoHa-WING
  - supply-chain
  - npm
  - malware
  - Linux
  - privilege-escalation
  - public-exploit
  - CVE-2026-68121
  - CVE-2026-74469
  - CVE-2026-80844
  - CVE-2026-81000
cves:
  - CVE-2026-68121
  - CVE-2026-74469
  - CVE-2026-80844
  - CVE-2026-81000
iocs: []
---

## 昨日からの変化

- **NEW — ConoHa WING:** GMO Internet は一部 hosting node の顧客 Web サーバー領域への不正アクセスを公表した。影響は426アカウントで、悪性プログラムは9月18日までに除去された。
- **NEW — npm:** Checkmarx は `indexed-btree` を中心とする悪性 package 群を報告した。loader は install hook ではなく通常の library runtime で起動し、制御経路に Slack、Telegram、Ethereum Sepolia smart contract を使う。
- **NEW — Linux:** DirtyAH6、TUNderflow、PPPoEject、DiagSpill の動作する local-root exploit が公開された。この4件は昨日日報で CISA KEV 入りを扱った3件の Linux kernel 脆弱性とは別であり、4件について実悪用は確認されていない。

## 優先対応

- **即時:** GMO から個別通知を受けた ConoHa WING 利用者は公式案内に従い、対象 hosting account の Web content と credential を確認する。cleanup で証跡が失われる前に関連 log を保存する。
- **即時:** lockfile、SBOM、package cache、artifact repository から `indexed-btree` と Checkmarx が列挙した関連 package を検索する。悪性 package が実行された場合は host compromise として扱い、その process が参照できた credential を rotate する。
- **本日:** CVE-2026-80844、CVE-2026-81000、CVE-2026-68121、CVE-2026-74469 の修正を含む distribution kernel を適用する。再起動後は installed package だけでなく running kernel を確認する。
- **監視:** vendor、CERT、または信頼できる telemetry が実攻撃を確認するまでは、4件の Linux public PoC を「実悪用」と扱わない。

## 重点脅威

### ConoHa WING の不正アクセス、426アカウントに影響

**Severity:** High  
**Status:** 侵入確認済み；悪性プログラム除去済み  
**Affected:** ConoHa WING の一部 hosting node にある顧客 Web サーバー領域

GMO Internet は9月20日、一部顧客の Web サーバー領域へ第三者が不正アクセスし、悪性プログラムを設置したと公表した。確認された対象は426アカウント。公式 timeline では、不正アクセスと悪性プログラム設置は9月3日に始まり、9月16日に検知・調査開始、9月18日に原因と影響範囲の特定および悪性プログラム除去を完了している。

GMO は、会員情報、契約情報、支払情報は別環境で管理されており、本件による漏えいはないとしている。対象外の顧客には個別連絡を行わない。初期侵入経路、malware family、攻撃者 attribution は現時点で公表されていない。

#### 推奨対応

- 対象顧客は GMO の個別案内に従い、hosting file、application credential、deployment key、対象 account で利用した管理 access を確認する。
- credential rotation や rebuild の前に、少なくとも9月3日から9月18日を含む Web、authentication、deployment log を保存する。
- GMO は本件に便乗した phishing を明示的に警告しているため、通知は ConoHa 公式サイトで確認する。

#### Sources

- [ConoHa WING — 2026-09-20 不正アクセスのお知らせ](https://www.conoha.jp/wing/news/?ap=2015054834&btn_id=wing-news--news_wing-news)

### npm malware が通常 runtime に実行点を移す

**Severity:** High  
**Status:** 悪性 supply-chain campaign 確認済み；関連 package は registry から削除  
**Affected:** `indexed-btree` または Checkmarx が特定した関連 package を install / execute した project

Checkmarx は `sorted-btree` を模倣した `indexed-btree` を中心とする npm campaign を報告した。この package は `preinstall` や `postinstall` に依存せず、loader を `BTree.prototype.set()` に置く。trigger condition を満たすと、application の通常実行中に `sharedLoad.min.js` が起動する。

first stage は host 情報を収集し、hardcoded Slack / Telegram channel を通じて data を外部送信できる。さらに Ethereum Sepolia testnet の smart contract を参照して暗号化された second-stage material を取得する。Checkmarx は同一 operation に追加9 package を関連付け、npm から削除されたと報告している。

#### 推奨対応

- dependency manifest、lockfile、package-manager cache、build artifact、過去の SBOM から `indexed-btree`、`ordered-kv-index`、`btree-leaderboard`、`priority-slot-queue`、`btree-range-store`、`btree-core`、`btree-time-index`、`btree-lru-cache`、`neighbor-key-map`、`sliding-score-window` を検索する。
- 該当 package が実行された場合、developer / CI host の credential access と異常な outbound connection を確認し、その process から参照可能だった npm、Git、cloud、CI、messaging credential を rotate する。
- registry tarball と source repository を比較する。この campaign では公開 repository に悪性 code がないため、repository の確認だけでは published artifact の同一性を保証できない。

#### Sources

- [Checkmarx Zero — npm ‘btree’ Malware Campaign Affects Millions of Downloads](https://checkmarx.com/zero-post/npm-btree-malware-campaign-affects-millions-of-downloads-no-need-for-install-script/)

### Linux kernel の4件の local-root 脆弱性で public exploit が公開

**Severity:** High  
**Status:** 修正済み；public exploit；実悪用未確認  
**CVE:** CVE-2026-80844、CVE-2026-81000、CVE-2026-68121、CVE-2026-74469  
**Affected:** 該当 networking code を含む Linux kernel；到達条件は脆弱性と構成ごとに異なる

研究者 Asim Viladi Oglu Manizada は coordinated embargo 終了後、技術詳細と動作する exploit を公開した。DirtyAH6 は IPv6 IPsec Authentication Header、TUNderflow は TUN/TAP、PPPoEject は PPPoE、DiagSpill は SCTP diagnostics に存在する。

DirtyAH6、TUNderflow、PPPoEject の実証された local escalation path は unprivileged user namespace または特定 capability を必要とする。DiagSpill は SCTP path が利用可能なら、それらの追加権限を必要としない。4件すべての修正を含む最初の upstream stable release は 5.10.270、5.15.221、6.1.188、6.6.157、6.12.109、6.18.50、7.2.4。distribution kernel は upstream version だけでなく vendor package と advisory で判断する必要がある。

#### 推奨対応

- 4件の修正を含む distribution / cloud vendor の kernel package を適用し、更新後の kernel へ再起動する。
- 直ちに patch できない場合、信頼できない local workload の access を減らし、unprivileged user namespace、TUN/TAP、PPPoE、SCTP が必要か確認する。
- public exploit の存在は exploit code の公開を示すもので、実攻撃の証拠ではない。

#### Sources

- [oss-security — A quartet of Linux local root vulns](https://seclists.org/oss-sec/2026/q3/822)
- [Asim Manizada — technical write-up](https://heyitsas.im/posts/lpe-quartet/)

## 日次観測

- 確認済みの悪性活動を含むのは ConoHa WING 侵入と npm malware campaign の2件。Linux quartet は動作する public exploit があるが、確認した source では実悪用は報告されていない。
- install-time control だけでは、install 時に動かず application 起動後に実行される dependency の悪性経路を検出できない。信頼できない package を許可する環境では published artifact と source の差分確認、runtime behavior の観測が必要になる。
- 今回は front matter に IOC を入れていない。確認した一次情報には、影響環境をまたいで再利用できる十分に検証された malicious IP/domain/hash set がない。
