---
id: "2026-10-07"
title: "Threat Intelligence Daily · 2026-10-07"
date: "2026-10-07"
updated: "2026-10-10"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10月7日は4件を採用した。Ciscoの定例security releaseにはNX-OSの複数unauthenticated root RCEと、CVSS 10のsignature verification flawを含むLicense On-Prem hardeningが入った。Splunk Enterpriseは最高9.8のmulti-CVE advisoryを修正し、IDC FrontierはIDCFクラウド東日本リージョン1の障害がransomwareで、495社・自治体に影響したと確認した。"
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 0
tags:
  - network-infrastructure
  - rce
  - license-management
  - siem
  - ransomware
  - cloud
  - Cisco
  - Splunk
  - IDCF
  - CVE-2026-76465
  - CVE-2026-76471
  - CVE-2026-76482
cves:
  - CVE-2026-76264
  - CVE-2026-76265
  - CVE-2026-76272
  - CVE-2026-76280
  - CVE-2026-76465
  - CVE-2026-76471
  - CVE-2026-76480
  - CVE-2026-76482
  - CVE-2026-76483
  - CVE-2026-76484
  - CVE-2026-76485
  - CVE-2026-76486
  - CVE-2026-76501
iocs: []
---

## 昨日からの変化

- **NEW — Cisco NX-OS:** MPLS OAM、NX-API、NGOAMでunauthenticated remote attackerがroot code executionへ到達できる複数のCritical advisoryが公開された。
- **NEW — Cisco License On-Prem:** October hardening releaseで4つのsecurity classを修正し、CVE-2026-76482はCVSS 10.0。
- **NEW — Splunk Enterprise:** SVD-2026-1001はsupported 9.4、10.0、10.2、10.4 branchに対する複数脆弱性を修正し、最高CVSSは9.8。
- **NEW — IDCF Cloud:** IDC Frontierは東日本リージョン1の事象をransomwareと確認し、495社・自治体への影響を公表した。

## 優先対応

- **直ちに:** October 7 Cisco advisoryとNexus/NX-OS feature configurationを照合し、NX-API、MPLS OAM、NGOAMが有効かつ管理networkから到達可能なdeviceを優先して更新する。
- **直ちに:** Cisco License On-Premを10-202609またはvendor指定のfixed releaseへ更新する。このhardening setにworkaroundはない。
- **本日:** Splunk Enterpriseを10.4.3、10.2.7、10.0.10、9.4.15以降へ更新し、advisory記載の追加remediationも実行する。
- **本日:** IDCF customerはproviderのisolation/recovery guidanceに従い、東日本リージョン1へ接続していたworkloadとcredentialを確認する。

## 重点脅威

### Cisco NX-OS October releaseに複数のunauthenticated root RCE

**Severity:** Critical  
**Status:** 参照したCisco advisoryでは悪用確認なし  
**CVE:** CVE-2026-76465, CVE-2026-76471, CVE-2026-76485, CVE-2026-76486, CVE-2026-76501  
**Affected:** MPLS OAM、NX-API、NGOAMを利用する特定Cisco Nexus 3000/9000・NX-OS構成

CVE-2026-76465はMPLS OAM、CVE-2026-76471はNX-API、NGOAM groupには追加3件のRCEがある。pathによってroot code executionまたはDoSへ到達する。

Cisco Software Checkerと各advisoryのconfiguration prerequisiteで実際のexposureを判断し、feature-enabledかつreachableなdeviceを先にpatchする。

#### Sources

- [Cisco — NX-API RCE](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-napi-rce-r2shwu2j)
- [Cisco — MPLS OAM RCE](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-moam-rce-uBTzYV7)
- [Cisco — NGOAM RCE vulnerabilities](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-ngoam-rce-LWKQ4BU)

### Cisco License On-Prem hardeningにCVSS 10のtrust failure

**Severity:** Critical  
**Status:** Cisco PSIRTはmalicious useを確認していない  
**CVSS:** 10.0 for CVE-2026-76482  
**CVE:** CVE-2026-76480, CVE-2026-76482, CVE-2026-76483, CVE-2026-76484  
**Affected:** October 2026 hardening advisory記載のCisco License On-Prem

missing authentication、cryptographic signature verification不備、credential保護不足、code injectionをまとめて修正した。workaroundはなく、現行10.xでは10-202609がfirst fixed release。

vendor指定releaseへ更新し、patch後もmanagement interfaceをtrusted networkに限定する。

#### Sources

- [Cisco — License On-Prem Security Hardening Release](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-hardening-ssm-Ph77wdhf)

### Splunk Enterprise SVD-2026-1001はupgrade後の追加remediationが必要

**Severity:** Critical  
**Status:** Splunk advisoryでは悪用確認なし  
**CVSS:** Highest score 9.8  
**CVE:** CVE-2026-76264, CVE-2026-76265, CVE-2026-76272, CVE-2026-76280  
**Affected:** fixed release未満のSplunk Enterprise 9.4、10.0、10.2、10.4

Splunkは10.4.3、10.2.7、10.0.10、9.4.15で複数脆弱性を修正した。SVD-2026-1001は上記4 CVEに追加remediationが必要と明記している。

fixed releaseへ上げた後、CVE-specific手順も完了させる。

#### Sources

- [Splunk — SVD-2026-1001](https://advisory.splunk.com/advisories/SVD-2026-1001)

## 確認済みインシデント

### IDCFクラウド東日本リージョン1の障害はransomware

**Severity:** High  
**Status:** Confirmed ransomware incident  
**Affected:** 東日本リージョン1。10月7日報告では495社・自治体

IDC Frontierは03:40 JST頃からのunauthorized accessについて、調査の結果ransomware attackと判明したと公表した。affected regionを分離し、侵入経路とfull impactの調査を継続した。

customerはprovider guidanceに従い、affected regionへ接続していたworkloadとcredentialを確認する。service recoveryだけをcompromise closureとしない。

#### Sources

- [IDC Frontier — October 7 second report](https://www.idcf.jp/news/topics/20261007002)

## 本日の所見

- CiscoのCVE数は多いが、patch priorityはfeature exposureで決める方が実務的。
- IDCFはransomwareを確認したがintrusion vectorは未確定。当日のCisco/Splunk CVEと直接結び付ける根拠はない。
