---
id: "2026-09-24"
title: "Threat Intelligence Daily · 2026-09-24"
date: "2026-09-24"
updated: "2026-10-03 03:20:00"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "Six events were retained for September 24. CISA added exploited WSO2 and Adobe Commerce flaws to KEV; WordPress and Roundcube exploitation required rapid patching; Microsoft documented Storm-2570 ransomware affiliate activity; and SolarWinds fixed two unauthenticated RCE paths in Observability Self-Hosted."
total: 6
critical: 4
high: 2
medium: 0
low: 0
exploited: 5
tags:
  - active-exploitation
  - cisa-kev
  - ransomware
  - auth-bypass
  - rce
  - webmail
  - commerce
  - wordpress
  - WSO2
  - Adobe-Commerce
  - Roundcube
  - Storm-2570
  - SolarWinds
  - CVE-2026-5430
  - CVE-2026-71362
  - CVE-2026-87902
  - CVE-2026-48842
cves:
  - CVE-2026-28324
  - CVE-2026-28325
  - CVE-2026-48842
  - CVE-2026-5430
  - CVE-2026-71362
  - CVE-2026-87902
iocs: []
---

## Changes since yesterday

- **NEW — WSO2:** CISA added CVE-2026-5430 to KEV after evidence of active exploitation. The JWT validation flaw can allow unauthenticated access and administrative account takeover.
- **NEW — Adobe Commerce:** CVE-2026-71362 entered CISA KEV after exploitation was reported against Adobe Commerce and Magento Open Source.
- **NEW — WordPress:** exploitation reporting followed the 7.1.2 security release for CVE-2026-87902, a conditional local-file inclusion path that can reach RCE.
- **NEW — Roundcube:** CVE-2026-48842, a pre-authentication SQL injection in `virtuser_query`, is being exploited against internet-facing webmail servers.
- **NEW — Storm-2570:** Microsoft published cross-ransomware tradecraft for an affiliate observed with Qilin, DragonForce, Anubis and BERT.
- **NEW — SolarWinds:** Platform 2026.2.3 fixed CVE-2026-28324 and CVE-2026-28325, including an unauthenticated RCE rated 9.8.

## Priority actions

- **Immediate:** Patch WSO2 products affected by CVE-2026-5430 and inspect exposed systems for unauthorized administrative access.
- **Immediate:** Update Adobe Commerce/Magento and WordPress 7.1.2 or later; treat internet-exposed systems as requiring compromise review, not patch-only closure.
- **Immediate:** Upgrade Roundcube to 1.6.16, 1.7.1 or later, or disable `virtuser_query` until it can be updated.
- **Today:** Upgrade SolarWinds Observability Self-Hosted/Platform to 2026.2.3 where affected configurations are present.
- **Monitor:** Hunt for recurring remote-management, credential-access and exfiltration behavior associated with Storm-2570 rather than keying detections only to a ransomware family.

## Priority threats

### WSO2 CVE-2026-5430 added to CISA KEV

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 10.0  
**CVE:** CVE-2026-5430  
**Affected:** WSO2 API Manager and related WSO2 API platform components

The JWT authentication path can accept tokens using unsupported signing algorithms and incorrectly validate them. Successful exploitation can yield unauthenticated access, including administrative account takeover. CISA added the CVE to KEV on September 24 based on active exploitation.

Apply the WSO2 fixes for the affected product line. Review exposed API-management systems for newly created administrators, unusual JWT authentication activity and privileged configuration changes.

#### Sources

