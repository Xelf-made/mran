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

const img = (url: string) => `${url}&auto=format&w=900&q=80`;

export const products: Product[] = [
  { id: 1, name: 'Amoxil 500mg Capsules', brand: 'MORAN PHARMACY', category: 'Medicines', price: 450, oldPrice: 520, rating: 4.8, reviews: 124, image: img('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj7uJv4Y2Ae58nIJcRa1YF4Bf4WuMIARQuWwZe2ADH0Q&s=10'), tag: 'Best seller', isNew: false, prescription: true, description: 'Genuine Amoxil 500mg capsules supplied by Moran Pharmacy. Prescription medicines are dispensed after pharmacist review.' },
  { id: 2, name: 'Paracetamol 500mg Tablets', brand: 'MORAN PHARMACY', category: 'Medicines', price: 320, oldPrice: 380, rating: 4.7, reviews: 203, image: img('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFXQjoWe9akKqPIlHxkAOVqnfhzT1ZrAT_2Yd8WugpWw&s=10'), tag: null, isNew: false, description: 'A reliable daily pain and fever relief essential. Always follow the directions on the pack.' },
  { id: 3, name: 'Cetirizine 10mg Tablets', brand: 'MORAN PHARMACY', category: 'Medicines', price: 280, oldPrice: null, rating: 4.5, reviews: 167, image: img('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxgbpf6T3T70Td-VoIRCxONYfX5AGNBZUoR5ozRMRcqA&s=10'), tag: 'Allergy relief', isNew: false, description: 'A convenient non-drowsy allergy relief option for seasonal allergies and hay fever.' },
  { id: 4, name: 'Vitamin C 1000mg + Zinc', brand: 'MORAN WELLNESS', category: 'Vitamins & Supplements', price: 890, oldPrice: null, rating: 4.9, reviews: 87, image: img('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWDNTJrDb-QmTG1f49q4CLWcWodFZ1OmzJwbHh0nHlNA&s=10'), tag: 'Top rated', isNew: false, description: 'A daily vitamin C and zinc combination to complement a balanced diet and active lifestyle.' },
  { id: 5, name: 'Multivitamin Daily Pack', brand: 'MORAN WELLNESS', category: 'Vitamins & Supplements', price: 1250, oldPrice: null, rating: 4.6, reviews: 56, image: img('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZYfE8v13WhXIgdxgrZrEcIlnQPxTWuPYZiebi2pYd5Q&s=10'), tag: 'Limited stock', isNew: true, description: 'A simple daily multivitamin pack for everyday nutritional support.' },
  { id: 6, name: 'Omega-3 Fish Oil 1000mg', brand: 'MORAN WELLNESS', category: 'Vitamins & Supplements', price: 1750, oldPrice: 1950, rating: 4.7, reviews: 78, image: img('https://nutridom.ca/cdn/shop/files/Omega_3_fish_oil_1000_mg_EPA_180_mg_DHA_120_mg_300_softgels.jpg?v=1773078415'), tag: null, isNew: false, description: 'A quality fish oil supplement with omega-3 fatty acids for your daily wellness routine.' },
  { id: 7, name: 'CeraVe Moisturizing Cream', brand: 'CERAVE', category: 'Personal Care', price: 2100, oldPrice: 2500, rating: 4.9, reviews: 142, image: img('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjGwQ3JpYRBeo8D-XuYNzNYihWNqn5oSKjkEegp17IKiO-3BDfoc_6hJk&s=10'), tag: 'Best seller', isNew: false, description: 'A rich, barrier-supporting moisturizer for dry skin on the face and body.' },
  { id: 8, name: 'Gentle Daily Face Cleanser', brand: 'MORAN CARE', category: 'Personal Care', price: 980, oldPrice: null, rating: 4.7, reviews: 61, image: img('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRw9xww-9kL0MAsAXRKpyxOxTbTyiqYQfTKeugrzNzpEFpacxCw2Ooym6E&s=10'), tag: 'New', isNew: true, description: 'A gentle daily cleanser that refreshes skin without leaving it feeling tight or stripped.' },
  { id: 9, name: 'Baby Gentle Care Set', brand: 'MORAN BABY', category: 'Mother & Baby', price: 1850, oldPrice: 2200, rating: 4.8, reviews: 94, image: img('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB--CTi6AeXxaDefRnVq8-tzo97IMWKvkoF6ZRSQntDw&s=10'), tag: 'New parent pick', isNew: true, description: 'A gentle everyday care set made for delicate baby skin and new family routines.' },
  { id: 10, name: 'Blood Pressure Monitor', brand: 'OMRON', category: 'Medical Devices', price: 4500, oldPrice: null, rating: 4.8, reviews: 34, image: img('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ18izSxjlGXHKtFo9THL5bXoZtLcfNxdCGDn6NEeddbA&s=10'), tag: null, isNew: false, description: 'A clear, easy-to-use home monitor for keeping track of blood pressure between appointments.' },
  { id: 11, name: 'Digital Thermometer', brand: 'MORAN CARE', category: 'Medical Devices', price: 650, oldPrice: 800, rating: 4.6, reviews: 73, image: img('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbGpKgCORkrOfICw_yaPFLcTFFjljSSFHhuFrlOmHQug&s=10'), tag: 'Everyday essential', isNew: false, description: 'A quick-read digital thermometer for accurate home temperature checks.' },
  { id: 12, name: 'Aloe & Shea Body Lotion', brand: 'MORAN CARE', category: 'Wellness', price: 720, oldPrice: null, rating: 4.8, reviews: 49, image: img('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtr4rDOZ-QnDidOfnvxOlZhkTXpOzHwQXnkt6cRT6m-A&s'), tag: null, isNew: true, description: 'A nourishing body lotion with aloe and shea butter for soft, comfortable skin.' },
];

