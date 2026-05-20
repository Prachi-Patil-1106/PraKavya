import { useState, useEffect, useRef, useCallback } from 'react';
import { CATEGORIES, LANGUAGES } from '../constants';

export default function PoemEditor({ poem, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'kavita',
    tags: '',
    language: 'mr',
  });
  const textareaRef = useRef(null);

  useEffect(() => {
    if (poem) {
      setForm({
        title: poem.title,
        content: poem.content,
        category: poem.category,
        tags: poem.tags.join(', '),
        language: poem.language || 'mr',
      });
    } else {
      setForm({ title: '', content: '', category: 'kavita', tags: '', language: 'mr' });
    }
  }, [poem]);

  useEffect(() => {
    resizeTextarea();
  }, [form.content]);

  // Keyboard shortcuts: Ctrl/Cmd+S to save, Escape to cancel
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      submitForm();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  }, [form, onCancel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function resizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function submitForm() {
    if (!form.title.trim() || !form.content.trim()) return;
    onSave({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    submitForm();
  }

  // Live stats
  const lines = form.content.split('\n').filter(l => l.trim()).length;
  const words = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  return (
    <div className="editor">
      <div className="editor-topbar">
        <span className="editor-label">{poem ? 'कविता संपादित करा' : 'नवी कविता'}</span>
        <div className="editor-actions">
          <button className="btn-secondary" onClick={onCancel}>रद्द करा</button>
          <button className="btn-primary" onClick={handleSubmit}>जतन करा ✓</button>
        </div>
      </div>

      <form className="editor-body" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-title"
          placeholder="कवितेचे शीर्षक..."
          value={form.title}
          onChange={e => set('title', e.target.value)}
          autoFocus
        />

        <div className="editor-meta-row">
          <select className="meta-select" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <select className="meta-select" value={form.language} onChange={e => set('language', e.target.value)}>
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>

          <input
            type="text"
            className="meta-tags"
            placeholder="टॅग्ज: प्रेम, निसर्ग, ..."
            value={form.tags}
            onChange={e => set('tags', e.target.value)}
          />
        </div>

        <textarea
          ref={textareaRef}
          className="editor-textarea"
          placeholder="इथे कविता लिहा..."
          value={form.content}
          onChange={e => { set('content', e.target.value); resizeTextarea(); }}
          spellCheck={false}
          rows={18}
        />

        {/* Live word/line count + shortcut hint */}
        <div className="editor-stats">
          <span className="editor-stat">{lines} ओळी</span>
          <span className="editor-stat">{words} शब्द</span>
          <span className="editor-hint">Ctrl+S — जतन करा &nbsp;·&nbsp; Esc — रद्द करा</span>
        </div>
      </form>
    </div>
  );
}
