# DugganUSA — IETF Hackathon Contributions

Real-world threat-intelligence contributions from **DugganUSA LLC** to the IETF Hackathon,
offered to project champions as empirical grounding for standards work.

We are a bootstrapped threat-intelligence shop. We run a public STIX 2.1 feed, an
edge-blocking worker, and MCP servers, and we publish detection research daily. Our
confidential-computing / formal-verification analysis was already cited in the IETF 126
hackathon `CVE-2026-33697` project's motivation set — this repo is us showing up to help,
not just to be cited.

## What we bring that a spec doesn't

The security drafts in this hackathon are, correctly, written from first principles. What
we can add is **empirical grounding** — a corpus of *documented, real-world* attacks against
AI agents, agent communication, and attestation, drawn from incidents we tracked and
published as they happened. A benchmark needs real attack vectors; a threat model needs real
adversaries. That is the gap we can fill.

## Contributions in this repo

| Directory | Target project / draft | What we contribute |
|-----------|------------------------|--------------------|
| [`agent-security-benchmark/`](agent-security-benchmark/) | Security Evaluation Benchmark for AI Agents — `draft-han-bmwg-agent-security-benchmark` (China Mobile) | Real-world agentic-attack test vectors mapped to the draft's metric dimensions (adversarial, jailbreak, plugin/skill, autonomous-iteration). Grounds a theoretical benchmark in incidents that actually happened. |
| [`agent-communication-security/`](agent-communication-security/) | Security for Agent Communication — `draft-jiang-*`, MCP/A2A (Huawei) | Our operational MCP-server verification methodology (the `dredd` pre-invocation verdict + transitive-dependency / Shai-Hulud-class check) and MCP threat findings, for the agent-and-tool-identity and heterogeneous-credential axes. |
| [`cve-2026-33697-attestation/`](cve-2026-33697-attestation/) | CVE-2026-33697 Intra-handshake.fail — `draft-intra-handshake-fail` (M.U. Sardar, TU Dresden) | Our practitioner analysis of the attestation binding-level gap — the project we're already cited in. Offered as a deepening of the motivation, not a claim of primary research. |

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

*Built with the same daily-sweep discipline that produced the analysis IETF 126 cited.*
