---
id: "2026-10-06"
title: "Threat Intelligence Daily · 2026-10-06"
date: "2026-10-06"
updated: "2026-10-10"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "October 6 retained four events: Chrome 155 shipped 247 security fixes including four Critical use-after-free CVEs; Veeam fixed a CVSS 9.4 Backup & Replication RCE; SonicWall patched four SMA1000 flaws led by a CVSS 10 SSRF; and Google described hijacks of .gh, .sl and .as registries that enabled unauthorized DNS changes and HTTPS certificates."
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 0
tags:
  - browser
  - backup
  - edge-device
  - vpn
  - dns
  - certificate
  - infrastructure
  - Chrome
  - Veeam
  - SonicWall
  - CVE-2026-106382
  - CVE-2025-64393
  - CVE-2026-102255
cves:
  - CVE-2025-64392
  - CVE-2025-64393
  - CVE-2026-102255
  - CVE-2026-102256
  - CVE-2026-102257
  - CVE-2026-102258
  - CVE-2026-106197
  - CVE-2026-106347
  - CVE-2026-106358
  - CVE-2026-106382
  - CVE-2026-93026
iocs: []
---

## Changes since yesterday

- **NEW — Chrome 155:** Google shipped 247 security fixes, including four Critical use-after-free CVEs in Chromecast, Browser, Navigation and Track.
- **NEW — Veeam:** Backup & Replication 12.3.2 P4 fixed CVE-2025-64393, which lets a low-privileged Backup Viewer reach RCE through insecure deserialization in the Mount Service.
- **NEW — SonicWall SMA1000:** four vulnerabilities were patched, led by CVE-2026-102255 at CVSS 10.0. SonicWall said it had no evidence of in-the-wild exploitation.
- **NEW — ccTLD registry hijacks:** Google documented compromises of third-party .gh, .sl and .as registries that allowed DNS changes and unauthorized HTTPS certificates for domains belonging to Google and other organizations.

## Priority actions

- **Immediate:** Update managed Chrome fleets to 155.0.8059.39/.40 or later and confirm restart/compliance coverage.
- **Immediate:** Upgrade Veeam Backup & Replication 12.x to 12.3.2.4934 or move to a supported v13 build.
- **Today:** Patch affected SonicWall SMA1000 appliances to 12.4.3-03670 / 12.5.0-03082 or later.
- **Today:** Organizations using .gh, .sl or .as domains should inspect certificate-transparency logs, DNS history and CAA policy for unauthorized issuance or changes.

## Priority threats

### Chrome 155 fixes four Critical use-after-free vulnerabilities

**Severity:** Critical  
**Status:** Google did not report active exploitation in the release post  
**CVE:** CVE-2026-106197, CVE-2026-106347, CVE-2026-106358, CVE-2026-106382  
**Affected:** Chrome desktop releases before 155.0.8059.39/.40

The October 6 stable update contains 247 security fixes. Four were rated Critical and affect Chromecast, Browser, Navigation and Track components. Google retained restrictions on some bug details while users update.

Push the stable update through enterprise policy and verify that endpoints actually restart into the fixed build.

#### Sources

- [Chrome Releases — Stable Channel Update for Desktop](https://chromereleases.googleblog.com/2026/10/stable-channel-update-for-desktop_086471744.html)

### Veeam CVE-2025-64393 reaches RCE from the Backup Viewer role

**Severity:** Critical  
**Status:** No confirmed exploitation in Veeam's bulletin  
**CVSS:** 9.4 (CVSS v4)  
**CVE:** CVE-2025-64393, CVE-2025-64392, CVE-2026-93026  
**Affected:** Veeam Backup & Replication 12.3.2.4854 and older v12 builds

CVE-2025-64393 allows a low-privileged user with Backup Viewer permissions to send untrusted data through the Mount Service and reach remote code execution on the backup server. Two additional vulnerabilities were fixed in the same P4 update.

Upgrade to build 12.3.2.4934 or later. Backup infrastructure should be treated as privileged: narrow console access and review role assignments while patching.

#### Sources

- [Veeam — KB4934](https://www.veeam.com/kb4934)

### SonicWall SMA1000 patch set includes CVSS 10 SSRF

**Severity:** Critical  
**Status:** SonicWall reported no evidence of in-the-wild exploitation  
**CVSS:** 10.0 for CVE-2026-102255  
**CVE:** CVE-2026-102255, CVE-2026-102256, CVE-2026-102257, CVE-2026-102258  
**Affected:** SMA1000 12.4.3-03526 and older, 12.5.0-02952 and older

The notice covers SSRF, RCE, Zip Slip path traversal and stored XSS. The vendor explicitly separated these flaws from other SonicWall vulnerability reporting and said there was no evidence of exploitation.

Upgrade to 12.4.3-03670, 12.5.0-03082 or later. Internet-facing access appliances should remain segmented from internal administration services even when no active campaign is known.

#### Sources

- [SonicWall — SNWLID-2026-0017](https://www.sonicwall.com/support/notices/kA1VN000002QP3G0AW)

## Other notable items

### Hijacked ccTLD registries enabled unauthorized DNS and certificates

**Severity:** High  
**Status:** Confirmed infrastructure incident  
**Affected:** Domains under .gh, .sl and .as during the registry compromises

Google said attackers compromised third-party ccTLD registry infrastructure, changed authoritative DNS records and obtained unauthorized HTTPS certificates for several Google and non-Google domains. Google systems themselves were not compromised; Chrome blocked affected certificates with CRLSets.

Domain owners in the affected namespaces should review CT logs, authoritative DNS changes and restrictive CAA records. Certificate revocation alone does not address unauthorized registry-level DNS control.

#### Sources

- [Google Security Blog — Chrome's response to ccTLD registry hijacks](https://blog.google/security/chromes-response-to-recent-cctld-registry-hijacks/)

## Daily observations

- None of the three vulnerability events had confirmed active exploitation in the cited vendor material on October 6.
- The ccTLD incident sits below the application layer. Host patching cannot fix a compromised registry or unauthorized DNS delegation.