export const categories: { name: ProductCategory; count: string; image: string; blurb: string }[] = [
  { name: 'Medicines', count: '342 products', blurb: 'Trusted relief, delivered.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZmvYfHDjGS9RZ31nKNEYs6pdVvrZfyAGPgBdZjJ9qSg&s=10' },
  { name: 'Vitamins & Supplements', count: '187 products', blurb: 'Support your everyday.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh5mN0uq0p9qNA0rJAKN3XUFqMD2nS928rbMR69CU12A&s=10' },
  { name: 'Personal Care', count: '215 products', blurb: 'Care that feels good.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQxLD5cLx_QWPt3GsGpK0h9cMkcWbnDO5q0v5_LU52-g&s=10' },
  { name: 'Mother & Baby', count: '126 products', blurb: 'Gentle care for little ones.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvuKtg8vlnwQHWnLGl6dQQeU5qTrV6KnCn-g7W5i6NVA&s=10' },
  { name: 'Medical Devices', count: '67 products', blurb: 'Know your numbers.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9_kY5JdJBHujFa6ducX-KUWQH-SZf2Dmx8iTvmJn4fA&s=10' },
  { name: 'Wellness', count: '94 products', blurb: 'Small steps, better days.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJutYFraoTqlKjawuqwMWgb4_XFGxqG2lNnArkdImKGA&s=10' },
];

export interface Testimonial { id: number; name: string; location: string; quote: string; rating: number; avatar: string; }
export const testimonials: Testimonial[] = [
  { id: 1, name: 'Wanjiku M.', location: 'Kilimani, Nairobi', rating: 5, quote: 'Moran always delivers genuine products on time. I can order my family essentials without leaving home.', avatar: 'https://images.pexels.com/photos/2530364/pexels-photo-2530364.jpeg?auto=compress&cs=tinysrgb&h=300&w=300' },
  { id: 2, name: 'Brian O.', location: 'Westlands, Nairobi', rating: 5, quote: 'The pharmacist chat was so helpful and the M-Pesa checkout was quick. Excellent service.', avatar: 'https://images.pexels.com/photos/6333501/pexels-photo-6333501.jpeg?auto=compress&cs=tinysrgb&h=300&w=300' },
  { id: 3, name: 'Amina K.', location: 'Karen, Nairobi', rating: 5, quote: 'I love that I can get our baby care, vitamins and skincare in one trusted place. Highly recommend Moran.', avatar: 'https://images.pexels.com/photos/2112714/pexels-photo-2112714.jpeg?auto=compress&cs=tinysrgb&h=300&w=300' },
];
