---
id: "2026-10-04"
title: "Threat Intelligence Daily · 2026-10-04"
date: "2026-10-04"
updated: "2026-10-10"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10月4日は2件を採用した。Citrix NetScaler CVE-2026-88779はSAML構成に対するHighのDoS脆弱性から、悪用確認済み/KEV優先項目へ変化した。AhsayCBSでは認証処理の欠陥とReplication Receiverの認証不要RCEを含む2件の脆弱性が公開された。"
total: 2
critical: 1
high: 1
medium: 0
low: 0
exploited: 1
tags:
  - active-exploitation
  - cisa-kev
  - edge-device
  - backup
  - auth-bypass
  - rce
  - Citrix
  - Ahsay
  - CVE-2026-88779
  - CVE-2026-105133
  - CVE-2026-105134
cves:
  - CVE-2026-105133
  - CVE-2026-105134
  - CVE-2026-88779
iocs: []
---

## 昨日からの変化

- **UPDATED — Citrix NetScaler:** CVE-2026-88779がknown-exploitedとして扱われるようになった。impactはDoSのままだが、active exploitationにより公開SAML applianceの対応優先度が上がる。
- **NEW — AhsayCBS:** CVE-2026-105133とCVE-2026-105134が公開された。authentication処理の問題とReplication ReceiverのCriticalなunauthenticated RCEを含む。

## 優先対応

- **直ちに:** SAML前提条件に該当するNetScalerを更新し、service interruptionと脆弱なpathへの異常requestを確認する。
- **本日:** internet-accessibleなAhsayCBS management serverを洗い出し、修正版へ移行するまで管理interfaceを制限する。
- **監視:** AhsayCBSのapplication logとprocess creation telemetryを保存し、後続の悪用情報が出た場合に遡及調査できる状態にする。

## 重点脅威

### Citrix NetScaler CVE-2026-88779がknown-exploitedへ

**Severity:** High  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 8.7 (CVSS v4)  
**CVE:** CVE-2026-88779  
**Affected:** SAML SPまたはSAML IdPとして構成されたcustomer-managed NetScaler ADC/Gateway

Citrixのadvisoryが説明するimpactはmemory overflowによるDoS。10月4日時点では悪用報告とKEV扱いにより、SAML境界applianceとしてpatch priorityが上がった。RCEとしては扱わない。

Citrixのfixed buildへ更新し、まずSAML preconditionに該当するapplianceを特定する。

#### Sources

- [Citrix — CTX697174](https://support.citrix.com/external/article/CTX697174/citrix-netscaler-adc-and-citrix-netscale.html)
- [CISA — KEV catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### AhsayCBS CVE-2026-105133 / CVE-2026-105134がbackup management planeに影響

**Severity:** Critical  
**Status:** 当日時点で悪用確認なし  
**CVE:** CVE-2026-105133, CVE-2026-105134  
**Affected:** 10月4日のdisclosureで示されたAhsayCBS version

CVE-2026-105133はauthentication処理、CVE-2026-105134はReplication Receiver API経由のunauthenticated RCEに関係する。backup management serverは多くのprotected systemへ接続するため、侵害時の到達範囲が広い。

vendor-remediated versionへ更新し、可能ならmanagement interfaceをinternetから切り離す。

#### Sources

- [NVD — CVE-2026-105133](https://nvd.nist.gov/vuln/detail/CVE-2026-105133)
- [NVD — CVE-2026-105134](https://nvd.nist.gov/vuln/detail/CVE-2026-105134)

## 本日の所見

- NetScalerはavailability impact中心でも、active exploitationにより対応順が変わる。
- AhsayCBSはこの時点ではvulnerability disclosureとして扱う。後日に確認された攻撃telemetryを10月4日の事実としては書かない。
