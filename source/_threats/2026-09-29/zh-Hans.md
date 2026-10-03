---
id: "2026-09-29"
title: "Threat Intelligence Daily · 2026-09-29"
date: "2026-09-29"
updated: "2026-10-03 03:30:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "9 月 29 日同时出现两类主动攻击研究和两组基础软件漏洞：Microsoft 披露利用 MSP360 与 ScreenConnect 的钓鱼活动，以及 Star Blizzard 的 RedFlick 投递技术；JVN 发布 Pgpool-II 7 项 CVE；CERT/CC 披露 Authlib JWS 签名校验绕过。"
total: 4
critical: 0
high: 4
medium: 0
low: 0
exploited: 2
tags:
  - phishing
  - credential-theft
  - rmm
  - Star-Blizzard
  - RedFlick
  - CosmicPulse
  - Authlib
  - Pgpool-II
  - CVE-2026-96760
cves:
  - CVE-2026-92867
  - CVE-2026-92868
  - CVE-2026-92869
  - CVE-2026-92870
  - CVE-2026-92871
  - CVE-2026-92872
  - CVE-2026-92873
  - CVE-2026-96760
iocs:
  - 108ef7e628d7a20bd6241a5b57149e27a6061f467123eb64061975559f8f73dc
  - adswre.cfd
  - trews.cfd
  - adsaw.cfd
  - sdfghj.rd-team.ru
---

## 相比昨天

- **NEW — RMM phishing：**Microsoft 披露钓鱼活动使用合法 MSP360 RMM agent 建立入口，再安装 ScreenConnect 作为第二条持久远程访问通道。
- **NEW — Star Blizzard：**Microsoft 发布 RedFlick，该投递技术用于持续的 CosmicPulse 间谍活动。
- **NEW — Pgpool-II：**JVN 发布 7 项 CVE，影响包括内存破坏、认证/安全控制失败和代码执行路径，最高 CVSS v3 为 8.8。
- **NEW — Authlib：**CERT/CC 披露 CVE-2026-96760，空 `signatures` 数组的 JWS JSON 对象可能被错误判定为已验证。

## 优先行动

- **立即：**盘点未授权 RMM，调查来自用户下载目录、钓鱼入口或异常 PowerShell 的 MSP360/ScreenConnect 安装。
- **今日：**根据 Microsoft 报告检查 Star Blizzard credential phishing 与 CosmicPulse/RedFlick，尤其是涉乌政策和国际事务组织。
- **今日：**将 Pgpool-II 更新到 4.7.3、4.6.8、4.5.13、4.4.18、4.3.21 或更新受支持版本。
- **今日：**使用 Authlib JWS JSON serialization 的应用，在厂商修复明确前主动拒绝空 signatures 数组。

## 重点关注

### 钓鱼活动组合 MSP360 与 ScreenConnect 保持远程访问

**Severity:** High  
**Status:** Confirmed phishing / post-compromise activity  
**Affected:** 执行伪装 MSP360 installer 的 Windows endpoint

Microsoft 观察到钓鱼诱饵将合法签名的 MSP360 RMM installer 伪装成业务文件。安装后，RMM service 通过 PowerShell 安装 ScreenConnect，形成第二条远程控制通道。Microsoft 没有观察到攻击者利用 ScreenConnect 漏洞。

可检查从 Downloads 等用户目录启动的 MSP360、PowerShell 下载 `ClientSetup.msi` 以及不属于企业批准支持工具的 ScreenConnect 基础设施。

#### IOC

- `SHA256 108ef7e628d7a20bd6241a5b57149e27a6061f467123eb64061975559f8f73dc`
- `adswre[.]cfd`
- `trews[.]cfd`
- `adsaw[.]cfd`
- `sdfghj[.]rd-team[.]ru`

#### Sources

- [Microsoft Security Research — Phishing Abuses RMM Tools for Persistent Access](https://www.microsoft.com/en-us/security/blog/2026/09/29/phishing-abuses-rmm-tools-persistent-access/)

### Star Blizzard 采用 RedFlick 投递技术

**Severity:** High  
**Status:** Confirmed cyberespionage activity  
**Threat actor:** Star Blizzard  
**Malware:** CosmicPulse  
**Affected:** 乌克兰相关个人/机构以及国际 NGO、智库、政府和政策关联组织

Microsoft 自 2026 年 1 月起观察到 Star Blizzard 持续调整 phishing 与 detection evasion。RedFlick 在 CosmicPulse 投递过程中使用 scheduled task，减少对早期多步骤 ClickFix 交互的依赖。

公告列出的目标组织应优先检查身份遥测、异常 scheduled task 以及 Microsoft 提供的 IOC。

#### Sources

- [Microsoft Threat Intelligence — Star Blizzard RedFlick](https://www.microsoft.com/en-us/security/blog/2026/09/29/star-blizzard-refines-phishing-and-malware-delivery-with-the-redflick-technique/)

## 重要漏洞

### Pgpool-II 多项漏洞

**Severity:** High  
**Status:** JVN 未确认在野利用  
**CVE:** CVE-2026-92867, CVE-2026-92868, CVE-2026-92869, CVE-2026-92870, CVE-2026-92871, CVE-2026-92872, CVE-2026-92873  
**Affected:** JVN 列出的 Pgpool-II 3.5.x 至受影响 4.7.x 分支

7 项问题覆盖不同故障类型，最高 CVSS v3 为 8.8。支持分支可更新到 4.7.3、4.6.8、4.5.13、4.4.18、4.3.21；旧分支应迁移到受支持版本。

#### Sources

- [JVN#22475874 — Pgpool-II](https://jvn.jp/jp/JVN22475874/)

### Authlib CVE-2026-96760 可绕过 JWS 签名校验

**Severity:** High  
**Status:** CERT/CC 公告未确认在野利用  
**CVE:** CVE-2026-96760  
**Affected:** Authlib 1.7.2 及更早版本

`JsonWebSignature.deserialize_json()` 会接受 `signatures` 为空数组的 JWS general JSON，并将 payload 视为验证成功，攻击者不需要签名密钥即可提供伪造内容。

检查所有使用该 API 做 authentication/authorization 的应用路径。在明确修复版本可用前，应用层应主动拒绝空 signature array。

#### Sources

- [CERT/CC — VU#762428](https://kb.cert.org/vuls/id/762428)

## IOC 摘要

| 类型 | Indicator | 上下文 |
| --- | --- | --- |
| SHA256 | `108ef7e628d7a20bd6241a5b57149e27a6061f467123eb64061975559f8f73dc` | phishing 中观察到的 MSP360 installer |
| Domain | `adswre[.]cfd` | 恶意 ScreenConnect session |
| Domain | `trews[.]cfd` | 恶意 ScreenConnect session |
| Domain | `adsaw[.]cfd` | 恶意 ScreenConnect session |
| Domain | `sdfghj[.]rd-team[.]ru` | 恶意 ScreenConnect session |

## 今日观察

- Microsoft 活动中被滥用的是合法 RMM 软件，数字签名和正常产品名不能单独证明使用场景可信。
- Authlib 问题位于认证 primitive；库修复尚未明确时，应用层的补偿性校验有直接价值。
