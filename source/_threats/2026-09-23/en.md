---
id: "2026-09-23"
title: "Threat Intelligence Daily · 2026-09-23"
date: "2026-09-23"
updated: "2026-09-23 22:58:00"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "Four threat events require action: Check Point confirmed exploitation of two pre-authentication flaws, F5 disclosed an exploited BIG-IP APM zero-day, Arista reported active exploitation of a VeloCloud Orchestrator flaw, and compromised MemTensor npm/PyPI releases shipped the sckit credential-stealing worm."
total: 4
critical: 3
high: 1
medium: 0
low: 0
exploited: 4
tags:
  - active-exploitation
  - zero-day
  - Check-Point
  - F5
  - BIG-IP
  - Arista
  - VeloCloud
  - supply-chain
  - npm
  - PyPI
  - MemTensor
  - sckit
  - CVE-2026-85102
  - CVE-2026-93616
  - CVE-2026-93952
  - CVE-2026-94127
cves:
  - CVE-2026-85102
  - CVE-2026-93616
  - CVE-2026-93952
  - CVE-2026-94127
iocs:
  - skyleen.fr
  - 8a8acaf167b3.skyleen.fr
  - 0b48fafd6fbe.skyleen.fr
  - 266297c6df27.skyleen.fr
  - c747d139e7e9.skyleen.fr
  - 73376a079d87.skyleen.fr
  - d4f77a3a8cb0.skyleen.fr
  - 10729e014d0e.skyleen.fr
  - 39ee644406829a4b630b31759c20478bc22d576d6a59b253ed86f72c360aa5ef
  - 92b46d18fc553c494eda714f204459edb74c205bf53b18a9092bcf02c7a6c5be
---

## Changes since yesterday

- **NEW — Check Point:** Check Point confirmed exploitation of CVE-2026-85102 against Spark customers from September 12 and limited zero-day exploitation of CVE-2026-93616 on July 23. Both are now in CISA KEV.
- **NEW — F5 BIG-IP APM:** CVE-2026-94127 was disclosed after exploitation as a zero-day. Affected APM systems configured as OAuth Authorization Servers can be reached without authentication for remote code execution.
- **NEW — Arista VeloCloud:** Arista disclosed CVE-2026-93952, rated CVSS 10.0, and states that it is actively exploited. Hosted and Dedicated VCO instances have already been patched by Arista; on-prem deployments require administrator action.
- **NEW — MemTensor:** malicious npm and PyPI releases published September 23 contain the cross-platform `sckit` implant, which harvests developer and CI credentials and contains propagation logic.

## Priority actions

- **Immediate:** Patch affected Check Point Security Gateway/Spark and Security Management systems. Hunt for anomalous certificate-based Mobile Access logins and signs of script execution or Java class loading on management servers.
- **Immediate:** Patch or isolate affected F5 BIG-IP APM OAuth Authorization Server deployments and Arista VeloCloud Orchestrator on-prem systems; preserve logs and perform compromise triage because both CVEs are confirmed exploited.
- **Immediate:** Find `@memtensor/memos-cloud-openclaw-plugin` versions 0.1.21, 0.1.23 and 0.1.25 and `MemoryOS` 2.0.34 in hosts, lockfiles, CI runners and agent gateways. Treat systems that loaded them as compromised.
- **Today:** Rotate npm/PyPI publish tokens, GitHub/GitLab tokens, cloud credentials, SSH keys and other secrets accessible from affected MemTensor environments; block and hunt for `skyleen[.]fr` and its subdomains.

## Priority threats

### Check Point gateway and management flaws are under active exploitation

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 9.8 for CVE-2026-93616  
**CVE:** CVE-2026-85102, CVE-2026-93616  
**Affected:** Check Point Security Gateway/Spark; Security Management Server, Multi-Domain Security Management Server, Log Server, Multi-Domain Log Server and SmartEvent

CVE-2026-85102 is a pre-authentication RCE in VPN certificate handling. Check Point says exploitation attempts against Spark customers began September 12 and originated from anonymization infrastructure. CVE-2026-93616 is a separate pre-authentication path traversal in the Management web service that can execute an arbitrary script and load an arbitrary Java class; Check Point observed a handful of targeted attacks on July 23 before the September 22 disclosure and fix.

Install the applicable fixes rather than assuming an earlier management LivePatch covers the new management flaw. Review Mobile Access activity, management-server logs and follow-on internal scanning from suspicious authenticated sessions.

#### Sources

