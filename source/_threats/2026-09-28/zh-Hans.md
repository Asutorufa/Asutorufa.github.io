---
id: "2026-09-28"
title: "Threat Intelligence Daily · 2026-09-28"
date: "2026-09-28"
updated: "2026-10-03 03:30:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "9 月 28 日新增的是上下文而不是一批新 CVE：Unit 42 统计到 5 万多个可能受 NetScaler 零日影响的公网实例，并披露 web shell/持久化活动；Microsoft 发布 NeedyMantis 后渗透框架；Kiteworks 在恢复系统时确认修复了一个此前未知的 Critical 漏洞；JVN 发布 BUFFALO Wi-Fi 修复。"
total: 4
critical: 1
high: 3
medium: 0
low: 0
exploited: 2
tags:
  - active-exploitation
  - zero-day
  - NetScaler
  - NeedyMantis
  - Storm-3069
  - Kiteworks
  - BUFFALO
  - wifi
  - CVE-2026-88771
  - CVE-2026-88772
  - CVE-2026-86530
  - CVE-2026-95104
cves:
  - CVE-2026-86530
  - CVE-2026-88771
  - CVE-2026-88772
  - CVE-2026-95104
iocs: []
---

## 相比昨天

- **UPDATED — NetScaler：**Unit 42 统计 9 月 27 日有 50,277 个公网实例可能受影响，并将利用活动与 web shell 和持久化建立关联。
- **NEW — NeedyMantis：**Microsoft 发布模块化 post-compromise malware，目标包括电信、大学、医疗非营利机构、政府间组织和政府承包商。
- **UPDATED — Kiteworks：**厂商表示威胁窗口平稳结束，同时在停机响应中发现并修复一个此前未知的 Critical 漏洞。
- **NEW — BUFFALO：**JVN 发布影响 WSR-300HP 与 WEX-G300 的 CVE-2026-86530、CVE-2026-95104。

## 优先行动

- **立即：**修补 NetScaler，并在补丁前暴露的设备上搜索 web shell 与持久化。
- **今日：**按 Microsoft 给出的路径检查 NeedyMantis DLL sideloading，并重点关注与早前 DAEMON Tools 事件或其他定向入侵有关的主机。
- **今日：**按 Kiteworks 恢复指导确认部署已进入厂商修复版本。
- **今日：**更新受影响 BUFFALO Wi-Fi 产品，尤其是允许远程管理的设备。

## 重点关注

### NetScaler 利用活动已包含 web shell 与持久化

**Severity:** Critical  
**Status:** Confirmed active exploitation / zero-day follow-up  
**CVE:** CVE-2026-88771, CVE-2026-88772  
**Affected:** NetScaler ADC / Gateway

Unit 42 报告截至 9 月 27 日有 50,277 个公网实例可能受影响。已观察到的零日活动会使用漏洞获得初始访问并部署 web shell 建立持久化。

补丁前曾暴露的 appliance 不能只看版本号结束处置。应检查 web 目录、异常认证请求和出站通信。

#### Sources

- [Unit 42 — NetScaler zero-days exploited](https://unit42.paloaltonetworks.com/netscaler-zero-days-exploited/)
- [Citrix — CTX697096](https://support.citrix.com/external/article/CTX697096)

### NeedyMantis 用于定向入侵后的长期访问

**Severity:** High  
**Status:** Confirmed targeted malware activity  
**Threat actor:** 已观察到 Storm-3069；Microsoft 未将所有活动归到同一 operator  
**Malware:** NeedyMantis

Microsoft 在少量定向入侵中观察到 NeedyMantis。它通常出现在初始访问之后，通过 DLL sideloading、自定义加密 archive 与模块化组件维持长期访问。受害者包括电信、大学、医疗非营利机构、政府间组织与政府承包商。

可按公告给出的 loader/archive 路径做检索，并与已有入侵证据关联。Microsoft 是从 DAEMON Tools 事件的 IOC 继续分析时发现该 malware，但没有说 NeedyMantis 都通过该供应链事件分发。

#### Sources

- [Microsoft Threat Intelligence — NeedyMantis](https://www.microsoft.com/en-us/security/blog/2026/09/28/needymantis-unpacking-a-post-compromise-malware-family-used-in-targeted-operations/)

## 其他值得关注

### Kiteworks 恢复服务并修复此前未知的 Critical 漏洞

**Severity:** High  
**Status:** Preventive response completed; 厂商未报告利用证据  
**Affected:** 停机公告覆盖的 Kiteworks 环境

Kiteworks 表示威胁窗口已经过去，系统可以恢复正常运行。响应期间发现并修复了一个此前未知的 Critical 漏洞，相关功能的客户使用率低于 1%。

#### Sources

- [Kiteworks — Systems restored after credible threat](https://www.kiteworks.com/company/press-releases/kiteworks-restores-systems-credible-threat/)

### BUFFALO WSR-300HP / WEX-G300 多项漏洞

**Severity:** High  
**Status:** JVN 未确认在野利用  
**CVE:** CVE-2026-86530, CVE-2026-95104  
**Affected:** JVN 公告列出的 BUFFALO WSR-300HP 与 WEX-G300

JVN 发布命令注入和内存安全相关问题。应升级厂商修复 firmware，并限制管理接口访问。

#### Sources

- [JVN — JVNVU#94863997](https://jvn.jp/vu/JVNVU94863997/)

## 今日观察

- NetScaler 在一天内从漏洞披露发展到公网规模与后渗透细节。边界设备事件经常需要连续更新，因为 forensic picture 会在补丁发布后继续形成。
- NeedyMantis 属于 post-compromise framework，只盯初始访问阶段会漏掉 Microsoft 本次披露的活动。
