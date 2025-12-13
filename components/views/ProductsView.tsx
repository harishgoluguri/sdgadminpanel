import React, { useEffect, useState } from 'react';
import { 
  Search, Edit2, Trash2, Plus, Package, Ruler, Palette
} from 'lucide-react';
import { productService } from '../../services/supabaseService';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductsViewProps {
  onNotify: (type: 'success' | 'error', msg: string) => void;
}

const emptyProduct: Omit<Product, 'id' | 'created_at'> = {
  title: '', 
  price: 0, 
  sku: '', 
  category: '', 
  colour: '',
  size_6: 0,
  size_7: 0,
  size_8: 0,
  size_9: 0,
  size_10: 0,
  size_11: 0,
  description: '', 
  image_url: ''
};

export const ProductsView: React.FC<ProductsViewProps> = ({ onNotify }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'created_at'>>(emptyProduct);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const filtered = products.filter(p => 
      (p.title || '').toLowerCase().includes(lower) || 
      (p.sku || '').toLowerCase().includes(lower) ||
      (p.category || '').toLowerCase().includes(lower)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      onNotify('error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      onNotify('success', 'Product deleted');
      loadProducts();
    } catch (err) {
      onNotify('error', 'Failed to delete');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    const { id, created_at, ...rest } = product;
    setFormData(rest);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
        onNotify('success', 'Product updated');
      } else {
        await productService.createProduct(formData);
        onNotify('success', 'Product created');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      onNotify('error', 'Operation failed');
    }
  };

  const getTotalStock = (p: Product | typeof formData) => {
    return (p.size_6 || 0) + (p.size_7 || 0) + (p.size_8 || 0) + (p.size_9 || 0) + (p.size_10 || 0) + (p.size_11 || 0);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
         <div>
            <h1 className="text-[34px] font-bold text-gray-900 dark:text-white tracking-tight">Products</h1>
         </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search Inventory"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-[#1C1C1E] border-none rounded-lg text-[15px] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:bg-white dark:focus:bg-[#2C2C2E] transition-all w-full sm:w-64"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-all shadow-lg shadow-primary-500/30 text-[15px] font-medium active:scale-95"
          >
            <Plus size={18} className="mr-1.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
            Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-[#1C1C1E] rounded-2xl h-56"></div>
            ))
        ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">No products found.</div>
        ) : (
            filteredProducts.map(product => {
                const totalStock = getTotalStock(product);
                const availableSizes = [6,7,8,9,10,11].filter(s => (product[`size_${s}` as keyof Product] as number) > 0);
                
                return (
                <div key={product.id} className="group bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-apple hover:shadow-apple-lg border border-gray-100 dark:border-white/5 overflow-hidden transition-all duration-300 flex flex-col h-full relative p-5">
                    
                    {/* Header with Title and Price */}
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3">
                            <div className="bg-gray-100 dark:bg-white/10 p-2 rounded-lg text-gray-500 dark:text-gray-400">
                                <Package size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-[17px] leading-tight line-clamp-2">{product.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3 flex-1">
                         <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                         </div>
                         
                         <div className="flex flex-wrap gap-2 text-xs">
                             {product.colour && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-md text-gray-600 dark:text-gray-300 flex items-center">
                                   <Palette size={10} className="mr-1"/> {product.colour}
                                </span>
                             )}
                             <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-md text-gray-600 dark:text-gray-300 flex items-center">
                                <Ruler size={10} className="mr-1"/> Sizes: {availableSizes.length ? availableSizes.join(', ') : 'None'}
                             </span>
                         </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${totalStock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                            {totalStock > 0 ? `${totalStock} in stock` : 'Out of Stock'}
                        </span>
                        <span className="font-mono text-xs text-gray-400">{product.sku}</span>
                    </div>

                    {/* Actions Overlay */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button 
                            onClick={() => openEditModal(product)} 
                            className="p-2 bg-gray-100 dark:bg-white/20 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 bg-gray-100 dark:bg-white/20 rounded-full text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            )})
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-200 dark:border-white/10"
            >
               <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-white/5 backdrop-blur-xl z-10">
                <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'New Product'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:bg-gray-200/50 p-1 rounded-full transition-colors">
                    <XIcon />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 custom-scroll">
                <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                    
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Product Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full px-3 py-2.5 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-shadow text-[15px]"
                            placeholder="e.g. Classic Running Shoe"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                                    className="w-full pl-7 pr-3 py-2.5 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-shadow text-[15px]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">SKU</label>
                            <input
                                type="text"
                                required
                                value={formData.sku}
                                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                className="w-full px-3 py-2.5 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-shadow text-[15px]"
                                placeholder="PROD-001"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                          <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full px-3 py-2.5 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-shadow text-[15px] appearance-none"
                          >
                            <option value="">Select Category</option>
                            <option value="Footwear">Footwear</option>
                            <option value="Apparel">Apparel</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Electronics">Electronics</option>
                          </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Colour</label>
                            <input
                                type="text"
                                value={formData.colour}
                                onChange={(e) => setFormData({...formData, colour: e.target.value})}
                                className="w-full px-3 py-2.5 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-shadow text-[15px]"
                                placeholder="e.g. Red, Blue/White"
                            />
                        </div>
                    </div>

                    {/* Stock Grid for Sizes */}
                    <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/5">
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Stock per Size</label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {[6, 7, 8, 9, 10, 11].map(size => (
                                <div key={size} className="text-center">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Size {size}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData[`size_${size}` as keyof typeof formData] as number}
                                        onChange={(e) => setFormData({...formData, [`size_${size}`]: parseInt(e.target.value) || 0})}
                                        className="w-full px-1 py-2 text-center bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 outline-none text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full px-3 py-2.5 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500/50 outline-none transition-shadow text-[15px]"
                        />
                    </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 flex justify-end space-x-3 bg-gray-50/50 dark:bg-black/20">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-[15px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="productForm"
                  className="px-5 py-2.5 text-[15px] font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-full shadow-lg shadow-primary-500/30 transition-all active:scale-95"
                >
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const XIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);