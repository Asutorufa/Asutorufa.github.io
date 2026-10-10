---
id: "2026-10-04"
title: "Threat Intelligence Daily · 2026-10-04"
date: "2026-10-04"
updated: "2026-10-10"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "October 4 retained two events. Citrix NetScaler CVE-2026-88779 moved from a high-severity SAML denial-of-service issue to an actively exploited/KEV priority. AhsayCBS also received two newly disclosed flaws, including an unauthenticated RCE path in its Replication Receiver."
total: 2
critical: 1
high: 1
medium: 0
low: 0
exploited: 1
tags:
  - active-exploitation
  - cisa-kev
  - edge-device
  - backup
  - auth-bypass
  - rce
  - Citrix
  - Ahsay
  - CVE-2026-88779
  - CVE-2026-105133
  - CVE-2026-105134
cves:
  - CVE-2026-105133
  - CVE-2026-105134
  - CVE-2026-88779
iocs: []
---

## Changes since yesterday

- **UPDATED — Citrix NetScaler:** CVE-2026-88779 moved into the known-exploited category. The impact remains denial of service, but active exploitation changes patch priority for exposed SAML appliances.
- **NEW — AhsayCBS:** CVE-2026-105133 and CVE-2026-105134 were disclosed for the backup-management server. The pair covers an authentication weakness and a critical unauthenticated RCE path.

## Priority actions

- **Immediate:** Patch NetScaler appliances that meet the SAML preconditions and review service interruptions or anomalous requests around the vulnerable path.
- **Today:** Identify internet-accessible AhsayCBS management servers and restrict access while moving to a fixed release.
- **Monitor:** Preserve AhsayCBS application and process-creation logs so later exploitation evidence can be investigated without relying on memory or incomplete telemetry.

## Priority threats

### Citrix NetScaler CVE-2026-88779 is now a known-exploited issue

**Severity:** High  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 8.7 (CVSS v4)  
**CVE:** CVE-2026-88779  
**Affected:** Customer-managed NetScaler ADC/Gateway configured as SAML SP or SAML IdP

Citrix's bulletin describes a memory overflow that can cause denial of service. By October 4, exploitation reporting and KEV treatment made the issue an operational priority for SAML-facing appliances even though the documented impact is availability rather than code execution.

Upgrade to the Citrix fixed builds and verify which appliances actually meet the SAML preconditions before broadening incident-response scope.

#### Sources

- [Citrix — CTX697174](https://support.citrix.com/external/article/CTX697174/citrix-netscaler-adc-and-citrix-netscale.html)
- [CISA — KEV catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### AhsayCBS CVE-2026-105133 and CVE-2026-105134 expose the backup-management plane

**Severity:** Critical  
**Status:** No confirmed in-the-wild exploitation as of this report date  
**CVE:** CVE-2026-105133, CVE-2026-105134  
**Affected:** AhsayCBS versions covered by the October 4 disclosures

CVE-2026-105133 affects authentication handling. CVE-2026-105134 reaches unauthenticated remote code execution through the Replication Receiver API. A backup-management server commonly holds broad access to protected systems, so compromise can cross the boundary between backup infrastructure and production endpoints.

Move affected systems to the vendor-remediated version and prevent public access to the management interface where possible.

#### Sources

- [NVD — CVE-2026-105133](https://nvd.nist.gov/vuln/detail/CVE-2026-105133)
- [NVD — CVE-2026-105134](https://nvd.nist.gov/vuln/detail/CVE-2026-105134)

## Daily observations

- Active exploitation raised the NetScaler issue above its availability-only technical impact.
- The AhsayCBS disclosure was not yet treated as an active campaign here; that status changes later when telemetry confirms attacks.
