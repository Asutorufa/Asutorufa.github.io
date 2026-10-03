---
id: "2026-09-25"
title: "Threat Intelligence Daily · 2026-09-25"
date: "2026-09-25"
updated: "2026-10-03 03:20:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "9月25日は5件を採用した。SharePoint CVE-2026-65660とMikroTik CVE-2026-67279が悪用確認済みの優先対象となり、WordPress CVE-2026-87902はCISA KEVへ追加された。MicrosoftはStorm-3168によるAzure破壊活動を公開し、JVNはbaserCMS関連の修正を公開した。"
total: 5
critical: 1
high: 3
medium: 1
low: 0
exploited: 4
tags:
  - active-exploitation
  - cisa-kev
  - cloud
  - identity
  - destructive-attack
  - wordpress
  - sharepoint
  - mikrotik
  - baserCMS
  - Storm-3168
  - CVE-2026-65660
  - CVE-2026-67279
  - CVE-2026-87902
  - CVE-2026-97150
cves:
  - CVE-2026-62956
  - CVE-2026-65660
  - CVE-2026-67279
  - CVE-2026-87902
  - CVE-2026-93460
  - CVE-2026-93462
  - CVE-2026-93463
  - CVE-2026-93464
  - CVE-2026-97150
iocs:
  - 45.131.66.106
  - 34.153.223.102
  - 64.20.53.230
---

## 昨日からの変化

- **NEW — SharePoint:** MicrosoftはCVE-2026-65660への攻撃を示す信頼できる証拠を確認し、CISAはKEVへ追加した。
- **NEW — MikroTik:** CISAがCVE-2026-67279をKEVへ追加した。SSHの状態遷移不備はCVE-2026-86060と組み合わせられる。
- **NEW — Storm-3168:** Microsoftは、侵害されたAzure service principalが35分間に150件を超える破壊・資格情報アクセス操作を行った事例を公開した。
- **UPDATED — WordPress:** CVE-2026-87902が9月25日にCISA KEVへ追加された。
- **NEW — baserCMS:** JVNがbaserCMS core 5件とBcAddonMigrator CVE-2026-97150を公開した。

## 優先対応

- **直ちに:** CVE-2026-65660の影響を受けるSharePointを修正し、公開サーバーの侵害痕跡を確認する。
- **直ちに:** MikroTik RouterOSを修正版へ更新し、異常なSSH session、ファイル、高権限アカウント変更を確認する。
- **直ちに:** 公開WordPressが7.1.2以降か確認し、修正前に条件を満たしていたサイトを調査する。
- **本日:** ソース、issue、ログに露出したAzure workload identity secretをローテーションし、大量削除やListKeysを確認する。
- **本日:** baserCMSとBcAddonMigratorを修正版へ更新する。

## 重点脅威

### SharePoint CVE-2026-65660の悪用を確認

**Severity:** High  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 8.8  
**CVE:** CVE-2026-65660  
**Affected:** 2026年8月のMicrosoftセキュリティ更新対象となるSharePoint Server

低権限の認証済み攻撃者が、ユーザー操作なしでコードを実行できるcode injection。Microsoftは実際の攻撃を示す信頼できる証拠を確認し、CISAは9月25日にKEVへ追加した。

Microsoftの更新を適用し、SharePoint application poolの異常実行、web shell、認証後の不審な操作を確認する。

#### Sources

- [Microsoft MSRC — CVE-2026-65660](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-65660)
- [CISA — CVE-2026-65660 KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-65660)

### MikroTik CVE-2026-67279がRouterOS exploit chainを補完

**Severity:** Medium  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 6.5 (v3), 6.9 (v4)  
**CVE:** CVE-2026-67279  
**Affected:** 6.49.21、7.23.4、7.24.2などの修正版より前のRouterOS

未認証クライアントがSSH sessionを、本来認証完了後にしか到達できない状態へ進め、exec requestを送れる。以前から悪用されているCVE-2026-86060と組み合わせられる。CISAは9月25日にKEVへ追加した。

RouterOSを更新し、管理ログ、未知のファイル、高権限アカウントの変更を確認する。単体CVSSだけでchain全体の優先度を判断しない。

#### Sources

- [Canadian Centre for Cyber Security — MikroTik AV26-887 Update 2](https://www.cyber.gc.ca/en/alerts-advisories/mikrotik-security-advisory-av26-887)
- [CISA — CVE-2026-67279 KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-67279)

### Storm-3168が侵害service principalでAzureリソースを破壊

**Severity:** High  
**Status:** Confirmed destructive cloud intrusion  
**Threat actor:** Storm-3168 / JADEPUFFER  
**Affected:** workload identityが侵害されたAzure環境

Microsoftは同一tenantで2つの侵害service principalを確認した。1つは列挙、もう1つは35分間に150件を超える破壊・資格情報アクセス操作を実行し、100件を超えるstorage account削除を試みた。対象の多くは実際に削除された。

公開されたworkload secretは、元の投稿を消すだけでなく失効またはローテーションする。Azure Activity Logで大量削除、ListKeys、recovery lock変更、異常なservice-principal tokenを確認する。

#### IOC

- `45.131.66[.]106`
- `34.153.223[.]102`
- `64.20.53[.]230`

#### Sources

- [Microsoft Security Research — Storm-3168](https://www.microsoft.com/en-us/security/blog/2026/09/25/storm-3168-agentic-driven-cloud-attacks-using-compromised-service-principals/)

### WordPress CVE-2026-87902がCISA KEV入り

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVE:** CVE-2026-87902  
**Affected:** 公開条件に該当するWordPress 7.1.2未満

昨日の報告からの実質更新として、CISAが9月25日にKEVへ追加した。7.1.2以降へ更新し、修正前にサーバー・テーマ条件を満たしていた公開サイトは侵害確認を行う。

#### Sources

- [Canadian Centre for Cyber Security — AV26-952 Update 1](https://www.cyber.gc.ca/en/alerts-advisories/wordpress-security-advisory-av26-952)
- [CISA — CVE-2026-87902 KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-87902)

## 重要な脆弱性

### baserCMSとBcAddonMigratorの複数修正

**Severity:** High  
**Status:** JVNで悪用確認なし  
**CVE:** CVE-2026-62956, CVE-2026-93460, CVE-2026-93462, CVE-2026-93463, CVE-2026-93464, CVE-2026-97150  
**Affected:** JVNに記載されたbaserCMS / BcAddonMigrator

JVNはbaserCMSのSQL injectionやXSSを含む複数問題と、BcAddonMigratorのCVE-2026-97150を公開した。plugin側は高権限管理者を前提とし、CVSS v4は8.6。

baserCMSを各修正版へ、BcAddonMigratorを5.2.1以降へ更新する。

#### Sources

- [JVN#14353754 — baserCMS](https://jvn.jp/jp/JVN14353754/)
- [JVN#21754394 — BcAddonMigrator](https://jvn.jp/jp/JVN21754394/)

## IOCサマリー

| 種別 | Indicator | Context |
| --- | --- | --- |
| IPv4 | `45.131.66[.]106` | Storm-3168 probing / malicious ARM requests |
| IPv4 | `34.153.223[.]102` | Storm-3168 App Service probing |
| IPv4 | `64.20.53[.]230` | Storm-3168 App Service probing |

## 本日の所見

- MikroTikの更新はchain contextの重要性を示す。単体ではMediumでも、既知のtakeover chainを成立させる要素なら対応優先度は上がる。
- Workload identityもユーザーアカウントと同じくincident response対象にする必要がある。公開secretをページから削除してもcredentialは失効しない。
