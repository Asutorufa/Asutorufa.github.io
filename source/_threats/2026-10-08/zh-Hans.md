---
id: "2026-10-08"
title: "Threat Intelligence Daily · 2026-10-08"
date: "2026-10-08"
updated: "2026-10-10"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10 月 8 日保留 4 个事件：Atlassian CVE-2026-21589 状态更新为已观察到在野利用；Huntress 观测到攻击者串联 AhsayCBS CVE-2026-105133/105134 获取 SYSTEM 级 RCE；tensorlake npm 0.5.144 被植入 Shai-Hulud 蠕虫；美国 DOJ/FBI 扣押了与 Flax Typhoon Microscan、FishHub 工具相关的基础设施。"
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 2
tags:
  - active-exploitation
  - arbitrary-file-read
  - auth-bypass
  - rce
  - supply-chain
  - malicious-package
  - apt
  - Atlassian
  - Ahsay
  - Shai-Hulud
  - Flax-Typhoon
  - CVE-2026-21589
  - CVE-2026-105133
  - CVE-2026-105134
cves:
  - CVE-2026-105133
  - CVE-2026-105134
  - CVE-2026-21589
iocs:
  - iseekaigogo.com
  - sha256:25a0735d0db7dc40e5d45ce42d9c106067e6a66e184d967cfecfab17c3bcb5ef
  - sha256:b50a00900399ba99fb6ce1fc151519cb99d44320ef2a631f2237e1aea0ad6fec
  - c0cc.cc
  - 98aiblog.com
  - 98aicai.com
  - 98aicode.com
  - outlook3650.com
  - youtubecard.com
  - linkedinns.net
---

## 相比昨天

- **UPDATED — Atlassian：**Atlassian 10 月 5 日披露后，watchTowr 报告已观察到 CVE-2026-21589 在野利用。
- **UPDATED — AhsayCBS：**Huntress 从 10 月 7 日 23:20 UTC 开始观察到 CVE-2026-105133 与 CVE-2026-105134 被串联利用，攻击者获得无需认证 RCE 后投放 webshell 与 XMRig。
- **NEW — tensorlake npm：**0.5.144 被发布为恶意版本，包含 Shai-Hulud 变体，可窃取 secrets 并尝试通过供应链自我传播。
- **NEW — Flax Typhoon：**美国 DOJ/FBI 扣押 7 个与 Integrity Tech 相关域名，用于 Microscan、FishHub 与持久化基础设施。

## 优先行动

- **立即：**修补 Atlassian Data Center，并回查公告发布以来的 arbitrary-file-read 请求与敏感文件访问。
- **立即：**限制 AhsayCBS 管理入口、升级到当前修复版本，并调查 CBS service 的 child process、JSP webshell 与 miner 活动。
- **立即：**移除 tensorlake 0.5.144；任何安装过该版本的主机/CI job 都应轮换其可访问的 npm、GitHub、cloud 和本地 secrets，并检查仓库是否出现自传播修改。
- **今日：**把 Flax Typhoon 已扣押域名用于历史 hunting，检查异常 SoftEther VPN 与 Microscan/FishHub 相关行为。

## 重点关注

### Atlassian CVE-2026-21589 已出现真实利用

**Severity:** Critical  
**Status:** Confirmed in-the-wild exploitation  
**CVSS:** 9.3  
**CVE:** CVE-2026-21589  
**Affected:** 厂商公告中的 8 类 Atlassian Data Center/self-hosted 产品

状态相较 10 月 5 日发生变化：watchTowr 表示截至 10 月 6 日已观察到在野利用。漏洞可以未认证读取已知路径文件，可预测的配置文件和 secret 路径因此成为主要风险。

先修补，再检查修复前窗口内的请求日志和敏感文件访问。10 月 5 日厂商的「未发现利用」结论已经不能代表当前状态。

#### Sources

