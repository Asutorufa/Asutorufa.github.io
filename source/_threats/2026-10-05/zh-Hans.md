---
id: "2026-10-05"
title: "Threat Intelligence Daily · 2026-10-05"
date: "2026-10-05"
updated: "2026-10-10"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10 月 5 日保留 3 个事件：Atlassian 披露 CVE-2026-21589，覆盖 8 类 Data Center 产品，厂商当日调查尚未发现利用；丹麦监管机构开始调查大规模自动化 CPR 查询；Zammad 则澄清两项已与主动利用关联 CVE 的实际影响范围。"
total: 3
critical: 1
high: 2
medium: 0
low: 0
exploited: 1
tags:
  - active-exploitation
  - cisa-kev
  - arbitrary-file-read
  - data-breach
  - session-hijack
  - Atlassian
  - Denmark-CPR
  - Zammad
  - CVE-2026-21589
  - CVE-2026-102489
  - CVE-2026-102490
cves:
  - CVE-2026-102489
  - CVE-2026-102490
  - CVE-2026-21589
iocs: []
---

## 相比昨天

- **NEW — Atlassian：**CVE-2026-21589 影响 Bitbucket、Confluence、Jira、Bamboo、Crowd、Crucible 与 Fisheye Data Center 产品。Atlassian 在 10 月 5 日发布时表示调查尚未发现利用证据。
- **NEW — 丹麦 CPR：**丹麦数据保护机构开始调查大量自动化查询，这些请求被用于识别有效 CPR 号码。
- **UPDATED — Zammad：**厂商澄清 CVE-2026-102489 在实践中主要影响旧 runtime，CVE-2026-102490 则是需要先获得服务器访问权限的本地提权问题。

## 优先行动

- **立即：**修补受影响的 Atlassian Data Center 产品，升级完成前限制自托管实例暴露面。
- **今日：**涉及丹麦 CPR 事件的组织确认实际可访问字段，并准备应对后续定向钓鱼或身份冒用。
- **今日：**Zammad 优先处理 6.5 及更早的停止支持版本，同时限制 shell/server access；不要把所有 7.x 一律视为 CVE-2026-102489 可利用。

## 重点关注

### Atlassian CVE-2026-21589 可在未认证状态读取任意已知路径文件

**Severity:** Critical  
**Status:** Atlassian 截至 10 月 5 日未发现利用证据  
**CVSS:** 9.3  
**CVE:** CVE-2026-21589  
**Affected:** Bitbucket DC、Confluence DC、Jira Service Management DC、Jira Software DC、Bamboo DC、Crowd DC、Crucible、Fisheye

攻击者无需认证，但需要知道准确文件名和路径。漏洞不能直接枚举全部文件；如果配置文件、应用密钥或本地凭据路径可预测，仍可能直接造成敏感信息读取。

按产品安装对应修复维护版本。Atlassian Cloud 已由厂商修复，当前主要工作对象是 Data Center / self-hosted 部署。

#### Sources

- [Atlassian — CVE-2026-21589 advisory](https://confluence.atlassian.com/security/cve-2026-21589-arbitrary-file-access-vulnerability-impacts-multiple-products-1870495748.html)
- [Atlassian Trust Center — October 5 announcement](https://customertrust.atlassian.com/)

## 已确认事件

### 丹麦开始调查 CPR 系统的大规模自动化访问

**Severity:** High  
**Status:** 已确认调查，具体影响范围仍在确认  
**Affected:** 通过丹麦 CPR 相关系统可访问的个人信息

Datatilsynet 表示，CPR register 上出现了数量很大的自动化查询，目的是识别有效 CPR 号码。监管机构当时仍在调查访问方式、涉及的数据以及责任主体。

处理丹麦公民数据的组织应考虑这些身份字段被用于提高 phishing/social engineering 可信度的风险。在官方范围尚未确定前，不引用未经确认的受害人数。

#### Sources

- [Datatilsynet — CPR investigation](https://www.datatilsynet.dk/presse-og-nyheder/nyhedsarkiv/2026/okt/datatilsynet-er-opmaerksom-paa-sag-om-opslag-i-cpr)

## 其他重要动态

### Zammad 缩小 CVE-2026-102489 / CVE-2026-102490 的实际影响范围

**Severity:** High  
**Status:** UPDATED scope clarification；CVE-2026-102489 仍与已确认利用关联  
**CVE:** CVE-2026-102489, CVE-2026-102490  
**Affected:** CVE-2026-102489 实际可利用范围主要是 Zammad 6.5 及更早版本；CVE-2026-102490 需要本地/服务器访问

Zammad 表示，7.0 及更高版本使用的 runtime 使 CVE-2026-102489 在实践中不可利用，6.5 及更早版本仍受影响。CVE-2026-102490 则被描述为本地提权，不能单独作为远程入口。

升级停止支持版本并限制底层服务器访问。这个澄清缩小了资产范围，但旧版公网实例仍需要调查。

#### Sources

- [Zammad — CVE-2026-102489 / CVE-2026-102490 advisory](https://zammad.com/en/advisories/cve-2026-102489-cve-2026-102490)

## 今日观察

- 10 月 5 日的 Atlassian 状态是“披露但未确认利用”，后续攻击遥测不倒灌到当日结论。
- 影响范围修正会直接改变处置规模。Zammad 的澄清把较新 runtime 排除出 CVE-2026-102489 的实际可利用范围。
