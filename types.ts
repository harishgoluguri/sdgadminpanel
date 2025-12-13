
export interface User {
  id: string;
  email: string;
  name: string;
  phone1: string;
  phone2: string;
  pin: string;
  city: string;
  country: string;
  points: number;
  created_at: string;
  role?: 'admin' | 'user';
}

export interface Product {
  id: string;
  title: string; // Mapped from 'product_title'
  price: number;
  sku: string;
  category: string;
  colour: string;
  // Specific size columns from DB
  size_6: number;
  size_7: number;
  size_8: number;
  size_9: number;
  size_10: number;
  size_11: number;
  
  // Optional fields for UI compatibility
  description?: string;
  image_url?: string;
  created_at: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  USERS = 'USERS',
  PRODUCTS = 'PRODUCTS',
}

export type Theme = 'light' | 'dark';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
