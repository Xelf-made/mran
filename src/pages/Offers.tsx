import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, SlidersHorizontal, TrendingDown, Truck } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { useProductsCatalog, useStoreSettings } from '@/lib/queries';

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

type SortKey = 'biggest-savings' | 'discount-pct' | 'price-low' | 'price-high';

const sortLabels: { key: SortKey; label: string }[] = [
  { key: 'biggest-savings', label: 'Biggest savings' },
  { key: 'discount-pct', label: 'Highest % off' },
  { key: 'price-low', label: 'Price: low to high' },
  { key: 'price-high', label: 'Price: high to low' },
];

const bannerPalettes = [
  { bg: 'linear-gradient(135deg, #4f8f21 0%, #2b5c10 100%)', accent: '#a0e060' },
  { bg: 'linear-gradient(135deg, #c08020 0%, #8a5c10 100%)', accent: '#f0c060' },
  { bg: 'linear-gradient(135deg, #2050a0 0%, #103a70 100%)', accent: '#60a0e0' },
];

export function OffersPage() {
  const [sort, setSort] = useState<SortKey>('biggest-savings');
  const [bannerIdx, setBannerIdx] = useState(0);

  const { data: catalogData, isLoading } = useProductsCatalog();
  const { data: settings } = useStoreSettings();

  // Aggregate products with active discounts (old_price > price) from live DB only
  const discountedProducts = useMemo<DiscountedProduct[]>(() => {
    if (!catalogData) return [];
    const withDiscount = (catalogData as DiscountedProduct[]).filter(
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

  // Build dynamic banners from the top 3 discounted products
  const banners = useMemo(() => {
    const top = [...discountedProducts]
      .sort((a, b) => (b.old_price! - b.price) - (a.old_price! - a.price))
      .slice(0, 3);
    return top.map((p, i) => {
      const savings = p.old_price! - p.price;
      const pct = Math.round((savings / p.old_price!) * 100);
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        pct,
        savings,
        image: p.image,
        palette: bannerPalettes[i % bannerPalettes.length],
      };
    });
  }, [discountedProducts]);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const activeBanner = banners[bannerIdx];

  return (
    <PageShell>
      <section className="page-hero page-hero--offers">
        <div className="shell">
          <span className="eyebrow">Deals &amp; promotions</span>
          <h1>Save more on your pharmacy essentials</h1>
          <p>Real-time discounts pulled live from our product catalog. No codes needed — sale prices apply automatically at checkout.</p>
        </div>
      </section>

      <section className="shell offers">
        {/* Dynamic banner carousel */}
        {banners.length > 0 && (
          <div className="offers__carousel">
            <div className="offers__banner" style={{ background: activeBanner.palette.bg }}>
              <div className="offers__banner-image">
                <img src={activeBanner.image} alt={activeBanner.name} />
              </div>
              <div className="offers__banner-content">
                <span className="offers__banner-tag">Featured deal</span>
                <h3>{activeBanner.name}</h3>
                <p>{activeBanner.brand} · Save KSh {activeBanner.savings.toLocaleString()} now</p>
                <div className="offers__banner-meta">
                  <span className="offers__banner-pct" style={{ background: activeBanner.palette.accent + '33', color: activeBanner.palette.accent }}>
                    -{activeBanner.pct}%
                  </span>
                  <Link to={`/products/${activeBanner.id}`} className="offers__banner-cta">
                    Shop this deal <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
            {banners.length > 1 && (
              <div className="offers__carousel-dots">
                {banners.map((b, i) => (
                  <button
                    key={b.id}
                    className={`offers__dot ${i === bannerIdx ? 'offers__dot--active' : ''}`}
                    onClick={() => setBannerIdx(i)}
                    aria-label={`View deal ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discounted products grid */}
        <div className="offers__section-head">
          <div>
            <h2>On-sale products</h2>
            <p>{discountedProducts.length} products with active discounts · Total savings worth KSh {totalSavings.toLocaleString()}</p>
          </div>
          <div className="offers__sort">
            <SlidersHorizontal size={16} />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort products">
              {sortLabels.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="offers__product-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="offer-product offer-product--skeleton">
                <div className="offer-product__media skeleton" />
                <div className="offer-product__body">
                  <div className="skeleton skeleton--text skeleton--brand" />
                  <div className="skeleton skeleton--text skeleton--name" />
                  <div className="skeleton skeleton--text skeleton--short" />
                </div>
              </div>
            ))}
          </div>
        ) : discountedProducts.length === 0 ? (
          <div className="rx-history__empty">
            <BadgePercent size={36} />
            <h3>No active discounts right now</h3>
            <p>Check back soon — new deals are added regularly as products go on sale.</p>
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

        {/* Free delivery banner */}
        <div className="offers__delivery-banner">
          <div className="offers__delivery-icon"><Truck size={28} /></div>
          <div className="offers__delivery-text">
            <strong>Free delivery in Nairobi on orders above KSh {freeDeliveryThreshold.toLocaleString()}</strong>
            <span>Same-day delivery available. M-Pesa Express checkout supported. Discount applies automatically — no coupon needed.</span>
          </div>
          <Link to="/products" className="btn btn--primary offers__delivery-cta">Start shopping <ArrowRight size={15} /></Link>
        </div>
      </section>
    </PageShell>
  );
}
