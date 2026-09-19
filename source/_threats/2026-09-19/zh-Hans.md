---
id: "2026-09-19"
title: "威胁情报日报 · 2026-09-19"
date: "2026-09-19"
updated: "2026-09-19 23:00:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "CISA 将三个已确认遭利用的 Linux 内核漏洞加入 KEV，修复期限为 9 月 21 日。WordPress 7.1.1 修复了后来被演示为 Click2Shell 的恶意 URL 主题安装路径；Chrome 153 修复 Dawn 与 WebGL 的 Critical 内存安全漏洞；vm2 3.11.7 修复多项沙箱边界问题，包括宿主进程代码执行与 TLS 信任库修改。"
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 1
tags:
  - active-exploitation
  - Linux
  - CISA-KEV
  - WordPress
  - Click2Shell
  - Chrome
  - vm2
  - sandbox-escape
  - remote-code-execution
  - memory-safety
  - CVE-2025-39682
  - CVE-2025-39964
  - CVE-2026-53266
  - CVE-2026-92937
  - CVE-2026-92941
  - CVE-2026-93372
  - CVE-2026-93374
cves:
  - CVE-2025-39682
  - CVE-2025-39964
  - CVE-2026-53266
  - CVE-2026-92937
  - CVE-2026-92941
  - CVE-2026-93372
  - CVE-2026-93374
iocs: []
---

## 相比昨天

- **NEW — Linux 内核：** CISA 基于真实利用证据，将 CVE-2025-39682、CVE-2026-53266、CVE-2025-39964 加入 KEV。公开资料尚未给出攻击者身份，也没有证据表明三者属于同一条利用链。
- **NEW — WordPress：** 7.1.1 安全更新发布后的研究演示了 Click2Shell。已登录管理员打开恶意 URL 后，可触发 WordPress.org 主题的自动安装与预览；若该主题自身存在漏洞，可继续形成 PHP 代码执行链。
- **NEW — Chrome：** Chrome 153.0.8010.52/.53 修复 16 项安全问题，其中包括 Dawn use-after-free 和 WebGL buffer overflow 两项 Critical 漏洞。
- **NEW — vm2：** 新公开的 CVE 描述了 3.11.7 修复的多项沙箱边界问题，其中包括宿主 Node.js 进程代码执行和进程级 TLS 信任库修改。

## 优先行动

- **立即：** 对受三个 KEV 影响的 Linux 系统安装发行版提供的内核更新，重启进入已修复内核，并保留补丁前的遥测用于失陷排查。
- **立即：** 所有允许不可信 JavaScript 进入 `VM` 或 `NodeVM` 的环境升级 vm2 至 3.11.7 或更高版本，并检查向沙箱暴露的宿主模块与异步对象。
- **今天：** 确认 WordPress 已升级至 7.1.1，或当前维护分支对应的安全版本。管理员保持登录状态时，不要打开来源不可信的链接。
- **今天：** 将 Chrome 桌面端升级至 153.0.8010.52/.53 或更高版本，Android 升级至 153.0.8010.52 或更高版本，并通过浏览器管理数据核对实际版本。

## 重点关注

### 三个 Linux 内核漏洞进入 CISA KEV

**Severity:** Critical  
**Status:** 已确认在野利用；CISA KEV  
**CVE:** CVE-2025-39682、CVE-2026-53266、CVE-2025-39964  
**Affected:** 包含相关漏洞代码的 Linux 内核及下游发行版

CISA 于 9 月 18 日将三个漏洞加入 KEV。CVE-2025-39682 位于内核 TLS 接收路径；NVD 中 NIST 评分为 7.1，而 kernel.org CNA 记录为 9.8。CVE-2026-53266 是 ebtables SNAT 的越界写，在特定 bridge netfilter 配置下可导致内存破坏、拒绝服务或本地提权。CVE-2025-39964 是 AF_ALG socket 并发写入相关的竞争条件。

KEV 收录确认这些漏洞已经发生真实利用。此次核查的公开资料没有给出攻击者、受害范围，也没有证据证明三者被组合使用。KEV 修复期限为 2026 年 9 月 21 日。

#### 建议

- 使用操作系统或云厂商提供的内核包，不要仅凭 upstream 版本号判断发行版内核是否受影响。
- 安装后重启，并核对当前正在运行的内核版本，而不只是已安装的软件包版本。
- CVE-2026-53266 暂时无法修复时，Red Hat 建议关闭 ebtables SNAT 的 ARP hardware-address rewriting，或移除处理 ARP 的相关 SNAT 规则。
- 检查补丁前的 kernel crash、异常提权、namespace 活动和 netfilter 配置变化。

#### Sources

