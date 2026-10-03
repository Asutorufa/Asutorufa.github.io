---
id: "2026-09-27"
title: "Threat Intelligence Daily · 2026-09-27"
date: "2026-09-27"
updated: "2026-10-03 03:30:00"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "Two developments defined September 27: Citrix disclosed two NetScaler zero-days already exploited against unmitigated appliances, while Kiteworks lifted its precautionary shutdown recommendation and still reported no evidence of customer compromise."
total: 2
critical: 1
high: 0
medium: 1
low: 0
exploited: 1
tags:
  - active-exploitation
  - zero-day
  - edge-device
  - vpn
  - NetScaler
  - Citrix
  - Kiteworks
  - CVE-2026-88771
  - CVE-2026-88772
cves:
  - CVE-2026-88771
  - CVE-2026-88772
iocs: []
---

## Changes since yesterday

- **NEW — Citrix NetScaler:** Citrix published CVE-2026-88771 and CVE-2026-88772 and confirmed exploitation against unmitigated NetScaler deployments.
- **UPDATED — Kiteworks:** the vendor lifted its shutdown recommendation on September 27; hosted systems were restored and no compromise had been identified at that point.

## Priority actions

- **Immediate:** Upgrade NetScaler ADC/Gateway to 14.1-73.37, 13.1-64.23 or the applicable fixed FIPS/NDcPP build.
- **Immediate:** Treat previously exposed NetScaler appliances as incident-response candidates. Patching removes the vulnerability but does not remove persistence established before the update.
- **Today:** Kiteworks customers should follow the vendor's restart guidance and retain telemetry from the precautionary shutdown window for later review.

## Priority threats

### NetScaler CVE-2026-88771 and CVE-2026-88772 exploited before disclosure

**Severity:** Critical  
**Status:** Confirmed active exploitation / zero-day activity  
**CVSS:** 9.5 (v4) for both highlighted CVEs  
**CVE:** CVE-2026-88771, CVE-2026-88772  
**Affected:** Customer-managed NetScaler ADC and NetScaler Gateway

CVE-2026-88771 is an unauthenticated command-execution flaw caused by improper input validation and affects default deployments. CVE-2026-88772 is a memory-overflow issue that can produce RCE or DoS when DTLS is enabled; DTLS is enabled by default on VPN vServers. Citrix says exploits of both flaws have been observed on unmitigated systems.

Install the fixed releases and preserve appliance logs before cleanup. Review web roots, authentication paths and outbound connections for persistence or web-shell activity.

#### Sources

- [Citrix — CTX697096 NetScaler security bulletin](https://support.citrix.com/external/article/CTX697096)

## Other notable items

### Kiteworks lifted the precautionary shutdown recommendation

**Severity:** Medium  
**Status:** Preventive response update; no compromise confirmed  
**Affected:** Kiteworks systems covered by the September 25 advisory

Kiteworks updated its advisory on September 27 to say the shutdown recommendation was lifted for all customers and hosted systems were operating normally. The company still had not identified compromise.

Customers can restore systems under the vendor guidance while retaining logs from the threat window. The status change does not justify inventing a breach that the vendor did not report.

#### Sources

- [Kiteworks — Precautionary Shutdown Advisory](https://www.kiteworks.com/company/press-releases/kiteworks-precautionary-shutdown-advisory/)

## Daily observations

- The NetScaler disclosure is a patch-and-hunt case: confirmed pre-disclosure exploitation changes the task from preventive maintenance to compromise assessment.
- Kiteworks moved in the opposite direction, from precautionary shutdown to restoration without observed compromise. Both states belong in the daily record because they change operator action.
