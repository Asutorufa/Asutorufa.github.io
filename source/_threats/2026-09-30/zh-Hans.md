---
id: "2026-09-30"
title: "Threat Intelligence Daily · 2026-09-30"
date: "2026-09-30"
updated: "2026-10-03 03:45:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "9 月 30 日新增两项已遭利用的边界/服务器漏洞，并补充 NetScaler 后渗透细节：Microsoft 追踪 Zimbra CVE-2026-73570 利用活动；Cisco 确认 Catalyst SD-WAN Manager CVE-2026-76504 已遭利用；Unit 42 更新 NetScaler 基础设施与持久化信息；JVN 发布 FUJIFILM/Sharp 多功能一体机路径遍历漏洞。"
total: 4
critical: 3
high: 0
medium: 1
low: 0
exploited: 3
tags:
  - active-exploitation
  - zero-day
  - mail-server
  - edge-device
  - sdwan
  - NetScaler
  - Zimbra
  - Cisco
  - FUJIFILM
  - Sharp
  - CVE-2026-73570
  - CVE-2026-76504
  - CVE-2026-78249
  - CVE-2026-88771
  - CVE-2026-88772
cves:
  - CVE-2026-73570
  - CVE-2026-76504
  - CVE-2026-78249
  - CVE-2026-88771
  - CVE-2026-88772
iocs:
  - 66.135.19.18
  - 167.99.111.203
  - 142.93.85.227
  - 104.248.74.206
  - 137.184.91.207
  - 162.33.178.9
  - 193.149.176.207
---

## 相比昨天

- **NEW — Zimbra：**Microsoft 披露 CVE-2026-73570 针对公网邮件服务器的利用活动，后续包括 JSP web shell、reverse shell、提权和持久化。
- **NEW — Cisco SD-WAN：**Cisco PSIRT 确认 CVE-2026-76504 已遭利用；该认证绕过可让未认证远程攻击者获得 admin-user 权限。
- **UPDATED — NetScaler：**Unit 42 为 CVE-2026-88771/CVE-2026-88772 增加披露前后活动和轮换基础设施信息。
- **NEW — FUJIFILM/Sharp MFP：**JVN 发布 Web 管理接口路径遍历 CVE-2026-78249。

## 优先行动

- **立即：**修补公网 Zimbra，并检查 JSP web shell、reverse shell、提权痕迹和异常持久化。
- **立即：**Cisco Catalyst SD-WAN Manager 升级前先收集 admin-tech，再升级到修复版本，并检查 `vmanage-server.log` 中未知来源的 `j_security_check`。
- **立即：**继续对补丁前暴露的 NetScaler 做失陷排查，并用新增基础设施做历史检索。
- **今日：**更新受影响的 FUJIFILM/Sharp 多功能一体机，限制管理接口访问范围。

## 重点关注

### Zimbra CVE-2026-73570 被用于攻击公网邮件服务器

**Severity:** Critical  
**Status:** Confirmed active exploitation  
**CVE:** CVE-2026-73570  
**Affected:** 使用受影响 SNMP/notification 路径的 Zimbra Collaboration 环境

Microsoft 观察到攻击从无需认证的 command injection 开始，后续部署 JSP web shell、reverse shell，并执行提权和持久化。由于入口是公网邮件服务器，活动窗口内曾暴露的资产即使后来补丁完成，也需要检查是否已经失陷。

应用 Zimbra 修复，并检查 web root、进程父子关系、计划任务/服务和异常出站连接。清理前先保留 forensic 数据。

#### Sources

- [Microsoft Security — CVE-2026-73570 exploitation](https://www.microsoft.com/en-us/security/blog/2026/09/30/unauthenticated-command-injection-on-internet-facing-mail-servers-tracking-cve-2026-73570/)

### Cisco Catalyst SD-WAN Manager CVE-2026-76504 已遭利用

**Severity:** Critical  
**Status:** Confirmed active exploitation / zero-day disclosure  
**CVSS:** 9.8  
**CVE:** CVE-2026-76504  
**Affected:** Cisco 公告列出的 Catalyst SD-WAN Manager 受影响版本

URI encoding 处理不当可绕过 API 认证规则，未认证远程攻击者因此可以 admin-user 权限访问 API。Cisco PSIRT 明确确认 2026 年 9 月存在主动利用。

Cisco 建议升级前收集 admin-tech，然后提交 TAC 扫描 IOC；也可检查 `vmanage-server.log` 中与 `viptela-reserved-` 用户相关的异常 `j_security_check` 请求。

#### Sources

- [Cisco — Catalyst SD-WAN Manager API Authentication Bypass](https://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-sdwan-webauth-xr8beuuU.html)
- [Cisco — September 2026 remediation workflow](https://www.cisco.com/c/en/us/support/docs/routers/sd-wan/226384-remediate-catalyst-sd-wan-security.html)

### NetScaler 后续调查新增基础设施与持久化细节

**Severity:** Critical  
**Status:** Confirmed active exploitation / ongoing follow-up  
**CVE:** CVE-2026-88771, CVE-2026-88772  
**Affected:** 利用窗口内暴露的 NetScaler ADC / Gateway

Unit 42 更新了披露前后的攻击活动、轮换基础设施和持久化行为。这是 9 月 27–28 日事件的实质更新，不是新的漏洞。

新增 IP 适合用于历史 hunt，但需要结合时间和资产上下文判断。托管 IP 可能在之后被重新分配，不适合当永久 blocklist。

#### IOC

- `66.135.19[.]18`
- `167.99.111[.]203`
- `142.93.85[.]227`
- `104.248.74[.]206`
- `137.184.91[.]207`
- `162.33.178[.]9`
- `193.149.176[.]207`

#### Sources

- [Unit 42 — NetScaler zero-days exploited](https://unit42.paloaltonetworks.com/netscaler-zero-days-exploited/)

## 重要漏洞

### FUJIFILM/Sharp 多功能一体机 CVE-2026-78249

**Severity:** Medium  
**Status:** JVN 未确认在野利用  
**CVE:** CVE-2026-78249  
**Affected:** JVN 列出的机型与 firmware

Web 管理接口存在路径遍历。应更新厂商 firmware，并避免让打印设备管理接口暴露到不可信网络。

#### Sources

- [JVN — JVNVU#90160989](https://jvn.jp/vu/JVNVU90160989/)

## IOC 摘要

| 类型 | Indicator | 上下文 |
| --- | --- | --- |
| IPv4 | `66.135.19[.]18` | NetScaler exploitation infrastructure |
| IPv4 | `167.99.111[.]203` | NetScaler exploitation infrastructure |
| IPv4 | `142.93.85[.]227` | NetScaler exploitation infrastructure |
| IPv4 | `104.248.74[.]206` | NetScaler exploitation infrastructure |
| IPv4 | `137.184.91[.]207` | NetScaler exploitation infrastructure |
| IPv4 | `162.33.178[.]9` | NetScaler exploitation infrastructure |
| IPv4 | `193.149.176[.]207` | NetScaler exploitation infrastructure |

## 今日观察

- Zimbra 和 Cisco 都属于「修补后仍需调查」的事件，因为利用活动发生在披露前后。
- NetScaler 的 CVE 没有变化，但攻击基础设施和后渗透信息继续增加，这类变化就是日报需要保留 UPDATE 的原因。
