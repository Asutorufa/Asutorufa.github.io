---
id: "2026-10-03"
title: "Threat Intelligence Daily · 2026-10-03"
date: "2026-10-03"
updated: "2026-10-10"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "October 3 retained four events: CISA had moved the exploited Zammad session-hijack flaw into KEV, Citrix disclosed a high-severity NetScaler SAML denial-of-service issue, Bouncy Castle published a critical MLS identity-binding CVE, and Fortra disclosed a root-level BoKS command-injection path."
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 1
tags:
  - active-exploitation
  - cisa-kev
  - session-hijack
  - cryptography
  - privileged-access
  - edge-device
  - Zammad
  - Bouncy-Castle
  - Fortra
  - Citrix
  - CVE-2026-102489
  - CVE-2026-102490
  - CVE-2026-71885
  - CVE-2026-79898
  - CVE-2026-88779
cves:
  - CVE-2026-102489
  - CVE-2026-102490
  - CVE-2026-71885
  - CVE-2026-79898
  - CVE-2026-88779
iocs: []
---

## Changes since yesterday

- **NEW — Zammad:** CISA added CVE-2026-102489 to KEV on October 2. Public reporting tied the session-hijack issue to a chain that can end in code execution on older Zammad deployments.
- **NEW — Citrix NetScaler:** Citrix published CVE-2026-88779 for customer-managed ADC/Gateway appliances using SAML SP or IdP configurations.
- **NEW — Bouncy Castle:** the CVE record for CVE-2026-71885 was published for an MLS credential-validation defect fixed in Bouncy Castle Java 1.86.
- **NEW — Fortra BoKS:** CVE-2026-79898 can let an authenticated administrator inject shell commands that are processed as root on the BoKS Master.

## Priority actions

- **Immediate:** Move unsupported Zammad 6.x installations to a supported release and review exposed systems for session abuse or unexpected server-side execution.
- **Today:** Identify NetScaler appliances configured as SAML SP/IdP and stage the fixed Citrix builds.
- **Today:** Upgrade Bouncy Castle Java to 1.86 or later where MLS is used.
- **Today:** Patch Fortra BoKS Manager and limit access to BCC/WSI administrative paths.

## Priority threats

### Zammad CVE-2026-102489 entered CISA KEV

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVE:** CVE-2026-102489, CVE-2026-102490  
**Affected:** Older self-hosted Zammad releases, especially 6.5 and earlier

CVE-2026-102489 is a session-hijack flaw that can be used against affected Zammad deployments and was added to CISA KEV on October 2. The public case also described CVE-2026-102490 as a local privilege-escalation component that can extend an existing compromise.

Prioritize unsupported Zammad releases. Restrict host access, review sessions and administrator activity, and investigate unexpected processes or changes on exposed instances.

#### Sources

- [CISA — KEV entry for CVE-2026-102489](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-102489)
- [DIVD — DIVD-2026-00015](https://csirt.divd.nl/DIVD-2026-00015)

### Bouncy Castle Java CVE-2026-71885 breaks MLS identity/key binding

**Severity:** Critical  
**Status:** No confirmed exploitation  
**CVE:** CVE-2026-71885  
**Affected:** Bouncy Castle Java before 1.86 when using MLS X.509 credentials

The MLS implementation could accept an X.509 credential without correctly binding that identity to the LeafNode signature key. In deployments that accept external commits without a separate admission check, the mismatch can undermine peer identity guarantees.

Upgrade to 1.86 or later. Applications using MLS should verify that membership admission does not depend solely on the affected credential path.

#### Sources

- [CVE.org — CVE-2026-71885](https://www.cve.org/CVERecord?id=CVE-2026-71885)
- [Bouncy Castle — Java 1.86 release](https://github.com/bcgit/bc-java/discussions/2449)

### Fortra BoKS Manager CVE-2026-79898 executes injected commands as root

**Severity:** Critical  
**Status:** No confirmed exploitation  
**CVSS:** 9.1  
**CVE:** CVE-2026-79898  
**Affected:** Fortra BoKS Manager releases covered by FI-2026-015

An authenticated user allowed to add CRL URLs through BCC, WSI APIs or the command-line path can trigger shell command substitution in `crlserver`. Processing occurs as root on the BoKS Master.

Apply Fortra's fixed builds and narrow access to administrative interfaces until upgrades are complete.

#### Sources

- [Fortra — FI-2026-015](https://www.fortra.com/security/advisories/product-security/fi-2026-015)

## Other notable items

### Citrix NetScaler CVE-2026-88779 affects SAML deployments

**Severity:** High  
**Status:** No exploitation confirmation in the initial Citrix bulletin  
**CVSS:** 8.7 (CVSS v4)  
**CVE:** CVE-2026-88779  
**Affected:** Customer-managed NetScaler ADC/Gateway using SAML SP or SAML IdP configurations

The memory-overflow issue can cause denial of service. Citrix's initial bulletin scoped exposure to SAML deployments and provided fixed builds including 14.1-73.41 and 13.1-64.28.

Inventory SAML-configured appliances first and move them to a fixed release.

#### Sources

- [Citrix — CTX697174](https://support.citrix.com/external/article/CTX697174/citrix-netscaler-adc-and-citrix-netscale.html)

## Daily observations

- The Zammad item is the only event in this report with confirmed exploitation. The other three require patching based on exposure and impact, not an assumed active campaign.
- Two events sit on authentication or identity boundaries. Review of sessions and administrative access is useful alongside version upgrades.
