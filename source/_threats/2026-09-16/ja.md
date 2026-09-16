---
id: "2026-09-16"
title: "Threat Intelligence Daily · 2026-09-16"
date: "2026-09-16"
updated: "2026-09-16 23:00:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "Google の9月 Pixel Bulletin は CVE-2026-58704 が限定的な標的型攻撃で悪用されている可能性を確認した。英国 NCSC、米 FBI、オランダ AIVD はイラン関連の CHOSEN BRICK スパイウェアの技術情報を公開し、Kaspersky は窃取 VPN 認証情報、GhostContainer、RDP トンネル、BlueKeep を使う NightEagle のロシア企業侵害を報告した。OPSWAT は修正済みの TP-Link Tapo C200 脆弱性2件も詳報した。"
total: 4
critical: 0
high: 4
medium: 0
low: 0
exploited: 3
tags:
  - active-exploitation
  - zero-day
  - mobile-security
  - cyber-espionage
  - spyware
  - apt
  - credential-theft
  - remote-access
  - iot
  - Google-Pixel
  - CHOSEN-BRICK
  - NightEagle
  - GhostContainer
  - TP-Link
  - CVE-2019-0708
  - CVE-2026-15315
  - CVE-2026-15316
  - CVE-2026-58704
cves:
  - CVE-2019-0708
  - CVE-2026-15315
  - CVE-2026-15316
  - CVE-2026-58704
iocs:
  - smdqservice.exe
  - winappx.exe
  - 1dcafb7f8448683281106b06dd22409a
  - 1f3034b706c78b35d8e34044e68c693a
---

## 昨日からの変化

- **NEW — Pixel の標的型悪用:** Google の9月 Pixel Bulletin は CVE-2026-58704 が限定的な標的型攻撃で悪用されている可能性を示した。
- **NEW — CHOSEN BRICK アドバイザリ:** 英国 NCSC、米 FBI、オランダ AIVD が、反体制派、活動家、ジャーナリストを狙うイラン関連 Windows スパイウェア活動の技術情報を公開した。
- **NEW — NightEagle のロシア侵害:** Kaspersky は、窃取 VPN 認証情報、Exchange 上の GhostContainer、トンネル、Active Directory/RDP 悪用を伴うロシア企業への侵害を報告した。
- **NEW — Tapo C200 詳細公開:** OPSWAT がネットワーク隣接型の脆弱性2件を詳報した。TP-Link は V5_1.4.6 で修正済み。

## 優先対応

- **即時:** 対応 Pixel をセキュリティパッチレベル 2026-09-05 以降へ更新する。標的型監視の対象になり得る利用者を優先する。
- **本日:** イランによる標的型監視のリスクが高い利用者について、Windows の CHOSEN BRICK 永続化と不審な Telegram/クラウドオブジェクトストレージ通信を確認する。機微な業務に使う個人端末も対象に含める。
- **本日:** Exchange/VPN 環境で NightEagle の痕跡、不審な `devtunnels.ms` 利用、`rdp2tcp` RDP チャネル、DCSync、予期しない特権アカウント作成を調査する。
- **本日:** TP-Link Tapo C200 v5 を V5_1.4.6 以降へ更新し、ローカル管理画面を信頼できないネットワークへ公開しない。

## 重点脅威

### Pixel CVE-2026-58704 は限定的な標的型攻撃で悪用されている

**Severity:** High  
**Status:** 限定的な標的型悪用を確認  
**CVE:** CVE-2026-58704  
**Affected:** セキュリティパッチレベル 2026-09-05 未満の対応 Google Pixel

Google は CVE-2026-58704 を Pixel の Modem コンポーネントにある High の権限昇格脆弱性として掲載し、限定的な標的型悪用の兆候があるとしている。攻撃者、標的層、完全な攻撃チェーンは公開されていない。

#### 対応

9月の Pixel 更新を適用し、セキュリティパッチレベルが 2026-09-05 以降であることを確認する。高リスク利用者では、公開 PoC を待たず Google の悪用確認を基準に更新を優先する。

#### Sources

