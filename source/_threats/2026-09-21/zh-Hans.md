---
id: "2026-09-21"
title: "Threat Intelligence Daily · 2026-09-21"
date: "2026-09-21"
updated: "2026-09-21 23:00:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "Fortinet 遥测确认 Orkes Conductor 未认证 RCE 正遭实际利用。Kaspersky 披露一起制造业入侵：攻击者通过 Group Policy 实施不加密文件的勒索；Securonix 则解码 TASK#STOMP，确认其具备持续文档窃取和远程命令执行能力。"
total: 3
critical: 1
high: 2
medium: 0
low: 0
exploited: 3
tags:
  - active-exploitation
  - remote-code-execution
  - Orkes-Conductor
  - ransomware
  - encryptionless-extortion
  - Group-Policy
  - TASK-STOMP
  - PowerShell
  - espionage
  - malware
  - CVE-2026-58138
cves:
  - CVE-2026-58138
iocs:
  - corecloudfileshare.xyz
  - attachmentsharingdrive.xyz
  - 5251098838fab2f3192307cac99ad2d3a71b55ba1f256412d43a9dfb3b93ac58
  - 103b4d4a666bc0a89c10c9df55f54f4be5fa111e8429c37ae14fa8f16cb50fe8
  - 02ba7c982b68ec8f5a1cb47c6f3969f3f2f38ea9b4ebb8833d1b8b0ba2ab1407
---

## 相比昨天

- **NEW — Orkes Conductor：** Fortinet 遥测确认 CVE-2026-58138 正遭实际利用。该漏洞位于认证前可访问的 workflow API，可在受影响的 Conductor 服务器上执行操作系统命令。
- **NEW — Payload：** Kaspersky 披露一起针对中东制造企业的入侵。攻击者窃取数据后，通过恶意 Group Policy Object 禁用本地管理员账号并投放勒索界面，没有部署传统文件加密器。
- **NEW — TASK#STOMP：** Securonix 解码最终 PowerShell payload，确认其可自动窃取业务文档、持续监控文件、收集 Wi-Fi 密码与剪贴板、截图，并通过两个 C2 域名执行任意远程命令。
- **ONGOING — Linux KEV：** 9 月 21 日是 CISA 为 CVE-2025-39682、CVE-2026-53266 和 CVE-2025-39964 设定的修复日期。这三项已在 9 月 19 日日报记录；当前公开资料仍未给出攻击者身份或共同利用链。

## 优先行动

- **立即：** 将公网可达的 Orkes Conductor 升级到 3.30.2 或更高版本。尚不能升级时，先移除 workflow API 的公网访问，并检查历史 workflow 提交记录与异常子进程。
- **立即：** 在 Windows 终端搜索 TASK#STOMP 的 `%LOCALAPPDATA%\WinDefendSvc` 路径、隐藏 PowerShell 后启动 `csc.exe` 的进程链、两个已确认 C2 域名，以及 `wscript.exe` 连续创建 XML scheduled task 的行为。
- **今天：** 审计 Active Directory 中 Group Policy 的创建和修改，重点检查批量禁用本地管理员、修改桌面或锁屏、分发脚本或任务的策略。GPO 管理应使用独立特权账号并记录变更。
- **今天：** 完成三项 Linux kernel KEV 的修复，并检查修复前遥测。CISA 对这三项的目标日期为 9 月 21 日。

## 重点关注

### Orkes Conductor 未认证 RCE 正遭实际利用

**Severity:** Critical  
**Status:** Confirmed active exploitation  
**CVSS:** 9.8 (v3.1) / 9.3 (v4)  
**CVE:** CVE-2026-58138  
**Affected:** Orkes Conductor 3.21.21 至 3.30.2 之前版本

CVE-2026-58138 允许未认证远程客户端提交包含恶意 JavaScript 或 Python 表达式的 workflow 定义。受影响的 GraalVM evaluator 开放了不受限制的 host access，这些表达式因此可以用 Conductor 进程权限执行操作系统命令。

Fortinet 报告称，截至 9 月 9 日的一个 24 小时窗口内阻止了 1,290 次攻击尝试，9 月 2 日至 9 日累计接近 7,000 次。相关公开报告引用的独立 honeypot 遥测最早在 7 月 24 日观察到利用尝试。Conductor 3.30.2 已修复该问题。

#### 建议

- 升级到 Conductor 3.30.2 或更高版本，并确认实际运行的容器和旧 replica 均已更新。
- 无法立即升级时，只允许可信网络或经过认证的 gateway 访问 workflow API。
- 检查 workflow 中异常的 INLINE、LAMBDA、DO_WHILE、SWITCH task 及其中的 JavaScript/Python 表达式，并关联 Conductor 的异常子进程和出站连接。

#### Sources

