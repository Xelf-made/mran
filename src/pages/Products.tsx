import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { PageShell } from '@/components/PageShell';
import { products, type ProductCategory } from '@/data/products';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

const allCategories: (ProductCategory | 'All')[] = ['All', 'Medicines', 'Vitamins & Supplements', 'Personal Care', 'Mother & Baby', 'Medical Devices', 'Wellness'];

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() ?? '';
  const categoryParam = searchParams.get('category') ?? 'All';
  const category = (allCategories.includes(categoryParam as ProductCategory) ? categoryParam : 'All') as ProductCategory | 'All';
  const [sort, setSort] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  const visible = useMemo(() => {
    let result = products.filter((p) => (category === 'All' || p.category === category) && (!query || `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(query)));
    if (sort === 'price-low') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') result = [...result].sort((a, b) => b.price - a.price);
    if (sort === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [category, query, sort]);

  const updateCategory = (value: ProductCategory | 'All') => { const next: Record<string, string> = {}; if (value !== 'All') next.category = value; if (query) next.q = query; setSearchParams(next); };

  return (
    <PageShell>
      <section className="catalog-hero">
        <div className="shell">
          <span className="eyebrow">The Moran collection</span>
          <h1>{query ? `Results for “${query}”` : category === 'All' ? 'All products' : category}</h1>
          <p>Genuine medicines, wellness and personal care products, delivered across Nairobi and Kenya.</p>
        </div>
      </section>
      <section className="shell catalog">
        <div className="catalog__bar">
          <div className="catalog__filters">
            {allCategories.map((cat) => <button key={cat} onClick={() => updateCategory(cat)} className={`filter ${category === cat ? 'filter--active' : ''}`}>{cat === 'All' ? 'All' : cat}</button>)}
          </div>
          <label className="sort"><SlidersHorizontal size={15} /> Sort <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="featured">Featured</option><option value="rating">Top rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={15} /></label>
        </div>
        {visible.length ? <div className="product-grid product-grid--catalog">{visible.map((p) => <ProductCard key={p.id} product={p} />)}</div> : <div className="empty"><h3>No products found</h3><p>Try a different search or category.</p><button className="btn btn--primary" onClick={() => setSearchParams({})}>Clear filters</button></div>}
      </section>
    </PageShell>
  );
}