- [Check Point — Active exploitation advisory](https://blog.checkpoint.com/security/security-advisory-action-required-active-exploitation-of-cve-2026-85102-and-a-management-pre-authentication-vulnerability-cve-2026-93616/)
- [CISA — Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### F5 BIG-IP APM CVE-2026-94127 exploited as a zero-day

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVE:** CVE-2026-94127  
**Affected:** BIG-IP APM deployments configured as OAuth Authorization Servers

CVE-2026-94127 allows an unauthenticated attacker to send malicious network traffic to affected BIG-IP APM systems and obtain remote code execution when the OAuth Authorization Server configuration is present. F5 released fixes after observing zero-day exploitation; CISA added the flaw to KEV with a September 25 remediation deadline.

Patch affected BIG-IP systems, identify whether APM is acting as an OAuth Authorization Server, and perform compromise triage rather than treating the update as preventive-only work.

#### Sources

- [CISA — Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-94127)
- [BleepingComputer — F5 patches BIG-IP APM zero-day](https://www.bleepingcomputer.com/news/security/f5-warns-of-big-ip-apm-remote-code-execution-zero-day-exploited-in-attacks/)

### Arista VeloCloud Orchestrator CVE-2026-93952 is actively exploited

**Severity:** Critical  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 10.0 (v3.1), 9.5 (v4.0)  
**CVE:** CVE-2026-93952  
**Affected:** VeloCloud Orchestrator on-prem; hosted and Dedicated VCO were affected but Arista says they are already patched

Arista says improper input validation can let a remote attacker access privileged internal VCO functionality and affect the host, compromising the confidentiality, integrity and availability of the orchestrator and its managed data. Exploitation has been observed. Exposure depends on certificate-based Edge authentication and network access to the VCO web interface.

Apply the fixed build for the deployed VCO train as it becomes available. Review the vendor advisory's prerequisites before declaring a deployment exposed or unaffected, and preserve management-plane telemetry for investigation.

#### Sources

- [Arista — Security Advisory 0183](https://www.arista.com/en/support/advisories-notices/security-advisory/24765-security-advisory-0183)
- [Canadian Centre for Cyber Security — AV26-947 Update 1](https://www.cyber.gc.ca/en/alerts-advisories/arista-networks-security-advisory-av26-947)

### MemTensor npm and PyPI releases shipped the sckit credential stealer

**Severity:** High  
**Status:** Confirmed malicious supply-chain compromise  
**Affected:** `@memtensor/memos-cloud-openclaw-plugin` 0.1.21, 0.1.23, 0.1.25; `MemoryOS` 2.0.34  
**Malware:** `sckit` / `supplychain.local`

Researchers independently found malicious MemTensor releases on September 23. The bundled Go implant runs when the affected plugin or Python package is loaded, searches the user's home directory and environment for credentials, and communicates with infrastructure under `skyleen[.]fr`. Its code also contains mechanisms for propagating through package publishing and compromised GitHub Actions workflows. Blocking install scripts does not stop this execution path.

Any system that loaded an affected release should be treated as compromised. Remove the affected versions, stop `sckit`, inspect `$HOME/.openclaw/.cache/runtime`, `$HOME/.memos/.cache/runtime` and unexpected `runtime-update.yml` workflows, then rotate all reachable credentials. Review package publication history if registry tokens were present.

#### Sources

- [SafeDep — MemTensor npm and PyPI packages hit by a Go worm](https://safedep.io/memtensor-sckit-worm-npm-pypi/)
- [Socket — MemTensor packages compromised](https://socket.dev/blog/memtensor-compromise)
- [StepSecurity — sckit supply-chain worm](https://www.stepsecurity.io/blog/sckit-supply-chain-worm-hits-memtensor-npm-pypi-scopes)

## IOC summary

| Type | Indicator | Context |
| --- | --- | --- |
| Domain | `skyleen[.]fr` and observed subdomains | sckit campaign infrastructure |
| SHA256 | `39ee644406829a4b630b31759c20478bc22d576d6a59b253ed86f72c360aa5ef` | MemoryOS 2.0.34 wheel |
| SHA256 | `92b46d18fc553c494eda714f204459edb74c205bf53b18a9092bcf02c7a6c5be` | MemoryOS 2.0.34 source distribution |

## Daily observations

- The three infrastructure vulnerabilities are confirmed exploited and affect management or authentication planes. Patch status alone does not establish that previously exposed systems were not compromised.
- The MemTensor payload executes during normal package load/import paths, so `--ignore-scripts` does not prevent execution. Exposure review must include developer workstations, CI runners and agent gateways that loaded the affected versions.
