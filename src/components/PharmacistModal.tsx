import { useState, type FormEvent } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/components/Toast';

export function PharmacistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, demoUser } = useAuth();
  const showToast = useToast();
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      showToast('error', 'Please enter your question.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('pharmacist_questions').insert({
        customer_name: name.trim() || user?.email || demoUser?.name || 'Anonymous',
        customer_email: user?.email ?? demoUser?.email ?? null,
        question: question.trim(),
        status: 'pending',
      });
      if (error) throw error;
      showToast('success', 'Your question has been sent to our pharmacist team. We will respond shortly.');
      setQuestion('');
      onClose();
    } catch {
      showToast('error', 'Could not send your question. Please try again or call us.');
    }
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3><MessageCircle size={20} /> Ask a Pharmacist</h3>
          <button className="modal__close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="pharmacist-modal__body">
          <p className="pharmacist-modal__intro">Have a question about a medicine, dosage, or side effect? Send it to our pharmacist team and we'll get back to you.</p>
          <form onSubmit={submit} className="pharmacist-modal__form">
            <label className="field">
              <span>Your name</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" />
            </label>
            <label className="field">
              <span>Your question</span>
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. Can I take paracetamol with amoxicillin?" rows={4} />
            </label>
            <button type="submit" className="btn btn--primary pharmacist-modal__submit" disabled={submitting}>
              <Send size={16} /> {submitting ? 'Sending…' : 'Send question'}
            </button>
          </form>
          <a href="https://wa.me/254700123456" target="_blank" rel="noreferrer" className="pharmacist-modal__whatsapp">
            <MessageCircle size={16} /> Prefer WhatsApp? Chat with us instantly
          </a>
        </div>
      </div>
    </div>
  );
}
