---
id: "2026-09-21"
title: "Threat Intelligence Daily · 2026-09-21"
date: "2026-09-21"
updated: "2026-09-21 23:00:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "Fortinet のテレメトリで Orkes Conductor の未認証 RCE の実悪用が確認された。Kaspersky は Group Policy を使いファイル暗号化なしで恐喝した製造業への侵入を報告し、Securonix は TASK#STOMP を文書窃取と遠隔コマンド実行を行う持続型 PowerShell バックドアと確認した。"
total: 3
critical: 1
high: 2
medium: 0
low: 0
exploited: 3
tags:
  - active-exploitation
  - remote-code-execution
  - Orkes-Conductor
  - ransomware
  - encryptionless-extortion
  - Group-Policy
  - TASK-STOMP
  - PowerShell
  - espionage
  - malware
  - CVE-2026-58138
cves:
  - CVE-2026-58138
iocs:
  - corecloudfileshare.xyz
  - attachmentsharingdrive.xyz
  - 5251098838fab2f3192307cac99ad2d3a71b55ba1f256412d43a9dfb3b93ac58
  - 103b4d4a666bc0a89c10c9df55f54f4be5fa111e8429c37ae14fa8f16cb50fe8
  - 02ba7c982b68ec8f5a1cb47c6f3969f3f2f38ea9b4ebb8833d1b8b0ba2ab1407
---

## 昨日からの変化

- **NEW — Orkes Conductor:** Fortinet のテレメトリで CVE-2026-58138 の実悪用が確認された。認証前にアクセスできる workflow API の脆弱性により、影響を受ける Conductor サーバー上で OS コマンドを実行できる。
- **NEW — Payload:** Kaspersky は中東の製造企業で発生した侵入を報告した。攻撃者はデータ窃取後、悪意ある Group Policy Object でローカル管理者を無効化し、身代金要求を表示した。従来型のファイル暗号化プログラムは使われていない。
- **NEW — TASK#STOMP:** Securonix が最終 PowerShell payload をデコードし、業務文書の自動窃取、継続的なファイル監視、Wi-Fi パスワードとクリップボードの収集、スクリーンショット、2 つの C2 ドメイン経由の任意コマンド実行を確認した。
- **ONGOING — Linux KEV:** 9 月 21 日は CVE-2025-39682、CVE-2026-53266、CVE-2025-39964 に対する CISA の修復期限。3 件は 9 月 19 日版で報告済みで、公開情報には攻撃者や共通 exploit chain の情報はない。

## 優先対応

- **Immediate:** インターネットから到達可能な Orkes Conductor を 3.30.2 以降へ更新する。直ちに更新できない場合は workflow API の外部公開を止め、過去の workflow 投稿と異常な子プロセス実行を調査する。
- **Immediate:** Windows 端末で `%LOCALAPPDATA%\WinDefendSvc`、hidden PowerShell から `csc.exe` へ続くプロセス、2 つの C2 ドメイン、`wscript.exe` による複数の XML scheduled task 作成を検索する。
- **Today:** Active Directory の Group Policy 作成・変更を監査し、ローカル管理者の無効化、desktop/lock screen の変更、script や task の一括配布を検出する。GPO 管理には分離した特権アカウントを使い、変更履歴を保存する。
- **Today:** 9 月 21 日が CISA の期限となっている 3 件の Linux kernel KEV について、修復と修復前テレメトリの確認を完了する。

## 重点脅威

### Orkes Conductor の未認証 RCE が実悪用されている

**Severity:** Critical  
**Status:** Confirmed active exploitation  
**CVSS:** 9.8 (v3.1) / 9.3 (v4)  
**CVE:** CVE-2026-58138  
**Affected:** Orkes Conductor 3.21.21 以上 3.30.2 未満

CVE-2026-58138 では、未認証のリモートクライアントが悪意ある JavaScript または Python 式を含む workflow 定義を送信できる。影響を受ける GraalVM evaluator は host access を制限しておらず、その式から Conductor プロセス権限で OS コマンドを実行できる。

Fortinet は 9 月 9 日までの 24 時間に 1,290 件、9 月 2 日から 9 日までに約 7,000 件の攻撃試行をブロックしたと報告した。同じ公開報告が引用する独立 honeypot では、7 月 24 日まで遡る exploit attempt が観測されている。修正版は Conductor 3.30.2。

#### 対応

- Conductor 3.30.2 以降へ更新し、container や古い replica を含め実際に稼働中の version を確認する。
- 更新までの間、workflow API は信頼済み network または認証 gateway からだけ到達可能にする。
- INLINE、LAMBDA、DO_WHILE、SWITCH task 内の不審な JavaScript/Python 式を検索し、Conductor の異常な子プロセスや外向き通信と突き合わせる。

#### Sources

