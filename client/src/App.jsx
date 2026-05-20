import { useState, useEffect } from 'react';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp, writeBatch, Timestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebase';

import Sidebar    from './components/Sidebar';
import PoemEditor from './components/PoemEditor';
import PoemViewer from './components/PoemViewer';
import Welcome    from './components/Welcome';
import Login      from './components/Login';

// ── Firestore helpers ──────────────────────────────────────────
function poemsCol(uid) {
  return collection(db, 'users', uid, 'poems');
}

function docToPoem(d) {
  const data = d.data();
  return {
    id:         d.id,
    title:      data.title    || '',
    content:    data.content  || '',
    category:   data.category || 'kavita',
    tags:       data.tags     || [],
    language:   data.language || 'mr',
    created_at: data.created_at?.toDate?.().toISOString() ?? new Date().toISOString(),
    updated_at: data.updated_at?.toDate?.().toISOString() ?? new Date().toISOString(),
  };
}

// ── App ────────────────────────────────────────────────────────
export default function App() {
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [poems,    setPoems]    = useState([]);
  const [allPoems, setAllPoems] = useState([]);
  const [view,     setView]     = useState('welcome');
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState({ category: '', tag: '', search: '' });
  const [loading,  setLoading]  = useState(false);

  const [theme, setTheme] = useState(
    () => localStorage.getItem('prakavya-theme') || 'manuscript'
  );

  // Theme persistence
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('prakavya-theme', theme);
  }, [theme]);

  // Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  // Load poems when user or category/tag filter changes
  useEffect(() => {
    if (user) refreshPoems();
  }, [user, filter.category, filter.tag]);

  // Client-side search filter
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

  // ── Firestore CRUD ───────────────────────────────────────────
  async function refreshPoems() {
    setLoading(true);
    try {
      const snap = await getDocs(query(poemsCol(user.uid), orderBy('updated_at', 'desc')));
      let all = snap.docs.map(docToPoem);
      if (filter.category) all = all.filter(p => p.category === filter.category);
      if (filter.tag)      all = all.filter(p => p.tags.includes(filter.tag));
      setAllPoems(all);
      setPoems(all);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePoem(data) {
    if (selected?.id) {
      await updateDoc(doc(db, 'users', user.uid, 'poems', selected.id), {
        ...data, updated_at: serverTimestamp(),
      });
      const updated = { ...selected, ...data, updated_at: new Date().toISOString() };
      setSelected(updated);
    } else {
      const ref = await addDoc(poemsCol(user.uid), {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      setSelected({
        id: ref.id, ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setView('viewer');
    refreshPoems();
  }

  async function handleDeletePoem(id) {
    if (!window.confirm('हि कविता कायमची हटवायची का?')) return;
    await deleteDoc(doc(db, 'users', user.uid, 'poems', id));
    setSelected(null);
    setView('welcome');
    refreshPoems();
  }

  // ── Export / Import ──────────────────────────────────────────
  async function handleExport() {
    const snap  = await getDocs(poemsCol(user.uid));
    const poems = snap.docs.map(docToPoem);
    const blob  = new Blob([JSON.stringify(poems, null, 2)], { type: 'application/json' });
    const url   = URL.createObjectURL(blob);
    const a     = Object.assign(document.createElement('a'), {
      href: url, download: `prakavya-${new Date().toISOString().slice(0, 10)}.json`,
    });
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error();
        const batch = writeBatch(db);
        imported.forEach(({ id: _id, created_at, updated_at, ...data }) => {
          batch.set(doc(poemsCol(user.uid)), {
            ...data,
            created_at: Timestamp.fromDate(new Date(created_at || Date.now())),
            updated_at: Timestamp.fromDate(new Date(updated_at || Date.now())),
          });
        });
        await batch.commit();
        setSelected(null);
        setView('welcome');
        refreshPoems();
      } catch {
        alert('अवैध फाईल — valid Prakavya JSON file निवडा.');
      }
    };
    reader.readAsText(file);
  }

  function handleSignOut() {
    signOut(auth);
    setSelected(null);
    setView('welcome');
    setAllPoems([]);
    setPoems([]);
  }

  // ── Render ───────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="app-loading">
        <span className="app-loading-sym">ॐ</span>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="app">
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
        selectedId={selected?.id}
        onSelect={p => { setSelected(p); setView('viewer'); }}
        onNew={() => { setSelected(null); setView('editor'); }}
        filter={filter}
        setFilter={setFilter}
        loading={loading}
        totalCount={allPoems.length}
        theme={theme}
        setTheme={setTheme}
        onExport={handleExport}
        onImport={handleImport}
        user={user}
        onSignOut={handleSignOut}
      />

      <main className="main">
        {view === 'welcome' && <Welcome onNew={() => { setSelected(null); setView('editor'); }} count={allPoems.length} />}
        {view === 'editor'  && (
          <PoemEditor
            poem={selected}
            onSave={handleSavePoem}
            onCancel={() => setView(selected?.id ? 'viewer' : 'welcome')}
          />
        )}
        {view === 'viewer' && selected && (
          <PoemViewer
            poem={selected}
            onEdit={() => setView('editor')}
            onDelete={() => handleDeletePoem(selected.id)}
          />
        )}
      </main>
    </div>
  );
}
