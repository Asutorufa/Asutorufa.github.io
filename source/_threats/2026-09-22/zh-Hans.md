---
id: "2026-09-22"
title: "Threat Intelligence Daily · 2026-09-22"
date: "2026-09-22"
updated: "2026-09-22 23:02:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "CISA 将已遭利用的 Zyxel GS1900 命令执行漏洞加入 KEV，相关攻击已入侵 996 台交换机。Microsoft 在超过 1.2 万个邮箱遭入侵后联合打击 EvilTokens。Volexity 确认第三个中国关联攻击者使用 Chrome/Windows 零日链；Arctic Wolf 则报告 Veeam Agent 本地提权漏洞已遭实际利用。"
total: 4
critical: 0
high: 4
medium: 0
low: 0
exploited: 4
tags:
  - active-exploitation
  - Zyxel
  - network-infrastructure
  - EvilTokens
  - phishing
  - device-code-phishing
  - business-email-compromise
  - UTA0565
  - CLEANGULP
  - zero-day
  - Google-Chrome
  - Microsoft-Windows
  - Veeam
  - privilege-escalation
  - CVE-2026-7273
  - CVE-2026-85046
  - CVE-2026-87491
  - CVE-2026-85880
  - CVE-2026-32996
cves:
  - CVE-2026-32996
  - CVE-2026-7273
  - CVE-2026-85046
  - CVE-2026-85880
  - CVE-2026-87491
iocs:
  - thecovnresation.com
  - personclouds.com
  - outsourcingwise.net
  - halal-navi.net
  - halaltak.net
  - thecovnresation.net
  - borneobulletins.top
---

## 相比昨天

- **NEW — Zyxel GS1900：** CISA 在确认实际利用后将 CVE-2026-7273 加入 KEV。基于 GreyNoise 遥测的公开报告显示，一名中文攻击者从 48 个国家的 996 台交换机中窃取了配置、网络信息和 root 密码哈希。
- **NEW — EvilTokens：** Microsoft 与合作方已打击该钓鱼服务。Microsoft 将其关联到超过 1.2 万个被入侵邮箱，涉及逾 1 万家组织；行动查封 50 个网站，并停用超过 150 个相关域名。
- **NEW — UTA0565：** Volexity 确认第三个中国关联攻击者使用此前披露的 Chrome/Windows 零日利用链。9 月 3–4 日的攻击以亚洲政府机构为目标之一，通过仿冒网站投递新后门 CLEANGULP。
- **NEW — Veeam Agent：** Arctic Wolf 报告 CVE-2026-32996 已遭实际利用。本地低权限用户可复用高权限会话标识，以 SYSTEM 权限执行命令。

## 优先行动

- **立即：** 更新 Zyxel GS1900 至对应型号的修复固件，将管理接口限制在管理网络内，轮换管理凭据，并检查交换机是否存在配置或凭据被窃取的迹象。
- **立即：** 升级受 CVE-2026-32996 影响的 Veeam Agent for Microsoft Windows 13；优先处理共享系统、服务器和管理员工作站。
- **今天：** 在业务不需要时通过 Conditional Access 禁用 device-code flow。若怀疑 EvilTokens 入侵，撤销登录会话，检查恶意 inbox rule 和 Microsoft Graph 活动；需要立即隔离时暂时禁用账号。
- **今天：** 确认 Chrome/Chromium 与 Windows 已包含 CVE-2026-85046、CVE-2026-87491、CVE-2026-85880 的修复，并检索 UTA0565 仿冒域名和 CLEANGULP 持久化痕迹。

## 重点关注

### Zyxel GS1900 CVE-2026-7273 在数据窃取攻击后进入 KEV

**Severity:** High  
**Status:** 已确认实际利用 / CISA KEV  
**CVSS:** 8.8  
**CVE:** CVE-2026-7273  
**Affected:** 运行受影响 2.90 固件的 Zyxel GS1900 系列交换机

