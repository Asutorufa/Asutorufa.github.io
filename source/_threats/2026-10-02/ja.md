---
id: "2026-10-02"
title: "Threat Intelligence Daily · 2026-10-02"
date: "2026-10-02"
updated: "2026-10-03 03:45:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10月2日は3件を採用した。GitLabはAI GatewayのCVSS 9.9 sandbox escapeを修正し、DellはContainer Storage Modulesの複数Critical脆弱性を公開、うち2件は認証欠落でCVSS 10.0。Frontline Educationはthird-party software脆弱性による従業員データへの未認証アクセスを学区へ通知し始めた。"
total: 3
critical: 2
high: 1
medium: 0
low: 0
exploited: 1
tags:
  - ai-security
  - kubernetes
  - storage
  - data-breach
  - GitLab
  - Dell
  - Frontline-Education
  - CVE-2026-63688
  - CVE-2026-63692
  - CVE-2026-67269
  - CVE-2026-67273
  - CVE-2026-54472
  - CVE-2026-61421
  - CVE-2026-90970
cves:
  - CVE-2026-54472
  - CVE-2026-61421
  - CVE-2026-63688
  - CVE-2026-63692
  - CVE-2026-67269
  - CVE-2026-67273
  - CVE-2026-90970
iocs: []
---

## 昨日からの変化

- **NEW — GitLab AI Gateway:** CVE-2026-90970により、Duo Agent Platform accessを持つ認証済みユーザーがcrafted flow configurationでprompt-template sandboxをescapeし、self-hosted AI Gateway上で任意commandを実行できる。
- **NEW — Dell CSM:** Container Storage Modulesの複数Critical flawが公開された。CVE-2026-63688とCVE-2026-63692はいずれもCVSS 10.0で、未認証network attackerが管理権限を取得できる。
- **NEW — Frontline Education:** third-party softwareの脆弱性を入口とするunauthorized accessについて、school districtへのbreach notificationが始まった。

## 優先対応

- **直ちに:** self-hosted GitLab AI Gatewayを19.2.4、19.3.2、19.4.1以降へ更新する。GitLab-hosted gatewayは修正済み。
- **直ちに:** Dell CSM Authorization/Operatorをinventoryし、vendor remediated releaseへ更新する。advisoryで指定されたsigning secretもrotationする。
- **本日:** Frontlineから通知を受けたschool districtは、対象employeeとdata fieldを確認し、notificationとidentity-fraud monitoringを進める。

## 重点脅威

### GitLab AI Gateway CVE-2026-90970がprompt-template sandboxをescape

**Severity:** Critical  
**Status:** GitLabからactive exploitation報告なし  
**CVSS:** 9.9  
**CVE:** CVE-2026-90970  
**Affected:** self-hosted GitLab AI Gateway 18.1.6から影響19.4系

Duo Agent Platform accessを持つ認証済みユーザーがcrafted flow configurationを渡すと、prompt-template sandboxをescapeしてAI Gateway上で任意commandを実行できる。GitLab-hosted gatewayは修正済みで、self-hosted環境は更新が必要。

19.2.4、19.3.2、19.4.1またはそれ以降へ更新する。flow作成権限が広い環境ではcustom-flowとgateway logも確認する。

#### Sources

- [GitLab — AI Gateway critical patch release](https://docs.gitlab.com/releases/patches/other-patches/patch-release-gitlab-ai-gateway-19-4-1-released/)

### Dell CSMの認証欠落でstorage-admin controlへ到達

**Severity:** Critical  
**Status:** Dellからactive exploitation報告なし  
**CVSS:** CVE-2026-63688 / CVE-2026-63692は10.0  
**CVE:** CVE-2026-63688, CVE-2026-63692, CVE-2026-67269, CVE-2026-54472, CVE-2026-61421, CVE-2026-67273  
**Affected:** DSA-2026-448記載のDell Container Storage Modules

CVE-2026-63688はstorage gRPC serviceで認証が欠落し、登録storage arrayのbackend administrator credentialを取得できる。CVE-2026-63692はauthorization proxy/tenant serviceの別の認証欠落で、administrative privilegeを取得できる。同じadvisoryではroot privilege escalation、hard-coded secret、Kubernetes Secrets/RBAC関連のCritical flawも修正された。

DellのDSA-2026-448に従って更新し、指定されたcredential/signing secretをrotationする。Dell storageをKubernetesから利用する環境ではCSM Authorizationがcluster security boundaryになる。

#### Sources

- [BleepingComputer — Dell CSM critical flaws](https://www.bleepingcomputer.com/news/security/new-max-severity-dell-csm-flaws-give-hackers-admin-privileges/)
- [The Hacker News — Dell CSM flaws](https://thehackernews.com/2026/10/dell-csm-flaws-enable-unauthenticated.html)

## 確認済みインシデント

### Frontline Educationがthird-party software経由のunauthorized accessを通知

**Severity:** High  
**Status:** Confirmed data-breach notification  
**Affected:** 通知対象school districtのemployee record。実際のfieldは組織ごとに異なる

Frontline Educationは8月14日、利用しているthird-party softwareの脆弱性により環境の一部へunauthorized accessが可能だったと説明した。外部security firmと調査し、修正とlaw enforcementへの連絡を行った。少なくとも1つのdistrict notificationにはSSN、email、住所などのemployee dataが含まれる。

より広いvendor statementが出るまではdistrictごとにscopeを確認し、全顧客が同じdata impactを受けたとは扱わない。

#### Sources

- [BleepingComputer — Frontline Education breach](https://www.bleepingcomputer.com/news/security/frontline-education-data-breach-impacts-school-district-employees/)

## 本日の所見

- GitLabの問題はAI product内にあるが、failure modeはsandbox escape後のcommand executionであり、通常のprivileged service hardeningが中心になる。
- Dell CSMはKubernetesとenterprise storageの間にある。この層の認証欠落はclusterとstorageの両方の管理境界を越える。
