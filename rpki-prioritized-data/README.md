# ASN Reputation as Supplemental Prioritized Resource Data for RPKI ROV

**Target project:** RPKI-based Validation with Prioritized Resource Data
(`draft-zhang-sidrops-prioritized-route-validation`; champions Jia Zhang, Mingwei Xu,
Nan Geng, Chongfeng Xie, Yangyang Wang)
**Also relevant:** ASPA-based AS_PATH Verification; GROWing BGP Terms & Security Documents.
**Contributor:** DugganUSA LLC
**Status:** Offered as a candidate supplemental data source. Not an IETF work product.

---

## Why we can help

The project explores using **local or supplemental routing-security data** — alongside signed
RPKI — with **different authority/assurance levels**, so operators can apply graded actions
(`reject / deprefer / warn / monitor / exception`). It asks: what supplemental inputs, at what
priority, refine ROV without overriding signed RPKI semantics?

We maintain exactly this kind of supplemental input: **operational threat-reputation data on
origin ASes**, derived from observed abuse rather than from routing authority. It is a natural
fit for a *low-authority-but-high-signal* tier in the project's priority model.

## The data we can contribute as a supplemental tier

- **Durably-malicious / bulletproof-hosting ASN scoring**, computed by an **abuse-per-IP-density**
  method: rank ASes not by raw block volume (which biases toward big networks) but by how
  concentrated abuse is per address — the signal that separates "an AS with some bad tenants" from
  "an AS where abuse *is* the business." This is how we decide which ASes to durably block.
- Derived from our own edge telemetry + curated feeds; **updated continuously**; expressible as a
  simple `{asn, reputation, basis, confidence}` list.

## How it slots into the priority model (proposed)

This data is **NOT** an authority on route origin — it must never override signed RPKI. Its correct
place is the project's *lower-authority supplemental* tier, informing **`deprefer / warn /
monitor`**, never `reject` on its own:

| RPKI state | + our ASN reputation | Suggested graded action |
|------------|----------------------|-------------------------|
| Valid | reputationally toxic AS | `deprefer` or `warn` (valid origin, hostile operator) |
| NotFound | reputationally toxic AS | `monitor` / elevate scrutiny |
| Valid | clean | normal |
| Invalid | (any) | `reject` per RPKI — reputation adds nothing |

The value is in the **Valid-but-toxic** and **NotFound-but-toxic** cells: RPKI says the origin is
authorized (or unknown), while abuse telemetry says the operator is hostile. That is precisely the
"different authority levels" gap the draft is designed to let operators act on — without touching
signed RPKI semantics.

## What we offer

- A sample `{asn, reputation, basis, confidence}` supplemental dataset for PoC testing of the
  multi-priority RTR/ROV framework.
- The abuse-per-IP-density methodology writeup, so the assurance level of this tier is transparent
  and operators can weight it appropriately.
- Explicit priority guidance: supplemental-only, `deprefer/warn/monitor`, never authoritative.

## Boundary

Reputation data is probabilistic (we cap confidence at 95%) and is offered strictly as a
**low-authority supplemental** input. It must not override signed RPKI. We make no claim that it
belongs in the standard — it is candidate test data + a methodology for the "supplemental data"
question the project is exploring.