CVE-2026-7273 是 GS1900 管理 CGI 中的栈缓冲区溢出。攻击者无需认证，但需要能够从 LAN 访问管理接口；构造 HTTP 请求后可执行操作系统命令。Zyxel 在 6 月发布修复固件，CISA 于 9 月 21 日将漏洞加入 KEV，并将联邦机构修复期限设为 9 月 24 日。

基于 GreyNoise 遥测的公开报告称，攻击约从 8 月 17 日开始，覆盖 48 个国家的 996 台交换机。攻击者窃取了设备配置、网络信息和 root 密码哈希；其中 564 台设备还保留了出厂默认凭据。

#### 建议

- 按具体 GS1900 型号安装 Zyxel 修复固件，并在重启后核对实际运行版本。
- 仅允许专用管理网络或 VLAN 访问 HTTP/HTTPS 管理接口。
- 轮换管理凭据，检查交换机配置、管理日志和出站活动，确认是否发生过入侵。

#### 来源

- [Zyxel — CVE-2026-7273 安全公告](https://www.zyxel.com/global/en/support/security-advisories/zyxel-security-advisory-for-stack-based-buffer-overflow-vulnerability-in-gs1900-series-switches-06-16-2026)
- [CISA — Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-7273)
- [Help Net Security — 996 台 Zyxel 交换机遭入侵](https://www.helpnetsecurity.com/2026/09/22/zyxel-switches-cve-2026-7273-vulnerability-exploited/)

### EvilTokens 在超过 1.2 万个邮箱遭入侵后被打击

**Severity:** High  
**Status:** 已确认攻击活动；基础设施已遭打击  
**Affected:** Microsoft 365 身份与邮箱  
**Threat actor:** Storm-2992 / EvilTokens operators

Microsoft 表示，EvilTokens 通过 device-code phishing 获取认证 token，自 2 月以来已关联到逾 1 万家组织的超过 1.2 万个被入侵邮箱。入侵后的工具可扫描邮箱、筛选财务和管理层目标、通过 inbox rule 保持访问，并为 BEC 欺诈准备目标信息。

Microsoft 与合作方查封 50 个网站并停用超过 150 个相关域名。英国警方于 9 月 11 日逮捕两名涉嫌参与运营的男子。基础设施被打击不会自动使已经窃取的 token 失效。

#### 建议

- 业务不需要 device-code flow 时，通过 Conditional Access 禁用；确有需要时，仅对专用设备账号设置例外。
- 怀疑账号被入侵时，撤销登录会话，检查 inbox rule 和 Microsoft Graph 活动；需要立即阻断 token 使用时，可暂时禁用账号。
- 对付款信息变更和异常转账请求，通过第二个可信渠道独立确认。

#### 来源

- [Microsoft Threat Intelligence — Unmasking EvilTokens](https://www.microsoft.com/en-us/security/blog/2026/09/22/unmasking-eviltokens-getting-to-the-root-of-device-code-phishing/)
- [Microsoft Digital Crimes Unit — Disrupting EvilTokens](https://blogs.microsoft.com/on-the-issues/2026/09/22/disrupting-eviltokens-the-ai-chatbot-built-for-cybercrime/)

### UTA0565 使用共享的 Chrome/Windows 零日链投递 CLEANGULP

**Severity:** High  
**Status:** 已确认 9 月 3–4 日零日利用；目前已有修复  
**CVE:** CVE-2026-85046、CVE-2026-87491、CVE-2026-85880  
**Affected:** Google Chrome/Chromium 与 Microsoft Windows  
**Threat actor:** UTA0565  
**Malware:** CLEANGULP

Volexity 将 UTA0565 确认为第三个使用同一利用链的中国关联攻击者。攻击发生于 9 月 3–4 日，当时相关漏洞尚未修复。攻击者仿冒媒体、NGO 等网站，并向包括亚洲政府机构在内的目标投递利用链。

最终载荷 CLEANGULP 是此前未公开的后门，支持命令执行、进程枚举、文件上传下载和附加载荷执行。Volexity 根据利用组件的重合，判断同一核心利用工具在多个中国攻击者之间被共享、修改和投入使用；这不等于这些攻击者属于同一个组织。

#### Indicators

- `thecovnresation[.]com` — CLEANGULP C2 / The Conversation 仿冒域名
- `personclouds[.]com`
- `outsourcingwise[.]net`
- `halal-navi[.]net`
- `halaltak[.]net`
- `thecovnresation[.]net`
- `borneobulletins[.]top`

#### 建议

- 核对 Chrome/Chromium 与 Windows 补丁级别，确保三项 CVE 均已修复。
- 在 DNS、代理和终端遥测中检索公开的仿冒域名及 CLEANGULP 痕迹。
- 发现访问仿冒站点的记录时，按可能发生过利用处理并执行终端取证，不要只封禁域名。

#### 来源

- [Volexity — Mind the (Patch) Gap, Part 2](https://www.volexity.com/blog/2026/09/21/mind-the-patch-gap-part-2-fake-websites-used-to-deploy-chrome-windows-0-day-exploits/)

### Veeam Agent CVE-2026-32996 已用于本地提权

**Severity:** High  
**Status:** Arctic Wolf 报告已遭实际利用  
**CVSS:** 7.3  
**CVE:** CVE-2026-32996  
**Affected:** Veeam Agent for Microsoft Windows 13.0.1.2067 及更早的 13.x 构建

Veeam Endpoint Backup 服务会把高权限管理员主体缓存到由客户端控制的 session UID，但该 UID 没有绑定到请求用户或连接。普通用户可从 Veeam 日志读取有效的高权限 UID，再利用它以 `NT AUTHORITY\\SYSTEM` 权限执行命令。

利用需要攻击者已经取得本地低权限访问，因此它不是远程初始入侵漏洞。Arctic Wolf 报告已观察到实际利用并建议升级。Veeam Backup & Replication 13.0.2.29 会将 Windows Agent 更新到已修复的 13.0.3.1220。

#### 建议

- 升级受影响的 Veeam Agent，并在修复后核对实际安装的 Agent build。
- 优先处理存在共享本地访问、特权工作流、备份管理权限或敏感数据的系统。
- 完成更新前，限制交互式/本地访问，并监控 Veeam 服务产生的异常子进程。

#### 来源

- [Arctic Wolf — CVE-2026-32996 active exploitation](https://arcticwolf.com/resources/blog/update-active-exploitation-cve-2026-32996-of-veeam-agent/)
- [Veeam — KB4852](https://www.veeam.com/kb4852)

## IOC 摘要

| 类型 | Indicator | Context |
| --- | --- | --- |
| Domain | `thecovnresation[.]com` | CLEANGULP C2 / 仿冒域名 |
| Domain | `personclouds[.]com` | UTA0565 基础设施 |
| Domain | `outsourcingwise[.]net` | UTA0565 评估关联基础设施 |
| Domain | `halal-navi[.]net` | UTA0565 评估关联基础设施 |
| Domain | `halaltak[.]net` | UTA0565 评估关联基础设施 |
| Domain | `thecovnresation[.]net` | UTA0565 评估关联基础设施 |
| Domain | `borneobulletins[.]top` | UTA0565 评估关联基础设施 |

## 当日观察

- Zyxel 与 Veeam 的取证前提不同：CVE-2026-7273 可由管理 LAN 上的未认证攻击者触发，CVE-2026-32996 则要求攻击者已经取得本地低权限访问。
- EvilTokens 的 token 窃取意味着单独重置密码不足以完成处置，还需要撤销会话、检查 inbox rule 和调查入侵后的活动。
- UTA0565 使用的是此前已知的漏洞链。本次新增情报是第三个攻击者、目标与仿冒基础设施，以及 CLEANGULP 载荷，而不是一组新披露的 CVE。
