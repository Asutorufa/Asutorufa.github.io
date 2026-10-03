---
id: "2026-09-26"
title: "Threat Intelligence Daily · 2026-09-26"
date: "2026-09-26"
updated: "2026-10-03 03:20:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "9 月 26 日相对安静，但仍有 3 个需要记录的事件：京王プラザホテル确认勒索软件导致系统故障；Mini Shai-Hulud 相关 GitHub Actions 在重新启用后再次被禁用；Kiteworks 根据联邦情报建议客户执行 9 小时预防性停机，当时没有确认失陷。"
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

## 相比昨天

- **NEW — 京王プラザホテル：**酒店确认 9 月 26 日凌晨服务器遭勒索软件攻击，并在调查期间阻断外部网络。
- **UPDATED — Mini Shai-Hulud：**Socket 披露两项曾遭入侵的 `actions-cool` GitHub Actions 在恶意 tag 仍存在时被重新启用；GitHub 已于 9 月 25 日再次禁用两者。
- **NEW — Kiteworks：**收到联邦机构的可信威胁情报后，Kiteworks 建议执行 9 小时预防性停机；公告发布时没有确认任何系统已失陷。

## 优先行动

- **立即：**使用过 `actions-cool/issues-helper` 或 `actions-cool/maintain-one-comment` 相关受影响 tag 的仓库，应回查 workflow 历史和可访问 secret，不能只以 action 已被禁用作为处置完成依据。
- **今日：**与京王プラザホテル存在系统集成的合作方应关注服务中断与后续调查结果；在官方确认前，不把系统故障直接表述为客户数据泄露。
- **今日：**Kiteworks 自托管客户按厂商停机/恢复指导执行，并确认当前版本与 9.5.1 或后续安全指导一致。

## 重点关注

### 京王プラザホテル确认遭勒索软件攻击

**Severity:** High  
**Status:** Confirmed ransomware incident  
**Affected:** 京王プラザホテル服务器环境

酒店确认 9 月 26 日凌晨勒索软件攻击导致系统故障，并立即阻断外部网络，与京王集团、警方和外部专家一起调查攻击路径与影响范围。部分系统出现故障，但酒店运营没有停止。公告发布时尚未确认信息泄露。

现有证据可以确认 ransomware incident，但不能确认 data breach。后续报道应继续区分这两个结论。

#### Sources

- [京王プラザホテル — ランサムウェア攻撃によるシステム障害](https://www.keioplaza.co.jp/news/45681/)

### Mini Shai-Hulud 通过重新启用的 GitHub Actions 再次暴露下游

**Severity:** High  
**Status:** Confirmed malicious supply-chain exposure / contained update  
**Affected:** 引用 `actions-cool/issues-helper` 或 `actions-cool/maintain-one-comment` 恶意 tag 的仓库

Socket 披露，两项在早前 Mini Shai-Hulud 活动中遭入侵的 GitHub Actions 于 9 月 16 日被重新启用，而恶意 tag 并未清理，导致下游 workflow 再次暴露。两项 action 于 9 月 25 日再次被禁用。

需要回查重新启用期间的 workflow run，确认 job 能访问哪些 secret；若恶意 action 实际执行，应轮换对应凭据。

#### Sources

- [Socket — Re-Enabled GitHub Actions Expose Thousands of Repositories to Mini Shai-Hulud](https://www.socket.dev/blog/mini-shai-hulud-actions)

### Kiteworks 根据联邦威胁情报建议预防性停机

**Severity:** High  
**Status:** Preventive action; 9 月 26 日尚无确认失陷  
**Affected:** 公告覆盖的 Kiteworks 自托管与厂商托管系统

Kiteworks 在收到联邦情报机构的可信威胁信息后建议客户执行 9 小时停机窗口。公司表示当时的 9.5.1 已处理所有已知漏洞，并且没有迹象表明 Kiteworks 或客户系统已遭入侵。

因此这里记录的是预防性事件，而不是已确认 breach。

#### Sources

- [Kiteworks — Precautionary Shutdown Advisory](https://www.kiteworks.com/company/press-releases/kiteworks-precautionary-shutdown-advisory/)

## 今日观察

- 「攻击入口已被禁用」不等于历史风险消失。GitHub Actions 事件仍需要回查此前运行记录和 secret exposure。
- 京王与 Kiteworks 公告都明确区分了运营影响和已确认数据泄露，日报也应保持相同证据边界。
