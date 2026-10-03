---
id: "2026-09-29"
title: "Threat Intelligence Daily · 2026-09-29"
date: "2026-09-29"
updated: "2026-10-03 03:30:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "9月29日は2件の実攻撃研究と2件の基盤ソフトウェア問題が中心となった。MicrosoftはMSP360とScreenConnectを悪用するphishing、Star BlizzardのRedFlickを公開。JVNはPgpool-IIの7 CVE、CERT/CCはAuthlibのJWS署名検証bypassを公開した。"
total: 4
critical: 0
high: 4
medium: 0
low: 0
exploited: 2
tags:
  - phishing
  - credential-theft
  - rmm
  - Star-Blizzard
  - RedFlick
  - CosmicPulse
  - Authlib
  - Pgpool-II
  - CVE-2026-96760
cves:
  - CVE-2026-92867
  - CVE-2026-92868
  - CVE-2026-92869
  - CVE-2026-92870
  - CVE-2026-92871
  - CVE-2026-92872
  - CVE-2026-92873
  - CVE-2026-96760
iocs:
  - 108ef7e628d7a20bd6241a5b57149e27a6061f467123eb64061975559f8f73dc
  - adswre.cfd
  - trews.cfd
  - adsaw.cfd
  - sdfghj.rd-team.ru
---

## 昨日からの変化

- **NEW — RMM phishing:** Microsoftは正規MSP360 RMMを導入した後、ScreenConnectを2本目の永続remote accessとして展開するphishing campaignを公開した。
- **NEW — Star Blizzard:** CosmicPulse配布に使われるRedFlick techniqueが公開された。
- **NEW — Pgpool-II:** JVNが7件のCVEを公開し、最大CVSS v3は8.8。
- **NEW — Authlib:** CERT/CCがCVE-2026-96760を公開。空の`signatures` arrayを持つJWSがverifiedとして扱われる。

## 優先対応

- **直ちに:** 未承認RMMをinventoryし、ユーザーのdownload pathやphishing、異常なPowerShellから導入されたMSP360/ScreenConnectを調査する。
- **本日:** MicrosoftのRedFlick/CosmicPulse IOCとscheduled task activityをhuntする。
- **本日:** Pgpool-IIを4.7.3、4.6.8、4.5.13、4.4.18、4.3.21または新しい修正版へ更新する。
- **本日:** Authlib JWS JSON serializationを使うアプリは空signature arrayを受け入れない検証を追加する。

## 重点脅威

### MSP360とScreenConnectを組み合わせたphishing

**Severity:** High  
**Status:** Confirmed phishing / post-compromise activity  
**Affected:** 偽装MSP360 installerを実行したWindows endpoint

Microsoftは正規署名済みMSP360 RMMを業務文書に見せかけて配布する活動を確認した。導入後、RMM serviceがPowerShellを使ってScreenConnectを追加し、2本目のremote accessを確立する。ScreenConnect自体の脆弱性悪用は確認されていない。

Downloadsなどから起動したMSP360、`ClientSetup.msi`を取得するPowerShell、未承認ScreenConnect infrastructureを確認する。

#### IOC

- `SHA256 108ef7e628d7a20bd6241a5b57149e27a6061f467123eb64061975559f8f73dc`
- `adswre[.]cfd`
- `trews[.]cfd`
- `adsaw[.]cfd`
- `sdfghj[.]rd-team[.]ru`

#### Sources

- [Microsoft Security Research — Phishing Abuses RMM Tools for Persistent Access](https://www.microsoft.com/en-us/security/blog/2026/09/29/phishing-abuses-rmm-tools-persistent-access/)

### Star BlizzardがRedFlickを採用

**Severity:** High  
**Status:** Confirmed cyberespionage activity  
**Threat actor:** Star Blizzard  
**Malware:** CosmicPulse  
**Affected:** ウクライナ関連組織、国際NGO、think tank、政府・政策関連組織

Microsoftは2026年1月以降、Star Blizzardのphishingと検知回避の変化を追跡している。RedFlickはscheduled taskを使ってCosmicPulseを配布し、以前の多段ClickFix操作への依存を減らす。

対象組織ではidentity telemetry、不審なscheduled task、MicrosoftのIOCを優先して確認する。

#### Sources

- [Microsoft Threat Intelligence — Star Blizzard RedFlick](https://www.microsoft.com/en-us/security/blog/2026/09/29/star-blizzard-refines-phishing-and-malware-delivery-with-the-redflick-technique/)

## 重要な脆弱性

### Pgpool-IIの複数脆弱性

**Severity:** High  
**Status:** JVNで悪用確認なし  
**CVE:** CVE-2026-92867, CVE-2026-92868, CVE-2026-92869, CVE-2026-92870, CVE-2026-92871, CVE-2026-92872, CVE-2026-92873  
**Affected:** JVN記載のPgpool-II 3.5.xから影響4.7.x系

7件の問題が公開され、最大CVSS v3は8.8。4.7.3、4.6.8、4.5.13、4.4.18、4.3.21などの修正版へ更新する。古いbranchはsupported releaseへ移行する。

#### Sources

- [JVN#22475874 — Pgpool-II](https://jvn.jp/en/jp/JVN22475874/)

### Authlib CVE-2026-96760でJWS署名検証をbypass

**Severity:** High  
**Status:** CERT/CC noteで悪用確認なし  
**CVE:** CVE-2026-96760  
**Affected:** Authlib 1.7.2以下

`JsonWebSignature.deserialize_json()`は空の`signatures` arrayを持つJWS general JSONをverifiedとして扱うため、鍵を持たない攻撃者が偽造payloadを渡せる。

このAPIをauthentication/authorizationに使う経路を確認し、修正版が明確になるまで空signature arrayを拒否する。

#### Sources

- [CERT/CC — VU#762428](https://kb.cert.org/vuls/id/762428)

## IOCサマリー

| 種別 | Indicator | Context |
| --- | --- | --- |
| SHA256 | `108ef7e628d7a20bd6241a5b57149e27a6061f467123eb64061975559f8f73dc` | phishingで観測されたMSP360 installer |
| Domain | `adswre[.]cfd` | malicious ScreenConnect session |
| Domain | `trews[.]cfd` | malicious ScreenConnect session |
| Domain | `adsaw[.]cfd` | malicious ScreenConnect session |
| Domain | `sdfghj[.]rd-team[.]ru` | malicious ScreenConnect session |

## 本日の所見

- 正規RMMが攻撃chainに入るため、署名済みbinaryや正規製品名だけではbenign useを判断できない。
- Authlibの問題は認証primitiveにある。library fixまでapplication側のvalidationが重要になる。
