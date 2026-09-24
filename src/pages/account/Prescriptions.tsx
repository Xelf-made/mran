import { useRef, useState } from 'react';
import { Check, Clock, FileText, Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useCustomerPrescriptions, useUploadPrescription, type PrescriptionStatus } from '@/lib/queries';
import { useCustomerPrescriptionRealtime } from '@/lib/usePrescriptionsRealtime';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';

const statusConfig: Record<PrescriptionStatus, { label: string; cls: string; icon: typeof Clock }> = {
  pending: { label: 'Pending review', cls: 'rx-status--pending', icon: Clock },
  approved: { label: 'Approved', cls: 'rx-status--approved', icon: Check },
  rejected: { label: 'Rejected', cls: 'rx-status--rejected', icon: X },
};

const fileUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  const url = import.meta.env.VITE_SUPABASE_URL;
  return `${url}/storage/v1/object/public/prescriptions/${path}`;
};

export function Prescriptions() {
  const { user, demoUser } = useAuth();
  const showToast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerName, setViewerName] = useState('');

  const userId = user?.id ?? '';
  const isDemo = Boolean(demoUser);
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

  if (!isDemo && isLoading) return <div className="track-loading"><FileText className="spin" size={36} /><p>Loading prescriptions…</p></div>;

  return (
    <div>
      <h3>My Prescriptions</h3>

      {!isDemo && (
        <div
          className="rx-upload-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onInputChange} hidden />
          <Upload size={28} />
          <div>
            <strong>{uploading ? 'Uploading…' : 'Upload a prescription'}</strong>
            <span>Click to browse or drag and drop an image or PDF</span>
          </div>
        </div>
      )}

      {isDemo && (
        <div className="account__demo-banner" style={{ marginBottom: 20 }}>
          <Check size={16} /> Demo mode — prescription uploads require a real account. Sign up to upload scripts.
        </div>
      )}

      {!isDemo && error && (
        <div className="auth__error" style={{ marginBottom: 16 }}>Could not load your prescriptions.</div>
      )}

      {list.length === 0 ? (
        <div className="track__empty"><FileText size={36} /><h3>No prescriptions yet</h3><p>Upload a doctor's prescription to unlock prescription-only products.</p></div>
      ) : (
        <div className="rx-customer-list">
          {list.map((rx) => {
            const cfg = statusConfig[rx.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={rx.id} className="rx-customer-card">
                <div className="rx-customer-card__top">
                  <div className="rx-customer-card__file">
                    <FileText size={20} />
                    <span>{rx.file_name || 'Prescription'}</span>
                  </div>
                  <span className={`rx-status ${cfg.cls}`}><StatusIcon size={14} /> {cfg.label}</span>
                </div>
                <div className="rx-customer-card__time">
                  Uploaded {new Date(rx.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                {rx.pharmacist_notes && (
                  <div className="rx-customer-card__notes">
                    <strong>Pharmacist note:</strong> {rx.pharmacist_notes}
                  </div>
                )}
                <button
                  className="btn btn--outline btn--sm"
                  onClick={() => { setViewerUrl(fileUrl(rx.file_url)); setViewerName(rx.file_name || 'Prescription'); }}
                >
                  View document
                </button>
              </div>
            );
          })}
        </div>
      )}

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
    </div>
  );
}
