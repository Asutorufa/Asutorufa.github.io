---
id: "2026-10-05"
title: "Threat Intelligence Daily · 2026-10-05"
date: "2026-10-05"
updated: "2026-10-10"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10月5日は3件を採用した。Atlassianは8種類のData Center製品に影響するCVE-2026-21589を公開し、当日時点の調査では悪用を確認していなかった。デンマークでは大規模なCPR自動照会の調査が始まり、Zammadはactive exploitationと関連付けられた2件のCVEについて実際の影響範囲を整理した。"
total: 3
critical: 1
high: 2
medium: 0
low: 0
exploited: 1
tags:
  - active-exploitation
  - cisa-kev
  - arbitrary-file-read
  - data-breach
  - session-hijack
  - Atlassian
  - Denmark-CPR
  - Zammad
  - CVE-2026-21589
  - CVE-2026-102489
  - CVE-2026-102490
cves:
  - CVE-2026-102489
  - CVE-2026-102490
  - CVE-2026-21589
iocs: []
---

## 昨日からの変化

- **NEW — Atlassian:** CVE-2026-21589がBitbucket、Confluence、Jira、Bamboo、Crowd、Crucible、FisheyeのData Center製品に公開された。Atlassianは10月5日時点の調査で悪用の証拠を確認していない。
- **NEW — Denmark CPR:** デンマークのData Protection Agencyが、有効なCPR番号の特定を目的とした大量の自動照会について調査を開始した。
- **UPDATED — Zammad:** vendorはCVE-2026-102489の実用上の影響を古いruntimeへ絞り、CVE-2026-102490は事前にserver accessを必要とするlocal privilege escalationと説明した。

## 優先対応

- **直ちに:** 影響するAtlassian Data Center製品を更新し、完了までself-hosted instanceのaccessを制限する。
- **本日:** Denmark CPR事案に関係する組織は、実際にaccess可能だったpersonal dataを確認し、targeted phishingやidentity abuseに備える。
- **本日:** Zammadは6.5以前のunsupported releaseを優先し、shell/server accessを制限する。すべての7.xをCVE-2026-102489の同一riskとして扱わない。

## 重点脅威

### Atlassian CVE-2026-21589で未認証のarbitrary file access

**Severity:** Critical  
**Status:** Atlassianは10月5日時点で悪用を確認していない  
**CVSS:** 9.3  
**CVE:** CVE-2026-21589  
**Affected:** Bitbucket DC、Confluence DC、Jira Service Management DC、Jira Software DC、Bamboo DC、Crowd DC、Crucible、Fisheye

攻撃者は認証なしで既知のfile name/pathを指定してfileを読める。任意のdirectory enumerationを直接提供するものではないが、pathが推測可能なconfiguration、application secret、local credentialは対象になり得る。

各productのfixed maintenance releaseへ更新する。Atlassian Cloudはvendor側でpatch済みで、主な対応対象はData Center/self-hosted。

#### Sources

- [Atlassian — CVE-2026-21589 advisory](https://confluence.atlassian.com/security/cve-2026-21589-arbitrary-file-access-vulnerability-impacts-multiple-products-1870495748.html)
- [Atlassian Trust Center — October 5 announcement](https://customertrust.atlassian.com/)

## 確認済みインシデント

### DenmarkがCPR recordへの大量自動accessを調査

**Severity:** High  
**Status:** Investigation confirmed; scope under review  
**Affected:** Denmark CPR関連systemからaccess可能だったpersonal data

Datatilsynetは、有効なCPR番号を特定するため非常に多くの自動照会が行われたとの報告を受けた。access方法、対象data、責任主体は当時まだ調査中だった。

identity属性はtargeted phishingやsocial engineeringの精度を上げる可能性がある。official scopeが固まるまでは未確認のvictim countを使わない。

#### Sources

- [Datatilsynet — CPR investigation](https://www.datatilsynet.dk/presse-og-nyheder/nyhedsarkiv/2026/okt/datatilsynet-er-opmaerksom-paa-sag-om-opslag-i-cpr)

## その他の重要動向

### ZammadがCVE-2026-102489 / CVE-2026-102490の実用上の範囲を整理

**Severity:** High  
**Status:** UPDATED scope clarification; CVE-2026-102489 remains linked to confirmed exploitation  
**CVE:** CVE-2026-102489, CVE-2026-102490  
**Affected:** CVE-2026-102489は実用上Zammad 6.5以前、CVE-2026-102490はlocal/server accessが前提

Zammadによると、7.0以降のruntimeではCVE-2026-102489を実際にはexploitできず、6.5以前が影響する。CVE-2026-102490はstandalone remote exploitではなくlocal privilege escalation。

unsupported versionを更新し、underlying server accessをtrusted administratorへ制限する。

#### Sources

- [Zammad — CVE-2026-102489 / CVE-2026-102490 advisory](https://zammad.com/en/advisories/cve-2026-102489-cve-2026-102490)

## 本日の所見

- Atlassianの10月5日statusはdisclosure without confirmed exploitation。後日のtelemetryは当日事実として書かない。
- Zammadのscope clarificationは対応対象を直接減らす。versionだけでなくruntime条件を確認する必要がある。
