---
id: "2026-10-03"
title: "Threat Intelligence Daily · 2026-10-03"
date: "2026-10-03"
updated: "2026-10-10"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10 月 3 日保留 4 个事件：CISA 已将遭利用的 Zammad 会话劫持漏洞加入 KEV；Citrix 披露 NetScaler SAML 场景的高危拒绝服务漏洞；Bouncy Castle 发布 MLS 身份绑定 Critical CVE；Fortra 披露 BoKS 中可由管理接口触发、最终以 root 执行命令的注入问题。"
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 1
tags:
  - active-exploitation
  - cisa-kev
  - session-hijack
  - cryptography
  - privileged-access
  - edge-device
  - Zammad
  - Bouncy-Castle
  - Fortra
  - Citrix
  - CVE-2026-102489
  - CVE-2026-102490
  - CVE-2026-71885
  - CVE-2026-79898
  - CVE-2026-88779
cves:
  - CVE-2026-102489
  - CVE-2026-102490
  - CVE-2026-71885
  - CVE-2026-79898
  - CVE-2026-88779
iocs: []
---

## 相比昨天

- **NEW — Zammad：**CISA 在 10 月 2 日将 CVE-2026-102489 加入 KEV。公开披露显示，该会话劫持问题在旧版 Zammad 上可与后续提权组合，最终达到代码执行。
- **NEW — Citrix NetScaler：**Citrix 发布 CVE-2026-88779，影响启用 SAML SP 或 IdP 的客户自管 ADC/Gateway。
- **NEW — Bouncy Castle：**CVE-2026-71885 的 CVE 记录发布，问题位于 MLS X.509 credential 与 LeafNode signature key 的绑定校验，1.86 已修复。
- **NEW — Fortra BoKS：**CVE-2026-79898 可让具备相关管理权限的认证用户注入 shell 命令，并由 BoKS Master 上的 root 进程处理。

## 优先行动

- **立即：**仍在使用 Zammad 6.x 等已停止支持版本的环境迁移到受支持版本，并回查 session 异常、管理员活动和服务器侧异常执行。
- **今日：**盘点作为 SAML SP/IdP 使用的 NetScaler，安排升级到 Citrix 修复版本。
- **今日：**使用 MLS 的 Java 服务将 Bouncy Castle 升级到 1.86 或更高版本。
- **今日：**修补 Fortra BoKS Manager，并在升级完成前收紧 BCC/WSI 管理入口。

## 重点关注

### Zammad CVE-2026-102489 进入 CISA KEV

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVE:** CVE-2026-102489, CVE-2026-102490  
**Affected:** 较旧的自托管 Zammad，尤其是 6.5 及更早版本

CVE-2026-102489 是会话劫持漏洞，CISA 于 10 月 2 日将其列入 KEV。公开事件材料同时描述了 CVE-2026-102490，本地提权可在攻击者已经取得服务器访问权限后扩大影响。

优先处理停止支持的 Zammad 版本。限制主机访问，检查异常 session、管理员操作，以及公网实例上的异常进程和文件变化。

#### Sources

- [CISA — CVE-2026-102489 KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-102489)
- [DIVD — DIVD-2026-00015](https://csirt.divd.nl/DIVD-2026-00015)

### Bouncy Castle Java CVE-2026-71885 破坏 MLS 身份与签名密钥绑定

**Severity:** Critical  
**Status:** 未确认在野利用  
**CVE:** CVE-2026-71885  
**Affected:** 使用 MLS X.509 credential 的 Bouncy Castle Java 1.86 之前版本

MLS 实现可能接受没有正确绑定到 LeafNode signature key 的 X.509 credential。若部署允许 external commit，且没有独立 admission check，peer identity 的可信边界会受到影响。

升级到 1.86 或更高版本。使用 MLS 的系统还应确认成员准入没有只依赖受影响的 credential path。

#### Sources

- [CVE.org — CVE-2026-71885](https://www.cve.org/CVERecord?id=CVE-2026-71885)
- [Bouncy Castle — Java 1.86 release](https://github.com/bcgit/bc-java/discussions/2449)

### Fortra BoKS Manager CVE-2026-79898 可由 root 处理注入命令

**Severity:** Critical  
**Status:** 未确认在野利用  
**CVSS:** 9.1  
**CVE:** CVE-2026-79898  
**Affected:** FI-2026-015 覆盖的 Fortra BoKS Manager

拥有 CRL URL 管理权限的认证用户可经 BCC、WSI API 或命令行路径触发 `crlserver` 中的 shell command substitution。相关处理在 BoKS Master 上以 root 权限执行。

应用 Fortra 修复版本；在升级完成前限制管理接口只对可信管理网络开放。

#### Sources

- [Fortra — FI-2026-015](https://www.fortra.com/security/advisories/product-security/fi-2026-015)

## 其他重要动态

### Citrix NetScaler CVE-2026-88779 影响 SAML 部署

**Severity:** High  
**Status:** Citrix 初始公告未确认在野利用  
**CVSS:** 8.7 (CVSS v4)  
**CVE:** CVE-2026-88779  
**Affected:** 配置为 SAML SP 或 SAML IdP 的客户自管 NetScaler ADC/Gateway

该内存溢出会导致拒绝服务。Citrix 初始公告将暴露面限定到 SAML 场景，并给出 14.1-73.41、13.1-64.28 等修复版本。

先盘点启用 SAML 的设备，再按产品分支升级。

#### Sources

- [Citrix — CTX697174](https://support.citrix.com/external/article/CTX697174/citrix-netscaler-adc-and-citrix-netscale.html)

## 今日观察

- 本篇只有 Zammad 属于已确认在野利用，其余三项按暴露面和影响决定修补顺序，不把“高分漏洞”自动写成“正在遭攻击”。
- 两个事件位于认证或身份边界。升级之外，session 与管理访问日志可以提供更直接的排查线索。
