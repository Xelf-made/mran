export interface DemoOrder {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';
  total: number;
  delivery_fee: number;
  payment_method: 'mpesa' | 'card' | 'cod';
  items: { name: string; brand: string; price: number; quantity: number; image: string }[];
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_area: string;
  created_at: string;
  tracking_steps: { label: string; timestamp: string; done: boolean }[];
}

export interface DemoCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  orders: number;
  totalSpent: number;
  status: 'active' | 'new';
  area: string;
}

export interface DemoAddress {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  area: string;
  city: string;
  isDefault: boolean;
}

export interface DemoPaymentMethod {
  id: string;
  type: 'mpesa' | 'card';
  label: string;
  detail: string;
  isDefault: boolean;
}

export interface AdminProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  sales: number;
}

export interface DemoWishlistItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  rating: number;
  inStock: boolean;
}

const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

export const demoOrders: DemoOrder[] = [
  {
    id: 'o1', order_number: 'MP-1042', status: 'dispatched', total: 3850, delivery_fee: 200, payment_method: 'mpesa',
    items: [
      { name: 'Amoxil 500mg Capsules', brand: 'MORAN PHARMACY', price: 450, quantity: 2, image: 'https://images.pexels.com/photos/13779115/pexels-photo-13779115.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1200' },
      { name: 'Vitamin C 1000mg + Zinc', brand: 'MORAN WELLNESS', price: 890, quantity: 1, image: 'https://images.pexels.com/photos/29060334/pexels-photo-29060334.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1200' },
      { name: 'CeraVe Moisturizing Cream', brand: 'CERAVE', price: 2100, quantity: 1, image: 'https://images.pexels.com/photos/28482020/pexels-photo-28482020.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1200' },
    ],
    delivery_name: 'Wanjiku Mwangi', delivery_phone: '+254 712 345 678', delivery_address: '123 Naivasha Road, Apt 4B', delivery_area: 'Kilimani',
    created_at: daysAgo(1),
    tracking_steps: [
      { label: 'Order placed', timestamp: daysAgo(1), done: true },
      { label: 'Confirmed', timestamp: daysAgo(1), done: true },
      { label: 'Packed', timestamp: daysAgo(1), done: true },
      { label: 'Dispatched', timestamp: daysAgo(0), done: true },
      { label: 'Delivered', timestamp: '', done: false },
    ],
  },
  {
    id: 'o2', order_number: 'MP-1038', status: 'delivered', total: 1720, delivery_fee: 0, payment_method: 'card',
    items: [
      { name: 'Paracetamol 500mg Tablets', brand: 'MORAN PHARMACY', price: 320, quantity: 1, image: 'https://images.pexels.com/photos/13779102/pexels-photo-13779102.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1200' },
      { name: 'Omega-3 Fish Oil 1000mg', brand: 'MORAN WELLNESS', price: 1400, quantity: 1, image: 'https://images.pexels.com/photos/6475101/pexels-photo-6475101.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1200' },
    ],
    delivery_name: 'Wanjiku Mwangi', delivery_phone: '+254 712 345 678', delivery_address: '123 Naivasha Road, Apt 4B', delivery_area: 'Kilimani',
    created_at: daysAgo(5),
    tracking_steps: [
      { label: 'Order placed', timestamp: daysAgo(5), done: true },
      { label: 'Confirmed', timestamp: daysAgo(5), done: true },
      { label: 'Packed', timestamp: daysAgo(5), done: true },
      { label: 'Dispatched', timestamp: daysAgo(4), done: true },
      { label: 'Delivered', timestamp: daysAgo(3), done: true },
    ],
  },
  {
    id: 'o3', order_number: 'MP-1031', status: 'delivered', total: 2550, delivery_fee: 200, payment_method: 'mpesa',
    items: [
      { name: 'Baby Gentle Care Set', brand: 'MORAN BABY', price: 1850, quantity: 1, image: 'https://images.pexels.com/photos/3737576/pexels-photo-3737576.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1200' },
      { name: 'Digital Thermometer', brand: 'MORAN CARE', price: 500, quantity: 1, image: 'https://images.pexels.com/photos/3845126/pexels-photo-3845126.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1200' },
    ],
    delivery_name: 'Wanjiku Mwangi', delivery_phone: '+254 712 345 678', delivery_address: '123 Naivasha Road, Apt 4B', delivery_area: 'Kilimani',
    created_at: daysAgo(12),
    tracking_steps: [
      { label: 'Order placed', timestamp: daysAgo(12), done: true },
      { label: 'Confirmed', timestamp: daysAgo(12), done: true },
      { label: 'Packed', timestamp: daysAgo(12), done: true },
      { label: 'Dispatched', timestamp: daysAgo(11), done: true },
      { label: 'Delivered', timestamp: daysAgo(10), done: true },
    ],
  },
];

