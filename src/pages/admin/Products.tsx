import { useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Clock, Edit3, Eye, Image as ImageIcon, Loader2, Package, Plus, Search, TrendingUp, Upload, X } from 'lucide-react';
import type { AdminProduct } from './types';
import { price, productStatus } from './types';
import { useAdminProducts, useSaveProduct, useDeleteProduct, useToggleStock } from '@/lib/queries';
import { supabase } from '@/lib/supabase';

const CATEGORIES = ['Medicines', 'Vitamins & Supplements', 'Personal Care', 'Mother & Baby', 'Medical Devices', 'Wellness'];
const PAGE_SIZE = 20;

const emptyForm: Omit<AdminProduct, 'id'> = {
  name: '', brand: '', category: 'Medicines', price: 0, old_price: null,
  rating: 0, reviews: 0, image: '', image_urls: null, tag: null, is_new: false,
  prescription: false, stock: 0, sales: 0, description: '',
};

export function Products() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<Omit<AdminProduct, 'id'>>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useAdminProducts(page, PAGE_SIZE);
  const saveMutation = useSaveProduct();
  const deleteMutation = useDeleteProduct();
  const toggleMutation = useToggleStock();

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setForm({ name: p.name, brand: p.brand, category: p.category, price: p.price, old_price: p.old_price, rating: p.rating, reviews: p.reviews, image: p.image, image_urls: p.image_urls, tag: p.tag, is_new: p.is_new, prescription: p.prescription, stock: p.stock, sales: p.sales, description: p.description });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await saveMutation.mutateAsync({ editing, payload: form });
      setModalOpen(false);
    } catch {
      setError('Could not save product.');
    }
  };

  const toggleStock = async (p: AdminProduct) => {
    const newStock = p.stock > 0 ? 0 : 50;
    try { await toggleMutation.mutateAsync({ id: p.id, stock: newStock }); }
    catch { /* surfaced by mutation state */ }
  };

  const deleteProduct = async (p: AdminProduct) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { await deleteMutation.mutateAsync(p.id); }
    catch { setError('Could not delete product.'); }
  };

  const filtered = products.filter((p) =>
    (filter === 'all' || productStatus(p.stock) === filter) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))
  );

  const stockValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock = products.filter((p) => productStatus(p.stock) === 'low-stock').length;
  const outStock = products.filter((p) => productStatus(p.stock) === 'out-of-stock').length;

  if (isLoading) return <div className="track-loading"><Package className="spin" size={36} /><p>Loading products…</p></div>;

  return (
    <div>
      {error && <div className="auth__error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="admin__stats">
        <div className="admin-stat"><span className="admin-stat__icon"><Package size={16} /></span><div><strong>{total}</strong><small>Products</small></div></div>
        <div className="admin-stat"><span className="admin-stat__icon"><TrendingUp size={16} /></span><div><strong>{price(stockValue)}</strong><small>Stock value (page)</small></div></div>
        <div className="admin-stat admin-stat--pending"><span className="admin-stat__icon"><Clock size={16} /></span><div><strong>{lowStock}</strong><small>Low stock</small></div></div>
        <div className="admin-stat admin-stat--cancelled"><span className="admin-stat__icon"><X size={16} /></span><div><strong>{outStock}</strong><small>Out of stock</small></div></div>
      </div>

      <div className="admin__bar">
        <div className="admin__filters">
          <button className={`filter ${filter === 'all' ? 'filter--active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter ${filter === 'in-stock' ? 'filter--active' : ''}`} onClick={() => setFilter('in-stock')}>In stock</button>
          <button className={`filter ${filter === 'low-stock' ? 'filter--active' : ''}`} onClick={() => setFilter('low-stock')}>Low stock</button>
          <button className={`filter ${filter === 'out-of-stock' ? 'filter--active' : ''}`} onClick={() => setFilter('out-of-stock')}>Out of stock</button>
        </div>
        <div className="admin__bar-right">
          <label className="sort admin__search"><Search size={15} /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" /></label>
          <button className="btn btn--primary btn--sm" onClick={openAdd}><Plus size={16} /> Add product</button>
        </div>
      </div>

      <div className="admin__table">
        <div className="admin__row admin__row--head admin__row--products"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Status</span><span>Sales</span><span>Actions</span></div>
        {filtered.map((product) => {
          const status = productStatus(product.stock);
          return (
            <div className="admin__row admin__row--products" key={product.id}>
              <div className="admin__product-name"><strong>{product.name}</strong><span>{product.brand}</span></div>
              <span className="admin__items-count">{product.category}</span>
              <div className="admin__total">{price(product.price)}</div>
              <div className="admin__stock">{product.stock} units</div>
              <div><span className={`order-status order-status--${status === 'in-stock' ? 'delivered' : status === 'low-stock' ? 'pending' : 'cancelled'}`}>{status.replace('-', ' ')}</span></div>
              <div className="admin__items-count">{product.sales}</div>
              <div className="admin__row-actions">
                <button className="admin__icon-btn" title="View" onClick={() => openEdit(product)}><Eye size={15} /></button>
                <button className="admin__icon-btn" title="Edit" onClick={() => openEdit(product)}><Edit3 size={15} /></button>
                <button className="admin__icon-btn admin__icon-btn--danger" title="Toggle stock" onClick={() => toggleStock(product)}><Package size={15} /></button>
                <button className="admin__icon-btn admin__icon-btn--danger" title="Delete" onClick={() => deleteProduct(product)}><X size={15} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="admin__bar" style={{ justifyContent: 'center', marginTop: 20 }}>
          <button className="btn btn--outline btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Prev</button>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5a704e' }}>Page {page} of {totalPages}</span>
          <button className="btn btn--outline btn--sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
        </div>
      )}

      {modalOpen && <ProductModal editing={editing} form={form} setForm={setForm} saving={saveMutation.isPending} error={error} onClose={() => setModalOpen(false)} onSave={save} />}
    </div>
  );
}

function ImageUploader({ currentUrl, onUploaded }: { currentUrl: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      onUploaded(data.publicUrl);
    } catch {
      setError('Upload failed. Please try again.');
    }
    setUploading(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <label className="auth__field">
      <span>Product image</span>
      <div className="image-uploader">
        <input ref={inputRef} type="file" accept="image/*" onChange={onChange} hidden />
        {currentUrl ? (
          <div className="image-uploader__preview">
            <img src={currentUrl} alt="Product preview" />
            <button type="button" className="image-uploader__replace" onClick={() => inputRef.current?.click()}>
              {uploading ? <Loader2 size={15} className="spin" /> : <Upload size={15} />} Replace
            </button>
          </div>
        ) : (
          <button type="button" className="image-uploader__drop" onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 size={24} className="spin" /> : <ImageIcon size={24} />}
            <span>{uploading ? 'Uploading…' : 'Click to upload image'}</span>
          </button>
        )}
        {error && <span className="image-uploader__error">{error}</span>}
      </div>
    </label>
  );
}

function GalleryUploader({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      onChange([...images, data.publicUrl]);
    } catch {
      setError('Upload failed. Please try again.');
    }
    setUploading(false);
  };

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const removeAt = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <label className="auth__field">
      <span>Gallery images (optional)</span>
      <div className="gallery-uploader">
        <div className="gallery-uploader__grid">
          {images.map((url, idx) => (
            <div key={idx} className="gallery-uploader__thumb">
              <img src={url} alt={`Gallery ${idx + 1}`} />
              <button type="button" className="gallery-uploader__remove" onClick={() => removeAt(idx)}><X size={13} /></button>
            </div>
          ))}
          <button type="button" className="gallery-uploader__add" onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 size={20} className="spin" /> : <Plus size={20} />}
            <span>{uploading ? 'Uploading…' : 'Add image'}</span>
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={onChangeFile} hidden />
        {error && <span className="image-uploader__error">{error}</span>}
      </div>
    </label>
  );
}

