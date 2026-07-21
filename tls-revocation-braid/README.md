# A Second Freshness Signal + a Worked Failure Case for BRAID Phase 0

**Target project:** BRAID Phase 0 — Structural Revocation Without OCSP, CRLs, or Short Lifetimes
(`draft-davey-tls-braid`, champion George Davey)
**Contributor:** DugganUSA LLC
**Status:** Offered companion tooling + a real-world case study. Not an IETF work product.

---

## Why we can help here

BRAID Phase 0 builds a monitor that compares the credential a TLS endpoint **serves** against
the credential its **owner authorizes** (a DNSSEC-signed `_braid` Anchor), emitting
`authorized / mismatch / stale / unknown / dnssec-failed`. We independently built a monitor
this week that compares the credential an endpoint **serves** against the newest credential
**issued** for it, per Certificate Transparency — same problem shape, adjacent evidence source.
We offer two things:

1. **A worked failure case** that is exactly the class of problem BRAID makes structural.
2. **`served-vs-issued-monitor.js`** — a runnable second freshness signal that composes with
   Phase 0, using the same status vocabulary.

## The worked case: GitHub Actions, 2026-07-19 (why revocation-by-expiry fails)

On 2026-07-19 the `*.actions.githubusercontent.com` wildcard expired and dropped **every
self-hosted GitHub Actions runner worldwide**. We pulled the Certificate Transparency logs:
**no certificate was issued during the incident.** Valid replacements had been issued on 2026-05-12,
2026-06-18, and twice on 2026-07-10 — the renewal automation was firing perfectly on the ACME
schedule for months. GitHub recovered by deploying a certificate it had been **holding, unused,
for 31 days.**

The renewal worked. The **rollout** silently didn't, and nothing on either side compared what was
issued against what was being served. This is the precise failure the "shrink certificate
lifetimes" strategy does *not* fix — a short lifetime just means the un-rotated cert expires
sooner and takes you down on a schedule you can predict to the second. It is a textbook argument
for BRAID's thesis: **freshness should be owner-controlled and structural, not a race between an
expiry clock and a rollout pipeline nobody is watching.**

We offer this incident as a citable, dated case study for the project's motivation and results
talk. Full analysis (with the CT issuance timeline) is public at dugganusa.com.

## The companion tool: `served-vs-issued-monitor.js`

A dependency-free Node monitor that emits BRAID-aligned verdicts (`authorized / mismatch /
stale / unknown`) from a **different, independent evidence axis** than Phase 0:

- **Phase 0 axis:** served credential vs owner-authorized `_braid` Anchor (authority).
- **This axis:** served credential vs newest CT-issued certificate (issuance recency).

The two are orthogonal freshness checks — an endpoint can be owner-authorized but serving a
month-stale cert (the GitHub case), or serving the newest issuance but no longer owner-authorized
(a revocation). Running both gives an operator defense in depth on the same question.

**Design lesson baked in (learned by shipping the naive version first):** drift alone is *not* an
alarm. CDNs keep overlapping certificate packs and reissue constantly, so a newer CT entry is
routine. The alarm is **drift AND imminent expiry together** — a newer cert exists *while* the
served one is running out. The pure `verdict()` function encodes this; `--selftest` covers the
GitHub shape, the CDN false-positive, the rollout-grace window, expiry, and CT-unavailable.

```
node served-vs-issued-monitor.js --selftest    # 5/5
node served-vs-issued-monitor.js example.com   # live: served vs newest-issued verdict
```

## On the stretch goal (RPKI origin-AS check)

The project's optional stretch goal validates the endpoint's origin AS against RPKI. We maintain
threat-reputation data on origin ASes (durably-malicious / bulletproof-hosting scoring by
abuse-per-IP density) — see `../rpki-prioritized-data/`. That data could serve as a *supplemental*
signal alongside RPKI validity for BRAID's Routing strand: an AS that is RPKI-valid but
reputationally toxic is a different state than an AS that is simply RPKI-valid.

## Boundary

The companion tool is ours and offered as-is; we make no claim it belongs in BRAID or that our
CT axis is part of the draft. It is a complementary operator signal and a worked case. The
GitHub incident is public; CT data via Cert Spotter; no private infrastructure is exposed.
