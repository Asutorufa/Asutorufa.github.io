---
id: "2026-09-13"
title: "Threat Intelligence Daily · 2026-09-13"
date: "2026-09-13"
updated: "2026-09-15"
language: ja
generated: true
summary: "2026-09-13 時点で最も注目すべき脅威は、実際に悪用が確認された DevOps、リモート管理、エッジ機器の脆弱性と、複数の国家背景クラスタが急速に採用した BlueMoon の Chrome/Windows ゼロデイ連鎖です。CISA は 5 件の KEV を追加し、PaperCut と GitLab でも実攻撃が確認されました。一方で Check Point は 2 件の重大な VPN RCE を公開し、Brevo の事案は Trezor ユーザーを狙ったフィッシングにつながりました。"
total: 8
critical: 7
high: 1
medium: 0
low: 0
exploited: 7
tags:
  - active-exploitation
  - zero-day
  - supply-chain
  - phishing
  - apt
  - edge-device
  - devops
  - remote-access
  - vpn
  - CVE-2026-42016
  - CVE-2026-42018
  - CVE-2026-82329
  - CVE-2026-84869
  - CVE-2026-67276
  - CVE-2026-67277
  - CVE-2026-86060
  - CVE-2026-82078
  - CVE-2026-81578
  - CVE-2026-85706
  - CVE-2026-85046
  - CVE-2026-87491
  - CVE-2026-85880
  - CVE-2026-85102
  - CVE-2026-85103
cves:
  - CVE-2026-42016
  - CVE-2026-42018
  - CVE-2026-82329
  - CVE-2026-84869
  - CVE-2026-67276
  - CVE-2026-67277
  - CVE-2026-86060
  - CVE-2026-82078
  - CVE-2026-81578
  - CVE-2026-85706
  - CVE-2026-85046
  - CVE-2026-87491
  - CVE-2026-85880
  - CVE-2026-85102
  - CVE-2026-85103
iocs:
  - 82.192.72.4
  - 103.102.31.18
  - log.gitclone.org
  - 3.88.162.79
  - 64.207.232.6
  - ms.checrity.com
  - 79.133.56.90
  - brianwilli.com
  - fracons.com
  - getaiexo.com
  - elixnovorem.com
  - "sha256:a4a6a04d85eca8d584d939d2437c85a4f291207d8042f2ec002838e336b72ef5"
  - "sha256:295fc584f75e94108c9be945977db33ed80421f5d374eab188587c911dffd915"
---

## 今日の概要

9 月 13 日時点でも、攻撃者はインターネット公開された管理系・基盤系製品を重点的に狙っています。CISA は 9 月 12 日、JFrog Artifactory、ConnectWise ScreenConnect、MikroTik RouterOS に影響する 5 件の脆弱性を Known Exploited Vulnerabilities（KEV）に追加しました。今回のレポートでは、これらを最優先の対応対象として扱います。

同時に、GitLab の重大なパストラバーサル脆弱性は公開直後から実際のスキャンが観測され、PaperCut でも顧客環境での悪用が確認されています。さらに Proofpoint は、Chrome V8 と Windows カーネルのゼロデイを組み合わせた BlueMoon exploit chain を公開し、複数の国家背景クラスタが短期間で採用していることを報告しました。Check Point の 2 件の重大な VPN RCE は現時点で実悪用の確認はありませんが、境界機器であることから優先して修正すべきです。

## 最重要項目

### JFrog Artifactory：認証回避チェーンが管理者権限奪取に悪用

> 攻撃者は複数の Artifactory 脆弱性を組み合わせ、認証を回避して管理者権限を取得し、永続化とバックドア展開まで行っています。

**Severity:** Critical  
**Status:** 悪用確認済み / CISA KEV  
**CVE:** CVE-2026-42016、CVE-2026-42018、CVE-2026-82329  
**Affected:** JFrog Artifactory Self-Hosted

Wiz は、CVE-2026-42016 と CVE-2026-42018 などを組み合わせた実攻撃を確認しました。認証回避後に管理者権限を取得し、永続化用の管理者アカウント作成、悪意ある Groovy プラグインの読み込み、Rust 製バックドアの展開まで行われています。CISA は 9 月 12 日、このうち 2 件を KEV に追加しました。

#### 影響

侵害されると、ソフトウェア成果物、認証情報、ビルドパイプライン、下流のサプライチェーン信頼関係まで同時に危険にさらされます。CI/CD の中心に Artifactory を置く環境では、単一サーバーの侵害にとどまらない可能性があります。