export const demoAddresses: DemoAddress[] = [
  { id: 'a1', label: 'Home', name: 'Wanjiku Mwangi', phone: '+254 712 345 678', line1: '123 Naivasha Road, Apt 4B', area: 'Kilimani', city: 'Nairobi', isDefault: true },
  { id: 'a2', label: 'Work', name: 'Wanjiku Mwangi', phone: '+254 722 987 654', line1: 'Westlands Office Park, Floor 5', area: 'Westlands', city: 'Nairobi', isDefault: false },
];

export const demoPayments: DemoPaymentMethod[] = [
  { id: 'p1', type: 'mpesa', label: 'M-Pesa', detail: '+254 712 345 678', isDefault: true },
  { id: 'p2', type: 'card', label: 'Visa ending 4242', detail: 'Expires 09/27', isDefault: false },
];

export const demoCustomerProfile = {
  name: 'Wanjiku Mwangi',
  email: 'customer@moran.co.ke',
  phone: '+254 712 345 678',
  joined: daysAgo(180),
  area: 'Kilimani, Nairobi',
};

export const demoWishlist: DemoWishlistItem[] = [
  { id: 1, name: 'Amoxil 500mg Capsules', brand: 'MORAN PHARMACY', price: 450, image: 'https://images.pexels.com/photos/13779115/pexels-photo-13779115.jpeg?auto=compress&cs=tinysrgb&h=600&w=600', rating: 4.8, inStock: true },
  { id: 2, name: 'Vitamin C 1000mg + Zinc', brand: 'MORAN WELLNESS', price: 890, image: 'https://images.pexels.com/photos/29060334/pexels-photo-29060334.jpeg?auto=compress&cs=tinysrgb&h=600&w=600', rating: 4.9, inStock: true },
  { id: 3, name: 'Multivitamin Daily Pack', brand: 'MORAN WELLNESS', price: 1250, image: 'https://images.pexels.com/photos/13779107/pexels-photo-13779107.jpeg?auto=compress&cs=tinysrgb&h=600&w=600', rating: 4.6, inStock: false },
];

export const demoCustomers: DemoCustomer[] = [
  { id: 'c1', name: 'Wanjiku Mwangi', email: 'customer@moran.co.ke', phone: '+254 712 345 678', joined: daysAgo(180), orders: 3, totalSpent: 8120, status: 'active', area: 'Kilimani' },
  { id: 'c2', name: 'Brian Otieno', email: 'brian.o@gmail.com', phone: '+254 722 111 222', joined: daysAgo(90), orders: 5, totalSpent: 15600, status: 'active', area: 'Westlands' },
  { id: 'c3', name: 'Amina Karim', email: 'amina.k@gmail.com', phone: '+254 733 333 444', joined: daysAgo(45), orders: 2, totalSpent: 4200, status: 'active', area: 'Karen' },
  { id: 'c4', name: 'David Kamau', email: 'david.k@gmail.com', phone: '+254 700 555 666', joined: daysAgo(14), orders: 1, totalSpent: 890, status: 'new', area: 'Embakasi' },
  { id: 'c5', name: 'Faith Njoki', email: 'faith.n@gmail.com', phone: '+254 711 777 888', joined: daysAgo(7), orders: 0, totalSpent: 0, status: 'new', area: 'Ruaka' },
  { id: 'c6', name: 'Samuel Muthomi', email: 'samuel.m@gmail.com', phone: '+254 745 999 000', joined: daysAgo(220), orders: 8, totalSpent: 22300, status: 'active', area: 'Lavington' },
];