- [The Hacker News — Critical Pre-Auth RCE in Orkes Conductor Exploited in the Wild](https://thehackernews.com/2026/09/critical-pre-auth-rce-in-orkes.html)

### Payload は Group Policy で暗号化なしの恐喝を実行

**Severity:** High  
**Status:** Confirmed intrusion and extortion incident  
**Affected:** 攻撃者が Group Policy の変更権限を得た Windows / Active Directory 環境

Kaspersky Global Emergency Response Team は、中東の製造企業で発生したインシデントを報告した。攻撃者は企業データを窃取した後、`PAYLOAD` という悪意ある Group Policy Object を作成し、ローカル管理者アカウントを無効化して desktop と lock screen に身代金要求を表示した。このインシデントでは従来型のファイル暗号化 payload は確認されていない。

窃取されたデータはその後 dark web に公開された。攻撃の前提は Active Directory の制御権であり、悪意ある Group Policy が残っていれば endpoint 上のファイルだけを削除しても設定の配布は止まらない。

#### 対応

- 特権 Group Policy の変更を監査し、ローカル管理者、desktop/lock screen、startup script、scheduled task、security control を多数の host で変更する policy を検出する。
- GPO の変更権限を専用の管理 identity に限定し、そのアカウントに強固な認証を適用する。
- 対応時は domain controller と Group Policy の監査ログを保存した上で、policy の配布元から悪意ある設定を除去し、その後 endpoint を復旧する。

#### Sources

- [Kaspersky — Payload ransomware uses encryptionless extortion](https://www.kaspersky.com/about/press-releases/kaspersky-uncovers-new-payload-the-stealth-ransomware-that-hijacks-corporate-devices-without-encrypting-files)

### TASK#STOMP は文書を継続窃取し、二重の PowerShell C2 を維持

**Severity:** High  
**Status:** Windows 端末で malware を確認、campaign 規模は不明  
**Affected:** 回収された VBS / PowerShell chain を実行した Windows endpoint  
**Malware:** TASK#STOMP

Securonix は 1 台の感染端末を分析し、2 つの Base64 payload をデコードした。chain は 4 つの XML scheduled task を作成し、`msdiag.vbs` を user Startup folder に配置し、staged file の timestamp を過去日に変更する。その後 2 つの hidden PowerShell module を起動し、小さな C# helper を runtime compile する。デコードされた payload は固定 disk の業務文書を検索し、新規・更新ファイルを継続監視するほか、保存済み Wi-Fi password、clipboard、screenshot を収集し、任意の PowerShell command を実行する。

両 module は `corecloudfileshare[.]xyz` と `attachmentsharingdrive[.]xyz` を利用し、自動 failover と固定 authentication token を持つ。Securonix は既知 actor への attribution を行っておらず、initial access も未確認としている。このため、観測された IranTenders URL の domain 全体を malicious IOC には含めていない。

#### Indicators

- `corecloudfileshare[.]xyz`
- `attachmentsharingdrive[.]xyz`
- `5251098838fab2f3192307cac99ad2d3a71b55ba1f256412d43a9dfb3b93ac58` — VBS launcher
- `103b4d4a666bc0a89c10c9df55f54f4be5fa111e8429c37ae14fa8f16cb50fe8` — `sys_loader.ps1`
- `02ba7c982b68ec8f5a1cb47c6f3969f3f2f38ea9b4ebb8833d1b8b0ba2ab1407` — `diag_pack.dat`

#### 対応

- `wscript.exe` による複数 XML scheduled task の作成、AppData からの hidden PowerShell、続く `csc.exe` / `cvtres.exe` を相関して検出する。
- 2 つの C2 domain をブロックし、proxy/DNS telemetry を遡って検索する。
- containment では scheduled task、Startup copy、staged file をまとめて除去する。再起動後に `msdiag.vbs`、`sys_loader.ps1`、`win_conn.ps1` が復活しないことを確認する。

#### Sources

- [Securonix — TASK#STOMP: PowerShell Backdoor for Document Theft and Remote Access](https://www.securonix.com/blog/task-stomp-powershell-backdoor-document-theft-remote-access/)

## IOC サマリー

| 種別 | Indicator | Context |
| --- | --- | --- |
| Domain | `corecloudfileshare[.]xyz` | TASK#STOMP primary C2 |
| Domain | `attachmentsharingdrive[.]xyz` | TASK#STOMP backup C2 |
| SHA256 | `5251098838fab2f3192307cac99ad2d3a71b55ba1f256412d43a9dfb3b93ac58` | VBS launcher / `msdiag.vbs` |
| SHA256 | `103b4d4a666bc0a89c10c9df55f54f4be5fa111e8429c37ae14fa8f16cb50fe8` | `sys_loader.ps1` |
| SHA256 | `02ba7c982b68ec8f5a1cb47c6f3969f3f2f38ea9b4ebb8833d1b8b0ba2ab1407` | `diag_pack.dat` |

## Daily observations

- 3 件とも悪意ある活動が観測されているが、「脆弱性の実悪用」が確認されているのは Orkes のみ。Payload と TASK#STOMP は intrusion / malware activity として扱う。
- Orkes workflow と Active Directory Group Policy はどちらも管理 control plane にある。incident response では endpoint artifact と server-side configuration の両方を除去する必要がある。
- TASK#STOMP の initial access と campaign 規模は未確認。公開済み infrastructure と behavior は hunting に利用できるが、actor attribution や標的業種は補完しない。
