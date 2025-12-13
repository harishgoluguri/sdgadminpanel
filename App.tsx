import React, { useState } from 'react';
import { Layout } from './components/ui/Layout';
import { DashboardView } from './components/views/DashboardView';
import { UsersView } from './components/views/UsersView';
import { ProductsView } from './components/views/ProductsView';
import { LoginView } from './components/views/LoginView';
import { ToastContainer } from './components/ui/Toast';
import { ViewState, ToastMessage } from './types';
import { AnimatePresence, motion } from 'framer-motion';

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.02 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    className="h-full flex flex-col"
  >
    {children}
  </motion.div>
);

const App: React.FC = () => {
  // App State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Handler
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Guard
  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <AnimatePresence mode="wait">
        {currentView === ViewState.DASHBOARD && (
          <PageTransition key="dashboard">
            <DashboardView />
          </PageTransition>
        )}
        
        {currentView === ViewState.USERS && (
          <PageTransition key="users">
            <UsersView onNotify={addToast} />
          </PageTransition>
        )}
        
        {currentView === ViewState.PRODUCTS && (
          <PageTransition key="products">
            <ProductsView onNotify={addToast} />
          </PageTransition>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default App;