- [Atlassian — CVE-2026-21589 advisory](https://confluence.atlassian.com/security/cve-2026-21589-arbitrary-file-access-vulnerability-impacts-multiple-products-1870495748.html)
- [watchTowr — CVE-2026-21589 FAQ](https://watchtowr.com/intelligence/atlassian-arbitrary-file-access-vulnerability-jira-confluence-cve-2026-21589-faq/)

### AhsayCBS 两项漏洞被串联实现 SYSTEM 级 RCE

**Severity:** Critical  
**Status:** Confirmed active exploitation  
**CVE:** CVE-2026-105133, CVE-2026-105134  
**Affected:** 受影响且管理面可被触达的 AhsayCBS

Huntress 观察到攻击者先使用 CVE-2026-105133 绕过认证，再用 CVE-2026-105134 实现 RCE。后续活动包括 JSP webshell、侦察和伪装成 Microsoft Edge 组件的 XMRig。

升级到当前修复版本，并把管理接口限制到可信 IP/VPN。检查 AhsayCBS service 下的进程树、新增 JSP 文件、service 变更和 miner indicator。

#### Sources

- [Huntress — Active exploitation of AhsayCBS](https://www.huntress.com/blog/ahsaycbs-flaws-exploit)

### tensorlake npm 0.5.144 被植入 Shai-Hulud 供应链蠕虫

**Severity:** Critical  
**Status:** Confirmed malicious package publication  
**Affected:** npm package `tensorlake@0.5.144`

Aikido 发现恶意 npm 版本通过 preinstall 执行窃取本机、云与开发环境 secrets 的 payload，并尝试利用取得的 credential 继续传播。披露时没有发现 Tensorlake 的 PyPI 或 Cargo 包出现同类恶意版本。

安装过 0.5.144 的系统按已入侵处理，而不是只做版本升级。删除恶意版本，轮换进程可访问的 credential，并检查 repository 与 package publish history。

#### IOC

- `iseekaigogo[.]com`
- `SHA256 25a0735d0db7dc40e5d45ce42d9c106067e6a66e184d967cfecfab17c3bcb5ef`
- `SHA256 b50a00900399ba99fb6ce1fc151519cb99d44320ef2a631f2237e1aea0ad6fec`

#### Sources

- [Aikido — tensorlake npm package compromised](https://www.aikido.dev/blog/tensorlake-npm-package-compromised)

## Malware / APT / Campaign

### DOJ/FBI 扰乱 Flax Typhoon 的 Microscan 与 FishHub 基础设施

**Severity:** High  
**Status:** Confirmed state-linked intrusion infrastructure disruption  
**Threat actor:** Flax Typhoon / Integrity Technology Group  
**Tools:** Microscan, FishHub, SoftEther VPN

DOJ 表示法院授权的扣押行动切断了攻击者用于扫描、入侵关键基础设施和其他网络的部分基础设施。FishHub 用于 spear-phishing 与后续恶意软件投递，相关基础设施还被用于维持远程访问。

这些域名已经被执法部门扣押，更适合用于历史日志 hunting。命中时应结合时间戳和上下文，不把当前访问自动判定为仍在攻击。

#### IOC

- `c0cc[.]cc`
- `98aiblog[.]com`
- `98aicai[.]com`
- `98aicode[.]com`
- `outlook3650[.]com`
- `youtubecard[.]com`
- `linkedinns[.]net`

#### Sources

- [U.S. Department of Justice — Flax Typhoon infrastructure seizure](https://www.justice.gov/opa/pr/justice-department-and-fbi-seize-vulnerability-scanning-and-spear-phishing-tools-operated)

## IOC 摘要

| 事件 | Indicator | 上下文 |
| --- | --- | --- |
| tensorlake | `iseekaigogo[.]com` | Shai-Hulud C2 |
| tensorlake | `25a0735d...bcb5ef` | malicious setup script SHA256 |
| tensorlake | `b50a0090...d6fec` | malicious payload SHA256 |
| Flax Typhoon | `c0cc[.]cc` | Microscan infrastructure |
| Flax Typhoon | `98aicai[.]com` / `98aicode[.]com` | FishHub delivery infrastructure |

## 今日观察

- 本周前几天还处于「未确认利用」状态的两项漏洞，现在都有直接攻击遥测，因此历史日报必须按日期保留当时状态。
- tensorlake 属于恶意供应链发布，处置核心是 credential rotation 与 repository review，不是普通 patch workflow。
