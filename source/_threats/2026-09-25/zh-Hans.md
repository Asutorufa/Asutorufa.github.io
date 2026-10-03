---
id: "2026-09-25"
title: "Threat Intelligence Daily · 2026-09-25"
date: "2026-09-25"
updated: "2026-10-03 03:20:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "9 月 25 日保留 5 个事件：SharePoint CVE-2026-65660 与 MikroTik CVE-2026-67279 进入已利用队列；WordPress CVE-2026-87902 正式进入 CISA KEV；Microsoft 披露 Storm-3168 在 Azure 中的破坏性操作；JVN 发布 baserCMS 与 BcAddonMigrator 修复。"
total: 5
critical: 1
high: 3
medium: 1
low: 0
exploited: 4
tags:
  - active-exploitation
  - cisa-kev
  - cloud
  - identity
  - destructive-attack
  - wordpress
  - sharepoint
  - mikrotik
  - baserCMS
  - Storm-3168
  - CVE-2026-65660
  - CVE-2026-67279
  - CVE-2026-87902
  - CVE-2026-97150
cves:
  - CVE-2026-62956
  - CVE-2026-65660
  - CVE-2026-67279
  - CVE-2026-87902
  - CVE-2026-93460
  - CVE-2026-93462
  - CVE-2026-93463
  - CVE-2026-93464
  - CVE-2026-97150
iocs:
  - 45.131.66.106
  - 34.153.223.102
  - 64.20.53.230
---

## 相比昨天

- **NEW — SharePoint：**Microsoft 已获得 CVE-2026-65660 遭攻击的可靠证据，CISA 将该 SharePoint code injection 漏洞加入 KEV。
- **NEW — MikroTik：**CISA 将 CVE-2026-67279 加入 KEV；该 SSH 状态机缺陷可与 CVE-2026-86060 组合。
- **NEW — Storm-3168：**Microsoft 披露遭入侵的 Azure service principal 在 35 分钟内执行 150 多次破坏或凭据访问操作。
- **UPDATED — WordPress：**CVE-2026-87902 从「已有利用报告」升级为 CISA KEV。
- **NEW — baserCMS：**JVN 发布 baserCMS core 5 项 CVE 与 BcAddonMigrator CVE-2026-97150 的修复信息。

## 优先行动

- **立即：**修补受 CVE-2026-65660 影响的 SharePoint，并对公网服务器做失陷排查。
- **立即：**升级 MikroTik RouterOS，检查异常 SSH session、文件与高权限账户变更。
- **立即：**确认公网 WordPress 已升级到 7.1.2 或更高版本，并回查补丁前满足利用条件的站点。
- **今日：**轮换曾暴露在源码、issue 或日志中的 Azure workload identity secret，并检查批量删除、ListKeys 与 recovery lock 变更。
- **今日：**更新已部署的 baserCMS 与 BcAddonMigrator。

## 重点关注

### SharePoint CVE-2026-65660 已遭利用

**Severity:** High  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 8.8  
**CVE:** CVE-2026-65660  
**Affected:** Microsoft 2026 年 8 月安全更新覆盖的 SharePoint Server 版本

该 code injection 漏洞允许低权限认证用户在无需额外交互的情况下执行代码。Microsoft 更新公告时加入了已观察到攻击的可靠证据，CISA 随后在 9 月 25 日加入 KEV。

安装 Microsoft 安全更新，并检查 SharePoint application pool 异常执行、web shell 和认证后的异常活动。

#### Sources

- [Microsoft MSRC — CVE-2026-65660](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-65660)
- [CISA — CVE-2026-65660 KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-65660)

### MikroTik CVE-2026-67279 补齐 RouterOS 利用链

**Severity:** Medium  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 6.5 (v3), 6.9 (v4)  
**CVE:** CVE-2026-67279  
**Affected:** RouterOS 6.49.21、7.23.4、7.24.2 等修复版本之前的分支

