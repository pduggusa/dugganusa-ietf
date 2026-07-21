#!/usr/bin/env node
/**
 * served-vs-issued-monitor.js — a second, independent freshness signal for BRAID Phase 0.
 *
 * Contributed by DugganUSA LLC to the IETF 126 Hackathon (project: BRAID Phase 0 —
 * Structural Revocation, draft-davey-tls-braid). Not an IETF work product.
 *
 * BRAID Phase 0 answers: "is the credential this endpoint serves the one its OWNER currently
 * authorizes?" (observed vs DNSSEC-signed _braid Anchor). This monitor answers the adjacent
 * question from public evidence: "is the credential this endpoint serves the NEWEST one that
 * was ISSUED for it?" (served vs Certificate Transparency). The two compose — owner-authority
 * and issuance-recency are independent freshness axes, and a gap in either is worth an alarm.
 *
 * WHY WE HAVE THIS: on 2026-07-19 the *.actions.githubusercontent.com wildcard expired and
 * dropped every self-hosted GitHub Actions runner worldwide. CT logs showed NO certificate was
 * issued during the incident — valid replacements had been issued for 31 days and never
 * deployed. The renewal automation worked; the ROLLOUT silently didn't, and nothing compared
 * issued-vs-served. That is the exact class of "a certificate outlived its authorization/
 * intended replacement and nobody noticed" failure BRAID makes structural. This monitor is the
 * CT-based detector we built in response; we offer it as a companion signal and a worked case.
 *
 * verdict(servedNotBefore, newestIssued, daysLeft) is pure and testable. The signal that
 * matters is DRIFT + IMMINENT EXPIRY together (a newer cert exists AND the served one is
 * running out) — drift alone is normal on CDNs that keep overlapping cert packs, so drift on a
 * cert with months of runway is not an alarm. Learned by shipping the naive version first.
 *
 * Self-test: node served-vs-issued-monitor.js --selftest
 * Live check: node served-vs-issued-monitor.js <host>   (reads served cert; CT via Cert Spotter)
 */

'use strict';
const tls = require('tls');
const https = require('https');

const GRACE_DAYS = 7;    // a fresh cert legitimately takes time to roll out
const ALARM_DAYS = 21;   // ...but a newer cert unused THIS close to expiry is the failure shape

// Pure verdict — BRAID-style status vocabulary, aligned to authorized/mismatch/stale/unknown.
function verdict(servedNotBefore, newestIssued, daysLeft) {
  if (newestIssued == null) return { status: 'unknown', reason: 'CT unavailable' };
  if (servedNotBefore == null) return { status: 'unknown', reason: 'served notBefore unreadable' };
  const driftDays = Math.floor((new Date(newestIssued) - new Date(servedNotBefore)) / 86400000);
  if (daysLeft != null && daysLeft < 0) return { status: 'stale', driftDays, reason: 'served certificate expired' };
  if (driftDays <= GRACE_DAYS) return { status: 'authorized', driftDays, reason: 'serving newest issued (within rollout grace)' };
  if (daysLeft != null && daysLeft <= ALARM_DAYS)
    return { status: 'mismatch', driftDays, reason: `${driftDays}d-newer cert exists and served one expires in ${daysLeft}d (rollout stalled)` };
  return { status: 'authorized', driftDays, note: `newer cert available (+${driftDays}d) — ample runway, informational` };
}

// --- live helpers (best-effort; the verdict logic above is the contribution) ---------
function servedCert(host) {
  return new Promise((resolve) => {
    // rejectUnauthorized:false is DELIBERATE and read-only: a monitor whose job is to report
    // expired/stale/untrusted certs must be able to READ one, not fail the handshake and hide
    // the reason. We complete the handshake, read certificate METADATA, and hang up — no byte
    // is ever written to this socket and no response body is read, so there is nothing to MITM.
    const s = tls.connect({ host, port: 443, servername: host, rejectUnauthorized: false, timeout: 10000 }, () => {
      const c = s.getPeerCertificate(false); s.destroy();
      if (!c || !c.valid_to) return resolve(null);
      resolve({ notBefore: c.valid_from ? new Date(c.valid_from).toISOString() : null,
        daysLeft: Math.floor((new Date(c.valid_to) - Date.now()) / 86400000) });
    });
    s.on('error', () => resolve(null)); s.on('timeout', () => { s.destroy(); resolve(null); });
  });
}
function newestIssued(host) {
  const domain = host.split('.').slice(-2).join('.');
  return new Promise((resolve) => {
    const req = https.request({ hostname: 'api.certspotter.com',
      path: `/v1/issuances?domain=${encodeURIComponent(domain)}&include_subdomains=true&expand=dns_names`,
      headers: { 'User-Agent': 'dugganusa-braid-companion' }, timeout: 10000 }, (res) => {
      let d = ''; res.on('data', (c) => d += c);
      res.on('end', () => { try { const j = JSON.parse(d);
        if (!Array.isArray(j)) return resolve(null);
        const mine = j.filter((c) => (c.dns_names || []).some((n) => n === host || (n.startsWith('*.') && host.endsWith(n.slice(1)))));
        if (!mine.length) return resolve(null);
        mine.sort((a, b) => new Date(b.not_before) - new Date(a.not_before));
        resolve(new Date(mine[0].not_before).toISOString());
      } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null)); req.on('timeout', () => { req.destroy(); resolve(null); }); req.end();
  });
}

function selftest() {
  const iso = (d) => new Date(d).toISOString();
  const cases = [
    // GitHub incident as it stood 14 days before: Apr-20 cert with 14d left, Jun-18 cert issued & unused.
    ['GitHub shape (newer cert + imminent expiry)', verdict(iso('2026-04-20'), iso('2026-06-18'), 14), 'mismatch'],
    ['CDN overlapping packs (drift, ample runway)', verdict(iso('2026-06-07'), iso('2026-07-17'), 47), 'authorized'],
    ['within rollout grace (3d drift)', verdict(iso('2026-07-01'), iso('2026-07-04'), 60), 'authorized'],
    ['already expired', verdict(iso('2026-04-20'), iso('2026-06-18'), -1), 'stale'],
    ['CT unavailable', verdict(iso('2026-04-20'), null, 5), 'unknown'],
  ];
  let pass = 0, fail = 0;
  for (const [label, v, expect] of cases) {
    const ok = v.status === expect;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label} -> ${v.status} (${v.reason || v.note})`);
    ok ? pass++ : fail++;
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

if (require.main === module) {
  if (process.argv.includes('--selftest')) selftest();
  else if (process.argv[2]) {
    const host = process.argv[2];
    Promise.all([servedCert(host), newestIssued(host)]).then(([s, i]) => {
      console.log(host, JSON.stringify(verdict(s && s.notBefore, i, s && s.daysLeft), null, 2));
    });
  } else console.log('usage: served-vs-issued-monitor.js <host> | --selftest');
}

module.exports = { verdict, GRACE_DAYS, ALARM_DAYS };
