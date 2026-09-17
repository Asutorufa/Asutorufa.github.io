---
id: "2026-09-17"
title: "Threat Intelligence Daily · 2026-09-17"
date: "2026-09-17"
updated: "2026-09-17 23:00:00"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "Cisco disclosed an actively exploited, unauthenticated ISE authentication bypass with a CVSS score of 10.0. ESET documented FamousSparrow's new SparroWocky backdoor against Latin American governments, while CrowdStrike described PhantomRaven malware distributed through npm. Malwarebytes also tracked a large T-Mobile-themed SMS phishing campaign, and JVN published a fixed hard-coded-key flaw in Tohoku Electric Power's Yorisou e Net app."
total: 5
critical: 1
high: 2
medium: 1
low: 1
exploited: 3
tags:
  - active-exploitation
  - zero-day
  - authentication-bypass
  - cyber-espionage
  - supply-chain
  - phishing
  - mobile-security
  - Cisco-ISE
  - FamousSparrow
  - SparroWocky
  - PhantomRaven
  - npm
  - T-Mobile
  - Yorisou-e-Net
  - CVE-2026-75553
  - CVE-2026-76460
cves:
  - CVE-2026-75553
  - CVE-2026-76460
iocs:
  - 38.54.57.17
  - t-mobile.biktpw.top
  - t-mobile.cugbjl.top
  - t-mobile.cymfjd.top
---

## Changes since yesterday

- **NEW — Cisco ISE:** Cisco published CVE-2026-76460, a CVSS 10.0 authentication bypass affecting ISE and ISE-PIC, and confirmed exploitation in the wild.
- **NEW — FamousSparrow:** ESET documented SparroWocky, a new C++ backdoor used against government organizations in Latin America.
- **NEW — PhantomRaven:** CrowdStrike linked malicious npm packages carrying the PhantomRaven information stealer to a financially motivated bug-bounty hunter.
- **NEW — T-Mobile phishing:** Malwarebytes reported an SMS campaign using more than 1,000 closely related templates and at least 81 short-lived domains.
- **NEW — Yorisou e Net:** JVN published CVE-2026-75553; version 2.8.0 fixes the hard-coded cryptographic key in the Android and iOS apps.

## Priority actions

- **Immediate:** Patch Cisco ISE and ISE-PIC. Cisco provides no workaround for CVE-2026-76460; restrict management access while upgrades are completed and review exposed systems for unauthorized access.
- **Today:** For organizations in Latin America, hunt Windows systems for SparroWocky indicators, unexpected service/Run-key persistence, direct C2 connections on ports 443/8080, and unexplained BOF execution.
- **Today:** Review npm dependency intake and developer workstations for untrusted packages associated with PhantomRaven; rotate credentials or tokens exposed on affected systems.
- **Monitor:** Filter T-Mobile-themed reward-expiry SMS domains and direct users to verify account notices through the official app or site rather than message links.

## Priority threats

### Cisco ISE CVE-2026-76460 is under active exploitation

**Severity:** Critical  
**Status:** Confirmed active exploitation  
**CVSS:** 10.0  
**CVE:** CVE-2026-76460  
**Affected:** Cisco Identity Services Engine (ISE) and ISE Passive Identity Connector (ISE-PIC)

Cisco says an unauthenticated remote attacker can send a crafted request to an affected API endpoint and bypass the web management interface's authentication. The advisory was published September 16 and states that software updates are available; there is no workaround. Cisco PSIRT has confirmed exploitation in the wild.

#### Recommendation

Apply the fixed Cisco release for the deployed ISE branch. Until patching is complete, limit reachability of management interfaces to trusted administrative networks. Review authentication, API and administrative activity for access that cannot be tied to expected operators.

#### Sources

