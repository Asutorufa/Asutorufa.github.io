---
id: "2026-09-20"
title: "Threat Intelligence Daily · 2026-09-20"
date: "2026-09-20"
updated: "2026-09-20 23:00:00"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "ConoHa WING disclosed unauthorized access to customer web-server areas affecting 426 accounts. Checkmarx documented an npm malware campaign that moves execution from install scripts into normal library runtime, while working exploits are now public for four patched Linux kernel local-root flaws."
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

## Changes since yesterday

- **NEW — ConoHa WING:** GMO Internet disclosed unauthorized access to customer web-server areas on several hosting nodes. The confirmed scope is 426 accounts; malicious programs were removed by September 18.
- **NEW — npm:** Checkmarx documented a malicious package cluster led by `indexed-btree`. The loader executes from normal library runtime rather than an install hook and uses Slack, Telegram and an Ethereum Sepolia smart contract in its control path.
- **NEW — Linux:** Working local-root exploits are public for DirtyAH6, TUNderflow, PPPoEject and DiagSpill. These four CVEs are separate from the three Linux kernel flaws added to CISA KEV in yesterday's report; no in-the-wild exploitation of this quartet has been confirmed.

## Priority actions

- **Immediate:** ConoHa WING customers notified by GMO should follow the incident instructions sent to their registered email, review web content and credentials associated with the affected hosting account, and preserve relevant logs before cleanup changes remove evidence.
- **Immediate:** Search lockfiles, SBOMs, caches and artifact repositories for `indexed-btree` and the related packages named by Checkmarx. Treat execution of a malicious package as host compromise and rotate credentials accessible to that environment.
- **Today:** Update distribution kernels containing fixes for CVE-2026-80844, CVE-2026-81000, CVE-2026-68121 and CVE-2026-74469. Verify the running kernel after reboot rather than checking only installed packages.
- **Monitor:** Do not promote the four Linux public-PoC flaws to “actively exploited” unless a vendor, CERT or reliable telemetry source confirms real attacks.

## Priority threats

### ConoHa WING unauthorized access affects 426 hosting accounts

**Severity:** High  
**Status:** Confirmed intrusion; malicious programs removed  
**Affected:** Some customer web-server areas on ConoHa WING hosting nodes

GMO Internet said on September 20 that a third party gained unauthorized access to some customer web-server areas and installed malicious programs. The company identified 426 affected accounts. Its timeline places the start of unauthorized access and malware installation on September 3, detection on September 16, and completion of scope identification and malware removal on September 18.

GMO states that customer membership, contract and payment information is managed in a separate environment and was not leaked in this incident. Customers outside the affected set are not being individually notified. The company has not yet published the initial-access mechanism, malware family or attacker attribution.

#### Recommendations

- Affected customers should follow GMO's individual incident instructions and review hosted files, application credentials, deployment keys and administrative access used by the affected account.
- Preserve web, authentication and deployment logs covering at least September 3 through September 18 before rotating or rebuilding systems.
- Verify notices through ConoHa's official site because GMO explicitly warns that phishing may use this incident as a lure.

#### Sources

- [ConoHa WING — unauthorized-access notice, September 20, 2026](https://www.conoha.jp/wing/news/?ap=2015054834&btn_id=wing-news--news_wing-news)

### Malicious npm packages move execution into normal runtime

**Severity:** High  
**Status:** Confirmed malicious supply-chain campaign; related packages removed  
**Affected:** Projects that installed or executed `indexed-btree` or related packages identified by Checkmarx

Checkmarx reported an ongoing npm campaign centered on `indexed-btree`, a package impersonating `sorted-btree`. The package does not rely on `preinstall` or `postinstall`. Its loader is placed in `BTree.prototype.set()` and can launch `sharedLoad.min.js` during normal application execution when its trigger condition is reached.

The first stage fingerprints the host and can exfiltrate system data through hardcoded Slack and Telegram channels. It also polls an Ethereum smart contract on the Sepolia test network for encrypted second-stage material. Checkmarx linked nine additional packages to the same operation and reported that they were removed from npm.

#### Recommendations

- Search dependency manifests, lockfiles, package-manager caches, build artifacts and SBOM history for `indexed-btree`, `ordered-kv-index`, `btree-leaderboard`, `priority-slot-queue`, `btree-range-store`, `btree-core`, `btree-time-index`, `btree-lru-cache`, `neighbor-key-map` and `sliding-score-window`.
- If a listed package executed, inspect the developer or CI host for credential access and unexpected outbound traffic, then rotate npm, Git, cloud, CI and messaging credentials available to that process.
- Compare registry tarballs with their claimed source repositories. This campaign demonstrates that a clean-looking repository does not establish that the published package contains the same code.

#### Sources

- [Checkmarx Zero — npm ‘btree’ Malware Campaign Affects Millions of Downloads](https://checkmarx.com/zero-post/npm-btree-malware-campaign-affects-millions-of-downloads-no-need-for-install-script/)

### Public exploits released for four Linux kernel local-root flaws

**Severity:** High  
**Status:** Patched; public exploit code; no confirmed in-the-wild exploitation  
**CVE:** CVE-2026-80844, CVE-2026-81000, CVE-2026-68121, CVE-2026-74469  
**Affected:** Linux kernels containing the vulnerable networking code; reachability differs by flaw and configuration

Researcher Asim Viladi Oglu Manizada published technical details and working exploits after a coordinated embargo. DirtyAH6 affects IPv6 IPsec Authentication Header processing, TUNderflow affects TUN/TAP, PPPoEject affects PPPoE, and DiagSpill affects SCTP diagnostics.

DirtyAH6, TUNderflow and PPPoEject require unprivileged user namespaces or specific capabilities for the demonstrated local escalation paths. DiagSpill does not require those additional privileges when the SCTP path is available. The first upstream stable releases containing all four fixes are 5.10.270, 5.15.221, 6.1.188, 6.6.157, 6.12.109, 6.18.50 and 7.2.4. Distribution kernels should be evaluated through vendor packages and advisories rather than upstream version strings alone.

#### Recommendations

- Apply the distribution or cloud-vendor kernel packages carrying all four fixes and reboot into the updated kernel.
- On systems that cannot be patched immediately, reduce exposure to untrusted local workloads and review whether unprivileged user namespaces, TUN/TAP, PPPoE and SCTP are required.
- Treat the published code as a public exploit signal, not evidence of real-world exploitation.

#### Sources

- [oss-security — A quartet of Linux local root vulns](https://seclists.org/oss-sec/2026/q3/822)
- [Asim Manizada — technical write-up](https://heyitsas.im/posts/lpe-quartet/)

## Daily observations

- Two events contain confirmed malicious activity: the ConoHa WING intrusion and the npm malware campaign. The Linux quartet has working public exploits but no confirmed in-the-wild use in the reviewed sources.
- Install-time controls do not cover dependencies whose malicious path runs only after the application starts. Dependency review needs to compare published artifacts and observe runtime behavior where untrusted packages are permitted.
- No front-matter IOC set is included because the primary sources reviewed here do not provide a compact, sufficiently verified malicious IP/domain/hash set appropriate for reuse across all affected environments.
