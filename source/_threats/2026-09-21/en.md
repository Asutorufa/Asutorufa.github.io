---
id: "2026-09-21"
title: "Threat Intelligence Daily · 2026-09-21"
date: "2026-09-21"
updated: "2026-09-21 23:00:00"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "Fortinet telemetry confirms active exploitation of an unauthenticated Orkes Conductor RCE. Kaspersky documented a manufacturing intrusion where attackers used Group Policy for encryptionless extortion, while Securonix decoded TASK#STOMP as a persistent PowerShell backdoor for document theft and remote command execution."
total: 3
critical: 1
high: 2
medium: 0
low: 0
exploited: 3
tags:
  - active-exploitation
  - remote-code-execution
  - Orkes-Conductor
  - ransomware
  - encryptionless-extortion
  - Group-Policy
  - TASK-STOMP
  - PowerShell
  - espionage
  - malware
  - CVE-2026-58138
cves:
  - CVE-2026-58138
iocs:
  - corecloudfileshare.xyz
  - attachmentsharingdrive.xyz
  - 5251098838fab2f3192307cac99ad2d3a71b55ba1f256412d43a9dfb3b93ac58
  - 103b4d4a666bc0a89c10c9df55f54f4be5fa111e8429c37ae14fa8f16cb50fe8
  - 02ba7c982b68ec8f5a1cb47c6f3969f3f2f38ea9b4ebb8833d1b8b0ba2ab1407
---

## Changes since yesterday

- **NEW — Orkes Conductor:** Fortinet telemetry confirms active exploitation of CVE-2026-58138. The pre-authentication workflow API flaw permits operating-system command execution on vulnerable Conductor servers.
- **NEW — Payload:** Kaspersky documented an incident at a Middle Eastern manufacturer where the attackers used a malicious Group Policy Object to lock administrators out and display ransom material after stealing data, without deploying a file encryptor.
- **NEW — TASK#STOMP:** Securonix decoded the final PowerShell payloads and confirmed automated business-document theft, continuous file monitoring, Wi-Fi password and clipboard collection, screenshots, and arbitrary remote commands through two C2 domains.
- **ONGOING — Linux KEV:** September 21 is CISA's remediation date for CVE-2025-39682, CVE-2026-53266 and CVE-2025-39964, reported on September 19. No reviewed source identifies the actor or a shared exploit chain.

## Priority actions

- **Immediate:** Upgrade exposed Orkes Conductor deployments to 3.30.2 or later. Until patched, remove external access to workflow API endpoints and review historical workflow submissions and child-process execution.
- **Immediate:** Hunt Windows endpoints for TASK#STOMP's `%LOCALAPPDATA%\WinDefendSvc` staging path, hidden PowerShell followed by `csc.exe`, the two confirmed C2 domains, and repeated XML-defined scheduled-task creation from `wscript.exe`.
- **Today:** Review Group Policy creation and modification on Active Directory, especially policies that disable local administrator accounts, change desktop or lock-screen settings, or distribute ransom material. Protect GPO administration with separate privileged accounts and change auditing.
- **Today:** Complete remediation and pre-patch telemetry review for the three Linux kernel KEV entries whose CISA target date is September 21.

## Priority threats

### Orkes Conductor pre-authentication RCE is being exploited

**Severity:** Critical  
**Status:** Confirmed active exploitation  
**CVSS:** 9.8 (v3.1) / 9.3 (v4)  
**CVE:** CVE-2026-58138  
**Affected:** Orkes Conductor 3.21.21 before 3.30.2

CVE-2026-58138 allows an unauthenticated remote client to submit workflow definitions containing malicious JavaScript or Python expressions. Vulnerable GraalVM evaluators expose unrestricted host access, allowing those expressions to invoke operating-system commands with the Conductor process privileges.

Fortinet reported 1,290 blocked attempts in one 24-hour period ending September 9 and nearly 7,000 attempts from September 2 through 9. Independent honeypot telemetry cited in the same reporting observed exploitation attempts as early as July 24. Conductor 3.30.2 contains the fix.

#### Recommendations

- Upgrade to Conductor 3.30.2 or later and verify the running deployment, including containers and stale replicas.
- If patching is delayed, restrict workflow API endpoints to trusted networks and authenticated gateways.
- Review workflow definitions for unexpected INLINE, LAMBDA, DO_WHILE or SWITCH tasks containing JavaScript/Python expressions, and correlate them with unusual child processes or outbound connections from Conductor.

#### Sources

