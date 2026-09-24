import { Package } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useCustomerOrders } from '@/lib/queries';
import { demoOrders } from '@/data/demo';
import { price, STATUS_LABELS } from './shared';

export function MyOrders() {
  const { user, demoUser } = useAuth();
  const isDemo = Boolean(demoUser);
  const userId = user?.id ?? '';

  const { data: liveOrders, isLoading, error } = useCustomerOrders(userId);
  const orders = isDemo ? demoOrders : (liveOrders ?? []);

  const downloadReceipt = (orderNumber: string) => {
    const order = orders.find((o) => o.order_number === orderNumber);
    if (!order) return;
    const receipt = {
      order_number: order.order_number,
      date: order.created_at,
      status: order.status,
      total: order.total,
      delivery_fee: order.delivery_fee,
      payment_method: order.payment_method,
      items: order.items,
      delivery_name: order.delivery_name,
      delivery_address: order.delivery_address,
      delivery_area: order.delivery_area,
    };
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.order_number}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isDemo && isLoading) return <div className="track-loading"><Package className="spin" size={36} /><p>Loading orders…</p></div>;
  if (!isDemo && error) return <div className="auth__error">Could not load your orders.</div>;

  return (
    <div>
      <h3>Order history ({orders.length})</h3>
      {orders.length === 0 ? (
        <div className="track__empty"><Package size={36} /><h3>No orders yet</h3><p>Your orders will appear here once you place them.</p></div>
      ) : (
        <div className="account__orders">
          {orders.map((order) => (
            <div key={order.id} className="account__order-row">
              <div className="account__order-main">
                <div className="account__order-icons">
                  {order.items.slice(0, 3).map((item, i) => <img key={i} src={item.image} alt={item.name} />)}
                  {order.items.length > 3 && <span className="account__order-more">+{order.items.length - 3}</span>}
                </div>
                <div className="account__order-info">
                  <strong>{order.order_number}</strong>
                  <span>{new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>{order.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                  <span className="account__order-payment">{order.payment_method.toUpperCase()}</span>
                </div>
              </div>
              <div className="account__order-side">
                <span className={`order-status order-status--${order.status}`}>{STATUS_LABELS[order.status] ?? order.status}</span>
                <strong>{price(order.total)}</strong>
                <button className="account__addr-action" onClick={() => downloadReceipt(order.order_number)}>Download receipt</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
