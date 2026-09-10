import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ProductCard';
import { PageShell } from '@/components/PageShell';
import { useCart } from '@/contexts/cart-context';

const price = (value: number) => `KSh ${value.toLocaleString()}`;

export function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const shipping = subtotal >= 3000 || subtotal === 0 ? 0 : 200;

  return (
    <PageShell>
      <section className="shell cart">
        <div className="page-title"><span className="eyebrow">Your selection</span><h1>Shopping cart</h1></div>
        {items.length === 0 ? (
          <div className="empty empty--cart"><ShoppingBag size={42} /><h3>Your cart is empty</h3><p>Add genuine medicines and wellness products to get started.</p><Link to="/products" className="btn btn--primary">Continue shopping <ArrowRight size={16} /></Link></div>
        ) : (
          <div className="cart-layout">
            <div className="cart-lines">
              {items.map((item) => (
                <div className="cart-line" key={item.id}>
                  <Link to={`/products/${item.id}`} className="cart-line__media"><img src={item.image} alt={item.name} /></Link>
                  <div className="cart-line__info">
                    <span className="eyebrow">{item.brand}</span>
                    <Link to={`/products/${item.id}`}>{item.name}</Link>
                    <strong>{price(item.price)}</strong>
                    <button className="cart-line__remove" onClick={() => removeItem(item.id)}><X size={14} /> Remove</button>
                  </div>
                  <div className="qty"><button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button><b>{item.quantity}</b><button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button></div>
                  <div className="cart-line__total">{price(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            <aside className="summary">
              <h2>Order summary</h2>
              <div className="summary__row"><span>Subtotal</span><strong>{price(subtotal)}</strong></div>
              <div className="summary__row"><span>Delivery</span><strong>{shipping === 0 ? 'Free' : price(shipping)}</strong></div>
              {subtotal < 3000 && <p className="summary__note">Add {price(3000 - subtotal)} more for free delivery in Nairobi.</p>}
              <hr />
              <div className="summary__total"><span>Total</span><strong>{price(subtotal + shipping)}</strong></div>
              <Button onClick={() => navigate('/checkout')} className="summary__checkout">Proceed to checkout <ArrowRight size={16} /></Button>
              <Link to="/products" className="summary__continue">Continue shopping</Link>
              <p className="summary__guest">Guest checkout available · M-Pesa Express accepted</p>
            </aside>
          </div>
        )}
      </section>
    </PageShell>
  );
}
