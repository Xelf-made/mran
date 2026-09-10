import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Check, Lock, Package, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ProductCard';
import { PageShell } from '@/components/PageShell';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/supabase';

const price = (value: number) => `KSh ${value.toLocaleString()}`;

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [payment, setPayment] = useState('mpesa');
  const [form, setForm] = useState({ email: '', phone: '', name: '', address: '', city: 'Nairobi', area: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shipping = subtotal >= 3000 ? 0 : 200;
  const total = subtotal + shipping;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    if (user) {
      const orderItems = items.map((item) => ({ name: item.name, brand: item.brand, price: item.price, quantity: item.quantity, image: item.image }));
      const { data, error: insertError } = await supabase.from('orders').insert({
        total,
        delivery_fee: shipping,
        payment_method: payment,
        items: orderItems,
        delivery_name: form.name,
        delivery_phone: form.phone,
        delivery_address: form.address,
        delivery_area: form.area,
      }).select('order_number').single();

      if (insertError) { setError('Could not place order. Please try again.'); setSubmitting(false); return; }
      setOrderNumber(data.order_number);
    }

    clearCart();
    setPlaced(true);
    setSubmitting(false);
    window.scrollTo(0, 0);
  };

  if (placed) return <PageShell><div className="shell empty empty--success"><span className="success-icon"><Check size={40} /></span><span className="eyebrow">Order received</span><h1>Thank you for your order.</h1><p>Your confirmation and delivery updates are on their way. A pharmacist will review any prescription items before dispatch.</p>{user && orderNumber ? <p className="empty__order-no">Your order number is <strong>{orderNumber}</strong></p> : null}<div className="hero__cta">{user && <Link to="/track" className="btn btn--primary">Track your order <ArrowRight size={16} /></Link>}<Link to="/products" className="btn btn--outline">Continue shopping</Link></div></div></PageShell>;

  return (
    <PageShell>
      <section className="shell checkout">
        <div className="page-title"><span className="eyebrow">Almost there</span><h1>Checkout</h1><p>{user ? 'Signed in — your order will be saved for tracking.' : 'Guest checkout available · sign in to track your order.'}</p></div>
        {items.length === 0 ? <div className="empty"><h3>Your cart is empty</h3><Link to="/products" className="btn btn--primary">Shop products</Link></div> : (
          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={submit}>
              <fieldset><legend>Contact details</legend>
                <div className="field-row"><label>Email<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@email.com" /></label><label>Phone<input type="tel" required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+254 700 000 000" /></label></div>
              </fieldset>
              <fieldset><legend>Delivery address</legend>
                <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your full name" /></label>
                <label>Delivery address<input required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Street, building or estate" /></label>
                <div className="field-row"><label>City / town<input required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Nairobi" /></label><label>Area / landmark<input required value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} placeholder="e.g. Naivasha Road" /></label></div>
              </fieldset>
              <fieldset><legend>Payment method</legend>
                <div className="pay-options">
                  <label className={`pay-option ${payment === 'mpesa' ? 'pay-option--active' : ''}`}><input type="radio" name="payment" value="mpesa" checked={payment === 'mpesa'} onChange={() => setPayment('mpesa')} /><span className="pay-option__icon pay-option__mpesa">M</span><span><strong>M-Pesa Express</strong><small>Receive a secure STK push prompt on your phone</small></span><span className="pay-tag">Recommended</span></label>
                  <label className={`pay-option ${payment === 'card' ? 'pay-option--active' : ''}`}><input type="radio" name="payment" value="card" checked={payment === 'card'} onChange={() => setPayment('card')} /><span className="pay-option__icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg></span><span><strong>Card payment</strong><small>Visa and Mastercard accepted</small></span></label>
                  <label className={`pay-option ${payment === 'cod' ? 'pay-option--active' : ''}`}><input type="radio" name="payment" value="cod" checked={payment === 'cod'} onChange={() => setPayment('cod')} /><span className="pay-option__icon"><Truck size={18} /></span><span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span></label>
                </div>
                {payment === 'mpesa' && <label className="mpesa-field">M-Pesa phone number<input type="tel" required placeholder="+254 700 000 000" /></label>}
                {payment === 'card' && <div className="card-fields"><label>Card number<input required placeholder="0000 0000 0000 0000" /></label><div className="field-row"><label>Expiry<input required placeholder="MM / YY" /></label><label>CVC<input required placeholder="123" /></label></div></div>}
              </fieldset>
              {error && <div className="auth__error">{error}</div>}
              <Button type="submit" className="checkout__place" >{submitting ? 'Placing order…' : <>Place order · {price(total)} <ArrowRight size={16} /></>}</Button>
              <p className="checkout__secure"><Lock size={14} /> Your payment is encrypted and secure.</p>
            </form>
            <aside className="summary summary--checkout">
              <h2>Your order</h2>
              <div className="checkout-items">{items.map((item) => <div className="checkout-item" key={item.id}><img src={item.image} alt={item.name} /><div><strong>{item.name}</strong><span>{item.brand} · Qty {item.quantity}</span></div><b>{price(item.price * item.quantity)}</b></div>)}</div>
              <hr />
              <div className="summary__row"><span>Subtotal</span><strong>{price(subtotal)}</strong></div>
              <div className="summary__row"><span>Delivery</span><strong>{shipping === 0 ? 'Free' : price(shipping)}</strong></div>
              <hr />
              <div className="summary__total"><span>Total</span><strong>{price(total)}</strong></div>
              <div className="checkout__trust"><ShieldCheck size={16} /> Secure checkout · 7-day returns · Genuine products</div>
              <div className="checkout__ppb"><BadgeCheck size={15} /> PPB Lic. 123456 · Moran Pharmacy, Naivasha Road, Nairobi</div>
              {!user && <div className="checkout__signin"><Package size={16} /> <span>Want to track your order? <Link to="/login" onClick={() => navigate('/login')}>Sign in</Link> or <Link to="/signup" onClick={() => navigate('/signup')}>create an account</Link>.</span></div>}
            </aside>
          </div>
        )}
      </section>
    </PageShell>
  );
}
