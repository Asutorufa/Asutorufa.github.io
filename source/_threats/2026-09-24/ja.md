---
id: "2026-09-24"
title: "Threat Intelligence Daily · 2026-09-24"
date: "2026-09-24"
updated: "2026-10-03 03:20:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "9月24日は6件を採用した。CISAは悪用が確認されたWSO2とAdobe Commerceの脆弱性をKEVへ追加し、WordPressとRoundcubeでも早期対応が必要な悪用情報が出た。MicrosoftはStorm-2570のランサムウェア関連活動を公開し、SolarWindsはObservability Self-Hostedの認証不要RCE 2件を修正した。"
total: 6
critical: 4
high: 2
medium: 0
low: 0
exploited: 5
tags:
  - active-exploitation
  - cisa-kev
  - ransomware
  - auth-bypass
  - rce
  - webmail
  - commerce
  - wordpress
  - WSO2
  - Adobe-Commerce
  - Roundcube
  - Storm-2570
  - SolarWinds
  - CVE-2026-5430
  - CVE-2026-71362
  - CVE-2026-87902
  - CVE-2026-48842
cves:
  - CVE-2026-28324
  - CVE-2026-28325
  - CVE-2026-48842
  - CVE-2026-5430
  - CVE-2026-71362
  - CVE-2026-87902
iocs: []
---

## 昨日からの変化

- **NEW — WSO2:** CISAはCVE-2026-5430を、悪用の証拠に基づいてKEVへ追加した。JWT検証の不備により、未認証アクセスや管理者アカウントの乗っ取りにつながる。
- **NEW — Adobe Commerce:** Adobe Commerce / Magento Open SourceのCVE-2026-71362が、悪用報告を受けてCISA KEVへ追加された。
- **NEW — WordPress:** 7.1.2で修正されたCVE-2026-87902について悪用報告が出た。特定のサーバー・テーマ条件がそろうと、ローカルPHPファイルのincludeからRCEへ進める。
- **NEW — Roundcube:** `virtuser_query`の認証前SQLインジェクションCVE-2026-48842が、インターネット公開Webmailを対象に悪用されている。
- **NEW — Storm-2570:** MicrosoftはQilin、DragonForce、Anubis、BERTをまたいで使われるランサムウェアaffiliateの共通TTPを公開した。
- **NEW — SolarWinds:** Platform 2026.2.3でCVE-2026-28324とCVE-2026-28325が修正された。前者はCVSS 9.8の認証不要RCE。

## 優先対応

- **直ちに:** CVE-2026-5430の影響を受けるWSO2製品を修正し、公開システムに不正な管理者アクセスがないか確認する。
- **直ちに:** Adobe Commerce/MagentoとWordPressを修正版へ更新し、公開資産はパッチ適用だけで終えず侵害痕跡も確認する。
- **直ちに:** Roundcubeを1.6.16、1.7.1以降へ更新する。すぐ更新できない場合は`virtuser_query`を無効化する。
- **本日:** 条件に該当するSolarWinds Observability Self-Hosted/Platformを2026.2.3へ更新する。
- **監視:** Storm-2570について、最終的なランサムウェア名だけでなくRMM、資格情報アクセス、横展開、持ち出しの挙動を追う。

## 重点脅威

### WSO2 CVE-2026-5430がCISA KEV入り

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 10.0  
**CVE:** CVE-2026-5430  
**Affected:** WSO2 API Managerおよび関連APIプラットフォーム製品

JWT認証で、サポートされていない署名アルゴリズムのtokenが誤って有効と判定される。未認証アクセスから管理者アカウントの乗っ取りまで到達できる。CISAは9月24日にKEVへ追加した。

WSO2の修正版を適用し、新規管理者、異常なJWT認証、高権限設定の変更を確認する。

#### Sources

