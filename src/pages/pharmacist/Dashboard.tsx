import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Eye, FileText, LogOut, Repeat, Stethoscope, X } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { usePendingPrescriptions, useReviewPrescription, type Prescription } from '@/lib/queries';
import { getDemoPendingPrescriptions } from '@/data/demoPrescriptions';

export function PharmacistDashboard() {
  const { demoUser, user, isPharmacist, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const reviewMutation = useReviewPrescription();
  const reviewerId = user?.id ?? demoUser?.id ?? '';

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewerRx, setViewerRx] = useState<Prescription | null>(null);
  const [useDemoData, setUseDemoData] = useState(false);

  const displayName = demoUser?.name ?? user?.email ?? 'Pharmacist';
  const email = demoUser?.email ?? user?.email ?? '';
  const canAccess = isPharmacist || isAdmin;

  if (!demoUser && !user) {
    return (
      <main className="page">
        <div className="shell track-auth">
          <div className="track-auth__card">
            <Stethoscope size={42} />
            <h1>Pharmacist sign in required</h1>
            <p>Sign in with a pharmacist or admin account to access the review portal.</p>
            <Link to="/pharmacist-login" className="btn btn--primary">Pharmacist sign in</Link>
          </div>
        </div>
      </main>
    );
  }

  if (!canAccess) {
    return (
      <main className="page">
        <div className="shell track-auth">
          <div className="track-auth__card">
            <X size={42} />
            <h1>Access denied</h1>
            <p>This account does not have pharmacist privileges.</p>
            <Link to="/" className="btn btn--outline">Back to home</Link>
          </div>
        </div>
      </main>
    );
  }

  const handleReview = async (rx: Prescription, status: 'approved' | 'rejected') => {
    const note = (notes[rx.id] ?? '').trim();
    if (!note) {
      setErrors((prev) => ({ ...prev, [rx.id]: 'A decision note is required before approving or rejecting.' }));
      return;
    }
    if (rx.id.startsWith('demo-')) {
      setNotes((prev) => { const next = { ...prev }; delete next[rx.id]; return next; });
      setUseDemoData(true);
      return;
    }
    setErrors((prev) => { const next = { ...prev }; delete next[rx.id]; return next; });
    try {
      await reviewMutation.mutateAsync({ id: rx.id, status, notes: note, reviewerId });
      setNotes((prev) => { const next = { ...prev }; delete next[rx.id]; return next; });
    } catch {
      setErrors((prev) => ({ ...prev, [rx.id]: `Could not ${status === 'approved' ? 'approve' : 'reject'} prescription. Please try again.` }));
    }
  };

  const isImage = (rx: Prescription) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(rx.file_url);
  const fileUrl = (rx: Prescription) => {
    if (rx.id.startsWith('demo-')) return rx.file_url;
    return supabaseUrl(rx.file_url);
  };

  return (
    <div className="pharmacist-portal">
      <header className="pharmacist-portal__header">
        <div className="shell pharmacist-portal__header-inner">
          <div className="pharmacist-portal__brand">
            <Stethoscope size={24} />
            <div>
              <strong>Prescription Verification</strong>
              <small>{displayName} · {email}</small>
            </div>
          </div>
          <div className="pharmacist-portal__header-actions">
            <button className="btn btn--outline btn--sm pharmacist-portal__switch-btn" onClick={async () => {
              await signOut();
              navigate('/login');
            }}>
              <Repeat size={15} /> Switch account
            </button>
            <button className="btn btn--outline btn--sm" onClick={async () => { await signOut(); navigate('/pharmacist-login'); }}>
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="shell pharmacist-portal__main">
        <PendingList
          notes={notes}
          errors={errors}
          setNotes={setNotes}
          setErrors={setErrors}
          onReview={handleReview}
          onView={setViewerRx}
          submitting={reviewMutation.isPending}
          useDemoData={useDemoData}
        />
      </main>

      {viewerRx && (
        <div className="modal-overlay" onClick={() => setViewerRx(null)}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal__head">
              <h3>{viewerRx.file_name || 'Prescription document'}</h3>
              <button className="modal__close" onClick={() => setViewerRx(null)}><X size={20} /></button>
            </div>
            <div className="pharmacist__doc-viewer">
              <div className="pharmacist__doc-body">
                {isImage(viewerRx) ? (
                  <img src={fileUrl(viewerRx)} alt="Prescription" className="pharmacist__doc-image" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="pharmacist__doc-placeholder">
                    <FileText size={48} />
                    <p>Preview not available for this file type.</p>
                    <a href={fileUrl(viewerRx)} target="_blank" rel="noreferrer" className="btn btn--outline btn--sm">Open file</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function supabaseUrl(path: string): string {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return `${url}/storage/v1/object/public/prescriptions/${path}`;
}

function PendingList({ notes, errors, setNotes, setErrors, onReview, onView, submitting, useDemoData }: {
  notes: Record<string, string>;
  errors: Record<string, string>;
  setNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onReview: (rx: Prescription, status: 'approved' | 'rejected') => void;
  onView: (rx: Prescription) => void;
  submitting: boolean;
  useDemoData: boolean;
}) {
  const { data: prescriptions, isLoading, error } = usePendingPrescriptions();

  if (isLoading) return <div className="track-loading"><FileText className="spin" size={36} /><p>Loading pending prescriptions…</p></div>;

  let pending: Prescription[];
  let isDemoFallback = false;

  if (error || (prescriptions && prescriptions.length === 0) || useDemoData) {
    pending = getDemoPendingPrescriptions();
    isDemoFallback = true;
  } else {
    pending = prescriptions ?? [];
  }

  if (pending.length === 0) {
    return (
      <div className="track__empty">
        <Check size={42} />
        <h3>All caught up!</h3>
        <p>There are no prescriptions waiting for review.</p>
      </div>
    );
  }

  return (
    <div className="pharmacist-portal__list">
      <div className="pharmacist-portal__queue-head">
        <div>
          <h2>Pending prescriptions</h2>
          {isDemoFallback && <span className="pharmacist-portal__demo-tag">Demo data</span>}
        </div>
        <span className="pharmacist-portal__count">{pending.length} waiting</span>
      </div>

      {pending.map((rx) => (
        <div className="rx-card" key={rx.id}>
          <div className="rx-card__top">
            <div className="rx-card__customer">
              <strong>{rx.profile?.full_name ?? 'Unknown customer'}</strong>
              <span>{rx.profile?.phone ?? 'No phone on file'}</span>
              <span>{rx.profile?.area ?? 'Area not specified'}</span>
            </div>
            <div className="rx-card__meta">
              <span className="rx-card__time">{new Date(rx.created_at).toLocaleString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <button className="btn btn--outline btn--sm" onClick={() => onView(rx)}>
                <Eye size={15} /> View document
              </button>
            </div>
          </div>

          <div className="rx-card__doc-info">
            <FileText size={16} />
            <span>{rx.file_name || 'Prescription file'}</span>
          </div>

          <div className="rx-card__decision">
            <label className="rx-card__note-label">
              <span>Decision note <em>(required)</em></span>
              <textarea
                value={notes[rx.id] ?? ''}
                onChange={(e) => setNotes((prev) => ({ ...prev, [rx.id]: e.target.value }))}
                onFocus={() => setErrors((prev) => { const next = { ...prev }; delete next[rx.id]; return next; })}
                placeholder="e.g. Approved — dosage matches prescription. 500mg twice daily for 7 days."
                rows={2}
                className="rx-card__note-input"
              />
            </label>
            {errors[rx.id] && <div className="auth__error rx-card__error">{errors[rx.id]}</div>}
            <div className="rx-card__actions">
              <button className="btn btn--primary" disabled={submitting} onClick={() => onReview(rx, 'approved')}>
                <Check size={16} /> Approve
              </button>
              <button className="btn btn--outline pharmacist__reject-btn" disabled={submitting} onClick={() => onReview(rx, 'rejected')}>
                <X size={16} /> Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
