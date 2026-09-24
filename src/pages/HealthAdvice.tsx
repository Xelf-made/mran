import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Search, Stethoscope } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { products } from '@/data/products';

type Topic = 'All' | 'Wellness' | 'Dosage Guides' | 'Skincare Tips' | 'Chronic Care';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  topic: Exclude<Topic, 'All'>;
  readTime: string;
  date: string;
  body: string;
  relatedProductIds: number[];
}

const articles: Article[] = [
  {
    id: 1,
    title: '5 Daily Habits for a Stronger Immune System',
    excerpt: 'Simple, evidence-based changes you can make today to support your body\'s natural defenses.',
    topic: 'Wellness',
    readTime: '4 min read',
    date: '12 Sep 2026',
    body: 'From adequate sleep to vitamin C and zinc supplementation, building immune resilience doesn\'t have to be complicated. Here are five habits our pharmacists recommend.',
    relatedProductIds: [4, 5, 6],
  },
  {
    id: 2,
    title: 'Understanding Paracetamol: Safe Dosage for Adults and Children',
    excerpt: 'A pharmacist\'s guide to correct paracetamol dosing, intervals, and when to seek medical advice.',
    topic: 'Dosage Guides',
    readTime: '6 min read',
    date: '8 Sep 2026',
    body: 'Paracetamol is one of the most used medicines in Kenyan households. This guide covers safe adult and pediatric dosing, maximum daily limits, and common mistakes to avoid.',
    relatedProductIds: [2],
  },
  {
    id: 3,
    title: 'Building a Simple Skincare Routine for Dry Skin',
    excerpt: 'A dermatologist-approved three-step routine using products available at Moran Pharmacy.',
    topic: 'Skincare Tips',
    readTime: '5 min read',
    date: '3 Sep 2026',
    body: 'Dry skin needs gentle cleansing, barrier-repairing moisturizers, and consistent hydration. Here\'s how to build a routine that works with products you can order today.',
    relatedProductIds: [7, 8, 12],
  },
  {
    id: 4,
    title: 'Managing Hypertension: Home Monitoring and Lifestyle Tips',
    excerpt: 'How to track your blood pressure at home and lifestyle changes that make a real difference.',
    topic: 'Chronic Care',
    readTime: '7 min read',
    date: '28 Aug 2026',
    body: 'High blood pressure affects millions of Kenyans. Regular home monitoring, salt reduction, and movement can help you stay in control. Here\'s what our pharmacists advise.',
    relatedProductIds: [10],
  },
  {
    id: 5,
    title: 'Vitamin C and Zinc: Do You Need Supplements?',
    excerpt: 'When supplementation helps and when you\'re better off getting nutrients from food.',
    topic: 'Wellness',
    readTime: '4 min read',
    date: '22 Aug 2026',
    body: 'Supplements can fill gaps, but they aren\'t a substitute for a balanced diet. This article explains when vitamin C and zinc supplementation is genuinely beneficial.',
    relatedProductIds: [4, 6],
  },
  {
    id: 6,
    title: 'A Parent\'s Guide to Baby Skincare Essentials',
    excerpt: 'Gentle, fragrance-free products and a simple routine for delicate baby skin.',
    topic: 'Skincare Tips',
    readTime: '5 min read',
    date: '15 Aug 2026',
    body: 'Baby skin is thinner and more sensitive than adult skin. Here\'s how to choose gentle, fragrance-free products and build a simple care routine for your little one.',
    relatedProductIds: [9],
  },
];

const topics: Topic[] = ['All', 'Wellness', 'Dosage Guides', 'Skincare Tips', 'Chronic Care'];

export function HealthAdvicePage() {
  const [topic, setTopic] = useState<Topic>('All');
  const [search, setSearch] = useState('');
  const [openArticle, setOpenArticle] = useState<Article | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return articles.filter(
      (a) => (topic === 'All' || a.topic === topic) && (!q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q))
    );
  }, [topic, search]);

  const relatedProducts = (ids: number[]) => products.filter((p) => ids.includes(p.id));

  return (
    <PageShell>
      <section className="page-hero">
        <div className="shell">
          <span className="eyebrow">Health advice center</span>
          <h1>Trusted health guidance from our pharmacists</h1>
          <p>Evidence-based articles on wellness, dosage, skincare, and managing chronic conditions — with products our team recommends.</p>
        </div>
      </section>

      <section className="shell health-advice">
        <div className="health-advice__bar">
          <div className="health-advice__topics">
            {topics.map((t) => (
              <button key={t} className={`filter ${topic === t ? 'filter--active' : ''}`} onClick={() => setTopic(t)}>{t}</button>
            ))}
          </div>
          <label className="sort health-advice__search"><Search size={15} /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles" /></label>
        </div>

        {filtered.length === 0 ? (
          <div className="track__empty"><Stethoscope size={36} /><h3>No articles found</h3><p>Try a different topic or search term.</p></div>
        ) : (
          <div className="health-advice__grid">
            {filtered.map((article) => (
              <article className="article-card" key={article.id} onClick={() => setOpenArticle(article)}>
                <div className="article-card__top">
                  <span className="article-card__topic">{article.topic}</span>
                  <span className="article-card__time"><Clock size={13} /> {article.readTime}</span>
                </div>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <div className="article-card__footer">
                  <span>{article.date}</span>
                  <span className="article-card__read">Read more <ArrowRight size={14} /></span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {openArticle && (
        <div className="modal-overlay" onClick={() => setOpenArticle(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__head">
              <h3>{openArticle.title}</h3>
              <button className="modal__close" onClick={() => setOpenArticle(null)}>×</button>
            </div>
            <div className="article-modal__body">
              <div className="article-modal__meta">
                <span className="article-card__topic">{openArticle.topic}</span>
                <span><Clock size={13} /> {openArticle.readTime}</span>
                <span>{openArticle.date}</span>
              </div>
              <p className="article-modal__text">{openArticle.body}</p>
              {relatedProducts(openArticle.relatedProductIds).length > 0 && (
                <div className="article-modal__products">
                  <h4>Recommended products</h4>
                  <div className="article-modal__product-list">
                    {relatedProducts(openArticle.relatedProductIds).map((p) => (
                      <Link to={`/products/${p.id}`} className="article-modal__product" key={p.id} onClick={() => setOpenArticle(null)}>
                        <img src={p.image} alt={p.name} loading="lazy" />
                        <div>
                          <strong>{p.name}</strong>
                          <span>KSh {p.price.toLocaleString()}</span>
                        </div>
                        <ArrowRight size={15} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
