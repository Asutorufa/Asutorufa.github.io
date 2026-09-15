---
id: "2026-09-13"
title: "Threat Intelligence Daily · 2026-09-13"
date: "2026-09-13"
updated: "2026-09-15"
language: zh-Hans
generated: true
summary: "截至 2026-09-13，最值得关注的威胁集中在已确认在野利用的开发运维、远程管理和边界设备漏洞，以及由多组国家背景攻击者快速采用的 BlueMoon 浏览器/Windows 零日利用链。CISA 新增 5 个 KEV，PaperCut 与 GitLab 也出现现实攻击；同时 Check Point 披露两项关键 VPN RCE，Brevo 事件导致 Trezor 用户遭定向钓鱼。"
total: 8
critical: 7
high: 1
medium: 0
low: 0
exploited: 7
tags:
  - active-exploitation
  - zero-day
  - supply-chain
  - phishing
  - apt
  - edge-device
  - devops
  - remote-access
  - vpn
  - CVE-2026-42016
  - CVE-2026-42018
  - CVE-2026-82329
  - CVE-2026-84869
  - CVE-2026-67276
  - CVE-2026-67277
  - CVE-2026-86060
  - CVE-2026-82078
  - CVE-2026-81578
  - CVE-2026-85706
  - CVE-2026-85046
  - CVE-2026-87491
  - CVE-2026-85880
  - CVE-2026-85102
  - CVE-2026-85103
cves:
  - CVE-2026-42016
  - CVE-2026-42018
  - CVE-2026-82329
  - CVE-2026-84869
  - CVE-2026-67276
  - CVE-2026-67277
  - CVE-2026-86060
  - CVE-2026-82078
  - CVE-2026-81578
  - CVE-2026-85706
  - CVE-2026-85046
  - CVE-2026-87491
  - CVE-2026-85880
  - CVE-2026-85102
  - CVE-2026-85103
iocs:
  - 82.192.72.4
  - 103.102.31.18
  - log.gitclone.org
  - 3.88.162.79
  - 64.207.232.6
  - ms.checrity.com
  - 79.133.56.90
  - brianwilli.com
  - fracons.com
  - getaiexo.com
  - elixnovorem.com
  - "sha256:a4a6a04d85eca8d584d939d2437c85a4f291207d8042f2ec002838e336b72ef5"
  - "sha256:295fc584f75e94108c9be945977db33ed80421f5d374eab188587c911dffd915"
---

## 今日概要

截至 9 月 13 日，攻击者仍在集中利用面向互联网的管理与基础设施产品。CISA 于 9 月 12 日将 JFrog Artifactory、ConnectWise ScreenConnect 与 MikroTik RouterOS 的 5 个漏洞加入 Known Exploited Vulnerabilities（KEV）目录，这使这些产品成为当天最需要优先处置的一组风险。

与此同时，GitLab 的关键路径遍历漏洞在披露后很快出现真实探测，PaperCut 已确认客户环境遭到利用；Proofpoint 还披露了被多个国家背景攻击集群快速采用的 BlueMoon 利用套件，将 Chrome V8 与 Windows 内核零日漏洞串联用于间谍活动。另有两项 Check Point VPN 关键 RCE 尚无在野利用证据，但由于设备位于网络边界，仍应优先修复。

## 重点关注

### JFrog Artifactory：认证绕过链已被用于获取管理员控制

> 攻击者正在组合多个 Artifactory 漏洞绕过认证并取得实例控制，随后建立持久化并部署后门。

**Severity:** Critical  
**Status:** 已确认在野利用 / CISA KEV  
**CVE:** CVE-2026-42016、CVE-2026-42018、CVE-2026-82329  
**Affected:** JFrog Artifactory Self-Hosted

Wiz 在真实攻击中观察到攻击者将 CVE-2026-42016 与 CVE-2026-42018 等问题组合使用，绕过认证后提升为管理员权限。后续活动包括创建持久化管理员账户、加载恶意 Groovy 插件以及部署 Rust 后门。CISA 于 9 月 12 日将其中两项漏洞加入 KEV。

#### 影响

成功利用可能导致 Artifactory 中的软件制品、凭据、构建流程和下游供应链同时暴露。对于把 Artifactory 作为 CI/CD 核心基础设施的环境，这不只是单台服务器被入侵，而可能继续影响开发和发布链。

