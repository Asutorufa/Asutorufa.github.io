---
id: "2026-09-17"
title: "Threat Intelligence Daily · 2026-09-17"
date: "2026-09-17"
updated: "2026-09-17 23:00:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "Cisco 披露正在被利用的 ISE 未认证身份验证绕过漏洞，CVSS 10.0。ESET 记录了 FamousSparrow 使用新后门 SparroWocky 攻击拉丁美洲政府机构；CrowdStrike 披露通过 npm 分发的 PhantomRaven 信息窃取程序。Malwarebytes 同时跟踪到大规模 T-Mobile 主题短信钓鱼活动，JVN 则公布了东电「よりそうeねっと」应用中已修复的硬编码密钥漏洞。"
total: 5
critical: 1
high: 2
medium: 1
low: 1
exploited: 3
tags:
  - active-exploitation
  - zero-day
  - authentication-bypass
  - cyber-espionage
  - supply-chain
  - phishing
  - mobile-security
  - Cisco-ISE
  - FamousSparrow
  - SparroWocky
  - PhantomRaven
  - npm
  - T-Mobile
  - Yorisou-e-Net
  - CVE-2026-75553
  - CVE-2026-76460
cves:
  - CVE-2026-75553
  - CVE-2026-76460
iocs:
  - 38.54.57.17
  - t-mobile.biktpw.top
  - t-mobile.cugbjl.top
  - t-mobile.cymfjd.top
---

## 相比昨天

- **NEW — Cisco ISE：** Cisco 公布 CVE-2026-76460。该漏洞 CVSS 10.0，可绕过 ISE 与 ISE-PIC 身份验证，Cisco 已确认存在在野利用。
- **NEW — FamousSparrow：** ESET 披露新 C++ 后门 SparroWocky，攻击目标包括拉丁美洲政府机构。
- **NEW — PhantomRaven：** CrowdStrike 将携带 PhantomRaven 信息窃取程序的恶意 npm 包关联到一名以漏洞赏金为动机的攻击者。
- **NEW — T-Mobile 钓鱼：** Malwarebytes 记录到超过 1,000 个相近短信模板和至少 81 个短期轮换域名。
- **NEW — よりそうeねっと：** JVN 公布 CVE-2026-75553；Android 与 iOS 2.8.0 已修复硬编码加密密钥。

## 优先行动

- **立即：** 修补 Cisco ISE 与 ISE-PIC。CVE-2026-76460 没有绕过措施；升级完成前限制管理接口来源，并检查已暴露设备是否存在异常访问。
- **今天：** 拉丁美洲机构检查 Windows 主机上的 SparroWocky IOC、异常服务或 Run-key 持久化、443/8080 端口直连 C2，以及无法解释的 BOF 执行。
- **今天：** 检查 npm 依赖引入记录和开发机上的 PhantomRaven 相关非可信包；若发现执行痕迹，轮换可能暴露的凭据和 token。
- **监控：** 过滤 T-Mobile 积分到期主题短信域名，引导用户通过官方应用或网站核验通知，不从短信链接进入账户页面。

## 重点关注

### Cisco ISE CVE-2026-76460 已出现主动利用

**Severity:** Critical  
**Status:** Confirmed active exploitation  
**CVSS:** 10.0  
**CVE:** CVE-2026-76460  
**Affected:** Cisco Identity Services Engine (ISE) 与 ISE Passive Identity Connector (ISE-PIC)

Cisco 表示，未认证远程攻击者可以向受影响 API 端点发送特制请求，绕过 Web 管理界面的身份验证。公告于 9 月 16 日发布，已有修复版本，没有可用绕过措施。Cisco PSIRT 已确认该漏洞存在在野利用。

#### 建议

按当前 ISE 分支安装 Cisco 提供的修复版本。补丁完成前，仅允许可信管理网络访问管理接口。检查身份验证、API 与管理操作记录，定位无法对应到预期管理员的访问。

#### Sources

