---
id: "2026-10-03"
title: "Threat Intelligence Daily · 2026-10-03"
date: "2026-10-03"
updated: "2026-10-10"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10月3日は4件を採用した。CISAは悪用確認済みのZammadセッションハイジャック脆弱性をKEVへ追加済み。CitrixはNetScalerのSAML構成に影響するHighのDoS脆弱性を公開し、Bouncy CastleはMLSのidentity bindingに関するCritical CVE、FortraはBoKS Master上でroot command executionにつながるcommand injectionを公開した。"
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 1
tags:
  - active-exploitation
  - cisa-kev
  - session-hijack
  - cryptography
  - privileged-access
  - edge-device
  - Zammad
  - Bouncy-Castle
  - Fortra
  - Citrix
  - CVE-2026-102489
  - CVE-2026-102490
  - CVE-2026-71885
  - CVE-2026-79898
  - CVE-2026-88779
cves:
  - CVE-2026-102489
  - CVE-2026-102490
  - CVE-2026-71885
  - CVE-2026-79898
  - CVE-2026-88779
iocs: []
---

## 昨日からの変化

- **NEW — Zammad:** CISAは10月2日にCVE-2026-102489をKEVへ追加した。旧版Zammadではsession hijackから追加の権限昇格を組み合わせ、code executionへ進めるケースが公開されている。
- **NEW — Citrix NetScaler:** CitrixはSAML SPまたはIdPとして動作するcustomer-managed ADC/Gateway向けにCVE-2026-88779を公開した。
- **NEW — Bouncy Castle:** CVE-2026-71885が公開され、MLS X.509 credentialとLeafNode signature keyのbinding不備が明らかになった。1.86で修正済み。
- **NEW — Fortra BoKS:** CVE-2026-79898により、関連する管理権限を持つ認証済みユーザーがshell commandを注入し、BoKS Master上でrootとして処理させられる。

## 優先対応

- **直ちに:** Zammad 6.xなどサポート終了版をsupported releaseへ移行し、session異常、管理者操作、server-side executionの痕跡を確認する。
- **本日:** SAML SP/IdPとして利用しているNetScalerを特定し、Citrixのfixed buildへ更新する。
- **本日:** MLSを利用するJavaサービスはBouncy Castle 1.86以降へ更新する。
- **本日:** Fortra BoKS Managerを修正し、完了までBCC/WSI管理経路をtrusted networkへ制限する。

## 重点脅威

### Zammad CVE-2026-102489がCISA KEV入り

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVE:** CVE-2026-102489, CVE-2026-102490  
**Affected:** 古いself-hosted Zammad、特に6.5以前

CVE-2026-102489はsession hijackの脆弱性で、CISAは10月2日にKEVへ追加した。公開された事案ではCVE-2026-102490も扱われており、攻撃者がserver accessを得た後のlocal privilege escalationとして影響を広げる。

サポート終了版を優先して更新する。host accessを絞り、異常なsession、管理者操作、公開instance上のprocess/file変更を確認する。

#### Sources

- [CISA — CVE-2026-102489 KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-102489)
- [DIVD — DIVD-2026-00015](https://csirt.divd.nl/DIVD-2026-00015)

### Bouncy Castle Java CVE-2026-71885でMLSのidentity/key bindingが崩れる

**Severity:** Critical  
**Status:** 悪用確認なし  
**CVE:** CVE-2026-71885  
**Affected:** MLS X.509 credentialを使うBouncy Castle Java 1.86未満

MLS実装が、X.509 credentialのidentityとLeafNode signature keyを正しく結び付けない場合がある。external commitを許し、独立したadmission checkがない構成ではpeer identityの保証に影響する。

1.86以降へ更新し、MLS membership admissionがこのcredential pathだけに依存していないか確認する。

#### Sources

- [CVE.org — CVE-2026-71885](https://www.cve.org/CVERecord?id=CVE-2026-71885)
- [Bouncy Castle — Java 1.86 release](https://github.com/bcgit/bc-java/discussions/2449)

### Fortra BoKS Manager CVE-2026-79898でroot command execution

**Severity:** Critical  
**Status:** 悪用確認なし  
**CVSS:** 9.1  
**CVE:** CVE-2026-79898  
**Affected:** FI-2026-015記載のFortra BoKS Manager

CRL URLを追加できる認証済みユーザーが、BCC、WSI APIまたはcommand-line経路から`crlserver`のshell command substitutionを起動できる。処理はBoKS Master上でroot権限となる。

Fortraのfixed buildを適用し、更新まで管理interfaceをtrusted networkへ限定する。

#### Sources

- [Fortra — FI-2026-015](https://www.fortra.com/security/advisories/product-security/fi-2026-015)

## その他の重要動向

### Citrix NetScaler CVE-2026-88779はSAML構成に影響

**Severity:** High  
**Status:** Citrix初期advisoryでは悪用確認なし  
**CVSS:** 8.7 (CVSS v4)  
**CVE:** CVE-2026-88779  
**Affected:** SAML SPまたはSAML IdPとして構成されたcustomer-managed NetScaler ADC/Gateway

memory overflowによりDoSが発生する。CitrixはSAML構成を前提条件として示し、14.1-73.41、13.1-64.28などをfixed buildとして公開した。

SAMLを有効にしたapplianceから優先して更新する。

#### Sources

- [Citrix — CTX697174](https://support.citrix.com/external/article/CTX697174/citrix-netscaler-adc-and-citrix-netscale.html)

## 本日の所見

- 本日の4件で悪用が確認されているのはZammadのみ。残りはexposureとimpactを基にpatch priorityを決める。
- 認証・identity boundaryに関係する事象では、version updateと合わせてsessionおよびadmin access logを確認する。
