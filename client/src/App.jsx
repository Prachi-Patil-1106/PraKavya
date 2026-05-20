import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PoemEditor from './components/PoemEditor';
import PoemViewer from './components/PoemViewer';
import Welcome from './components/Welcome';

const STORAGE_KEY = 'prakavya-poems';

function loadPoems() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function savePoems(poems) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(poems));
}

function nextId(poems) {
  return poems.length === 0 ? 1 : Math.max(...poems.map(p => p.id)) + 1;
}

function now() { return new Date().toISOString(); }

export default function App() {
  const [poems, setPoems] = useState([]);
  const [allPoems, setAllPoems] = useState([]);
  const [view, setView] = useState('welcome');
  const [selectedPoem, setSelectedPoem] = useState(null);
  const [filter, setFilter] = useState({ category: '', tag: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('prakavya-theme') || 'manuscript');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('prakavya-theme', theme);
  }, [theme]);

  useEffect(() => {
    refreshPoems();
  }, [filter.category, filter.tag]);

  useEffect(() => {
    if (!filter.search.trim()) {
      setPoems(allPoems);
    } else {
      const q = filter.search.toLowerCase();
      setPoems(allPoems.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      ));
    }
  }, [filter.search, allPoems]);

  function refreshPoems() {
    setLoading(true);
    let all = loadPoems();
    if (filter.category) all = all.filter(p => p.category === filter.category);
    if (filter.tag)      all = all.filter(p => p.tags.includes(filter.tag));
    all.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    setAllPoems(all);
    setPoems(all);
    setLoading(false);
  }

  function handleSelectPoem(poem) {
    setSelectedPoem(poem);
    setView('viewer');
  }

  function handleNewPoem() {
    setSelectedPoem(null);
    setView('editor');
  }

  function handleSavePoem(data) {
    const poems = loadPoems();
    if (selectedPoem?.id) {
      const idx = poems.findIndex(p => p.id === selectedPoem.id);
      poems[idx] = { ...poems[idx], ...data, updated_at: now() };
      savePoems(poems);
      setSelectedPoem(poems[idx]);
    } else {
      const poem = { id: nextId(poems), ...data, created_at: now(), updated_at: now() };
      poems.push(poem);
      savePoems(poems);
      setSelectedPoem(poem);
    }
    setView('viewer');
    refreshPoems();
  }

  function handleDeletePoem(id) {
    if (!window.confirm('हि कविता कायमची हटवायची का?')) return;
    savePoems(loadPoems().filter(p => p.id !== id));
    setSelectedPoem(null);
    setView('welcome');
    refreshPoems();
  }

  function handleCancel() {
    setView(selectedPoem?.id ? 'viewer' : 'welcome');
  }

  function handleExport() {
    const poems = loadPoems();
    const blob = new Blob([JSON.stringify(poems, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `prakavya-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error();
        savePoems(imported);
        setSelectedPoem(null);
        setView('welcome');
        refreshPoems();
      } catch {
        alert('अवैध फाईल — valid Prakavya JSON file निवडा.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="app">
      {/* SVG filter for parchment torn-edge effect */}
      <svg style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="parchment-torn" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.032 0.048" numOctaves="4" seed="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <Sidebar
        poems={poems}
        selectedId={selectedPoem?.id}
        onSelect={handleSelectPoem}
        onNew={handleNewPoem}
        filter={filter}
        setFilter={setFilter}
        loading={loading}
        totalCount={allPoems.length}
        theme={theme}
        setTheme={setTheme}
        onExport={handleExport}
        onImport={handleImport}
      />
      <main className="main">
        {view === 'welcome' && <Welcome onNew={handleNewPoem} count={allPoems.length} />}
        {view === 'editor' && (
          <PoemEditor
            poem={selectedPoem}
            onSave={handleSavePoem}
            onCancel={handleCancel}
          />
        )}
        {view === 'viewer' && selectedPoem && (
          <PoemViewer
            poem={selectedPoem}
            onEdit={() => setView('editor')}
            onDelete={() => handleDeletePoem(selectedPoem.id)}
          />
        )}
      </main>
    </div>
  );
}
