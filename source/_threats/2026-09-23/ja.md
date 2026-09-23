---
id: "2026-09-23"
title: "Threat Intelligence Daily · 2026-09-23"
date: "2026-09-23"
updated: "2026-09-23 22:58:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "本日は4件を収録した。Check Pointは認証前の2件の脆弱性に対する悪用を確認。F5はBIG-IP APMのゼロデイ悪用、AristaはVeloCloud Orchestratorの実悪用を公表した。MemTensorではnpm/PyPIの不正リリースから認証情報窃取ワームsckitが配布された。"
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 4
tags:
  - active-exploitation
  - zero-day
  - Check-Point
  - F5
  - BIG-IP
  - Arista
  - VeloCloud
  - supply-chain
  - npm
  - PyPI
  - MemTensor
  - sckit
  - CVE-2026-85102
  - CVE-2026-93616
  - CVE-2026-93952
  - CVE-2026-94127
cves:
  - CVE-2026-85102
  - CVE-2026-93616
  - CVE-2026-93952
  - CVE-2026-94127
iocs:
  - skyleen.fr
  - 8a8acaf167b3.skyleen.fr
  - 0b48fafd6fbe.skyleen.fr
  - 266297c6df27.skyleen.fr
  - c747d139e7e9.skyleen.fr
  - 73376a079d87.skyleen.fr
  - d4f77a3a8cb0.skyleen.fr
  - 10729e014d0e.skyleen.fr
  - 39ee644406829a4b630b31759c20478bc22d576d6a59b253ed86f72c360aa5ef
  - 92b46d18fc553c494eda714f204459edb74c205bf53b18a9092bcf02c7a6c5be
---

## 昨日からの変化

- **NEW — Check Point:** CVE-2026-85102は9月12日からSpark顧客への攻撃で使われ、CVE-2026-93616は7月23日に限定的なゼロデイ悪用が確認された。両方ともCISA KEVに追加された。
- **NEW — F5 BIG-IP APM:** CVE-2026-94127はゼロデイ悪用後に公開された。APMがOAuth Authorization Serverとして構成されている場合、未認証の攻撃者によるリモートコード実行につながる。
- **NEW — Arista VeloCloud:** AristaはCVSS 3.1で10.0のCVE-2026-93952を公開し、実際の悪用を確認している。Hosted/Dedicated VCOはArista側で修正済みで、オンプレミス環境は管理者による対応が必要。
- **NEW — MemTensor:** 9月23日に公開された不正なnpm/PyPIリリースに、開発者・CI認証情報を収集し伝播機能も持つクロスプラットフォームの` sckit`インプラントが含まれていた。

## 優先対応

- **即時:** 影響を受けるCheck Point Security Gateway/SparkとSecurity Managementを修正し、証明書ベースの異常なMobile Accessログイン、管理サーバー上のスクリプト実行やJava classロードを調査する。
- **即時:** 影響を受けるF5 BIG-IP APM OAuth Authorization ServerとArista VeloCloud Orchestratorオンプレミス環境を修正または隔離する。両方とも悪用が確認されているため、ログを保全して侵害調査を行う。
- **即時:** ホスト、lockfile、CI runner、agent gatewayから`@memtensor/memos-cloud-openclaw-plugin` 0.1.21/0.1.23/0.1.25と`MemoryOS` 2.0.34を検索する。読み込んだ環境は侵害済みとして扱う。
- **本日中:** 影響環境からアクセス可能だったnpm/PyPI publish token、GitHub/GitLab token、クラウド認証情報、SSH keyをローテーションし、`skyleen[.]fr`とそのサブドメインをブロック・検索する。

## 重点脅威

### Check PointのGateway/Management脆弱性が悪用中

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** CVE-2026-93616は9.8  
**CVE:** CVE-2026-85102, CVE-2026-93616  
**Affected:** Check Point Security Gateway/Spark、Security Management Server、Multi-Domain Security Management Server、Log Server、Multi-Domain Log Server、SmartEvent

CVE-2026-85102はVPN証明書処理にある認証前RCEで、Check Pointは9月12日からSpark顧客に対する悪用試行を観測している。CVE-2026-93616はManagement web serviceの別の認証前path traversalで、任意スクリプトの実行と任意Java classのロードが可能。Check Pointは7月23日に少数の標的型攻撃を観測し、9月22日に脆弱性と修正を公開した。

対象の修正を適用し、Mobile Access、管理サーバーログ、不審なログイン後の内部ポート・サービススキャンを確認する。以前のManagement向けLivePatchだけをCVE-2026-93616の修正根拠にはしない。

#### Sources

