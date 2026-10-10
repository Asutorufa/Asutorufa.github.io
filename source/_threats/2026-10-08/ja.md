---
id: "2026-10-08"
title: "Threat Intelligence Daily · 2026-10-08"
date: "2026-10-08"
updated: "2026-10-10"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10月8日は4件を採用した。Atlassian CVE-2026-21589はin-the-wild exploitation確認へ更新。HuntressはAhsayCBS CVE-2026-105133/105134をchainしたSYSTEM-level RCEを観測した。tensorlake npm 0.5.144にはShai-Hulud wormが混入し、米DOJ/FBIはFlax TyphoonのMicroscan/FishHub関連infrastructureを押収した。"
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 2
tags:
  - active-exploitation
  - arbitrary-file-read
  - auth-bypass
  - rce
  - supply-chain
  - malicious-package
  - apt
  - Atlassian
  - Ahsay
  - Shai-Hulud
  - Flax-Typhoon
  - CVE-2026-21589
  - CVE-2026-105133
  - CVE-2026-105134
cves:
  - CVE-2026-105133
  - CVE-2026-105134
  - CVE-2026-21589
iocs:
  - iseekaigogo.com
  - sha256:25a0735d0db7dc40e5d45ce42d9c106067e6a66e184d967cfecfab17c3bcb5ef
  - sha256:b50a00900399ba99fb6ce1fc151519cb99d44320ef2a631f2237e1aea0ad6fec
  - c0cc.cc
  - 98aiblog.com
  - 98aicai.com
  - 98aicode.com
  - outlook3650.com
  - youtubecard.com
  - linkedinns.net
---

## 昨日からの変化

- **UPDATED — Atlassian:** October 5 disclosure後、watchTowrはCVE-2026-21589のin-the-wild exploitationを観測したと報告した。
- **UPDATED — AhsayCBS:** Huntressは10月7日23:20 UTCからCVE-2026-105133/105134のchainを観測し、unauthenticated RCE後にwebshellとXMRigが投入された。
- **NEW — tensorlake npm:** version 0.5.144がShai-Hulud variantを含むmalicious releaseとして公開され、secret theftとsupply-chain propagationを試みる。
- **NEW — Flax Typhoon:** U.S. DOJ/FBIがMicroscan、FishHub、persistence toolingに関係するIntegrity Techの7 domainをseizeした。

## 優先対応

- **直ちに:** Atlassian Data Centerをpatchし、advisory公開以降のarbitrary-file-read attemptとsensitive file accessをhuntする。
- **直ちに:** AhsayCBS management accessを制限し、fixed releaseへ更新してCBS service配下のchild process、JSP webshell、miner activityを調査する。
- **直ちに:** tensorlake 0.5.144を削除する。installしたhost/CI jobがaccessできたnpm、GitHub、cloud、local secretをrotateし、repositoryのself-propagated changeも確認する。
- **本日:** seized Flax Typhoon domainをhistorical huntingに使い、unexpected SoftEther VPNとMicroscan/FishHub関連behaviorを確認する。

## 重点脅威

### Atlassian CVE-2026-21589のin-the-wild exploitationを確認

**Severity:** Critical  
**Status:** Confirmed in-the-wild exploitation  
**CVSS:** 9.3  
**CVE:** CVE-2026-21589  
**Affected:** vendor advisory記載の8 Atlassian Data Center/self-hosted product family

10月5日のvendor statusから変化し、watchTowrは10月6日までに実環境での悪用を観測した。既知pathのfileをunauthenticatedで読むため、予測可能なconfiguration/secret pathが主なriskになる。

patch後、remediation前のrequest logとsensitive-file accessを確認する。10月5日の「no evidence」statusは現在のexploitation statusとして使わない。

#### Sources

