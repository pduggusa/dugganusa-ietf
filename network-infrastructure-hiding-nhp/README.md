# Adversarial Testing + Defense-in-Depth Notes for OpenNHP

**Target project:** OpenNHP — Network-infrastructure Hiding Protocol (`draft-opennhp-ztcpp-nhp`,
champion Benfeng Chen)
**Contributor:** DugganUSA LLC
**Status:** Offered red-team perspective + operational defense experience. Not an IETF work product.

---

## Why we can help here — from both sides

OpenNHP explicitly invites participants to **attempt to bypass** its network-resource-hiding:
discover protected services without auth, enumerate hidden ports/IPs/domains, perform
reconnaissance, and try AI-assisted attack techniques. We are unusually well-placed to help,
because we do both halves of this in production:

- **Offense:** we run origin-infrastructure reconnaissance for threat hunting — Certificate
  Transparency mining, passive-DNS/Shodan/Censys/ZoomEye-style origin discovery, and the
  CF-Hero class of attack that finds a service's real origin FQDN/IP behind a proxy and connects
  directly, bypassing the edge.
- **Defense:** we wrote and run **host-shield**, an origin-FQDN-bypass defense that rejects any
  request whose HTTP `Host` header is off the canonical allowlist — precisely to defeat the
  reconnaissance-then-direct-connect pattern OpenNHP's hiding also targets.

So we can attack OpenNHP with realistic recon *and* compare notes on what a complementary
application-layer control catches that a network-hiding layer might not.

## Red-team angles we can bring to the hackathon challenge

Mapped to OpenNHP's stated challenge objectives:

- **Enumerating hidden IPs/domains via out-of-band evidence.** Network hiding at the packet layer
  does not remove an origin from Certificate Transparency logs, cert-SAN history, passive DNS, or
  cloud-provider DNS. Our recon practice is to *never* portscan first — we pull the origin from
  public evidence the hiding layer doesn't control. A hiding protocol's threat model should
  explicitly account for CT/passive-DNS leakage of the very endpoints it hides, because that is
  how origins actually get found in the wild (this is the CF-Hero lesson). We can test whether an
  OpenNHP-protected origin is discoverable this way regardless of packet-layer invisibility.
- **AI-assisted attack techniques.** We track how autonomous agents iterate reconnaissance and
  exploitation (see `../agent-security-benchmark/` — JADEPUFFER converged an exploit chain in
  ~5 minutes). An honest evaluation of "resistance to AI-assisted attack" benefits from real
  agentic-attack behavior, not hypotheticals; we can contribute that behavior model.
- **Pre-authentication exploit surface.** Single-Packet-Authorization-style hiding shrinks the
  pre-auth surface but does not eliminate it (the authorizing packet path, the SPA daemon
  itself). We can help probe that residual surface.

## Defense-in-depth note (the part that generalizes)

Our operational position, offered as input to the threat model: **network-layer hiding and
application-layer origin validation are complementary, not redundant.** NHP hides the resource so
recon can't reach it; host-shield assumes recon *did* reach it (via CT/DNS leakage) and rejects
the off-allowlist connection at L7. A defender who deploys only one has a gap the other closes.
The CF-Hero incident class is the concrete argument: attackers routinely find origins through
certificate transparency and DNS, entirely outside the packet layer a hiding protocol governs.

## What we offer

- Realistic origin-recon red-teaming against an OpenNHP deployment (CT/passive-DNS-first,
  portscan-last — how it's actually done).
- Our host-shield defense design as a complementary L7 control to reference in the threat model.
- An AI-assisted-attack behavior model grounded in documented 2026 agentic incidents.

## Boundary

Adversarial testing offered only against the project's own demo/infrastructure, with the
champions' consent, per the hackathon's explicit invitation to bypass. We test to help fix, not
to exploit third parties. No offensive action against any system outside the sanctioned OpenNHP
demo.