- [Check Point — Active exploitation advisory](https://blog.checkpoint.com/security/security-advisory-action-required-active-exploitation-of-cve-2026-85102-and-a-management-pre-authentication-vulnerability-cve-2026-93616/)
- [CISA — Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### F5 BIG-IP APM CVE-2026-94127がゼロデイとして悪用

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVE:** CVE-2026-94127  
**Affected:** OAuth Authorization Serverとして構成されたBIG-IP APM

CVE-2026-94127では、未認証の攻撃者が影響を受けるBIG-IP APMへ細工したネットワークトラフィックを送り、OAuth Authorization Server構成時にリモートコード実行へ到達できる。F5はゼロデイ悪用を確認した後に修正を公開し、CISAは9月25日を期限としてKEVへ追加した。

対象システムを更新し、APMがOAuth Authorization Serverとして動作しているか確認する。過去に外部公開されていた対象機器では侵害調査も実施する。

#### Sources

- [CISA — Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-94127)
- [BleepingComputer — F5 patches BIG-IP APM zero-day](https://www.bleepingcomputer.com/news/security/f5-warns-of-big-ip-apm-remote-code-execution-zero-day-exploited-in-attacks/)

### Arista VeloCloud Orchestrator CVE-2026-93952が実際に悪用

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 10.0 (v3.1), 9.5 (v4.0)  
**CVE:** CVE-2026-93952  
**Affected:** VeloCloud Orchestrator on-prem。Hosted/Dedicated VCOも影響を受けたが、Aristaは修正済みとしている

Aristaによると、不適切な入力検証によりリモート攻撃者がVCOの特権内部機能へアクセスし、ホストおよびOrchestratorが管理するデータの機密性・完全性・可用性に影響を与えられる。悪用は確認済み。露出条件にはcertificate-based Edge authenticationとVCO web interfaceへのネットワークアクセスが含まれる。

利用中のVCO系統に対応する修正版を適用する。露出有無はアドバイザリの前提条件を確認して判断し、管理プレーンのテレメトリを調査用に保全する。

#### Sources

- [Arista — Security Advisory 0183](https://www.arista.com/en/support/advisories-notices/security-advisory/24765-security-advisory-0183)
- [Canadian Centre for Cyber Security — AV26-947 Update 1](https://www.cyber.gc.ca/en/alerts-advisories/arista-networks-security-advisory-av26-947)

### MemTensorのnpm/PyPI不正リリースがsckitを配布

**Severity:** High  
**Status:** Confirmed malicious supply-chain compromise  
**Affected:** `@memtensor/memos-cloud-openclaw-plugin` 0.1.21、0.1.23、0.1.25、`MemoryOS` 2.0.34  
**Malware:** `sckit` / `supplychain.local`

複数の研究組織が9月23日にMemTensorの不正リリースを確認した。同梱されたGoインプラントはプラグインまたはPythonパッケージの通常ロード時に起動し、ユーザーのhome directoryと環境から認証情報を探し、`skyleen[.]fr`配下のインフラと通信する。パッケージ公開や侵害されたGitHub Actions workflowを利用して伝播するコードも含まれる。install scriptの無効化だけではこの実行経路を止められない。

対象バージョンを読み込んだシステムは侵害済みとして扱う。対象バージョンと` sckit`を除去し、`$HOME/.openclaw/.cache/runtime`、`$HOME/.memos/.cache/runtime`、不審な`runtime-update.yml`を確認した後、到達可能だった認証情報をローテーションする。registry publish tokenが存在した環境では、自組織パッケージの最近の公開履歴も確認する。

#### Sources

- [SafeDep — MemTensor npm and PyPI packages hit by a Go worm](https://safedep.io/memtensor-sckit-worm-npm-pypi/)
- [Socket — MemTensor packages compromised](https://socket.dev/blog/memtensor-compromise)
- [StepSecurity — sckit supply-chain worm](https://www.stepsecurity.io/blog/sckit-supply-chain-worm-hits-memtensor-npm-pypi-scopes)

## IOC summary

| Type | Indicator | Context |
| --- | --- | --- |
| Domain | `skyleen[.]fr`と観測済みサブドメイン | sckit campaign infrastructure |
| SHA256 | `39ee644406829a4b630b31759c20478bc22d576d6a59b253ed86f72c360aa5ef` | MemoryOS 2.0.34 wheel |
| SHA256 | `92b46d18fc553c494eda714f204459edb74c205bf53b18a9092bcf02c7a6c5be` | MemoryOS 2.0.34 source distribution |

## Daily observations

- 3件のインフラ脆弱性はいずれも実悪用が確認され、管理または認証プレーンに影響する。修正済みであることだけでは、修正前の露出期間に侵害がなかったことは確認できない。
- MemTensor payloadは通常のpackage load/import経路で起動するため、`--ignore-scripts`では実行を防げない。影響調査には対象バージョンを読み込んだ開発端末、CI runner、agent gatewayを含める。
