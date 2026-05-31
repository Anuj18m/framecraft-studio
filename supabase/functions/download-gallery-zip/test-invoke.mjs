import fs from 'fs';
import { execSync } from 'child_process';

const FUNCTION_URL = process.env.FUNCTION_URL || process.argv[2];
const SHARE_TOKEN = process.env.SHARE_TOKEN || process.argv[3];
const OUTPUT = process.env.OUTPUT || 'gallery.zip';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!FUNCTION_URL) {
  console.error('Usage: FUNCTION_URL [SHARE_TOKEN]');
  process.exit(1);
}

async function fetchAndSave() {
  const url = FUNCTION_URL.includes('?')
    ? FUNCTION_URL
    : `${FUNCTION_URL}${SHARE_TOKEN ? `?token=${encodeURIComponent(SHARE_TOKEN)}` : ''}`;

  const headers = {};
  if (SHARE_TOKEN) headers['x-share-token'] = SHARE_TOKEN;

  console.log('Invoking function:', url);
  const res = await fetch(url, { headers });

  console.log('HTTP Status:', res.status);
  const contentType = res.headers.get('content-type') || '';
  console.log('Content-Type:', contentType);

  const buffer = await res.arrayBuffer();
  const buf = Buffer.from(buffer);
  fs.writeFileSync(OUTPUT, buf);
  const zipped = fs.existsSync(OUTPUT) && fs.statSync(OUTPUT).size > 0;
  console.log('ZIP Downloaded:', zipped ? 'Yes' : 'No');

  let photoCount = 0;
  if (zipped && (contentType.includes('zip') || OUTPUT.endsWith('.zip'))) {
    // Try adm-zip first
    try {
      const AdmZip = await import('adm-zip');
      const zip = new AdmZip.default(OUTPUT);
      const entries = zip.getEntries().filter(e => !e.isDirectory);
      photoCount = entries.length;
      console.log('Photo Count In ZIP:', photoCount);
    } catch (e) {
      // Fallback to PowerShell (Windows)
      try {
        const tmpDir = 'tmp_zip_extract';
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
        const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${OUTPUT}' -DestinationPath '${tmpDir}' -Force; (Get-ChildItem -Path '${tmpDir}' -Recurse -File).Count"`;
        const out = execSync(cmd, { encoding: 'utf8' }).trim();
        photoCount = parseInt(out, 10) || 0;
        console.log('Photo Count In ZIP (PowerShell):', photoCount);
        // cleanup
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
      } catch (err) {
        console.warn('Failed to inspect ZIP contents:', err.message || err);
      }
    }
  }

  // Optionally check gallery_download_events if credentials provided
  let eventRecorded = 'Unknown';
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && SHARE_TOKEN) {
    try {
      const shareRes = await fetch(`${SUPABASE_URL}/rest/v1/gallery_shares?share_token=eq.${encodeURIComponent(SHARE_TOKEN)}&is_active=eq.true&select=*`, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Accept: 'application/json',
        },
      });
      if (shareRes.ok) {
        const shares = await shareRes.json();
        const share = shares && shares[0];
        if (share && share.id) {
          const eventsRes = await fetch(`${SUPABASE_URL}/rest/v1/gallery_download_events?gallery_share_id=eq.${encodeURIComponent(share.id)}&select=*&order=downloaded_at.desc&limit=1`, {
            headers: {
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              Accept: 'application/json',
            },
          });
          if (eventsRes.ok) {
            const events = await eventsRes.json();
            eventRecorded = (events && events.length > 0) ? 'Yes' : 'No';
            console.log('Event Recorded:', eventRecorded === 'Yes' ? 'Yes' : 'No');
          } else {
            eventRecorded = `QueryFailed:${eventsRes.status}`;
          }
        } else {
          eventRecorded = 'ShareNotFound';
        }
      } else {
        eventRecorded = `ShareQueryFailed:${shareRes.status}`;
      }
    } catch (err) {
      eventRecorded = `Error:${err.message || err}`;
    }
  }

  // Print compact output block as requested
  console.log('\n## Function Invoked');
  console.log(FUNCTION_URL);
  console.log('## HTTP Status');
  console.log(res.status);
  console.log('## Content-Type');
  console.log(contentType || 'unknown');
  console.log('## ZIP Downloaded (Yes/No)');
  console.log(zipped ? 'Yes' : 'No');
  console.log('## Photo Count In ZIP');
  console.log(photoCount);
  console.log('## Event Recorded (Yes/No)');
  console.log(eventRecorded === true ? 'Yes' : eventRecorded);
  console.log('## Exact Failure Point');
  if (!SHARE_TOKEN) console.log('Missing SHARE_TOKEN');
  else if (!zipped) console.log('No ZIP content received');
  else if (eventRecorded === 'No') console.log('Event not recorded by function (not implemented)');
  else console.log('-');
}

await fetchAndSave();
