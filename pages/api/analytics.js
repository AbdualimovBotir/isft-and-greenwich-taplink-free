import { sql } from '@vercel/postgres';

async function ensureTable() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS analytics (id SERIAL PRIMARY KEY, date DATE NOT NULL DEFAULT CURRENT_DATE, device TEXT NOT NULL DEFAULT 'unknown', browser TEXT NOT NULL DEFAULT 'unknown', country TEXT NOT NULL DEFAULT 'unknown', page TEXT NOT NULL DEFAULT '/', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);`;
  } catch(e){ console.warn('ensureTable:', e.message); }
}

function parseDevice(ua) {
  if (!ua) return 'unknown';
  if (/bot|crawl|spider/i.test(ua)) return 'bot';
  if (/iPad/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iPhone|iPod/i.test(ua)) return 'mobile';
  return 'desktop';
}

function parseBrowser(ua) {
  if (!ua) return 'unknown';
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/OPR\//i.test(ua)) return 'Opera';
  if (/Chrome\//i.test(ua)) return 'Chrome';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Safari\//i.test(ua)) return 'Safari';
  return 'Other';
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      if (!process.env.POSTGRES_URL) return res.status(200).json({ ok: true });
      await ensureTable();
      const ua = req.headers['user-agent'] || '';
      const device = parseDevice(ua);
      if (device === 'bot') return res.status(200).json({ ok: true });
      const browser = parseBrowser(ua);
      const page = req.body?.page || '/';
      const country = req.headers['x-vercel-ip-country'] || 'UZ';
      await sql`INSERT INTO analytics(date,device,browser,country,page) VALUES(CURRENT_DATE,${device},${browser},${country},${page})`;
      return res.status(200).json({ ok: true });
    } catch(e) { return res.status(200).json({ ok: true }); }
  }

  if (req.method === 'GET') {
    const adminPass = req.headers['x-admin-pass'];
    if (!adminPass) return res.status(401).json({ error: 'Unauthorized' });
    try {
      if (!process.env.POSTGRES_URL) return res.status(200).json({ total:0, today:0, week:0, devices:[], browsers:[], daily:[], countries:[], noDb:true });
      await ensureTable();
      const correctPass = process.env.ADMIN_PASSWORD || 'isft2026admin';
      if (adminPass !== correctPass) return res.status(401).json({ error: 'Wrong password' });
      const [{rows:[{count:total}]},{rows:[{count:today}]},{rows:[{count:week}]},{rows:devices},{rows:browsers},{rows:daily},{rows:countries}] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM analytics`,
        sql`SELECT COUNT(*) as count FROM analytics WHERE date=CURRENT_DATE`,
        sql`SELECT COUNT(*) as count FROM analytics WHERE date>=CURRENT_DATE-INTERVAL '7 days'`,
        sql`SELECT device,COUNT(*) as count FROM analytics GROUP BY device ORDER BY count DESC`,
        sql`SELECT browser,COUNT(*) as count FROM analytics GROUP BY browser ORDER BY count DESC`,
        sql`SELECT date::text,COUNT(*) as count FROM analytics WHERE date>=CURRENT_DATE-INTERVAL '30 days' GROUP BY date ORDER BY date DESC LIMIT 30`,
        sql`SELECT country,COUNT(*) as count FROM analytics GROUP BY country ORDER BY count DESC LIMIT 10`,
      ]);
      return res.status(200).json({ total:parseInt(total), today:parseInt(today), week:parseInt(week), devices, browsers, daily, countries });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
