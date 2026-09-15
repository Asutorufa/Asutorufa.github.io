---
id: "2026-09-13"
title: "Threat Intelligence Daily · 2026-09-13"
date: "2026-09-13"
updated: "2026-09-15"
language: en
generated: true
summary: "As of 2026-09-13, the most urgent threats center on actively exploited DevOps, remote-management and edge-device vulnerabilities, plus the BlueMoon browser/Windows zero-day chain rapidly adopted by multiple state-aligned clusters. CISA added five KEVs, PaperCut and GitLab saw real-world attack activity, while Check Point disclosed two critical VPN RCEs and the Brevo incident enabled targeted phishing against Trezor users."
total: 8
critical: 7
high: 1
medium: 0
low: 0
exploited: 7
tags:
  - active-exploitation
  - zero-day
  - supply-chain
  - phishing
  - apt
  - edge-device
  - devops
  - remote-access
  - vpn
  - CVE-2026-42016
  - CVE-2026-42018
  - CVE-2026-82329
  - CVE-2026-84869
  - CVE-2026-67276
  - CVE-2026-67277
  - CVE-2026-86060
  - CVE-2026-82078
  - CVE-2026-81578
  - CVE-2026-85706
  - CVE-2026-85046
  - CVE-2026-87491
  - CVE-2026-85880
  - CVE-2026-85102
  - CVE-2026-85103
cves:
  - CVE-2026-42016
  - CVE-2026-42018
  - CVE-2026-82329
  - CVE-2026-84869
  - CVE-2026-67276
  - CVE-2026-67277
  - CVE-2026-86060
  - CVE-2026-82078
  - CVE-2026-81578
  - CVE-2026-85706
  - CVE-2026-85046
  - CVE-2026-87491
  - CVE-2026-85880
  - CVE-2026-85102
  - CVE-2026-85103
iocs:
  - 82.192.72.4
  - 103.102.31.18
  - log.gitclone.org
  - 3.88.162.79
  - 64.207.232.6
  - ms.checrity.com
  - 79.133.56.90
  - brianwilli.com
  - fracons.com
  - getaiexo.com
  - elixnovorem.com
  - "sha256:a4a6a04d85eca8d584d939d2437c85a4f291207d8042f2ec002838e336b72ef5"
  - "sha256:295fc584f75e94108c9be945977db33ed80421f5d374eab188587c911dffd915"
---

## Executive summary

As of September 13, attackers continue to focus on internet-facing management and infrastructure products. On September 12, CISA added five vulnerabilities affecting JFrog Artifactory, ConnectWise ScreenConnect and MikroTik RouterOS to the Known Exploited Vulnerabilities (KEV) catalog, making these products the highest-priority patching targets in this edition.

At the same time, GitLab's critical path-traversal flaw drew real-world probing shortly after disclosure, while PaperCut confirmed attacks in customer environments. Proofpoint also documented the BlueMoon exploit chain, combining Chrome V8 and Windows kernel zero-days and rapidly adopted by several state-aligned espionage clusters. Two critical Check Point VPN RCEs have no confirmed exploitation yet, but their edge-device exposure still warrants urgent remediation.

## Priority threats

### JFrog Artifactory: authentication-bypass chain used for administrator takeover

> Attackers are chaining Artifactory vulnerabilities to bypass authentication, obtain administrator control, establish persistence and deploy backdoors.

**Severity:** Critical  
**Status:** Confirmed exploitation / CISA KEV  
**CVE:** CVE-2026-42016, CVE-2026-42018, CVE-2026-82329  
**Affected:** JFrog Artifactory Self-Hosted

Wiz observed real-world attacks combining CVE-2026-42016 and CVE-2026-42018 with related flaws to bypass authentication and elevate privileges. Follow-on activity included persistent administrator accounts, malicious Groovy plugins and a Rust backdoor. CISA added two of the vulnerabilities to KEV on September 12.

#### Impact

A successful compromise can expose software artifacts, credentials, build pipelines and downstream supply-chain trust. In environments where Artifactory is central to CI/CD, the blast radius can extend far beyond a single server.

