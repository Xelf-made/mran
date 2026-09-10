import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Leaf, MessageCircle, Phone, ShieldCheck, Star, Truck } from 'lucide-react';
import { Button, ProductRow } from '@/components/ProductCard';
import { featuredPicks, newArrivals, trending } from '@/data/selectors';
import { categories, testimonials } from '@/data/products';

const heroImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvMpIZxnoH6vUwwH219NCGGmR5VI3rqUscxbn1KxUbZJ7Pwx6LJAMP8hj9&s=10';
const editorialImage = 'https://user25521.na.imgto.link/public/20260820/982e16ad-7f4a-4280-91ea-f1e83f16cfe8-cb73bbc5-35e8-455c-a30d-e9ba821b21d5.avif';

export function Home() {
  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero__overlay" />
        <div className="shell hero__content">
          <span className="hero__eyebrow"><BadgeCheck size={15} /> Nairobi's trusted online pharmacy</span>
          <h1>Your health,<br /><span>our priority.</span></h1>
          <p>Genuine medicines, wellness products and expert care — delivered to your door across Nairobi and Kenya.</p>
          <div className="hero__cta">
            <Link to="/products" className="btn btn--primary">Shop now <ArrowRight size={17} /></Link>
            <a href="https://wa.me/254700123456" target="_blank" rel="noreferrer" className="btn btn--ghost-light"><MessageCircle size={17} /> Ask a pharmacist</a>
          </div>
        </div>
        <div className="hero__marquee"><p>Genuine medicines · Vitamins & supplements · Personal care · Mother & baby · Medical devices · Wellness · Genuine medicines · Vitamins & supplements ·</p></div>
      </section>

      <section className="trust-strip">
        <div className="shell trust-strip__grid">
          {[[Truck, 'Fast delivery', 'Same-day in Nairobi'], [BadgeCheck, 'Licensed pharmacy', 'PPB Lic. 123456'], [ShieldCheck, 'Secure payments', 'M-Pesa, card & cash'], [Leaf, '100% genuine', 'Verified products']].map(([Icon, title, text]) => <div className="trust-item" key={title as string}><span><Icon size={20} /></span><div><strong>{title as string}</strong><small>{text as string}</small></div></div>)}
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head"><div><span className="eyebrow">Browse our range</span><h2>Shop by category</h2></div><Link to="/products" className="text-link">All categories <ArrowRight size={15} /></Link></div>
          <div className="cat-grid">
            {categories.map((cat) => (
              <Link to={`/products?category=${encodeURIComponent(cat.name)}`} className="cat-card" key={cat.name}>
                <div className="cat-card__media"><img src={cat.image} alt={cat.name} loading="lazy" /><div className="cat-card__overlay" /></div>
                <div className="cat-card__body"><h3>{cat.name}</h3><p>{cat.blurb}</p><span>{cat.count}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ProductRow items={trending()} eyebrow="Customer favourites" heading="Popular products" action="View all" />

      <section className="editorial" style={{ backgroundImage: `url(${editorialImage})` }}>
        <div className="editorial__overlay" />
        <div className="shell editorial__content">
          <span className="eyebrow eyebrow--light">Our promise</span>
          <blockquote>“Genuine. Reliable. Human. We are not just another online pharmacy — we are your wellness partner.”</blockquote>
          <p className="editorial__attr">— The Moran Pharmacy team</p>
          <Link to="/products" className="btn btn--primary">Shop the range <ArrowRight size={16} /></Link>
        </div>
      </section>

      <ProductRow items={newArrivals()} eyebrow="Just landed" heading="New arrivals" action="Shop new in" />
      <ProductRow items={featuredPicks()} eyebrow="Trusted by families" heading="Best sellers" action="View all" />

      <section className="section section--pharmacist">
        <div className="shell pharmacist__inner">
          <div className="pharmacist__media"><img src="https://user25521.na.imgto.link/public/20260820/5dbc2337-f6c0-4def-a9b4-fdb47a52273d.avif" alt="Moran pharmacist helping a customer" loading="lazy" /></div>
          <div className="pharmacist__body">
            <span className="eyebrow">Talk to us</span>
            <h2>Speak to a real pharmacist.</h2>
            <p>Have a question about a medicine, dosage or your order? Our licensed pharmacists are a message away, every day.</p>
            <ul className="pharmacist__list">
              <li><ShieldCheck size={18} /> Licensed, qualified pharmacists</li>
              <li><MessageCircle size={18} /> WhatsApp chat, 7 days a week</li>
              <li><Truck size={18} /> Order tracking and delivery support</li>
            </ul>
            <div className="pharmacist__cta">
              <a href="https://wa.me/254700123456" target="_blank" rel="noreferrer" className="btn btn--primary"><MessageCircle size={17} /> Chat on WhatsApp</a>
              <a href="tel:+254700123456" className="btn btn--outline"><Phone size={16} /> Call us</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--testimonials">
        <div className="shell">
          <div className="section-head"><div><span className="eyebrow">Kind words</span><h2>Trusted by Nairobi families</h2></div></div>
          <div className="testimonials">
            {testimonials.map((item) => (
              <article className="testimonial" key={item.id}>
                <div className="testimonial__stars">{Array.from({ length: item.rating }).map((_, index) => <Star key={index} size={16} fill="currentColor" />)}</div>
                <p>“{item.quote}”</p>
                <div className="testimonial__author"><img src={item.avatar} alt={item.name} loading="lazy" /><div><strong>{item.name}</strong><span>{item.location}</span></div></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="newsletter">
        <div className="shell newsletter__inner">
          <div><span className="eyebrow eyebrow--light">Stay healthy with Moran</span><h2>Health tips & offers, in your inbox.</h2><p>Practical wellness guidance and exclusive offers. No spam, ever.</p></div>
          <form onSubmit={(event) => { event.preventDefault(); window.alert('Thank you for subscribing! You will hear from us soon.'); }}><input type="email" required placeholder="Your email address" /><Button type="submit" variant="primary">Subscribe <ArrowRight size={15} /></Button></form>
        </div>
      </section>
    </>
  );
}
