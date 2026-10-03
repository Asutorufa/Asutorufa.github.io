---
id: "2026-10-01"
title: "Threat Intelligence Daily · 2026-10-01"
date: "2026-10-01"
updated: "2026-10-03 03:45:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10月1日は、悪用中のFortiMailゼロデイ、2件の標的型campaign、firmware security noteが中心となった。FortinetはCVE-2026-104286とIOC、ProofpointはTA419のAI政策専門家向けcredential phishing、SymantecはLonglegs/Warlockの重要インフラ攻撃、CERT/CCはInsydeH2O IHISI SMM memory writeを公開した。"
total: 4
critical: 1
high: 2
medium: 1
low: 0
exploited: 3
tags:
  - active-exploitation
  - zero-day
  - phishing
  - apt
  - ransomware
  - sharepoint
  - firmware
  - FortiMail
  - TA419
  - Warlock
  - Longlegs
  - CVE-2025-1055
  - CVE-2026-104286
  - CVE-2026-12855
cves:
  - CVE-2025-1055
  - CVE-2026-104286
  - CVE-2026-12855
iocs:
  - 79.141.169.187
  - 45.129.0.192
  - sha256:8015f34dc84922b03688399d7f9fe7a00361789f7e420c7e2a2cdb23e75cef84
  - sha256:8953ec7960b09f544a880b072ad4e6cfda7a8303f486251d3478dcfdfbac23b6
---

## 昨日からの変化

- **NEW — FortiMail:** FortinetがCVE-2026-104286、CVSS 9.8を公開し、management interfaceへのzero-day exploitationを確認した。
- **NEW — TA419:** AI policy makerやeconomistを装ったcredential phishingが、米国AI政策専門家や日本のthink tankを標的にしていた。
- **NEW — Longlegs / Warlock:** SharePointを入口とする最近のransomware intrusionが、水道、telecom、地方政府、大学で確認された。
- **NEW — InsydeH2O:** CERT/CCがOEM-specific IHISI SMM moduleのunsafe memory write CVE-2026-12855を公開した。

## 優先対応

- **直ちに:** FortiMail management accessを制限し、Fortinetのmitigationを適用する。修正版が利用可能になったら更新し、公開IOCをhuntする。
- **本日:** AI policy、export control、national strategyに関わる組織は、著名研究者や政策関係者を装うcredential phishingを確認する。
- **本日:** On-prem SharePointでweb shell、forged application access、Longlegs/Warlockの挙動をhuntする。
- **監視:** CVE-2026-12855はOEM bulletinで対象modelを確認する。CERT/CCでは複数vendorがnot affectedと回答している。

## 重点脅威

### FortiMail CVE-2026-104286がzero-day exploitation

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 9.8  
**CVE:** CVE-2026-104286  
**Affected:** FortiMail 8.0.0–8.0.1、7.6.0–7.6.6、7.4.0–7.4.8、7.2.0–7.2.9

management interfaceのpath traversalとnull-byte handlingにより、未認証攻撃者がcrafted HTTP/S requestで任意fileを書き込める。Fortinetはactive exploitationを確認し、hash、log pattern、attack infrastructureを公開した。

fixが未提供のbranchではmanagement accessを制限し、該当する場合はIBE featureを無効化する。IOCが一致するapplianceは侵害調査を行う。

#### IOC

- `79.141.169[.]187`
- `45.129.0[.]192`
- `SHA256 8015f34dc84922b03688399d7f9fe7a00361789f7e420c7e2a2cdb23e75cef84`
- `SHA256 8953ec7960b09f544a880b072ad4e6cfda7a8303f486251d3478dcfdfbac23b6`

#### Sources

- [Fortinet PSIRT — FG-IR-26-175](https://fortiguard.fortinet.com/psirt/FG-IR-26-175)
- [BleepingComputer — FortiMail zero-day exploitation](https://www.bleepingcomputer.com/news/security/fortinet-warns-of-critical-fortimail-flaw-exploited-in-zero-day-attacks/)

### TA419がAI政策関係者を装いcredentialを狙う

**Severity:** High  
**Status:** Confirmed targeted credential-phishing campaign  
**Threat actor:** TA419  
**Affected:** think tank、大学、legal sectorなどのAI policy専門家

Proofpointは7月に、著名economistやAI policymaker、元米政府関係者を装った複数campaignを確認した。対象は少数の高価値AI-policy関係者。2026年初頭にはAnthropic employeeのなりすましも確認されている。

対象組織はcollaboration invitationを別経路で確認し、phishing後のcredential replayや異常sign-inを調べる。

#### Sources

- [Proofpoint — TA419 and US AI policy](https://www.proofpoint.com/us/blog/threat-insight/hallucinating-credibility-china-aligned-ta419-impersonates-its-way-us-ai-policy)

### LonglegsがSharePointからWarlock ransomwareへ展開

**Severity:** High  
**Status:** Confirmed ransomware / targeted intrusion activity  
**Threat actor:** Longlegs / Storm-2603  
**Malware:** Warlock ransomware  
**CVE:** CVE-2025-1055（BYOVD defense evasion）  
**Affected:** 最近のwater utility、telecom、地方政府、大学の被害

Symantecはポルトガル語・スペイン語圏で少なくとも4件の最近の被害を報告した。LonglegsはSharePointでinitial accessを取り、web shell、SharePoint machine key窃取、living-off-the-land、VS Code tunnel、脆弱なsigned K7RKScan driverを使った後にransomwareを展開する。

On-prem SharePoint、web shell、不審なVS Code tunnel service、K7RKScan driverを優先して確認する。

#### Sources

- [Security.com / Symantec — Warlock attacks critical infrastructure](https://www.security.com/threat-intelligence/warlock-ransomware-critical-infrastructure)

## 重要な脆弱性

### InsydeH2O IHISI CVE-2026-12855はOEM単位でscope確認

**Severity:** Medium  
**Status:** CERT/CCで悪用確認なし  
**CVE:** CVE-2026-12855  
**Affected:** OEM-specific InsydeH2O IHISI SMM module

OS kernel privilegeをすでに持つlocal attackerがphysical memory、SMRAMへ書き込み、SMM code executionへ進める可能性がある。CERT/CCはvulnerable moduleがOEM-specificであると明記している。AMI、ASUS、GIGABYTEはnot affectedと回答した。

実際のdevice modelはOEM security bulletinで確認する。Insyde採用機を一律にaffectedと扱わない。

#### Sources

- [CERT/CC — VU#553437](https://www.kb.cert.org/vuls/id/553437)

## IOCサマリー

| 種別 | Indicator | Context |
| --- | --- | --- |
| IPv4 | `79.141.169[.]187` | FortiMail attack infrastructure |
| IPv4 | `45.129.0[.]192` | FortiMail attack infrastructure |
| SHA256 | `8015f34dc84922b03688399d7f9fe7a00361789f7e420c7e2a2cdb23e75cef84` | FortiMail malicious file |
| SHA256 | `8953ec7960b09f544a880b072ad4e6cfda7a8303f486251d3478dcfdfbac23b6` | FortiMail malicious file |

## 本日の所見

- 脆弱性のactive exploitationはFortiMailで確認され、他のHigh項目はcampaignである。対応手順は同じではない。
- Firmware CVEはhardware scopeが重要で、CVE-2026-12855をすべてのInsyde systemへ広げると影響を過大評価する。
