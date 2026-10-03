---
id: "2026-09-28"
title: "Threat Intelligence Daily · 2026-09-28"
date: "2026-09-28"
updated: "2026-10-03 03:30:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "9月28日は新しいCVE数より追加コンテキストが重要だった。Unit 42はNetScalerゼロデイで5万件を超える潜在的な公開対象を確認し、web shellとpersistence活動を報告した。MicrosoftはNeedyMantisを公開し、Kiteworksは復旧過程で未知のCritical脆弱性を修正、JVNはBUFFALO Wi-Fi製品の脆弱性を公開した。"
total: 4
critical: 1
high: 3
medium: 0
low: 0
exploited: 2
tags:
  - active-exploitation
  - zero-day
  - NetScaler
  - NeedyMantis
  - Storm-3069
  - Kiteworks
  - BUFFALO
  - wifi
  - CVE-2026-88771
  - CVE-2026-88772
  - CVE-2026-86530
  - CVE-2026-95104
cves:
  - CVE-2026-86530
  - CVE-2026-88771
  - CVE-2026-88772
  - CVE-2026-95104
iocs: []
---

## 昨日からの変化

- **UPDATED — NetScaler:** Unit 42は9月27日時点で50,277の公開instanceが潜在的に影響を受けると報告し、web shellとpersistenceを確認した。
- **NEW — NeedyMantis:** Microsoftがtelecom、大学、医療非営利、国際機関、政府契約企業などで使われたpost-compromise malwareを公開した。
- **UPDATED — Kiteworks:** 脅威期間は問題なく終了し、停止対応中に未知のCritical脆弱性を特定・修正した。
- **NEW — BUFFALO:** JVNがWSR-300HP / WEX-G300のCVE-2026-86530とCVE-2026-95104を公開した。

## 優先対応

- **直ちに:** NetScalerを修正し、修正前に公開されていた機器でweb shellとpersistenceを調査する。
- **本日:** Microsoftのpath情報を使ってNeedyMantisのDLL sideloadingをhuntする。
- **本日:** Kiteworksをベンダーのremediated releaseに合わせる。
- **本日:** 影響を受けるBUFFALO Wi-Fi製品を更新し、管理面へのアクセスを制限する。

## 重点脅威

### NetScaler exploitでweb shellとpersistenceを確認

**Severity:** Critical  
**Status:** Confirmed active exploitation / zero-day follow-up  
**CVE:** CVE-2026-88771, CVE-2026-88772  
**Affected:** NetScaler ADC / Gateway

Unit 42は9月27日時点で50,277の公開instanceが潜在的に脆弱と報告した。観測された活動では、初期アクセス後にweb shellを配置してpersistenceを確保している。

公開期間があった機器はpatchだけで終了せず、web directory、異常な認証request、外向き通信を確認する。

#### Sources

- [Unit 42 — NetScaler zero-days exploited](https://unit42.paloaltonetworks.com/netscaler-zero-days-exploited/)
- [Citrix — CTX697096](https://support.citrix.com/external/article/CTX697096)

### NeedyMantisは侵害後の長期アクセスに使われる

**Severity:** High  
**Status:** Confirmed targeted malware activity  
**Threat actor:** Storm-3069を少なくとも1 operatorとして観測  
**Malware:** NeedyMantis

Microsoftは限定的な標的型侵入でNeedyMantisを確認した。初期アクセス後に配置され、DLL sideloading、暗号化archive、追加moduleを使って長期アクセスを支える。

公開されたloader/archive pathをhuntし、既存の侵害痕跡と関連付ける。DAEMON Tools調査から発見されたが、NeedyMantis自体がすべて同じsupply-chain経路で配布されたとは確認されていない。

#### Sources

- [Microsoft Threat Intelligence — NeedyMantis](https://www.microsoft.com/en-us/security/blog/2026/09/28/needymantis-unpacking-a-post-compromise-malware-family-used-in-targeted-operations/)

## その他の注目事項

### Kiteworksが復旧し未知のCritical脆弱性を修正

**Severity:** High  
**Status:** Preventive response completed; 悪用証拠なし  
**Affected:** 停止勧告対象Kiteworks環境

Kiteworksは脅威期間が問題なく終了したと発表し、停止対応中に利用顧客が1%未満の機能に存在した未知のCritical脆弱性を特定・修正した。

#### Sources

- [Kiteworks — Systems restored after credible threat](https://www.kiteworks.com/company/press-releases/kiteworks-restores-systems-credible-threat/)

### BUFFALO WSR-300HP / WEX-G300の複数脆弱性

**Severity:** High  
**Status:** JVNで悪用確認なし  
**CVE:** CVE-2026-86530, CVE-2026-95104  
**Affected:** JVN記載のWSR-300HP / WEX-G300

コマンドインジェクションやメモリ安全性の問題が公開された。修正版firmwareへ更新し、管理面の露出を抑える。

#### Sources

- [JVN — JVNVU#94863997](https://jvn.jp/en/vu/JVNVU94863997/)

## 本日の所見

- NetScalerは公開翌日に露出規模とpost-exploitation情報が増えた。edge deviceではpatch公開後もforensic情報が更新されやすい。
- NeedyMantisはpost-compromise frameworkであり、initial accessだけを監視しても今回の活動は捉えにくい。
