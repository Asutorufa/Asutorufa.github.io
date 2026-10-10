---
id: "2026-10-09"
title: "Threat Intelligence Daily · 2026-10-09"
date: "2026-10-09"
updated: "2026-10-10"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "October 9 retained four events: Citrix disclosed CVE-2026-107406, a Critical NetScaler SAML memory-overflow issue that can lead to RCE or DoS; BeyondTrust announced a Critical Remote Support vulnerability with SaaS patching and self-hosted action required; Tenable disclosed a Hermes Agent PKCE redirect-parser flaw enabling session takeover; and JPCERT/CC updated its alert on recurring unauthorized access and large-scale personal-data leaks in Japan."
total: 4
critical: 2
high: 2
medium: 0
low: 0
exploited: 0
tags:
  - edge-device
  - remote-support
  - session-takeover
  - identity
  - data-breach
  - japan
  - Citrix
  - BeyondTrust
  - Hermes-Agent
  - JPCERT
  - CVE-2026-107406
cves:
  - CVE-2026-107406
iocs: []
---

## Changes since yesterday

- **NEW — Citrix NetScaler:** CVE-2026-107406 introduced a new Critical SAML-related memory-overflow issue after the previous NetScaler patch cycle, with RCE or DoS depending on conditions.
- **NEW — BeyondTrust Remote Support:** BeyondTrust announced BT26-05-RS as a Critical Remote Support vulnerability; SaaS instances were scheduled for automatic patching on October 9, while some self-hosted installations require manual action.
- **NEW — Hermes Agent:** Tenable disclosed a PKCE session-takeover path caused by redirect-URI parser disagreement between Python and browser URL handling.
- **UPDATED — Japan unauthorized-access alert:** JPCERT/CC updated its warning about repeated domestic incidents involving systems that were not intended for broad public access, including BI and employee-management systems.

## Priority actions

- **Immediate:** Upgrade affected NetScaler ADC/Gateway appliances to 14.1-73.46, 13.1-64.29 or the corresponding fixed FIPS/NDcPP build after checking SAML prerequisites.
- **Immediate:** Confirm BeyondTrust Remote Support SaaS patch status; self-hosted customers outside automatic critical updates should install BT26-05-RS remediation manually.
- **Today:** Upgrade Hermes Agent to 0.21.6 or later and review OAuth/native-login endpoints exposed to untrusted users.
- **Today:** For Japanese organizations, inventory management/BI/employee systems reachable from the internet even if they were originally designed for internal or limited-user access.

## Priority threats

### Citrix NetScaler CVE-2026-107406 can reach RCE or denial of service

**Severity:** Critical  
**Status:** No confirmed exploitation in the cited Citrix bulletin  
**CVSS:** 9.5 (CVSS v4)  
**CVE:** CVE-2026-107406  
**Affected:** Customer-managed NetScaler ADC/Gateway with version-specific SAML SP/IdP prerequisites

CVE-2026-107406 is a memory-overflow vulnerability with a more severe outcome than the earlier CVE-2026-88779. Exposure depends on NetScaler version and whether the appliance is configured as a SAML SP, IdP, or in some fixed-transition versions specifically as an IdP.

Upgrade to 14.1-73.46, 13.1-64.29 or the corresponding fixed FIPS/NDcPP release. Re-check appliances patched for the previous NetScaler issue because the newer advisory changes the required fixed build.

#### Sources

- [Citrix — CTX697191](https://support.citrix.com/external/article/CTX697191/citrix-netscaler-adc-and-citrix-netscale.html)

### BeyondTrust Remote Support BT26-05-RS requires action on self-hosted deployments

**Severity:** Critical  
**Status:** Vendor advisory; no exploitation claim used in this report  
**Affected:** BeyondTrust Remote Support deployments covered by BT26-05-RS

BeyondTrust announced a Critical Remote Support vulnerability on October 9. SaaS instances were scheduled for automatic patching, while self-hosted customers that did not opt into automatic critical updates need to install the fix themselves.

Verify patch state rather than assuming the deployment model handled it. Remote-support infrastructure should also have tightly scoped administrator access and logs preserved for investigation.

#### Sources

- [BeyondTrust — BT26-05-RS announcement](https://beekeepers.beyondtrust.com/general-45/beyondtrust-security-advisory-bt26-05-rs-remote-support-8587)

## Important vulnerabilities

### Hermes Agent PKCE redirect parsing can expose an authorization code

**Severity:** High  
**Status:** No confirmed exploitation reported by Tenable  
**CVSS:** 8.8 (CVSS v3) / 8.6 (CVSS v4)  
**Affected:** Hermes Agent before 0.21.6

The native authorization flow validates a redirect URI with Python's URL parser but later sends the raw value to a browser, whose WHATWG parsing rules treat backslashes differently. Combined with an attacker-selected PKCE challenge, the authorization code can be redirected to an attacker-controlled origin and exchanged for the victim's tokens.

Upgrade to 0.21.6 or later. Review authentication logs for unusual native authorization requests and redirect URIs containing parser-confusing separators.

#### Sources

- [Tenable — TRA-2026-65](https://www.tenable.com/security/research/tra-2026-65)

## Other notable items

### JPCERT/CC updates warning on repeated unauthorized access in Japan

**Severity:** High  
**Status:** Operational alert based on multiple confirmed incidents; techniques vary by case  
**Affected:** Japanese organizations operating internet-reachable applications, BI tools and employee-management systems

JPCERT/CC said personal-data leaks caused by unauthorized access had been recurring around September and October. The agency specifically called out systems that operators may not think of as general public services but that can still be reached externally.

Inventory externally reachable management and business systems, confirm authentication and access controls, and review logs for unauthorized queries or data export. The alert says technical information remains limited, so it does not support attributing all incidents to one exploit chain.

#### Sources

- [JPCERT/CC — JPCERT-AT-2026-0030](https://www.jpcert.or.jp/at/2026/at260030.html)

## Daily observations

- Citrix's October 9 priority is not a repeat of CVE-2026-88779: the newer advisory changes both technical impact and the fixed-build target.
- JPCERT/CC's alert is useful for exposure review, but the agency explicitly describes the available technical detail as limited and fragmented; a single root cause should not be inferred.
