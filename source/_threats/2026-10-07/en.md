---
id: "2026-10-07"
title: "Threat Intelligence Daily · 2026-10-07"
date: "2026-10-07"
updated: "2026-10-10"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "October 7 retained four events. Cisco's scheduled release included multiple unauthenticated root-RCE paths in NX-OS and a separate License On-Prem hardening set with a CVSS 10 signature-verification flaw; Splunk Enterprise fixed a multi-CVE advisory with a 9.8 maximum score; and IDC Frontier confirmed ransomware behind the IDCF Cloud East Japan Region 1 outage affecting 495 customers."
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 0
tags:
  - network-infrastructure
  - rce
  - license-management
  - siem
  - ransomware
  - cloud
  - Cisco
  - Splunk
  - IDCF
  - CVE-2026-76465
  - CVE-2026-76471
  - CVE-2026-76482
cves:
  - CVE-2026-76264
  - CVE-2026-76265
  - CVE-2026-76272
  - CVE-2026-76280
  - CVE-2026-76465
  - CVE-2026-76471
  - CVE-2026-76480
  - CVE-2026-76482
  - CVE-2026-76483
  - CVE-2026-76484
  - CVE-2026-76485
  - CVE-2026-76486
  - CVE-2026-76501
iocs: []
---

## Changes since yesterday

- **NEW — Cisco NX-OS:** Cisco published several Critical paths to unauthenticated remote code execution with root privileges in MPLS OAM, NX-API and NGOAM features.
- **NEW — Cisco License On-Prem:** the October hardening release fixed four security classes, including CVE-2026-76482 at CVSS 10.0.
- **NEW — Splunk Enterprise:** SVD-2026-1001 fixed multiple vulnerabilities across supported 9.4, 10.0, 10.2 and 10.4 branches; the advisory's highest CVSS score is 9.8.
- **NEW — IDCF Cloud:** IDC Frontier confirmed ransomware as the cause of the East Japan Region 1 incident and reported impact to 495 companies and local governments.

## Priority actions

- **Immediate:** Match Nexus/NX-OS feature configuration against the October 7 Cisco advisories and deploy the fixed trains for exposed NX-API, MPLS OAM and NGOAM deployments.
- **Immediate:** Upgrade Cisco License On-Prem to 10-202609 or the vendor-designated fixed release; there is no workaround for the hardening set.
- **Today:** Upgrade Splunk Enterprise to 10.4.3, 10.2.7, 10.0.10, 9.4.15 or later and apply the advisory's additional remediation steps.
- **Today:** IDCF customers should follow the provider's isolation/recovery guidance and validate dependencies on East Japan Region 1 before restoring trust to connected systems.

## Priority threats

### Cisco NX-OS October release includes multiple unauthenticated root-RCE paths

**Severity:** Critical  
**Status:** No confirmed exploitation in the cited Cisco advisories  
**CVE:** CVE-2026-76465, CVE-2026-76471, CVE-2026-76485, CVE-2026-76486, CVE-2026-76501  
**Affected:** Specific Cisco Nexus 3000/9000 and NX-OS configurations using MPLS OAM, NX-API or NGOAM

CVE-2026-76465 affects MPLS OAM, CVE-2026-76471 affects NX-API, and the NGOAM group covers three additional RCE flaws. Successful exploitation can execute arbitrary code with root privileges or cause denial of service, depending on the path.

Use Cisco's Software Checker and advisory-specific configuration prerequisites rather than treating every NX-OS device as equally exposed. Patch feature-enabled internet or management-network reachable devices first.

#### Sources

- [Cisco — NX-API RCE](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-napi-rce-r2shwu2j)
- [Cisco — MPLS OAM RCE](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-moam-rce-uBTzYV7)
- [Cisco — NGOAM RCE vulnerabilities](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-ngoam-rce-LWKQ4BU)

### Cisco License On-Prem hardening release contains a CVSS 10 trust failure

**Severity:** Critical  
**Status:** Cisco PSIRT reported no malicious use  
**CVSS:** 10.0 for CVE-2026-76482  
**CVE:** CVE-2026-76480, CVE-2026-76482, CVE-2026-76483, CVE-2026-76484  
**Affected:** Cisco License On-Prem releases documented in the October 2026 hardening advisory

The set covers missing authentication, improper cryptographic-signature verification, insufficiently protected credentials and code injection. Cisco lists no workaround; 10-202609 is the first fixed release for the current 10.x line.

Upgrade rather than attempting configuration-only mitigation. Keep the management interface on trusted networks even after patching.

#### Sources

- [Cisco — License On-Prem Security Hardening Release](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-hardening-ssm-Ph77wdhf)

### Splunk Enterprise SVD-2026-1001 requires both upgrade and follow-up remediation

**Severity:** Critical  
**Status:** No confirmed exploitation in the Splunk advisory  
**CVSS:** Highest score 9.8  
**CVE:** CVE-2026-76264, CVE-2026-76265, CVE-2026-76272, CVE-2026-76280  
**Affected:** Splunk Enterprise 9.4, 10.0, 10.2 and 10.4 branches before the fixed releases

Splunk fixed multiple vulnerabilities in 10.4.3, 10.2.7, 10.0.10 and 9.4.15. The advisory explicitly calls out extra remediation steps for the four CVEs listed above, so installing a package update should not be treated as the only task.

Apply the fixed release and complete the CVE-specific post-upgrade steps from SVD-2026-1001.

#### Sources

- [Splunk — SVD-2026-1001](https://advisory.splunk.com/advisories/SVD-2026-1001)

## Confirmed incidents

### IDCF Cloud East Japan Region 1 outage was caused by ransomware

**Severity:** High  
**Status:** Confirmed ransomware incident  
**Affected:** East Japan Region 1; 495 companies and local-government customers reported in the October 7 update

IDC Frontier said unauthorized access beginning around 03:40 JST was determined to be a ransomware attack. The provider isolated the affected region and continued investigating the intrusion path and full impact.

Customers should follow provider guidance, inventory workloads and credentials connected to the affected region, and avoid assuming that service restoration alone closes compromise risk.

#### Sources

- [IDC Frontier — October 7 second report](https://www.idcf.jp/news/topics/20261007002)

## Daily observations

- Cisco's release volume is best handled by feature exposure, not raw CVE count. NX-API/OAM enablement determines which devices deserve the first patch window.
- The IDCF statement confirms ransomware but not the intrusion vector; attributing it to any of the day's newly disclosed CVEs would be speculation.
