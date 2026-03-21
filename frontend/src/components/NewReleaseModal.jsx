import { useState } from 'react';

export default function NewReleaseModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', date: '', additional_info: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Name is required');
    if (!form.date) return setError('Date is required');
    setError('');
    setLoading(true);
    try {
      await onCreate(form);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">// New Release</div>

        <div className="form-group">
          <label className="form-label">Release Name *</label>
          <input
            className="form-input"
            placeholder="e.g. v2.4.0"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Due Date *</label>
          <input
            className="form-input"
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Additional Info</label>
          <textarea
            className="form-textarea"
            placeholder="Optional notes about this release..."
            value={form.additional_info}
            onChange={(e) => setForm({ ...form, additional_info: e.target.value })}
          />
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : '+ Create Release'}
          </button>
        </div>
      </div>
    </div>
  );
}
