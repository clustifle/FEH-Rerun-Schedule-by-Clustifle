import { env } from 'cloudflare:workers';
export function database() { if (!env.DB) throw new Error('Schedule storage unavailable'); return env.DB; }
export function portraits() { if (!env.BUCKET) throw new Error('Portrait storage unavailable'); return env.BUCKET; }
