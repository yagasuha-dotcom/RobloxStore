const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve index.html & admin.html dari folder public

// ── ENV ──
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const JWT_SECRET   = process.env.JWT_SECRET || 'robloxstore_secret_2025';
const ADMIN_USER   = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS   = process.env.ADMIN_PASSWORD || 'admin123';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── MIDDLEWARE AUTH ──
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Token tidak ada' });
  try {
    const token = header.split(' ')[1];
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token tidak valid' });
  }
}

// ════════════════════════════════
//  PUBLIC ROUTES
// ════════════════════════════════

// GET semua produk
app.get('/api/products', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// GET semua promo aktif (public)
app.get('/api/promos', async (req, res) => {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// POST cek kode promo
app.post('/api/promo/check', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ valid: false, message: 'Kode kosong' });

  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !data) return res.json({ valid: false, message: 'Kode tidak valid atau sudah tidak aktif' });
  res.json({ valid: true, code: data.code, type: data.type, value: data.value });
});

// ════════════════════════════════
//  ADMIN AUTH
// ════════════════════════════════

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Username atau password salah' });
  }
});

// ════════════════════════════════
//  ADMIN PRODUCTS (protected)
// ════════════════════════════════

// POST tambah produk
app.post('/api/products', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('products').insert([req.body]).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// PUT edit produk
app.put('/api/products/:id', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('products').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// DELETE produk
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  const { error } = await supabase.from('products').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ message: error.message });
  res.json({ success: true });
});

// ════════════════════════════════
//  ADMIN PROMOS (protected)
// ════════════════════════════════

// POST tambah promo
app.post('/api/promos', authMiddleware, async (req, res) => {
  const { data, error } = await supabase.from('promo_codes').insert([req.body]).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// PUT edit promo
app.put('/api/promos/:id', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('promo_codes').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// DELETE promo
app.delete('/api/promos/:id', authMiddleware, async (req, res) => {
  const { error } = await supabase.from('promo_codes').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ message: error.message });
  res.json({ success: true });
});

// ── START ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
