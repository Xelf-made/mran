import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Check, Clock, Download, FileText, History, Lock, Pill, RotateCcw, ShieldCheck, Stethoscope, Upload, X } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { useAuth } from '@/contexts/useAuth';
import { useCustomerPrescriptions, useDemoCustomerPrescriptions, useUploadPrescription, type PrescriptionStatus } from '@/lib/queries';
import { useCustomerPrescriptionRealtime } from '@/lib/usePrescriptionsRealtime';
import { useToast } from '@/components/Toast';

type Panel = 'upload' | 'history';

const statusConfig: Record<PrescriptionStatus, { label: string; cls: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', cls: 'rx-badge--pending', icon: Clock },
  approved: { label: 'Approved', cls: 'rx-badge--approved', icon: Check },
  rejected: { label: 'Rejected', cls: 'rx-badge--rejected', icon: X },
};

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

const fileUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  const url = import.meta.env.VITE_SUPABASE_URL;
  return `${url}/storage/v1/object/public/prescriptions/${path}`;
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function PrescriptionsPage() {
  const { user, demoUser } = useAuth();
  const showToast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [panel, setPanel] = useState<Panel>('upload');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerName, setViewerName] = useState('');
  const [notesRxId, setNotesRxId] = useState<string | null>(null);

  const isLoggedIn = Boolean(user || demoUser);
  const isDemo = Boolean(demoUser);
  const userId = user?.id ?? '';
  const { data: realPrescriptions, isLoading, error } = useCustomerPrescriptions(userId);
  const { data: demoPrescriptions } = useDemoCustomerPrescriptions();
  const uploadMutation = useUploadPrescription();

  useCustomerPrescriptionRealtime(userId);

  const list = isDemo ? (demoPrescriptions ?? []) : (realPrescriptions ?? []);
  const pendingCount = list.filter((rx) => rx.status === 'pending').length;
  const approvedCount = list.filter((rx) => rx.status === 'approved').length;
  const notesRx = list.find((rx) => rx.id === notesRxId);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) return 'Unsupported file type. Please upload a JPG, PNG, or PDF.';
    if (file.size > MAX_SIZE) return 'File is too large. Maximum size is 10 MB.';
    return null;
  };

  const handleFile = async (file: File) => {
    if (!userId || isDemo) {
      showToast('error', 'Demo mode — please sign up for a real account to upload prescriptions.');
      return;
    }
    const validationError = validateFile(file);
    if (validationError) {
      showToast('error', validationError);
      return;
    }
    setUploading(true);
    try {
      await uploadMutation.mutateAsync({ file, userId, fileName: file.name });
      showToast('success', 'Prescription uploaded. A pharmacist will review it within 30 minutes.');
      setPanel('history');
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
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <PageShell>
      <section className="page-hero page-hero--rx">
        <div className="shell">
          <span className="eyebrow"><Pill size={14} /> Prescription Portal</span>
          <h1>Upload, verify &amp; order your prescription medicines</h1>
          <p>Our licensed pharmacists review every prescription — usually within 30 minutes — so you can shop safely and conveniently.</p>
        </div>
      </section>

      <section className="shell rx-portal">
        {!isLoggedIn ? (
          <div className="rx-portal__auth-cta">
            <Lock size={32} />
            <h2>Sign in to upload your prescription</h2>
            <p>Create a free account or sign in to upload prescriptions, track review status in real time, and unlock prescription-only medicines.</p>
            <div className="rx-portal__auth-buttons">
              <Link to="/login" className="btn btn--primary">Sign in <ArrowRight size={16} /></Link>
              <Link to="/signup" className="btn btn--outline">Create free account</Link>
            </div>
          </div>
        ) : (
          <div className="rx-upload-layout">
            {/* Left column — upload + history actions */}
            <div className="rx-upload-left">
              <div className="rx-upload-left__head">
                <span className="rx-upload-left__icon"><Upload size={22} /></span>
                <div>
                  <h2>Upload Prescription</h2>
                  <p>Submit your doctor's script for pharmacist review</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="rx-action-buttons">
                <button
                  className={`rx-action-btn ${panel === 'upload' ? 'rx-action-btn--active' : ''}`}
                  onClick={() => setPanel('upload')}
                >
                  <span className="rx-action-btn__icon rx-action-btn__icon--orange"><Upload size={20} /></span>
                  <div className="rx-action-btn__body">
                    <strong>Upload New</strong>
                    <span>Snap or browse a fresh prescription</span>
                  </div>
                  <ArrowRight size={18} className="rx-action-btn__arrow" />
                </button>

                <button
                  className={`rx-action-btn ${panel === 'history' ? 'rx-action-btn--active' : ''}`}
                  onClick={() => setPanel('history')}
                >
                  <span className="rx-action-btn__icon rx-action-btn__icon--green"><History size={20} /></span>
                  <div className="rx-action-btn__body">
                    <strong>Past Prescriptions</strong>
                    <span>{list.length > 0 ? `${list.length} on file — view & reorder` : 'No records yet'}</span>
                  </div>
                  <ArrowRight size={18} className="rx-action-btn__arrow" />
                </button>
              </div>

              {/* Panel content */}
              {panel === 'upload' ? (
                <div className="rx-panel">
                  {isDemo ? (
                    <div className="account__demo-banner">
                      <Check size={16} /> Demo mode — prescription uploads require a real account. Sign up to upload scripts and unlock Rx products.
                    </div>
                  ) : (
                    <>
                      <div
                        className={`rx-dropzone ${dragActive ? 'rx-dropzone--active' : ''} ${uploading ? 'rx-dropzone--loading' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={onDrop}
                        onClick={() => !uploading && fileRef.current?.click()}
                      >
                        <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onInputChange} hidden />
                        <div className="rx-dropzone__icon">
                          {uploading ? <Clock size={32} className="spin" /> : <Upload size={32} />}
                        </div>
                        <div className="rx-dropzone__text">
                          <strong>{uploading ? 'Uploading your prescription…' : dragActive ? 'Release to upload' : 'Drop your prescription here or click to browse'}</strong>
                          <span>JPG, PNG, or PDF · Max 10 MB · Reviewed within 30 minutes</span>
                        </div>
                        {!uploading && <div className="rx-dropzone__browse">Browse files</div>}
                      </div>

                      <div className="rx-panel__steps">
                        <div className="rx-panel__step"><span className="rx-panel__step-num">1</span><Upload size={16} /><span>Upload your script</span></div>
                        <div className="rx-panel__step"><span className="rx-panel__step-num">2</span><Stethoscope size={16} /><span>Pharmacist reviews in 30 min</span></div>
                        <div className="rx-panel__step"><span className="rx-panel__step-num">3</span><ShieldCheck size={16} /><span>Rx products unlock in your cart</span></div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="rx-panel">
                  {/* Quick stats */}
                  {list.length > 0 && (
                    <div className="rx-stats">
                      <div className="rx-stat"><span className="rx-stat__value">{list.length}</span><span className="rx-stat__label">Total scripts</span></div>
                      <div className="rx-stat rx-stat--pending"><span className="rx-stat__value">{pendingCount}</span><span className="rx-stat__label">Pending review</span></div>
                      <div className="rx-stat rx-stat--approved"><span className="rx-stat__value">{approvedCount}</span><span className="rx-stat__label">Approved</span></div>
                    </div>
                  )}

                  {isDemo ? (
                    <div className="rx-table-wrap">
                      <table className="rx-table">
                        <thead>
                          <tr>
                            <th>Document</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th>Notes</th>
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
                                <td className="rx-table__date">{formatDateTime(rx.created_at)}</td>
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
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : isLoading ? (
                    <div className="track-loading"><FileText className="spin" size={28} /><p>Loading prescriptions…</p></div>
                  ) : error ? (
                    <div className="auth__error"><AlertCircle size={16} /> Could not load your prescriptions. Please try again.</div>
                  ) : list.length === 0 ? (
                    <div className="rx-history__empty">
                      <FileText size={36} />
                      <h3>No prescriptions yet</h3>
                      <p>Upload a doctor's prescription to unlock prescription-only products.</p>
                      <button className="btn btn--primary btn--sm" onClick={() => setPanel('upload')}><Upload size={15} /> Upload now</button>
                    </div>
                  ) : (
                    <div className="rx-table-wrap">
                      <table className="rx-table">
                        <thead>
                          <tr>
                            <th>Document</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th>Notes</th>
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
                                <td className="rx-table__date">{formatDateTime(rx.created_at)}</td>
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
                                    <a className="btn btn--ghost btn--sm" href={fileUrl(rx.file_url)} download={rx.file_name || 'prescription'} target="_blank" rel="noreferrer" title="Download">
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
                <div className="rx-portal__trust-item"><Check size={18} /> Secure &amp; confidential</div>
                <div className="rx-portal__trust-item"><RotateCcw size={18} /> Reorder from approved scripts</div>
              </div>
            </div>

            {/* Right column — valid prescription guide card */}
            <div className="rx-guide">
              <div className="rx-guide__head">
                <span className="rx-guide__head-icon"><ShieldCheck size={20} /></span>
                <div>
                  <h3>What makes a valid prescription?</h3>
                  <p>Make sure your document includes these details for fast approval</p>
                </div>
              </div>

              {/* Document placeholder mockup */}
              <div className="rx-guide__doc">
                <div className="rx-guide__doc-header">
                  <div className="rx-guide__doc-logo">
                    <Pill size={16} /> <span>Rx</span>
                  </div>
                  <div className="rx-guide__doc-stamp">VERIFIED</div>
                </div>

                <div className="rx-guide__doc-patient">
                  <div className="rx-guide__doc-line"><span className="rx-guide__doc-label">Patient:</span><span className="rx-guide__doc-value">____________________</span></div>
                  <div className="rx-guide__doc-line"><span className="rx-guide__doc-label">Date:</span><span className="rx-guide__doc-value">__/__/____</span></div>
                  <div className="rx-guide__doc-line"><span className="rx-guide__doc-label">Age:</span><span className="rx-guide__doc-value">____</span></div>
                </div>

                <div className="rx-guide__doc-rx-symbol">Rx</div>

                <div className="rx-guide__doc-meds">
                  <div className="rx-guide__doc-med-line" />
                  <div className="rx-guide__doc-med-line rx-guide__doc-med-line--short" />
                  <div className="rx-guide__doc-med-line" />
                  <div className="rx-guide__doc-med-line rx-guide__doc-med-line--short" />
                </div>

                <div className="rx-guide__doc-signoff">
                  <div className="rx-guide__doc-signature">
                    <div className="rx-guide__doc-sig-line" />
                    <span>Doctor's signature</span>
                  </div>
                  <div className="rx-guide__doc-stamp-box">
                    <div className="rx-guide__doc-stamp-circle">
                      <ShieldCheck size={22} />
                      <small>PPB</small>
                    </div>
                    <span>Official stamp</span>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <ul className="rx-guide__checklist">
                <li><Check size={16} /> <strong>Patient name &amp; age</strong> — must match your account</li>
                <li><Check size={16} /> <strong>Date of issue</strong> — prescriptions are valid for 6 months</li>
                <li><Check size={16} /> <strong>Medicine &amp; dosage</strong> — clearly written or printed</li>
                <li><Check size={16} /> <strong>Doctor's signature</strong> — signed by a licensed practitioner</li>
                <li><Check size={16} /> <strong>PPB registration number</strong> &amp; official stamp</li>
              </ul>

              {/* Help footer */}
              <div className="rx-guide__help">
                <Stethoscope size={18} />
                <div>
                  <strong>Not sure if your prescription is valid?</strong>
                  <span>Ask a pharmacist — we'll review it and guide you through the process.</span>
                </div>
              </div>
            </div>
          </div>
        )}
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
                <strong>Pharmacist's note</strong>
                <p>{notesRx.pharmacist_notes}</p>
              </div>
              <div className="rx-notes-modal__date">
                Reviewed {formatDateTime(notesRx.updated_at)}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
