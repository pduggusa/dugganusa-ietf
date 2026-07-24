# DugganUSA — IETF Hackathon Contributions

Real-world threat-intelligence contributions from **DugganUSA LLC** to the IETF Hackathon,
offered to project champions as empirical grounding for standards work.

We are a bootstrapped threat-intelligence shop. We run a public STIX 2.1 feed, an
edge-blocking worker, and MCP servers, and we publish detection research daily. Our
confidential-computing / formal-verification analysis was already cited in the IETF 126
hackathon `CVE-2026-33697` project's motivation set — this repo is us showing up to help,
not just to be cited.

## Everything here is testable against our live data

These aren't slideware. Run them now — two flagship tools need **no key**:

```
node recon-toolkit/enrich.js 45.131.66.106        # live multi-source enrichment of a real ENCFORGE C2
node recon-toolkit/origin-recon.js dugganusa.com  # CT + DNS + Shodan origin discovery (OpenNHP)
node tls-revocation-braid/served-vs-issued-monitor.js github.com --selftest
node agent-security-benchmark/reference-scorer/dependency-reputation.js --selftest
```

Public (no key): the enrichment endpoint, feed-uniqueness, status, AIPM read, and the **jeevesus
MCP** (`search` / `enrich-ioc` / `check-package`, on the official MCP Registry). Deeper surface
(full STIX feed, `/search`, `/correlate`) is a **free 30-second key** at
`analytics.dugganusa.com/stix/register`. See [`recon-toolkit/`](recon-toolkit/) for the full map,
including which tool tests which contribution. We also ship 16 published integration tools
(CLI, VS Code, Splunk, Sentinel, Elastic, edge Worker, …) that consume the same feed.

## What we bring that a spec doesn't

The security drafts in this hackathon are, correctly, written from first principles. What
we can add is **empirical grounding** — a corpus of *documented, real-world* attacks against
AI agents, agent communication, and attestation, drawn from incidents we tracked and
published as they happened. A benchmark needs real attack vectors; a threat model needs real
adversaries. That is the gap we can fill.

## Contributions in this repo

| Directory | Target project / draft | What we contribute |
|-----------|------------------------|--------------------|
| [`agent-security-benchmark/`](agent-security-benchmark/) | Security Evaluation Benchmark for AI Agents — `draft-han-bmwg-agent-security-benchmark` (China Mobile) | Real-world agentic-attack test vectors (JSON + prose) mapped to the draft's metric dimensions, **plus a runnable dependency-reputation reference scorer** (6/6 self-test). Grounds a theoretical benchmark in incidents that actually happened. |
| [`tls-revocation-braid/`](tls-revocation-braid/) | BRAID Phase 0 — Structural Revocation — `draft-davey-tls-braid` (George Davey) | A **worked failure case** (the 2026-07-19 GitHub Actions cert-outage, from CT logs) + **`served-vs-issued-monitor.js`**, a runnable second freshness signal (CT-issuance axis) that composes with Phase 0's owner-authority axis, same verdict vocabulary (5/5 self-test). |
| [`network-infrastructure-hiding-nhp/`](network-infrastructure-hiding-nhp/) | OpenNHP — Network-infrastructure Hiding — `draft-opennhp-ztcpp-nhp` (Benfeng Chen) | **Sanctioned red-team perspective** (CT/passive-DNS-first origin recon — the CF-Hero class) for the project's explicit bypass challenge, plus our host-shield L7 origin-validation defense as a complementary control for the threat model. |
| [`agent-communication-security/`](agent-communication-security/) | Security for Agent Communication — `draft-jiang-*`, MCP/A2A (Huawei) | Our operational MCP-server verification methodology (the `dredd` pre-invocation verdict + transitive-dependency / Shai-Hulud-class check) and MCP threat findings, for the agent-and-tool-identity and heterogeneous-credential axes. |
| [`incident-identification-kg/`](incident-identification-kg/) | Issues & Incidents Identification using Agentic AI + Knowledge Graph (China Unicom) | Cross-domain operator lessons from running agentic-reasoning-over-a-correlation-graph in production (stale-source fail-safe, edge-corroboration over co-occurrence, denominator discipline). |
| [`cve-2026-33697-attestation/`](cve-2026-33697-attestation/) | CVE-2026-33697 Intra-handshake.fail — `draft-intra-handshake-fail` (M.U. Sardar, TU Dresden) | Our practitioner analysis of the attestation binding-level gap — the project we're already cited in. Offered as a deepening of the motivation, not a claim of primary research. |
| [`rpki-prioritized-data/`](rpki-prioritized-data/) | RPKI-based Validation with Prioritized Resource Data — `draft-zhang-sidrops-prioritized-route-validation` | Our abuse-per-IP-density ASN-reputation data as a **low-authority supplemental** tier (`deprefer/warn/monitor`, never overriding signed RPKI) — the Valid-but-toxic-operator gap. |

## Integrity boundary (please read)

- **We claim no IETF endorsement, adoption, or interoperability result.** These are offered
  contributions for champions to accept, reject, or ignore on their merits.
- **We distinguish our original data from our synthesis.** Where a finding is our own
  detection/capture, we say so and cite our published receipt. Where it is another
  researcher's work (e.g. Pillar Security's sandbox escapes, Sysdig's JADEPUFFER analysis,
  Sardar's attestation draft), we cite them as the source and present ourselves only as
  the party organizing it for this benchmark.
- **We cap our own certainty at 95%.** Threat intelligence is probabilistic; we flag
  confidence and we name what we don't know.
- **Real vs. synthetic:** attack vectors here reference real, publicly-disclosed incidents.
  No live credentials, no victim PII, no attacker infrastructure is republished beyond
  indicators already public in vendor reporting.

## Contact

Patrick Duggan — DugganUSA LLC · https://www.dugganusa.com · STIX feed:
https://analytics.dugganusa.com/api/v1/stix-feed

**Collaboration, co-authoring, replication, and distribution/partnership inquiries are welcome —
`pitch@dugganusa.com`.** We are a registered U.S. business (D-U-N-S 14-363-3562, SAM UEI
TP9FY7262K87) and are set up to work through **in-region partners and resellers** where local
presence, invoicing, or procurement is the right structure. If you champion a draft here and want
the empirical grounding worked up further, say so — that's what this is for.

*Built with the same daily-sweep discipline that produced the analysis IETF 126 cited.*
