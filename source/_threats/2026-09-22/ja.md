---
id: "2026-09-22"
title: "Threat Intelligence Daily · 2026-09-22"
date: "2026-09-22"
updated: "2026-09-22 23:02:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "CISA は実悪用が確認された Zyxel GS1900 のコマンド実行脆弱性を KEV に追加し、関連攻撃では 996 台のスイッチが侵害された。Microsoft は 12,000 超のメールボックス侵害に関与した EvilTokens を妨害した。Volexity は Chrome/Windows のゼロデイ連鎖を使う3組目の中国系アクターを確認し、Arctic Wolf は Veeam Agent のローカル権限昇格脆弱性の実悪用を報告した。"
total: 4
critical: 0
high: 4
medium: 0
low: 0
exploited: 4
tags:
  - active-exploitation
  - Zyxel
  - network-infrastructure
  - EvilTokens
  - phishing
  - device-code-phishing
  - business-email-compromise
  - UTA0565
  - CLEANGULP
  - zero-day
  - Google-Chrome
  - Microsoft-Windows
  - Veeam
  - privilege-escalation
  - CVE-2026-7273
  - CVE-2026-85046
  - CVE-2026-87491
  - CVE-2026-85880
  - CVE-2026-32996
cves:
  - CVE-2026-32996
  - CVE-2026-7273
  - CVE-2026-85046
  - CVE-2026-85880
  - CVE-2026-87491
iocs:
  - thecovnresation.com
  - personclouds.com
  - outsourcingwise.net
  - halal-navi.net
  - halaltak.net
  - thecovnresation.net
  - borneobulletins.top
---

## 昨日からの変化

- **NEW — Zyxel GS1900:** CISA は実悪用を確認した CVE-2026-7273 を KEV に追加した。GreyNoise のテレメトリに基づく公開情報では、中国語圏の攻撃者が 48 か国の 996 台から設定、ネットワーク情報、root パスワードハッシュを窃取した。
- **NEW — EvilTokens:** Microsoft とパートナーは、1万超の組織で 12,000 超のメールボックス侵害に関与したフィッシングサービスを妨害した。50 サイトを差し押さえ、関連する 150 超のドメインを停止した。
- **NEW — UTA0565:** Volexity は、既報の Chrome/Windows ゼロデイ連鎖を使う3組目の中国系アクターを確認した。9月3〜4日の活動ではアジアの政府機関などを偽サイトへ誘導し、新しいバックドア CLEANGULP を投入した。
- **NEW — Veeam Agent:** Arctic Wolf は CVE-2026-32996 の実悪用を報告した。ローカルの低権限ユーザーが昇格済みセッション識別子を再利用し、SYSTEM 権限でコマンドを実行できる。

## 優先対応

- **即時:** Zyxel GS1900 を CVE-2026-7273 修正済みファームウェアへ更新し、管理インターフェースを管理ネットワークに限定する。管理資格情報を変更し、設定や資格情報が過去に窃取されていないか確認する。
- **即時:** CVE-2026-32996 の影響を受ける Veeam Agent for Microsoft Windows 13 を更新する。共有端末、サーバー、管理者ワークステーションを優先する。
- **本日:** 業務上不要な device-code flow を Conditional Access で無効化する。EvilTokens の侵害が疑われる場合はサインインセッションを失効させ、悪意ある inbox rule と Microsoft Graph 活動を確認する。
- **本日:** Chrome/Chromium と Windows に CVE-2026-85046、CVE-2026-87491、CVE-2026-85880 の修正が適用されていることを確認し、UTA0565 の偽装ドメインと CLEANGULP の痕跡を検索する。

## 重点脅威

### Zyxel GS1900 CVE-2026-7273、情報窃取攻撃を受け KEV に追加

**Severity:** High  
**Status:** 実悪用確認 / CISA KEV  
**CVSS:** 8.8  
**CVE:** CVE-2026-7273  
**Affected:** 影響を受ける 2.90 系ファームウェアの Zyxel GS1900 シリーズ

