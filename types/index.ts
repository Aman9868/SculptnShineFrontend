export interface Product {
  id: string;
  name: string;
  mainCategory?: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount?: number;
  reviews?: number;
  brand?: string;
  discount?: number;
  image: string;
  badge?: string;
  description?: string;
  isBestSeller?: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  count?: number;
  iconName: string;
  href: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ValueProp {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  actionText: string;
  image: string;
  badge?: string;
  link: string;
}
