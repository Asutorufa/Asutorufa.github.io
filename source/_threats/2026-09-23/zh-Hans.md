---
id: "2026-09-23"
title: "Threat Intelligence Daily · 2026-09-23"
date: "2026-09-23"
updated: "2026-09-23 22:58:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "今日保留 4 个事件：Check Point 确认两项无需认证漏洞已遭利用；F5 披露遭零日利用的 BIG-IP APM 漏洞；Arista 确认 VeloCloud Orchestrator 漏洞存在在野利用；MemTensor 的 npm/PyPI 恶意版本投递 sckit 凭据窃取蠕虫。"
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 4
tags:
  - active-exploitation
  - zero-day
  - Check-Point
  - F5
  - BIG-IP
  - Arista
  - VeloCloud
  - supply-chain
  - npm
  - PyPI
  - MemTensor
  - sckit
  - CVE-2026-85102
  - CVE-2026-93616
  - CVE-2026-93952
  - CVE-2026-94127
cves:
  - CVE-2026-85102
  - CVE-2026-93616
  - CVE-2026-93952
  - CVE-2026-94127
iocs:
  - skyleen.fr
  - 8a8acaf167b3.skyleen.fr
  - 0b48fafd6fbe.skyleen.fr
  - 266297c6df27.skyleen.fr
  - c747d139e7e9.skyleen.fr
  - 73376a079d87.skyleen.fr
  - d4f77a3a8cb0.skyleen.fr
  - 10729e014d0e.skyleen.fr
  - 39ee644406829a4b630b31759c20478bc22d576d6a59b253ed86f72c360aa5ef
  - 92b46d18fc553c494eda714f204459edb74c205bf53b18a9092bcf02c7a6c5be
---

## 相比昨天

- **NEW — Check Point：**Check Point 确认 CVE-2026-85102 自 9 月 12 日起被用于攻击 Spark 客户，并确认 CVE-2026-93616 在 7 月 23 日已遭少量定向零日利用；两项漏洞均已进入 CISA KEV。
- **NEW — F5 BIG-IP APM：**CVE-2026-94127 在遭零日利用后公开。APM 配置为 OAuth Authorization Server 时，未认证攻击者可触发远程代码执行。
- **NEW — Arista VeloCloud：**Arista 公布 CVE-2026-93952，CVSS 3.1 为 10.0，并确认存在在野利用。Hosted 与 Dedicated VCO 已由 Arista 修补，本地部署需要管理员处理。
- **NEW — MemTensor：**9 月 23 日发布的恶意 npm/PyPI 版本包含跨平台 `sckit` 植入程序，可收集开发者和 CI 凭据，并包含继续传播的代码路径。

## 优先行动

- **立即：**修补受影响的 Check Point Security Gateway/Spark 与 Security Management 系统；检查异常的证书型 Mobile Access 登录，以及管理服务器上的脚本执行、Java class 加载迹象。
- **立即：**修补或隔离受影响的 F5 BIG-IP APM OAuth Authorization Server 与 Arista VeloCloud Orchestrator 本地部署；两项漏洞均已确认遭利用，应保留日志并执行失陷排查。
- **立即：**在主机、lockfile、CI runner 和 agent gateway 中查找 `@memtensor/memos-cloud-openclaw-plugin` 0.1.21、0.1.23、0.1.25 与 `MemoryOS` 2.0.34。加载过这些版本的系统按已失陷处理。
- **今日：**轮换受影响 MemTensor 环境可访问的 npm/PyPI 发布令牌、GitHub/GitLab 令牌、云凭据和 SSH 密钥；阻断并检索 `skyleen[.]fr` 及其子域名。

## 重点关注

### Check Point 网关与管理系统漏洞已遭利用

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** CVE-2026-93616 为 9.8  
**CVE:** CVE-2026-85102, CVE-2026-93616  
**Affected:** Check Point Security Gateway/Spark；Security Management Server、Multi-Domain Security Management Server、Log Server、Multi-Domain Log Server、SmartEvent

CVE-2026-85102 位于 VPN 证书处理流程，可在认证前触发 RCE。Check Point 表示针对 Spark 客户的利用尝试从 9 月 12 日开始，来源使用 VPN 和代理等匿名化基础设施。CVE-2026-93616 是 Management web service 中独立的认证前 path traversal，可执行任意脚本并加载任意 Java class；Check Point 在 7 月 23 日已观察到少量定向攻击，漏洞与修复在 9 月 22 日公开。

安装对应修复，并检查 Mobile Access、管理服务器日志及可疑登录后的内部端口/服务扫描。不要把较早安装的管理组件 LivePatch 直接视为 CVE-2026-93616 的修复依据。

#### Sources

