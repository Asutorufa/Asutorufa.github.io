---
id: "2026-09-24"
title: "Threat Intelligence Daily · 2026-09-24"
date: "2026-09-24"
updated: "2026-10-03 03:20:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "9 月 24 日保留 6 个事件。CISA 将已遭利用的 WSO2 与 Adobe Commerce 漏洞加入 KEV；WordPress 与 Roundcube 需要快速修补；Microsoft 披露 Storm-2570 勒索软件关联活动；SolarWinds 修复 Observability Self-Hosted 中两条无需认证的 RCE 路径。"
total: 6
critical: 4
high: 2
medium: 0
low: 0
exploited: 5
tags:
  - active-exploitation
  - cisa-kev
  - ransomware
  - auth-bypass
  - rce
  - webmail
  - commerce
  - wordpress
  - WSO2
  - Adobe-Commerce
  - Roundcube
  - Storm-2570
  - SolarWinds
  - CVE-2026-5430
  - CVE-2026-71362
  - CVE-2026-87902
  - CVE-2026-48842
cves:
  - CVE-2026-28324
  - CVE-2026-28325
  - CVE-2026-48842
  - CVE-2026-5430
  - CVE-2026-71362
  - CVE-2026-87902
iocs: []
---

## 相比昨天

- **NEW — WSO2：**CISA 将 CVE-2026-5430 加入 KEV，依据是已存在主动利用证据。JWT 校验缺陷可导致未认证访问和管理员账户接管。
- **NEW — Adobe Commerce：**CVE-2026-71362 在 Adobe Commerce 与 Magento Open Source 遭利用的报告出现后进入 CISA KEV。
- **NEW — WordPress：**7.1.2 修复 CVE-2026-87902 后很快出现利用报告；在特定服务器和主题前提下，本地 PHP 文件包含可进一步达到 RCE。
- **NEW — Roundcube：**攻击者正在利用 `virtuser_query` 中的认证前 SQL 注入 CVE-2026-48842。
- **NEW — Storm-2570：**Microsoft 公布该勒索软件 affiliate 跨 Qilin、DragonForce、Anubis 与 BERT 的稳定入侵手法。
- **NEW — SolarWinds：**Platform 2026.2.3 修复 CVE-2026-28324 和 CVE-2026-28325，其中一项无需认证 RCE 的 CVSS 为 9.8。

## 优先行动

- **立即：**修补受 CVE-2026-5430 影响的 WSO2 产品，并检查公网系统是否出现未授权管理员访问。
- **立即：**更新 Adobe Commerce/Magento 与 WordPress 7.1.2 或更高版本；公网暴露资产需要同时做失陷排查。
- **立即：**将 Roundcube 升级到 1.6.16、1.7.1 或更高版本；无法立即升级时停用 `virtuser_query`。
- **今日：**在满足漏洞前提的环境中升级 SolarWinds Observability Self-Hosted/Platform 2026.2.3。
- **监控：**针对 Storm-2570 的 RMM、凭据访问、横向移动和数据外传行为做检测，不只依赖最终勒索软件家族名。

## 重点关注

### WSO2 CVE-2026-5430 进入 CISA KEV

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 10.0  
**CVE:** CVE-2026-5430  
**Affected:** WSO2 API Manager 及相关 API 平台组件

JWT 认证路径会接受使用不受支持算法签名的 token，并错误地将其判定为有效。攻击者无需认证即可获得系统访问权限，严重时可接管管理员账户。CISA 在 9 月 24 日基于主动利用证据将该漏洞加入 KEV。

安装 WSO2 对应修复，并检查公网 API 管理系统中新建管理员、异常 JWT 认证和高权限配置变更。

#### Sources

