---
id: "2026-09-26"
title: "Threat Intelligence Daily · 2026-09-26"
date: "2026-09-26"
updated: "2026-10-03 03:20:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "9月26日は比較的静かな日だったが、3件を記録した。京王プラザホテルはランサムウェアによるシステム障害を確認し、Mini Shai-Hulud関連のGitHub Actionsは再有効化後に再び無効化された。Kiteworksは連邦当局の脅威情報を受け9時間の予防停止を推奨し、この時点では侵害を確認していなかった。"
total: 3
critical: 0
high: 3
medium: 0
low: 0
exploited: 2
tags:
  - ransomware
  - supply-chain
  - github-actions
  - cloud-security
  - Keio-Plaza-Hotel
  - Mini-Shai-Hulud
  - Kiteworks
cves: []
iocs: []
---

## 昨日からの変化

- **NEW — 京王プラザホテル:** 9月26日未明にサーバーへのランサムウェア攻撃を確認し、調査のため外部ネットワークを遮断した。
- **UPDATED — Mini Shai-Hulud:** 以前侵害された`actions-cool`の2つのGitHub Actionsが、悪意あるtagを残したまま再有効化されていた。GitHubは9月25日に再び無効化した。
- **NEW — Kiteworks:** 連邦情報当局からの信頼できる脅威情報を受け、9時間の予防停止を推奨した。発表時点で侵害を示す証拠はないとしていた。

## 優先対応

- **直ちに:** `actions-cool/issues-helper`または`actions-cool/maintain-one-comment`の影響tagを参照したリポジトリは、workflow履歴とsecret exposureを確認する。
- **本日:** 京王プラザホテルとのシステム連携がある組織は、サービス影響と調査結果を追う。公式確認がない段階で顧客情報流出と断定しない。
- **本日:** Kiteworksのセルフホスト環境はベンダーの停止・復旧手順に従い、9.5.1または最新の安全なガイダンスへ合わせる。

## 重点脅威

### 京王プラザホテルがランサムウェア攻撃を確認

**Severity:** High  
**Status:** Confirmed ransomware incident  
**Affected:** 京王プラザホテルのサーバー環境

9月26日未明、ランサムウェア攻撃によるシステム障害を確認した。外部ネットワークを遮断し、京王電鉄、警察、外部専門家と攻撃経路と影響を調査している。一部システムに障害がある一方、ホテル営業への影響はないとしている。発表時点で情報流出は確認されていない。

確認できるのはransomware incidentであり、data breachではない。この区別は調査結果が出るまで維持する。

#### Sources

- [京王プラザホテル — ランサムウェア攻撃によるシステム障害](https://www.keioplaza.co.jp/news/45681/)

### Mini Shai-Huludが再有効化GitHub Actionsから再露出

**Severity:** High  
**Status:** Confirmed malicious supply-chain exposure / contained update  
**Affected:** `actions-cool/issues-helper`または`actions-cool/maintain-one-comment`の悪意あるtagを参照したリポジトリ

Socketによると、以前のMini Shai-Huludで侵害された2つのGitHub Actionsが9月16日に再有効化された際、悪意あるtagが残っていた。GitHubは9月25日に再度無効化した。

再有効化期間のworkflow runを確認し、jobからアクセス可能だったsecretを洗い出す。悪意あるactionが実行された場合はcredentialをローテーションする。

#### Sources

- [Socket — Re-Enabled GitHub Actions Expose Thousands of Repositories to Mini Shai-Hulud](https://www.socket.dev/blog/mini-shai-hulud-actions)

### Kiteworksが連邦脅威情報を受け予防停止を推奨

**Severity:** High  
**Status:** Preventive action; 9月26日時点で侵害確認なし  
**Affected:** 勧告対象のKiteworksセルフホスト・ベンダーホスト環境

Kiteworksは連邦情報当局からの信頼できる脅威情報を受け、9時間の予防停止を推奨した。9.5.1で既知の脆弱性は対応済みで、Kiteworksまたは顧客環境の侵害を示す兆候はないとしている。

この時点ではbreachではなくpreventive actionとして扱う。

#### Sources

- [Kiteworks — Precautionary Shutdown Advisory](https://www.kiteworks.com/company/press-releases/kiteworks-precautionary-shutdown-advisory/)

## 本日の所見

- 攻撃経路が無効化されても、過去のworkflow実行でcredentialが露出した可能性は残る。GitHub Actions事例では履歴確認が必要になる。
- 京王とKiteworksはいずれも運用影響と情報漏えい確認を分けて公表している。日報でも同じ証拠境界を維持する。
