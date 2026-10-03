---
id: "2026-09-25"
title: "Threat Intelligence Daily · 2026-09-25"
date: "2026-09-25"
updated: "2026-10-03 03:20:00"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "September 25 added four actionable exploitation updates and one Japanese CMS disclosure set: SharePoint CVE-2026-65660 and MikroTik CVE-2026-67279 entered the exploited-vulnerability queue, WordPress CVE-2026-87902 reached CISA KEV, Microsoft detailed Storm-3168 destructive Azure activity, and JVN published baserCMS fixes."
total: 5
critical: 1
high: 3
medium: 1
low: 0
exploited: 4
tags:
  - active-exploitation
  - cisa-kev
  - cloud
  - identity
  - destructive-attack
  - wordpress
  - sharepoint
  - mikrotik
  - baserCMS
  - Storm-3168
  - CVE-2026-65660
  - CVE-2026-67279
  - CVE-2026-87902
  - CVE-2026-97150
cves:
  - CVE-2026-62956
  - CVE-2026-65660
  - CVE-2026-67279
  - CVE-2026-87902
  - CVE-2026-93460
  - CVE-2026-93462
  - CVE-2026-93463
  - CVE-2026-93464
  - CVE-2026-97150
iocs:
  - 45.131.66.106
  - 34.153.223.102
  - 64.20.53.230
---

## Changes since yesterday

- **NEW — SharePoint:** Microsoft had reliable evidence of attacks against CVE-2026-65660; CISA added the SharePoint code-injection flaw to KEV.
- **NEW — MikroTik:** CISA added CVE-2026-67279 to KEV. The SSH state-machine flaw can be chained with CVE-2026-86060.
- **NEW — Storm-3168:** Microsoft documented compromised Azure service principals performing more than 150 destructive or credential-access operations in 35 minutes.
- **UPDATED — WordPress:** CVE-2026-87902 moved from exploitation reporting to CISA KEV on September 25.
- **NEW — baserCMS:** JVN published fixes for five baserCMS core CVEs and CVE-2026-97150 in BcAddonMigrator.

## Priority actions

- **Immediate:** Patch SharePoint systems affected by CVE-2026-65660 and perform compromise review on exposed servers.
- **Immediate:** Upgrade MikroTik RouterOS to fixed trains and check for unexpected SSH session behavior or files.
- **Immediate:** Confirm WordPress 7.1.2 or later across exposed sites and review sites that met the exploit preconditions before patching.
- **Today:** Rotate any Azure workload-identity secret exposed in source, issues or logs; inspect service-principal deletion and ListKeys activity.
- **Today:** Update baserCMS and BcAddonMigrator where deployed.

## Priority threats

### SharePoint CVE-2026-65660 is now exploited

**Severity:** High  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 8.8  
**CVE:** CVE-2026-65660  
**Affected:** Supported Microsoft SharePoint Server versions covered by the August 2026 security update

The code-injection flaw allows an authenticated attacker with low privileges to execute code without user interaction. Microsoft updated its advisory with reliable evidence of observed attacks, and CISA added the vulnerability to KEV on September 25.

Apply Microsoft's security updates and review SharePoint servers for unexpected application-pool execution, web shells and post-authentication activity.

#### Sources

- [Microsoft MSRC — CVE-2026-65660](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-65660)
- [CISA — KEV entry for CVE-2026-65660](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-65660)

### MikroTik CVE-2026-67279 joins the RouterOS exploitation chain

**Severity:** Medium  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 6.5 (v3), 6.9 (v4)  
**CVE:** CVE-2026-67279  
**Affected:** RouterOS before 6.49.21, 7.23.4, 7.24.2 and corresponding fixed trains

The flaw lets an unauthenticated client advance an SSH session into a state that can accept an exec request. It can be chained with CVE-2026-86060, which was already part of the exploited RouterOS takeover chain. CISA added CVE-2026-67279 to KEV on September 25.

Upgrade RouterOS and inspect management-plane logs, unexpected files and privileged-account changes. Do not treat the moderate standalone CVSS as the operational risk of the full chain.

#### Sources

- [Canadian Centre for Cyber Security — MikroTik AV26-887 Update 2](https://www.cyber.gc.ca/en/alerts-advisories/mikrotik-security-advisory-av26-887)
- [CISA — KEV entry for CVE-2026-67279](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-67279)

### Storm-3168 used compromised service principals for rapid Azure destruction

**Severity:** High  
**Status:** Confirmed destructive cloud intrusion  
**Threat actor:** Storm-3168 / JADEPUFFER  
**Affected:** Azure environments with compromised workload identities

Microsoft observed two compromised service principals in one tenant. One identity enumerated the environment; another attempted more than 150 destructive or credential-access operations in 35 minutes, including over 100 storage-account deletion attempts. Most targeted storage accounts were deleted, while recovery locks stopped some operations.

Rotate exposed workload credentials instead of only deleting them from the original location. Review Azure Activity Logs for mass deletion, ListKeys, recovery-lock changes and unusual service-principal tokens.

#### IOC

- `45.131.66[.]106`
- `34.153.223[.]102`
- `64.20.53[.]230`

#### Sources

- [Microsoft Security Research — Storm-3168](https://www.microsoft.com/en-us/security/blog/2026/09/25/storm-3168-agentic-driven-cloud-attacks-using-compromised-service-principals/)

### WordPress CVE-2026-87902 entered CISA KEV

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVE:** CVE-2026-87902  
**Affected:** WordPress before 7.1.2 under the documented preconditions

This is a material update to yesterday's report: CISA added the flaw to KEV on September 25. The remediation remains WordPress 7.1.2 or later, with compromise review for exposed sites that met the server/theme preconditions.

#### Sources

- [Canadian Centre for Cyber Security — AV26-952 Update 1](https://www.cyber.gc.ca/en/alerts-advisories/wordpress-security-advisory-av26-952)
- [CISA — KEV entry for CVE-2026-87902](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-87902)

## Important vulnerabilities

### baserCMS core and BcAddonMigrator fixes

**Severity:** High  
**Status:** No confirmed exploitation in JVN  
**CVE:** CVE-2026-62956, CVE-2026-93460, CVE-2026-93462, CVE-2026-93463, CVE-2026-93464, CVE-2026-97150  
**Affected:** baserCMS and BcAddonMigrator versions listed in the JVN advisories

JVN published multiple baserCMS issues including SQL injection and XSS, plus CVE-2026-97150 in BcAddonMigrator. The plugin flaw can let a high-privilege administrator include functionality from an untrusted control sphere and reaches CVSS v4 8.6.

Update baserCMS to the fixed branches and BcAddonMigrator to 5.2.1 or later.

#### Sources

- [JVN#14353754 — baserCMS](https://jvn.jp/en/jp/JVN14353754/)
- [JVN#21754394 — BcAddonMigrator](https://jvn.jp/en/jp/JVN21754394/)

## IOC summary

| Type | Indicator | Context |
| --- | --- | --- |
| IPv4 | `45.131.66[.]106` | Storm-3168 probing / malicious ARM requests |
| IPv4 | `34.153.223[.]102` | Storm-3168 App Service probing |
| IPv4 | `64.20.53[.]230` | Storm-3168 App Service probing |

## Daily observations

- The MikroTik update shows why chain context matters: a medium standalone score can become urgent when it unlocks a previously exploited takeover path.
- Workload identities need the same incident-response discipline as user accounts; deleting a leaked secret from a public location does not revoke it.