- [WSO2 — WSO2-2026-5328](https://security.docs.wso2.com/en/latest/security-announcements/security-advisories/2026/WSO2-2026-5328/)
- [CISA — CVE-2026-5430 KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-5430)

### Adobe Commerce CVE-2026-71362 已确认遭利用

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 9.1  
**CVE:** CVE-2026-71362  
**Affected:** 受影响版本的 Adobe Commerce、Adobe Commerce B2B 与 Magento Open Source

该漏洞属于授权校验错误。Adobe 最初公告没有报告利用活动，Canadian Cyber Centre 后续确认已有在野利用报告，并记录 CISA 于 9 月 24 日将其加入 KEV。

部署 APSB26-92 对应修复，并检查公网 Commerce 实例的管理员、集成凭据以及异常配置或内容变更。

#### Sources

- [Adobe — APSB26-92](https://www.adobe.com/trust/security/products/commerce/apsb26-92.html)
- [Canadian Centre for Cyber Security — AV26-808 Update 2](https://www.cyber.gc.ca/en/alerts-advisories/adobe-security-advisory-av26-808)

### WordPress CVE-2026-87902 在 7.1.2 发布后出现利用活动

**Severity:** Critical  
**Status:** Confirmed in-the-wild exploitation reporting  
**CVE:** CVE-2026-87902  
**Affected:** WordPress 7.1.2 之前版本；利用需要满足特定服务器与 active theme 前提

未认证攻击者可影响 page template 解析，让 WordPress 包含 active theme 目录外可读取的本地 PHP 文件。在满足相应环境条件时可进一步执行代码。

立即升级，并检查 Web/Application 日志中的异常 template resolution 和新增 PHP 文件。补丁前满足漏洞前提且公网暴露的站点应纳入失陷排查。

#### Sources

- [WordPress — 7.1.2 Release](https://wordpress.org/news/2026/09/wordpress-7-1-2-release/)
- [Canadian Centre for Cyber Security — AV26-952](https://www.cyber.gc.ca/en/alerts-advisories/wordpress-security-advisory-av26-952)

### Roundcube CVE-2026-48842 正在被利用

**Severity:** High  
**Status:** Confirmed in-the-wild exploitation reporting  
**CVSS:** 8.1  
**CVE:** CVE-2026-48842  
**Affected:** 使用相关 `virtuser_query` 路径的 Roundcube 1.6.16 之前版本与 1.7.1 之前版本

该认证前 SQL 注入可让远程攻击者修改数据库查询并读取 Roundcube 数据。9 月 24 日出现明确的主动利用报告。

升级公网 Roundcube，并回查认证和数据库日志中的异常查询。无法立即升级时，可临时移除或停用对应插件。

#### Sources

- [BleepingComputer — Roundcube CVE-2026-48842 active exploitation](https://www.bleepingcomputer.com/news/security/critical-roundcube-flaw-now-actively-exploited-in-code-injection-attacks/)

## Malware / APT / Campaign

### Storm-2570 在多个勒索软件体系间复用相似入侵手法

**Severity:** High  
**Status:** Confirmed ransomware-affiliate activity  
**Threat actor:** Storm-2570  
**Malware / RaaS:** Qilin、DragonForce、Anubis、BERT

Microsoft 自 2025 年 4 月起追踪 Storm-2570。该 affiliate 会切换最终勒索软件，但多次入侵中持续使用相似的 RMM、凭据访问、横向移动、安全软件干扰和云端外传手法。

检测可以围绕这些重复行为建立，而不是只在最终 ransomware payload 出现后按家族名匹配。

#### Sources

- [Microsoft Threat Intelligence — Storm-2570](https://www.microsoft.com/en-us/security/blog/2026/09/24/beyond-the-ransomware-tracking-storm-2570-consistent-tradecraft-across-deployments/)

## 重要漏洞

### SolarWinds Platform 2026.2.3 修复两条无需认证 RCE 路径

**Severity:** Critical  
**Status:** Vendor release notes 未确认在野利用  
**CVE:** CVE-2026-28324, CVE-2026-28325  
**Affected:** 满足对应配置前提的 SolarWinds Observability Self-Hosted / SolarWinds Platform

CVE-2026-28324 源于完整性校验不足，影响非默认且不安全的配置，CVSS 为 9.8。CVE-2026-28325 涉及不可信数据反序列化，在特定通信模式下可无需认证执行代码。

升级到 Platform 2026.2.3，并确认部署是否满足两项漏洞的配置前提。

#### Sources

- [SolarWinds Platform 2026.2.3 release notes](https://documentation.solarwinds.com/en/success_center/orionplatform/content/release_notes/solarwinds_platform_2026-2-3_release_notes.htm)

## 今日观察

- 当天多项高风险漏洞位于认证或公网应用边界。修复顺序需要同时考虑暴露面和已确认利用状态。
- Storm-2570 的活动表明，同一 affiliate 可以更换勒索软件 payload，检测长期依赖家族名容易漏掉前置活动。
