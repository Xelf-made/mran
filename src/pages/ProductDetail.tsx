import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BadgeCheck, Check, Lock, Minus, Package, Plus, RefreshCw, ShieldCheck, ShoppingBag, Truck, Upload } from 'lucide-react';
import { Button, Stars } from '@/components/ProductCard';
import { PageShell } from '@/components/PageShell';
import { useProductDetail, useProductsCatalog } from '@/lib/queries';
import { mapToProduct, type Product } from '@/lib/types';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/useAuth';
import { useHasApprovedPrescription, useUploadPrescription } from '@/lib/queries';
import { useCustomerPrescriptionRealtime } from '@/lib/usePrescriptionsRealtime';
import { useToast } from '@/components/Toast';

const price = (value: number) => `KSh ${value.toLocaleString()}`;

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: productRow, isLoading, isError, refetch } = useProductDetail(id);
  const { data: catalog } = useProductsCatalog();
  const { addItem } = useCart();
  const { user, demoUser } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const product: Product | undefined = useMemo(() => {
    if (!productRow) return undefined;
    return mapToProduct(productRow);
  }, [productRow]);

  const related: Product[] = useMemo(() => {
    if (!catalog || !product) return [];
    return catalog
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4)
      .map(mapToProduct);
  }, [catalog, product]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const imgs = product.images.length > 0 ? product.images : [product.image];
    return imgs.filter(Boolean);
  }, [product]);

  useEffect(() => {
    setActiveImage(0);
  }, [product?.id]);

  const userId = user?.id ?? demoUser?.id ?? '';
  const isRx = Boolean(product?.prescription);
  const { data: hasApproved, isLoading: checkingApproval } = useHasApprovedPrescription(userId);
  useCustomerPrescriptionRealtime(userId);
  const uploadMutation = useUploadPrescription();
  const [uploading, setUploading] = useState(false);

  if (isLoading) return <PageShell><div className="shell detail"><div className="detail__skeleton"><div className="skeleton skeleton--media" /><div className="skeleton skeleton--info" /></div></div></PageShell>;

  if (isError) return <PageShell><div className="shell empty"><Package size={36} /><h3>Couldn't load this product</h3><p>There was a problem connecting to our catalog.</p><button className="btn btn--primary" onClick={() => refetch()}><RefreshCw size={16} /> Retry</button></div></PageShell>;

  if (!product) return <PageShell><div className="shell empty"><h2>Product not found</h2><Link to="/products" className="btn btn--primary">Back to products</Link></div></PageShell>;

  const isLocked = isRx && !hasApproved;

  const add = () => {
    if (isRx && !hasApproved) {
      showToast('error', 'This medicine requires a prescription. Please upload one to unlock it.');
      return;
    }
    for (let i = 0; i < quantity; i += 1) addItem(product);
    navigate('/cart');
  };

  const handleUpload = async (file: File) => {
    if (!userId) {
      showToast('error', 'Please sign in to upload a prescription.');
      navigate('/login');
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
    <PageShell>
      <section className="shell detail">
        <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
        <div className="detail__grid">
          <div className={`detail__media ${isLocked ? 'detail__media--locked' : ''}`}>
            <div className="detail__gallery-main">
              <img src={galleryImages[activeImage] ?? product.image} alt={product.name} />
              {isLocked && (
                <div className="detail__lock-overlay">
                  <Lock size={36} />
                  <span>Prescription Required</span>
                  <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onFileChange} hidden />
                  <button type="button" className="detail__lock-upload" onClick={() => fileRef.current?.click()}>
                    {uploading ? 'Uploading…' : <><Upload size={16} /> Upload Prescription</>}
                  </button>
                </div>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="detail__thumbs">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`detail__thumb ${idx === activeImage ? 'detail__thumb--active' : ''}`}
                    onClick={() => setActiveImage(idx)}
                    type="button"
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="detail__info">
            <span className="eyebrow">{product.brand} · {product.category}</span>
            <h1>{product.name}</h1>
            <div className="detail__meta"><Stars rating={product.rating} /><span className="detail__reviews">{product.rating} · {product.reviews} reviews</span></div>
            <div className="detail__price"><strong>{price(product.price)}</strong>{product.oldPrice && <del>{price(product.oldPrice)}</del>}</div>
            {isRx && (
              <p className={`detail__rx ${isLocked ? 'detail__rx--locked' : ''}`}>
                {isLocked ? <Lock size={16} /> : <BadgeCheck size={16} />}
                {isLocked
                  ? 'Prescription required — upload a valid prescription to unlock and purchase this medicine.'
                  : 'Prescription medicine — your prescription has been verified. Our pharmacist will review your order before dispensing.'}
              </p>
            )}
            <p className="detail__desc">{product.description}</p>
            {isLocked ? (
              <div className="detail__locked-actions">
                <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onFileChange} hidden />
                <Button onClick={() => fileRef.current?.click()} className="detail__upload-btn">
                  {uploading ? 'Uploading…' : <><Upload size={17} /> Upload prescription</>}
                </Button>
                {!user && !demoUser && <Link to="/login" className="btn btn--outline detail__signin-link">Sign in first</Link>}
              </div>
            ) : (
              <>
                <div className="detail__qty"><span>Quantity</span><div className="qty"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14} /></button><b>{quantity}</b><button onClick={() => setQuantity(quantity + 1)}><Plus size={14} /></button></div></div>
                <Button onClick={add} className="detail__add">
                  {isRx && checkingApproval ? 'Checking prescription…' : <><ShoppingBag size={17} /> Add to cart · {price(product.price * quantity)}</>}
                </Button>
              </>
            )}
            <div className="detail__notes"><span><Truck size={17} /> Free delivery over KSh 3,000</span><span><RefreshCw size={17} /> 7-day returns</span><span><ShieldCheck size={17} /> Secure checkout</span></div>
            <ul className="detail__list"><li><Check size={15} /> 100% genuine product</li><li><Check size={15} /> Sourced from verified suppliers</li><li><Check size={15} /> Pharmacist-reviewed orders</li></ul>
          </div>
        </div>
        {related.length > 0 && <div className="detail__related"><div className="section-head"><div><span className="eyebrow">You may also like</span><h2>Related products</h2></div><Link to="/products" className="text-link">View all <ArrowRight size={15} /></Link></div><div className="product-grid">{related.map((item) => <ProductCardSmall key={item.id} product={item} />)}</div></div>}
      </section>
    </PageShell>
  );
}

