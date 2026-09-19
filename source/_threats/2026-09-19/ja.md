---
id: "2026-09-19"
title: "脅威インテリジェンス日報 · 2026-09-19"
date: "2026-09-19"
updated: "2026-09-19 23:00:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "CISA は実悪用が確認された Linux kernel の3件を KEV に追加し、9月21日を対処期限とした。WordPress 7.1.1 は後に Click2Shell として実証された crafted URL 経由のテーマ導入経路を修正。Chrome 153 は Dawn と WebGL の Critical なメモリ安全性問題を修正し、vm2 3.11.7 はホストプロセスでのコード実行や TLS trust store 変更を含む複数の sandbox 境界不備を修正した。"
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 1
tags:
  - active-exploitation
  - Linux
  - CISA-KEV
  - WordPress
  - Click2Shell
  - Chrome
  - vm2
  - sandbox-escape
  - remote-code-execution
  - memory-safety
  - CVE-2025-39682
  - CVE-2025-39964
  - CVE-2026-53266
  - CVE-2026-92937
  - CVE-2026-92941
  - CVE-2026-93372
  - CVE-2026-93374
cves:
  - CVE-2025-39682
  - CVE-2025-39964
  - CVE-2026-53266
  - CVE-2026-92937
  - CVE-2026-92941
  - CVE-2026-93372
  - CVE-2026-93374
iocs: []
---

## 昨日からの変化

- **NEW — Linux kernel:** CISA は CVE-2025-39682、CVE-2026-53266、CVE-2025-39964 を実悪用の証拠に基づき KEV へ追加した。公開情報では攻撃者や、3件が同一 exploit chain で使われたかは確認できない。
- **NEW — WordPress:** 7.1.1 の security release 後に公開された研究は Click2Shell を実証した。ログイン済み管理者が crafted URL を開くと WordPress.org の inactive theme の導入と preview が発生し、その theme に別の脆弱性がある場合は PHP 実行へ連鎖できる。
- **NEW — Chrome:** Chrome 153.0.8010.52/.53 は16件の security issue を修正し、Dawn の use-after-free と WebGL の buffer overflow の2件を Critical としている。
- **NEW — vm2:** 新たに公開された CVE は、3.11.7 で修正された複数の sandbox 境界不備を記録している。ホスト Node.js プロセスでのコード実行と、プロセス全体の TLS trust store 変更が含まれる。

## 優先対応

- **即時:** 3件の KEV の影響を受ける Linux に distribution 提供の kernel update を適用し、修正版 kernel で再起動する。patch 前の侵害確認に使う telemetry は保持する。
- **即時:** 信頼できない JavaScript を `VM` / `NodeVM` で処理する環境は vm2 3.11.7 以降へ更新し、sandbox に公開している host module と async object を確認する。
- **本日:** WordPress 7.1.1、または利用中の保守 branch に対応する修正版への更新を確認する。管理者としてログインした状態で信頼できないリンクを開かない。
- **本日:** Chrome desktop を 153.0.8010.52/.53 以降、Android を 153.0.8010.52 以降へ更新し、browser management telemetry で実際の version を確認する。

## 重点脅威

### Linux kernel 3件が CISA KEV に追加

**Severity:** Critical  
**Status:** 実悪用確認済み；CISA KEV  
**CVE:** CVE-2025-39682、CVE-2026-53266、CVE-2025-39964  
**Affected:** 該当コードを含む Linux kernel と downstream distribution

CISA は9月18日に3件を KEV へ追加した。CVE-2025-39682 は kernel TLS receive path にあり、NVD では NIST が 7.1、kernel.org CNA が 9.8 を記録している。CVE-2026-53266 は ebtables SNAT の out-of-bounds write で、特定の bridge netfilter 構成では memory corruption、DoS、local privilege escalation につながる。CVE-2025-39964 は AF_ALG socket への concurrent write に関する race condition である。

KEV 登録により実悪用は確認できる。一方、今回確認した公開資料には攻撃者、被害対象、3件を組み合わせた利用の情報はない。KEV の対処期限は 2026年9月21日。

#### 推奨対応

- distribution または cloud vendor が提供する kernel package を使用し、upstream version だけで影響有無を判断しない。
- update 後に再起動し、install 済み package だけでなく現在動作中の kernel version を確認する。
- CVE-2026-53266 を直ちに修正できない場合、Red Hat は ebtables SNAT の ARP hardware-address rewriting を無効化するか、該当 ARP SNAT rule を削除する緩和策を示している。
- patch 前の kernel crash、異常な権限変更、namespace activity、netfilter 設定変更を調査する。

#### Sources

