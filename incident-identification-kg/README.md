# Agentic-Reasoning + Knowledge-Graph Notes for Incident Identification

**Target project:** Issues and Incidents Identification using Agentic AI and Knowledge Graph
(champions Henry Yu, Yanxia Tan — China Unicom)
**Contributor:** DugganUSA LLC
**Status:** Offered methodology input from an operator running this pattern in a different domain.
Not an IETF work product.

---

## Why we can help — same method, different domain

The project uses **agentic AI + knowledge graphs** to identify, locate, analyze, and report
network incidents: agents apply cognitive reasoning to correlate multi-source data (topology,
services, inventory, alarms) against a unified ontology and infer root causes, then report via
YANG models. The domain is optical networks; the *method* is exactly what we run for threat
intelligence, at scale, in production. We offer operator lessons from that, not a competing
design.

## What we run (the parallel)

- A **cross-index correlation graph** over ~18M documents (IOCs, autonomous edge decisions,
  block events, adversary profiles, KEV, Tor consensus) that, given one indicator, surfaces
  related entities across sources — the threat-intel analog of correlating alarms + topology +
  inventory to a root cause.
- **~7.4M autonomous decisions** (`oz_decisions`) — an operating example of agent-scored events
  at volume, with the hard-won lesson that scoring must be **per-observation and defensible**,
  not bucketed, or the reasoning layer inherits stale constant scores.
- A **precursor/aggregation layer** that infers "something is about to happen" from correlated
  weak signals — directly analogous to incident *prediction* alongside detection.

## Operator lessons offered to the project

Three failure modes we hit building agentic-reasoning-over-a-graph that a network-incident system
will hit too:

1. **Stale-source reasoning is worse than no reasoning.** An agent that correlates confidently
   over a frozen data source produces a confident wrong root cause. We now **fail-safe to a
   flagged "stale" state** when a source's freshest record exceeds its expected window, rather
   than let the reasoning layer treat silence as signal. A network-incident agent should treat a
   quiet alarm feed as `unknown`, not `healthy`.
2. **The graph edges lie more often than the nodes.** A high match-*count* between two entities is
   not correlation; we learned to weight cross-source corroboration (does an *independent* source
   also link them) over raw co-occurrence. For a network KG: a topology edge plus an alarm plus an
   inventory record agreeing is a root cause; any one alone is a lead.
3. **Every reasoning output needs a denominator.** "Found the root cause" and "found nothing
   because the query was wrong" look identical without one. We require each agentic verdict to
   state what it examined, so a null result is distinguishable from a broken pipeline.

## What we offer

- The three operator lessons above as design input for the reasoning/ontology layer.
- Our correlation-graph shape (indicator → cross-source neighbors) as a reference pattern.
- We make no claim on the optical-network domain or the YANG incident models; the contribution is
  cross-domain methodology from having shipped agentic-reasoning-over-a-KG in anger.

## Boundary

Methodology and lessons only; no data exchange implied. Our domain (threat intel) differs from the
project's (optical networks) — we offer the shared reasoning-layer experience, credited as ours.