- [Google — Pixel Update Bulletin, September 2026](https://source.android.com/docs/security/bulletin/pixel/2026/2026-09-01)

### CHOSEN BRICK：標的に合わせたソーシャルエンジニアリングで配布されるイラン関連スパイウェア

**Severity:** High  
**Status:** 攻撃活動を確認 / 政府機関による帰属  
**Threat actor:** Iranian state cyber actors  
**Malware:** CHOSEN BRICK  
**Affected:** 反体制派、活動家、ジャーナリストなど、標的となった Windows 利用者

NCSC、FBI、AIVD によると、攻撃者は WhatsApp や Telegram などで標的との信頼関係を作った後、相手に合わせたファイルを送る。確認された誘導には偽ソフトウェアや MRI 検査結果が含まれる。CHOSEN BRICK は現在ユーザーの Run key で永続化し、Microsoft Defender の除外設定を追加でき、Telegram を C2 に使う。スクリーンショット、マイク録音、メールやブラウザ上のメッセージデータ窃取、追加ペイロード配布、ファイル削除の機能が確認されている。

#### 対応

- 未確認のメッセージ経由で送られたソフトウェアやファイルを実行せず、アプリは公式配布元から取得する。
- 標的型監視の可能性が高い利用者にはフィッシング耐性 MFA と管理対象端末の制御を適用する。
- 不審な Run-key エントリと CHOSEN BRICK の痕跡を調査する。職務上標的になり得る利用者では個人端末も確認する。

#### IOC

- `smdqservice.exe` — 悪意ある Run-key 永続化で確認されたファイル名。
- `winappx.exe` — 悪意ある Run-key 永続化で確認されたファイル名。

#### Sources

- [UK NCSC — Iranian cyber targeting of dissidents, activists and journalists](https://www.ncsc.gov.uk/news/iranian-cyber-targeting-of-dissidents-activists-journalists)
- [UK NCSC — joint advisory announcement](https://www.ncsc.gov.uk/news/uk-allies-expose-spyware-iranian-state-actors-dissidents-activists-journalists)

### NightEagle は GhostContainer、正規トンネル、RDP で内部アクセスを維持

**Severity:** High  
**Status:** APT 攻撃活動を確認  
**CVE:** CVE-2019-0708  
**Threat actor:** NightEagle / APT-Q-95  
**Malware:** GhostContainer  
**Affected:** Kaspersky が確認したロシア企業。Microsoft Exchange、VPN、RDP、Active Directory が攻撃チェーンの中心

Kaspersky GERT が調査した多くの事例では、窃取された VPN 認証情報が侵入口だった。攻撃者は Exchange に .NET バックドア GhostContainer を配置し、偽装した GitHub リポジトリにトンネル用ツールを置き、Microsoft dev tunnels と `rdp2tcp` を併用した。ある事例では BlueKeep（CVE-2019-0708）を悪用して管理者アカウントを作成し、その後 Kerberos と DCSync に関連する活動を行ってドメイン侵害を進めた。

#### 対応

- VPN ログイン元を確認し、認証情報侵害が疑われる場合は該当資格情報をローテーションする。
- 不審な `devtunnels.ms` 通信、RDP イベント 132/148 の `rdp2tcp` またはランダムなチャネル名、Impacket `atexec`、DCSync、`netsh interface portproxy` の変更を調査する。
- サポート終了または未修正の RDP システムを撤去する。古いシステムが信頼ネットワーク内に残っている場合、BlueKeep は横展開に利用できる。

#### IOC

- `1dcafb7f8448683281106b06dd22409a` — MD5、`AdobeSync.exe`。
- `1f3034b706c78b35d8e34044e68c693a` — MD5、`adobe_32.exe`。

#### Sources

- [Kaspersky Securelist — NightEagle targets Russian companies](https://securelist.com/tr/nighteagle-apt-ghostcontainer-and-tunneling/121323/)

## 重要な脆弱性

### TP-Link Tapo C200：ローカルネットワークでの認証リプレイと DoS

**Severity:** High  
**Status:** 修正済み / 悪用確認なし  
**CVE:** CVE-2026-15315, CVE-2026-15316  
**Affected:** V5_1.4.6 未満の TP-Link Tapo C200 v5

OPSWAT によると、CVE-2026-15315 はローカル管理認証のリプレイ問題で、ネットワーク上の未認証攻撃者が有効な管理者セッションを取得できる。CVE-2026-15316 は過大な暗号化設定値によって HTTPS サービスをクラッシュまたは再起動させる。いずれもカメラへのネットワークアクセスが必要で、TP-Link は8月18日に V5_1.4.6 を公開した。

#### 対応

V5_1.4.6 以降へ更新する。カメラの管理画面を信頼できないネットワークへ公開せず、業務環境ではカメラを機微なシステムからネットワーク分離する。

#### Sources

- [OPSWAT — TP-Link Tapo カメラの認証バイパスおよび DoS 脆弱性](https://japanese.opswat.com/blog/authentication-bypass-and-dos-vulnerabilities-opswat-discovers-cve-2026-15315-cve-2026-15316-in-tp-link-tapo-cameras)

## 本日の所見

- Pixel Bulletin は悪用を確認しているが、攻撃活動の背景は公開していない。更新優先度は Google の確認に基づける一方、帰属は現時点の情報から判断できない。
- CHOSEN BRICK と NightEagle はどちらも攻撃チェーンに正規サービスを組み込んでいる。ドメイン遮断だけでなく、端末とアイデンティティの文脈を含む検知が必要になる。
- Tapo の2件はネットワーク隣接型で、修正版も公開済み。対応順は CVSS 単独より、管理面の露出とネットワーク分離状況で決める方が実態に合う。