- [WSO2 — WSO2-2026-5328](https://security.docs.wso2.com/en/latest/security-announcements/security-advisories/2026/WSO2-2026-5328/)
- [CISA — KEV entry for CVE-2026-5430](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-5430)

### Adobe Commerce CVE-2026-71362 exploitation moves into KEV

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 9.1  
**CVE:** CVE-2026-71362  
**Affected:** Adobe Commerce, Adobe Commerce B2B and Magento Open Source in affected August-era branches

The flaw is an incorrect-authorization issue. Adobe's original bulletin did not report exploitation, but the Canadian Cyber Centre later noted in-the-wild exploitation and confirmed that CISA added it to KEV on September 24.

Apply Adobe's APSB26-92 fixes and review administrative users, integration credentials and unexpected configuration or content changes on public Commerce instances.

#### Sources

- [Adobe — APSB26-92](https://www.adobe.com/trust/security/products/commerce/apsb26-92.html)
- [Canadian Centre for Cyber Security — AV26-808 Update 2](https://www.cyber.gc.ca/en/alerts-advisories/adobe-security-advisory-av26-808)

### WordPress CVE-2026-87902 is being probed after the 7.1.2 fix

**Severity:** Critical  
**Status:** Confirmed in-the-wild exploitation reporting  
**CVE:** CVE-2026-87902  
**Affected:** WordPress before 7.1.2 under specific server and active-theme preconditions

An unauthenticated attacker can influence page-template resolution so that a readable local PHP file outside the active theme is included. Under the required environment and theme conditions, this can lead to RCE. WordPress released 7.1.2 as a critical security update.

Upgrade immediately and review web/application logs for unexpected template-resolution behavior and new PHP files. Sites meeting the documented preconditions should receive incident-response review if they were exposed before patching.

#### Sources

- [WordPress — 7.1.2 Release](https://wordpress.org/news/2026/09/wordpress-7-1-2-release/)
- [Canadian Centre for Cyber Security — AV26-952](https://www.cyber.gc.ca/en/alerts-advisories/wordpress-security-advisory-av26-952)

### Roundcube CVE-2026-48842 is under active attack

**Severity:** High  
**Status:** Confirmed in-the-wild exploitation reporting  
**CVSS:** 8.1  
**CVE:** CVE-2026-48842  
**Affected:** Roundcube 1.6.x before 1.6.16 and 1.7.x before 1.7.1 when the vulnerable `virtuser_query` path is used

The pre-authentication SQL injection can let an unauthenticated remote attacker alter database queries and expose Roundcube data. Active exploitation was reported on September 24.

Patch exposed Roundcube systems and review authentication/database logs for anomalous query behavior. Removing or disabling the vulnerable plugin is a temporary mitigation when an immediate upgrade is not possible.

#### Sources

- [BleepingComputer — Roundcube CVE-2026-48842 active exploitation](https://www.bleepingcomputer.com/news/security/critical-roundcube-flaw-now-actively-exploited-in-code-injection-attacks/)

## Malware / APT / Campaign

### Storm-2570 keeps similar tradecraft while switching ransomware families

**Severity:** High  
**Status:** Confirmed ransomware-affiliate activity  
**Threat actor:** Storm-2570  
**Malware / RaaS:** Qilin, DragonForce, Anubis, BERT

Microsoft has tracked Storm-2570 since April 2025 across intrusions in multiple countries and sectors. The affiliate changes ransomware payloads while retaining recurring post-compromise behavior such as RMM tooling, credential access, lateral movement, security tampering and cloud-based exfiltration.

Defenders can hunt those recurring behaviors before the final ransomware payload appears. Remote-management inventory, privileged-account review and egress monitoring are more durable controls than family-specific blocklists.

#### Sources

- [Microsoft Threat Intelligence — Storm-2570](https://www.microsoft.com/en-us/security/blog/2026/09/24/beyond-the-ransomware-tracking-storm-2570-consistent-tradecraft-across-deployments/)

## Important vulnerabilities

### SolarWinds Platform 2026.2.3 fixes two unauthenticated RCE paths

**Severity:** Critical  
**Status:** No confirmed exploitation in the vendor release notes  
**CVE:** CVE-2026-28324, CVE-2026-28325  
**Affected:** SolarWinds Observability Self-Hosted / SolarWinds Platform in the documented configurations

CVE-2026-28324 is an unauthenticated RCE caused by insufficient integrity checks in a non-default, insecure configuration and carries CVSS 9.8. CVE-2026-28325 is an unauthenticated deserialization RCE when a specific communication mode is configured.

Upgrade to Platform 2026.2.3 and verify whether either prerequisite exists in the deployment.

#### Sources

- [SolarWinds Platform 2026.2.3 release notes](https://documentation.solarwinds.com/en/success_center/orionplatform/content/release_notes/solarwinds_platform_2026-2-3_release_notes.htm)

## Daily observations

- Four of the vulnerability events involve authentication or internet-facing application boundaries. Patch priority should account for exposure and observed exploitation, not CVSS alone.
- Storm-2570 reinforces that ransomware-family names are weak long-term detection anchors when the same affiliate rotates payloads.
