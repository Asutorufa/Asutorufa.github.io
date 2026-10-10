---
id: "2026-10-09"
title: "Threat Intelligence Daily · 2026-10-09"
date: "2026-10-09"
updated: "2026-10-10"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10月9日は4件を採用した。CitrixはNetScalerのSAML構成でRCEまたはDoSにつながるCriticalなCVE-2026-107406を公開。BeyondTrustはRemote SupportのCritical脆弱性を告知し、SaaSは自動patch、self-hostedの一部は手動対応が必要。TenableはHermes AgentのPKCE redirect parser不整合によるsession takeoverを公開し、JPCERT/CCは国内で相次ぐ不正accessと個人情報漏えいの注意喚起を更新した。"
total: 4
critical: 2
high: 2
medium: 0
low: 0
exploited: 0
tags:
  - edge-device
  - remote-support
  - session-takeover
  - identity
  - data-breach
  - japan
  - Citrix
  - BeyondTrust
  - Hermes-Agent
  - JPCERT
  - CVE-2026-107406
cves:
  - CVE-2026-107406
iocs: []
---

## 昨日からの変化

- **NEW — Citrix NetScaler:** CVE-2026-107406は新しいCriticalなSAML関連memory overflowで、条件によりRCEまたはDoSとなる。前回NetScaler patch後のrequired fixed buildも変わる。
- **NEW — BeyondTrust Remote Support:** BeyondTrustはBT26-05-RSをCriticalとして公開。SaaSは10月9日にautomatic patch、automatic critical updateを使わないself-hosted環境は手動対応が必要。
- **NEW — Hermes Agent:** TenableはPython URL parserとbrowser WHATWG parserのredirect URI解釈差を使うPKCE session takeoverを公開した。
- **UPDATED — 国内不正access注意喚起:** JPCERT/CCはBI、employee-managementなど、本来不特定多数向けではないがexternal access可能なsystemを含む国内事案へのalertを更新した。

## 優先対応

- **直ちに:** SAML prerequisiteを確認し、affected NetScaler ADC/Gatewayを14.1-73.46、13.1-64.29または対応するFIPS/NDcPP fixed buildへ更新する。
- **直ちに:** BeyondTrust Remote Support SaaSのpatch状態を確認し、automatic critical update対象外のself-hostedはBT26-05-RS remediationを手動適用する。
- **本日:** Hermes Agentを0.21.6以降へ更新し、untrusted userから到達できるOAuth/native-login endpointを確認する。
- **本日:** 国内組織は、内部・限定利用を想定していてもinternet reachableなmanagement、BI、employee systemをinventoryする。

## 重点脅威

### Citrix NetScaler CVE-2026-107406でRCEまたはDoS

**Severity:** Critical  
**Status:** 参照したCitrix bulletinでは悪用確認なし  
**CVSS:** 9.5 (CVSS v4)  
**CVE:** CVE-2026-107406  
**Affected:** version-specificなSAML SP/IdP prerequisiteに該当するcustomer-managed NetScaler ADC/Gateway

CVE-2026-107406はmemory overflowで、前回のCVE-2026-88779よりimpactが大きい。exposureはNetScaler versionとSAML SP/IdP構成に依存し、一部のtransition versionではIdPのみが該当する。

14.1-73.46、13.1-64.29または対応FIPS/NDcPP buildへ更新する。前回issueでpatch済みのapplianceもrequired fixed versionを再確認する。

#### Sources

- [Citrix — CTX697191](https://support.citrix.com/external/article/CTX697191/citrix-netscaler-adc-and-citrix-netscale.html)

### BeyondTrust Remote Support BT26-05-RSはself-hostedのpatch確認が必要

**Severity:** Critical  
**Status:** Vendor advisory; active exploitationは推定しない  
**Affected:** BT26-05-RS対象のBeyondTrust Remote Support

BeyondTrustは10月9日にCritical vulnerabilityを公開した。SaaS instanceはvendorがautomatic patchする一方、automatic critical updateを選んでいないself-hosted customerは手動installが必要。

deployment modelごとにpatch stateを確認する。Remote Supportのadmin accessを絞り、audit logを保存しておく。

#### Sources

- [BeyondTrust — BT26-05-RS announcement](https://beekeepers.beyondtrust.com/general-45/beyondtrust-security-advisory-bt26-05-rs-remote-support-8587)

## 重要な脆弱性

### Hermes AgentのPKCE redirect parsing差でauthorization codeが漏れる

**Severity:** High  
**Status:** Tenableから悪用報告なし  
**CVSS:** 8.8 (CVSS v3) / 8.6 (CVSS v4)  
**Affected:** Hermes Agent 0.21.6未満

native authorization flowはPython parserでredirect URIを検証した後、raw valueをbrowserへ返す。WHATWG parserはbackslashを異なる形で解釈するため、attacker-selected PKCE challengeと組み合わせるとauthorization codeをattacker-controlled originへ送り、victim tokenへexchangeできる。

0.21.6以降へ更新し、native authorization requestとparser-confusing separatorを含むredirect URIを確認する。

#### Sources

- [Tenable — TRA-2026-65](https://www.tenable.com/security/research/tra-2026-65)

## その他の重要動向

### JPCERT/CCが国内で相次ぐ不正accessへの注意喚起を更新

**Severity:** High  
**Status:** 複数のconfirmed incidentに基づくoperational alert。手法は事案ごとに異なる  
**Affected:** internet reachableなapplication、BI、employee-management systemを運用する国内組織

JPCERT/CCは9月前後からunauthorized accessによるpersonal-data leakが相次いでいるとした。一般利用者向けapplicationだけでなく、運用側が不特定多数の利用を想定していないBIやemployee-management systemも対象になっている。

external reachability、authentication/access control、異常query/data exportを確認する。technical detailは限定的かつ断片的とされているため、全件を一つのexploit chainへまとめない。

#### Sources

- [JPCERT/CC — JPCERT-AT-2026-0030](https://www.jpcert.or.jp/at/2026/at260030.html)

## 本日の所見

- Citrixの10月9日対応はCVE-2026-88779の繰り返しではなく、新CVEによってimpactとrequired fixed buildが変わっている。
- JPCERT/CC自身がtechnical detailを限定的・断片的と説明している。exposure reviewには使えるが、single root causeの推定材料には不足する。
