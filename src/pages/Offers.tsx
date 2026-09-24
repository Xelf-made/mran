import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, Copy, Gift, Tag, Truck } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { products } from '@/data/products';
import { useToast } from '@/components/Toast';

interface Offer {
  id: number;
  title: string;
  description: string;
  type: 'sale' | 'bundle' | 'bogo' | 'coupon';
  badge: string;
  coupon?: string;
  productIds: number[];
}

const offers: Offer[] = [
  {
    id: 1,
    title: '20% Off All Vitamins & Supplements',
    description: 'Stock up on your daily essentials. From vitamin C to omega-3, everything in the wellness aisle is 20% off this week.',
    type: 'sale',
    badge: '-20%',
    productIds: [4, 5, 6],
  },
  {
    id: 2,
    title: 'Family Care Bundle — Save KSh 600',
    description: 'Get paracetamol, cetirizine, and a digital thermometer together and save KSh 600 on the bundle price.',
    type: 'bundle',
    badge: 'Bundle',
    productIds: [2, 3, 11],
  },
  {
    id: 3,
    title: 'Buy One Get One Free — Personal Care',
    description: 'Buy any personal care product and get a second one free. Mix and match across the range.',
    type: 'bogo',
    badge: 'BOGO',
    productIds: [7, 8, 12],
  },
  {
    id: 4,
    title: 'KSh 500 Off Orders Above KSh 5,000',
    description: 'Use the coupon code below at checkout to save KSh 500 on your order. Valid for one use per customer.',
    type: 'coupon',
    badge: 'Coupon',
    coupon: 'MORAN500',
    productIds: [10, 6, 7],
  },
];

const typeIcon: Record<Offer['type'], typeof Tag> = {
  sale: BadgePercent,
  bundle: Gift,
  bogo: Tag,
  coupon: BadgePercent,
};

export function OffersPage() {
  const showToast = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const copyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    showToast('success', `Coupon code ${code} copied to clipboard.`);
    setTimeout(() => setCopied(null), 2000);
  };

  const offerProducts = (ids: number[]) => products.filter((p) => ids.includes(p.id));

  return (
    <PageShell>
      <section className="page-hero page-hero--offers">
        <div className="shell">
          <span className="eyebrow">Deals & promotions</span>
          <h1>Save more on your pharmacy essentials</h1>
          <p>Current sales, bundle discounts, buy-one-get-one deals, and coupon codes — all in one place.</p>
        </div>
      </section>

      <section className="shell offers">
        <div className="offers__grid">
          {offers.map((offer) => {
            const Icon = typeIcon[offer.type];
            return (
              <div className={`offer-card offer-card--${offer.type}`} key={offer.id}>
                <div className="offer-card__head">
                  <span className="offer-card__badge">{offer.badge}</span>
                  <Icon size={22} className="offer-card__icon" />
                </div>
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
                {offer.coupon && (
                  <button className="offer-card__coupon" onClick={() => copyCoupon(offer.coupon!)}>
                    <span className="offer-card__coupon-code">{copied === offer.coupon ? 'Copied!' : offer.coupon}</span>
                    <Copy size={15} />
                  </button>
                )}
                <div className="offer-card__products">
                  {offerProducts(offer.productIds).map((p) => (
                    <Link to={`/products/${p.id}`} className="offer-card__product" key={p.id}>
                      <img src={p.image} alt={p.name} loading="lazy" />
                      <div>
                        <strong>{p.name}</strong>
                        <span>KSh {p.price.toLocaleString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link to="/products" className="btn btn--primary offer-card__cta">Shop now <ArrowRight size={15} /></Link>
              </div>
            );
          })}
        </div>

        <div className="offers__shipping-banner">
          <Truck size={28} />
          <div>
            <strong>Free delivery in Nairobi on orders above KSh 3,000</strong>
            <span>Same-day delivery available. M-Pesa Express checkout supported.</span>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
