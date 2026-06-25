import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase as base44 } from '@/api/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import AdminSidebar from '@/components/admin/AdminSidebar';
import BrandingSection from '@/components/admin/BrandingSection';
import CategoriesSection from '@/components/admin/CategoriesSection';
import DishesSection from '@/components/admin/DishesSection';
import BannersSection from '@/components/admin/BannersSection';
import FiltersSection from '@/components/admin/FiltersSection';
import WaiterCallSection from '@/components/admin/WaiterCallSection';
import OrderRoutingSection from '@/components/admin/OrderRoutingSection';
import ThemeSection from '@/components/admin/ThemeSection';
import TableQRSection from '@/components/admin/TableQRSection';
import PaymentsSection from '@/components/admin/PaymentsSection';
import HostingDomainSection from '@/components/admin/HostingDomainSection';
import FeatureLocksSection from '@/components/admin/FeatureLocksSection';
import TopDishesAdmin from '@/components/admin/TopDishesAdmin';
import SupabaseSection from '@/components/admin/SupabaseSection';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [section, setSection] = useState('branding');
  const [collapsed, setCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if admin
  useEffect(() => {
    const adminFlag = sessionStorage.getItem('menu_admin');
    if (adminFlag !== 'true') {
      navigate('/');
    } else {
      setIsAdmin(true);
    }
  }, [navigate]);

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurant'],
    queryFn: () => base44.entities.Restaurant.list(),
  });
  const restaurant = restaurants[0];

  // Apply theme mode
  useEffect(() => {
    const isDark = restaurant?.theme_mode !== 'light';
    document.documentElement.classList.toggle('dark', isDark);
  }, [restaurant?.theme_mode]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-admin'],
    queryFn: () => base44.entities.Category.list('sort_order', 100),
  });

  const { data: dishes = [] } = useQuery({
    queryKey: ['dishes-admin'],
    queryFn: () => base44.entities.Dish.list('sort_order', 500),
  });

  const { data: banners = [] } = useQuery({
    queryKey: ['banners-admin'],
    queryFn: () => base44.entities.Banner.list('sort_order', 50),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['restaurant'] });
    queryClient.invalidateQueries({ queryKey: ['categories-admin'] });
    queryClient.invalidateQueries({ queryKey: ['dishes-admin'] });
    queryClient.invalidateQueries({ queryKey: ['banners-admin'] });
  };

  const handleLogout = () => {
    // If user icon was hidden, re-show it on logout
    if (restaurant?.hide_user_icon) {
      base44.entities.Restaurant.update(restaurant.id, { hide_user_icon: false });
    }
    sessionStorage.removeItem('menu_admin');
    navigate('/');
  };

  if (!isAdmin) return null;

  const renderSection = () => {
    switch (section) {
      case 'branding': return <BrandingSection restaurant={restaurant} onRefresh={refresh} />;
      case 'categories': return <CategoriesSection categories={categories} onRefresh={refresh} />;
      case 'dishes': return <DishesSection dishes={dishes} categories={categories} onRefresh={refresh} />;
      case 'banners': return <BannersSection banners={banners} onRefresh={refresh} />;
      case 'filters': return <FiltersSection restaurant={restaurant} onRefresh={refresh} />;
      case 'waiter': return <WaiterCallSection restaurant={restaurant} onRefresh={refresh} />;
      case 'orders': return <OrderRoutingSection restaurant={restaurant} onRefresh={refresh} />;
      case 'theme': return <ThemeSection restaurant={restaurant} onRefresh={refresh} />;
      case 'tables': return <TableQRSection restaurant={restaurant} onRefresh={refresh} />;
      case 'payments': return <PaymentsSection restaurant={restaurant} onRefresh={refresh} />;
      case 'hosting': return <HostingDomainSection restaurant={restaurant} onRefresh={refresh} />;
      case 'top-dishes': return <TopDishesAdmin restaurant={restaurant} dishes={dishes} onRefresh={refresh} />;
      case 'supabase': return <SupabaseSection restaurant={restaurant} onRefresh={refresh} />;
      case 'locks': return <FeatureLocksSection restaurant={restaurant} onRefresh={refresh} />;
      default: return <BrandingSection restaurant={restaurant} onRefresh={refresh} />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar
        activeSection={section}
        onSelect={setSection}
        onLogout={handleLogout}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-8">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}