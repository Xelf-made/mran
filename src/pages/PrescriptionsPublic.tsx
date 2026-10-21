import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock, Download, FileText, Lock, ShieldCheck, Stethoscope, Upload, X } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { useAuth } from '@/contexts/useAuth';
import { useCustomerPrescriptions, useUploadPrescription, type PrescriptionStatus } from '@/lib/queries';
import { useCustomerPrescriptionRealtime } from '@/lib/usePrescriptionsRealtime';
import { useToast } from '@/components/Toast';

const statusConfig: Record<PrescriptionStatus, { label: string; cls: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', cls: 'rx-badge--pending', icon: Clock },
  approved: { label: 'Approved', cls: 'rx-badge--approved', icon: Check },
  rejected: { label: 'Rejected', cls: 'rx-badge--rejected', icon: X },
};

const steps = [
  { num: 1, icon: Upload, title: 'Upload your prescription', text: 'Take a clear photo or upload a PDF of your doctor\'s prescription. Most formats accepted.' },
  { num: 2, icon: Stethoscope, title: 'Pharmacist review (30 min)', text: 'A licensed pharmacist reviews your script — typically within 30 minutes during business hours.' },
  { num: 3, icon: ShieldCheck, title: 'Unlock & shop', text: 'Once approved, prescription medicines unlock in your cart. You can check out securely right away.' },
  { num: 4, icon: FileText, title: 'Track & reorder', text: 'Your approved prescriptions are saved for easy refills. View pharmacist notes and download receipts anytime.' },
];

const fileUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  const url = import.meta.env.VITE_SUPABASE_URL;
  return `${url}/storage/v1/object/public/prescriptions/${path}`;
};

