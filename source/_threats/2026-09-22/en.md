---
id: "2026-09-22"
title: "Threat Intelligence Daily · 2026-09-22"
date: "2026-09-22"
updated: "2026-09-22 23:02:00"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "CISA added an actively exploited Zyxel GS1900 command-execution flaw to KEV after a campaign compromised 996 switches. Microsoft disrupted EvilTokens after more than 12,000 inbox compromises. Volexity linked a third China-aligned actor to a shared Chrome/Windows zero-day chain, while Arctic Wolf reports active exploitation of a Veeam Agent local privilege-escalation flaw."
total: 4
critical: 0
high: 4
medium: 0
low: 0
exploited: 4
tags:
  - active-exploitation
  - Zyxel
  - network-infrastructure
  - EvilTokens
  - phishing
  - device-code-phishing
  - business-email-compromise
  - UTA0565
  - CLEANGULP
  - zero-day
  - Google-Chrome
  - Microsoft-Windows
  - Veeam
  - privilege-escalation
  - CVE-2026-7273
  - CVE-2026-85046
  - CVE-2026-87491
  - CVE-2026-85880
  - CVE-2026-32996
cves:
  - CVE-2026-32996
  - CVE-2026-7273
  - CVE-2026-85046
  - CVE-2026-85880
  - CVE-2026-87491
iocs:
  - thecovnresation.com
  - personclouds.com
  - outsourcingwise.net
  - halal-navi.net
  - halaltak.net
  - thecovnresation.net
  - borneobulletins.top
---

## Changes since yesterday

- **NEW — Zyxel GS1900:** CISA added CVE-2026-7273 to KEV after confirmed exploitation. GreyNoise-linked reporting says a Chinese-speaking actor extracted configuration, network information and hashed root credentials from 996 switches in 48 countries.
- **NEW — EvilTokens:** Microsoft and partners disrupted the phishing service after linking it to more than 12,000 compromised inboxes across over 10,000 organizations. The operation seized 50 websites and disabled more than 150 additional domains.
- **NEW — UTA0565:** Volexity identified a third China-aligned actor using the previously documented Chrome/Windows zero-day chain. Its September 3–4 campaigns targeted Asian government entities with spoofed websites and delivered a newly documented backdoor, CLEANGULP.
- **NEW — Veeam Agent:** Arctic Wolf reports active exploitation of CVE-2026-32996, which lets a local low-privileged user reuse an elevated session identifier and execute commands as SYSTEM.

## Priority actions

- **Immediate:** Update Zyxel GS1900 switches with the vendor firmware for CVE-2026-7273, restrict management interfaces to administrative networks, rotate management credentials and review affected switches for configuration or credential theft.
- **Immediate:** Upgrade Veeam Agent for Microsoft Windows 13 deployments affected by CVE-2026-32996; prioritize shared systems, servers and administrator workstations where a low-privileged foothold can become SYSTEM.
- **Today:** Block device-code authentication where it is not required. For suspected EvilTokens victims, revoke sign-in sessions, temporarily disable compromised accounts when immediate containment is required, and review malicious inbox rules and Microsoft Graph activity.
- **Today:** Confirm Chrome/Chromium and Windows endpoints include fixes for CVE-2026-85046, CVE-2026-87491 and CVE-2026-85880; hunt for UTA0565 spoofed domains and CLEANGULP persistence.

## Priority threats

### Zyxel GS1900 CVE-2026-7273 enters KEV after data-theft campaign

**Severity:** High  
**Status:** Confirmed active exploitation / CISA KEV  
**CVSS:** 8.8  
**CVE:** CVE-2026-7273  
**Affected:** Zyxel GS1900 series switches with affected 2.90 firmware

CVE-2026-7273 is a stack-based buffer overflow in the GS1900 management CGI. An unauthenticated attacker with LAN access can send a crafted HTTP request and execute operating-system commands. Zyxel released corrected firmware in June; CISA added the flaw to KEV on September 21 with a September 24 federal remediation date.

Reporting based on GreyNoise telemetry says exploitation began around August 17 and reached 996 switches in 48 countries. The actor extracted configurations, network information and hashed root-level credentials; 564 compromised devices also retained factory-default credentials.

#### Recommendations

- Apply the Zyxel firmware update for the exact GS1900 model and verify the running version after reboot.
- Restrict HTTP/HTTPS management to a dedicated administration network or VLAN.
- Rotate management credentials and review switch configuration, management logs and outbound activity for evidence of prior compromise.

#### Sources

