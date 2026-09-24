import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Package, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useWishlist, useRemoveWishlistItem, type WishlistItem } from '@/lib/queries';
import { useCart } from '@/contexts/cart-context';
import { demoWishlist } from '@/data/demo';
import type { Product } from '@/data/products';
import { price } from './shared';

interface NormalizedWish {
  id: number;
  wishId: string;
  name: string;
  brand: string;
  price: number;
  oldPrice: number | null;
  image: string;
  rating: number;
  inStock: boolean;
}

export function Wishlist() {
  const { user, demoUser } = useAuth();
  const isDemo = Boolean(demoUser);
  const userId = user?.id ?? '';

  const { data: liveWishlist, isLoading, error } = useWishlist(userId);
  const removeMutation = useRemoveWishlistItem(userId);
  const { addItem } = useCart();

  const items: NormalizedWish[] = isDemo
    ? demoWishlist.map((item) => ({
        id: item.id, wishId: String(item.id), name: item.name, brand: item.brand,
        price: item.price, oldPrice: null, image: item.image, rating: item.rating, inStock: item.inStock,
      }))
    : (liveWishlist ?? []).map((item: WishlistItem) => ({
        id: item.product_id, wishId: item.id, name: item.product.name, brand: item.product.brand,
        price: item.product.price, oldPrice: item.product.old_price, image: item.product.image,
        rating: item.product.rating, inStock: item.product.stock > 0,
      }));

  const handleRemove = async (wishId: string) => {
    if (isDemo) return;
    try { await removeMutation.mutateAsync(wishId); } catch { /* surfaced */ }
  };

  const moveToCart = (item: NormalizedWish) => {
    const product: Product = {
      id: item.id,
      name: item.name,
      brand: item.brand,
      category: 'Medicines',
      price: item.price,
      oldPrice: item.oldPrice,
      rating: item.rating,
      reviews: 0,
      image: item.image,
      tag: null,
      isNew: false,
      description: '',
      prescription: false,
    };
    addItem(product);
  };

  if (!isDemo && isLoading) return <div className="track-loading"><Package className="spin" size={36} /><p>Loading wishlist…</p></div>;
  if (!isDemo && error) return <div className="auth__error">Could not load your wishlist.</div>;

  return (
    <div>
      <h3>Wishlist ({items.length})</h3>
      {items.length === 0 ? (
        <div className="track__empty">
          <Heart size={42} />
          <h3>Your wishlist is empty</h3>
          <p>Save products you love to find them quickly later.</p>
          <Link to="/products" className="btn btn--primary">Browse products <ArrowRight size={16} /></Link>
        </div>
      ) : (
        <div className="account__wishlist">
          {items.map((item) => (
            <div key={item.id} className="account__wish-item">
              <Link to={`/products/${item.id}`} className="account__wish-img"><img src={item.image} alt={item.name} /></Link>
              <div className="account__wish-info">
                <strong>{item.name}</strong>
                <span>{item.brand}</span>
                <div className="account__stars">{'★'.repeat(Math.floor(item.rating))}<span>{'★'.repeat(5 - Math.floor(item.rating))}</span></div>
              </div>
              <div className="account__wish-stock">
                <span className={`order-status order-status--${item.inStock ? 'delivered' : 'cancelled'}`}>{item.inStock ? 'In stock' : 'Out of stock'}</span>
              </div>
              <strong className="account__wish-price">{price(item.price)}</strong>
              <div className="account__wish-actions">
                <button className="btn btn--primary btn--sm" onClick={() => moveToCart(item)}>Add to cart</button>
                <button className="account__addr-action account__addr-action--danger" onClick={() => handleRemove(item.wishId)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