export function PrescriptionsPage() {
  const { user, demoUser } = useAuth();
  const showToast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerName, setViewerName] = useState('');
  const [notesRxId, setNotesRxId] = useState<string | null>(null);

  const isLoggedIn = Boolean(user || demoUser);
  const isDemo = Boolean(demoUser);
  const userId = user?.id ?? '';
  const { data: prescriptions, isLoading, error } = useCustomerPrescriptions(userId);
  const uploadMutation = useUploadPrescription();

  useCustomerPrescriptionRealtime(userId);

  const handleFile = async (file: File) => {
    if (!userId) {
      showToast('error', 'Please sign in to upload a prescription.');
      return;
    }
    setUploading(true);
    try {
      await uploadMutation.mutateAsync({ file, userId, fileName: file.name });
      showToast('success', 'Prescription uploaded. A pharmacist will review it shortly.');
    } catch {
      showToast('error', 'Could not upload prescription. Please try again.');
    }
    setUploading(false);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const list = prescriptions ?? [];
  const notesRx = list.find((rx) => rx.id === notesRxId);

  return (
    <PageShell>
      <section className="page-hero page-hero--rx">
        <div className="shell">
          <span className="eyebrow">Prescription portal</span>
          <h1>Upload, verify, and order your prescription medicines</h1>
          <p>Our licensed pharmacists review every prescription — usually within 30 minutes — so you can shop safely and conveniently.</p>
        </div>
      </section>

      <section className="shell rx-portal">
        {/* Step-by-step progress guide */}
        <div className="rx-steps">
          {steps.map((step) => (
            <div className="rx-step" key={step.num}>
              <div className="rx-step__num">{step.num}</div>
              <div className="rx-step__icon"><step.icon size={22} /></div>
              <div className="rx-step__body">
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upload dropzone or sign-in CTA */}
        {isLoggedIn ? (
          isDemo ? (
            <div className="rx-portal__demo-banner">
              <Check size={16} /> Demo mode — prescription uploads require a real account. Sign up to upload scripts and unlock Rx products.
            </div>
          ) : (
            <div
              className="rx-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onInputChange} hidden />
              <div className="rx-dropzone__icon">{uploading ? <Clock size={32} className="spin" /> : <Upload size={32} />}</div>
              <div className="rx-dropzone__text">
                <strong>{uploading ? 'Uploading your prescription…' : 'Drop your prescription here or click to browse'}</strong>
                <span>JPG, PNG, or PDF · Max 10 MB · Reviewed within 30 minutes</span>
              </div>
            </div>
          )
        ) : (
          <div className="rx-portal__auth-cta">
            <Lock size={32} />
            <h2>Sign in to upload your prescription</h2>
            <p>Create a free account or sign in to upload prescriptions, track review status, and unlock prescription-only medicines.</p>
            <div className="rx-portal__auth-buttons">
              <Link to="/login" className="btn btn--primary">Sign in <ArrowRight size={16} /></Link>
              <Link to="/signup" className="btn btn--outline">Create free account</Link>
            </div>
          </div>
        )}

        {/* Prescription history table */}
        {isLoggedIn && !isDemo && (
          <div className="rx-history">
            <div className="rx-history__head">
              <h2>Your prescription history</h2>
              <span className="rx-history__count">{list.length} {list.length === 1 ? 'record' : 'records'}</span>
            </div>

            {isLoading ? (
              <div className="track-loading"><FileText className="spin" size={28} /><p>Loading prescriptions…</p></div>
            ) : error ? (
              <div className="auth__error">Could not load your prescriptions. Please try again.</div>
            ) : list.length === 0 ? (
              <div className="rx-history__empty">
                <FileText size={36} />
                <h3>No prescriptions yet</h3>
                <p>Upload a doctor's prescription above to unlock prescription-only products.</p>
              </div>
            ) : (
              <div className="rx-table-wrap">
                <table className="rx-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Status</th>
                      <th>Uploaded</th>
                      <th>Pharmacist notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((rx) => {
                      const cfg = statusConfig[rx.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <tr key={rx.id}>
                          <td>
                            <div className="rx-table__doc">
                              <FileText size={16} />
                              <span>{rx.file_name || 'Prescription'}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`rx-badge ${cfg.cls}`}>
                              <StatusIcon size={13} /> {cfg.label}
                            </span>
                          </td>
                          <td className="rx-table__date">
                            {new Date(rx.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td>
                            {rx.pharmacist_notes ? (
                              <button className="rx-table__notes-btn" onClick={() => setNotesRxId(rx.id)}>
                                <FileText size={13} /> View note
                              </button>
                            ) : (
                              <span className="rx-table__no-notes">—</span>
                            )}
                          </td>
                          <td>
                            <div className="rx-table__actions">
                              <button className="btn btn--outline btn--sm" onClick={() => { setViewerUrl(fileUrl(rx.file_url)); setViewerName(rx.file_name || 'Prescription'); }}>
                                View
                              </button>
                              <a className="btn btn--ghost btn--sm" href={fileUrl(rx.file_url)} download={rx.file_name || 'prescription'} target="_blank" rel="noreferrer">
                                <Download size={14} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Trust indicators */}
        <div className="rx-portal__trust">
          <div className="rx-portal__trust-item"><Check size={18} /> Reviewed by licensed PPB pharmacists</div>
          <div className="rx-portal__trust-item"><Check size={18} /> Secure and confidential</div>
          <div className="rx-portal__trust-item"><Check size={18} /> 30-minute review during business hours</div>
        </div>
      </section>

      {/* Document viewer modal */}
      {viewerUrl && (
        <div className="modal-overlay" onClick={() => setViewerUrl(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__head">
              <h3>{viewerName}</h3>
              <button className="modal__close" onClick={() => setViewerUrl(null)}><X size={20} /></button>
            </div>
            <div className="pharmacist__doc-viewer">
              <div className="pharmacist__doc-body">
                {/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(viewerUrl) ? (
                  <img src={viewerUrl} alt={viewerName} className="pharmacist__doc-image" />
                ) : (
                  <div className="pharmacist__doc-placeholder">
                    <FileText size={48} />
                    <p>Preview not available for this file type.</p>
                    <a href={viewerUrl} target="_blank" rel="noreferrer" className="btn btn--outline btn--sm">Open file</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pharmacist notes modal */}
      {notesRx && notesRx.pharmacist_notes && (
        <div className="modal-overlay" onClick={() => setNotesRxId(null)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal__head">
              <h3>Pharmacist notes</h3>
              <button className="modal__close" onClick={() => setNotesRxId(null)}><X size={20} /></button>
            </div>
            <div className="rx-notes-modal">
              <div className="rx-notes-modal__script">
                <FileText size={16} /> {notesRx.file_name || 'Prescription'}
              </div>
              <div className={`rx-badge ${statusConfig[notesRx.status].cls}`}>
                {statusConfig[notesRx.status].label}
              </div>
              <div className="rx-notes-modal__note">
                <strong>Pharmacist's note:</strong>
                <p>{notesRx.pharmacist_notes}</p>
              </div>
              <div className="rx-notes-modal__date">
                Reviewed {new Date(notesRx.updated_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
