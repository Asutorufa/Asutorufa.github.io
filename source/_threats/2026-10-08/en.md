---
id: "2026-10-08"
title: "Threat Intelligence Daily · 2026-10-08"
date: "2026-10-08"
updated: "2026-10-10"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "October 8 retained four events: Atlassian CVE-2026-21589 moved into confirmed in-the-wild exploitation; Huntress observed AhsayCBS CVE-2026-105133/105134 being chained for SYSTEM-level RCE; tensorlake npm 0.5.144 was published with a Shai-Hulud worm; and the DOJ/FBI seized infrastructure tied to Flax Typhoon's Microscan and FishHub tooling."
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 2
tags:
  - active-exploitation
  - arbitrary-file-read
  - auth-bypass
  - rce
  - supply-chain
  - malicious-package
  - apt
  - Atlassian
  - Ahsay
  - Shai-Hulud
  - Flax-Typhoon
  - CVE-2026-21589
  - CVE-2026-105133
  - CVE-2026-105134
cves:
  - CVE-2026-105133
  - CVE-2026-105134
  - CVE-2026-21589
iocs:
  - iseekaigogo.com
  - sha256:25a0735d0db7dc40e5d45ce42d9c106067e6a66e184d967cfecfab17c3bcb5ef
  - sha256:b50a00900399ba99fb6ce1fc151519cb99d44320ef2a631f2237e1aea0ad6fec
  - c0cc.cc
  - 98aiblog.com
  - 98aicai.com
  - 98aicode.com
  - outlook3650.com
  - youtubecard.com
  - linkedinns.net
---

## Changes since yesterday

- **UPDATED — Atlassian:** watchTowr reported in-the-wild exploitation of CVE-2026-21589 after Atlassian's October 5 disclosure.
- **UPDATED — AhsayCBS:** Huntress began observing exploitation on October 7 at 23:20 UTC, chaining CVE-2026-105133 and CVE-2026-105134 to obtain unauthenticated RCE and deploy webshells/XMRig.
- **NEW — tensorlake npm:** version 0.5.144 was published with a Shai-Hulud variant that steals secrets and attempts supply-chain self-propagation.
- **NEW — Flax Typhoon:** the U.S. DOJ and FBI seized seven domains tied to Integrity Tech infrastructure used for Microscan, FishHub and persistence tooling.

## Priority actions

- **Immediate:** Patch affected Atlassian Data Center products and hunt for arbitrary-file-read attempts on systems exposed since the advisory.
- **Immediate:** Restrict AhsayCBS management access, update to the vendor-remediated release, and investigate child processes/webshell activity from CBS services.
- **Immediate:** Remove tensorlake 0.5.144, rotate secrets available to any host or CI job that installed it, and inspect repositories/packages for self-propagated changes.
- **Today:** Add the seized Flax Typhoon domains to detection context and hunt for unexpected SoftEther VPN, Microscan/FishHub artifacts and associated access patterns.

## Priority threats

### Atlassian CVE-2026-21589 is being exploited in the wild

**Severity:** Critical  
**Status:** Confirmed in-the-wild exploitation  
**CVSS:** 9.3  
**CVE:** CVE-2026-21589  
**Affected:** Eight Atlassian Data Center/self-hosted product families listed in the vendor advisory

The status changed from the October 5 vendor disclosure: watchTowr reported observed exploitation by October 6. The flaw allows unauthenticated reading of a known file path, making predictable configuration and secret locations the primary concern.

Patch first, then inspect request logs and sensitive-file access for the period before remediation. Do not rely on Atlassian's October 5 “no evidence” statement as the current exploitation status.

#### Sources

