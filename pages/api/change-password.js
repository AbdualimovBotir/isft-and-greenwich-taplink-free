import { getPassword, savePassword } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Ikkala maydon ham to'ldirilishi kerak" });
    let correctPass = 'isft2026admin';
    try { correctPass = await getPassword(); } catch {
      correctPass = process.env.ADMIN_PASSWORD || 'isft2026admin';
    }
    if (currentPassword !== correctPass)
      return res.status(401).json({ error: "Joriy parol noto'g'ri" });
    if (newPassword.length < 6)
      return res.status(400).json({ error: "Kamida 6 ta belgi bo'lishi kerak" });
    await savePassword(newPassword);
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
