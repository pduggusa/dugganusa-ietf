#!/usr/bin/env node
/**
 * origin-recon.js — demonstrate origin discovery via public evidence (for the OpenNHP challenge).
 *
 * Contributed by DugganUSA LLC to the IETF 126 Hackathon (project: OpenNHP network-infrastructure
 * hiding, which explicitly invites bypass attempts). This shows the CF-Hero recon pattern a
 * network-hiding protocol must account for: an origin is discoverable from PUBLIC evidence
 * (Certificate Transparency, DNS, Shodan) the packet-layer hiding does not control — no port
 * scan required, no packet ever sent to the "hidden" service.
 *
 *   node origin-recon.js example.com
 *
 * Sources (all public, no key): Certificate Transparency (Cert Spotter), DNS, and DugganUSA's
 * public enrichment endpoint (which fronts Shodan InternetDB + AbuseIPDB).
 *
 * ETHICS: read-only public-evidence discovery only. It performs NO active attack, NO port scan,
 * NO connection to the target service. Use only against infrastructure you own or are sanctioned
 * to test (e.g. the OpenNHP demo, per that project's explicit invitation).
 */

'use strict';
const https = require('https');
const dns = require('dns').promises;
const { enrich } = require('./enrich');

function getJson(host, path) {
  return new Promise((resolve) => {
    https.get({ hostname: host, path, headers: { 'User-Agent': 'dugganusa-ietf-recon' }, timeout: 15000 }, (res) => {
      let d = ''; res.on('data', (c) => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
    }).on('error', () => resolve(null)).on('timeout', function () { this.destroy(); resolve(null); });
  });
}

async function ctSans(domain) {
  // Certificate Transparency: every cert ever issued for the domain, including for origin
  // subdomains an operator may believe are private. The hiding layer does not remove these.
  const j = await getJson('api.certspotter.com',
    `/v1/issuances?domain=${encodeURIComponent(domain)}&include_subdomains=true&expand=dns_names`);
  if (!Array.isArray(j)) return [];
  const names = new Set();
  for (const c of j) for (const n of (c.dns_names || [])) if (!n.startsWith('*.')) names.add(n);
  return [...names];
}

async function main(domain) {
  console.log(`\n=== origin-recon · ${domain} · public evidence only, no packets to target ===\n`);

  // 1) Certificate Transparency — names the operator may think are hidden
  const sans = await ctSans(domain);
  console.log(`[CT] ${sans.length} distinct hostnames in Certificate Transparency for ${domain}:`);
  sans.slice(0, 25).forEach((n) => console.log(`     ${n}`));
  if (sans.length > 25) console.log(`     … +${sans.length - 25} more`);

  // 2) DNS — resolve candidate origins (front + any 'origin/direct/backend'-flavored SANs)
  const candidates = [domain, ...sans.filter((n) => /origin|direct|backend|internal|api|vpn|gw/i.test(n))].slice(0, 6);
  console.log(`\n[DNS] resolving ${candidates.length} candidate host(s):`);
  const ips = new Set();
  for (const h of candidates) {
    try { const a = await dns.resolve4(h); a.forEach((ip) => ips.add(ip)); console.log(`     ${h} -> ${a.join(', ')}`); }
    catch { console.log(`     ${h} -> (no A record)`); }
  }

  // 3) Enrich each discovered IP via our PUBLIC endpoint (Shodan ports/hostnames + AbuseIPDB)
  console.log(`\n[ENRICH] ${ips.size} distinct IP(s) via DugganUSA public enrichment (Shodan + AbuseIPDB):`);
  for (const ip of ips) {
    try { const d = await enrich(ip); const s = d.sources || {};
      const ports = s.shodan?.ports?.join(',') || '—';
      const rev = s.shodan?.hostnames?.join(',') || s.abuseipdb?.hostnames?.join(',') || '—';
      console.log(`     ${ip} · ports [${ports}] · rev-dns [${rev}] · abuse ${s.abuseipdb?.abuseConfidenceScore ?? '?'}/100 · ${s.abuseipdb?.isp || '?'}`);
    } catch (e) { console.log(`     ${ip} · enrich error: ${e.message}`); }
  }

  console.log(`\n[LESSON for the OpenNHP threat model] Everything above came from public evidence`);
  console.log(`the packet-layer hiding does not govern. A hiding protocol should assume its origins`);
  console.log(`leak via CT + DNS + Shodan and pair with an L7 origin-validation control (host-shield).`);
}

if (require.main === module) {
  const domain = process.argv[2];
  if (!domain) { console.log('usage: node origin-recon.js <domain>   # public-evidence origin discovery (OpenNHP demo)'); process.exit(2); }
  main(domain).catch((e) => { console.error('error:', e.message); process.exit(1); });
}
