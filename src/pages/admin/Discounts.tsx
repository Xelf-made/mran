import { useState } from 'react';
import { Loader2, Search, Tag, TrendingDown } from 'lucide-react';
import { price } from './types';
import { useProductStock, useUpdateDiscount } from '@/lib/queries';
import { useDebounce } from '@/lib/useDebounce';
import { useToast } from '@/components/Toast';

interface DiscountRow {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  price: number;
  compare_at_price: number | null;
  old_price: number | null;
  tag: string | null;
  image?: string;
}

export function Discounts() {
  const { data: products, isLoading } = useProductStock();
  const updateDiscount = useUpdateDiscount();
  const showToast = useToast();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Record<string, { compare_at_price: string; old_price: string; tag: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 250);

  const list = (products ?? []) as unknown as DiscountRow[];
  const q = debouncedSearch.toLowerCase();
  const filtered = list.filter((p) => !q || p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));

  const onSaleCount = list.filter((p) => (p.compare_at_price && p.compare_at_price > p.price) || (p.old_price && p.old_price > p.price)).length;
  const taggedCount = list.filter((p) => p.tag).length;
  const savingsValue = list.reduce((s, p) => s + ((p.compare_at_price ?? p.old_price ?? 0) - p.price > 0 ? (p.compare_at_price ?? p.old_price ?? 0) - p.price : 0), 0);

  const getEdit = (p: DiscountRow) => editing[p.id] ?? {
    compare_at_price: p.compare_at_price?.toString() ?? '',
    old_price: p.old_price?.toString() ?? '',
    tag: p.tag ?? '',
  };

  const setEdit = (p: DiscountRow, field: 'compare_at_price' | 'old_price' | 'tag', value: string) => {
    setEditing((prev) => ({ ...prev, [p.id]: { ...getEdit(p), [field]: value } }));
  };

  const save = async (p: DiscountRow) => {
    const edit = getEdit(p);
    setSavingId(p.id);
    const compareAt = edit.compare_at_price.trim() ? Number(edit.compare_at_price) : null;
    const oldPrice = edit.old_price.trim() ? Number(edit.old_price) : null;
    const tag = edit.tag.trim() || null;
    try {
      await updateDiscount.mutateAsync({ id: p.id, compare_at_price: compareAt, old_price: oldPrice, tag });
      setEditing((prev) => { const next = { ...prev }; delete next[p.id]; return next; });
      showToast('success', `Discount rules saved for ${p.name}.`);
    } catch {
      showToast('error', `Could not save discount for ${p.name}.`);
    }
    setSavingId(null);
  };

  if (isLoading) return <div className="track-loading"><TrendingDown className="spin" size={36} /><p>Loading discounts…</p></div>;

  return (
    <div>
      <div className="admin__stats">
        <div className="admin-stat admin-stat--delivered"><span className="admin-stat__icon"><TrendingDown size={16} /></span><div><strong>{onSaleCount}</strong><small>On sale</small></div></div>
        <div className="admin-stat admin-stat--pending"><span className="admin-stat__icon"><Tag size={16} /></span><div><strong>{taggedCount}</strong><small>Tagged</small></div></div>
        <div className="admin-stat"><span className="admin-stat__icon"><TrendingDown size={16} /></span><div><strong>{price(savingsValue)}</strong><small>Total savings</small></div></div>
      </div>

      <div className="admin__bar">
        <div className="admin__filters" />
        <label className="sort admin__search"><Search size={15} /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" /></label>
      </div>

      {filtered.length === 0 ? (
        <div className="track__empty"><TrendingDown size={36} /><h3>No products found</h3></div>
      ) : (
        <div className="admin__table">
          <div className="admin__row admin__row--head admin__row--discounts"><span>Product</span><span>Price</span><span>Compare-at</span><span>Old price</span><span>Promo tag</span><span>Discount</span><span></span></div>
          {filtered.map((p) => {
            const edit = getEdit(p);
            const compareAt = edit.compare_at_price.trim() ? Number(edit.compare_at_price) : null;
            const oldPrice = edit.old_price.trim() ? Number(edit.old_price) : null;
            const refPrice = compareAt ?? oldPrice;
            const discountPct = refPrice && refPrice > p.price ? Math.round(((refPrice - p.price) / refPrice) * 100) : 0;
            const dirty = JSON.stringify(edit) !== JSON.stringify({ compare_at_price: p.compare_at_price?.toString() ?? '', old_price: p.old_price?.toString() ?? '', tag: p.tag ?? '' });
            return (
              <div className="admin__row admin__row--discounts" key={p.id}>
                <div className="admin__product-name">
                  {p.image && <img src={p.image} alt="" className="admin__row-thumb" />}
                  <div><strong>{p.name}</strong><span>{p.brand}</span></div>
                </div>
                <div className="admin__total">{price(p.price)}</div>
                <input type="number" className="admin__discount-input" placeholder="KSh" value={edit.compare_at_price} onChange={(e) => setEdit(p, 'compare_at_price', e.target.value)} />
                <input type="number" className="admin__discount-input" placeholder="KSh" value={edit.old_price} onChange={(e) => setEdit(p, 'old_price', e.target.value)} />
                <input type="text" className="admin__discount-input" placeholder="e.g. Best seller" value={edit.tag} onChange={(e) => setEdit(p, 'tag', e.target.value)} />
                <div>{discountPct > 0 ? <span className="order-status order-status--delivered">{discountPct}% off</span> : <span className="order-status order-status--pending">No discount</span>}</div>
                <button className="btn btn--sm btn--primary" disabled={!dirty || savingId === p.id} onClick={() => save(p)}>
                  {savingId === p.id ? <Loader2 size={14} className="spin" /> : 'Save'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
