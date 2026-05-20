import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PoemEditor from './components/PoemEditor';
import PoemViewer from './components/PoemViewer';
import Welcome from './components/Welcome';

const API = '/api';

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
    fetchPoems();
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

  async function fetchPoems() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.category) params.set('category', filter.category);
    if (filter.tag) params.set('tag', filter.tag);
    const res = await fetch(`${API}/poems?${params}`);
    const data = await res.json();
    setAllPoems(data);
    setPoems(data);
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

  async function handleSavePoem(data) {
    if (selectedPoem?.id) {
      const res = await fetch(`${API}/poems/${selectedPoem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setSelectedPoem(updated);
      setView('viewer');
    } else {
      const res = await fetch(`${API}/poems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const created = await res.json();
      setSelectedPoem(created);
      setView('viewer');
    }
    fetchPoems();
  }

  async function handleDeletePoem(id) {
    if (!window.confirm('हि कविता कायमची हटवायची का?')) return;
    await fetch(`${API}/poems/${id}`, { method: 'DELETE' });
    setSelectedPoem(null);
    setView('welcome');
    fetchPoems();
  }

  function handleCancel() {
    if (selectedPoem?.id) {
      setView('viewer');
    } else {
      setView('welcome');
    }
  }

  return (
    <div className="app">
      {/* SVG filter for parchment torn-edge effect — applied only to the background layer */}
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
      />
      <main className="main">
        {view === 'welcome' && <Welcome onNew={handleNewPoem} count={allPoems.length} />}
        {view === 'editor' && (
          <PoemEditor
            poem={view === 'editor' ? selectedPoem : null}
            onSave={handleSavePoem}
            onCancel={handleCancel}
          />
        )}
        {view === 'viewer' && selectedPoem && (
          <PoemViewer
            poem={selectedPoem}
            onEdit={() => { setView('editor'); }}
            onDelete={() => handleDeletePoem(selectedPoem.id)}
          />
        )}
      </main>
    </div>
  );
}