function ProductCardSmall({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { user, demoUser } = useAuth();
  const showToast = useToast();
  const userId = user?.id ?? demoUser?.id ?? '';
  const isRx = Boolean(product.prescription);
  const { data: hasApproved } = useHasApprovedPrescription(userId);
  const isLocked = isRx && !hasApproved;
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadPrescription();
  const [uploading, setUploading] = useState(false);

  const handleClick = () => {
    if (isLocked) {
      showToast('error', 'This medicine requires a prescription. Please upload one to unlock it.');
      return;
    }
    addItem(product);
  };

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
      <div className="pcard__media">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.tag && <span className="pcard__tag">{product.tag}</span>}
        {isLocked ? (
          <span className="pcard__lock-badge">
            <Lock size={20} />
            Prescription Required
            <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onFileChange} hidden />
            <button type="button" className="pcard__lock-upload" onClick={(e) => { e.preventDefault(); fileRef.current?.click(); }}>
              {uploading ? 'Uploading…' : <><Upload size={13} /> Upload</>}
            </button>
          </span>
        ) : (
          <Link to={`/products/${product.id}`} className="pcard__view">View <ArrowRight size={13} /></Link>
        )}
      </div>
      <div className="pcard__body">
        <p className="pcard__brand">{product.brand}</p>
        <Link to={`/products/${product.id}`} className="pcard__name">{product.name}</Link>
        <div className="pcard__price"><strong>{price(product.price)}</strong>{product.oldPrice && <del>{price(product.oldPrice)}</del>}</div>
        {isLocked ? (
          <Button variant="outline" className="pcard__add" onClick={() => fileRef.current?.click()}>
            {uploading ? 'Uploading…' : <><Upload size={14} /> Upload Rx</>}
          </Button>
        ) : (
          <Button onClick={handleClick} className="pcard__add">Add to cart</Button>
        )}
      </div>
    </article>
  );
}
