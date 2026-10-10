---
id: "2026-10-04"
title: "Threat Intelligence Daily · 2026-10-04"
date: "2026-10-04"
updated: "2026-10-10"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10 月 4 日保留 2 个事件。Citrix NetScaler CVE-2026-88779 从高危 SAML 拒绝服务问题上升为已遭利用/KEV 优先项；AhsayCBS 同日出现两项新披露漏洞，其中 Replication Receiver 存在无需认证的远程代码执行路径。"
total: 2
critical: 1
high: 1
medium: 0
low: 0
exploited: 1
tags:
  - active-exploitation
  - cisa-kev
  - edge-device
  - backup
  - auth-bypass
  - rce
  - Citrix
  - Ahsay
  - CVE-2026-88779
  - CVE-2026-105133
  - CVE-2026-105134
cves:
  - CVE-2026-105133
  - CVE-2026-105134
  - CVE-2026-88779
iocs: []
---

## 相比昨天

- **UPDATED — Citrix NetScaler：**CVE-2026-88779 进入已知遭利用范围。漏洞影响仍是拒绝服务，但 active exploitation 让公网 SAML appliance 的修补优先级发生变化。
- **NEW — AhsayCBS：**CVE-2026-105133 与 CVE-2026-105134 被公开，分别涉及认证处理和 Replication Receiver 中的 Critical 无需认证 RCE。

## 优先行动

- **立即：**修补满足 SAML 前提条件的 NetScaler，并回查服务中断和漏洞路径附近的异常请求。
- **今日：**盘点公网可访问的 AhsayCBS 管理服务，在升级到修复版本前先限制管理入口。
- **监控：**保留 AhsayCBS 应用与进程创建日志，后续若出现利用证据，可以回溯确认是否已遭入侵。

## 重点关注

### Citrix NetScaler CVE-2026-88779 已进入在野利用范围

**Severity:** High  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 8.7 (CVSS v4)  
**CVE:** CVE-2026-88779  
**Affected:** 配置为 SAML SP 或 SAML IdP 的客户自管 NetScaler ADC/Gateway

Citrix 公告描述的是会导致拒绝服务的内存溢出。到 10 月 4 日，利用报告和 KEV 状态使其成为 SAML 边界设备的优先事项；这里不把其影响扩大描述成 RCE。

升级到 Citrix 修复版本，并先确认设备是否满足 SAML 前提条件，再决定入侵排查范围。

#### Sources

- [Citrix — CTX697174](https://support.citrix.com/external/article/CTX697174/citrix-netscaler-adc-and-citrix-netscale.html)
- [CISA — KEV catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### AhsayCBS CVE-2026-105133 / CVE-2026-105134 暴露备份管理面

**Severity:** Critical  
**Status:** 截至当日未确认在野利用  
**CVE:** CVE-2026-105133, CVE-2026-105134  
**Affected:** 10 月 4 日披露覆盖的 AhsayCBS 版本

CVE-2026-105133 涉及认证处理，CVE-2026-105134 可通过 Replication Receiver API 达到无需认证的远程代码执行。备份管理服务器通常连接大量受保护系统，因此其安全边界比单一业务应用更宽。

升级到厂商修复版本，并尽量避免把管理接口直接暴露到公网。

#### Sources

- [NVD — CVE-2026-105133](https://nvd.nist.gov/vuln/detail/CVE-2026-105133)
- [NVD — CVE-2026-105134](https://nvd.nist.gov/vuln/detail/CVE-2026-105134)

## 今日观察

- NetScaler 的技术影响主要是 availability，但在野利用改变了处置顺序。
- AhsayCBS 当天仍按漏洞披露处理，不提前把后续出现的攻击遥测倒灌进 10 月 4 日的状态。
