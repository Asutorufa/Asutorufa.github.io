---
id: "2026-10-01"
title: "Threat Intelligence Daily · 2026-10-01"
date: "2026-10-01"
updated: "2026-10-03 03:45:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10 月 1 日包含一个已遭利用的 FortiMail 零日、两项定向攻击研究和一个固件安全公告：Fortinet 披露 CVE-2026-104286 及攻击 IOC；Proofpoint 发布 TA419 针对 AI 政策专家的凭据钓鱼；Symantec 描述 Longlegs/Warlock 对关键基础设施的入侵；CERT/CC 发布 InsydeH2O IHISI SMM 内存写入问题。"
total: 4
critical: 1
high: 2
medium: 1
low: 0
exploited: 3
tags:
  - active-exploitation
  - zero-day
  - phishing
  - apt
  - ransomware
  - sharepoint
  - firmware
  - FortiMail
  - TA419
  - Warlock
  - Longlegs
  - CVE-2025-1055
  - CVE-2026-104286
  - CVE-2026-12855
cves:
  - CVE-2025-1055
  - CVE-2026-104286
  - CVE-2026-12855
iocs:
  - 79.141.169.187
  - 45.129.0.192
  - sha256:8015f34dc84922b03688399d7f9fe7a00361789f7e420c7e2a2cdb23e75cef84
  - sha256:8953ec7960b09f544a880b072ad4e6cfda7a8303f486251d3478dcfdfbac23b6
---

## 相比昨天

- **NEW — FortiMail：**Fortinet 披露 CVE-2026-104286，CVSS 9.8，并确认管理接口存在主动零日利用。
- **NEW — TA419：**Proofpoint 发布中国关联的 credential phishing，攻击者冒充 AI 政策制定者和经济学家，目标是美国 AI 政策专家；报告也涉及日本智库目标。
- **NEW — Longlegs / Warlock：**Symantec 披露以 SharePoint 为入口的近期勒索软件活动，受害者包括供水、电信、地方政府和大学。
- **NEW — InsydeH2O：**CERT/CC 发布 CVE-2026-12855，影响 OEM 特定 IHISI SMM module 的不安全内存写入。

## 优先行动

- **立即：**限制 FortiMail 管理接口访问，按 Fortinet 指导应用临时缓解，并在修复版本可用后升级；同时搜索厂商公布的文件/IP IOC。
- **今日：**涉及 AI 政策、出口管制或国家战略的组织检查冒充研究者、经济学家和政策人物的 credential phishing。
- **今日：**本地 SharePoint 继续检查 web shell、伪造应用访问以及 Longlegs/Warlock 相关行为。
- **监控：**CVE-2026-12855 先按 OEM 公告确认型号范围。CERT/CC 明确指出 vulnerable module 是 OEM-specific，多家厂商已确认不受影响。

## 重点关注

### FortiMail CVE-2026-104286 遭零日利用

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 9.8  
**CVE:** CVE-2026-104286  
**Affected:** FortiMail 8.0.0–8.0.1、7.6.0–7.6.6、7.4.0–7.4.8、7.2.0–7.2.9

管理接口的路径遍历与 null-byte 处理问题可让未认证攻击者通过 crafted HTTP/S 请求写入任意文件。Fortinet 已确认主动利用，并发布文件 hash、日志特征和攻击基础设施。

修复版本尚不可用的分支按 Fortinet 缓解指导限制管理访问，并在适用环境禁用受影响 IBE 功能。命中 IOC 的设备应进入失陷排查。

#### IOC

- `79.141.169[.]187`
- `45.129.0[.]192`
- `SHA256 8015f34dc84922b03688399d7f9fe7a00361789f7e420c7e2a2cdb23e75cef84`
- `SHA256 8953ec7960b09f544a880b072ad4e6cfda7a8303f486251d3478dcfdfbac23b6`

#### Sources

