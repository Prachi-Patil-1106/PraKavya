import { useState } from 'react';
import { CATEGORIES } from '../constants';

export default function PoemViewer({ poem, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);
  const category = CATEGORIES.find(c => c.value === poem.category);

  const dateStr = (() => {
    try {
      return new Date(poem.created_at).toLocaleDateString('mr-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch {
      return poem.created_at?.slice(0, 10) || '';
    }
  })();

  // Reading time: ~100 Devanagari words/minute
  const wordCount = poem.content.trim().split(/\s+/).length;
  const readMins = Math.max(1, Math.round(wordCount / 100));
  const readLabel = readMins === 1 ? '१ मिनिट वाचन' : `${readMins} मिनिटे वाचन`;

  async function copyPoem() {
    const text = `${poem.title}\n${'—'.repeat(20)}\n\n${poem.content}\n\n॥ प्राकाव्य ॥`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const lines = poem.content.split('\n');
  // Stagger delay capped at 30 lines so long poems don't feel sluggish
  const delay = (i) => `${Math.min(i, 30) * 0.04}s`;

  return (
    <article className="viewer">
      <div className="viewer-topbar">
        <div className="viewer-extra">
          <span className="reading-time">{readLabel}</span>
          <button className={`btn-copy ${copied ? 'copied' : ''}`} onClick={copyPoem}>
            {copied ? '✓ कॉपी झाले' : '⎘ कॉपी करा'}
          </button>
        </div>
        <div className="viewer-actions">
          <button className="btn-secondary" onClick={onEdit}>✎ संपादित करा</button>
          <button className="btn-danger" onClick={onDelete}>✕ हटवा</button>
        </div>
      </div>

      <div className="poem-display">
        {/* Parchment background — filter applied only here so text stays sharp */}
        <div className="parchment-bg" aria-hidden="true" />

        {/* Top ornament */}
        <div className="poem-ornament-top">॥</div>

        {/* Meta */}
        <div className="poem-meta-row">
          <span className="category-pill" style={{ borderColor: category?.color, color: category?.color }}>
            {category?.label}
          </span>
          <span className="poem-date">{dateStr}</span>
        </div>

        <hr className="poem-rule" />

        {/* Title */}
        <h1 className="poem-title">{poem.title}</h1>

        {/* Body — each line fades in with stagger */}
        <div className="poem-body">
          {lines.map((line, i) =>
            line.trim() === ''
              ? <div key={i} className="poem-gap" />
              : <p key={i} className="poem-line" style={{ animationDelay: delay(i) }}>{line}</p>
          )}
        </div>

        {/* End mark */}
        <div className="poem-end-mark">॥ प्राकाव्य ॥</div>

        {/* Tags */}
        {poem.tags.length > 0 && (
          <div className="poem-footer-tags">
            {poem.tags.map(tag => (
              <span key={tag} className="footer-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
