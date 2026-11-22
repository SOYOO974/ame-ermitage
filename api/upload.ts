// Photo d'une question : le navigateur l'a déjà réduite en WebP (1200 px max), on la range dans Vercel Blob.
import { put } from '@vercel/blob';
import { randomBytes } from 'node:crypto';
import { currentAdmin, fail, json } from './_lib.js';

const MAX_BYTES = 3 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await currentAdmin(request))) return fail('Non connecté', 401);
  const type = request.headers.get('content-type') ?? '';
  if (!/^image\/(webp|jpeg|png)$/.test(type)) return fail('Format de photo non accepté.');
  const data = await request.arrayBuffer();
  if (!data.byteLength || data.byteLength > MAX_BYTES) return fail('Photo trop lourde (3 Mo maximum).');
  const ext = type.split('/')[1].replace('jpeg', 'jpg');
  const blob = await put(`questions/${randomBytes(8).toString('hex')}.${ext}`, data, { access: 'public', contentType: type });
  return json({ url: blob.url }, 201);
}
