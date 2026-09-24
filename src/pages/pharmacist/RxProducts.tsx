import { useState } from 'react';
import { Pill, Search } from 'lucide-react';
import { useRxProducts, type RxProduct } from '@/lib/queries';

const price = (value: number) => `KSh ${value.toLocaleString()}`;

export function RxProducts() {
  const { data: products, isLoading, error } = useRxProducts();
  const [search, setSearch] = useState('');

  if (isLoading) return <div className="track-loading"><Pill className="spin" size={36} /><p>Loading Rx products…</p></div>;
  if (error) return <div className="auth__error">Could not load prescription products.</div>;

  const all: RxProduct[] = products ?? [];
  const filtered = all.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="admin__stats">
        <div className="admin-stat"><span className="admin-stat__icon"><Pill size={16} /></span><div><strong>{all.length}</strong><small>Rx products</small></div></div>
      </div>

      <div className="admin__bar">
        <div className="admin__filters" />
        <label className="sort admin__search"><Search size={15} /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Rx products" /></label>
      </div>

      {filtered.length === 0 ? (
        <div className="track__empty"><Pill size={36} /><h3>No prescription products found</h3><p>Products marked as requiring a prescription will appear here.</p></div>
      ) : (
        <div className="admin__table">
          <div className="admin__row admin__row--head admin__row--products">
            <span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Description</span>
          </div>
          {filtered.map((product) => (
            <div className="admin__row admin__row--products" key={product.id}>
              <div className="admin__product-name">
                <img src={product.image} alt={product.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                <div><strong>{product.name}</strong><span>{product.brand}</span></div>
              </div>
              <span className="admin__items-count">{product.category}</span>
              <div className="admin__total">{price(product.price)}</div>
              <div className="admin__stock">{product.stock} units</div>
              <div className="admin__items-count" style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