未认证客户端可以让 SSH session 进入本应完成认证后才能到达的状态，并发送 exec request。该漏洞可与此前已遭利用的 CVE-2026-86060 组合。CISA 于 9 月 25 日将 CVE-2026-67279 加入 KEV。

升级 RouterOS，并检查管理面日志、未知文件和高权限账户变更。单看 CVSS 不能反映完整 exploit chain 的风险。

#### Sources

- [Canadian Centre for Cyber Security — MikroTik AV26-887 Update 2](https://www.cyber.gc.ca/en/alerts-advisories/mikrotik-security-advisory-av26-887)
- [CISA — CVE-2026-67279 KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-67279)

### Storm-3168 使用受控 service principal 快速破坏 Azure 资源

**Severity:** High  
**Status:** Confirmed destructive cloud intrusion  
**Threat actor:** Storm-3168 / JADEPUFFER  
**Affected:** workload identity 已泄露或被接管的 Azure 环境

Microsoft 在同一 tenant 中观察到两个被接管的 service principal。一个负责枚举，另一个在 35 分钟内执行 150 多次删除或凭据访问相关操作，其中包括 100 多次 storage account 删除尝试，多数目标 storage account 被成功删除。

公开泄露的 workload secret 需要直接吊销或轮换，不能只删原始帖子。Azure Activity Log 中应检查批量删除、ListKeys、recovery lock 修改和异常 service-principal token。

#### IOC

- `45.131.66[.]106`
- `34.153.223[.]102`
- `64.20.53[.]230`

#### Sources

- [Microsoft Security Research — Storm-3168](https://www.microsoft.com/en-us/security/blog/2026/09/25/storm-3168-agentic-driven-cloud-attacks-using-compromised-service-principals/)

### WordPress CVE-2026-87902 进入 CISA KEV

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVE:** CVE-2026-87902  
**Affected:** 满足公告前提且低于 7.1.2 的 WordPress

这是昨天事件的实质更新：CISA 于 9 月 25 日将漏洞加入 KEV。处置仍是升级到 WordPress 7.1.2 或更高版本，并对补丁前满足服务器/主题前提的公网站点做失陷排查。

#### Sources

- [Canadian Centre for Cyber Security — AV26-952 Update 1](https://www.cyber.gc.ca/en/alerts-advisories/wordpress-security-advisory-av26-952)
- [CISA — CVE-2026-87902 KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-87902)

## 重要漏洞

### baserCMS 与 BcAddonMigrator 发布多项修复

**Severity:** High  
**Status:** JVN 未确认在野利用  
**CVE:** CVE-2026-62956, CVE-2026-93460, CVE-2026-93462, CVE-2026-93463, CVE-2026-93464, CVE-2026-97150  
**Affected:** JVN 列出的 baserCMS 与 BcAddonMigrator 版本

JVN 披露 baserCMS 中多项 SQL injection/XSS 等问题，以及 BcAddonMigrator 的 CVE-2026-97150。插件漏洞在高权限管理员条件下可从不可信控制域引入功能，CVSS v4 最高为 8.6。

将 baserCMS 更新到对应修复分支，并将 BcAddonMigrator 更新到 5.2.1 或更高版本。

#### Sources

- [JVN#14353754 — baserCMS](https://jvn.jp/jp/JVN14353754/)
- [JVN#21754394 — BcAddonMigrator](https://jvn.jp/jp/JVN21754394/)

## IOC 摘要

| 类型 | Indicator | 上下文 |
| --- | --- | --- |
| IPv4 | `45.131.66[.]106` | Storm-3168 probing / malicious ARM requests |
| IPv4 | `34.153.223[.]102` | Storm-3168 App Service probing |
| IPv4 | `64.20.53[.]230` | Storm-3168 App Service probing |

## 今日观察

- MikroTik 的更新体现了 exploit chain 的上下文价值：单项分数为 Medium 的漏洞，放进已利用的接管链后处置优先级会明显变化。
- Workload identity 需要和用户账户一样进入事件响应流程；公开 secret 从页面上删除，并不会让凭据失效。
