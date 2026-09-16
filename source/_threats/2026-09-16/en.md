---
id: "2026-09-16"
title: "Threat Intelligence Daily · 2026-09-16"
date: "2026-09-16"
updated: "2026-09-16 23:00:00"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "Google's September Pixel bulletin confirms limited targeted exploitation of CVE-2026-58704. UK, US and Dutch agencies published technical details for Iran-linked CHOSEN BRICK spyware, while Kaspersky documented NightEagle intrusions using stolen VPN credentials, GhostContainer, RDP tunneling and BlueKeep. OPSWAT also published details for two patched TP-Link Tapo C200 flaws requiring network access."
total: 4
critical: 0
high: 4
medium: 0
low: 0
exploited: 3
tags:
  - active-exploitation
  - zero-day
  - mobile-security
  - cyber-espionage
  - spyware
  - apt
  - credential-theft
  - remote-access
  - iot
  - Google-Pixel
  - CHOSEN-BRICK
  - NightEagle
  - GhostContainer
  - TP-Link
  - CVE-2019-0708
  - CVE-2026-15315
  - CVE-2026-15316
  - CVE-2026-58704
cves:
  - CVE-2019-0708
  - CVE-2026-15315
  - CVE-2026-15316
  - CVE-2026-58704
iocs:
  - smdqservice.exe
  - winappx.exe
  - 1dcafb7f8448683281106b06dd22409a
  - 1f3034b706c78b35d8e34044e68c693a
---

## Changes since yesterday

- **NEW — Pixel targeted exploitation:** Google's September Pixel bulletin says CVE-2026-58704 may be under limited, targeted exploitation.
- **NEW — CHOSEN BRICK advisory:** the UK NCSC, FBI and Dutch AIVD published technical details for an Iran-linked Windows spyware campaign targeting dissidents, activists and journalists.
- **NEW — NightEagle in Russia:** Kaspersky documented incidents against Russian companies involving compromised VPN credentials, GhostContainer on Exchange, tunneling and Active Directory/RDP abuse.
- **NEW — Tapo C200 disclosure:** OPSWAT published technical details for two network-adjacent flaws already fixed by TP-Link firmware V5_1.4.6.

## Priority actions

- **Immediate:** Update supported Pixel devices to security patch level 2026-09-05 or later; prioritize users exposed to targeted surveillance.
- **Today:** For people at elevated risk from Iranian surveillance, review Windows endpoints for CHOSEN BRICK persistence and unexpected Telegram/cloud-object-store traffic, including personal devices used for sensitive work.
- **Today:** Hunt Exchange and VPN environments for NightEagle indicators, unusual `devtunnels.ms` use, `rdp2tcp` RDP channels, DCSync behavior and unexpected privileged-account creation.
- **Today:** Update TP-Link Tapo C200 v5 cameras to firmware V5_1.4.6 or later and keep local management interfaces off untrusted networks.

## Priority threats

### Pixel CVE-2026-58704 is under limited targeted exploitation

**Severity:** High  
**Status:** Confirmed limited targeted exploitation  
**CVE:** CVE-2026-58704  
**Affected:** Supported Google Pixel devices before the 2026-09-05 security patch level

Google lists CVE-2026-58704 as a high-severity elevation-of-privilege issue in the Pixel modem component and states there are indications of limited, targeted exploitation. The bulletin does not identify the actor, target population or exploitation chain.

#### Recommendation

Install the September Pixel update and verify a security patch level of 2026-09-05 or later. For high-risk users, treat delayed mobile patching as an exposure window rather than waiting for public exploit details.

#### Sources

