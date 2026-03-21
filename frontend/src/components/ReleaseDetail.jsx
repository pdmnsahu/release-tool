import { useState, useEffect } from 'react';
import { api } from '../api';

function progressColor(pct) {
  if (pct === 100) return 'var(--green)';
  if (pct > 0) return 'var(--blue)';
  return 'var(--text-dim)';
}

export default function ReleaseDetail({ release, onUpdate, onDelete }) {
  const [info, setInfo] = useState(release.additional_info || '');
  const [infoChanged, setInfoChanged] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [togglingStep, setTogglingStep] = useState(null);

  useEffect(() => {
    setInfo(release.additional_info || '');
    setInfoChanged(false);
  }, [release.id]);

  const completedCount = release.steps.filter((s) => s.completed).length;
  const total = release.steps.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const handleToggleStep = async (step) => {
    if (togglingStep) return;
    setTogglingStep(step.key);
    try {
      const updated = await api.toggleStep(release.id, step.key, !step.completed);
      onUpdate(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingStep(null);
    }
  };

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    try {
      const updated = await api.updateRelease(release.id, { additional_info: info });
      onUpdate(updated);
      setInfoChanged(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingInfo(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete release "${release.name}"? This cannot be undone.`)) return;
    await api.deleteRelease(release.id);
    onDelete(release.id);
  };

  const formattedDate = new Date(release.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <div className="detail-title">{release.name}</div>
          <div className="detail-meta">
            <span>{formattedDate}</span>
            <span>·</span>
            <StatusBadge status={release.status} />
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-label">
          <span>Progress</span>
          <span>{completedCount}/{total} steps</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${pct}%`, background: progressColor(pct) }}
          />
        </div>
      </div>

      <div className="steps-section">
        <div className="section-label">Steps</div>
        <div className="steps-grid">
          {release.steps.map((step) => (
            <div
              key={step.key}
              className={`step-item${step.completed ? ' completed' : ''}`}
              onClick={() => handleToggleStep(step)}
            >
              <div className="step-checkbox">
                {step.completed && '✓'}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <div className="section-label">Additional Info</div>
        <textarea
          className="info-textarea"
          placeholder="Add notes, links, or context for this release..."
          value={info}
          onChange={(e) => { setInfo(e.target.value); setInfoChanged(true); }}
        />
        {infoChanged && (
          <div className="info-save-row">
            <button className="btn btn-primary" onClick={handleSaveInfo} disabled={savingInfo}>
              {savingInfo ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}
