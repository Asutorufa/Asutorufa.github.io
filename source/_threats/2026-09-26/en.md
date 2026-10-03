---
id: "2026-09-26"
title: "Threat Intelligence Daily · 2026-09-26"
date: "2026-09-26"
updated: "2026-10-03 03:20:00"
language: en
generated: true
generator: ChatGPT
model: GPT-5.6 Sol
summary: "September 26 was quieter but still produced three operationally relevant events: Keio Plaza Hotel confirmed a ransomware-caused system outage, the Mini Shai-Hulud GitHub Actions incident reached a containment update, and Kiteworks asked customers to perform a precautionary nine-hour shutdown after federal threat intelligence."
total: 3
critical: 0
high: 3
medium: 0
low: 0
exploited: 2
tags:
  - ransomware
  - supply-chain
  - github-actions
  - cloud-security
  - Keio-Plaza-Hotel
  - Mini-Shai-Hulud
  - Kiteworks
cves: []
iocs: []
---

## Changes since yesterday

- **NEW — Keio Plaza Hotel:** the hotel confirmed a ransomware attack on its servers in the early hours of September 26 and blocked external network access while investigating.
- **UPDATED — Mini Shai-Hulud:** Socket reported that two previously compromised `actions-cool` GitHub Actions had been re-enabled with malicious tags; GitHub disabled both again on September 25.
- **NEW — Kiteworks:** following credible federal threat intelligence, Kiteworks recommended a nine-hour precautionary shutdown. The company said it had no indication of compromise at the time.

## Priority actions

- **Immediate:** Organizations using the affected `actions-cool/issues-helper` or `actions-cool/maintain-one-comment` tags should review workflow history and secrets exposure rather than relying only on the actions being disabled.
- **Today:** Keio-related partners should treat integrations and support communications as potentially disrupted until the investigation clarifies scope; do not infer customer-data theft without evidence.
- **Today:** Kiteworks self-hosted customers should follow the vendor shutdown/restart instructions and ensure 9.5.1 or current vendor guidance is applied.

## Priority threats

### Keio Plaza Hotel confirmed a ransomware attack

**Severity:** High  
**Status:** Confirmed ransomware incident  
**Affected:** Keio Plaza Hotel server environment

The hotel confirmed that a ransomware attack caused a system failure early on September 26. It blocked external network connections and began an investigation with Keio Corporation, police and external specialists. Some systems were unavailable, while hotel operations continued. The company had not confirmed information leakage at the time of the notice.

The evidence supports a confirmed ransomware incident, but not a confirmed data breach. Downstream organizations should separate those two claims until the investigation provides more detail.

#### Sources

- [Keio Plaza Hotel — Notice and Apology Concerning System Failure Due to Ransomware Attack](https://www.keioplaza.co.jp/news/45681/)

### Mini Shai-Hulud reappeared through re-enabled GitHub Actions

**Severity:** High  
**Status:** Confirmed malicious supply-chain exposure / contained update  
**Affected:** Repositories referencing compromised tags of `actions-cool/issues-helper` or `actions-cool/maintain-one-comment`

Socket reported that two GitHub Actions compromised during the earlier Mini Shai-Hulud campaign were re-enabled on September 16 while malicious tags still existed, exposing downstream workflows again. Both actions were disabled again on September 25.

Review workflow runs during the re-enabled window, identify secrets available to those jobs, and rotate credentials where a malicious action actually executed.

#### Sources

- [Socket — Re-Enabled GitHub Actions Expose Thousands of Repositories to Mini Shai-Hulud](https://www.socket.dev/blog/mini-shai-hulud-actions)

### Kiteworks requested a precautionary shutdown after federal threat intelligence

**Severity:** High  
**Status:** Preventive action; no compromise confirmed on September 26  
**Affected:** Kiteworks customer-managed and vendor-hosted systems covered by the advisory

Kiteworks recommended a nine-hour shutdown window after receiving credible threat intelligence from federal authorities. The company said current release 9.5.1 addressed all known vulnerabilities and that it had no indication Kiteworks or customer systems had been compromised.

This report preserves that uncertainty: the advisory was a preventive action, not evidence of a breach.

#### Sources

- [Kiteworks — Precautionary Shutdown Advisory](https://www.kiteworks.com/company/press-releases/kiteworks-precautionary-shutdown-advisory/)

## Daily observations

- A containment status can change the recommended action without changing the underlying incident. The GitHub Actions case still requires historical workflow review after the malicious tags are disabled.
- The Keio and Kiteworks notices both distinguish confirmed operational impact from unconfirmed data compromise; keeping that boundary prevents incident reporting from outrunning evidence.
