import { getConfig, saveConfig, getPassword, DEFAULT_CONFIG } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const cfg = await getConfig();
      return res.status(200).json(cfg || DEFAULT_CONFIG);
    } catch { return res.status(200).json(DEFAULT_CONFIG); }
  }
  if (req.method === 'POST') {
    try {
      const { password, ...newData } = req.body || {};
      let correctPass = 'isft2026admin';
      try { correctPass = await getPassword(); } catch {
        correctPass = process.env.ADMIN_PASSWORD || 'isft2026admin';
      }
      if (!password || password !== correctPass)
        return res.status(401).json({ error: "Parol noto'g'ri!" });
      if (Object.keys(newData).length === 0)
        return res.status(200).json({ success: true });
      const existing = (await getConfig()) || DEFAULT_CONFIG;
      await saveConfig({ ...existing, ...newData });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