export const demoAdminProducts: AdminProduct[] = [
  { id: 1, name: 'Amoxil 500mg Capsules', brand: 'MORAN PHARMACY', category: 'Medicines', price: 450, stock: 120, status: 'in-stock', sales: 340 },
  { id: 2, name: 'Paracetamol 500mg Tablets', brand: 'MORAN PHARMACY', category: 'Medicines', price: 320, stock: 200, status: 'in-stock', sales: 510 },
  { id: 3, name: 'Cetirizine 10mg Tablets', brand: 'MORAN PHARMACY', category: 'Medicines', price: 280, stock: 15, status: 'low-stock', sales: 167 },
  { id: 4, name: 'Vitamin C 1000mg + Zinc', brand: 'MORAN WELLNESS', category: 'Vitamins & Supplements', price: 890, stock: 85, status: 'in-stock', sales: 287 },
  { id: 5, name: 'Multivitamin Daily Pack', brand: 'MORAN WELLNESS', category: 'Vitamins & Supplements', price: 1250, stock: 0, status: 'out-of-stock', sales: 156 },
  { id: 6, name: 'Omega-3 Fish Oil 1000mg', brand: 'MORAN WELLNESS', category: 'Vitamins & Supplements', price: 1750, stock: 42, status: 'in-stock', sales: 198 },
  { id: 7, name: 'CeraVe Moisturizing Cream', brand: 'CERAVE', category: 'Personal Care', price: 2100, stock: 8, status: 'low-stock', sales: 342 },
  { id: 8, name: 'Gentle Daily Face Cleanser', brand: 'MORAN CARE', category: 'Personal Care', price: 980, stock: 55, status: 'in-stock', sales: 89 },
  { id: 9, name: 'Baby Gentle Care Set', brand: 'MORAN BABY', category: 'Mother & Baby', price: 1850, stock: 30, status: 'in-stock', sales: 124 },
  { id: 10, name: 'Blood Pressure Monitor', brand: 'OMRON', category: 'Medical Devices', price: 4500, stock: 12, status: 'in-stock', sales: 34 },
  { id: 11, name: 'Digital Thermometer', brand: 'MORAN CARE', category: 'Medical Devices', price: 650, stock: 0, status: 'out-of-stock', sales: 73 },
  { id: 12, name: 'Aloe & Shea Body Lotion', brand: 'MORAN CARE', category: 'Wellness', price: 720, stock: 67, status: 'in-stock', sales: 49 },
];

export const demoAnalytics = {
  revenue: { today: 12450, week: 78200, month: 342000, lastMonth: 298000 },
  orders: { today: 8, week: 42, month: 186, pending: 3 },
  customers: { total: 1240, newThisWeek: 28, newThisMonth: 112 },
  conversion: { rate: 3.2, visits: 5820, orders: 186 },
  topProducts: [
    { name: 'Paracetamol 500mg', sales: 510, revenue: 163200 },
    { name: 'CeraVe Moisturizing Cream', sales: 342, revenue: 718200 },
    { name: 'Amoxil 500mg', sales: 340, revenue: 153000 },
    { name: 'Vitamin C + Zinc', sales: 287, revenue: 255430 },
    { name: 'Omega-3 Fish Oil', sales: 198, revenue: 346500 },
  ],
  recentActivity: [
    { type: 'order', text: 'New order MP-1042 from Wanjiku Mwangi', time: '5 min ago', amount: 3850 },
    { type: 'order', text: 'Order MP-1041 dispatched to Westlands', time: '32 min ago', amount: 0 },
    { type: 'customer', text: 'New customer: David Kamau from Embakasi', time: '1 hr ago', amount: 0 },
    { type: 'order', text: 'Order MP-1038 delivered to Kilimani', time: '3 hrs ago', amount: 1720 },
    { type: 'stock', text: 'CeraVe Moisturizing Cream is low on stock (8 left)', time: '5 hrs ago', amount: 0 },
  ],
};

