import { useState } from 'react';
import { AlertTriangle, Boxes, Minus, Package, Plus, Search, X, Check } from 'lucide-react';
import { price, productStatus } from './types';
import { useProductStock, useUpdateStock } from '@/lib/queries';
import { useDebounce } from '@/lib/useDebounce';
import { useToast } from '@/components/Toast';

export function Stock() {
  const { data: products, isLoading } = useProductStock();
  const updateStock = useUpdateStock();
  const showToast = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const debouncedSearch = useDebounce(search, 250);

  const list = products ?? [];
  const q = debouncedSearch.toLowerCase();
  const filtered = list.filter((p) =>
    (filter === 'all' || productStatus(p.stock) === filter) &&
    (!q || p.name.toLowerCase().includes(q) || (p as { brand?: string }).brand?.toLowerCase().includes(q)),
  );

  const inStockCount = list.filter((p) => productStatus(p.stock) === 'in-stock').length;
  const lowStockCount = list.filter((p) => productStatus(p.stock) === 'low-stock').length;
  const outStockCount = list.filter((p) => productStatus(p.stock) === 'out-of-stock').length;
  const stockValue = list.reduce((s, p) => s + p.price * p.stock, 0);

  const adjust = async (id: string, name: string, current: number, delta: number) => {
    const next = Math.max(0, current + delta);
    try {
      await updateStock.mutateAsync({ id, stock: next });
      showToast('success', `${name} stock updated to ${next} units.`);
    } catch {
      showToast('error', `Could not update stock for ${name}.`);
    }
  };

  const setStock = async (id: string, name: string, value: number) => {
    const next = Math.max(0, Math.floor(value));
    try {
      await updateStock.mutateAsync({ id, stock: next });
      showToast('success', `${name} stock set to ${next} units.`);
    } catch {
      showToast('error', `Could not update stock for ${name}.`);
    }
  };

  const toggleInStock = async (id: string, name: string, current: number) => {
    const next = current > 0 ? 0 : 50;
    try {
      await updateStock.mutateAsync({ id, stock: next });
      showToast('success', next > 0 ? `${name} marked as in stock.` : `${name} marked as out of stock.`);
    } catch {
      showToast('error', `Could not toggle stock for ${name}.`);
    }
  };

  if (isLoading) return <div className="track-loading"><Boxes className="spin" size={36} /><p>Loading inventory…</p></div>;

  return (
    <div>
      <div className="admin__stats">
        <div className="admin-stat admin-stat--delivered"><span className="admin-stat__icon"><Check size={16} /></span><div><strong>{inStockCount}</strong><small>In stock</small></div></div>
        <div className="admin-stat admin-stat--pending"><span className="admin-stat__icon"><AlertTriangle size={16} /></span><div><strong>{lowStockCount}</strong><small>Low stock</small></div></div>
        <div className="admin-stat admin-stat--cancelled"><span className="admin-stat__icon"><X size={16} /></span><div><strong>{outStockCount}</strong><small>Out of stock</small></div></div>
        <div className="admin-stat"><span className="admin-stat__icon"><Package size={16} /></span><div><strong>{price(stockValue)}</strong><small>Stock value</small></div></div>
      </div>

      <div className="admin__bar">
        <div className="admin__filters">
          <button className={`filter ${filter === 'all' ? 'filter--active' : ''}`} onClick={() => setFilter('all')}>All ({list.length})</button>
          <button className={`filter ${filter === 'in-stock' ? 'filter--active' : ''}`} onClick={() => setFilter('in-stock')}>In stock ({inStockCount})</button>
          <button className={`filter ${filter === 'low-stock' ? 'filter--active' : ''}`} onClick={() => setFilter('low-stock')}>Low stock ({lowStockCount})</button>
          <button className={`filter ${filter === 'out-of-stock' ? 'filter--active' : ''}`} onClick={() => setFilter('out-of-stock')}>Out of stock ({outStockCount})</button>
        </div>
        <label className="sort admin__search"><Search size={15} /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" /></label>
      </div>

      {filtered.length === 0 ? (
        <div className="track__empty"><Boxes size={36} /><h3>No products found</h3></div>
      ) : (
        <div className="admin__table">
          <div className="admin__row admin__row--head admin__row--stock"><span>Product</span><span>Category</span><span>Price</span><span>Stock level</span><span>Adjust</span><span>Status</span><span>Toggle</span></div>
          {filtered.map((p) => {
            const status = productStatus(p.stock);
            return (
              <div className="admin__row admin__row--stock" key={p.id}>
                <div className="admin__product-name">
                  {p.image && <img src={p.image} alt="" className="admin__row-thumb" />}
                  <div><strong>{p.name}</strong><span>{(p as { brand?: string }).brand}</span></div>
                </div>
                <span className="admin__items-count">{(p as { category?: string }).category}</span>
                <div className="admin__total">{price(p.price)}</div>
                <input
                  type="number"
                  className="admin__stock-input"
                  value={p.stock}
                  disabled={updateStock.isPending}
                  onChange={(e) => setStock(p.id, p.name, Number(e.target.value))}
                />
                <div className="admin__stock-adjust">
                  <button className="admin__step-btn" disabled={updateStock.isPending} onClick={() => adjust(p.id, p.name, p.stock, -1)}><Minus size={14} /></button>
                  <button className="admin__step-btn" disabled={updateStock.isPending} onClick={() => adjust(p.id, p.name, p.stock, 1)}><Plus size={14} /></button>
                </div>
                <div><span className={`order-status order-status--${status === 'in-stock' ? 'delivered' : status === 'low-stock' ? 'pending' : 'cancelled'}`}>{status.replace('-', ' ')}</span></div>
                <button className={`btn btn--sm ${p.stock > 0 ? 'btn--outline' : 'btn--primary'}`} disabled={updateStock.isPending} onClick={() => toggleInStock(p.id, p.name, p.stock)}>
                  {p.stock > 0 ? 'Mark out' : 'Restock'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
