---
id: "2026-09-20"
title: "威胁情报日报 · 2026-09-20"
date: "2026-09-20"
updated: "2026-09-20 23:00:00"
language: zh-Hans
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "ConoHa WING 披露部分客户 Web 服务器区域遭第三方未授权访问，确认影响 426 个账号。Checkmarx 公布一组 npm 恶意包，其执行点从安装脚本转移到正常库运行阶段；Linux kernel 另有四个已修复的本地提权漏洞公开了可用 exploit。"
total: 3
critical: 0
high: 3
medium: 0
low: 0
exploited: 2
tags:
  - incident-response
  - web-hosting
  - ConoHa-WING
  - supply-chain
  - npm
  - malware
  - Linux
  - privilege-escalation
  - public-exploit
  - CVE-2026-68121
  - CVE-2026-74469
  - CVE-2026-80844
  - CVE-2026-81000
cves:
  - CVE-2026-68121
  - CVE-2026-74469
  - CVE-2026-80844
  - CVE-2026-81000
iocs: []
---

## 相比昨天

- **NEW — ConoHa WING：** GMO Internet 披露部分托管节点上的客户 Web 服务器区域遭第三方未授权访问。已确认影响 426 个账号，恶意程序已于 9 月 18 日完成清除。
- **NEW — npm：** Checkmarx 公布以 `indexed-btree` 为首的一组恶意包。loader 不依赖安装 hook，而是在库正常运行时触发，控制路径使用 Slack、Telegram 和 Ethereum Sepolia smart contract。
- **NEW — Linux：** DirtyAH6、TUNderflow、PPPoEject 和 DiagSpill 已公开可工作的本地 root exploit。这四个 CVE 与昨日日报中进入 CISA KEV 的三个 Linux kernel 漏洞不是同一组；目前没有确认这四个漏洞已被在野利用。

## 优先行动

- **立即：** 收到 GMO 单独通知的 ConoHa WING 客户按官方邮件中的事件处置要求执行，检查受影响托管账号的 Web 内容和凭据；在清理操作覆盖证据前保存相关日志。
- **立即：** 在 lockfile、SBOM、package cache 和制品仓库中搜索 `indexed-btree` 及 Checkmarx 列出的关联包。若恶意包曾执行，按主机已失陷处理，并轮换该进程可访问的凭据。
- **今日：** 为包含 CVE-2026-80844、CVE-2026-81000、CVE-2026-68121、CVE-2026-74469 修复的系统安装发行版 kernel 更新；重启后确认实际运行的 kernel，而不只检查已安装包。
- **监控：** 在厂商、CERT 或可靠遥测确认真实攻击前，不把这四个 Linux public PoC 漏洞标记为「已在野利用」。

## 重点关注

### ConoHa WING 未授权访问影响 426 个托管账号

**Severity:** High  
**Status:** 已确认入侵；恶意程序已清除  
**Affected:** ConoHa WING 部分托管节点中的客户 Web 服务器区域

GMO Internet 9 月 20 日公告称，第三方对部分客户 Web 服务器区域实施了未授权访问并放置恶意程序。已确认影响 426 个账号。官方时间线显示，未授权访问和恶意程序放置始于 9 月 3 日，9 月 16 日检测并开始调查，9 月 18 日完成原因与影响范围确认并清除恶意程序。

GMO 表示，客户会员信息、合同信息和支付信息由另一套环境管理，本次事件未造成这些信息泄露。未处于影响范围的客户不会收到单独通知。目前官方尚未公开初始访问方式、malware family 或攻击者归因。

#### 建议

- 受影响客户按 GMO 的单独通知执行，并检查托管文件、应用凭据、部署密钥和该账号使用的管理访问。
- 在轮换凭据或重建前，保存至少覆盖 9 月 3 日至 9 月 18 日的 Web、认证和部署日志。
- 通过 ConoHa 官方站点核验通知。GMO 已明确提醒，本事件可能被用于钓鱼邮件诱饵。

#### Sources

