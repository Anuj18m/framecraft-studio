console.log('MODULE LOADED');

import JSZip from 'npm:jszip';

// Edge-compatible Supabase function.
// Use Deno.env.get('VAR') in Supabase Edge; fall back to process.env for local testing.
const SUPABASE_URL = (typeof Deno !== 'undefined' && Deno?.env?.get) ? Deno.env.get('SUPABASE_URL') : process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = (typeof Deno !== 'undefined' && Deno?.env?.get) ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') : process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'gallery-images';

function fetchWithTimeout(input: string, init: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs);

  return fetch(input, {
    ...init,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
}

async function fetchShareByToken(token: string) {
  const url = `${SUPABASE_URL}/rest/v1/gallery_shares?share_token=eq.${encodeURIComponent(token)}&is_active=eq.true&select=*`;
  const res = await fetchWithTimeout(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY ?? '',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY ?? ''}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return (data && data.length > 0) ? data[0] : null;
}

async function fetchPhotosForGallery(galleryId: string) {
  const url = `${SUPABASE_URL}/rest/v1/photos?gallery_id=eq.${encodeURIComponent(galleryId)}&select=id,file_name,file_path`;
  const res = await fetchWithTimeout(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY ?? '',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY ?? ''}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) return [];
  return await res.json();
}

async function createSignedUrlForPath(path: string) {
  const signUrl = `${SUPABASE_URL}/storage/v1/object/sign/${encodeURIComponent(BUCKET)}/${path.split('/').map(segment => encodeURIComponent(segment)).join('/')}`;
  console.log('download-gallery-zip: signing path', path);
  const res = await fetchWithTimeout(signUrl, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY ?? '',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY ?? ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expires_in: 60 * 60 }),
  }, 15000);

  const bodyText = await res.text();
  console.log('download-gallery-zip: sign status', res.status);
  console.log('download-gallery-zip: sign body', bodyText);

  if (!res.ok) return null;

  let data: { signedURL?: string; signedUrl?: string } | null = null;
  try {
    data = JSON.parse(bodyText) as { signedURL?: string; signedUrl?: string };
  } catch {
    data = null;
  }

  return data?.signedURL ?? data?.signedUrl ?? null;
}

export default async function handler(req: Request) {
  try {
    console.log('HANDLER START');

    const url = new URL(req.url);
    const token = url.searchParams.get('token') || req.headers.get('x-share-token') || '';

    if (!token) {
      return new Response('Missing share token', { status: 400 });
    }

    const share = await fetchShareByToken(token);
    if (!share || !share.is_active) {
      return new Response('Share not found or inactive', { status: 404 });
    }

    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return new Response('Share expired', { status: 410 });
    }

    const photos = await fetchPhotosForGallery(share.gallery_id);
    console.log(`download-gallery-zip: gallery ${share.gallery_id} has ${photos.length} photo(s)`);

    const zip = new JSZip();

    for (const p of photos) {
      console.log(`download-gallery-zip: fetching ${p.file_name || p.id}`);
      const signed = await createSignedUrlForPath(p.file_path);
      if (!signed) continue;
      const signedUrl = signed.startsWith('http')
        ? signed
        : `${SUPABASE_URL}/storage/v1${signed}`;
      console.log('download-gallery-zip: signedUrl', signedUrl);
      const fileRes = await fetchWithTimeout(signedUrl, {}, 15000);
      if (!fileRes.ok) continue;
      const arrayBuffer = await fileRes.arrayBuffer();
      // JSZip accepts Uint8Array
      zip.file(p.file_name || `${p.id}.jpg`, new Uint8Array(arrayBuffer));
    }

    // Return full buffer for correctness-first validation (no streaming)
    console.log('download-gallery-zip: generating zip');
    const content = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
    console.log(`download-gallery-zip: zip generated (${content.length} bytes)`);

    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="gallery-${share.gallery_id}.zip"`);

    return new Response(content, { status: 200, headers });
  } catch (err) {
    console.error('download-gallery-zip error', err);
    return new Response('Internal server error', { status: 500 });
  }
}