- [Atlassian — CVE-2026-21589 advisory](https://confluence.atlassian.com/security/cve-2026-21589-arbitrary-file-access-vulnerability-impacts-multiple-products-1870495748.html)
- [watchTowr — CVE-2026-21589 FAQ](https://watchtowr.com/intelligence/atlassian-arbitrary-file-access-vulnerability-jira-confluence-cve-2026-21589-faq/)

### AhsayCBS flaws are chained for SYSTEM-level remote code execution

**Severity:** Critical  
**Status:** Confirmed active exploitation  
**CVE:** CVE-2026-105133, CVE-2026-105134  
**Affected:** Internet-accessible AhsayCBS deployments on affected versions

Huntress observed attackers use CVE-2026-105133 for authentication bypass and CVE-2026-105134 for RCE. Post-exploitation included JSP webshells, reconnaissance and XMRig deployed under names resembling Microsoft Edge components.

Update to the current fixed release and restrict management access to trusted IPs/VPN. Review process trees under AhsayCBS services, newly written JSP files, scheduled/services changes and cryptocurrency-miner indicators.

#### Sources

- [Huntress — Active exploitation of AhsayCBS](https://www.huntress.com/blog/ahsaycbs-flaws-exploit)

### tensorlake npm 0.5.144 contains a Shai-Hulud supply-chain worm

**Severity:** Critical  
**Status:** Confirmed malicious package publication  
**Affected:** npm package `tensorlake@0.5.144`

Aikido found the malicious npm release executing a preinstall chain that steals local/cloud/developer secrets and attempts propagation using recovered credentials. The report found no equivalent malicious release in Tensorlake's PyPI or Cargo distributions at publication time.

Treat systems that installed 0.5.144 as compromised rather than merely “vulnerable.” Remove the package, rotate npm/GitHub/cloud and local secrets exposed to the process, and inspect repositories for unauthorized commits or package-publish activity.

#### IOC

- `iseekaigogo[.]com`
- `SHA256 25a0735d0db7dc40e5d45ce42d9c106067e6a66e184d967cfecfab17c3bcb5ef`
- `SHA256 b50a00900399ba99fb6ce1fc151519cb99d44320ef2a631f2237e1aea0ad6fec`

#### Sources

- [Aikido — tensorlake npm package compromised](https://www.aikido.dev/blog/tensorlake-npm-package-compromised)

## Malware / APT / Campaign

### DOJ/FBI disrupt Flax Typhoon's Microscan and FishHub infrastructure

**Severity:** High  
**Status:** Confirmed state-linked intrusion infrastructure disruption  
**Threat actor:** Flax Typhoon / Integrity Technology Group  
**Tools:** Microscan, FishHub, SoftEther VPN

The DOJ said court-authorized seizures denied access to infrastructure used to scan and compromise critical infrastructure and other networks. FishHub supported spear-phishing and follow-on malware delivery; seized infrastructure was also linked to persistent remote access.

The domains are useful for historical hunting even though law enforcement has seized them. A match should be interpreted with timestamp and context rather than blocked-domain traffic alone.

#### IOC

- `c0cc[.]cc`
- `98aiblog[.]com`
- `98aicai[.]com`
- `98aicode[.]com`
- `outlook3650[.]com`
- `youtubecard[.]com`
- `linkedinns[.]net`

#### Sources

- [U.S. Department of Justice — Flax Typhoon infrastructure seizure](https://www.justice.gov/opa/pr/justice-department-and-fbi-seize-vulnerability-scanning-and-spear-phishing-tools-operated)

## IOC summary

| Event | Indicator | Context |
| --- | --- | --- |
| tensorlake | `iseekaigogo[.]com` | Shai-Hulud C2 |
| tensorlake | `25a0735d...bcb5ef` | malicious setup script SHA256 |
| tensorlake | `b50a0090...d6fec` | malicious payload SHA256 |
| Flax Typhoon | `c0cc[.]cc` | Microscan infrastructure |
| Flax Typhoon | `98aicai[.]com` / `98aicode[.]com` | FishHub delivery infrastructure |

## Daily observations

- Two vulnerabilities that were “not confirmed exploited” earlier in the week acquired direct exploitation telemetry. Historical status needs to remain date-specific.
- The tensorlake event requires credential rotation and repository review, not a normal patch-only workflow.
