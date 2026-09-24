import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Upload } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { type Product } from '@/data/products';
import { useAuth } from '@/contexts/useAuth';
import { useHasApprovedPrescription, useUploadPrescription } from '@/lib/queries';
import { useCustomerPrescriptionRealtime } from '@/lib/usePrescriptionsRealtime';
import { useToast } from '@/components/Toast';

const price = (value: number) => `KSh ${value.toLocaleString()}`;

export function Button({ children, variant = 'primary', type = 'button', onClick, className = '' }: { children: ReactNode; variant?: 'primary' | 'outline' | 'ghost'; type?: 'button' | 'submit'; onClick?: () => void; className?: string }) {
  return <button type={type} onClick={onClick} className={`btn btn--${variant} ${className}`}>{children}</button>;
}

export function Stars({ rating, className = '' }: { rating: number; className?: string }) {
  return <span className={`stars ${className}`} aria-label={`${rating} out of 5`}>{'★'.repeat(Math.round(rating))}<span>{'★'.repeat(5 - Math.round(rating))}</span></span>;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const showToast = useToast();

  const isRx = Boolean(product.prescription);
  const userId = user?.id ?? '';
  const { data: hasApproved, isLoading: checkingApproval } = useHasApprovedPrescription(userId);
  useCustomerPrescriptionRealtime(userId);

  const uploadMutation = useUploadPrescription();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const isLocked = isRx && !hasApproved;

  const handleUpload = async (file: File) => {
    if (!userId) {
      showToast('error', 'Please sign in to upload a prescription.');
      return;
    }
    setUploading(true);
    try {
      await uploadMutation.mutateAsync({ file, userId, fileName: file.name });
      showToast('success', 'Prescription uploaded! A pharmacist will review it shortly.');
    } catch {
      showToast('error', 'Could not upload. Please try again.');
    }
    setUploading(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  return (
    <article className={`pcard ${isLocked ? 'pcard--locked' : ''}`}>
      <Link to={`/products/${product.id}`} className="pcard__media">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.tag && <span className="pcard__tag">{product.tag}</span>}
        {product.isNew && <span className="pcard__new">New</span>}
        {product.prescription && <span className="pcard__rx">Rx</span>}
        {isLocked && <span className="pcard__lock-badge"><Lock size={12} /> Prescription required</span>}
        <span className="pcard__view">View <ArrowRight size={13} /></span>
      </Link>
      <div className="pcard__body">
        <p className="pcard__brand">{product.brand}</p>
        <Link to={`/products/${product.id}`} className="pcard__name">{product.name}</Link>
        <div className="pcard__meta"><Stars rating={product.rating} /><span className="pcard__reviews">({product.reviews})</span></div>
        <div className="pcard__price">
          <strong>{price(product.price)}</strong>
          {product.oldPrice && <del>{price(product.oldPrice)}</del>}
        </div>
        {isLocked ? (
          <>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onFileChange} hidden />
            <Button variant="outline" className="pcard__upload" onClick={() => fileRef.current?.click()}>
              {uploading ? 'Uploading…' : <><Upload size={15} /> Upload prescription</>}
            </Button>
          </>
        ) : isRx && checkingApproval ? (
          <Button variant="outline" className="pcard__add" onClick={() => {}}>Checking…</Button>
        ) : (
          <Button onClick={() => addItem(product)} className="pcard__add">Add to cart</Button>
        )}
      </div>
    </article>
  );
}

export function ProductRow({ items, heading, eyebrow, action }: { items: Product[]; heading: string; eyebrow: string; action?: string }) {
  return (
    <section className="section">
      <div className="shell">
        <div className="section-head">
          <div><span className="eyebrow">{eyebrow}</span><h2>{heading}</h2></div>
          {action && <Link to="/products" className="text-link">{action} <ArrowRight size={15} /></Link>}
        </div>
        <div className="product-grid">{items.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </div>
    </section>
  );
}
