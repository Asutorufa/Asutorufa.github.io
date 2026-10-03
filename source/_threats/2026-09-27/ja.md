---
id: "2026-09-27"
title: "Threat Intelligence Daily · 2026-09-27"
date: "2026-09-27"
updated: "2026-10-03 03:30:00"
language: ja
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "9月27日は2件の状態変化が中心となった。CitrixはNetScalerの2件のゼロデイを公開し、未緩和環境での悪用を確認した。Kiteworksは予防停止の推奨を解除し、この時点でも顧客環境の侵害は確認していない。"
total: 2
critical: 1
high: 0
medium: 1
low: 0
exploited: 1
tags:
  - active-exploitation
  - zero-day
  - edge-device
  - vpn
  - NetScaler
  - Citrix
  - Kiteworks
  - CVE-2026-88771
  - CVE-2026-88772
cves:
  - CVE-2026-88771
  - CVE-2026-88772
iocs: []
---

## 昨日からの変化

- **NEW — Citrix NetScaler:** CVE-2026-88771とCVE-2026-88772が公開され、未緩和のNetScalerで悪用が確認された。
- **UPDATED — Kiteworks:** 9月27日に停止推奨が解除され、ホスト環境は復旧した。侵害を示す証拠は引き続き確認されていない。

## 優先対応

- **直ちに:** NetScaler ADC/Gatewayを14.1-73.37、13.1-64.23、または該当するFIPS/NDcPP修正版へ更新する。
- **直ちに:** 以前インターネット公開されていたNetScalerはincident response対象として扱う。patchは既存のpersistenceを削除しない。
- **本日:** Kiteworksはベンダー手順に従って復旧し、予防停止期間前後のログを保持する。

## 重点脅威

### NetScaler CVE-2026-88771 / CVE-2026-88772は公開前から悪用

**Severity:** Critical  
**Status:** Confirmed active exploitation / zero-day activity  
**CVSS:** 両CVEともv4 9.5  
**CVE:** CVE-2026-88771, CVE-2026-88772  
**Affected:** 顧客管理のNetScaler ADC / NetScaler Gateway

CVE-2026-88771は入力検証不備による未認証command executionで、デフォルト構成も影響を受ける。CVE-2026-88772はDTLS有効時にRCEまたはDoSにつながるmemory overflowで、VPN vServerではDTLSがデフォルトで有効。Citrixは未緩和環境で両方のexploitを確認している。

修正版へ更新し、cleanup前にapplianceログを保存する。web root、認証経路、外向き通信からweb shellやpersistenceを確認する。

#### Sources

- [Citrix — CTX697096 NetScaler security bulletin](https://support.citrix.com/external/article/CTX697096)

## その他の注目事項

### Kiteworksが予防停止の推奨を解除

**Severity:** Medium  
**Status:** Preventive response update; 侵害確認なし  
**Affected:** 9月25日の勧告対象Kiteworks環境

Kiteworksは9月27日に全顧客への停止推奨を解除し、ホスト環境を通常運用へ戻した。侵害は確認していない。

復旧後も脅威期間のログを保持する。ベンダーが確認していないbreachを推測で追加しない。

#### Sources

- [Kiteworks — Precautionary Shutdown Advisory](https://www.kiteworks.com/company/press-releases/kiteworks-precautionary-shutdown-advisory/)

## 本日の所見

- NetScalerはpatchだけでなく侵害確認が必要なケースになった。公開前悪用が確認されているためである。
- Kiteworksは予防停止から復旧へ状態が変わった。状態変化は運用判断を変えるため日報に残す。