- [CISA — Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)
- [NVD — CVE-2025-39682](https://nvd.nist.gov/vuln/detail/CVE-2025-39682)
- [Red Hat — CVE-2026-53266](https://access.redhat.com/security/cve/cve-2026-53266)

### vm2 3.11.7 が sandbox escape と host state 変更を修正

**Severity:** Critical  
**Status:** 修正済み；実悪用は未確認  
**CVE:** CVE-2026-92937、CVE-2026-92941  
**Affected:** 3.11.7 で修正される以前の vm2。CVE ごとに成立条件は異なる

CVE-2026-92937 は vm2 3.11.6 の不完全な Promise sanitization 修正を扱う。embedder が host realm の Promise を sandbox に公開し、rejected Error が host object を持つ場合、`Function.prototype.call` / `apply` の間接呼び出しで bridge check を回避し、sandbox code が host object を取得できる。公開 record は host Node.js process の権限で command execution が可能としている。

CVE-2026-92941 は 3.11.3 以上 3.11.7 未満に影響し、関連 built-in が sandbox に公開されていることが前提となる。sandbox code は host の `tls` module に到達して process-wide default CA を変更でき、その後の host HTTPS client が信頼する証明書を変えられる。両 record とも 3.11.7 を修正版としている。

#### 推奨対応

- vm2 3.11.7 以降へ更新する。
- tenant、plugin、workflow、AI 生成 JavaScript を vm2 で実行する service を棚卸しする。設定によって vulnerable bridge path の到達可否が変わる。
- patch 後も公開する built-in と host object を最小化する。credential や高信頼 network access を JavaScript sandbox だけで保護しない。

#### Sources

- [GitHub Security Advisory — CVE-2026-92937](https://github.com/patriksimek/vm2/security/advisories/GHSA-647f-g98j-qq25)
- [GitHub Security Advisory — CVE-2026-92941](https://github.com/patriksimek/vm2/security/advisories/GHSA-98xx-8mx4-x7cm)

### Chrome 153 が Dawn / WebGL の Critical memory-safety flaw を修正

**Severity:** Critical  
**Status:** 修正済み；Google は実悪用を記載していない  
**CVE:** CVE-2026-93374、CVE-2026-93372  
**Affected:** Chrome desktop 153.0.8010.52/.53 より前、および対応する Android build

Google の9月17日 Stable Channel update は16件の security fix を含む。CVE-2026-93374 は Dawn の Critical use-after-free、CVE-2026-93372 は WebGL の Critical buffer overflow。Chrome for Android 153.0.8010.52 は、Google が別途除外を示さない限り、対応する desktop release と同じ security fix を含む。

#### 推奨対応

fixed release の rollout 後に desktop / Android fleet を更新し、browser management telemetry で version compliance を確認する。

#### Sources

- [Chrome Releases — Stable Channel Update for Desktop](https://chromereleases.googleblog.com/2026/09/stable-channel-update-for-desktop_0194356994.html)
- [Chrome Releases](https://chromereleases.googleblog.com/)

## その他の項目

### WordPress 7.1.1 が Click2Shell の入口を修正

**Severity:** High  
**Status:** 修正済み；実悪用は未確認  
**Affected:** 9月17日の対応 security release より前の WordPress Core

WordPress 7.1.1 は11件の security fix を含む。その一つは crafted URL が WordPress.org の inactive theme を自動的に install / preview する問題を修正する。後に公開された Click2Shell の研究では、ログイン済み管理者が URL を開くだけで Install を別途押さずに theme installation が起き、theme code 側の別の脆弱性と組み合わせて server-side PHP execution に至る経路が示された。

Core 側の問題には管理者の操作が必要で、実証された code-execution chain は vulnerable theme にも依存する。zero-click unauthenticated WordPress RCE とは条件が異なる。WordPress は security fix を対象 branch へ backport しており、4.7 までが対象に含まれる。

#### 推奨対応

WordPress 7.1.1 または利用 branch の対応 security release へ更新し、automatic background update が実際に完了したことを確認する。authenticated admin session では信頼できない URL を開かない。

#### Sources

- [WordPress — 7.1.1 Maintenance and Security Release](https://wordpress.org/news/2026/09/wordpress-7-1-1-maintenance-and-security-release/)

## 日次観測

- 本日報で実悪用が確認されているのは Linux KEV のイベントのみ。公開資料には campaign attribution や exploit chain の詳細がまだない。
- Linux、vm2、WordPress はいずれも境界の問題を含む。kernel の権限・memory 境界、JavaScript sandbox 境界、administrator から theme install への authorization 境界であり、対応優先度は CVSS だけでなく実際の構成で判断する必要がある。
- 今回確認した一次情報には4イベントへ確実に帰属できる malicious IP、domain、hash の集合がないため、IOC list は掲載しない。
