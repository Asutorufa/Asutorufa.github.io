---
id: "2026-09-29"
title: "Threat Intelligence Daily · 2026-09-29"
date: "2026-09-29"
updated: "2026-10-03 03:30:00"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "September 29 combined two active threat-research disclosures with two library/server vulnerability sets: Microsoft described phishing that abuses MSP360 and ScreenConnect plus Star Blizzard's RedFlick delivery technique, while JVN published seven Pgpool-II CVEs and CERT/CC disclosed an Authlib JWS signature-verification bypass."
total: 4
critical: 0
high: 4
medium: 0
low: 0
exploited: 2
tags:
  - phishing
  - credential-theft
  - rmm
  - Star-Blizzard
  - RedFlick
  - CosmicPulse
  - Authlib
  - Pgpool-II
  - CVE-2026-96760
cves:
  - CVE-2026-92867
  - CVE-2026-92868
  - CVE-2026-92869
  - CVE-2026-92870
  - CVE-2026-92871
  - CVE-2026-92872
  - CVE-2026-92873
  - CVE-2026-96760
iocs:
  - 108ef7e628d7a20bd6241a5b57149e27a6061f467123eb64061975559f8f73dc
  - adswre.cfd
  - trews.cfd
  - adsaw.cfd
  - sdfghj.rd-team.ru
---

## Changes since yesterday

- **NEW — RMM phishing:** Microsoft documented phishing that installs a legitimate MSP360 RMM agent and then deploys ScreenConnect as a second persistent remote-access channel.
- **NEW — Star Blizzard:** Microsoft described RedFlick, a malware-delivery technique used with the CosmicPulse backdoor in continuing espionage operations.
- **NEW — Pgpool-II:** JVN published seven CVEs with effects including memory corruption, authentication/security failures and code execution paths; the highest CVSS v3 score is 8.8.
- **NEW — Authlib:** CERT/CC disclosed CVE-2026-96760, where a JWS object with an empty `signatures` array can be accepted as verified.

## Priority actions

- **Immediate:** Inventory unapproved RMM software and investigate MSP360 or ScreenConnect installs that originated from user download paths, phishing lures or unexpected PowerShell.
- **Today:** Hunt Star Blizzard credential-phishing and CosmicPulse/RedFlick indicators from Microsoft's report, especially in Ukraine-policy and international-affairs targets.
- **Today:** Update Pgpool-II to the fixed 4.7.3/4.6.8/4.5.13/4.4.18/4.3.21 branches or newer.
- **Today:** Applications using Authlib JWS JSON serialization should avoid treating an empty signatures array as authenticated and track vendor remediation.

## Priority threats

### Phishing uses MSP360 and ScreenConnect for redundant remote access

**Severity:** High  
**Status:** Confirmed phishing / post-compromise activity  
**Affected:** Windows endpoints that execute masqueraded MSP360 installers

Microsoft observed phishing lures that delivered a legitimate, signed MSP360 RMM installer under deceptive filenames. After installation, the RMM service launched PowerShell to install ScreenConnect, giving the actor a second remote-access path. Microsoft did not observe exploitation of ScreenConnect itself.

Look for MSP360 services created from download directories, PowerShell fetching `ClientSetup.msi`, and ScreenConnect infrastructure that does not match approved support tooling.

#### IOC

- `SHA256 108ef7e628d7a20bd6241a5b57149e27a6061f467123eb64061975559f8f73dc`
- `adswre[.]cfd`
- `trews[.]cfd`
- `adsaw[.]cfd`
- `sdfghj[.]rd-team[.]ru`

#### Sources

- [Microsoft Security Research — Phishing Abuses RMM Tools for Persistent Access](https://www.microsoft.com/en-us/security/blog/2026/09/29/phishing-abuses-rmm-tools-persistent-access/)

### Star Blizzard adopted the RedFlick delivery technique

**Severity:** High  
**Status:** Confirmed cyberespionage activity  
**Threat actor:** Star Blizzard  
**Malware:** CosmicPulse  
**Affected:** Ukrainian individuals/institutions and international NGOs, think tanks, governments and policy-linked organizations

Microsoft has observed Star Blizzard evolving its phishing and detection-evasion activity since January 2026. RedFlick uses scheduled tasks in the malware-delivery chain for CosmicPulse and reduces reliance on the multi-step ClickFix interaction previously seen in the actor's operations.

Organizations in the documented target set should prioritize identity telemetry, suspicious scheduled-task creation and the IOCs in Microsoft's report.

#### Sources

- [Microsoft Threat Intelligence — Star Blizzard RedFlick](https://www.microsoft.com/en-us/security/blog/2026/09/29/star-blizzard-refines-phishing-and-malware-delivery-with-the-redflick-technique/)

## Important vulnerabilities

### Pgpool-II multiple vulnerabilities

**Severity:** High  
**Status:** No confirmed exploitation in JVN  
**CVE:** CVE-2026-92867, CVE-2026-92868, CVE-2026-92869, CVE-2026-92870, CVE-2026-92871, CVE-2026-92872, CVE-2026-92873  
**Affected:** Pgpool-II 3.5.x through affected 4.7.x branches as specified by JVN

The seven issues cover several failure modes, with the highest CVSS v3 score at 8.8. Supported fixed versions include 4.7.3, 4.6.8, 4.5.13, 4.4.18 and 4.3.21; older branches should move to a supported release.

#### Sources

- [JVN#22475874 — Multiple vulnerabilities in Pgpool-II](https://jvn.jp/en/jp/JVN22475874/)

### Authlib CVE-2026-96760 can bypass JWS signature verification

**Severity:** High  
**Status:** No confirmed exploitation in CERT/CC note  
**CVE:** CVE-2026-96760  
**Affected:** Authlib through 1.7.2

`JsonWebSignature.deserialize_json()` can accept a JWS general JSON object with an empty `signatures` array and treat the payload as verified, allowing forged content without key material.

Review any application path that relies on this API for authentication or authorization. Until a vendor-fixed version is confirmed, reject empty signature arrays before accepting the result as authenticated.

#### Sources

- [CERT/CC — VU#762428](https://kb.cert.org/vuls/id/762428)

## IOC summary

| Type | Indicator | Context |
| --- | --- | --- |
| SHA256 | `108ef7e628d7a20bd6241a5b57149e27a6061f467123eb64061975559f8f73dc` | MSP360 installer observed in phishing |
| Domain | `adswre[.]cfd` | malicious ScreenConnect session infrastructure |
| Domain | `trews[.]cfd` | malicious ScreenConnect session infrastructure |
| Domain | `adsaw[.]cfd` | malicious ScreenConnect session infrastructure |
| Domain | `sdfghj[.]rd-team[.]ru` | malicious ScreenConnect session infrastructure |

## Daily observations

- Legitimate RMM software is part of the attack chain in the Microsoft campaign; signed binaries and expected product names are not enough to establish benign use.
- Authlib's issue sits at an authentication primitive. Application-level compensating validation matters when a library fix is not yet available.