- [Fortinet PSIRT — FG-IR-26-175](https://fortiguard.fortinet.com/psirt/FG-IR-26-175)
- [BleepingComputer — FortiMail zero-day exploitation](https://www.bleepingcomputer.com/news/security/fortinet-warns-of-critical-fortimail-flaw-exploited-in-zero-day-attacks/)

### TA419 冒充 AI 政策人物窃取凭据

**Severity:** High  
**Status:** Confirmed targeted credential-phishing campaign  
**Threat actor:** TA419  
**Affected:** 智库、大学、法律行业及相关机构中的 AI 政策专家

Proofpoint 观察到 7 月多轮 campaign，攻击者冒充经济学家和 AI 政策制定者，包括前美国政府官员，目标是少量高价值 AI 政策人员。2026 年更早的活动还曾冒充 Anthropic 员工。

目标群体应通过独立渠道核验合作邀请，并检查钓鱼后是否出现 credential replay 或异常登录。

#### Sources

- [Proofpoint — TA419 and US AI policy](https://www.proofpoint.com/us/blog/threat-insight/hallucinating-credibility-china-aligned-ta419-impersonates-its-way-us-ai-policy)

### Longlegs 持续通过 SharePoint 发起 Warlock 勒索软件入侵

**Severity:** High  
**Status:** Confirmed ransomware / targeted intrusion activity  
**Threat actor:** Longlegs / Storm-2603  
**Malware:** Warlock ransomware  
**CVE:** CVE-2025-1055 用于 BYOVD 防御规避  
**Affected:** 近期供水、电信、地方政府和大学受害者

Symantec 报告葡萄牙语和西班牙语国家至少 4 个近期受害者。Longlegs 继续偏好 SharePoint 初始访问，随后使用 web shell、窃取 SharePoint machine key、LOLBin、VS Code tunnel 和带漏洞签名驱动 K7RKScan，再部署 ransomware。

处置重点包括本地 SharePoint 暴露、web shell、异常 VS Code tunnel service 和 K7RKScan driver。

#### Sources

- [Security.com / Symantec — Warlock attacks critical infrastructure](https://www.security.com/threat-intelligence/warlock-ransomware-critical-infrastructure)

## 重要漏洞

### InsydeH2O IHISI CVE-2026-12855 需要按 OEM 范围判断

**Severity:** Medium  
**Status:** CERT/CC 未确认在野利用  
**CVE:** CVE-2026-12855  
**Affected:** OEM 特定的 InsydeH2O IHISI SMM module，实际范围取决于整机厂商

该问题是不安全 SMM 内存写入。已拥有 OS kernel 权限的本地攻击者可写物理内存，包括 SMRAM，并可能进一步在 SMM 执行代码。CERT/CC 强调 vulnerable module 是 OEM-specific；AMI、ASUS 和 GIGABYTE 已确认不受影响，其他部分厂商状态仍未知。

应以设备 OEM 的安全公告确认具体型号，不把所有使用 Insyde firmware 的系统统一标为受影响。

#### Sources

- [CERT/CC — VU#553437](https://www.kb.cert.org/vuls/id/553437)

## IOC 摘要

| 类型 | Indicator | 上下文 |
| --- | --- | --- |
| IPv4 | `79.141.169[.]187` | FortiMail attack infrastructure |
| IPv4 | `45.129.0[.]192` | FortiMail attack infrastructure |
| SHA256 | `8015f34dc84922b03688399d7f9fe7a00361789f7e420c7e2a2cdb23e75cef84` | FortiMail malicious file |
| SHA256 | `8953ec7960b09f544a880b072ad4e6cfda7a8303f486251d3478dcfdfbac23b6` | FortiMail malicious file |

## 今日观察

- 当天只有 FortiMail 属于已确认漏洞主动利用；另外两项 High 是定向 campaign，响应动作不同。
- Firmware 公告需要精确到硬件范围。CVE-2026-12855 如果被直接套到所有 Insyde 系统，会扩大实际影响面。
