import { useState } from 'react';
import { Check, ClipboardCheck, FileText, Search, X } from 'lucide-react';
import { useReviewedPrescriptions } from '@/lib/queries';
import { supabase } from '@/lib/supabase';

export function ReviewHistory() {
  const { data: prescriptions, isLoading, error } = useReviewedPrescriptions();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected'>('all');

  if (isLoading) return <div className="track-loading"><ClipboardCheck className="spin" size={36} /><p>Loading review history…</p></div>;
  if (error) return <div className="auth__error">Could not load review history.</div>;

  const all = prescriptions ?? [];
  const filtered = all
    .filter((rx) => filter === 'all' || rx.status === filter)
    .filter((rx) => !search || (rx.profile?.full_name ?? '').toLowerCase().includes(search.toLowerCase()) || rx.file_name.toLowerCase().includes(search.toLowerCase()));

  const approvedCount = all.filter((rx) => rx.status === 'approved').length;
  const rejectedCount = all.filter((rx) => rx.status === 'rejected').length;

  return (
    <div>
      <div className="admin__stats">
        <div className="admin-stat admin-stat--delivered"><span className="admin-stat__icon"><Check size={16} /></span><div><strong>{approvedCount}</strong><small>Approved</small></div></div>
        <div className="admin-stat admin-stat--cancelled"><span className="admin-stat__icon"><X size={16} /></span><div><strong>{rejectedCount}</strong><small>Rejected</small></div></div>
        <div className="admin-stat"><span className="admin-stat__icon"><ClipboardCheck size={16} /></span><div><strong>{all.length}</strong><small>Total reviewed</small></div></div>
      </div>

      <div className="admin__bar">
        <div className="admin__filters">
          <button className={`filter ${filter === 'all' ? 'filter--active' : ''}`} onClick={() => setFilter('all')}>All ({all.length})</button>
          <button className={`filter ${filter === 'approved' ? 'filter--active' : ''}`} onClick={() => setFilter('approved')}>Approved ({approvedCount})</button>
          <button className={`filter ${filter === 'rejected' ? 'filter--active' : ''}`} onClick={() => setFilter('rejected')}>Rejected ({rejectedCount})</button>
        </div>
        <label className="sort admin__search"><Search size={15} /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by customer or file" /></label>
      </div>

      {filtered.length === 0 ? (
        <div className="track__empty"><ClipboardCheck size={36} /><h3>No reviews found</h3><p>Reviewed prescriptions will appear here.</p></div>
      ) : (
        <div className="admin__table">
          <div className="admin__row admin__row--head">
            <span>Customer</span><span>File</span><span>Status</span><span>Notes</span><span>Reviewed</span>
          </div>
          {filtered.map((rx) => {
            const fileUrl = supabase.storage.from('prescriptions').getPublicUrl(rx.file_url).data.publicUrl;
            return (
              <div className="admin__row" key={rx.id}>
                <div className="admin__customer">
                  <strong>{rx.profile?.full_name ?? 'Unknown'}</strong>
                  <span>{rx.profile?.phone ?? 'No phone'}</span>
                </div>
                <div className="admin__product-name">
                  <FileText size={16} />
                  <div><strong>{rx.file_name || 'Prescription'}</strong><a href={fileUrl} target="_blank" rel="noreferrer" className="account__addr-action" style={{ display: 'inline-flex' }}>View file</a></div>
                </div>
                <div><span className={`order-status order-status--${rx.status === 'approved' ? 'delivered' : 'cancelled'}`}>{rx.status === 'approved' ? 'Approved' : 'Rejected'}</span></div>
                <div className="admin__items-count" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rx.pharmacist_notes ?? '—'}</div>
                <div className="admin__items-count">{new Date(rx.updated_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
