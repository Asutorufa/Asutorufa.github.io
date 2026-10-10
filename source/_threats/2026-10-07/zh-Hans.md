---
id: "2026-10-07"
title: "Threat Intelligence Daily · 2026-10-07"
date: "2026-10-07"
updated: "2026-10-10"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10 月 7 日保留 4 个事件。Cisco 定期安全发布中包含多条 NX-OS 无需认证 root RCE 路径，以及一组独立的 License On-Prem hardening 漏洞，其中 signature verification 问题为 CVSS 10；Splunk Enterprise 修复最高 9.8 的多 CVE 公告；IDC Frontier 确认 IDCF Cloud 东日本 Region 1 故障由勒索软件造成，影响 495 家企业和地方政府客户。"
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 0
tags:
  - network-infrastructure
  - rce
  - license-management
  - siem
  - ransomware
  - cloud
  - Cisco
  - Splunk
  - IDCF
  - CVE-2026-76465
  - CVE-2026-76471
  - CVE-2026-76482
cves:
  - CVE-2026-76264
  - CVE-2026-76265
  - CVE-2026-76272
  - CVE-2026-76280
  - CVE-2026-76465
  - CVE-2026-76471
  - CVE-2026-76480
  - CVE-2026-76482
  - CVE-2026-76483
  - CVE-2026-76484
  - CVE-2026-76485
  - CVE-2026-76486
  - CVE-2026-76501
iocs: []
---

## 相比昨天

- **NEW — Cisco NX-OS：**Cisco 发布多项 Critical 问题，MPLS OAM、NX-API、NGOAM 中存在无需认证即可达到 root 远程代码执行的路径。
- **NEW — Cisco License On-Prem：**10 月 hardening release 修复 4 类问题，其中 CVE-2026-76482 为 CVSS 10.0。
- **NEW — Splunk Enterprise：**SVD-2026-1001 覆盖受支持的 9.4、10.0、10.2、10.4 分支，公告最高 CVSS 9.8。
- **NEW — IDCF Cloud：**IDC Frontier 确认东日本 Region 1 事件由勒索软件造成，并公布影响 495 家企业和地方政府客户。

## 优先行动

- **立即：**按 10 月 7 日 Cisco 公告核对 Nexus/NX-OS feature configuration，对启用 NX-API、MPLS OAM、NGOAM 且可被管理网络或外部触达的设备优先升级。
- **立即：**Cisco License On-Prem 升级到 10-202609 或厂商指定修复版本；这组 hardening 漏洞没有 workaround。
- **今日：**Splunk Enterprise 升到 10.4.3、10.2.7、10.0.10、9.4.15 或更高，并完成公告要求的额外 remediation。
- **今日：**IDCF 客户按厂商隔离/恢复指引处理，并盘点与东日本 Region 1 相连的 workload 与 credential。

## 重点关注

### Cisco NX-OS 10 月发布包含多条无需认证的 root RCE

**Severity:** Critical  
**Status:** 引用的 Cisco 公告未确认在野利用  
**CVE:** CVE-2026-76465, CVE-2026-76471, CVE-2026-76485, CVE-2026-76486, CVE-2026-76501  
**Affected:** 启用 MPLS OAM、NX-API 或 NGOAM 的特定 Cisco Nexus 3000/9000 与 NX-OS 配置

CVE-2026-76465 位于 MPLS OAM，CVE-2026-76471 位于 NX-API，NGOAM 另外包含 3 项 RCE。不同路径可导致 root 代码执行或拒绝服务。

使用 Cisco Software Checker 和各公告的配置前提确定实际暴露资产，不按“所有 NX-OS 一样受影响”处理。优先修补启用了相关 feature 且管理面可达的设备。

#### Sources

- [Cisco — NX-API RCE](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-napi-rce-r2shwu2j)
- [Cisco — MPLS OAM RCE](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-moam-rce-uBTzYV7)
- [Cisco — NGOAM RCE vulnerabilities](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-ngoam-rce-LWKQ4BU)

### Cisco License On-Prem hardening 包含 CVSS 10 trust failure

**Severity:** Critical  
**Status:** Cisco PSIRT 未发现 malicious use  
**CVSS:** 10.0 for CVE-2026-76482  
**CVE:** CVE-2026-76480, CVE-2026-76482, CVE-2026-76483, CVE-2026-76484  
**Affected:** 2026 年 10 月 hardening advisory 中列出的 Cisco License On-Prem

这组问题覆盖 critical function 缺少认证、cryptographic signature 校验不正确、credential 保护不足和 code injection。Cisco 没有提供 workaround，10.x 当前分支首个修复版为 10-202609。

按厂商版本升级；修补后管理入口仍应只对可信网络开放。

#### Sources

- [Cisco — License On-Prem Security Hardening Release](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-hardening-ssm-Ph77wdhf)

### Splunk Enterprise SVD-2026-1001 需要升级后继续完成额外修复

**Severity:** Critical  
**Status:** Splunk 公告未确认在野利用  
**CVSS:** 最高 9.8  
**CVE:** CVE-2026-76264, CVE-2026-76265, CVE-2026-76272, CVE-2026-76280  
**Affected:** 修复版本之前的 Splunk Enterprise 9.4、10.0、10.2、10.4

Splunk 在 10.4.3、10.2.7、10.0.10、9.4.15 修复多项漏洞。SVD-2026-1001 明确要求上面 4 个 CVE 继续执行额外 remediation，因此不能把 package upgrade 当成全部处置。

升级后按公告逐项完成 CVE-specific 步骤。

#### Sources

- [Splunk — SVD-2026-1001](https://advisory.splunk.com/advisories/SVD-2026-1001)

## 已确认事件

### IDCF Cloud 东日本 Region 1 故障确认为勒索软件攻击

**Severity:** High  
**Status:** Confirmed ransomware incident  
**Affected:** 东日本 Region 1；10 月 7 日公告称影响 495 家企业和地方政府客户

IDC Frontier 表示约 03:40 JST 起发生未授权访问，调查后确认原因为勒索软件。厂商隔离受影响区域，并继续调查入侵路径和完整影响范围。

客户应按厂商指引处理，并盘点连接该区域的 workload 与 credential。服务恢复本身不能证明侵害风险已经结束。

#### Sources

- [IDC Frontier — October 7 second report](https://www.idcf.jp/news/topics/20261007002)

## 今日观察

- Cisco 当天 CVE 数量很大，修复排序应先看 feature exposure，而不是按 CVE 数字堆积决定。
- IDCF 已确认 ransomware，但没有确认入侵向量；把它与当天任何新披露 Cisco/Splunk CVE 直接关联都没有证据。
