---
id: "2026-09-19"
title: "Threat Intelligence Daily · 2026-09-19"
date: "2026-09-19"
updated: "2026-09-19 23:00:00"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "CISA added three actively exploited Linux kernel flaws to KEV with a September 21 remediation target. WordPress 7.1.1 fixes a crafted-URL theme-install path later demonstrated as Click2Shell, Chrome 153 fixes critical Dawn and WebGL memory-safety bugs, and vm2 3.11.7 closes multiple sandbox-boundary failures including host-process RCE and TLS trust-store manipulation."
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

## Changes since yesterday

- **NEW — Linux kernel:** CISA added CVE-2025-39682, CVE-2026-53266 and CVE-2025-39964 to KEV based on active exploitation. Public reporting does not identify the attackers or a shared exploit chain.
- **NEW — WordPress:** Research published after the 7.1.1 security release demonstrated Click2Shell: a logged-in administrator opening a crafted URL can trigger installation and preview of an inactive WordPress.org theme; a vulnerable theme can extend the chain to PHP execution.
- **NEW — Chrome:** Chrome 153.0.8010.52/.53 fixes 16 security issues, including critical use-after-free in Dawn and a critical WebGL buffer overflow.
- **NEW — vm2:** Newly published CVEs document multiple sandbox-boundary failures fixed in 3.11.7, including host-process code execution and process-wide TLS trust-store manipulation.

## Priority actions

- **Immediate:** Install distribution-provided kernel updates for systems affected by the three KEV entries, reboot into the fixed kernel, and preserve telemetry for pre-patch compromise review.
- **Immediate:** Upgrade vm2 to 3.11.7 or later anywhere untrusted JavaScript reaches `VM` or `NodeVM`; review which host modules and asynchronous host objects are exposed to sandboxes.
- **Today:** Confirm WordPress is on 7.1.1 or the corresponding patched release for its maintained branch. Treat links sent to logged-in administrators as an execution boundary, not merely navigation.
- **Today:** Update Chrome desktop to 153.0.8010.52/.53 or later and Android to 153.0.8010.52 or later as rollout reaches managed devices.

## Priority threats

### Three Linux kernel flaws enter CISA KEV

**Severity:** Critical  
**Status:** Confirmed active exploitation; CISA KEV  
**CVE:** CVE-2025-39682, CVE-2026-53266, CVE-2025-39964  
**Affected:** Linux kernels and downstream distributions containing the vulnerable code

CISA added all three vulnerabilities to KEV on September 18. CVE-2025-39682 affects the kernel TLS receive path; NVD records a 7.1 score from NIST while the kernel CNA record carries 9.8. CVE-2026-53266 is an ebtables SNAT out-of-bounds write that can lead to memory corruption, denial of service or local privilege escalation under specific bridge-netfilter configuration. CVE-2025-39964 is a race condition involving concurrent writes to an AF_ALG socket.

CISA's entries establish that exploitation has occurred. Public sources reviewed for this report do not identify an actor, victim set or whether the flaws are used together. The KEV remediation date is September 21, 2026.

#### Recommendations

- Use kernel packages supplied by the operating-system or cloud vendor rather than mapping generic upstream version numbers onto a distribution kernel.
- Reboot after installation and verify the running kernel, not only the installed package version.
- Where CVE-2026-53266 cannot be patched immediately, Red Hat recommends disabling ARP hardware-address rewriting in ebtables SNAT rules or removing affected ARP SNAT rules.
- Review crash telemetry, privilege changes, namespace activity and unexpected netfilter changes from the pre-patch period.

#### Sources

