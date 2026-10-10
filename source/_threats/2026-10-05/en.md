---
id: "2026-10-05"
title: "Threat Intelligence Daily · 2026-10-05"
date: "2026-10-05"
updated: "2026-10-10"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "October 5 retained three events: Atlassian disclosed CVE-2026-21589 across eight Data Center products with no exploitation found by the vendor at publication time; Denmark opened an investigation into large-scale automated CPR lookups; and Zammad clarified the practical scope of two CVEs already associated with active exploitation."
total: 3
critical: 1
high: 2
medium: 0
low: 0
exploited: 1
tags:
  - active-exploitation
  - cisa-kev
  - arbitrary-file-read
  - data-breach
  - session-hijack
  - Atlassian
  - Denmark-CPR
  - Zammad
  - CVE-2026-21589
  - CVE-2026-102489
  - CVE-2026-102490
cves:
  - CVE-2026-102489
  - CVE-2026-102490
  - CVE-2026-21589
iocs: []
---

## Changes since yesterday

- **NEW — Atlassian:** CVE-2026-21589 was disclosed across Bitbucket, Confluence, Jira, Bamboo, Crowd, Crucible and Fisheye Data Center products. Atlassian reported no evidence of exploitation in its investigation at publication time.
- **NEW — Denmark CPR:** the Danish Data Protection Agency opened a case after a very large number of automated queries were used to identify valid CPR numbers.
- **UPDATED — Zammad:** the vendor narrowed CVE-2026-102489 to older runtime environments in practice and described CVE-2026-102490 as a local privilege-escalation issue that requires prior server access.

## Priority actions

- **Immediate:** Patch affected Atlassian Data Center products and restrict access to self-hosted instances until upgrades are complete.
- **Today:** Organizations exposed to the Danish CPR incident should validate what personal data was accessible and prepare for targeted phishing or identity-abuse follow-up.
- **Today:** Zammad operators should prioritize unsupported 6.5-and-earlier systems and restrict shell/server access; do not treat all 7.x systems as equally exposed to CVE-2026-102489.

## Priority threats

### Atlassian CVE-2026-21589 permits unauthenticated arbitrary file access

**Severity:** Critical  
**Status:** Atlassian reported no exploitation found as of October 5  
**CVSS:** 9.3  
**CVE:** CVE-2026-21589  
**Affected:** Bitbucket DC, Confluence DC, Jira Service Management DC, Jira Software DC, Bamboo DC, Crowd DC, Crucible and Fisheye

An unauthenticated attacker who knows an exact file name and path can read files from affected self-hosted products. The flaw does not provide generic file enumeration, but configuration files, application secrets and locally stored credentials can still be high-value targets when paths are predictable or known.

Apply the fixed maintenance releases for each product. Cloud products were patched by Atlassian; the urgent work is on Data Center/self-hosted deployments.

#### Sources

- [Atlassian — CVE-2026-21589 advisory](https://confluence.atlassian.com/security/cve-2026-21589-arbitrary-file-access-vulnerability-impacts-multiple-products-1870495748.html)
- [Atlassian Trust Center — October 5 announcement](https://customertrust.atlassian.com/)

## Confirmed incidents

### Denmark investigates automated access to CPR records

**Severity:** High  
**Status:** Confirmed investigation; exact scope still under review  
**Affected:** Personal data reachable through Danish CPR-related systems

Datatilsynet said the CPR register reported a very large number of automated lookups intended to identify valid CPR numbers. Authorities were still investigating how the access was possible, which data was involved and who was responsible.

Organizations handling Danish citizen data should assume exposed identity attributes can make phishing and social-engineering attempts more convincing. Avoid repeating unverified victim-count estimates while the official investigation is still defining scope.

#### Sources

- [Datatilsynet — CPR investigation](https://www.datatilsynet.dk/presse-og-nyheder/nyhedsarkiv/2026/okt/datatilsynet-er-opmaerksom-paa-sag-om-opslag-i-cpr)

## Other notable items

### Zammad narrows the practical scope of CVE-2026-102489 and CVE-2026-102490

**Severity:** High  
**Status:** UPDATED scope clarification; CVE-2026-102489 remains associated with confirmed exploitation  
**CVE:** CVE-2026-102489, CVE-2026-102490  
**Affected:** CVE-2026-102489 is practically exploitable on Zammad 6.5 and earlier; CVE-2026-102490 requires local/server access

Zammad said the runtime used by 7.0 and later prevents practical exploitation of CVE-2026-102489, while 6.5 and earlier remain exposed. The vendor also described CVE-2026-102490 as local privilege escalation rather than a standalone remote exploit.

Upgrade unsupported versions and restrict access to the underlying server. This clarification reduces the affected population without changing the need to investigate old exposed systems.

#### Sources

- [Zammad — CVE-2026-102489 / CVE-2026-102490 advisory](https://zammad.com/en/advisories/cve-2026-102489-cve-2026-102490)

## Daily observations

- The Atlassian status on October 5 is disclosure without confirmed exploitation; later telemetry should not be backdated into this report.
- Scope clarification matters as much as severity. Zammad's update removes newer runtimes from the practical CVE-2026-102489 exposure set.
