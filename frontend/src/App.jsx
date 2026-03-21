import { useState, useEffect } from 'react';
import { api } from './api';
import NewReleaseModal from './components/NewReleaseModal';
import ReleaseDetail from './components/ReleaseDetail';
import './index.css';

function progressColor(pct) {
  if (pct === 100) return 'var(--green)';
  if (pct > 0) return 'var(--blue)';
  return 'var(--text-dim)';
}

export default function App() {
  const [releases, setReleases] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    try {
      const data = await api.getReleases();
      setReleases(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (form) => {
    const created = await api.createRelease(form);
    setReleases((prev) => [...prev, created]);
    setSelectedId(created.id);
  };

  const handleUpdate = (updated) => {
    setReleases((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleDelete = (id) => {
    const next = releases.filter((r) => r.id !== id);
    setReleases(next);
    setSelectedId(next.length > 0 ? next[0].id : null);
  };

  const selected = releases.find((r) => r.id === selectedId);

  return (
    <>
      <header className="app-header">
        <div className="app-logo">Release<span>/</span>Checklist</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
          {releases.length} release{releases.length !== 1 ? 's' : ''}
        </div>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">Releases</span>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New</button>
          </div>
          <div className="releases-list">
            {loading && (
              <div style={{ padding: '1.5rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                Loading...
              </div>
            )}
            {error && (
              <div style={{ padding: '1.5rem', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                Error: {error}
              </div>
            )}
            {!loading && releases.length === 0 && (
              <div style={{ padding: '1.5rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                No releases yet.
              </div>
            )}
            {releases.map((r) => {
              const completed = r.steps.filter((s) => s.completed).length;
              const total = r.steps.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div
                  key={r.id}
                  className={`release-item${r.id === selectedId ? ' active' : ''}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  <div className="release-item-name">{r.name}</div>
                  <div className="release-item-meta">
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                    <div className="progress-mini">
                      <div
                        className="progress-mini-fill"
                        style={{ width: `${pct}%`, background: progressColor(pct) }}
                      />
                    </div>
                    <span>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {selected ? (
          <ReleaseDetail
            key={selected.id}
            release={selected}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ) : (
          <div className="detail-panel">
            <div className="empty-state">
              <div className="empty-icon">⬡</div>
              <div>Select a release or create a new one</div>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <NewReleaseModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  );
}