- [The Hacker News — Critical Pre-Auth RCE in Orkes Conductor Exploited in the Wild](https://thehackernews.com/2026/09/critical-pre-auth-rce-in-orkes.html)

### Payload uses Group Policy for encryptionless extortion

**Severity:** High  
**Status:** Confirmed intrusion and extortion incident  
**Affected:** Windows/Active Directory environments where attackers obtain privileges to modify Group Policy

Kaspersky's Global Emergency Response Team described an incident at a manufacturing company in the Middle East in which the attackers stole corporate data and then used a malicious Group Policy Object named `PAYLOAD` for disruption. The policy disabled local administrator accounts and changed desktops and lock screens to ransom material. Kaspersky did not observe a conventional file-encryption payload in this incident.

The stolen data was later published on the dark web. The operational dependency is Active Directory control: once the attacker can modify Group Policy, endpoint malware scanning alone does not remove the policy that distributes the disruptive configuration.

#### Recommendations

- Audit privileged Group Policy changes and alert on policies that alter local administrator access, desktop/lock-screen configuration, startup scripts, scheduled tasks or security controls across many hosts.
- Restrict GPO modification to dedicated administrative identities and require strong authentication for those accounts.
- During response, remove or neutralize malicious policy at its source before restoring endpoint configuration; preserve domain-controller and Group Policy audit logs first.

#### Sources

- [Kaspersky — Payload ransomware uses encryptionless extortion](https://www.kaspersky.com/about/press-releases/kaspersky-uncovers-new-payload-the-stealth-ransomware-that-hijacks-corporate-devices-without-encrypting-files)

### TASK#STOMP steals documents and maintains redundant PowerShell C2

**Severity:** High  
**Status:** Confirmed malware on an observed Windows endpoint; campaign scale unknown  
**Affected:** Windows endpoints executing the recovered VBS/PowerShell chain  
**Malware:** TASK#STOMP

Securonix analyzed one infected endpoint and decoded two Base64-encoded payload files. The chain creates four XML-defined scheduled tasks, places `msdiag.vbs` in the user's Startup folder, backdates staged files, launches two hidden PowerShell modules and compiles small C# helpers at runtime. The decoded payloads scan fixed drives for business documents, monitor new and modified files, steal saved Wi-Fi passwords and clipboard data, capture screenshots and execute arbitrary PowerShell commands.

Both modules use `corecloudfileshare[.]xyz` and `attachmentsharingdrive[.]xyz` with automatic failover and a static authentication token. Securonix does not attribute the activity to a known actor and does not claim a confirmed delivery vector. The observed IranTenders URL is therefore not treated here as a malicious domain.

#### Indicators

- `corecloudfileshare[.]xyz`
- `attachmentsharingdrive[.]xyz`
- `5251098838fab2f3192307cac99ad2d3a71b55ba1f256412d43a9dfb3b93ac58` — VBS launcher
- `103b4d4a666bc0a89c10c9df55f54f4be5fa111e8429c37ae14fa8f16cb50fe8` — `sys_loader.ps1`
- `02ba7c982b68ec8f5a1cb47c6f3969f3f2f38ea9b4ebb8833d1b8b0ba2ab1407` — `diag_pack.dat`

#### Recommendations

- Correlate `wscript.exe` creating several XML-defined scheduled tasks with hidden PowerShell execution from AppData and subsequent `csc.exe`/`cvtres.exe` activity.
- Block the two confirmed C2 domains and search proxy/DNS telemetry retrospectively.
- During containment, remove all scheduled tasks, the Startup copy and staged files together. Reboot and verify that `msdiag.vbs`, `sys_loader.ps1` and `win_conn.ps1` do not return.

#### Sources

- [Securonix — TASK#STOMP: PowerShell Backdoor for Document Theft and Remote Access](https://www.securonix.com/blog/task-stomp-powershell-backdoor-document-theft-remote-access/)

## IOC summary

| Type | Indicator | Context |
| --- | --- | --- |
| Domain | `corecloudfileshare[.]xyz` | TASK#STOMP primary C2 |
| Domain | `attachmentsharingdrive[.]xyz` | TASK#STOMP backup C2 |
| SHA256 | `5251098838fab2f3192307cac99ad2d3a71b55ba1f256412d43a9dfb3b93ac58` | VBS launcher / `msdiag.vbs` |
| SHA256 | `103b4d4a666bc0a89c10c9df55f54f4be5fa111e8429c37ae14fa8f16cb50fe8` | `sys_loader.ps1` |
| SHA256 | `02ba7c982b68ec8f5a1cb47c6f3969f3f2f38ea9b4ebb8833d1b8b0ba2ab1407` | `diag_pack.dat` |

## Daily observations

- All three retained events contain observed malicious activity, but only the Orkes item is a vulnerability with confirmed exploitation. Payload and TASK#STOMP are incident/campaign observations rather than vulnerability-exploitation claims.
- Two events depend heavily on administrative control planes: Conductor workflow definitions and Active Directory Group Policy. Response must remove the malicious server-side configuration as well as endpoint artifacts.
- TASK#STOMP's initial-access path and campaign size remain unconfirmed; the report therefore uses its published infrastructure and behaviors for hunting without assigning an actor or victim sector.
