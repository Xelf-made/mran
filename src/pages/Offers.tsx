import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, Copy, Gift, Tag, TrendingDown, Truck } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { useProductsCatalog } from '@/lib/queries';
import { useStoreSettings } from '@/lib/queries';
import { products as staticProducts } from '@/data/products';
import { useToast } from '@/components/Toast';

interface DiscountedProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  old_price: number | null;
  image: string;
  tag: string | null;
}

interface Coupon {
  code: string;
  description: string;
  type: 'percent' | 'flat' | 'bogo';
  badge: string;
}

const coupons: Coupon[] = [
  { code: 'MORAN500', description: 'KSh 500 off orders above KSh 5,000', type: 'flat', badge: 'KSh 500 off' },
  { code: 'WELLNESS20', description: '20% off all vitamins & supplements', type: 'percent', badge: '20% off' },
  { code: 'BOGOCARE', description: 'Buy one get one free on personal care', type: 'bogo', badge: 'BOGO' },
];

const banners = [
  { id: 1, title: 'Wellness Week', subtitle: '20% off all vitamins & supplements', badge: '-20%', cls: 'offers__banner--emerald' },
  { id: 2, title: 'Family Care Bundle', subtitle: 'Save KSh 600 on essential combos', badge: 'Save KSh 600', cls: 'offers__banner--amber' },
  { id: 3, title: 'Personal Care BOGO', subtitle: 'Buy one, get one free — mix & match', badge: 'BOGO', cls: 'offers__banner--blue' },
];

type SortKey = 'biggest-savings' | 'discount-pct' | 'price-low' | 'price-high';

const sortLabels: { key: SortKey; label: string }[] = [
  { key: 'biggest-savings', label: 'Biggest savings' },
  { key: 'discount-pct', label: 'Highest % off' },
  { key: 'price-low', label: 'Price: low to high' },
  { key: 'price-high', label: 'Price: high to low' },
];

export function OffersPage() {
  const showToast = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('biggest-savings');
  const [bannerIdx, setBannerIdx] = useState(0);

  const { data: catalogData } = useProductsCatalog();
  const { data: settings } = useStoreSettings();

  const copyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    showToast('success', `Coupon code ${code} copied to clipboard.`);
    setTimeout(() => setCopied(null), 2000);
  };

  // Aggregate products with active discounts (old_price > price)
  const discountedProducts = useMemo<DiscountedProduct[]>(() => {
    const source = catalogData && catalogData.length > 0
      ? catalogData
      : staticProducts.map((p) => ({ id: p.id, name: p.name, brand: p.brand, category: p.category, price: p.price, old_price: p.oldPrice, image: p.image, tag: p.tag, is_new: p.isNew, prescription: p.prescription, rating: p.rating, reviews: p.reviews, stock: 100, sales: 0, description: p.description }));

    const withDiscount = (source as DiscountedProduct[]).filter(
      (p) => p.old_price !== null && p.old_price > p.price
    );

    const sorted = [...withDiscount];
    if (sort === 'biggest-savings') sorted.sort((a, b) => (b.old_price! - b.price) - (a.old_price! - a.price));
    if (sort === 'discount-pct') sorted.sort((a, b) => ((b.old_price! - b.price) / b.old_price!) - ((a.old_price! - a.price) / a.old_price!));
    if (sort === 'price-low') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }, [catalogData, sort]);

  const freeDeliveryThreshold = settings?.free_delivery_threshold ?? 3000;
  const totalSavings = discountedProducts.reduce((sum, p) => sum + (p.old_price! - p.price), 0);

  return (
    <PageShell>
      <section className="page-hero page-hero--offers">
        <div className="shell">
          <span className="eyebrow">Deals & promotions</span>
          <h1>Save more on your pharmacy essentials</h1>
          <p>Active discounts, bundle deals, coupon codes, and free delivery — all in one place.</p>
        </div>
      </section>

      <section className="shell offers">
        {/* Banner carousel */}
        <div className="offers__carousel">
          <div className={`offers__banner ${banners[bannerIdx].cls}`}>
            <div className="offers__banner-badge">{banners[bannerIdx].badge}</div>
            <div className="offers__banner-text">
              <h3>{banners[bannerIdx].title}</h3>
              <p>{banners[bannerIdx].subtitle}</p>
            </div>
            <Link to="/products" className="offers__banner-cta">Shop now <ArrowRight size={15} /></Link>
          </div>
          <div className="offers__carousel-dots">
            {banners.map((b, i) => (
              <button
                key={b.id}
                className={`offers__dot ${i === bannerIdx ? 'offers__dot--active' : ''}`}
                onClick={() => setBannerIdx(i)}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Discounted products grid */}
        <div className="offers__section-head">
          <div>
            <h2>On-sale products</h2>
            <p>{discountedProducts.length} products with active discounts · Total savings worth KSh {totalSavings.toLocaleString()}</p>
          </div>
          <div className="offers__sort">
            <TrendingDown size={16} />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {sortLabels.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {discountedProducts.length === 0 ? (
          <div className="rx-history__empty">
            <BadgePercent size={36} />
            <h3>No active discounts right now</h3>
            <p>Check back soon — new deals are added regularly.</p>
          </div>
        ) : (
          <div className="offers__product-grid">
            {discountedProducts.map((p) => {
              const savings = p.old_price! - p.price;
              const pct = Math.round((savings / p.old_price!) * 100);
              return (
                <Link to={`/products/${p.id}`} className="offer-product" key={p.id}>
                  <div className="offer-product__media">
                    <img src={p.image} alt={p.name} loading="lazy" />
                    <span className="offer-product__pct">-{pct}%</span>
                    <span className="offer-product__save">Save KSh {savings.toLocaleString()}</span>
                  </div>
                  <div className="offer-product__body">
                    <p className="offer-product__brand">{p.brand}</p>
                    <strong className="offer-product__name">{p.name}</strong>
                    <div className="offer-product__price">
                      <strong>KSh {p.price.toLocaleString()}</strong>
                      <del>KSh {p.old_price!.toLocaleString()}</del>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Coupon codes section */}
        <div className="offers__coupons">
          <div className="offers__section-head">
            <div>
              <h2>Active coupon codes</h2>
              <p>Apply these codes at checkout for extra savings</p>
            </div>
          </div>
          <div className="offers__coupon-grid">
            {coupons.map((c) => {
              const icon = c.type === 'percent' ? BadgePercent : c.type === 'bogo' ? Tag : Gift;
              const Icon = icon;
              return (
                <div className="coupon-card" key={c.code}>
                  <div className="coupon-card__head">
                    <span className="coupon-card__badge">{c.badge}</span>
                    <Icon size={20} className="coupon-card__icon" />
                  </div>
                  <p className="coupon-card__desc">{c.description}</p>
                  <button className="coupon-card__code" onClick={() => copyCoupon(c.code)}>
                    <span>{copied === c.code ? 'Copied!' : c.code}</span>
                    <Copy size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Free delivery banner */}
        <div className="offers__delivery-banner">
          <div className="offers__delivery-icon"><Truck size={28} /></div>
          <div className="offers__delivery-text">
            <strong>Free delivery in Nairobi on orders above KSh {freeDeliveryThreshold.toLocaleString()}</strong>
            <span>Same-day delivery available. M-Pesa Express checkout supported.</span>
          </div>
          <Link to="/products" className="btn btn--primary offers__delivery-cta">Start shopping <ArrowRight size={15} /></Link>
        </div>
      </section>
    </PageShell>
  );
}