- [Google — Pixel Update Bulletin, September 2026](https://source.android.com/docs/security/bulletin/pixel/2026/2026-09-01)

### CHOSEN BRICK: Iran-linked spyware delivered through tailored social engineering

**Severity:** High  
**Status:** Confirmed campaign / government attribution  
**Threat actor:** Iranian state cyber actors  
**Malware:** CHOSEN BRICK  
**Affected:** Targeted Windows users, including dissidents, activists and journalists

The NCSC, FBI and AIVD report that operators build rapport through services such as WhatsApp and Telegram, then send files tailored to the target. Observed lures include fake software and MRI scan results. CHOSEN BRICK persists through the current user's Run key, can add Microsoft Defender exclusions, and uses Telegram for command and control. Its functions include screenshots, microphone capture, theft of email and browser-accessible messaging data, secondary payload delivery and file deletion.

#### Recommendations

- Do not install software or open files sent through unsolicited messaging conversations; obtain applications from their official source.
- Use phishing-resistant MFA and managed endpoint controls for staff likely to face targeted surveillance.
- Search for unexpected Run-key entries and CHOSEN BRICK artifacts. Include personal devices when the user's work makes them a likely target.

#### IOC

- `smdqservice.exe` — filename observed in malicious Run-key persistence.
- `winappx.exe` — filename observed in malicious Run-key persistence.

#### Sources

- [UK NCSC — Iranian cyber targeting of dissidents, activists and journalists](https://www.ncsc.gov.uk/news/iranian-cyber-targeting-of-dissidents-activists-and-journalists)
- [UK NCSC — joint advisory announcement](https://www.ncsc.gov.uk/news/uk-allies-expose-spyware-iranian-state-actors-dissidents-activists-journalists)

### NightEagle uses GhostContainer, legitimate tunnels and RDP for internal access

**Severity:** High  
**Status:** Confirmed APT campaign  
**CVE:** CVE-2019-0708  
**Threat actor:** NightEagle / APT-Q-95  
**Malware:** GhostContainer  
**Affected:** Russian enterprises observed by Kaspersky; Microsoft Exchange, VPN, RDP and Active Directory infrastructure are central to the documented chain

Kaspersky GERT found that most investigated incidents began with compromised VPN credentials. The attackers deployed the .NET GhostContainer backdoor on Exchange servers, hosted tunneling tools in disguised GitHub repositories, and combined Microsoft dev tunnels with `rdp2tcp`. In one incident they exploited BlueKeep (CVE-2019-0708) to create an administrator account, then used Kerberos and DCSync-related activity while moving toward domain compromise.

#### Recommendations

- Review VPN authentication for unusual source infrastructure and rotate credentials where compromise is suspected.
- Hunt for unexpected `devtunnels.ms` traffic, RDP event IDs 132/148 with `rdp2tcp` or random channel names, Impacket `atexec`, DCSync behavior and `netsh interface portproxy` changes.
- Remove unsupported or unpatched RDP systems; BlueKeep remains useful when old systems survive inside trusted networks.

#### IOC

- `1dcafb7f8448683281106b06dd22409a` — MD5, `AdobeSync.exe`.
- `1f3034b706c78b35d8e34044e68c693a` — MD5, `adobe_32.exe`.

#### Sources

- [Kaspersky Securelist — NightEagle targets Russian companies](https://securelist.com/tr/nighteagle-apt-ghostcontainer-and-tunneling/121323/)

## Important vulnerabilities

### TP-Link Tapo C200: local-network authentication replay and denial of service

**Severity:** High  
**Status:** Fixed; no confirmed exploitation  
**CVE:** CVE-2026-15315, CVE-2026-15316  
**Affected:** TP-Link Tapo C200 v5 before firmware V5_1.4.6

OPSWAT's disclosure describes CVE-2026-15315 as a replay weakness in the local management authentication flow that can give an unauthenticated network-adjacent attacker a valid administrator session. CVE-2026-15316 allows oversized encrypted configuration input to crash or restart the HTTPS service. Both require network access to the camera; TP-Link released firmware V5_1.4.6 on August 18.

#### Recommendation

Update to V5_1.4.6 or later. Do not expose camera management to untrusted networks, and segment cameras from sensitive systems in business deployments.

#### Sources

- [OPSWAT — authentication bypass and DoS vulnerabilities in TP-Link Tapo cameras](https://www.opswat.com/blog/authentication-bypass-and-dos-vulnerabilities-opswat-discovers-cve-2026-15315-cve-2026-15316-in-tp-link-tapo-cameras)

## Daily observations

- The Pixel bulletin confirms exploitation but provides little campaign context. Patch priority follows Google's exploitation statement; attribution does not.
- CHOSEN BRICK and NightEagle both use legitimate services inside their chains. Detection needs endpoint and identity context rather than domain blocking alone.
- The Tapo flaws are network-adjacent and already patched. Exposure and segmentation determine urgency more than the CVSS label by itself.
