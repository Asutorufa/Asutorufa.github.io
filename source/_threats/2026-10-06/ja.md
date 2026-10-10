---
id: "2026-10-06"
title: "Threat Intelligence Daily · 2026-10-06"
date: "2026-10-06"
updated: "2026-10-10"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10月6日は4件を採用した。Chrome 155は247件のsecurity fixを含み、4件のCritical UAFを修正。VeeamはCVSS 9.4のBackup & Replication RCE、SonicWallはCVSS 10 SSRFを含むSMA1000の4件を修正した。Googleはさらに、.gh/.sl/.as registry侵害によるDNS変更と未承認HTTPS certificate発行を説明した。"
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 0
tags:
  - browser
  - backup
  - edge-device
  - vpn
  - dns
  - certificate
  - infrastructure
  - Chrome
  - Veeam
  - SonicWall
  - CVE-2026-106382
  - CVE-2025-64393
  - CVE-2026-102255
cves:
  - CVE-2025-64392
  - CVE-2025-64393
  - CVE-2026-102255
  - CVE-2026-102256
  - CVE-2026-102257
  - CVE-2026-102258
  - CVE-2026-106197
  - CVE-2026-106347
  - CVE-2026-106358
  - CVE-2026-106382
  - CVE-2026-93026
iocs: []
---

## 昨日からの変化

- **NEW — Chrome 155:** 247件のsecurity fixが入り、Chromecast、Browser、Navigation、Trackに4件のCritical use-after-freeが含まれる。
- **NEW — Veeam:** Backup & Replication 12.3.2 P4でCVE-2025-64393を修正。低権限のBackup ViewerからMount Serviceのinsecure deserializationを経由してRCEへ到達できる。
- **NEW — SonicWall SMA1000:** 4件を修正し、CVE-2026-102255はCVSS 10.0。SonicWallはin-the-wild exploitationの証拠はないとしている。
- **NEW — ccTLD registry hijacks:** Googleはthird-partyの.gh、.sl、.as registry侵害によりauthoritative DNSが変更され、Googleを含む複数組織のdomainでunauthorized HTTPS certificateが取得されたと説明した。

## 優先対応

- **直ちに:** managed Chromeを155.0.8059.39/.40以降へ更新し、endpointがfixed buildで再起動済みか確認する。
- **直ちに:** Veeam Backup & Replication 12.xを12.3.2.4934へ上げるかsupported v13へ移行する。
- **本日:** SonicWall SMA1000を12.4.3-03670、12.5.0-03082以降へ更新する。
- **本日:** .gh、.sl、.as domainを利用する組織はCertificate Transparency、DNS history、CAA policyを確認する。

## 重点脅威

### Chrome 155が4件のCritical use-after-freeを修正

**Severity:** Critical  
**Status:** Google release postではactive exploitation報告なし  
**CVE:** CVE-2026-106197, CVE-2026-106347, CVE-2026-106358, CVE-2026-106382  
**Affected:** Chrome desktop 155.0.8059.39/.40未満

10月6日のstable updateは247件のsecurity fixを含む。Critical 4件はChromecast、Browser、Navigation、Trackにある。多数のuserが更新するまで一部bug detailは制限される。

enterprise policyでupdateを配布し、endpointが実際にfixed buildで再起動しているか確認する。

#### Sources

- [Chrome Releases — Stable Channel Update for Desktop](https://chromereleases.googleblog.com/2026/10/stable-channel-update-for-desktop_086471744.html)

### Veeam CVE-2025-64393はBackup ViewerからRCEへ到達

**Severity:** Critical  
**Status:** Veeam bulletinでは悪用確認なし  
**CVSS:** 9.4 (CVSS v4)  
**CVE:** CVE-2025-64393, CVE-2025-64392, CVE-2026-93026  
**Affected:** Veeam Backup & Replication 12.3.2.4854以前のv12 build

Backup Viewer roleだけを持つuserがMount Serviceへuntrusted dataを送り、backup serverでRCEに到達できる。同じP4 updateで追加の2脆弱性も修正された。

12.3.2.4934以降へ更新する。backup infrastructureはprivileged systemとしてconsole accessとrole assignmentも確認する。

#### Sources

- [Veeam — KB4934](https://www.veeam.com/kb4934)

### SonicWall SMA1000の修正にCVSS 10 SSRF

**Severity:** Critical  
**Status:** SonicWallはin-the-wild exploitationの証拠なしと明記  
**CVSS:** 10.0 for CVE-2026-102255  
**CVE:** CVE-2026-102255, CVE-2026-102256, CVE-2026-102257, CVE-2026-102258  
**Affected:** SMA1000 12.4.3-03526以前、12.5.0-02952以前

SSRF、RCE、Zip Slip path traversal、stored XSSをまとめて修正した。vendorは他のSonicWall issueとは別件で、active exploitationは確認していないとしている。

12.4.3-03670、12.5.0-03082以降へ更新する。

#### Sources

- [SonicWall — SNWLID-2026-0017](https://www.sonicwall.com/support/notices/kA1VN000002QP3G0AW)

## その他の重要動向

### ccTLD registry侵害でunauthorized DNS変更とcertificate発行

**Severity:** High  
**Status:** Confirmed infrastructure incident  
**Affected:** incident期間中の.gh、.sl、.as配下domain

攻撃者はthird-party ccTLD registryを侵害し、authoritative DNSを変更して複数domainのunauthorized HTTPS certificateを取得した。Google自身のsystem compromiseではなく、ChromeはCRLSetsで対象certificateをblockした。

該当namespaceのdomain ownerはCT log、authoritative DNS変更、restrictive CAAを確認する。certificate revocationだけではregistry-level DNS controlは解消しない。

#### Sources

- [Google Security Blog — Chrome's response to ccTLD registry hijacks](https://blog.google/security/chromes-response-to-recent-cctld-registry-hijacks/)

## 本日の所見

- 3組のvulnerability eventについて、10月6日のvendor materialではactive exploitationが確認されていない。
- ccTLD incidentはapplicationより下のlayerで起きるため、host patchだけではregistry/DNS delegationの侵害を解決できない。