#### Recommendations

- Upgrade to JFrog fixed releases such as 7.111.21, 7.117.28, 7.125.20, 7.133.29, 7.146.38, 7.161.20 or later.
- Review recently created administrator accounts, unusual Groovy plugins, and unknown services/processes.
- Investigate suspicious outbound connections from Artifactory hosts and rotate privileged credentials that may have been exposed.

#### IOC

- `log.gitclone[.]org`
- `3.88.162[.]79`
- `64.207.232[.]6`

#### Sources

- [Wiz Research — Artifactory under attack](https://www.wiz.io/blog/artifactory-under-attack-in-the-wild-exploitation-of-cve-2026-42016-cve-2026-4201)
- [JFrog Artifactory Self-Managed Releases](https://docs.jfrog.com/releases/docs/artifactory-self-managed-releases)
- [CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### MikroTik RouterOS: MikroTrick takeover chain actively exploited

> A RouterOS exploit chain can lead to full device compromise, with CERT Polska publishing observed attacker infrastructure and detection clues.

**Severity:** Critical  
**Status:** Confirmed exploitation / CISA KEV  
**CVE:** CVE-2026-67276, CVE-2026-67277, CVE-2026-86060  
**Affected:** MikroTik RouterOS

CERT Polska documented the MikroTrick chain, where CVE-2026-67276 and CVE-2026-86060 can be combined to gain full control of affected devices. CISA's KEV update also covers CVE-2026-67277 and CVE-2026-86060. MikroTik has released fixed versions.

#### Impact

Compromised edge routers can be used for traffic interception, persistence, lateral movement, proxy infrastructure, or follow-on intrusion. Since RouterOS devices often sit directly on the network perimeter, remediation priority should exceed what CVSS alone would suggest.

#### Recommendations

- Upgrade to fixed MikroTik releases such as 7.25beta3, 7.24.2, 7.23.4 or 6.49.21 and later security releases.
- Review unknown privileged users, including suspicious `ops` accounts and associated logins.
- Restrict public exposure of WinBox, SSH and web-management interfaces and investigate connections from known malicious sources.

#### IOC

- `82.192.72[.]4` — source of successful attacks observed by CERT Polska
- `103.102.31[.]18` — observed exploitation-attempt source

#### Sources

- [CERT Polska — Vulnerabilities in MikroTik RouterOS actively exploited](https://cert.pl/en/posts/2026/09/vulnerabilities-in-mikrotik-routeros-actively-exploited/)
- [MikroTik — September 2026 Vulnerability](https://mikrotik.com/supportsec/september-2026-vulnerability/)
- [CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### BlueMoon: state-aligned actors rapidly adopt Chrome + Windows zero-day chain

> Proofpoint observed at least four espionage clusters rapidly adopting the same exploit chain against targets in the United States and Southeast Asia.

**Severity:** Critical  
**Status:** Confirmed exploitation / zero-day chain  
**CVE:** CVE-2026-85046, CVE-2026-87491, CVE-2026-85880  
**Threat actors:** TA412 / APT31 and other state-aligned clusters  
**Malware:** ShadowPad, GemStone

BlueMoon chains two Chrome V8 vulnerabilities with a Windows kernel ALPC privilege-escalation flaw, moving from browser compromise to operating-system privileges. Proofpoint first observed the chain in TA412/APT31 activity and then saw multiple independent state-aligned clusters adopt the same technique within days.

#### Impact

The activity shows how quickly a high-value browser exploit chain can spread across distinct actor sets. Targets included U.S. NGOs, aerospace, mining and commodities organizations, as well as government, manufacturing, consulting and financial targets in Asia.

#### Recommendations

- Ensure both Chrome/Chromium and Windows security updates are deployed; patching only one side does not fully break the chain.
- Correlate browser-child processes, suspicious extensions, privilege escalation and follow-on C2 traffic on potentially affected endpoints.
- Apply browser isolation, least privilege and stricter outbound controls for high-risk users.

#### IOC

- `ms.checrity[.]com`
- `79.133.56[.]90`
- `brianwilli[.]com`
- `fracons[.]com`
- `getaiexo[.]com`
- `elixnovorem[.]com`
- `SHA256 a4a6a04d85eca8d584d939d2437c85a4f291207d8042f2ec002838e336b72ef5`
- `SHA256 295fc584f75e94108c9be945977db33ed80421f5d374eab188587c911dffd915`

#### Sources

- [Proofpoint — Once in a BlueMoon](https://www.proofpoint.com/us/blog/threat-insight/once-bluemoon-multiple-state-aligned-threat-actors-rapidly-adopt-novel-exploit)

### GitLab CVE-2026-85706: real-world probing one day after disclosure

> An unauthenticated path-traversal flaw enables arbitrary file reads, carries CVSS 10.0 severity and attracted internet probing almost immediately after disclosure.

**Severity:** Critical  
**Status:** Confirmed real-world probing/exploitation activity  
**CVSS:** 10.0  
**CVE:** CVE-2026-85706  
**Affected:** Multiple GitLab CE/EE 18.7+ branches before fixed releases

GitLab fixed the issue in 19.3.2, 19.2.6 and 19.1.8. Researchers then observed internet activity targeting the flaw, demonstrating that newly disclosed vulnerabilities may have virtually no safe remediation window.

#### Recommendations

- Upgrade to 19.3.2, 19.2.6, 19.1.8 or later.
- Review suspicious POST requests to `/api/v4/projects/{id}/repository/commits/`, especially those containing unusual `file.path` values.
- If suspicious file reads are found, assume sensitive configuration or credentials may have been exposed and rotate them.

#### Sources

- [GitLab — Patch Release 19.3.2](https://docs.gitlab.com/releases/patches/patch-release-gitlab-19-3-2-released/)
- [SecurityWeek — GitLab vulnerability exploited one day after disclosure](https://www.securityweek.com/gitlab-vulnerability-exploited-one-day-after-disclosure/)

## Other confirmed exploitation

### ConnectWise ScreenConnect CVE-2026-84869

**Severity:** Critical  
**Status:** Confirmed exploitation / CISA KEV  
**CVSS:** 9.9  
**Affected:** ScreenConnect before 26.6.5

The flaw affects authorization and permission handling and can be abused in remote sessions for client-side file transfer and execution. ConnectWise rates it Priority 1; Huntress observed malicious and worm-like ScreenConnect deployments and script execution activity in the same period, and CISA subsequently added it to KEV.

**Recommendation:** Upgrade immediately to 26.6.5 or later and hunt for rogue ScreenConnect instances, VBScript/PowerShell execution and unauthorized remote sessions.

#### Sources

- [ConnectWise Security Bulletin](https://www.connectwise.com/company/trust/security-bulletins/2026-09-08-screenconnect-bulletin)
- [Huntress — Rogue ScreenConnect Installations](https://www.huntress.com/blog/rogue-screenconnect-installations)
- [CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)

### PaperCut NG/MF: CVE-2026-82078 and CVE-2026-81578 exploited in customer environments

**Severity:** Critical  
**Status:** Confirmed exploitation  
**CVE:** CVE-2026-82078, CVE-2026-81578  
**Affected:** PaperCut NG/MF

PaperCut confirmed customer security incidents involving these two vulnerabilities. CVE-2026-82078 involves unsafe dynamic class loading, while CVE-2026-81578 affects authentication. The vendor released maintenance builds on September 10, replacing earlier emergency patches.

**Recommendation:** Upgrade to 26.0.5, 25.0.13, 24.1.10 or later fixed releases and follow PaperCut's log-hunting guidance for retrospective investigation.

#### Sources

- [PaperCut — Urgent Security Advisory](https://www.papercut.com/kb/Main/security-bulletin-27-aug-2026-urgent-security-advisory/)
- [SecurityWeek — PaperCut flaws exploited in AI-powered attacks](https://www.securityweek.com/papercut-flaws-exploited-in-ai-powered-attacks/)

## Important vulnerabilities

### Check Point VPN: two critical RCE vulnerabilities require urgent patching

**Severity:** Critical  
**Status:** No reliable evidence of exploitation in the wild  
**CVE:** CVE-2026-85102, CVE-2026-85103  
**Affected:** Check Point Remote Access / Site-to-Site VPN

CVE-2026-85102 can lead from authentication bypass to remote code execution, while CVE-2026-85103 is a heap-overflow RCE in ASN.1 decoding. Check Point says the flaws were discovered internally and it has not observed exploitation, but perimeter VPN appliances are inherently high-value targets.

**Recommendation:** Deploy Check Point's Live Patch or current Jumbo Hotfix and verify that all internet-facing VPN gateways are remediated.

#### Sources

- [Check Point — Critical Security Advisory: VPN Vulnerabilities](https://community.checkpoint.com/t5/General-Topics/Action-Required-Critical-Security-Advisory-VPN-Vulnerabilities/m-p/282073/highlight/true)
- [SecurityWeek — Check Point patches critical VPN vulnerabilities](https://www.securityweek.com/check-point-patches-critical-vpn-vulnerabilities/)

## Supply chain / phishing

### Brevo incident impacts Trezor: compromised email platform used for targeted wallet phishing

**Severity:** High  
**Status:** Confirmed attack  
**Affected:** Brevo customer accounts and Trezor newsletter subscribers

Brevo disclosed a SAML SSO isolation issue that allowed an attacker to access 138 customer accounts. Six accounts were used to send phishing emails and 43 had contact exports. Trezor said roughly 347,000 newsletter addresses were affected, and attackers used legitimate marketing channels to send wallet-backup theft lures; about 2,500 users clicked the malicious link before the infrastructure was taken down.

Trezor's core wallet systems were not compromised, but the incident demonstrates how takeover of a trusted third-party communications channel can sharply increase phishing credibility and delivery success.

**Recommendation:** Trezor users should ignore any email or app request asking for a wallet backup or seed phrase. Organizations should reassess SSO boundaries, export permissions and audit controls for third-party marketing and email SaaS.

#### Sources

- [Trezor — Security incident at Brevo](https://trezor.io/blog/news/security-incident-at-brevo-our-third-party-email-provider)
- [Brevo — Incident write-up](https://status.brevo.com/incidents/01M266V1CZKJQNGZRNEGFD5CQE/write-up)

## IOC summary

The IOCs below come from explicit malicious context in the original research. Hosting ownership and IP assignments can change, so validate against time, telemetry and asset context before blocking.

| Event | IOC | Type |
| --- | --- | --- |
| Artifactory | `log.gitclone[.]org` | payload domain |
| Artifactory | `3.88.162[.]79` | infrastructure IP |
| Artifactory | `64.207.232[.]6` | C2 IP |
| MikroTik | `82.192.72[.]4` | observed attacker IP |
| MikroTik | `103.102.31[.]18` | exploit-attempt IP |
| BlueMoon | `ms.checrity[.]com` | ShadowPad C2 |
| BlueMoon | `79.133.56[.]90` | fallback C2 |
| BlueMoon | `brianwilli[.]com` | payload/download infrastructure |
| BlueMoon | `fracons[.]com` | C2 |
| BlueMoon | `getaiexo[.]com` | C2 |
| BlueMoon | `elixnovorem[.]com` | C2 |

## Daily observations

- **Management planes remain high-value attack surfaces.** Artifactory, ScreenConnect, RouterOS, GitLab and PaperCut all sit in operational or administrative paths, allowing compromise to spread beyond the initial host.
- **Fresh disclosure does not imply a patching grace period.** GitLab activity appeared almost immediately after disclosure, reinforcing the need to treat critical internet-facing vulnerabilities as incident-response work rather than routine maintenance.
- **Zero-day chain diffusion deserves dedicated monitoring.** BlueMoon appeared across several state-aligned clusters in quick succession, suggesting rapid reuse of high-value exploit chains.
- **Third-party SaaS continues to weaken trust boundaries.** The Brevo/Trezor incident did not compromise wallet core systems, but abuse of a trusted email channel still reached a large user population.