- [Cisco — Identity Services Engine Authentication Bypass Vulnerability](https://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-ISE-ABP-VNSW7Tn5.html)

### FamousSparrow 使用 SparroWocky 攻击拉丁美洲政府机构

**Severity:** High  
**Status:** Confirmed cyber-espionage campaign  
**Threat actor:** FamousSparrow  
**Malware:** SparroWocky  
**Affected:** ESET 观测到的拉丁美洲政府机构

ESET 以高置信度将该活动和 SparroWocky 归因于 FamousSparrow。自 2025 年中以来，ESET 遥测中 90% 的目标位于拉丁美洲。这个模块化 C++ 后门可以执行文件和命令、代理 TCP 流量、外传文件、定期截图并执行 Beacon Object Files。它通过 Windows 服务或 Run key 建立持久化，C2 通常直接连接 IP 的 443 端口，部分样本使用 8080。

#### 建议

- 使用 ESET 发布的 IOC 搜索终端，并检查到陌生基础设施 443/8080 端口的直接外连。
- 将异常服务、Run-key 持久化与文件外传、周期性截图行为关联检查。
- 阿根廷、厄瓜多尔、危地马拉、洪都拉斯、巴拿马、秘鲁、波多黎各和委内瑞拉的政府机构优先执行该项排查。

#### IOC

- `38.54.57.17` — ESET 观测到的 SparroWocky C2。

#### Sources

- [ESET Research — Beware the SparroWock: The backdoor that bites, the commands that catch](https://www.welivesecurity.com/en/eset-research/beware-sparrowock-backdoor-bites-commands-catch/)

### PhantomRaven 通过 npm 恶意包分发

**Severity:** High  
**Status:** Confirmed malicious-package campaign  
**Malware:** PhantomRaven  
**Affected:** 安装恶意 npm 包的开发者与组织

CrowdStrike 识别到一名以经济利益为动机的攻击者通过 npm 分发 JavaScript 信息窃取程序 PhantomRaven。该攻击者同时参与漏洞赏金活动；在一个已记录案例中，攻击者在依赖混淆造成入侵后主动联系潜在受害组织。CrowdStrike 根据代码特征和 token 分析，以高置信度判断该恶意软件可能使用 LLM 开发。这个判断与恶意包分发和窃取行为的已确认事实分开处理。

#### 建议

- 检查近期新增 npm 依赖，尤其是绕过正常评审或 lockfile 变更流程引入的包。
- 检查执行过非可信包的开发机与 CI worker。确认暴露后轮换代码仓库、云平台、CI 和包仓库凭据。
- 修复优先级依据包来源和实际行为；是否使用 LLM 编写不改变处置方式。

#### Sources

- [CrowdStrike — PhantomRaven: An LLM-Generated Information Stealer Developed for Bug Bounty Hunting](https://www.crowdstrike.com/en-us/blog/phantomraven-llm-generated-information-stealer-for-bug-bounty-hunting/)

## 其他值得关注

### T-Mobile 积分到期短信活动轮换短期钓鱼域名

**Severity:** Medium  
**Status:** Confirmed phishing campaign  
**Affected:** T-Mobile 客户及收到 T-Mobile 主题短信的用户

Malwarebytes 从 5 月初开始跟踪该活动。其数据中有超过 1,000 个相近消息模板，四个月内至少使用 81 个域名。短信伪造积分余额和临近到期时间，把用户引向轮换的 `t-mobile.<domain>.top` 页面，用于获取凭据、个人信息、支付信息或验证码。

#### 建议

阻断已知活动域名，并在适合的网络环境中检测 `t-mobile.*.top` 命名模式。用户应独立打开 T-Mobile 官方应用或网站核验账户通知，不从未请求的短信链接进入。

#### IOC

- `t-mobile.biktpw.top`
- `t-mobile.cugbjl.top`
- `t-mobile.cymfjd.top`

#### Sources

- [Malwarebytes — T-Mobile rewards points expiry texts are a phishing scam](https://www.malwarebytes.com/blog/threat-intel/2026/09/t-mobile-rewards-points-expiry-texts-are-a-phishing-scam)

### 「よりそうeねっと」应用使用硬编码加密密钥

**Severity:** Low  
**Status:** Fixed; no confirmed exploitation  
**CVSS:** 2.4  
**CVE:** CVE-2026-75553  
**Affected:** 东北电力 Android / iOS「よりそうeねっと」2.8.0 之前版本

JVN 表示，具备物理访问条件的攻击者可以从受影响应用中取得硬编码加密密钥。2.8.0 及之后版本已修复。JVN 没有报告在野利用。

#### 建议

将 Android 或 iOS 应用升级到 2.8.0 或之后版本。该问题要求物理访问，且影响限于机密性，因此优先级低于本期的网络可利用事件。

#### Sources

- [JVN — JVN#93985674](https://jvn.jp/jp/JVN93985674/index.html)

## 今日观察

- 本期漏洞中，Cisco ISE 同时具备未认证网络攻击面和已确认在野利用，补丁优先级高于新披露的本地/移动端问题。
- SparroWocky 与 PhantomRaven 的检测范围不同：前者是带有已公开基础设施的终端间谍后门，后者通过开发依赖进入环境，并可能暴露构建环境中的凭据。
- T-Mobile 活动持续轮换域名，单个域名阻断的有效期较短。结合短信语义、域名模式和通过官方应用核验通知，可以覆盖更多变体。
