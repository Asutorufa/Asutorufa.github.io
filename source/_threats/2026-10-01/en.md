---
id: "2026-10-01"
title: "Threat Intelligence Daily · 2026-10-01"
date: "2026-10-01"
updated: "2026-10-03 03:45:00"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "October 1 combined an actively exploited FortiMail zero-day with two targeted campaigns and a firmware security note: Fortinet disclosed CVE-2026-104286 and attack IOCs, Proofpoint detailed TA419 credential phishing against AI-policy experts, Symantec described Longlegs/Warlock attacks on critical infrastructure, and CERT/CC published InsydeH2O IHISI SMM memory-write findings."
total: 4
critical: 1
high: 2
medium: 1
low: 0
exploited: 3
tags:
  - active-exploitation
  - zero-day
  - phishing
  - apt
  - ransomware
  - sharepoint
  - firmware
  - FortiMail
  - TA419
  - Warlock
  - Longlegs
  - CVE-2025-1055
  - CVE-2026-104286
  - CVE-2026-12855
cves:
  - CVE-2025-1055
  - CVE-2026-104286
  - CVE-2026-12855
iocs:
  - 79.141.169.187
  - 45.129.0.192
  - sha256:8015f34dc84922b03688399d7f9fe7a00361789f7e420c7e2a2cdb23e75cef84
  - sha256:8953ec7960b09f544a880b072ad4e6cfda7a8303f486251d3478dcfdfbac23b6
---

## Changes since yesterday

- **NEW — FortiMail:** Fortinet disclosed CVE-2026-104286, CVSS 9.8, and confirmed active zero-day exploitation against the management interface.
- **NEW — TA419:** Proofpoint published China-aligned credential-phishing campaigns that impersonated AI policymakers and economists to target US AI-policy experts; Japanese think-tank targeting was also reported.
- **NEW — Longlegs / Warlock:** Symantec documented recent SharePoint-led ransomware intrusions against water, telecom, government and university targets in Portuguese- and Spanish-speaking countries.
- **NEW — InsydeH2O:** CERT/CC published CVE-2026-12855, an SMM unsafe-memory-write issue in OEM-specific IHISI modules.

## Priority actions

- **Immediate:** Restrict FortiMail management access, apply Fortinet's workaround where required, upgrade as fixed versions become available, and hunt the vendor-published file/IP indicators.
- **Today:** Organizations working on AI policy, export controls or national strategy should review credential-phishing telemetry for impersonation of known researchers, economists and policy figures.
- **Today:** On-prem SharePoint operators should keep hunting for web shells and forged application access associated with the Longlegs/Warlock playbook.
- **Monitor:** Check OEM firmware bulletins before applying CVE-2026-12855 broadly; CERT/CC notes that the vulnerable modules are OEM-specific and several vendors reported they are not affected.

## Priority threats

### FortiMail CVE-2026-104286 exploited as a zero-day

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 9.8  
**CVE:** CVE-2026-104286  
**Affected:** FortiMail 8.0.0–8.0.1, 7.6.0–7.6.6, 7.4.0–7.4.8, 7.2.0–7.2.9

Path traversal plus null-byte handling in the management interface can let an unauthenticated attacker write arbitrary files through crafted HTTP/S requests. Fortinet confirmed active exploitation and published file hashes, logs and attacker infrastructure.

Where a fixed build is not yet available, follow Fortinet's mitigation guidance, including restricting management access and disabling the affected IBE feature where applicable. Systems matching the IOCs should be treated as compromise candidates.

#### IOC

- `79.141.169[.]187`
- `45.129.0[.]192`
- `SHA256 8015f34dc84922b03688399d7f9fe7a00361789f7e420c7e2a2cdb23e75cef84`
- `SHA256 8953ec7960b09f544a880b072ad4e6cfda7a8303f486251d3478dcfdfbac23b6`

#### Sources

- [Fortinet PSIRT — FG-IR-26-175](https://fortiguard.fortinet.com/psirt/FG-IR-26-175)
- [BleepingComputer — FortiMail zero-day exploitation](https://www.bleepingcomputer.com/news/security/fortinet-warns-of-critical-fortimail-flaw-exploited-in-zero-day-attacks/)

### TA419 impersonated AI-policy figures to steal credentials

**Severity:** High  
**Status:** Confirmed targeted credential-phishing campaign  
**Threat actor:** TA419  
**Affected:** AI-policy experts at think tanks, universities, legal-sector organizations and related institutions

Proofpoint observed multiple July campaigns impersonating economists and AI policymakers, including a former US government official. The objective was credential theft against a small set of high-value AI-policy targets. Earlier 2026 activity also impersonated an Anthropic employee.

The target set should validate unexpected collaboration invitations through an independent channel and review identity logs for credential replay or anomalous sign-ins following phishing.

#### Sources

- [Proofpoint — TA419 and US AI policy](https://www.proofpoint.com/us/blog/threat-insight/hallucinating-credibility-china-aligned-ta419-impersonates-its-way-us-ai-policy)

### Longlegs continues Warlock ransomware intrusions through SharePoint

**Severity:** High  
**Status:** Confirmed ransomware / targeted intrusion activity  
**Threat actor:** Longlegs / Storm-2603  
**Malware:** Warlock ransomware  
**CVE:** CVE-2025-1055 used for BYOVD defense evasion  
**Affected:** Recent water, telecom, regional-government and university victims

Symantec reported at least four recent victims across Portuguese- and Spanish-speaking countries. Longlegs continues to favor SharePoint-related initial access, then uses web shells, stolen SharePoint machine keys, living-off-the-land tooling, VS Code tunnels and a vulnerable signed K7RKScan driver before ransomware deployment.

Prioritize on-prem SharePoint exposure, web-shell hunting, unusual VS Code tunnel services and K7RKScan driver activity.

#### Sources

- [Security.com / Symantec — Warlock attacks critical infrastructure](https://www.security.com/threat-intelligence/warlock-ransomware-critical-infrastructure)

## Important vulnerabilities

### InsydeH2O IHISI CVE-2026-12855 requires OEM-specific scoping

**Severity:** Medium  
**Status:** No confirmed exploitation in CERT/CC note  
**CVE:** CVE-2026-12855  
**Affected:** OEM-specific InsydeH2O IHISI SMM modules; scope depends on system vendor

The issue is an unsafe SMM memory write that can allow a local attacker already holding OS-kernel privileges to write physical memory, including SMRAM, and potentially execute in SMM. CERT/CC stresses that the vulnerable modules are OEM-specific. AMI, ASUS and GIGABYTE reported they are not affected; several other vendor statuses remained unknown in the note.

Use the OEM security bulletin for the actual device model rather than treating every Insyde-based system as affected.

#### Sources

- [CERT/CC — VU#553437](https://www.kb.cert.org/vuls/id/553437)

## IOC summary

| Type | Indicator | Context |
| --- | --- | --- |
| IPv4 | `79.141.169[.]187` | FortiMail attack infrastructure |
| IPv4 | `45.129.0[.]192` | FortiMail attack infrastructure |
| SHA256 | `8015f34dc84922b03688399d7f9fe7a00361789f7e420c7e2a2cdb23e75cef84` | FortiMail malicious file |
| SHA256 | `8953ec7960b09f544a880b072ad4e6cfda7a8303f486251d3478dcfdfbac23b6` | FortiMail malicious file |

## Daily observations

- FortiMail is the only vulnerability here with confirmed active exploitation; the other high-severity items are campaigns with different response requirements.
- Firmware advisories need exact hardware scoping. CVE-2026-12855 is a useful example where copying the CVE onto every Insyde system would overstate exposure.