function ProductModal({ editing, form, setForm, saving, error, onClose, onSave }: {
  editing: AdminProduct | null;
  form: Omit<AdminProduct, 'id'>;
  setForm: React.Dispatch<React.SetStateAction<Omit<AdminProduct, 'id'>>>;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}) {
  const field = (label: string, key: keyof typeof form, type: string = 'text', placeholder?: string): ReactNode => (
    <label className="auth__field">
      <span>{label}</span>
      <div className="auth__input-wrap">
        <input type={type} value={form[key] as string | number} placeholder={placeholder}
          onChange={(e) => setForm((prev) => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))} />
      </div>
    </label>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>{editing ? 'Edit product' : 'Add new product'}</h3>
          <button className="modal__close" onClick={onClose}><X size={20} /></button>
        </div>
        <form className="account__settings-form" onSubmit={onSave}>
          {field('Product name', 'name', 'text', 'e.g. Amoxil 500mg')}
          <div className="field-row">
            {field('Brand', 'brand', 'text', 'e.g. MORAN PHARMACY')}
            <label className="auth__field"><span>Category</span><div className="auth__input-wrap">
              <select className="admin__select" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div></label>
          </div>
          <div className="field-row">
            {field('Price (KSh)', 'price', 'number')}
            {field('Old price (KSh)', 'old_price', 'number')}
          </div>
          <div className="field-row">
            {field('Stock', 'stock', 'number')}
            {field('Sales', 'sales', 'number')}
          </div>
          <div className="field-row">
            {field('Rating (0-5)', 'rating', 'number')}
            {field('Reviews', 'reviews', 'number')}
          </div>
          <ImageUploader currentUrl={form.image} onUploaded={(url) => setForm((prev) => ({ ...prev, image: url }))} />
          <GalleryUploader images={form.image_urls ?? []} onChange={(imgs) => setForm((prev) => ({ ...prev, image_urls: imgs }))} />
          {field('Tag (optional)', 'tag', 'text', 'e.g. Best seller')}
          {field('Description', 'description', 'text', 'Product description')}
          <div className="account__notif-list">
            <div className="account__notif-item"><div><strong>New product</strong><span>Show in new arrivals</span></div>
              <button type="button" className={`toggle-switch ${form.is_new ? 'toggle-switch--on' : ''}`} onClick={() => setForm((prev) => ({ ...prev, is_new: !prev.is_new }))}><span className="toggle-switch__knob" /></button>
            </div>
            <div className="account__notif-item"><div><strong>Prescription required</strong><span>Pharmacist review before dispatch</span></div>
              <button type="button" className={`toggle-switch ${form.prescription ? 'toggle-switch--on' : ''}`} onClick={() => setForm((prev) => ({ ...prev, prescription: !prev.prescription }))}><span className="toggle-switch__knob" /></button>
            </div>
          </div>
          {error && <div className="auth__error">{error}</div>}
          <div className="admin__settings-actions">
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save product'}</button>
            <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
