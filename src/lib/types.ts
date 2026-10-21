import type { AdminProduct } from '@/pages/admin/types';

export type ProductCategory = 'Medicines' | 'Vitamins & Supplements' | 'Personal Care' | 'Mother & Baby' | 'Medical Devices' | 'Wellness';

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  oldPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
  tag: string | null;
  isNew: boolean;
  description: string;
  prescription?: boolean;
}

export function mapToProduct(row: AdminProduct): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category as ProductCategory,
    price: row.price,
    oldPrice: row.old_price,
    rating: row.rating,
    reviews: row.reviews,
    image: row.image,
    tag: row.tag,
    isNew: row.is_new,
    description: row.description,
    prescription: row.prescription,
  };
}