CVE-2026-7273 は GS1900 の管理 CGI にあるスタックベースのバッファオーバーフローである。攻撃者は認証を必要としないが、LAN から管理インターフェースへ到達できる必要がある。細工した HTTP リクエストにより OS コマンドを実行できる。Zyxel は6月に修正版を公開し、CISA は9月21日に KEV へ追加した。連邦機関の修正期限は9月24日である。

GreyNoise のテレメトリに基づく公開情報では、攻撃は8月17日前後に始まり、48か国の 996 台に到達した。攻撃者は設定、ネットワーク情報、root パスワードハッシュを窃取した。侵害されたうち 564 台では工場出荷時の資格情報も残っていた。

#### 推奨対応

- GS1900 の各モデルに対応する Zyxel の修正版を適用し、再起動後に稼働中のバージョンを確認する。
- HTTP/HTTPS 管理を専用の管理ネットワークまたは VLAN に限定する。
- 管理資格情報を変更し、設定、管理ログ、外向き通信から過去の侵害痕跡を確認する。

#### Sources

- [Zyxel — CVE-2026-7273 security advisory](https://www.zyxel.com/global/en/support/security-advisories/zyxel-security-advisory-for-stack-based-buffer-overflow-vulnerability-in-gs1900-series-switches-06-16-2026)
- [CISA — Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-7273)
- [Help Net Security — 996 Zyxel switches compromised](https://www.helpnetsecurity.com/2026/09/22/zyxel-switches-cve-2026-7273-vulnerability-exploited/)

### EvilTokens、12,000 超のメールボックス侵害後に妨害

**Severity:** High  
**Status:** 攻撃活動を確認 / インフラを妨害済み  
**Affected:** Microsoft 365 の ID とメールボックス  
**Threat actor:** Storm-2992 / EvilTokens operators

Microsoft によると、EvilTokens は device-code phishing で認証トークンを取得し、2月以降、1万超の組織で 12,000 超のメールボックス侵害に関与した。侵害後の機能には、メールボックスの解析、財務・経営層の標的選定、inbox rule による持続化、BEC 詐欺の準備が含まれる。

Microsoft とパートナーは 50 サイトを差し押さえ、関連する 150 超のドメインを停止した。英国警察は9月11日、運営への関与が疑われる男性2人を逮捕した。インフラの停止だけでは、被害者アカウントから既に窃取されたトークンは無効にならない。

#### 推奨対応

- 業務で不要な device-code flow は Conditional Access で無効化し、必要な場合は専用デバイスアカウントだけを例外にする。
- 侵害が疑われる場合はサインインセッションを失効させ、inbox rule と Microsoft Graph 活動を調査する。即時封じ込めが必要ならアカウントを一時停止する。
- 支払先変更や異常な送金依頼は、別の信頼できる経路で確認する。

#### Sources

- [Microsoft Threat Intelligence — Unmasking EvilTokens](https://www.microsoft.com/en-us/security/blog/2026/09/22/unmasking-eviltokens-getting-to-the-root-of-device-code-phishing/)
- [Microsoft Digital Crimes Unit — Disrupting EvilTokens](https://blogs.microsoft.com/on-the-issues/2026/09/22/disrupting-eviltokens-the-ai-chatbot-built-for-cybercrime/)

### UTA0565、共有された Chrome/Windows ゼロデイ連鎖で CLEANGULP を投入

**Severity:** High  
**Status:** 9月3〜4日のゼロデイ悪用を確認 / 現在は修正済み  
**CVE:** CVE-2026-85046、CVE-2026-87491、CVE-2026-85880  
**Affected:** Google Chrome/Chromium、Microsoft Windows  
**Threat actor:** UTA0565  
**Malware:** CLEANGULP

Volexity は UTA0565 を、同じ exploit chain を使う3組目の中国系アクターとして確認した。攻撃は9月3〜4日に実施され、当時は関連脆弱性が未修正だった。攻撃者はメディアや NGO などを装う偽サイトを使い、アジアの政府機関を含む標的へ exploit chain を配信した。

最終ペイロードの CLEANGULP は新たに文書化されたバックドアで、コマンド実行、プロセス列挙、ファイル転送、追加ペイロード実行に対応する。Volexity は exploit component の重複から、中核キットが複数の中国系オペレーター間で共有・改変・実戦投入されたと評価している。この評価は各グループが同一組織であることを意味しない。

#### Indicators

- `thecovnresation[.]com` — CLEANGULP C2 / The Conversation のタイポスクワット
- `personclouds[.]com`
- `outsourcingwise[.]net`
- `halal-navi[.]net`
- `halaltak[.]net`
- `thecovnresation[.]net`
- `borneobulletins[.]top`

#### 推奨対応

- Chrome/Chromium と Windows のパッチレベルを確認し、3件すべての CVE が修正済みであることを確認する。
- DNS、プロキシ、エンドポイントのテレメトリで公開済み偽装ドメインと CLEANGULP の痕跡を検索する。
- 偽サイトへのアクセス履歴があれば、ドメイン遮断だけで終えず、exploit exposure としてエンドポイントを調査する。

#### Sources

- [Volexity — Mind the (Patch) Gap, Part 2](https://www.volexity.com/blog/2026/09/21/mind-the-patch-gap-part-2-fake-websites-used-to-deploy-chrome-windows-0-day-exploits/)

### Veeam Agent CVE-2026-32996、ローカル権限昇格に実悪用

**Severity:** High  
**Status:** Arctic Wolf が実悪用を報告  
**CVSS:** 7.3  
**CVE:** CVE-2026-32996  
**Affected:** Veeam Agent for Microsoft Windows 13.0.1.2067 およびそれ以前の 13.x build

Veeam Endpoint Backup service は、昇格済み管理者 principal をクライアントが制御できる session UID にキャッシュするが、その UID は要求ユーザーや接続に結び付けられていない。標準ユーザーは Veeam のログから有効な昇格済み UID を読み取り、`NT AUTHORITY\\SYSTEM` としてコマンドを実行できる。

悪用には既存のローカル foothold が必要であり、リモート初期侵入の脆弱性ではない。Arctic Wolf は実悪用を報告し、更新を推奨している。Veeam Backup & Replication 13.0.2.29 は Windows Agent を修正済み build 13.0.3.1220 へ更新する。

#### 推奨対応

- 影響を受ける Veeam Agent を更新し、修正後に実際の Agent build を確認する。
- 共有ローカルアクセス、特権ワークフロー、バックアップ管理権限、機密データを持つシステムを優先する。
- 更新までの間は対話型・ローカルアクセスを減らし、Veeam service から生成される異常な子プロセスを監視する。

#### Sources

- [Arctic Wolf — Active exploitation of CVE-2026-32996](https://arcticwolf.com/resources/blog/update-active-exploitation-cve-2026-32996-of-veeam-agent/)
- [Veeam — KB4852](https://www.veeam.com/kb4852)

## IOC サマリー

| Type | Indicator | Context |
| --- | --- | --- |
| Domain | `thecovnresation[.]com` | CLEANGULP C2 / typosquat |
| Domain | `personclouds[.]com` | UTA0565 infrastructure |
| Domain | `outsourcingwise[.]net` | UTA0565 assessed infrastructure |
| Domain | `halal-navi[.]net` | UTA0565 assessed infrastructure |
| Domain | `halaltak[.]net` | UTA0565 assessed infrastructure |
| Domain | `thecovnresation[.]net` | UTA0565 assessed infrastructure |
| Domain | `borneobulletins[.]top` | UTA0565 assessed infrastructure |

## 当日の観測

- Zyxel と Veeam では調査の前提が異なる。CVE-2026-7273 は管理 LAN 上の未認証攻撃者から到達できる一方、CVE-2026-32996 は既存のローカル低権限 foothold を必要とする。
- EvilTokens の token theft では、パスワード変更だけでは対処が完了しない。セッション失効、inbox rule の確認、侵害後活動の調査が必要になる。
- UTA0565 が使った脆弱性連鎖自体は既報である。今回追加された情報は3組目のアクター、標的、偽装インフラ、CLEANGULP ペイロードであり、新しい CVE 群の公開ではない。
