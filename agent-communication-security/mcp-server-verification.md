# Operational MCP-Server Verification — Notes for Agent Communication Security

**Target project:** Security for Agent Communication — `draft-jiang-*` (MCP/A2A), Huawei team
(also relevant: Heterogeneous Credential Verification for Workload and Agentic Systems)
**Contributor:** DugganUSA LLC
**Status:** Offered operational input from a party that runs MCP servers and an MCP-server
verification tool in production. Not an IETF work product.

---

## Why we can help here

The project scopes three axes: **intent-source validation, agent-and-tool identity, and
heterogeneous-credential verification**, over MCP and A2A. We operate on both sides of this:

- We publish and run **MCP servers** (a public threat-intel MCP and others).
- We run **`dredd`** — a pre-invocation MCP-server verification tool that returns a signed
  verdict (**BLOCK / ADVISORY / ALLOW**) *before* an agent invokes an MCP server, judging both
  **server identity** and the server's **transitive dependency graph** (npm/PyPI) for
  supply-chain risk of the Shai-Hulud worm class.
- We maintain a corpus of **MCP-server security findings** at scale from crawling the MCP
  registry.

That is direct operational experience with exactly the "agent-and-tool identity" and
"trust-before-invocation" problem the drafts address.

## The concrete lesson: tool identity is not enough without the dependency graph

Our operational finding, offered as input to the agent-and-tool-identity axis:

**Verifying an MCP server's identity does not bound its risk if you don't also verify what it
depends on.** An agent that trusts a correctly-identified, correctly-signed MCP server still
inherits every transitive npm/PyPI dependency that server pulls — and the supply-chain campaigns
of 2026 (Shai-Hulud-class worms, SleeperGem dormant-maintainer hijacks, ChocoPoC poisoned PoC
dependencies) all live in that transitive layer, beneath the identity check.

So a credential/identity verification standard for agent communication should treat the tool's
**dependency provenance as part of its verifiable identity**, or at least require a separate,
composable dependency-provenance check. `dredd`'s design encodes this: the verdict is only
meaningful when the `dep_graph` field confirms the transitive graph was actually walked, and a
server whose dependency graph could not be verified returns ADVISORY, not ALLOW — fail-safe, not
fail-open.

## Mapping to the project's three axes

| Project axis | Our operational input |
|--------------|-----------------------|
| Intent-source validation | Non-text injection is a live intent-spoofing vector — instructions smuggled via data channels (image/dataset/calendar) bypass prompt-level intent checks. Intent validation must cover non-prompt channels. |
| Agent-and-tool identity | Identity verification must compose with **dependency-provenance** verification; a signed server with a poisoned transitive dependency is a verified-identity, unverified-risk state. `dredd`'s BLOCK/ADVISORY/ALLOW + `dep_graph` is a reference shape. |
| Heterogeneous-credential verification | We can share the fail-safe verdict model (unverified dependency graph -> ADVISORY not ALLOW) as one concrete heterogeneous-check pattern. |

## What we offer

- The `dredd` verdict model (identity + transitive-dependency verdict, fail-safe on unverifiable
  dependency graphs) as a reference design pattern for the agent-and-tool-identity axis.
- Our real MCP-server-security findings as test inputs, where useful and shareable.
- Coordination via GitHub / IETF Hackathon channels.

## Boundary

We make no interoperability or endorsement claim. `dredd` is our own tool; we offer its *design
lesson* (identity-alone is insufficient; verify the dependency graph; fail safe) as input, not as
a proposed standard. Sourcing for the supply-chain campaigns referenced is primary-researcher-
credited in `../agent-security-benchmark/real-world-attack-vectors.md`.
