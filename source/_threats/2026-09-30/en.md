---
id: "2026-09-30"
title: "Threat Intelligence Daily · 2026-09-30"
date: "2026-09-30"
updated: "2026-10-03 03:45:00"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "September 30 brought two newly documented actively exploited edge/server flaws and a deeper NetScaler follow-up: Microsoft traced exploitation of Zimbra CVE-2026-73570, Cisco confirmed active exploitation of Catalyst SD-WAN Manager CVE-2026-76504, Unit 42 expanded NetScaler post-exploitation findings, and JVN published a path-traversal issue affecting FUJIFILM/Sharp multifunction printers."
total: 4
critical: 3
high: 0
medium: 1
low: 0
exploited: 3
tags:
  - active-exploitation
  - zero-day
  - mail-server
  - edge-device
  - sdwan
  - NetScaler
  - Zimbra
  - Cisco
  - FUJIFILM
  - Sharp
  - CVE-2026-73570
  - CVE-2026-76504
  - CVE-2026-78249
  - CVE-2026-88771
  - CVE-2026-88772
cves:
  - CVE-2026-73570
  - CVE-2026-76504
  - CVE-2026-78249
  - CVE-2026-88771
  - CVE-2026-88772
iocs:
  - 66.135.19.18
  - 167.99.111.203
  - 142.93.85.227
  - 104.248.74.206
  - 137.184.91.207
  - 162.33.178.9
  - 193.149.176.207
---

## Changes since yesterday

- **NEW — Zimbra:** Microsoft documented exploitation of CVE-2026-73570 against internet-facing mail servers, including JSP web shells, reverse shells, privilege escalation and persistence.
- **NEW — Cisco SD-WAN:** Cisco PSIRT confirmed active exploitation of CVE-2026-76504, an unauthenticated API authentication bypass that grants admin-user privileges.
- **UPDATED — NetScaler:** Unit 42 added post-disclosure activity and rotating infrastructure to its analysis of CVE-2026-88771/CVE-2026-88772.
- **NEW — FUJIFILM/Sharp MFP:** JVN published CVE-2026-78249, a path-traversal issue in web administration interfaces.

## Priority actions

- **Immediate:** Patch exposed Zimbra systems and hunt for JSP web shells, reverse shells, privilege-escalation artifacts and unusual persistence.
- **Immediate:** Collect Cisco Catalyst SD-WAN Manager admin-tech bundles before upgrade, move to a fixed release, and review `vmanage-server.log` for unauthorized `j_security_check` activity.
- **Immediate:** Continue NetScaler compromise review on appliances exposed before remediation; include the newly published infrastructure in retrospective hunting.
- **Today:** Apply vendor updates to affected FUJIFILM/Sharp multifunction devices and restrict management interfaces.

## Priority threats

### Zimbra CVE-2026-73570 used against internet-facing mail servers

**Severity:** Critical  
**Status:** Confirmed active exploitation  
**CVE:** CVE-2026-73570  
**Affected:** Zimbra Collaboration environments with the affected SNMP/notification path

Microsoft observed exploitation that began with unauthenticated command injection and progressed to JSP web shells, reverse shells, privilege escalation and persistence. The attack surface is an internet-facing mail server, so exposed systems patched after the activity window still need compromise review.

Apply the Zimbra fix and inspect web roots, process ancestry, scheduled tasks/services and outbound connections. Preserve forensic data before removing artifacts.

#### Sources

- [Microsoft Security — CVE-2026-73570 exploitation](https://www.microsoft.com/en-us/security/blog/2026/09/30/unauthenticated-command-injection-on-internet-facing-mail-servers-tracking-cve-2026-73570/)

### Cisco Catalyst SD-WAN Manager CVE-2026-76504 actively exploited

**Severity:** Critical  
**Status:** Confirmed active exploitation / zero-day disclosure  
**CVSS:** 9.8  
**CVE:** CVE-2026-76504  
**Affected:** Cisco Catalyst SD-WAN Manager releases before their documented fixed versions

Improper URI-encoding handling can bypass API authentication rules and let an unauthenticated remote attacker access the API with admin-user privileges. Cisco PSIRT confirmed active exploitation in September.

Cisco recommends collecting admin-tech bundles before upgrading, then opening a TAC case so the data can be scanned for indicators of compromise. Administrators can also inspect `vmanage-server.log` for unexpected `j_security_check` requests tied to `viptela-reserved-` users.

#### Sources

- [Cisco — Catalyst SD-WAN Manager API Authentication Bypass](https://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-sdwan-webauth-xr8beuuU.html)
- [Cisco — September 2026 remediation workflow](https://www.cisco.com/c/en/us/support/docs/routers/sd-wan/226384-remediate-catalyst-sd-wan-security.html)

### NetScaler zero-day follow-up adds infrastructure and post-exploitation detail

**Severity:** Critical  
**Status:** Confirmed active exploitation / ongoing follow-up  
**CVE:** CVE-2026-88771, CVE-2026-88772  
**Affected:** NetScaler ADC / Gateway exposed during the exploitation window

Unit 42 updated its investigation with additional pre- and post-disclosure activity, rotating infrastructure and persistence behavior. This is a material update to the September 27–28 entries rather than a new vulnerability.

Use the new infrastructure for retrospective hunting, but validate IP hits against time and asset context. Shared or reassigned hosting can produce false positives if used as a timeless blocklist.

#### IOC

- `66.135.19[.]18`
- `167.99.111[.]203`
- `142.93.85[.]227`
- `104.248.74[.]206`
- `137.184.91[.]207`
- `162.33.178[.]9`
- `193.149.176[.]207`

#### Sources

- [Unit 42 — NetScaler zero-days exploited](https://unit42.paloaltonetworks.com/netscaler-zero-days-exploited/)

## Important vulnerabilities

### FUJIFILM/Sharp multifunction printers CVE-2026-78249

**Severity:** Medium  
**Status:** No confirmed exploitation in JVN  
**CVE:** CVE-2026-78249  
**Affected:** Multifunction printer models and firmware revisions listed by JVN

The web administration interface contains a path-traversal issue. Update the affected firmware and keep printer management interfaces off untrusted networks.

#### Sources

- [JVN — JVNVU#90160989](https://jvn.jp/en/vu/JVNVU90160989/)

## IOC summary

| Type | Indicator | Context |
| --- | --- | --- |
| IPv4 | `66.135.19[.]18` | NetScaler exploitation infrastructure |
| IPv4 | `167.99.111[.]203` | NetScaler exploitation infrastructure |
| IPv4 | `142.93.85[.]227` | NetScaler exploitation infrastructure |
| IPv4 | `104.248.74[.]206` | NetScaler exploitation infrastructure |
| IPv4 | `137.184.91[.]207` | NetScaler exploitation infrastructure |
| IPv4 | `162.33.178[.]9` | NetScaler exploitation infrastructure |
| IPv4 | `193.149.176[.]207` | NetScaler exploitation infrastructure |

## Daily observations

- Zimbra and Cisco are both patch-and-investigate events because exploitation preceded or accompanied disclosure.
- NetScaler demonstrates why a daily report needs updates: the CVE did not change, but the infrastructure and post-exploitation picture did.