- [Check Point — Active exploitation advisory](https://blog.checkpoint.com/security/security-advisory-action-required-active-exploitation-of-cve-2026-85102-and-a-management-pre-authentication-vulnerability-cve-2026-93616/)
- [CISA — Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### F5 BIG-IP APM CVE-2026-94127 遭零日利用

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVE:** CVE-2026-94127  
**Affected:** 配置为 OAuth Authorization Server 的 BIG-IP APM

CVE-2026-94127 允许未认证攻击者向受影响的 BIG-IP APM 发送恶意网络流量；当系统配置为 OAuth Authorization Server 时，可导致远程代码执行。F5 在观察到零日利用后发布修复，CISA 将其加入 KEV，修复期限为 9 月 25 日。

修补受影响系统，确认 APM 是否承担 OAuth Authorization Server 角色，并对此前暴露的设备执行失陷排查。

#### Sources

- [CISA — Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-94127)
- [BleepingComputer — F5 patches BIG-IP APM zero-day](https://www.bleepingcomputer.com/news/security/f5-warns-of-big-ip-apm-remote-code-execution-zero-day-exploited-in-attacks/)

### Arista VeloCloud Orchestrator CVE-2026-93952 已遭利用

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 10.0 (v3.1), 9.5 (v4.0)  
**CVE:** CVE-2026-93952  
**Affected:** VeloCloud Orchestrator on-prem；Hosted 与 Dedicated VCO 曾受影响，但 Arista 表示已完成修补

Arista 表示，不当输入验证可让远程攻击者访问 VCO 的特权内部功能并影响宿主机，进而影响 Orchestrator 及其管理数据的机密性、完整性和可用性。厂商确认漏洞已遭利用。暴露条件与 certificate-based Edge authentication 以及攻击者能否访问 VCO web interface 有关。

按实际 VCO 版本安装厂商提供的修复。判断是否暴露时应核对公告中的前置条件，并保留管理平面的遥测数据用于调查。

#### Sources

- [Arista — Security Advisory 0183](https://www.arista.com/en/support/advisories-notices/security-advisory/24765-security-advisory-0183)
- [Canadian Centre for Cyber Security — AV26-947 Update 1](https://www.cyber.gc.ca/en/alerts-advisories/arista-networks-security-advisory-av26-947)

### MemTensor npm/PyPI 恶意版本投递 sckit 凭据窃取程序

**Severity:** High  
**Status:** Confirmed malicious supply-chain compromise  
**Affected:** `@memtensor/memos-cloud-openclaw-plugin` 0.1.21、0.1.23、0.1.25；`MemoryOS` 2.0.34  
**Malware:** `sckit` / `supplychain.local`

多家研究机构在 9 月 23 日分别确认 MemTensor 的恶意发布版本。随包携带的 Go 植入程序会在插件或 Python 包被正常加载时启动，从用户 home 目录和环境中搜索凭据，并连接 `skyleen[.]fr` 下的基础设施。代码还包含通过包发布和受控 GitHub Actions workflow 继续传播的机制。禁用 install script 不能阻止这条执行路径。

加载过受影响版本的系统应按已失陷处理。移除恶意版本并停止 `sckit`，检查 `$HOME/.openclaw/.cache/runtime`、`$HOME/.memos/.cache/runtime` 和异常的 `runtime-update.yml`，随后轮换所有可访问凭据。若环境中存在 registry publish token，还需要核对近期包发布记录。

#### Sources

- [SafeDep — MemTensor npm and PyPI packages hit by a Go worm](https://safedep.io/memtensor-sckit-worm-npm-pypi/)
- [Socket — MemTensor packages compromised](https://socket.dev/blog/memtensor-compromise)
- [StepSecurity — sckit supply-chain worm](https://www.stepsecurity.io/blog/sckit-supply-chain-worm-hits-memtensor-npm-pypi-scopes)

## IOC summary

| Type | Indicator | Context |
| --- | --- | --- |
| Domain | `skyleen[.]fr` 及已观察到的子域名 | sckit campaign infrastructure |
| SHA256 | `39ee644406829a4b630b31759c20478bc22d576d6a59b253ed86f72c360aa5ef` | MemoryOS 2.0.34 wheel |
| SHA256 | `92b46d18fc553c494eda714f204459edb74c205bf53b18a9092bcf02c7a6c5be` | MemoryOS 2.0.34 source distribution |

## Daily observations

- 三项基础设施漏洞都已确认遭利用，且位于管理或认证平面。完成修补只能关闭当前漏洞，不能证明此前暴露期间没有发生入侵。
- MemTensor payload 通过正常 package load/import 路径启动，因此 `--ignore-scripts` 无法阻止执行。排查范围需要覆盖加载过受影响版本的开发机、CI runner 与 agent gateway。
