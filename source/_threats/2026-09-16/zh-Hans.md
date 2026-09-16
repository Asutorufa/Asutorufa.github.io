---
id: "2026-09-16"
title: "Threat Intelligence Daily · 2026-09-16"
date: "2026-09-16"
updated: "2026-09-16 23:00:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "Google 9 月 Pixel 公告确认 CVE-2026-58704 存在有限的定向利用迹象。英国 NCSC、美国 FBI 与荷兰 AIVD 公布了伊朗关联 CHOSEN BRICK 间谍软件的技术细节；Kaspersky 则披露 NightEagle 使用失窃 VPN 凭据、GhostContainer、RDP 隧道和 BlueKeep 攻击俄罗斯企业。OPSWAT 同时公开了两项已修复的 TP-Link Tapo C200 网络侧漏洞。"
total: 4
critical: 0
high: 4
medium: 0
low: 0
exploited: 3
tags:
  - active-exploitation
  - zero-day
  - mobile-security
  - cyber-espionage
  - spyware
  - apt
  - credential-theft
  - remote-access
  - iot
  - Google-Pixel
  - CHOSEN-BRICK
  - NightEagle
  - GhostContainer
  - TP-Link
  - CVE-2019-0708
  - CVE-2026-15315
  - CVE-2026-15316
  - CVE-2026-58704
cves:
  - CVE-2019-0708
  - CVE-2026-15315
  - CVE-2026-15316
  - CVE-2026-58704
iocs:
  - smdqservice.exe
  - winappx.exe
  - 1dcafb7f8448683281106b06dd22409a
  - 1f3034b706c78b35d8e34044e68c693a
---

## 相比昨天

- **NEW — Pixel 定向利用：** Google 9 月 Pixel 公告称 CVE-2026-58704 可能正遭到有限、定向的利用。
- **NEW — CHOSEN BRICK 公告：** 英国 NCSC、美国 FBI 与荷兰 AIVD 公布伊朗关联 Windows 间谍软件活动的技术细节，目标包括异见人士、活动人士和记者。
- **NEW — NightEagle 转向俄罗斯：** Kaspersky 记录了针对俄罗斯企业的入侵，涉及失窃 VPN 凭据、Exchange 上的 GhostContainer、隧道和 Active Directory/RDP 滥用。
- **NEW — Tapo C200 披露：** OPSWAT 公布两项网络邻接漏洞的技术细节；TP-Link 已通过 V5_1.4.6 固件修复。

## 优先行动

- **立即：** 将受支持的 Pixel 更新到 2026-09-05 或更高安全补丁级别；优先处理可能遭到定向监控的用户设备。
- **今天：** 对面临伊朗定向监控风险的人员，检查 Windows 端点上的 CHOSEN BRICK 持久化和异常 Telegram/云对象存储通信；敏感工作使用的个人设备也应纳入检查。
- **今天：** 在 Exchange 与 VPN 环境中排查 NightEagle 指标，包括异常 `devtunnels.ms`、`rdp2tcp` RDP 通道、DCSync 行为和非预期高权限账户创建。
- **今天：** 将 TP-Link Tapo C200 v5 更新至 V5_1.4.6 或更高版本，并避免让本地管理接口暴露在不可信网络中。

## 重点关注

### Pixel CVE-2026-58704 存在有限的定向利用

**Severity:** High  
**Status:** 已确认有限定向利用  
**CVE:** CVE-2026-58704  
**Affected:** 安全补丁级别低于 2026-09-05 的受支持 Google Pixel 设备

Google 将 CVE-2026-58704 列为 Pixel Modem 组件中的高危提权漏洞，并表示存在有限、定向利用的迹象。公告没有披露攻击者、目标群体或完整利用链。

#### 建议

安装 9 月 Pixel 更新，并确认安全补丁级别达到 2026-09-05 或更高。对高风险用户，应按 Google 已确认的利用状态安排补丁优先级，不必等待公开 PoC。

#### Sources