- [The Hacker News — Critical Pre-Auth RCE in Orkes Conductor Exploited in the Wild](https://thehackernews.com/2026/09/critical-pre-auth-rce-in-orkes.html)

### Payload 通过 Group Policy 实施不加密文件的勒索

**Severity:** High  
**Status:** Confirmed intrusion and extortion incident  
**Affected:** 攻击者取得 Group Policy 修改权限的 Windows / Active Directory 环境

Kaspersky Global Emergency Response Team 披露一起中东制造企业事件。攻击者先窃取企业数据，随后创建名为 `PAYLOAD` 的恶意 Group Policy Object，用它禁用本地管理员账号，并把桌面与锁屏修改为勒索内容。该事件中没有观察到传统文件加密 payload。

被窃数据随后被发布到暗网。这里的执行条件是 Active Directory 控制权：攻击者一旦能够修改 Group Policy，仅清理终端上的恶意文件不会移除继续分发配置的策略。

#### 建议

- 审计特权 Group Policy 变更；对批量修改本地管理员权限、桌面/锁屏、启动脚本、scheduled task 或安全控制的策略告警。
- 将 GPO 修改权限限制给独立管理身份，并为这些账号启用强认证。
- 事件响应时先保存域控制器和 Group Policy 审计日志，再从策略源头移除恶意配置，然后恢复终端状态。

#### Sources

- [Kaspersky — Payload ransomware uses encryptionless extortion](https://www.kaspersky.com/about/press-releases/kaspersky-uncovers-new-payload-the-stealth-ransomware-that-hijacks-corporate-devices-without-encrypting-files)

### TASK#STOMP 持续窃取文档并维护双路 PowerShell C2

**Severity:** High  
**Status:** 已在 Windows 终端确认恶意软件；活动规模未知  
**Affected:** 执行相关 VBS / PowerShell 链的 Windows 终端  
**Malware:** TASK#STOMP

Securonix 基于一台受感染终端进行分析，并解码两个 Base64 payload。该链创建四个 XML scheduled task，把 `msdiag.vbs` 写入用户 Startup 目录，对 staged files 修改时间戳，启动两个隐藏 PowerShell 模块，并在运行时编译小型 C# helper。解码后的 payload 会扫描固定磁盘中的业务文档，持续监控新增和修改文件，窃取已保存的 Wi-Fi 密码与剪贴板内容、截图，并执行任意 PowerShell 命令。

两个模块都使用 `corecloudfileshare[.]xyz` 和 `attachmentsharingdrive[.]xyz`，支持自动 failover，并携带静态认证 token。Securonix 没有把该活动归因给已知攻击者，也没有确认初始投递方式。因此，本报告不把观察到的 IranTenders URL 整体判定为恶意域名。

#### Indicators

- `corecloudfileshare[.]xyz`
- `attachmentsharingdrive[.]xyz`
- `5251098838fab2f3192307cac99ad2d3a71b55ba1f256412d43a9dfb3b93ac58` — VBS launcher
- `103b4d4a666bc0a89c10c9df55f54f4be5fa111e8429c37ae14fa8f16cb50fe8` — `sys_loader.ps1`
- `02ba7c982b68ec8f5a1cb47c6f3969f3f2f38ea9b4ebb8833d1b8b0ba2ab1407` — `diag_pack.dat`

#### 建议

- 关联检测 `wscript.exe` 在短时间内创建多个 XML scheduled task、AppData 中隐藏 PowerShell 执行以及后续 `csc.exe` / `cvtres.exe` 活动。
- 阻断两个已确认 C2 域名，并回查历史 proxy/DNS 遥测。
- 隔离清理时一次性移除全部 scheduled task、Startup 副本和 staged files。重启后确认 `msdiag.vbs`、`sys_loader.ps1`、`win_conn.ps1` 没有再次出现。

#### Sources

- [Securonix — TASK#STOMP: PowerShell Backdoor for Document Theft and Remote Access](https://www.securonix.com/blog/task-stomp-powershell-backdoor-document-theft-remote-access/)

## IOC 摘要

| 类型 | Indicator | 用途 |
| --- | --- | --- |
| Domain | `corecloudfileshare[.]xyz` | TASK#STOMP primary C2 |
| Domain | `attachmentsharingdrive[.]xyz` | TASK#STOMP backup C2 |
| SHA256 | `5251098838fab2f3192307cac99ad2d3a71b55ba1f256412d43a9dfb3b93ac58` | VBS launcher / `msdiag.vbs` |
| SHA256 | `103b4d4a666bc0a89c10c9df55f54f4be5fa111e8429c37ae14fa8f16cb50fe8` | `sys_loader.ps1` |
| SHA256 | `02ba7c982b68ec8f5a1cb47c6f3969f3f2f38ea9b4ebb8833d1b8b0ba2ab1407` | `diag_pack.dat` |

## 每日观察

- 三个事件都包含已观察到的恶意活动，但只有 Orkes 是「漏洞已确认遭利用」。Payload 与 TASK#STOMP 属于入侵或恶意软件活动，不把两者写成漏洞利用结论。
- Orkes workflow 与 Active Directory Group Policy 都属于管理控制面。事件响应需要同时清除服务端恶意配置和终端残留，单独清理终端不足以结束这类入侵。
- TASK#STOMP 的初始访问方式和活动规模仍未确认。本报告只使用已发布的基础设施与行为进行检测建议，不补写攻击者归因或目标行业。
