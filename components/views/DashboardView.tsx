import React, { useEffect, useState } from 'react';
import { Users, Package, TrendingUp, ArrowUpRight } from 'lucide-react';
import { userService, productService } from '../../services/supabaseService';
import { motion } from 'framer-motion';

export const DashboardView: React.FC = () => {
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, products] = await Promise.all([
            userService.getUsers(),
            productService.getProducts()
        ]);
        setUserCount(users.length);
        setProductCount(products.length);
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatWidget = ({ title, value, icon: Icon, colorClass, delay }: any) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: delay }}
      className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-shadow border border-gray-100 dark:border-white/5 relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-full ${colorClass} text-white`}>
          <Icon size={20} />
        </div>
        <div className="flex items-center text-xs font-medium text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-full">
           <TrendingUp size={12} className="mr-1 text-green-500" /> +12%
        </div>
      </div>
      
      <div>
         <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {loading ? '-' : value}
         </h3>
         <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400 mt-1">{title}</p>
      </div>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
         <ArrowUpRight size={16} className="text-gray-400" />
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Large Title */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-[34px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Overview of your activity</p>
      </div>
      
      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatWidget 
          title="Total Users" 
          value={userCount} 
          icon={Users} 
          colorClass="bg-blue-500" 
          delay={0}
        />
        <StatWidget 
          title="Products" 
          value={productCount} 
          icon={Package} 
          colorClass="bg-indigo-500" 
          delay={0.1}
        />
      </div>
    </div>
  );
};