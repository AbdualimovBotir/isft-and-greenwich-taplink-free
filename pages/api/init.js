import { getConfig, saveConfig, DEFAULT_CONFIG } from '../../lib/db';

export default async function handler(req, res) {
  if (req.query.secret !== process.env.INIT_SECRET)
    return res.status(403).json({ error: 'Forbidden' });
  try {
    const existing = await getConfig();
    if (!existing) await saveConfig(DEFAULT_CONFIG);
    return res.status(200).json({
      success: true,
      message: existing ? 'Config already exists.' : 'Default config saved!',
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
