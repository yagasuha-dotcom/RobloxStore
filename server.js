const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// PRODUCTS
app.get('/api/products', async (req, res) => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.post('/api/products', async (req, res) => {
  const { data, error } = await supabase.from('products').insert([req.body]).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.put('/api/products/:id', async (req, res) => {
  const { data, error } = await supabase.from('products').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.delete('/api/products/:id', async (req, res) => {
  const { error } = await supabase.from('products').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ message: error.message });
  res.json({ success: true });
});

// PROMOS
app.get('/api/promos', async (req, res) => {
  const { data, error } = await supabase.from('promo_codes').select('*');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.post('/api/promos', async (req, res) => {
  const { data, error } = await supabase.from('promo_codes').insert([req.body]).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.put('/api/promos/:id', async (req, res) => {
  const { data, error } = await supabase.from('promo_codes').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.delete('/api/promos/:id', async (req, res) => {
  const { error } = await supabase.from('promo_codes').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ message: error.message });
  res.json({ success: true });
});

app.post('/api/promo/check', async (req, res) => {
  const { code } = req.body;
  const { data, error } = await supabase.from('promo_codes').select('*').eq('code', code.toUpperCase()).eq('is_active', true).single();
  if (error || !data) return res.json({ valid: false, message: 'Kode tidak valid' });
  res.json({ valid: true, code: data.code, type: data.type, value: data.value });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server jalan di port ' + PORT));