- [CISA — Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)
- [NVD — CVE-2025-39682](https://nvd.nist.gov/vuln/detail/CVE-2025-39682)
- [Red Hat — CVE-2026-53266](https://access.redhat.com/security/cve/cve-2026-53266)

### vm2 3.11.7 closes sandbox escapes and host-state manipulation

**Severity:** Critical  
**Status:** Patched; no confirmed in-the-wild exploitation  
**CVE:** CVE-2026-92937, CVE-2026-92941  
**Affected:** vm2 releases before the fixes documented for 3.11.7; exact preconditions differ by CVE

CVE-2026-92937 describes an incomplete Promise sanitization fix in vm2 3.11.6. When an embedder exposes a host-realm Promise and a rejected Error contains a host object, `Function.prototype.call` or `apply` indirection can bypass the bridge check and expose that object to sandbox code. The published record describes command execution in the host Node.js process.

CVE-2026-92941 affects vm2 3.11.3 before 3.11.7 when relevant built-ins are exposed. Sandbox code can reach the host `tls` module and alter process-wide default certificate authorities, changing what subsequent host HTTPS clients trust. Both records point to 3.11.7 as the fixed release.

#### Recommendations

- Upgrade to vm2 3.11.7 or later.
- Inventory applications that execute tenant, plugin, workflow or AI-generated JavaScript through vm2; configuration determines whether the vulnerable bridge paths are reachable.
- Minimize exposed built-ins and host objects even after patching. A JavaScript sandbox should not be the sole boundary protecting credentials or high-trust network access.

#### Sources

- [GitHub Security Advisory — CVE-2026-92937](https://github.com/patriksimek/vm2/security/advisories/GHSA-647f-g98j-qq25)
- [GitHub Security Advisory — CVE-2026-92941](https://github.com/patriksimek/vm2/security/advisories/GHSA-98xx-8mx4-x7cm)

### Chrome 153 fixes critical Dawn and WebGL memory-safety flaws

**Severity:** Critical  
**Status:** Patched; no confirmed exploitation stated by Google  
**CVE:** CVE-2026-93374, CVE-2026-93372  
**Affected:** Chrome desktop before 153.0.8010.52/.53 and corresponding Android builds

Google's September 17 stable-channel update contains 16 security fixes. It identifies CVE-2026-93374 as a critical use-after-free in Dawn and CVE-2026-93372 as a critical buffer overflow in WebGL. Chrome for Android 153.0.8010.52 carries the corresponding desktop security fixes unless Google notes otherwise.

#### Recommendation

Move managed desktop and Android fleets to the fixed stable release as it becomes available and verify version compliance through browser-management telemetry.

#### Sources

- [Chrome Releases — Stable Channel Update for Desktop](https://chromereleases.googleblog.com/2026/09/stable-channel-update-for-desktop_0194356994.html)
- [Chrome Releases](https://chromereleases.googleblog.com/)

## Other notable items

### WordPress 7.1.1 fixes the path used by Click2Shell

**Severity:** High  
**Status:** Patched; no confirmed in-the-wild exploitation  
**Affected:** WordPress core before the applicable September 17 security release

WordPress 7.1.1 contains 11 security fixes. One prevents specially crafted URLs from automatically installing and previewing an inactive theme from WordPress.org. The later Click2Shell research demonstrated that a logged-in administrator opening such a URL could trigger theme installation without separately pressing Install; a second flaw in theme code can turn that primitive into server-side PHP execution.

The core issue requires administrator interaction, and the demonstrated code-execution chain also depends on vulnerable theme code. It is not a zero-click unauthenticated WordPress RCE. WordPress is backporting the security fixes to eligible branches through 4.7.

#### Recommendation

Update to WordPress 7.1.1 or the patched release for the deployed branch, verify that automatic background updates actually completed, and avoid opening untrusted links in an authenticated administrator session.

#### Sources

- [WordPress — 7.1.1 Maintenance and Security Release](https://wordpress.org/news/2026/09/wordpress-7-1-1-maintenance-and-security-release/)

## Daily observations

- The Linux KEV additions are the only event in this report with confirmed in-the-wild exploitation. Public reporting still lacks campaign attribution and exploit-chain details.
- Three items are boundary failures: Linux kernel privilege/memory boundaries, vm2's JavaScript sandbox boundary, and WordPress's administrator-to-theme-install boundary. Remediation depends on the actual deployment configuration, not the headline CVSS alone.
- No IOC list is included because the reviewed primary sources did not provide a reliable malicious IP/domain/hash set for these four events.
