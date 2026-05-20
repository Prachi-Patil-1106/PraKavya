const express = require('express');
const cors = require('cors');
const { readAll, writeAll } = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

function nextId(poems) {
  return poems.length === 0 ? 1 : Math.max(...poems.map(p => p.id)) + 1;
}

function now() {
  return new Date().toISOString();
}

app.get('/api/poems', (req, res) => {
  let poems = readAll();
  const { category, tag } = req.query;
  if (category) poems = poems.filter(p => p.category === category);
  if (tag) poems = poems.filter(p => p.tags.includes(tag));
  poems.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  res.json(poems);
});

app.get('/api/poems/:id', (req, res) => {
  const poem = readAll().find(p => p.id === parseInt(req.params.id));
  if (!poem) return res.status(404).json({ error: 'Not found' });
  res.json(poem);
});

app.post('/api/poems', (req, res) => {
  const poems = readAll();
  const poem = {
    id: nextId(poems),
    title: req.body.title,
    content: req.body.content,
    category: req.body.category || 'kavita',
    tags: req.body.tags || [],
    language: req.body.language || 'mr',
    created_at: now(),
    updated_at: now(),
  };
  poems.push(poem);
  writeAll(poems);
  res.status(201).json(poem);
});

app.put('/api/poems/:id', (req, res) => {
  const poems = readAll();
  const idx = poems.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  poems[idx] = {
    ...poems[idx],
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    tags: req.body.tags || [],
    language: req.body.language,
    updated_at: now(),
  };
  writeAll(poems);
  res.status(200).json(poems[idx]);
});

app.delete('/api/poems/:id', (req, res) => {
  const poems = readAll().filter(p => p.id !== parseInt(req.params.id));
  writeAll(poems);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Prakavya server running on http://localhost:${PORT}`);
});
