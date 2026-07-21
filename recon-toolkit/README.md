# Recon Toolkit — testable against DugganUSA's live data

Runnable tools a hackathon participant can point at **our live threat-intelligence data** to test
the contributions in this repo. Dependency-free Node. Two of the three flagship scripts need
**no key at all**; the deeper surface is a free 30-second registration.

## Run it now (no key)

```
node enrich.js 45.131.66.106        # live multi-source enrichment of a real JADEPUFFER/ENCFORGE C2
node origin-recon.js dugganusa.com  # CT + DNS + Shodan origin discovery (OpenNHP demo)
node ../tls-revocation-braid/served-vs-issued-monitor.js github.com   # cert issued-vs-served verdict
node ../agent-security-benchmark/reference-scorer/dependency-reputation.js --selftest   # 6/6
```

`enrich.js` fronts our public enrichment endpoint (Shodan InternetDB + AbuseIPDB + VirusTotal +
ThreatFox + OTX + our own feed) in one call, no auth. Example real output for the JADEPUFFER C2
`45.131.66.106`: Shodan port 8082, AbuseIPDB Germany/DeinServerHost, OTX-flagged.

## Two testability tiers

| Tier | Surface | Auth |
|------|---------|------|
| **Public (no key)** | `GET /api/v1/threat-intel/enrichment?ip=` · `GET /api/v1/feed-uniqueness` · `GET /api/v1/status` · AIPM leaderboard read · **jeevesus MCP** `search` / `enrich-ioc` / `check-package` (public-read) | none |
| **Free key (30-sec register)** | `GET /api/v1/search/iocs` · `GET /api/v1/search/correlate` · the full **STIX 2.1 feed** `ips.csv / domains.csv / hashes.csv / packages.csv` · TAXII 2.1 | free Bearer key — register at `analytics.dugganusa.com/stix/register`, pass as `Authorization: Bearer <key>` or `?api_key=` |

So: the vectors, the C2s, and the ASN-reputation data in this repo are all **verifiable against
live data** — key-free for enrichment, or with a free key for the full feed and correlation graph.

## Our live tool ecosystem (you don't have to build a client)

Every contribution here rides the same threat intel our published, maintained tools already
consume. A participant can test with a tool they already use:

- **jeevesus MCP** — on the official MCP Registry. Public-read tools: `search`, `enrich-ioc`,
  **`check-package`** (the live reference scorer for benchmark Vector 3 — supply-chain), plus
  `kev-vendor-risk`, `stix-feed-summary`. Directly relevant to the *Security for Agent
  Communication* and *Agent Security Benchmark* projects.
- **STIX 2.1 / TAXII feed** — `analytics.dugganusa.com/api/v1/stix-feed`.
- **16 integration repos** (github.com/pduggusa): `dugganusa-cli`, `dugganusa-vscode`,
  `dugganusa-nvim`, `dugganusa-splunk`, `dugganusa-sentinel`, `dugganusa-elastic`,
  `dugganusa-edge-shield`, `dugganusa-scanner-core`, `dugganusa-action`, `dugganusa-slack`,
  `dugganusa-chrome`, `dugganusa-obsidian`, `dugganusa-raycast`, and more — CLI, editors, SIEMs,
  and an edge Worker, all consuming this feed.

## Which tool tests which contribution

| Tool | Tests contribution |
|------|--------------------|
| `enrich.js` (public) | agent-security-benchmark vectors' live indicators; general IP triage |
| `origin-recon.js` (public) | network-infrastructure-hiding-nhp — origin discovery the hiding layer doesn't govern |
| `served-vs-issued-monitor.js` (public, CT) | tls-revocation-braid — the second freshness axis |
| `dependency-reputation.js` (offline self-test) + jeevesus `check-package` (live) | agent-security-benchmark Vector 3 (supply-chain) |
| jeevesus `search` / `enrich-ioc` (public) + free-key `/search/correlate` | incident-identification-kg — the correlation-graph pattern |
| free-key STIX feed + `../rpki-prioritized-data` | RPKI supplemental ASN-reputation tier |

## Ethics / boundary

`origin-recon.js` uses **only public evidence** (Certificate Transparency, DNS, Shodan InternetDB
via our enrichment). It performs **no port scan, no active attack, and sends no packet to the
target service.** Run it only against infrastructure you own or are sanctioned to test — e.g. your
own domain, or the OpenNHP demo per that project's explicit invitation to bypass. We test to help
fix, never to exploit third parties.