export const demoAdminOrders: DemoOrder[] = [
  ...demoOrders,
  {
    id: 'o4', order_number: 'MP-1043', status: 'pending', total: 980, delivery_fee: 200, payment_method: 'mpesa',
    items: [{ name: 'Gentle Daily Face Cleanser', brand: 'MORAN CARE', price: 980, quantity: 1, image: 'https://images.pexels.com/photos/4173383/pexels-photo-4173383.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1200' }],
    delivery_name: 'Brian Otieno', delivery_phone: '+254 722 111 222', delivery_address: 'Westlands Office Park, Floor 5', delivery_area: 'Westlands',
    created_at: daysAgo(0),
    tracking_steps: [{ label: 'Order placed', timestamp: daysAgo(0), done: true }, { label: 'Confirmed', timestamp: '', done: false }, { label: 'Packed', timestamp: '', done: false }, { label: 'Dispatched', timestamp: '', done: false }, { label: 'Delivered', timestamp: '', done: false }],
  },
  {
    id: 'o5', order_number: 'MP-1041', status: 'confirmed', total: 4500, delivery_fee: 0, payment_method: 'card',
    items: [{ name: 'Blood Pressure Monitor', brand: 'OMRON', price: 4500, quantity: 1, image: 'https://images.pexels.com/photos/7659568/pexels-photo-7659568.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1200' }],
    delivery_name: 'Amina Karim', delivery_phone: '+254 733 333 444', delivery_address: 'Karen Shopping Centre Rd', delivery_area: 'Karen',
    created_at: daysAgo(0),
    tracking_steps: [{ label: 'Order placed', timestamp: daysAgo(0), done: true }, { label: 'Confirmed', timestamp: daysAgo(0), done: true }, { label: 'Packed', timestamp: '', done: false }, { label: 'Dispatched', timestamp: '', done: false }, { label: 'Delivered', timestamp: '', done: false }],
  },
  {
    id: 'o6', order_number: 'MP-1040', status: 'packed', total: 2550, delivery_fee: 200, payment_method: 'cod',
    items: [{ name: 'Baby Gentle Care Set', brand: 'MORAN BABY', price: 1850, quantity: 1, image: 'https://images.pexels.com/photos/3737576/pexels-photo-3737576.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1200' }, { name: 'Digital Thermometer', brand: 'MORAN CARE', price: 500, quantity: 1, image: 'https://images.pexels.com/photos/3845126/pexels-photo-3845126.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1200' }],
    delivery_name: 'Samuel Muthomi', delivery_phone: '+254 745 999 000', delivery_address: 'Lavington Mall, Shop 12', delivery_area: 'Lavington',
    created_at: daysAgo(1),
    tracking_steps: [{ label: 'Order placed', timestamp: daysAgo(1), done: true }, { label: 'Confirmed', timestamp: daysAgo(1), done: true }, { label: 'Packed', timestamp: daysAgo(0), done: true }, { label: 'Dispatched', timestamp: '', done: false }, { label: 'Delivered', timestamp: '', done: false }],
  },
  {
    id: 'o7', order_number: 'MP-1039', status: 'delivered', total: 890, delivery_fee: 200, payment_method: 'mpesa',
    items: [{ name: 'Vitamin C 1000mg + Zinc', brand: 'MORAN WELLNESS', price: 890, quantity: 1, image: 'https://images.pexels.com/photos/29060334/pexels-photo-29060334.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1200' }],
    delivery_name: 'David Kamau', delivery_phone: '+254 700 555 666', delivery_address: 'Embakasi Estate, House 22', delivery_area: 'Embakasi',
    created_at: daysAgo(2),
    tracking_steps: [{ label: 'Order placed', timestamp: daysAgo(2), done: true }, { label: 'Confirmed', timestamp: daysAgo(2), done: true }, { label: 'Packed', timestamp: daysAgo(2), done: true }, { label: 'Dispatched', timestamp: daysAgo(1), done: true }, { label: 'Delivered', timestamp: daysAgo(1), done: true }],
  },
  {
    id: 'o8', order_number: 'MP-1037', status: 'cancelled', total: 1250, delivery_fee: 0, payment_method: 'mpesa',
    items: [{ name: 'Multivitamin Daily Pack', brand: 'MORAN WELLNESS', price: 1250, quantity: 1, image: 'https://images.pexels.com/photos/13779107/pexels-photo-13779107.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1200' }],
    delivery_name: 'Faith Njoki', delivery_phone: '+254 711 777 888', delivery_address: 'Ruaka Town Centre', delivery_area: 'Ruaka',
    created_at: daysAgo(3),
    tracking_steps: [{ label: 'Order placed', timestamp: daysAgo(3), done: true }, { label: 'Cancelled', timestamp: daysAgo(3), done: true }],
  },
];
