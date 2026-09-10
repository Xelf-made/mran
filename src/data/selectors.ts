import { products } from '@/data/products';

export const featuredPicks = () => products.filter((p) => p.tag === 'Bestseller').slice(0, 4);
export const newArrivals = () => products.filter((p) => p.isNew).slice(0, 4);
export const trending = () => [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);
