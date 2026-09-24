import { useState, type ReactNode } from 'react';
import { Check, Clock, FileText, Stethoscope, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { usePendingPrescriptions, useReviewPrescription, type Prescription } from '@/lib/queries';
import { supabase } from '@/lib/supabase';

export function PendingReviews() {
  const { user, demoUser } = useAuth();
  const { data: prescriptions, isLoading, error } = usePendingPrescriptions();
  const reviewMutation = useReviewPrescription();

  const [selected, setSelected] = useState<Prescription | null>(null);
  const [notes, setNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const reviewerId = user?.id ?? demoUser?.id ?? '';

  const openReview = (rx: Prescription) => {
    setSelected(rx);
    setNotes('');
    setActionError(null);
  };

  const closeReview = () => {
    setSelected(null);
    setNotes('');
    setActionError(null);
  };

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selected) return;
    setActionError(null);
    try {
      await reviewMutation.mutateAsync({ id: selected.id, status, notes, reviewerId });
      closeReview();
    } catch {
      setActionError(`Could not ${status === 'approved' ? 'approve' : 'reject'} prescription. Please try again.`);
    }
  };

  if (isLoading) return <div className="track-loading"><FileText className="spin" size={36} /><p>Loading pending prescriptions…</p></div>;
  if (error) return <div className="auth__error">Could not load pending prescriptions.</div>;

  const pending = prescriptions ?? [];

  return (
    <div>
      <div className="admin__stats">
        <div className="admin-stat admin-stat--pending"><span className="admin-stat__icon"><Clock size={16} /></span><div><strong>{pending.length}</strong><small>Pending review</small></div></div>
        <div className="admin-stat admin-stat--delivered"><span className="admin-stat__icon"><Stethoscope size={16} /></span><div><strong>Queue</strong><small>High priority</small></div></div>
      </div>

      {pending.length === 0 ? (
        <div className="track__empty"><Check size={42} /><h3>All caught up!</h3><p>There are no prescriptions waiting for review.</p></div>
      ) : (
        <div className="admin__table">
          <div className="admin__row admin__row--head">
            <span>Customer</span><span>File</span><span>Submitted</span><span>Actions</span>
          </div>
          {pending.map((rx) => (
            <div className="admin__row" key={rx.id}>
              <div className="admin__customer">
                <strong>{rx.profile?.full_name ?? 'Unknown customer'}</strong>
                <span>{rx.profile?.phone ?? 'No phone'}</span>
                <span>{rx.profile?.area ?? 'No area'}</span>
              </div>
              <div className="admin__product-name">
                <FileText size={16} />
                <div><strong>{rx.file_name || 'Prescription file'}</strong><span>{rx.file_url}</span></div>
              </div>
              <div className="admin__items-count">{new Date(rx.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div className="admin__row-actions">
                <button className="btn btn--primary btn--sm" onClick={() => openReview(rx)}>Review</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <ReviewModal prescription={selected} notes={notes} setNotes={setNotes} error={actionError} submitting={reviewMutation.isPending} onClose={closeReview} onApprove={() => handleReview('approved')} onReject={() => handleReview('rejected')} />}
    </div>
  );
}

function ReviewModal({ prescription, notes, setNotes, error, submitting, onClose, onApprove, onReject }: {
  prescription: Prescription;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  error: string | null;
  submitting: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const fileUrl = supabase.storage.from('prescriptions').getPublicUrl(prescription.file_url).data.publicUrl;
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(prescription.file_url);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>Review prescription</h3>
          <button className="modal__close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="pharmacist__review-grid">
          <div className="pharmacist__doc-viewer">
            <div className="pharmacist__doc-header"><FileText size={16} /> {prescription.file_name || 'Prescription'}</div>
            <div className="pharmacist__doc-body">
              {isImage ? (
                <img src={fileUrl} alt="Prescription" className="pharmacist__doc-image" />
              ) : (
                <div className="pharmacist__doc-placeholder"><FileText size={48} /><p>Document preview not available</p><a href={fileUrl} target="_blank" rel="noreferrer" className="btn btn--outline btn--sm">Open file</a></div>
              )}
            </div>
          </div>

          <div className="pharmacist__review-side">
            <div className="pharmacist__customer-card">
              <div className="pharmacist__customer-head"><UserIcon size={18} /> Customer details</div>
              <div className="pharmacist__customer-row"><span>Name</span><strong>{prescription.profile?.full_name ?? 'Unknown'}</strong></div>
              <div className="pharmacist__customer-row"><span>Phone</span><strong>{prescription.profile?.phone ?? '—'}</strong></div>
              <div className="pharmacist__customer-row"><span>Area</span><strong>{prescription.profile?.area ?? '—'}</strong></div>
              <div className="pharmacist__customer-row"><span>Submitted</span><strong>{new Date(prescription.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
            </div>

            <label className="auth__field">
              <span>Clinical notes (optional)</span>
              <div className="auth__input-wrap">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add clinical notes for this review…"
                  rows={4}
                  style={{ width: '100%', padding: '12px', border: '1px solid #d4e0c8', borderRadius: 8, fontFamily: 'inherit', fontSize: 14, resize: 'vertical' }}
                />
              </div>
            </label>

            {error && <div className="auth__error">{error}</div>}

            <div className="pharmacist__review-actions">
              <button className="btn btn--primary" disabled={submitting} onClick={onApprove}>
                <Check size={16} /> {submitting ? 'Processing…' : 'Approve'}
              </button>
              <button className="btn btn--outline pharmacist__reject-btn" disabled={submitting} onClick={onReject}>
                <X size={16} /> {submitting ? 'Processing…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
