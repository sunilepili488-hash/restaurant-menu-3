import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import SupabaseGate from './components/SupabaseGate';

import { lazy, Suspense } from 'react';
import CustomerMenu from '@/pages/CustomerMenu';
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const OrderReceiver = lazy(() => import('@/pages/OrderReceiver'));

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <SupabaseGate>
            <Routes>
              <Route path="/" element={<CustomerMenu />} />
              <Route path="/admin" element={<Suspense fallback={<Spinner />}><AdminDashboard /></Suspense>} />
              <Route path="/order-receiver" element={<Suspense fallback={<Spinner />}><OrderReceiver /></Suspense>} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </SupabaseGate>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