- [Atlassian — CVE-2026-21589 advisory](https://confluence.atlassian.com/security/cve-2026-21589-arbitrary-file-access-vulnerability-impacts-multiple-products-1870495748.html)
- [watchTowr — CVE-2026-21589 FAQ](https://watchtowr.com/intelligence/atlassian-arbitrary-file-access-vulnerability-jira-confluence-cve-2026-21589-faq/)

### AhsayCBS flaw chainでSYSTEM-level RCE

**Severity:** Critical  
**Status:** Confirmed active exploitation  
**CVE:** CVE-2026-105133, CVE-2026-105134  
**Affected:** affected versionのinternet-accessible AhsayCBS

HuntressはCVE-2026-105133をauthentication bypass、CVE-2026-105134をRCEとしてchainする攻撃を観測した。post-exploitationにはJSP webshell、reconnaissance、Microsoft Edge componentを装うXMRigが含まれる。

current fixed releaseへ更新し、management accessをtrusted IP/VPNへ限定する。AhsayCBS serviceからのprocess tree、新規JSP、service change、miner indicatorを確認する。

#### Sources

- [Huntress — Active exploitation of AhsayCBS](https://www.huntress.com/blog/ahsaycbs-flaws-exploit)

### tensorlake npm 0.5.144にShai-Hulud supply-chain worm

**Severity:** Critical  
**Status:** Confirmed malicious package publication  
**Affected:** npm package `tensorlake@0.5.144`

Aikidoはmalicious npm releaseがpreinstall chainを通じてlocal/cloud/developer secretを盗み、取得したcredentialで追加のpropagationを試みることを確認した。公開時点でPyPI/Cargo版に同様のmalicious releaseは確認されていない。

0.5.144をinstallしたsystemはcompromisedとして扱い、package削除、credential rotation、repository/package publish history確認を行う。

#### IOC

- `iseekaigogo[.]com`
- `SHA256 25a0735d0db7dc40e5d45ce42d9c106067e6a66e184d967cfecfab17c3bcb5ef`
- `SHA256 b50a00900399ba99fb6ce1fc151519cb99d44320ef2a631f2237e1aea0ad6fec`

#### Sources

- [Aikido — tensorlake npm package compromised](https://www.aikido.dev/blog/tensorlake-npm-package-compromised)

## Malware / APT / Campaign

### DOJ/FBIがFlax TyphoonのMicroscan / FishHub infrastructureをdisrupt

**Severity:** High  
**Status:** Confirmed state-linked intrusion infrastructure disruption  
**Threat actor:** Flax Typhoon / Integrity Technology Group  
**Tools:** Microscan, FishHub, SoftEther VPN

DOJは、critical infrastructureなどのnetworkをscanし一部を侵害するためのinfrastructureをcourt-authorized seizureで遮断したと説明した。FishHubはspear-phishingとfollow-on malware deliveryに利用され、関連infrastructureはremote access維持にも使われた。

domainは押収済みなので、現在のblock判定よりhistorical log huntingで価値が高い。matchはtimestamp/contextと一緒に評価する。

#### IOC

- `c0cc[.]cc`
- `98aiblog[.]com`
- `98aicai[.]com`
- `98aicode[.]com`
- `outlook3650[.]com`
- `youtubecard[.]com`
- `linkedinns[.]net`

#### Sources

- [U.S. Department of Justice — Flax Typhoon infrastructure seizure](https://www.justice.gov/opa/pr/justice-department-and-fbi-seize-vulnerability-scanning-and-spear-phishing-tools-operated)

## IOC サマリー

| Event | Indicator | Context |
| --- | --- | --- |
| tensorlake | `iseekaigogo[.]com` | Shai-Hulud C2 |
| tensorlake | `25a0735d...bcb5ef` | malicious setup script SHA256 |
| tensorlake | `b50a0090...d6fec` | malicious payload SHA256 |
| Flax Typhoon | `c0cc[.]cc` | Microscan infrastructure |
| Flax Typhoon | `98aicai[.]com` / `98aicode[.]com` | FishHub delivery infrastructure |

## 本日の所見

- 週前半に「悪用確認なし」だった2件で直接telemetryが出た。statusはreport dateごとに保持する必要がある。
- tensorlakeはmalicious supply-chain publicationなので、patchよりcredential rotationとrepository reviewが中心になる。