- [Cisco — Identity Services Engine Authentication Bypass Vulnerability](https://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-ISE-ABP-VNSW7Tn5.html)

### FamousSparrow deploys SparroWocky against Latin American governments

**Severity:** High  
**Status:** Confirmed cyber-espionage campaign  
**Threat actor:** FamousSparrow  
**Malware:** SparroWocky  
**Affected:** Government organizations in Latin America observed by ESET

ESET attributes the campaign and SparroWocky to FamousSparrow with high confidence. Since mid-2025, 90% of targets visible in ESET telemetry have been in Latin America. The modular C++ backdoor can execute files and commands, proxy TCP traffic, exfiltrate files, take screenshots and execute Beacon Object Files. Persistence uses either a Windows service or a Run-key entry. C2 connections use direct IP addresses, usually on port 443 and sometimes 8080.

#### Recommendations

- Hunt for the indicators in ESET's published IOC set and review direct outbound connections to unfamiliar infrastructure on ports 443 and 8080.
- Investigate unexpected services and Run-key persistence together with file exfiltration or periodic screenshot behavior.
- Government organizations in Argentina, Ecuador, Guatemala, Honduras, Panama, Peru, Puerto Rico and Venezuela should prioritize this campaign in endpoint hunting.

#### IOC

- `38.54.57.17` — SparroWocky C2 server observed by ESET.

#### Sources

- [ESET Research — Beware the SparroWock: The backdoor that bites, the commands that catch](https://www.welivesecurity.com/en/eset-research/beware-sparrowock-backdoor-bites-commands-catch/)

### PhantomRaven information stealer distributed through npm

**Severity:** High  
**Status:** Confirmed malicious-package campaign  
**Malware:** PhantomRaven  
**Affected:** Developers and organizations installing malicious npm packages

CrowdStrike identified a financially motivated actor distributing the JavaScript-based PhantomRaven information stealer through npm. The actor also worked as a bug-bounty hunter and, in one documented case, contacted a potential victim after a dependency-confusion compromise. CrowdStrike assesses with high confidence that an LLM was likely used to develop the malware, based on code characteristics and token analysis; that assessment is separate from the confirmed package distribution and malware behavior.

#### Recommendations

- Review newly introduced npm dependencies, especially packages added outside normal review or lockfile-change processes.
- Inspect developer endpoints and CI workers that executed untrusted packages. Rotate repository, cloud, CI and package-registry credentials if exposure is found.
- Treat package provenance and behavior as the security signal; LLM attribution does not change remediation priority.

#### Sources

- [CrowdStrike — PhantomRaven: An LLM-Generated Information Stealer Developed for Bug Bounty Hunting](https://www.crowdstrike.com/en-us/blog/phantomraven-llm-generated-information-stealer-for-bug-bounty-hunting/)

## Other notable items

### T-Mobile reward-expiry SMS campaign rotates short-lived phishing domains

**Severity:** Medium  
**Status:** Confirmed phishing campaign  
**Affected:** T-Mobile customers and recipients of T-Mobile-themed SMS lures

Malwarebytes has monitored the campaign since early May. Its dataset contains more than 1,000 closely related message templates and at least 81 domains used over four months. The messages invent reward balances and imminent expiry dates, then direct recipients to rotating `t-mobile.<domain>.top` sites intended to collect credentials, personal information, payment data or verification codes.

#### Recommendations

Block known campaign domains and detect the `t-mobile.*.top` naming pattern where appropriate. Users should open the official T-Mobile app or website independently instead of following links in unsolicited reward messages.

#### IOC

- `t-mobile.biktpw.top`
- `t-mobile.cugbjl.top`
- `t-mobile.cymfjd.top`

#### Sources

- [Malwarebytes — T-Mobile rewards points expiry texts are a phishing scam](https://www.malwarebytes.com/blog/threat-intel/2026/09/t-mobile-rewards-points-expiry-texts-are-a-phishing-scam)

### Yorisou e Net app used a hard-coded cryptographic key

**Severity:** Low  
**Status:** Fixed; no confirmed exploitation  
**CVSS:** 2.4  
**CVE:** CVE-2026-75553  
**Affected:** Android and iOS versions of Tohoku Electric Power "Yorisou e Net" before 2.8.0

JVN reports that an attacker with physical access could retrieve a hard-coded cryptographic key from affected app versions. Version 2.8.0 or later fixes the issue. JVN does not report exploitation in the wild.

#### Recommendation

Update the Android or iOS app to version 2.8.0 or later. The physical attack requirement and limited confidentiality impact keep this below the network-exploitable items above.

#### Sources

- [JVN — JVN#93985674](https://jvn.jp/en/jp/JVN93985674/index.html)

## Daily observations

- Cisco ISE is the only vulnerability in this report with confirmed in-the-wild exploitation and unauthenticated network reachability; it takes patch priority over the newly disclosed local/mobile issue.
- SparroWocky and PhantomRaven require different detection scopes: the first is an endpoint espionage implant with published infrastructure, while the second enters through developer dependencies and can expose credentials from build environments.
- The T-Mobile campaign's rotating domains make individual block entries short-lived. Message semantics, domain patterning and user verification through the official app provide broader coverage.