- [Google — Pixel Update Bulletin, September 2026](https://source.android.com/docs/security/bulletin/pixel/2026/2026-09-01)

### CHOSEN BRICK：通过定制社交工程投递的伊朗关联间谍软件

**Severity:** High  
**Status:** 已确认攻击活动 / 政府机构归因  
**Threat actor:** Iranian state cyber actors  
**Malware:** CHOSEN BRICK  
**Affected:** 被定向攻击的 Windows 用户，包括异见人士、活动人士和记者

NCSC、FBI 与 AIVD 报告称，攻击者先通过 WhatsApp、Telegram 等服务与目标建立联系，再发送与目标背景匹配的文件。已观察到的诱饵包括伪装软件和 MRI 检查结果。CHOSEN BRICK 使用当前用户的 Run key 持久化，可添加 Microsoft Defender 排除项，并通过 Telegram 进行 C2。其功能包括截屏、麦克风录音、窃取邮件和浏览器中的消息数据、下载后续载荷以及删除文件。

#### 建议

- 不安装通过陌生消息会话发送的软件或文件，从官方来源获取应用。
- 对可能遭到定向监控的人员启用抗钓鱼 MFA 和受管端点控制。
- 检查异常 Run-key 项和 CHOSEN BRICK 痕迹；如果人员的工作使其成为潜在目标，个人设备也应纳入排查。

#### IOC

- `smdqservice.exe` — 已观察到用于恶意 Run-key 持久化的文件名。
- `winappx.exe` — 已观察到用于恶意 Run-key 持久化的文件名。

#### Sources

- [UK NCSC — Iranian cyber targeting of dissidents, activists and journalists](https://www.ncsc.gov.uk/news/iranian-cyber-targeting-of-dissidents-activists-and-journalists)
- [UK NCSC — joint advisory announcement](https://www.ncsc.gov.uk/news/uk-allies-expose-spyware-iranian-state-actors-dissidents-activists-journalists)

### NightEagle 使用 GhostContainer、合法隧道与 RDP 维持内部访问

**Severity:** High  
**Status:** 已确认 APT 攻击活动  
**CVE:** CVE-2019-0708  
**Threat actor:** NightEagle / APT-Q-95  
**Malware:** GhostContainer  
**Affected:** Kaspersky 观察到的俄罗斯企业；攻击链集中涉及 Microsoft Exchange、VPN、RDP 与 Active Directory

Kaspersky GERT 调查的大多数事件以失窃 VPN 凭据作为入口。攻击者在 Exchange 上部署 .NET 后门 GhostContainer，将隧道工具存放在伪装的 GitHub 仓库中，并组合使用 Microsoft dev tunnels 与 `rdp2tcp`。其中一起事件中，攻击者利用 BlueKeep（CVE-2019-0708）创建管理员账户，随后出现 Kerberos 与 DCSync 相关活动，目标指向域级控制。

#### 建议

- 检查 VPN 登录来源，发现凭据泄露迹象时轮换相关凭据。
- 排查异常 `devtunnels.ms` 流量、RDP 事件 132/148 中的 `rdp2tcp` 或随机通道名、Impacket `atexec`、DCSync 以及 `netsh interface portproxy` 变更。
- 清理不再受支持或未修补的 RDP 系统。旧系统仍存在于可信内网时，BlueKeep 仍可用于横向移动。

#### IOC

- `1dcafb7f8448683281106b06dd22409a` — MD5，`AdobeSync.exe`。
- `1f3034b706c78b35d8e34044e68c693a` — MD5，`adobe_32.exe`。

#### Sources

- [Kaspersky Securelist — NightEagle targets Russian companies](https://securelist.com/tr/nighteagle-apt-ghostcontainer-and-tunneling/121323/)

## 重要漏洞

### TP-Link Tapo C200：本地网络认证重放与拒绝服务

**Severity:** High  
**Status:** 已修复；无已确认在野利用  
**CVE:** CVE-2026-15315, CVE-2026-15316  
**Affected:** 固件低于 V5_1.4.6 的 TP-Link Tapo C200 v5

OPSWAT 披露称，CVE-2026-15315 是本地管理认证流程中的重放问题，可让网络邻接的未认证攻击者获得有效管理员会话。CVE-2026-15316 可通过超大的加密配置输入触发 HTTPS 服务崩溃或重启。两项漏洞都要求攻击者能够访问摄像头所在网络；TP-Link 已于 8 月 18 日发布 V5_1.4.6 固件。

#### 建议

升级至 V5_1.4.6 或更高版本。不要向不可信网络开放摄像头管理接口；企业部署应将摄像头与敏感系统进行网络分段。

#### Sources

- [OPSWAT — TP-Link Tapo 摄像头认证绕过与 DoS 漏洞](https://japanese.opswat.com/blog/authentication-bypass-and-dos-vulnerabilities-opswat-discovers-cve-2026-15315-cve-2026-15316-in-tp-link-tapo-cameras)

## 今日观察

- Pixel 公告确认了利用状态，但没有提供攻击活动背景。补丁优先级可以依据 Google 的利用确认，归因则不能从现有信息推出。
- CHOSEN BRICK 与 NightEagle 都在攻击链中使用合法服务。检测需要结合端点和身份上下文，单纯封禁域名不足以覆盖这些活动。
- Tapo 漏洞要求网络邻接且已有补丁。是否暴露管理面、是否完成网络分段，比单独看 CVSS 更能决定处理顺序。
