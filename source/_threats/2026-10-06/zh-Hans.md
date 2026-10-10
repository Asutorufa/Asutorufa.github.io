---
id: "2026-10-06"
title: "Threat Intelligence Daily · 2026-10-06"
date: "2026-10-06"
updated: "2026-10-10"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10 月 6 日保留 4 个事件：Chrome 155 发布 247 项安全修复，其中包含 4 个 Critical UAF；Veeam 修复 CVSS 9.4 的 Backup & Replication RCE；SonicWall 修复 4 项 SMA1000 漏洞，最高为 CVSS 10 SSRF；Google 还披露 .gh、.sl、.as registry 遭劫持后出现 DNS 篡改与未授权 HTTPS 证书。"
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 0
tags:
  - browser
  - backup
  - edge-device
  - vpn
  - dns
  - certificate
  - infrastructure
  - Chrome
  - Veeam
  - SonicWall
  - CVE-2026-106382
  - CVE-2025-64393
  - CVE-2026-102255
cves:
  - CVE-2025-64392
  - CVE-2025-64393
  - CVE-2026-102255
  - CVE-2026-102256
  - CVE-2026-102257
  - CVE-2026-102258
  - CVE-2026-106197
  - CVE-2026-106347
  - CVE-2026-106358
  - CVE-2026-106382
  - CVE-2026-93026
iocs: []
---

## 相比昨天

- **NEW — Chrome 155：**Google 发布 247 项安全修复，其中 Chromecast、Browser、Navigation、Track 各有一个 Critical use-after-free。
- **NEW — Veeam：**Backup & Replication 12.3.2 P4 修复 CVE-2025-64393，低权限 Backup Viewer 可通过 Mount Service 的不安全反序列化达到 RCE。
- **NEW — SonicWall SMA1000：**4 项漏洞获得修复，CVE-2026-102255 为 CVSS 10.0；SonicWall 明确表示没有在野利用证据。
- **NEW — ccTLD registry 劫持：**Google 披露第三方 .gh、.sl、.as registry 遭入侵，攻击者能够修改权威 DNS，并为 Google 及其他组织的域名取得未授权 HTTPS 证书。

## 优先行动

- **立即：**将企业 Chrome 推到 155.0.8059.39/.40 或更高版本，并确认终端已重启到修复 build。
- **立即：**Veeam Backup & Replication 12.x 升级到 12.3.2.4934，或迁移到受支持的 v13。
- **今日：**SonicWall SMA1000 升级到 12.4.3-03670、12.5.0-03082 或更高版本。
- **今日：**使用 .gh、.sl、.as 域名的组织检查 Certificate Transparency、DNS 历史和 CAA policy。

## 重点关注

### Chrome 155 修复 4 个 Critical use-after-free

**Severity:** Critical  
**Status:** Google release post 未报告 active exploitation  
**CVE:** CVE-2026-106197, CVE-2026-106347, CVE-2026-106358, CVE-2026-106382  
**Affected:** 155.0.8059.39/.40 之前的 Chrome desktop

10 月 6 日 stable update 共含 247 项安全修复。4 个 Critical 问题分别位于 Chromecast、Browser、Navigation 与 Track。Google 在大多数用户完成更新前仍限制部分 bug detail。

通过企业策略推送 stable update，并验证终端实际重启进入修复版本；只完成下载不代表漏洞已经退出运行中的 browser process。

#### Sources

- [Chrome Releases — Stable Channel Update for Desktop](https://chromereleases.googleblog.com/2026/10/stable-channel-update-for-desktop_086471744.html)

### Veeam CVE-2025-64393 可从 Backup Viewer 权限达到 RCE

**Severity:** Critical  
**Status:** Veeam 公告未确认在野利用  
**CVSS:** 9.4 (CVSS v4)  
**CVE:** CVE-2025-64393, CVE-2025-64392, CVE-2026-93026  
**Affected:** Veeam Backup & Replication 12.3.2.4854 及更早 v12 build

CVE-2025-64393 允许只有 Backup Viewer 权限的低权限用户，经 Mount Service 发送不可信数据并在 backup server 上执行代码。同一 P4 更新还修复两项其他漏洞。

升级到 12.3.2.4934 或更高版本。备份服务器属于高权限基础设施，补丁之外应同时收紧 console access 与角色分配。

#### Sources

- [Veeam — KB4934](https://www.veeam.com/kb4934)

### SonicWall SMA1000 修复集包含 CVSS 10 SSRF

**Severity:** Critical  
**Status:** SonicWall 明确表示没有在野利用证据  
**CVSS:** 10.0 for CVE-2026-102255  
**CVE:** CVE-2026-102255, CVE-2026-102256, CVE-2026-102257, CVE-2026-102258  
**Affected:** SMA1000 12.4.3-03526 及更早版本、12.5.0-02952 及更早版本

公告覆盖 SSRF、RCE、Zip Slip path traversal 和 stored XSS。厂商明确表示这些问题与其他 SonicWall 漏洞事件无关，且没有发现主动利用。

升级到 12.4.3-03670、12.5.0-03082 或更高版本。即使当前没有攻击活动，公网 access appliance 仍应与内部管理服务分段。

#### Sources

- [SonicWall — SNWLID-2026-0017](https://www.sonicwall.com/support/notices/kA1VN000002QP3G0AW)

## 其他重要动态

### ccTLD registry 遭劫持后出现未授权 DNS 与证书签发

**Severity:** High  
**Status:** 已确认基础设施事件  
**Affected:** registry 事件期间的 .gh、.sl、.as 域名

Google 表示攻击者侵入第三方 ccTLD registry，修改权威 DNS，并为多个 Google 与非 Google 域名取得未授权 HTTPS 证书。Google 自身系统没有被攻破；Chrome 通过 CRLSets 阻断受影响证书。

相关域名所有者应检查 CT log、权威 DNS 变更和 CAA。仅撤销证书不能解决 registry 层 DNS 控制权被篡改的问题。

#### Sources

- [Google Security Blog — Chrome's response to ccTLD registry hijacks](https://blog.google/security/chromes-response-to-recent-cctld-registry-hijacks/)

## 今日观察

- 10 月 6 日引用的厂商材料没有确认这三组漏洞已遭主动利用。
- ccTLD 事件发生在应用层以下，主机补丁无法修复 registry 或 DNS delegation 被劫持的问题。