#### 推奨対応

- JFrog が公開した修正版 7.111.21、7.117.28、7.125.20、7.133.29、7.146.38、7.161.20 以降へ更新する。
- 最近追加された管理者アカウント、異常な Groovy プラグイン、不審なサービスやプロセスを確認する。
- Artifactory ホストからの不審な外向き通信を調査し、露出した可能性のある高権限認証情報をローテーションする。

#### IOC

- `log.gitclone[.]org`
- `3.88.162[.]79`
- `64.207.232[.]6`

#### Sources

- [Wiz Research — Artifactory under attack](https://www.wiz.io/blog/artifactory-under-attack-in-the-wild-exploitation-of-cve-2026-42016-cve-2026-4201)
- [JFrog Artifactory Self-Managed Releases](https://docs.jfrog.com/releases/docs/artifactory-self-managed-releases)
- [CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### MikroTik RouterOS：MikroTrick 乗っ取りチェーンが実際に悪用

> RouterOS の複数脆弱性を連鎖させることで端末を完全に制御でき、CERT Polska は実際の攻撃元と検知情報を公開しています。

**Severity:** Critical  
**Status:** 悪用確認済み / CISA KEV  
**CVE:** CVE-2026-67276、CVE-2026-67277、CVE-2026-86060  
**Affected:** MikroTik RouterOS

CERT Polska は MikroTrick と呼ばれる攻撃チェーンを公開しました。CVE-2026-67276 と CVE-2026-86060 を組み合わせることで機器を完全に制御でき、CISA の KEV 更新には CVE-2026-67277 と CVE-2026-86060 が含まれます。MikroTik は修正版を公開済みです。

#### 影響

境界ルーターを奪取されると、通信監視、永続化、横展開、プロキシ基盤化、後続侵入の足場として利用される可能性があります。RouterOS 機器はインターネット境界に置かれることが多いため、CVSS だけで判断するよりも高い優先度で修正すべきです。

#### 推奨対応

- 7.25beta3、7.24.2、7.23.4、6.49.21 以降の修正版へ更新する。
- 不審な `ops` ユーザーなど、未知の高権限アカウントとログイン履歴を確認する。
- WinBox、SSH、Web 管理インターフェースの公開を制限し、既知の悪性送信元からのアクセスを調査する。

#### IOC

- `82.192.72[.]4` — CERT Polska が成功した攻撃元として観測
- `103.102.31[.]18` — exploit attempt の送信元として観測

#### Sources

- [CERT Polska — Vulnerabilities in MikroTik RouterOS actively exploited](https://cert.pl/en/posts/2026/09/vulnerabilities-in-mikrotik-routeros-actively-exploited/)
- [MikroTik — September 2026 Vulnerability](https://mikrotik.com/supportsec/september-2026-vulnerability/)
- [CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### BlueMoon：複数の国家背景クラスタが Chrome + Windows ゼロデイ連鎖を急速に採用

> Proofpoint は、少なくとも 4 つのスパイ活動クラスタが同一の exploit chain を短期間で採用し、米国や東南アジアの組織を標的にしたと報告しています。

**Severity:** Critical  
**Status:** 悪用確認済み / Zero-day chain  
**CVE:** CVE-2026-85046、CVE-2026-87491、CVE-2026-85880  
**Threat actors:** TA412 / APT31 およびその他の国家背景クラスタ  
**Malware:** ShadowPad、GemStone

BlueMoon は 2 件の Chrome V8 脆弱性と Windows カーネル ALPC の権限昇格脆弱性を連鎖させ、ブラウザ侵害から OS 権限獲得まで進みます。Proofpoint は最初に TA412/APT31 の活動で確認し、その後数日以内に複数の独立した国家背景クラスタが同じ手法を採用していることを観測しました。

#### 影響

高価値なブラウザ exploit chain が複数の攻撃者に急速に拡散することを示す事例です。対象には米国の NGO、航空宇宙、鉱業・商品関連組織のほか、アジアの政府、製造、コンサルティング、金融機関が含まれます。

#### 推奨対応

- Chrome/Chromium と Windows の両方を最新のセキュリティ更新にする。片方だけでは exploit chain を完全には切断できません。
- ブラウザ子プロセス、不審な拡張、権限昇格、その後の C2 通信を相関して調査する。
- 高リスクユーザーにはブラウザ分離、最小権限、厳格な外向き通信制御を適用する。

#### IOC

- `ms.checrity[.]com`
- `79.133.56[.]90`
- `brianwilli[.]com`
- `fracons[.]com`
- `getaiexo[.]com`
- `elixnovorem[.]com`
- `SHA256 a4a6a04d85eca8d584d939d2437c85a4f291207d8042f2ec002838e336b72ef5`
- `SHA256 295fc584f75e94108c9be945977db33ed80421f5d374eab188587c911dffd915`

#### Sources

- [Proofpoint — Once in a BlueMoon](https://www.proofpoint.com/us/blog/threat-insight/once-bluemoon-multiple-state-aligned-threat-actors-rapidly-adopt-novel-exploit)

### GitLab CVE-2026-85706：公開翌日に実ネットワークでの探査を確認

> 未認証の攻撃者が任意ファイルを読み取れるパストラバーサル脆弱性で、CVSS 10.0。公開直後からインターネット上で探査が確認されました。

**Severity:** Critical  
**Status:** 実際の探査/悪用活動を確認  
**CVSS:** 10.0  
**CVE:** CVE-2026-85706  
**Affected:** 修正版以前の複数の GitLab CE/EE 18.7+ 系列

GitLab は 19.3.2、19.2.6、19.1.8 で修正しました。その後、研究者は当該脆弱性を狙うインターネット上の活動を観測しており、「公開直後だからまだ余裕がある」という前提は危険です。

#### 推奨対応

- 19.3.2、19.2.6、19.1.8 以降へ更新する。
- `/api/v4/projects/{id}/repository/commits/` への不審な POST、特に異常な `file.path` を含むリクエストを確認する。
- 不審なファイル読み取りが確認された場合は、設定や認証情報が漏えいした前提でローテーションする。

#### Sources

- [GitLab — Patch Release 19.3.2](https://docs.gitlab.com/releases/patches/patch-release-gitlab-19-3-2-released/)
- [SecurityWeek — GitLab vulnerability exploited one day after disclosure](https://www.securityweek.com/gitlab-vulnerability-exploited-one-day-after-disclosure/)

## その他の悪用確認済み脅威

### ConnectWise ScreenConnect CVE-2026-84869

**Severity:** Critical  
**Status:** 悪用確認済み / CISA KEV  
**CVSS:** 9.9  
**Affected:** ScreenConnect 26.6.5 より前のバージョン

認可・権限処理に関する問題で、既存のリモートセッションを悪用してクライアント側のファイル転送や実行につなげられます。ConnectWise は Priority 1 と評価しており、Huntress は同時期に悪性・ワーム的な ScreenConnect 配布やスクリプト実行活動を観測しました。CISA も KEV に追加しています。

**推奨:** 26.6.5 以降へ直ちに更新し、不審な ScreenConnect インスタンス、VBScript/PowerShell 実行、未承認のリモートセッションを調査する。

#### Sources

- [ConnectWise Security Bulletin](https://www.connectwise.com/company/trust/security-bulletins/2026-09-08-screenconnect-bulletin)
- [Huntress — Rogue ScreenConnect Installations](https://www.huntress.com/blog/rogue-screenconnect-installations)
- [CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### PaperCut NG/MF：CVE-2026-82078 と CVE-2026-81578 が顧客環境で悪用

**Severity:** Critical  
**Status:** 悪用確認済み  
**CVE:** CVE-2026-82078、CVE-2026-81578  
**Affected:** PaperCut NG/MF

PaperCut は、この 2 件の脆弱性が関係する顧客セキュリティ事案を確認しました。CVE-2026-82078 は危険な動的クラス読み込み、CVE-2026-81578 は認証回避に関係します。ベンダーは 9 月 10 日に正式なメンテナンス版を公開し、先行する緊急パッチを置き換えました。

**推奨:** 26.0.5、25.0.13、24.1.10 以降の修正版へ更新し、PaperCut のログ検知ガイダンスに従って過去ログを調査する。

#### Sources

- [PaperCut — Urgent Security Advisory](https://www.papercut.com/kb/Main/security-bulletin-27-aug-2026-urgent-security-advisory/)
- [SecurityWeek — PaperCut flaws exploited in AI-powered attacks](https://www.securityweek.com/papercut-flaws-exploited-in-ai-powered-attacks/)

## 重要な脆弱性

### Check Point VPN：2 件の重大な RCE は優先して修正

**Severity:** Critical  
**Status:** 現時点で信頼できる実悪用の証拠なし  
**CVE:** CVE-2026-85102、CVE-2026-85103  
**Affected:** Check Point Remote Access / Site-to-Site VPN

CVE-2026-85102 は認証回避から遠隔コード実行につながる問題で、CVE-2026-85103 は ASN.1 デコード時のヒープオーバーフロー RCE です。Check Point は内部で発見し、現時点で悪用は観測していないとしていますが、境界 VPN 装置は高価値な攻撃対象です。

**推奨:** Check Point の Live Patch または最新 Jumbo Hotfix を適用し、インターネット公開 VPN ゲートウェイがすべて修正済みであることを確認する。

#### Sources

- [Check Point — Critical Security Advisory: VPN Vulnerabilities](https://community.checkpoint.com/t5/General-Topics/Action-Required-Critical-Security-Advisory-VPN-Vulnerabilities/m-p/282073/highlight/true)
- [SecurityWeek — Check Point patches critical VPN vulnerabilities](https://www.securityweek.com/check-point-patches-critical-vpn-vulnerabilities/)

## Supply Chain / Phishing

### Brevo 事案が Trezor に波及：第三者メール基盤がウォレット向けフィッシングに悪用

**Severity:** High  
**Status:** 攻撃確認済み  
**Affected:** Brevo 顧客アカウント、Trezor newsletter 利用者

Brevo は SAML SSO の分離不備により、攻撃者が 138 の顧客アカウントへアクセスしたと発表しました。6 アカウントはフィッシングメール送信に使われ、43 アカウントでは連絡先がエクスポートされました。Trezor によると約 347,000 件の newsletter アドレスが影響を受け、正規のマーケティング経路を使って wallet backup の入力を促すフィッシングが配信されました。悪性インフラ停止までに約 2,500 人がリンクをクリックしたとされています。

Trezor のコアウォレットシステム自体は侵害されていませんが、信頼された第三者通信チャネルが乗っ取られると、フィッシングの信頼性と到達率が大きく高まることを示しています。

**推奨:** Trezor 利用者は wallet backup や seed phrase の入力を求めるメールやアプリ通知を無視する。組織側では、第三者マーケティング/メール SaaS の SSO 境界、エクスポート権限、高リスク操作の監査を再確認する。

#### Sources

- [Trezor — Security incident at Brevo](https://trezor.io/blog/news/security-incident-at-brevo-our-third-party-email-provider)
- [Brevo — Incident write-up](https://status.brevo.com/incidents/01M266V1CZKJQNGZRNEGFD5CQE/write-up)

## IOC サマリー

以下の IOC は、上記の一次調査で明確に悪性文脈として示されたものです。共有ホスティングや IP の割り当ては変化しうるため、実際のブロック前には時刻・ログ・資産文脈と照合してください。

| イベント | IOC | 種別 |
| --- | --- | --- |
| Artifactory | `log.gitclone[.]org` | payload domain |
| Artifactory | `3.88.162[.]79` | infrastructure IP |
| Artifactory | `64.207.232[.]6` | C2 IP |
| MikroTik | `82.192.72[.]4` | observed attacker IP |
| MikroTik | `103.102.31[.]18` | exploit-attempt IP |
| BlueMoon | `ms.checrity[.]com` | ShadowPad C2 |
| BlueMoon | `79.133.56[.]90` | fallback C2 |
| BlueMoon | `brianwilli[.]com` | payload/download infrastructure |
| BlueMoon | `fracons[.]com` | C2 |
| BlueMoon | `getaiexo[.]com` | C2 |
| BlueMoon | `elixnovorem[.]com` | C2 |

## 今日の観察

- **管理プレーンは依然として高価値な攻撃面です。** Artifactory、ScreenConnect、RouterOS、GitLab、PaperCut はいずれも運用・管理経路にあり、侵害後の影響が下流資産まで広がりやすい構成です。
- **公開直後でも「猶予期間」があるとは限りません。** GitLab では公開後すぐに探査が観測されており、インターネット公開された重大脆弱性は通常保守ではなくインシデント対応として扱うべきです。
- **ゼロデイ exploit chain の横展開を個別監視する価値があります。** BlueMoon は複数の国家背景クラスタで短期間に確認され、高価値な exploit chain が急速に再利用される可能性を示しました。
- **第三者 SaaS は引き続き信頼境界の弱点です。** Brevo/Trezor ではコアウォレット自体は侵害されていませんが、正規メールチャネルの悪用だけでも大規模なユーザー到達が可能でした。