- [Zyxel — Security advisory for CVE-2026-7273](https://www.zyxel.com/global/en/support/security-advisories/zyxel-security-advisory-for-stack-based-buffer-overflow-vulnerability-in-gs1900-series-switches-06-16-2026)
- [CISA — Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog?field_cve=CVE-2026-7273)
- [Help Net Security — 996 Zyxel switches compromised](https://www.helpnetsecurity.com/2026/09/22/zyxel-switches-cve-2026-7273-vulnerability-exploited/)

### EvilTokens disrupted after more than 12,000 inbox compromises

**Severity:** High  
**Status:** Confirmed campaign; infrastructure disrupted  
**Affected:** Microsoft 365 identities and mailboxes  
**Threat actor:** Storm-2992 / EvilTokens operators

Microsoft says EvilTokens used device-code phishing to obtain authentication tokens and was linked to more than 12,000 compromised inboxes at over 10,000 organizations since February. Post-compromise tooling could scan mailboxes, identify financial and executive targets, create persistence through inbox rules and prepare business-email-compromise fraud.

Microsoft and partners seized 50 websites and disabled more than 150 additional domains. UK police arrested two men on September 11 in connection with the alleged operation. Disruption does not invalidate tokens already stolen from victim accounts.

#### Recommendations

- Block device-code flow with Conditional Access where it is not operationally required; scope necessary exceptions to dedicated device accounts.
- For suspected compromise, revoke sign-in sessions, inspect inbox rules and Microsoft Graph activity, and temporarily disable the account when immediate token containment is required.
- Verify payment-detail changes and unusual transfer requests through a second trusted channel.

#### Sources

- [Microsoft Threat Intelligence — Unmasking EvilTokens](https://www.microsoft.com/en-us/security/blog/2026/09/22/unmasking-eviltokens-getting-to-the-root-of-device-code-phishing/)
- [Microsoft Digital Crimes Unit — Disrupting EvilTokens](https://blogs.microsoft.com/on-the-issues/2026/09/22/disrupting-eviltokens-the-ai-chatbot-built-for-cybercrime/)

### UTA0565 used the shared Chrome/Windows zero-day chain to deploy CLEANGULP

**Severity:** High  
**Status:** Confirmed zero-day exploitation observed September 3–4; fixes now available  
**CVE:** CVE-2026-85046, CVE-2026-87491, CVE-2026-85880  
**Affected:** Google Chrome/Chromium and Microsoft Windows  
**Threat actor:** UTA0565  
**Malware:** CLEANGULP

Volexity identified UTA0565 as a third China-aligned actor using the same exploit chain previously seen with other Chinese threat groups. The campaigns ran on September 3–4 while the vulnerabilities were still unpatched and used spoofed media, NGO and other websites to deliver the exploit chain to targets including Asian government entities.

The chain delivered CLEANGULP, a newly documented backdoor with command execution, process listing, file transfer and additional payload execution. Volexity assesses that the common exploit kit has been shared, customized and weaponized across multiple Chinese operators; that assessment is based on overlapping exploit components, not on a claim that the groups are the same actor.

#### Indicators

- `thecovnresation[.]com` — CLEANGULP C2 / The Conversation typosquat
- `personclouds[.]com`
- `outsourcingwise[.]net`
- `halal-navi[.]net`
- `halaltak[.]net`
- `thecovnresation[.]net`
- `borneobulletins[.]top`

#### Recommendations

- Verify Chrome/Chromium and Windows patch levels cover all three CVEs.
- Search DNS, proxy and endpoint telemetry for the published spoofed domains and CLEANGULP artifacts.
- Treat hits on the spoofed sites as potential exploitation exposure and perform endpoint triage rather than only blocking the domain.

#### Sources

- [Volexity — Mind the (Patch) Gap, Part 2](https://www.volexity.com/blog/2026/09/21/mind-the-patch-gap-part-2-fake-websites-used-to-deploy-chrome-windows-0-day-exploits/)

### Veeam Agent CVE-2026-32996 is being used for local privilege escalation

**Severity:** High  
**Status:** Active exploitation reported by Arctic Wolf  
**CVSS:** 7.3  
**CVE:** CVE-2026-32996  
**Affected:** Veeam Agent for Microsoft Windows 13.0.1.2067 and earlier version 13 builds

The Veeam Endpoint Backup service caches an elevated administrator principal against a client-controlled session UID that is not bound to the requesting user or connection. Standard users can read elevated UIDs from the Veeam log and reuse them to execute commands as `NT AUTHORITY\\SYSTEM`.

Exploitation requires an existing local foothold; this is not a remote initial-access vulnerability. Arctic Wolf reports active exploitation and recommends upgrading. Veeam Backup & Replication 13.0.2.29 updates the Windows agent to fixed build 13.0.3.1220.

#### Recommendations

- Upgrade affected Veeam Agent deployments and confirm the installed agent build after remediation.
- Prioritize systems with shared local access, privileged workflows, backup administration or sensitive data.
- Until updated, reduce interactive/local access and monitor unusual child processes from Veeam services.

#### Sources

- [Arctic Wolf — Active exploitation of CVE-2026-32996](https://arcticwolf.com/resources/blog/update-active-exploitation-cve-2026-32996-of-veeam-agent/)
- [Veeam — KB4852](https://www.veeam.com/kb4852)

## IOC summary

| Type | Indicator | Context |
| --- | --- | --- |
| Domain | `thecovnresation[.]com` | CLEANGULP C2 / typosquat |
| Domain | `personclouds[.]com` | UTA0565 infrastructure |
| Domain | `outsourcingwise[.]net` | UTA0565 assessed infrastructure |
| Domain | `halal-navi[.]net` | UTA0565 assessed infrastructure |
| Domain | `halaltak[.]net` | UTA0565 assessed infrastructure |
| Domain | `thecovnresation[.]net` | UTA0565 assessed infrastructure |
| Domain | `borneobulletins[.]top` | UTA0565 assessed infrastructure |

## Daily observations

- Zyxel and Veeam require different triage assumptions: CVE-2026-7273 can be triggered without authentication from the management LAN, while CVE-2026-32996 requires an existing local foothold.
- EvilTokens shows why a password reset alone is insufficient after token theft. Session revocation, inbox-rule review and post-compromise investigation remain necessary.
- UTA0565 is a newly identified user of an already known exploit chain. The new information is the additional actor, targeting pattern, spoofed infrastructure and CLEANGULP payload, not a newly disclosed set of CVEs.