- [WSO2 — WSO2-2026-5328](https://security.docs.wso2.com/en/latest/security-announcements/security-advisories/2026/WSO2-2026-5328/)
- [CISA — CVE-2026-5430 KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-5430)

### Adobe Commerce CVE-2026-71362の悪用が確認された

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 9.1  
**CVE:** CVE-2026-71362  
**Affected:** 影響を受けるAdobe Commerce、Adobe Commerce B2B、Magento Open Source

不適切な認可処理の脆弱性。Adobeの初期情報では悪用は報告されていなかったが、Canadian Cyber Centreは後に実環境での悪用と、9月24日のCISA KEV追加を記録した。

APSB26-92の修正を適用し、公開Commerce環境の管理者、連携資格情報、設定やコンテンツの不審な変更を確認する。

#### Sources

- [Adobe — APSB26-92](https://www.adobe.com/trust/security/products/commerce/apsb26-92.html)
- [Canadian Centre for Cyber Security — AV26-808 Update 2](https://www.cyber.gc.ca/en/alerts-advisories/adobe-security-advisory-av26-808)

### WordPress CVE-2026-87902に悪用報告

**Severity:** Critical  
**Status:** Confirmed in-the-wild exploitation reporting  
**CVE:** CVE-2026-87902  
**Affected:** WordPress 7.1.2未満。利用には特定のサーバー・active theme条件が必要

未認証の攻撃者がpage template解決を操作し、active theme外の読み取り可能なローカルPHPファイルをincludeさせられる。必要条件がそろうとRCEにつながる。

すぐに更新し、Web/Applicationログの異常なtemplate resolutionや新規PHPファイルを確認する。修正前に公開されていた該当環境は侵害調査の対象にする。

#### Sources

- [WordPress — 7.1.2 Release](https://wordpress.org/news/2026/09/wordpress-7-1-2-release/)
- [Canadian Centre for Cyber Security — AV26-952](https://www.cyber.gc.ca/en/alerts-advisories/wordpress-security-advisory-av26-952)

### Roundcube CVE-2026-48842が実環境で悪用

**Severity:** High  
**Status:** Confirmed in-the-wild exploitation reporting  
**CVSS:** 8.1  
**CVE:** CVE-2026-48842  
**Affected:** 対象`virtuser_query`を利用するRoundcube 1.6.16未満、1.7.1未満

認証前SQLインジェクションにより、リモート攻撃者がDBクエリを改変しRoundcubeのデータへアクセスできる。9月24日にactive exploitationが報告された。

公開Roundcubeを更新し、認証・DBログの異常なクエリを確認する。すぐ更新できない場合は対象pluginの削除または無効化を行う。

#### Sources

- [BleepingComputer — Roundcube CVE-2026-48842 active exploitation](https://www.bleepingcomputer.com/news/security/critical-roundcube-flaw-now-actively-exploited-in-code-injection-attacks/)

## Malware / APT / Campaign

### Storm-2570はランサムウェアを変えても共通の侵入手法を使う

**Severity:** High  
**Status:** Confirmed ransomware-affiliate activity  
**Threat actor:** Storm-2570  
**Malware / RaaS:** Qilin、DragonForce、Anubis、BERT

Microsoftは2025年4月からStorm-2570を追跡している。最終payloadは変わる一方、RMM、資格情報アクセス、横展開、セキュリティ機能の妨害、クラウド経由の持ち出しは複数インシデントで繰り返されている。

検知は最終payloadの家族名だけでなく、これらの共通挙動を中心に組み立てる。

#### Sources

- [Microsoft Threat Intelligence — Storm-2570](https://www.microsoft.com/en-us/security/blog/2026/09/24/beyond-the-ransomware-tracking-storm-2570-consistent-tradecraft-across-deployments/)

## 重要な脆弱性

### SolarWinds Platform 2026.2.3が認証不要RCE 2件を修正

**Severity:** Critical  
**Status:** Vendor release notesでは悪用確認なし  
**CVE:** CVE-2026-28324, CVE-2026-28325  
**Affected:** 条件に該当するSolarWinds Observability Self-Hosted / SolarWinds Platform

CVE-2026-28324は整合性チェック不足による認証不要RCEで、非デフォルトかつ安全でない構成が前提となりCVSS 9.8。CVE-2026-28325は特定通信モードでの信頼できないデータのdeserializationによる認証不要RCE。

Platform 2026.2.3へ更新し、各脆弱性の構成前提に該当するか確認する。

#### Sources

- [SolarWinds Platform 2026.2.3 release notes](https://documentation.solarwinds.com/en/success_center/orionplatform/content/release_notes/solarwinds_platform_2026-2-3_release_notes.htm)

## 本日の所見

- 高リスク事象の多くが認証境界またはインターネット公開アプリケーションにある。修正優先度はCVSSだけでなく、公開状態と悪用確認を合わせて判断する。
- Storm-2570のようにaffiliateがpayloadを切り替える場合、ランサムウェア家族名だけに依存する検知では前段階を見落としやすい。
