#!/usr/bin/env node
/**
 * enrich.js — live multi-source IP enrichment against DugganUSA's PUBLIC API. No key required.
 *
 * Contributed by DugganUSA LLC to the IETF 126 Hackathon. Runnable by anyone — this is the
 * "testable with our data" surface: our threat-intel enrichment endpoint is public (no auth),
 * so a hackathon participant can validate any IP against our live Shodan + AbuseIPDB + feed
 * correlation in one call.
 *
 *   node enrich.js 45.131.66.106      # a real JADEPUFFER/ENCFORGE C2 (see agent-security-benchmark)
 *   node enrich.js <any-ip>
 *
 * Endpoint: GET https://analytics.dugganusa.com/api/v1/threat-intel/enrichment?ip=<ip>  (PUBLIC)
 * Used by the OpenNHP origin-recon demo (../network-infrastructure-hiding-nhp) as the Shodan/
 * hostname source, and by the agent-security-benchmark to resolve a vector's live indicators.
 */

'use strict';
const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'dugganusa-ietf-recon' }, timeout: 20000 }, (res) => {
      let d = ''; res.on('data', (c) => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, json: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, json: null }); } });
    }).on('error', reject).on('timeout', function () { this.destroy(); reject(new Error('timeout')); });
  });
}

async function enrich(ip) {
  const r = await get(`https://analytics.dugganusa.com/api/v1/threat-intel/enrichment?ip=${encodeURIComponent(ip)}`);
  if (r.status !== 200 || !r.json || !r.json.success) throw new Error(`enrichment failed (HTTP ${r.status})`);
  return r.json.data;
}

function summarize(d) {
  const s = d.sources || {};
  const out = [`\n=== DugganUSA enrichment · ${d.indicator} (${d.type}) · ${d.timestamp} ===`];
  if (s.shodan) out.push(`  Shodan (${s.shodan.source}): ${s.shodan.found ? 'FOUND' : 'not found'}` +
    (s.shodan.ports?.length ? ` · ports [${s.shodan.ports.join(', ')}]` : '') +
    (s.shodan.hostnames?.length ? ` · hostnames [${s.shodan.hostnames.join(', ')}]` : '') +
    (s.shodan.vulns?.length ? ` · vulns [${s.shodan.vulns.join(', ')}]` : '') +
    (s.shodan.tags?.length ? ` · tags [${s.shodan.tags.join(', ')}]` : ''));
  if (s.abuseipdb) out.push(`  AbuseIPDB: score ${s.abuseipdb.abuseConfidenceScore}/100 · ${s.abuseipdb.countryName} · ${s.abuseipdb.isp}` +
    ` · ${s.abuseipdb.usageType} · ${s.abuseipdb.totalReports} reports` + (s.abuseipdb.isTor ? ' · TOR' : ''));
  for (const [k, v] of Object.entries(s)) {
    if (['shodan', 'abuseipdb'].includes(k)) continue;
    const found = v && (v.found || v.malicious || v.listed || v.matches || v.detections);
    out.push(`  ${k}: ${found ? JSON.stringify(found) : (v && v.error ? 'n/a' : 'clean/no-data')}`);
  }
  return out.join('\n');
}

if (require.main === module) {
  const ip = process.argv[2];
  if (!ip) { console.log('usage: node enrich.js <ip>\n  try: node enrich.js 45.131.66.106  (a real JADEPUFFER/ENCFORGE C2)'); process.exit(2); }
  enrich(ip).then((d) => console.log(summarize(d)))
    .catch((e) => { console.error('error:', e.message); process.exit(1); });
}

module.exports = { enrich };