- [CISA — Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)
- [NVD — CVE-2025-39682](https://nvd.nist.gov/vuln/detail/CVE-2025-39682)
- [Red Hat — CVE-2026-53266](https://access.redhat.com/security/cve/cve-2026-53266)

### vm2 3.11.7 修复沙箱逃逸与宿主状态修改

**Severity:** Critical  
**Status:** 已修复；未确认在野利用  
**CVE:** CVE-2026-92937、CVE-2026-92941  
**Affected:** 3.11.7 修复前的 vm2 版本；不同 CVE 的触发前提不同

CVE-2026-92937 描述 vm2 3.11.6 中不完整的 Promise sanitization 修复。当嵌入方把宿主 realm 的 Promise 暴露给沙箱，且 rejected Error 携带宿主对象时，通过 `Function.prototype.call` 或 `apply` 间接调用可以绕过 bridge 检查，使沙箱代码取得宿主对象。公开记录给出的结果是以宿主 Node.js 进程权限执行命令。

CVE-2026-92941 影响 3.11.3 至 3.11.7 之前版本，并要求相关 built-in 可被沙箱访问。沙箱代码可访问宿主 `tls` 模块并修改进程级默认 CA，进而改变宿主后续 HTTPS 客户端信任的证书。两项记录均将 3.11.7 列为修复版本。

#### 建议

- 升级至 vm2 3.11.7 或更高版本。
- 盘点通过 vm2 执行租户、插件、工作流或 AI 生成 JavaScript 的服务；配置决定这些 bridge 路径是否可达。
- 修复后仍应缩小 built-in 和宿主对象暴露范围。不要让 JavaScript 沙箱单独承担凭据或高信任网络访问的安全边界。

#### Sources

- [GitHub Security Advisory — CVE-2026-92937](https://github.com/patriksimek/vm2/security/advisories/GHSA-647f-g98j-qq25)
- [GitHub Security Advisory — CVE-2026-92941](https://github.com/patriksimek/vm2/security/advisories/GHSA-98xx-8mx4-x7cm)

### Chrome 153 修复 Dawn 与 WebGL Critical 内存安全漏洞

**Severity:** Critical  
**Status:** 已修复；Google 未声明存在在野利用  
**CVE:** CVE-2026-93374、CVE-2026-93372  
**Affected:** Chrome 桌面端 153.0.8010.52/.53 之前版本及对应 Android build

Google 9 月 17 日的 Stable Channel 更新包含 16 项安全修复，其中 CVE-2026-93374 是 Dawn 的 Critical use-after-free，CVE-2026-93372 是 WebGL 的 Critical buffer overflow。Chrome for Android 153.0.8010.52 默认包含对应桌面版本的安全修复，除非 Google 另行说明。

#### 建议

在固定版本进入发布范围后升级桌面端与 Android 设备，并通过企业浏览器管理遥测确认版本合规。

#### Sources

- [Chrome Releases — Stable Channel Update for Desktop](https://chromereleases.googleblog.com/2026/09/stable-channel-update-for-desktop_0194356994.html)
- [Chrome Releases](https://chromereleases.googleblog.com/)

## 其他事项

### WordPress 7.1.1 修复 Click2Shell 使用的入口

**Severity:** High  
**Status:** 已修复；未确认在野利用  
**Affected:** 对应 9 月 17 日安全版本之前的 WordPress Core

WordPress 7.1.1 包含 11 项安全修复，其中一项阻止恶意 URL 自动安装并预览 WordPress.org 上的未启用主题。随后公开的 Click2Shell 研究演示：已登录管理员打开此类 URL 后，无需再次点击 Install 即可触发主题安装；若主题代码另有漏洞，可进一步执行服务端 PHP。

Core 漏洞需要管理员交互，演示中的代码执行还依赖主题自身漏洞。因此不能把它描述为 zero-click、unauthenticated WordPress RCE。WordPress 正在将安全修复 backport 至符合条件的旧分支，最早覆盖到 4.7。

#### 建议

升级至 WordPress 7.1.1 或部署分支对应的安全版本，确认自动后台更新确实完成，并避免在已登录管理员会话中打开不可信链接。

#### Sources

- [WordPress — 7.1.1 Maintenance and Security Release](https://wordpress.org/news/2026/09/wordpress-7-1-1-maintenance-and-security-release/)

## 每日观察

- 本期只有 Linux KEV 事件有明确的在野利用证据；公开资料仍缺少攻击活动归因和利用链细节。
- Linux、vm2、WordPress 三项都涉及边界失效：内核权限/内存边界、JavaScript 沙箱边界、管理员到主题安装的授权边界。处置优先级需要结合实际部署条件，不能只看 CVSS。
- 本期不写 IOC：核查到的一手来源没有提供可可靠归属于这四个事件的恶意 IP、域名或 hash 集合。
