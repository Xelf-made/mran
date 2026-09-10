import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, LogOut, Package, PackageCheck, Truck, Box, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { PageShell } from '@/components/PageShell';
import { demoOrders } from '@/data/demo';

const price = (value: number) => `KSh ${value.toLocaleString()}`;
const STATUS_LABELS: Record<string, string> = { pending: 'Order placed', confirmed: 'Confirmed', packed: 'Packed', dispatched: 'Dispatched', delivered: 'Delivered', cancelled: 'Cancelled' };
const STATUS_ICONS: Record<string, typeof Clock> = { pending: Clock, confirmed: CheckCircle2, packed: Package, dispatched: Truck, delivered: PackageCheck, cancelled: Box };

export function TrackPage() {
  const { demoUser, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  const isDemo = Boolean(demoUser);
  const orders = demoOrders;
  const email = demoUser?.email ?? user?.email ?? '';

  if (!demoUser && !user) {
    return (
      <PageShell>
        <div className="shell track-auth">
          <div className="track-auth__card">
            <Package size={42} />
            <h1>Sign in to track your orders</h1>
            <p>Log in to view your order history and track deliveries in real time.</p>
            <div className="track-auth__cta">
              <Link to="/login" className="btn btn--primary">Sign in <ArrowRight size={16} /></Link>
              <Link to="/signup" className="btn btn--outline">Create account</Link>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="shell track">
        <div className="track__head">
          <div>
            <span className="eyebrow">Order tracking</span>
            <h1>Track your orders</h1>
            <p className="track__welcome">{email}</p>
          </div>
          <div className="track__head-actions">
            <Link to="/account" className="btn btn--outline track__signout"><Package size={16} /> My account</Link>
            <button className="btn btn--outline track__signout" onClick={async () => { await signOut(); navigate('/'); }}><LogOut size={16} /> Sign out</button>
          </div>
        </div>

        {isDemo && <div className="account__demo-banner"><CheckCircle2 size={16} /> Demo mode — showing sample orders for demonstration.</div>}

        {orders.length === 0 ? (
          <div className="track__empty">
            <Package size={42} />
            <h3>No orders yet</h3>
            <p>When you place an order it will appear here with live tracking.</p>
            <Link to="/products" className="btn btn--primary">Browse products <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <div className="track__list">
            {orders.map((order) => {
              const isExpanded = expanded === order.id;
              const Icon = STATUS_ICONS[order.status] ?? Clock;
              return (
                <article key={order.id} className={`order-card ${isExpanded ? 'order-card--open' : ''}`}>
                  <button className="order-card__head" onClick={() => setExpanded(isExpanded ? null : order.id)}>
                    <div className="order-card__icon"><Icon size={22} /></div>
                    <div className="order-card__info">
                      <strong>{order.order_number}</strong>
                      <span>{new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })} · {price(order.total)}</span>
                    </div>
                    <span className={`order-status order-status--${order.status}`}>{STATUS_LABELS[order.status]}</span>
                    {isExpanded ? <ChevronUp size={18} className="order-card__chevron" /> : <ChevronDown size={18} className="order-card__chevron" />}
                  </button>

                  {isExpanded && (
                    <div className="order-card__body">
                      <div className="order-tracking">
                        {order.tracking_steps.map((step, index) => (
                          <div key={index} className={`track-step ${step.done ? 'track-step--done' : ''} ${index === order.tracking_steps.filter((s) => s.done).length - 1 && step.done ? 'track-step--current' : ''}`}>
                            <div className="track-step__dot">{step.done ? <CheckCircle2 size={16} /> : <span>{index + 1}</span>}</div>
                            <div className="track-step__label">{step.label}{step.timestamp && step.done ? <small>{new Date(step.timestamp).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</small> : null}</div>
                            {index < order.tracking_steps.length - 1 && <div className="track-step__line" />}
                          </div>
                        ))}
                      </div>

                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <div className="order-item" key={index}>
                            <img src={item.image} alt={item.name} />
                            <div><strong>{item.name}</strong><span>{item.brand} · Qty {item.quantity}</span></div>
                            <b>{price(item.price * item.quantity)}</b>
                          </div>
                        ))}
                      </div>

                      <div className="order-card__footer">
                        <div className="order-card__address">
                          <span className="eyebrow">Delivery to</span>
                          <strong>{order.delivery_name}</strong>
                          <span>{order.delivery_address}, {order.delivery_area}</span>
                          <span>{order.delivery_phone}</span>
                        </div>
                        <div className="order-card__summary">
                          <div className="summary__row"><span>Subtotal</span><strong>{price(order.total - order.delivery_fee)}</strong></div>
                          <div className="summary__row"><span>Delivery</span><strong>{order.delivery_fee === 0 ? 'Free' : price(order.delivery_fee)}</strong></div>
                          <div className="summary__total"><span>Total</span><strong>{price(order.total)}</strong></div>
                          <div className="order-card__pay">Paid via {order.payment_method === 'mpesa' ? 'M-Pesa' : order.payment_method === 'card' ? 'Card' : 'Cash on delivery'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
