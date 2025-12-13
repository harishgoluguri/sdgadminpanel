import { createClient } from '@supabase/supabase-js';
import { User, Product } from '../types';

// Supabase Configuration
const SUPABASE_URL = 'https://imvagofypivmtbuylqqo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltdmFnb2Z5cGl2bXRidXlscXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODI1NjEsImV4cCI6MjA4MDc1ODU2MX0.knAE0BuSEFfSKaEPF3QQ7MFdzSL1iZhVf9_ow4XYjWM';

const isConfigured = SUPABASE_URL && SUPABASE_KEY;

let supabase: any = null;
if (isConfigured) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Mock Data for Fallback
const MOCK_USERS: User[] = [
  { id: '1', email: 'alice@example.com', name: 'Alice Johnson', phone1: '555-0101', phone2: '555-0199', pin: '1234', city: 'New York', country: 'USA', points: 120, created_at: '2023-01-15T10:00:00Z', role: 'user' },
  { id: '2', email: 'bob@example.com', name: 'Bob Smith', phone1: '555-0102', phone2: '', pin: '5678', city: 'London', country: 'UK', points: 450, created_at: '2023-02-20T14:30:00Z', role: 'user' },
  { id: '3', email: 'admin@dashboard.com', name: 'Super Admin', phone1: '555-9999', phone2: '555-8888', pin: '0000', city: 'San Francisco', country: 'USA', points: 0, created_at: '2023-01-01T00:00:00Z', role: 'admin' },
  { id: '4', email: 'charlie@example.com', name: 'Charlie Brown', phone1: '555-0103', phone2: '', pin: '4321', city: 'Toronto', country: 'Canada', points: 50, created_at: '2023-03-10T09:15:00Z', role: 'user' },
  { id: '5', email: 'diana@example.com', name: 'Diana Prince', phone1: '555-0104', phone2: '555-0200', pin: '9999', city: 'Paris', country: 'France', points: 800, created_at: '2023-04-05T16:45:00Z', role: 'user' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', title: 'Classic Running Shoe', price: 89.99, sku: 'SH-001', category: 'Footwear', colour: 'Black', size_6: 5, size_7: 10, size_8: 8, size_9: 2, size_10: 0, size_11: 4, created_at: '2023-01-10T00:00:00Z' },
  { id: '2', title: 'Urban Sneaker', price: 129.50, sku: 'SH-002', category: 'Footwear', colour: 'White', size_6: 0, size_7: 2, size_8: 5, size_9: 10, size_10: 10, size_11: 0, created_at: '2023-02-15T00:00:00Z' },
  { id: '3', title: 'Sport Trainer', price: 75.00, sku: 'SH-003', category: 'Footwear', colour: 'Red', size_6: 10, size_7: 10, size_8: 10, size_9: 10, size_10: 10, size_11: 10, created_at: '2023-03-01T00:00:00Z' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  getUsers: async (): Promise<User[]> => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('custom_users').select('*').order('created_at', { ascending: false });
      
      if (!error && data) {
        return data.map((user: any) => ({
          ...user,
          phone1: user.phone_number || user.phone1 || user.phone || '', 
          phone2: user.phone2 || '',
          email: user.gmail || user.email || '',
        }));
      }
      console.warn("Supabase fetch failed", error);
    }
    await delay(500);
    const stored = localStorage.getItem('mock_users');
    return stored ? JSON.parse(stored) : MOCK_USERS;
  },

  updateUser: async (id: string, updates: Partial<User> & { password?: string }): Promise<void> => {
    if (isConfigured && supabase) {
      const { error } = await supabase.from('custom_users').update(updates).eq('id', id);
      if (!error) return;
      console.warn("Supabase update failed", error);
    }
    await delay(300);
    const users = await userService.getUsers();
    const { password, ...userUpdates } = updates;
    const newUsers = users.map(u => u.id === id ? { ...u, ...userUpdates } : u);
    localStorage.setItem('mock_users', JSON.stringify(newUsers));
  },

  deleteUser: async (id: string): Promise<void> => {
    if (isConfigured && supabase) {
      const { error } = await supabase.from('custom_users').delete().eq('id', id);
      if (!error) return;
      console.warn("Supabase delete failed", error);
    }
    await delay(300);
    const users = await userService.getUsers();
    const newUsers = users.filter(u => u.id !== id);
    localStorage.setItem('mock_users', JSON.stringify(newUsers));
  }
};

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        // Map DB columns to Product interface
        return data.map((p: any) => ({
          ...p,
          title: p.product_title || p.title || 'Untitled',
          colour: p.colour || '',
          size_6: p.size_6 || 0,
          size_7: p.size_7 || 0,
          size_8: p.size_8 || 0,
          size_9: p.size_9 || 0,
          size_10: p.size_10 || 0,
          size_11: p.size_11 || 0,
        }));
      }
      console.warn("Supabase fetch failed", error);
    }
    await delay(500);
    const stored = localStorage.getItem('mock_products');
    return stored ? JSON.parse(stored) : MOCK_PRODUCTS;
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<void> => {
    if (isConfigured && supabase) {
      // Map 'title' back to 'product_title' for DB
      const dbUpdates: any = { ...updates };
      if (dbUpdates.title) {
        dbUpdates.product_title = dbUpdates.title;
        delete dbUpdates.title;
      }
      
      const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
      if (!error) return;
      console.warn("Supabase update failed", error);
    }
    await delay(300);
    const products = await productService.getProducts();
    const newProducts = products.map(p => p.id === id ? { ...p, ...updates } : p);
    localStorage.setItem('mock_products', JSON.stringify(newProducts));
  },

  createProduct: async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
    if (isConfigured && supabase) {
      // Map 'title' to 'product_title'
      const dbProduct: any = { ...product };
      if (dbProduct.title) {
        dbProduct.product_title = dbProduct.title;
        delete dbProduct.title;
      }
      
      const { data, error } = await supabase.from('products').insert(dbProduct).select().single();
      if (!error && data) {
         return {
             ...data,
             title: data.product_title || data.title
         };
      }
      console.warn("Supabase insert failed", error);
    }
    await delay(300);
    const newProduct: Product = {
      ...product,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    const products = await productService.getProducts();
    localStorage.setItem('mock_products', JSON.stringify([newProduct, ...products]));
    return newProduct;
  },

  deleteProduct: async (id: string): Promise<void> => {
    if (isConfigured && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return;
      console.warn("Supabase delete failed", error);
    }
    await delay(300);
    const products = await productService.getProducts();
    const newProducts = products.filter(p => p.id !== id);
    localStorage.setItem('mock_products', JSON.stringify(newProducts));
  },

  uploadImage: async (file: File): Promise<string> => {
      // Basic image upload logic remains the same
    if (isConfigured && supabase) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      const { error } = await supabase.storage.from('products').upload(filePath, file);
      if (!error) {
        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        return data.publicUrl;
      }
    }
    await delay(1000);
    return URL.createObjectURL(file);
  }
};
