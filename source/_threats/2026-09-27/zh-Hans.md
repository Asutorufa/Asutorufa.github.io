---
id: "2026-09-27"
title: "Threat Intelligence Daily · 2026-09-27"
date: "2026-09-27"
updated: "2026-10-03 03:30:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "9 月 27 日主要有两项变化：Citrix 披露 NetScaler 两个零日漏洞，并确认未缓解设备已遭利用；Kiteworks 同日解除预防性停机建议，厂商仍未发现客户系统失陷证据。"
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

## 相比昨天

- **NEW — Citrix NetScaler：**Citrix 发布 CVE-2026-88771 与 CVE-2026-88772，并确认未缓解的 NetScaler 已出现利用活动。
- **UPDATED — Kiteworks：**9 月 27 日厂商解除停机建议，托管系统恢复运行，当时仍未发现失陷证据。

## 优先行动

- **立即：**将 NetScaler ADC/Gateway 升级到 14.1-73.37、13.1-64.23 或对应的 FIPS/NDcPP 修复版本。
- **立即：**此前公网暴露的 NetScaler 按事件响应对象处理。补丁能关闭漏洞，但不能清除补丁前已经建立的持久化。
- **今日：**Kiteworks 客户按厂商指导恢复系统，同时保留停机窗口前后的日志和遥测。

## 重点关注

### NetScaler CVE-2026-88771 与 CVE-2026-88772 在披露前已遭利用

**Severity:** Critical  
**Status:** Confirmed active exploitation / zero-day activity  
**CVSS:** 两项 CVE 的 v4 均为 9.5  
**CVE:** CVE-2026-88771, CVE-2026-88772  
**Affected:** 客户自管 NetScaler ADC 与 NetScaler Gateway

CVE-2026-88771 是由输入校验不足导致的未认证命令执行，默认部署即受影响。CVE-2026-88772 是内存溢出，在启用 DTLS 时可导致 RCE 或 DoS；VPN vServer 默认启用 DTLS。Citrix 明确表示已观察到对未缓解部署的利用。

安装修复版本，并在清理前保留 appliance 日志。检查 web root、认证路径和出站连接中的 web shell 或持久化迹象。

#### Sources

- [Citrix — CTX697096 NetScaler security bulletin](https://support.citrix.com/external/article/CTX697096)

## 其他值得关注

### Kiteworks 解除预防性停机建议

**Severity:** Medium  
**Status:** Preventive response update; 尚无确认失陷  
**Affected:** 9 月 25 日公告覆盖的 Kiteworks 系统

Kiteworks 在 9 月 27 日更新公告，解除所有客户的停机建议，厂商托管系统也已恢复正常。当时仍没有确认任何系统被入侵。

客户可按厂商指导恢复服务，同时保留威胁窗口内的日志。没有证据时不把预防性措施改写成 breach。

#### Sources

- [Kiteworks — Precautionary Shutdown Advisory](https://www.kiteworks.com/company/press-releases/kiteworks-precautionary-shutdown-advisory/)

## 今日观察

- NetScaler 属于「补丁 + hunt」事件：披露前已确认利用，处置目标已经从预防维护变成失陷评估。
- Kiteworks 则从预防性停机转为恢复且未发现失陷。两种状态都会改变实际操作，因此都应记录。
