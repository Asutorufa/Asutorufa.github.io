---
id: "2026-09-30"
title: "Threat Intelligence Daily · 2026-09-30"
date: "2026-09-30"
updated: "2026-10-03 03:45:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "9月30日は、悪用確認済みの境界・サーバー脆弱性が2件追加され、NetScalerのpost-exploitation情報も更新された。MicrosoftはZimbra CVE-2026-73570、CiscoはCatalyst SD-WAN Manager CVE-2026-76504の悪用を確認。Unit 42はNetScalerのインフラとpersistenceを追加し、JVNはFUJIFILM/Sharp複合機のpath traversalを公開した。"
total: 4
critical: 3
high: 0
medium: 1
low: 0
exploited: 3
tags:
  - active-exploitation
  - zero-day
  - mail-server
  - edge-device
  - sdwan
  - NetScaler
  - Zimbra
  - Cisco
  - FUJIFILM
  - Sharp
  - CVE-2026-73570
  - CVE-2026-76504
  - CVE-2026-78249
  - CVE-2026-88771
  - CVE-2026-88772
cves:
  - CVE-2026-73570
  - CVE-2026-76504
  - CVE-2026-78249
  - CVE-2026-88771
  - CVE-2026-88772
iocs:
  - 66.135.19.18
  - 167.99.111.203
  - 142.93.85.227
  - 104.248.74.206
  - 137.184.91.207
  - 162.33.178.9
  - 193.149.176.207
---

## 昨日からの変化

- **NEW — Zimbra:** MicrosoftがCVE-2026-73570の悪用を公開。JSP web shell、reverse shell、権限昇格、persistenceまで確認した。
- **NEW — Cisco SD-WAN:** Cisco PSIRTがCVE-2026-76504のactive exploitationを確認した。
- **UPDATED — NetScaler:** Unit 42がCVE-2026-88771/CVE-2026-88772の公開前後の活動とローテーションするインフラを追加した。
- **NEW — FUJIFILM/Sharp MFP:** JVNがWeb管理画面のpath traversal CVE-2026-78249を公開した。

## 優先対応

- **直ちに:** 公開Zimbraを修正し、JSP web shell、reverse shell、権限昇格、persistenceを調査する。
- **直ちに:** Cisco Catalyst SD-WAN Managerはupgrade前にadmin-techを取得し、修正版へ更新後、`vmanage-server.log`を確認する。
- **直ちに:** 修正前に公開されていたNetScalerで侵害調査を続け、新しいinfrastructureをretrospective huntへ追加する。
- **本日:** 対象FUJIFILM/Sharp複合機のfirmwareを更新し、管理画面を信頼できないnetworkから隔離する。

## 重点脅威

### Zimbra CVE-2026-73570が公開mail serverで悪用

**Severity:** Critical  
**Status:** Confirmed active exploitation  
**CVE:** CVE-2026-73570  
**Affected:** 影響を受けるSNMP/notification経路を持つZimbra Collaboration

Microsoftは未認証command injectionからJSP web shell、reverse shell、権限昇格、persistenceへ進む攻撃を確認した。活動期間に公開されていた環境は、patch後も侵害確認が必要になる。

Zimbraの修正を適用し、web root、process tree、scheduled task/service、外向き通信を確認する。cleanup前にforensic dataを保存する。

#### Sources

- [Microsoft Security — CVE-2026-73570 exploitation](https://www.microsoft.com/en-us/security/blog/2026/09/30/unauthenticated-command-injection-on-internet-facing-mail-servers-tracking-cve-2026-73570/)

### Cisco Catalyst SD-WAN Manager CVE-2026-76504が悪用

**Severity:** Critical  
**Status:** Confirmed active exploitation / zero-day disclosure  
**CVSS:** 9.8  
**CVE:** CVE-2026-76504  
**Affected:** Cisco advisory記載のCatalyst SD-WAN Manager

URI encodingの処理不備でAPI認証ruleをbypassし、未認証remote attackerがadmin-user権限でAPIへアクセスできる。Cisco PSIRTは9月のactive exploitationを確認している。

upgrade前にadmin-techを収集し、修正版へ更新する。Cisco TACへbundleを渡してIOC scanを依頼できるほか、`vmanage-server.log`の異常な`j_security_check`を確認する。

#### Sources

- [Cisco — Catalyst SD-WAN Manager API Authentication Bypass](https://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-sdwan-webauth-xr8beuuU.html)
- [Cisco — September 2026 remediation workflow](https://www.cisco.com/c/en/us/support/docs/routers/sd-wan/226384-remediate-catalyst-sd-wan-security.html)

### NetScaler調査に新しいインフラとpersistence情報

**Severity:** Critical  
**Status:** Confirmed active exploitation / ongoing follow-up  
**CVE:** CVE-2026-88771, CVE-2026-88772  
**Affected:** exploit window中に公開されていたNetScaler ADC / Gateway

Unit 42は公開前後の攻撃、ローテーションするインフラ、persistenceを追加した。9月27–28日のeventへのmaterial updateであり、新しい脆弱性ではない。

新しいIPはretrospective huntに使えるが、time contextとasset contextを合わせる。hosting IPは再割当があるため永久blocklistには向かない。

#### IOC

- `66.135.19[.]18`
- `167.99.111[.]203`
- `142.93.85[.]227`
- `104.248.74[.]206`
- `137.184.91[.]207`
- `162.33.178[.]9`
- `193.149.176[.]207`

#### Sources

- [Unit 42 — NetScaler zero-days exploited](https://unit42.paloaltonetworks.com/netscaler-zero-days-exploited/)

## 重要な脆弱性

### FUJIFILM/Sharp複合機 CVE-2026-78249

**Severity:** Medium  
**Status:** JVNで悪用確認なし  
**CVE:** CVE-2026-78249  
**Affected:** JVN記載の機種・firmware

Web管理インターフェースにpath traversalがある。修正版firmwareを適用し、管理面を信頼できないnetworkへ公開しない。

#### Sources

- [JVN — JVNVU#90160989](https://jvn.jp/en/vu/JVNVU90160989/)

## IOCサマリー

| 種別 | Indicator | Context |
| --- | --- | --- |
| IPv4 | `66.135.19[.]18` | NetScaler exploitation infrastructure |
| IPv4 | `167.99.111[.]203` | NetScaler exploitation infrastructure |
| IPv4 | `142.93.85[.]227` | NetScaler exploitation infrastructure |
| IPv4 | `104.248.74[.]206` | NetScaler exploitation infrastructure |
| IPv4 | `137.184.91[.]207` | NetScaler exploitation infrastructure |
| IPv4 | `162.33.178[.]9` | NetScaler exploitation infrastructure |
| IPv4 | `193.149.176[.]207` | NetScaler exploitation infrastructure |

## 本日の所見

- ZimbraとCiscoはexploit確認済みのため、patch後も侵害調査が必要になる。
- NetScalerはCVEが同じでも、攻撃infrastructureとpost-exploitation情報が更新された。こうした変化はdaily reportでUPDATEとして残す価値がある。
