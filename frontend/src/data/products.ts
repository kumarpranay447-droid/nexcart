import type { Product } from '../types';

/**
 * Demo catalog for the storefront. In a production system this would come
 * from a dedicated product-service; here it keeps the portfolio project
 * focused on auth + order flows.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Wireless Headphones',
    price: 89.99,
    description: 'Noise-cancelling over-ear headphones with 30h battery.',
  },
  {
    id: 'p2',
    name: 'Mechanical Keyboard',
    price: 129.5,
    description: 'Hot-swappable RGB mechanical keyboard, tactile switches.',
  },
  {
    id: 'p3',
    name: 'USB-C Docking Station',
    price: 149.0,
    description: '11-in-1 dock with dual 4K HDMI and 100W power delivery.',
  },
  {
    id: 'p4',
    name: 'Ergonomic Mouse',
    price: 45.75,
    description: 'Vertical ergonomic mouse with silent clicks.',
  },
  {
    id: 'p5',
    name: 'Portable SSD 1TB',
    price: 99.99,
    description: 'NVMe portable SSD, 1050 MB/s read speed.',
  },
  {
    id: 'p6',
    name: 'Monitor Light Bar',
    price: 59.0,
    description: 'Eye-care monitor light bar with auto-dimming.',
  },
];
