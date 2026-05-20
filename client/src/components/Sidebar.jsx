import { CATEGORIES } from '../constants';

const THEMES = [
  { id: 'manuscript', label: 'हस्तलिखित', swatch: '#c8a850', border: '#8a6820' },
  { id: 'ratri',      label: 'रात्री',    swatch: '#2a1860', border: '#a060d0' },
  { id: 'keshari',    label: 'केशरी',    swatch: '#c85a08', border: '#f0c060' },
  { id: 'shyam',      label: 'श्याम',    swatch: '#0c1440', border: '#c8a020' },
];

export default function Sidebar({ poems, selectedId, onSelect, onNew, filter, setFilter, loading, totalCount, theme, setTheme, onExport, onImport, user, onSignOut }) {
  const allTags = [...new Set(poems.flatMap(p => p.tags))].filter(Boolean).sort();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="app-brand">
          <span className="brand-dev">प्राकाव्य</span>
          <span className="brand-en">Prakavya</span>
        </div>
        <button className="btn-new" onClick={onNew}>+ नवी कविता</button>

        {user && (
          <div className="sidebar-user">
            {user.photoURL && <img src={user.photoURL} className="user-avatar" referrerPolicy="no-referrer" alt="" />}
            <span className="user-name">{user.displayName?.split(' ')[0]}</span>
            <button className="btn-signout" onClick={onSignOut} title="बाहेर पडा">⏏</button>
          </div>
        )}
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          className="search-input"
          placeholder="शोधा..."
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
        />
      </div>

      <div className="sidebar-filters">
        <select
          className="filter-select"
          value={filter.category}
          onChange={e => setFilter(f => ({ ...f, category: e.target.value, tag: '' }))}
        >
          <option value="">सर्व प्रकार</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        {allTags.length > 0 && (
          <div className="tag-chips">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`tag-chip ${filter.tag === tag ? 'active' : ''}`}
                onClick={() => setFilter(f => ({ ...f, tag: f.tag === tag ? '' : tag }))}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="poem-list">
        {loading ? (
          <div className="list-empty">...</div>
        ) : poems.length === 0 ? (
          <div className="list-empty">
            {totalCount === 0 ? 'अजून कोणतीही कविता नाही' : 'काहीही सापडले नाही'}
          </div>
        ) : (
          poems.map(poem => (
            <PoemCard
              key={poem.id}
              poem={poem}
              selected={poem.id === selectedId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <div className="theme-picker">
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`theme-swatch ${theme === t.id ? 'active' : ''}`}
              style={{ background: t.swatch, '--ring': t.border }}
              title={t.label}
              onClick={() => setTheme(t.id)}
              aria-label={t.label}
            />
          ))}
        </div>

        <div className="footer-actions">
          <button className="footer-btn" title="कविता export करा" onClick={onExport}>↓</button>
          <label className="footer-btn" title="कविता import करा" style={{ cursor: 'pointer' }}>
            ↑
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files[0]) onImport(e.target.files[0]); e.target.value = ''; }}
            />
          </label>
        </div>

        {totalCount > 0 && <span className="poem-count">{totalCount} कविता</span>}
      </div>
    </aside>
  );
}

function PoemCard({ poem, selected, onSelect }) {
  const category = CATEGORIES.find(c => c.value === poem.category);
  const firstLine = poem.content.split('\n').find(l => l.trim()) || '';
  const preview = firstLine.slice(0, 70);

  return (
    <div className={`poem-card ${selected ? 'selected' : ''}`} onClick={() => onSelect(poem)}>
      <div className="card-header">
        <span className="card-title">{poem.title}</span>
        <span className="card-cat" style={{ color: category?.color }}>{category?.label}</span>
      </div>
      {preview && <div className="card-preview">{preview}</div>}
      {poem.tags.length > 0 && (
        <div className="card-tags">
          {poem.tags.slice(0, 3).map(t => (
            <span key={t} className="card-tag">#{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
