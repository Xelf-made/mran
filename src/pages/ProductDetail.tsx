import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BadgeCheck, Check, Minus, Plus, RefreshCw, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { Button, Stars } from '@/components/ProductCard';
import { PageShell } from '@/components/PageShell';
import { products } from '@/data/products';
import { useCart } from '@/contexts/cart-context';

const price = (value: number) => `KSh ${value.toLocaleString()}`;

export function ProductDetail() {
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id));
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  if (!product) return <PageShell><div className="shell empty"><h2>Product not found</h2><Link to="/products" className="btn btn--primary">Back to products</Link></div></PageShell>;

  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  const add = () => { for (let i = 0; i < quantity; i += 1) addItem(product); navigate('/cart'); };

  return (
    <PageShell>
      <section className="shell detail">
        <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
        <div className="detail__grid">
          <div className="detail__media"><img src={product.image} alt={product.name} /></div>
          <div className="detail__info">
            <span className="eyebrow">{product.brand} · {product.category}</span>
            <h1>{product.name}</h1>
            <div className="detail__meta"><Stars rating={product.rating} /><span className="detail__reviews">{product.rating} · {product.reviews} reviews</span></div>
            <div className="detail__price"><strong>{price(product.price)}</strong>{product.oldPrice && <del>{price(product.oldPrice)}</del>}</div>
            {product.prescription && <p className="detail__rx"><BadgeCheck size={16} /> Prescription medicine — our pharmacist will review your order before dispensing.</p>}
            <p className="detail__desc">{product.description}</p>
            <div className="detail__qty"><span>Quantity</span><div className="qty"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14} /></button><b>{quantity}</b><button onClick={() => setQuantity(quantity + 1)}><Plus size={14} /></button></div></div>
            <Button onClick={add} className="detail__add"><ShoppingBag size={17} /> Add to cart · {price(product.price * quantity)}</Button>
            <div className="detail__notes"><span><Truck size={17} /> Free delivery over KSh 3,000</span><span><RefreshCw size={17} /> 7-day returns</span><span><ShieldCheck size={17} /> Secure checkout</span></div>
            <ul className="detail__list"><li><Check size={15} /> 100% genuine product</li><li><Check size={15} /> Sourced from verified suppliers</li><li><Check size={15} /> Pharmacist-reviewed orders</li></ul>
          </div>
        </div>
        {related.length > 0 && <div className="detail__related"><div className="section-head"><div><span className="eyebrow">You may also like</span><h2>Related products</h2></div><Link to="/products" className="text-link">View all <ArrowRight size={15} /></Link></div><div className="product-grid">{related.map((item) => <ProductCardSmall key={item.id} product={item} />)}</div></div>}
      </section>
    </PageShell>
  );
}

function ProductCardSmall({ product }: { product: typeof products[number] }) {
  const { addItem } = useCart();
  return <article className="pcard"><Link to={`/products/${product.id}`} className="pcard__media"><img src={product.image} alt={product.name} loading="lazy" />{product.tag && <span className="pcard__tag">{product.tag}</span>}<span className="pcard__view">View <ArrowRight size={13} /></span></Link><div className="pcard__body"><p className="pcard__brand">{product.brand}</p><Link to={`/products/${product.id}`} className="pcard__name">{product.name}</Link><div className="pcard__price"><strong>{price(product.price)}</strong>{product.oldPrice && <del>{price(product.oldPrice)}</del>}</div><Button onClick={() => addItem(product)} className="pcard__add">Add to cart</Button></div></article>;
}