#### 建议

- 尽快升级到 JFrog 公布的已修复版本，包括 7.111.21、7.117.28、7.125.20、7.133.29、7.146.38、7.161.20 或更新版本。
- 检查近期新增管理员账户、异常 Groovy 插件及未知服务/进程。
- 排查 Artifactory 主机到可疑外部基础设施的连接，并轮换可能暴露的高权限凭据。

#### IOC

- `log.gitclone[.]org`
- `3.88.162[.]79`
- `64.207.232[.]6`

#### Sources

- [Wiz Research — Artifactory under attack](https://www.wiz.io/blog/artifactory-under-attack-in-the-wild-exploitation-of-cve-2026-42016-cve-2026-4201)
- [JFrog Artifactory Self-Managed Releases](https://docs.jfrog.com/releases/docs/artifactory-self-managed-releases)
- [CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### MikroTik RouterOS：MikroTrick 接管链持续被真实利用

> RouterOS 多漏洞利用链可导致设备完全接管，CERT Polska 已发布真实攻击来源与检测线索。

**Severity:** Critical  
**Status:** 已确认在野利用 / CISA KEV  
**CVE:** CVE-2026-67276、CVE-2026-67277、CVE-2026-86060  
**Affected:** MikroTik RouterOS

CERT Polska 披露名为 MikroTrick 的攻击链，其中 CVE-2026-67276 与 CVE-2026-86060 可组合实现对设备的完全控制；CISA 的 KEV 更新同时覆盖 CVE-2026-67277 与 CVE-2026-86060。MikroTik 已发布修复版本。

#### 影响

边界路由器一旦被接管，攻击者可将其用于流量监控、持久化、横向移动、代理基础设施或后续入侵。由于 RouterOS 设备通常直接暴露在网络边缘，补丁优先级应高于仅看 CVSS 得出的排序。

#### 建议

- 升级到 MikroTik 建议的已修复版本，例如 7.25beta3、7.24.2、7.23.4 或 6.49.21 及后续安全版本。
- 检查未知高权限用户，尤其是异常的 `ops` 用户及相关登录活动。
- 检查来自已知恶意来源的管理访问，并限制 WinBox、SSH、Web 管理接口的公网暴露。

#### IOC

- `82.192.72[.]4` — CERT Polska 观察到的成功攻击来源
- `103.102.31[.]18` — 已观察到的利用尝试来源

#### Sources

- [CERT Polska — Vulnerabilities in MikroTik RouterOS actively exploited](https://cert.pl/en/posts/2026/09/vulnerabilities-in-mikrotik-routeros-actively-exploited/)
- [MikroTik — September 2026 Vulnerability](https://mikrotik.com/supportsec/september-2026-vulnerability/)
- [CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### BlueMoon：多组国家背景攻击者快速采用 Chrome + Windows 零日链

> Proofpoint 观察到至少四个间谍活动集群快速采用同一套利用链，目标横跨美国、越南、印度尼西亚和新加坡。

**Severity:** Critical  
**Status:** 已确认在野利用 / Zero-day chain  
**CVE:** CVE-2026-85046、CVE-2026-87491、CVE-2026-85880  
**Threat actors:** TA412 / APT31 及其他国家背景集群  
**Malware:** ShadowPad、GemStone

BlueMoon 将两个 Chrome V8 漏洞与 Windows 内核 ALPC 本地提权漏洞串联，用于从浏览器突破一路提升到操作系统权限。Proofpoint 最早在 TA412/APT31 活动中观察到该链，随后数天内又出现多个独立的国家背景攻击集群采用相同技术。

#### 影响

该链展示了高价值浏览器零日如何迅速从单一攻击者扩散到多个集群。被针对的组织包括美国非政府组织、航空航天、采矿和大宗商品行业，以及亚洲政府、制造业、咨询和金融目标。

#### 建议

- 确保 Chrome/Chromium 与 Windows 安全更新均已部署；只修浏览器或只修操作系统都不足以完整切断链条。
- 对受攻击终端进行浏览器子进程、异常扩展、提权行为与后续 C2 通信关联分析。
- 对高风险用户启用浏览器隔离、最小权限和更严格的网络出站策略。

#### IOC

- `ms.checrity[.]com`
- `79.133.56[.]90`
- `brianwilli[.]com`
- `fracons[.]com`
- `getaiexo[.]com`
- `elixnovorem[.]com`
- `SHA256 a4a6a04d85eca8d584d939d2437c85a4f291207d8042f2ec002838e336b72ef5`
- `SHA256 295fc584f75e94108c9be945977db33ed80421f5d374eab188587c911dffd915`

#### Sources

- [Proofpoint — Once in a BlueMoon](https://www.proofpoint.com/us/blog/threat-insight/once-bluemoon-multiple-state-aligned-threat-actors-rapidly-adopt-novel-exploit)

### GitLab CVE-2026-85706：披露后一天即出现真实探测

> 未认证攻击者可利用路径遍历读取任意文件，CVSS 10.0，公开披露后迅速出现互联网探测。

**Severity:** Critical  
**Status:** 已确认在野探测/利用活动  
**CVSS:** 10.0  
**CVE:** CVE-2026-85706  
**Affected:** GitLab CE/EE 18.7 至修复版本之前的多个分支

GitLab 在 19.3.2、19.2.6 与 19.1.8 中修复该漏洞。安全研究人员随后观察到互联网上针对该漏洞的真实探测，请勿因为漏洞刚披露而假定存在“缓冲期”。

#### 建议

- 至少升级到 19.3.2、19.2.6、19.1.8 或更新版本。
- 检查异常调用 `/api/v4/projects/{id}/repository/commits/` 的请求，尤其是包含可疑 `file.path` 参数的 POST。
- 若存在可疑读取行为，按敏感配置与凭据可能已经泄露处理并进行轮换。

#### Sources

- [GitLab — Patch Release 19.3.2](https://docs.gitlab.com/releases/patches/patch-release-gitlab-19-3-2-released/)
- [SecurityWeek — GitLab vulnerability exploited one day after disclosure](https://www.securityweek.com/gitlab-vulnerability-exploited-one-day-after-disclosure/)

## 其他已确认在野利用

### ConnectWise ScreenConnect CVE-2026-84869

**Severity:** Critical  
**Status:** 已确认在野利用 / CISA KEV  
**CVSS:** 9.9  
**Affected:** ScreenConnect 26.6.5 之前版本

该漏洞涉及授权与权限管理缺陷，可在已有远程会话中被滥用进行客户端侧文件传输和执行。ConnectWise 将其列为 Priority 1，Huntress 同期观察到恶意/类蠕虫式 ScreenConnect 部署与脚本执行活动，CISA 随后加入 KEV。

**建议：**立即升级到 26.6.5 或更新版本，并检查异常 ScreenConnect 实例、VBScript/PowerShell 执行和未经授权的远程会话。

#### Sources

- [ConnectWise Security Bulletin](https://www.connectwise.com/company/trust/security-bulletins/2026-09-08-screenconnect-bulletin)
- [Huntress — Rogue ScreenConnect Installations](https://www.huntress.com/blog/rogue-screenconnect-installations)
- [CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### PaperCut NG/MF：CVE-2026-82078 与 CVE-2026-81578 已出现客户环境攻击

**Severity:** Critical  
**Status:** 已确认在野利用  
**CVE:** CVE-2026-82078、CVE-2026-81578  
**Affected:** PaperCut NG/MF

PaperCut 已确认涉及这两项漏洞的客户安全事件。CVE-2026-82078 涉及不安全的动态类加载，CVE-2026-81578 涉及认证绕过。厂商已在 9 月 10 日发布正式维护版本，替代此前的紧急补丁。

**建议：**升级到 26.0.5、25.0.13、24.1.10 或厂商提供的更新安全版本，并按照 PaperCut 公告中的日志检测建议回溯排查。

#### Sources

- [PaperCut — Urgent Security Advisory](https://www.papercut.com/kb/Main/security-bulletin-27-aug-2026-urgent-security-advisory/)
- [SecurityWeek — PaperCut flaws exploited in AI-powered attacks](https://www.securityweek.com/papercut-flaws-exploited-in-ai-powered-attacks/)

## 重要漏洞

### Check Point VPN：两项关键 RCE 需要优先修复

**Severity:** Critical  
**Status:** 暂无可靠在野利用证据  
**CVE:** CVE-2026-85102、CVE-2026-85103  
**Affected:** Check Point Remote Access / Site-to-Site VPN

CVE-2026-85102 涉及认证绕过并可进一步实现远程代码执行，CVE-2026-85103 是 ASN.1 解码过程中的堆溢出 RCE。Check Point 表示漏洞由内部发现，目前没有观察到在野利用，但网络边界 VPN 设备本身具有极高攻击价值。

**建议：**部署 Check Point 提供的 Live Patch 或最新 Jumbo Hotfix，并确认公网 VPN 网关已完成修复。

#### Sources

- [Check Point — Critical Security Advisory: VPN Vulnerabilities](https://community.checkpoint.com/t5/General-Topics/Action-Required-Critical-Security-Advisory-VPN-Vulnerabilities/m-p/282073/highlight/true)
- [SecurityWeek — Check Point patches critical VPN vulnerabilities](https://www.securityweek.com/check-point-patches-critical-vpn-vulnerabilities/)

## Supply Chain / Phishing

### Brevo 事件波及 Trezor：第三方邮件平台被用于定向钱包钓鱼

**Severity:** High  
**Status:** 已确认真实攻击  
**Affected:** Brevo 客户账户、Trezor newsletter 用户

Brevo 披露其 SAML SSO 隔离问题被攻击者利用，攻击者访问了 138 个客户账户，其中 6 个被用于发送钓鱼邮件、43 个发生联系人导出。Trezor 表示约 347,000 个 newsletter 地址受到影响，攻击者还利用合法营销渠道发送诱导用户提交钱包备份的钓鱼信息；在相关基础设施被下线前，约 2,500 名用户点击了恶意链接。

Trezor 核心钱包系统没有被入侵，但此次事件再次说明合法第三方通信渠道被接管后，钓鱼可信度和投递成功率会显著提高。

**建议：**Trezor 用户应忽略任何要求输入 wallet backup / seed phrase 的邮件或应用；组织应重新评估第三方营销与邮件 SaaS 的 SSO、导出权限及高风险操作审计。

#### Sources

- [Trezor — Security incident at Brevo](https://trezor.io/blog/news/security-incident-at-brevo-our-third-party-email-provider)
- [Brevo — Incident write-up](https://status.brevo.com/incidents/01M266V1CZKJQNGZRNEGFD5CQE/write-up)

## IOC 摘要

以下 IOC 均来自上述原始研究中的明确攻击上下文。共享托管基础设施或 IP 的归属可能变化，实际封禁前应结合时间、日志和资产环境判断。

| 事件 | IOC | 类型 |
| --- | --- | --- |
| Artifactory | `log.gitclone[.]org` | payload domain |
| Artifactory | `3.88.162[.]79` | infrastructure IP |
| Artifactory | `64.207.232[.]6` | C2 IP |
| MikroTik | `82.192.72[.]4` | observed attacker IP |
| MikroTik | `103.102.31[.]18` | exploit-attempt IP |
| BlueMoon | `ms.checrity[.]com` | ShadowPad C2 |
| BlueMoon | `79.133.56[.]90` | fallback C2 |
| BlueMoon | `brianwilli[.]com` | payload/download infrastructure |
| BlueMoon | `fracons[.]com` | C2 |
| BlueMoon | `getaiexo[.]com` | C2 |
| BlueMoon | `elixnovorem[.]com` | C2 |

## 今日观察

- **管理面正在成为高价值攻击面。** Artifactory、ScreenConnect、RouterOS、GitLab 与 PaperCut 都属于运维或管理链路，一旦被攻陷，影响通常能继续扩展到下游资产。
- **“刚披露”不等于有补丁缓冲期。** GitLab 漏洞在披露后极短时间内就出现真实探测，互联网暴露资产需要把关键漏洞修复从周期性工作变成事件响应。
- **零日链扩散速度值得单独监控。** BlueMoon 在多个国家背景攻击集群间快速出现，说明高价值 exploit chain 可能在不同组织间迅速复用。
- **第三方 SaaS 仍是身份与信任链的薄弱点。** Brevo/Trezor 事件没有攻破钱包核心系统，却利用可信邮件渠道成功触达大量用户。