- [ConoHa WING — 2026-09-20 未授权访问公告](https://www.conoha.jp/wing/news/?ap=2015054834&btn_id=wing-news--news_wing-news)

### npm 恶意包把执行点移到正常运行阶段

**Severity:** High  
**Status:** 已确认恶意供应链活动；关联包已从 registry 移除  
**Affected:** 安装或执行过 `indexed-btree` 或 Checkmarx 所列关联包的项目

Checkmarx 披露了一组以 `indexed-btree` 为中心的 npm 恶意包。该包冒充 `sorted-btree`，没有依赖 `preinstall` 或 `postinstall`。恶意 loader 被放进 `BTree.prototype.set()`，满足触发条件时会在应用正常运行过程中启动 `sharedLoad.min.js`。

第一阶段会收集主机信息，并可通过硬编码的 Slack 和 Telegram 通道外传数据；它还会查询 Ethereum Sepolia 测试网 smart contract，获取加密的第二阶段内容。Checkmarx 将另外九个包关联到同一活动，并报告这些包已从 npm 移除。

#### 建议

- 在依赖清单、lockfile、package-manager cache、构建制品和历史 SBOM 中搜索 `indexed-btree`、`ordered-kv-index`、`btree-leaderboard`、`priority-slot-queue`、`btree-range-store`、`btree-core`、`btree-time-index`、`btree-lru-cache`、`neighbor-key-map`、`sliding-score-window`。
- 若上述包曾执行，检查开发机或 CI 主机上的凭据访问和异常出站连接，并轮换该进程可访问的 npm、Git、cloud、CI 和 messaging 凭据。
- 比较 registry tarball 与其声称对应的源码仓库。源码仓库本身没有恶意代码，不能证明发布到 registry 的制品相同。

#### Sources

- [Checkmarx Zero — npm ‘btree’ Malware Campaign Affects Millions of Downloads](https://checkmarx.com/zero-post/npm-btree-malware-campaign-affects-millions-of-downloads-no-need-for-install-script/)

### 四个 Linux kernel 本地 root 漏洞公开可用 exploit

**Severity:** High  
**Status:** 已修复；public exploit；未确认在野利用  
**CVE:** CVE-2026-80844、CVE-2026-81000、CVE-2026-68121、CVE-2026-74469  
**Affected:** 包含对应网络子系统漏洞代码的 Linux kernel；可达条件随漏洞和配置不同

研究员 Asim Viladi Oglu Manizada 在协调 embargo 结束后公开了技术细节和可工作的 exploit。DirtyAH6 位于 IPv6 IPsec Authentication Header 处理，TUNderflow 位于 TUN/TAP，PPPoEject 位于 PPPoE，DiagSpill 位于 SCTP diagnostics。

DirtyAH6、TUNderflow 和 PPPoEject 的演示提权路径需要 unprivileged user namespace 或特定 capability。SCTP 路径可用时，DiagSpill 不需要这些额外权限。首批同时包含四项修复的 upstream stable 版本为 5.10.270、5.15.221、6.1.188、6.6.157、6.12.109、6.18.50 和 7.2.4。发行版 kernel 应按厂商包和安全公告判断，不能只比较 upstream 版本号。

#### 建议

- 安装发行版或 cloud vendor 提供、包含四项修复的 kernel 包，并重启进入更新后的 kernel。
- 无法立即更新时，减少不受信任本地 workload 的访问，并确认 unprivileged user namespace、TUN/TAP、PPPoE 和 SCTP 是否确实需要启用。
- public exploit 只说明 exploit 已公开，不等同于真实攻击已经发生。

#### Sources

- [oss-security — A quartet of Linux local root vulns](https://seclists.org/oss-sec/2026/q3/822)
- [Asim Manizada — technical write-up](https://heyitsas.im/posts/lpe-quartet/)

## 每日观察

- 本期两个事件包含已确认恶意活动：ConoHa WING 入侵和 npm malware campaign。Linux quartet 已有可用 public exploit，但本次核验的来源没有确认在野利用。
- 只检查安装阶段无法覆盖「安装时不执行、应用启动后才触发」的依赖恶意路径。允许不受信任依赖进入环境时，还需要核对发布制品与源码差异，并观察运行时行为。
- 本期未写入 front matter IOC。已核验的一手来源没有提供适合跨受影响环境复用、且验证充分的恶意 IP/domain/hash 集合。
