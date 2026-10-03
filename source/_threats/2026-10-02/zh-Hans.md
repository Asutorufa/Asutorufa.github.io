---
id: "2026-10-02"
title: "Threat Intelligence Daily · 2026-10-02"
date: "2026-10-02"
updated: "2026-10-03 03:45:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "10 月 2 日保留 3 个不同类型的风险：GitLab 修复 CVSS 9.9 的 AI Gateway sandbox escape，可进一步执行命令；Dell 披露多项 Container Storage Modules Critical 漏洞，其中两项认证缺失为 CVSS 10.0；Frontline Education 开始通知学区，第三方软件漏洞曾导致员工数据被未授权访问。"
total: 3
critical: 2
high: 1
medium: 0
low: 0
exploited: 1
tags:
  - ai-security
  - kubernetes
  - storage
  - data-breach
  - GitLab
  - Dell
  - Frontline-Education
  - CVE-2026-63688
  - CVE-2026-63692
  - CVE-2026-67269
  - CVE-2026-67273
  - CVE-2026-54472
  - CVE-2026-61421
  - CVE-2026-90970
cves:
  - CVE-2026-54472
  - CVE-2026-61421
  - CVE-2026-63688
  - CVE-2026-63692
  - CVE-2026-67269
  - CVE-2026-67273
  - CVE-2026-90970
iocs: []
---

## 相比昨天

- **NEW — GitLab AI Gateway：**CVE-2026-90970 可让拥有 Duo Agent Platform 权限的认证用户通过 crafted flow configuration 逃逸 prompt-template sandbox，并在自托管 AI Gateway 执行任意命令。
- **NEW — Dell CSM：**Dell 披露多项 Container Storage Modules Critical 漏洞；CVE-2026-63688 与 CVE-2026-63692 均为 10.0，可让未认证网络攻击者获得管理控制。
- **NEW — Frontline Education：**学区开始收到数据泄露通知；第三方软件漏洞曾允许攻击者未授权访问 Frontline 部分环境。

## 优先行动

- **立即：**自托管 GitLab AI Gateway 升级到 19.2.4、19.3.2、19.4.1 或更高版本。GitLab-hosted gateway 已由厂商修复。
- **立即：**盘点 Dell CSM Authorization/Operator 部署并更新到厂商修复版本；公告要求轮换 signing secret 的环境同时轮换凭据。
- **今日：**收到 Frontline 通知的学区确认受影响员工与字段范围，并按本地要求处理通知和身份盗用监控。

## 重点关注

### GitLab AI Gateway CVE-2026-90970 可逃逸 prompt-template sandbox

**Severity:** Critical  
**Status:** GitLab 未报告已确认在野利用  
**CVSS:** 9.9  
**CVE:** CVE-2026-90970  
**Affected:** 自托管 GitLab AI Gateway 18.1.6 至受影响的 19.4 分支

拥有 Duo Agent Platform 权限的认证用户可提交 crafted flow configuration，逃逸 prompt-template sandbox，并在 AI Gateway 上执行任意命令。GitLab-hosted gateway 已完成修复，自托管环境需要升级。

根据分支升级到 19.2.4、19.3.2、19.4.1 或更高版本。若 flow 创建权限面向不可信或较大的用户群，应回查 custom-flow 与 gateway 日志。

#### Sources

- [GitLab — AI Gateway critical patch release](https://docs.gitlab.com/releases/patches/other-patches/patch-release-gitlab-ai-gateway-19-4-1-released/)

### Dell CSM 认证缺失可越过 Kubernetes 与存储管理边界

**Severity:** Critical  
**Status:** Dell 未报告主动利用  
**CVSS:** CVE-2026-63688 与 CVE-2026-63692 均为 10.0  
**CVE:** CVE-2026-63688, CVE-2026-63692, CVE-2026-67269, CVE-2026-54472, CVE-2026-61421, CVE-2026-67273  
**Affected:** DSA-2026-448 描述的 Dell Container Storage Modules 部署

CVE-2026-63688 的 storage gRPC service 缺少认证，未认证攻击者可取得已注册存储阵列的 backend administrator credential。CVE-2026-63692 位于 authorization proxy/tenant service，同样缺少认证，可获得管理权限。同一公告还修复 root privilege escalation、hard-coded secret 与 Kubernetes Secrets/RBAC 相关 Critical 问题。

按 Dell DSA-2026-448 升级 CSM，并执行公告中的 credential rotation。Kubernetes 使用 Dell storage 时，CSM Authorization 本身就是 cluster security boundary 的一部分。

#### Sources

- [BleepingComputer — Dell CSM critical flaws](https://www.bleepingcomputer.com/news/security/new-max-severity-dell-csm-flaws-give-hackers-admin-privileges/)
- [The Hacker News — Dell CSM flaws](https://thehackernews.com/2026/10/dell-csm-flaws-enable-unauthenticated.html)

## 已确认事件

### Frontline Education 通过第三方软件漏洞遭未授权访问

**Severity:** High  
**Status:** Confirmed data-breach notification  
**Affected:** 已收到通知学区的员工数据，实际字段范围按组织而异

Frontline Education 表示 8 月 14 日发现第三方软件产品漏洞，该问题允许未授权访问部分环境。公司随后聘请外部安全公司、修复漏洞并联系执法机构。至少一份学区通知涉及员工 SSN、邮箱和地址等数据。

在厂商给出更广范围确认前，应按学区分别判断数据范围，不能假设所有 Frontline 客户影响完全一致。

#### Sources

- [BleepingComputer — Frontline Education breach](https://www.bleepingcomputer.com/news/security/frontline-education-data-breach-impacts-school-district-employees/)

## 今日观察

- GitLab 的事件发生在 AI 产品，但故障模式仍是 sandbox escape 后的传统 command execution，处置方法仍应围绕高权限服务隔离和最小权限。
- Dell CSM 位于 Kubernetes 与企业存储之间，这一层的认证缺失可以同时跨越 cluster 与 storage 的管理边界。
