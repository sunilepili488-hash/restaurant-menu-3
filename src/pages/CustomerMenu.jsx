import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase as base44 } from '@/api/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, List, Check } from 'lucide-react';

import SplashScreen from '@/components/customer/SplashScreen';
import MenuHeader from '@/components/customer/MenuHeader';
import BannerCarousel from '@/components/customer/BannerCarousel';
import CategoryNav from '@/components/customer/CategoryNav';
import DishCardGrid from '@/components/customer/DishCardGrid';
import DishListRow from '@/components/customer/DishListRow';
import TopDishesCarousel from '@/components/customer/TopDishesCarousel';
import SearchOverlay from '@/components/customer/SearchOverlay';
import FilterPanel from '@/components/customer/FilterPanel';
import BottomActionBar from '@/components/customer/BottomActionBar';
import ReviewSheet from '@/components/customer/ReviewSheet';
import CartPage from '@/components/customer/CartPage';
import PaymentSheet from '@/components/customer/PaymentSheet';
import AdminLoginDialog from '@/components/customer/AdminLoginDialog';
import { useMenuStore, menuStore } from '@/lib/menuStore';

export default function CustomerMenu() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [showUnlockAlert, setShowUnlockAlert] = useState(false);
  const [orderToast, setOrderToast] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [reviewDish, setReviewDish] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartTab, setCartTab] = useState('orders');
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [filters, setFilters] = useState(null);
  const store = useMenuStore();
  const queryClient = useQueryClient();

  // Detect table number from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get('table');
    if (table) menuStore.setTableNumber(table);
  }, []);

  // Data queries with polling for real-time sync
  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurant'],
    queryFn: () => base44.entities.Restaurant.list(),
    refetchInterval: 30000,
  });
  const restaurant = restaurants[0];

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.filter({ is_active: true }, 'sort_order', 100),
    refetchInterval: 30000,
  });

  const { data: dishes = [] } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => base44.entities.Dish.filter({ is_active: true }, 'sort_order', 500),
    refetchInterval: 30000,
  });

  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: () => base44.entities.Banner.filter({ is_active: true }, 'sort_order', 20),
    refetchInterval: 30000,
  });

  // Apply dark/light theme
  useEffect(() => {
    const isDark = restaurant?.theme_mode !== 'light';
    document.documentElement.classList.toggle('dark', isDark);
  }, [restaurant?.theme_mode]);

  // Apply filters and sorting
  const filteredDishes = useMemo(() => {
    let result = [...dishes];

    if (activeCategory !== 'all') {
      result = result.filter(d => d.category_id === activeCategory);
    }

    if (filters) {
      if (filters.priceRange) {
        result = result.filter(d => {
          const price = d.sale_price || d.regular_price;
          return price >= filters.priceRange[0] && price <= filters.priceRange[1];
        });
      }
      if (filters.dietTags?.length) {
        result = result.filter(d => {
          if (filters.dietTags.includes('Veg') && d.is_veg) return true;
          if (filters.dietTags.includes('Non-Veg') && !d.is_veg) return true;
          if (d.dietary_tags) {
            return filters.dietTags.some(t => d.dietary_tags.includes(t));
          }
          return false;
        });
      }
      if (filters.prepFilter) {
        const minutes = parseInt(filters.prepFilter.match(/\d+/)?.[0] || '999');
        result = result.filter(d => {
          if (!d.prep_time_value) return false;
          let inMinutes = d.prep_time_value;
          if (d.prep_time_unit === 'sec') inMinutes = d.prep_time_value / 60;
          if (d.prep_time_unit === 'hr') inMinutes = d.prep_time_value * 60;
          return inMinutes <= minutes;
        });
      }
      if (filters.sortBy === 'Most Liked') {
        result.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
      } else if (filters.sortBy === 'Price: Low to High') {
        result.sort((a, b) => (a.sale_price || a.regular_price) - (b.sale_price || b.regular_price));
      } else if (filters.sortBy === 'Price: High to Low') {
        result.sort((a, b) => (b.sale_price || b.regular_price) - (a.sale_price || b.regular_price));
      } else if (filters.sortBy === 'Newly Added') {
        result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      }
    }

    if (!filters?.sortBy) {
      const sorted = [...result].sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
      const top3Ids = sorted.slice(0, 3).map(d => d.id);
      const top3 = result.filter(d => top3Ids.includes(d.id));
      const rest = result.filter(d => !top3Ids.includes(d.id));
      result = [...top3, ...rest];
    }

    return result;
  }, [dishes, activeCategory, filters]);

  // Today's top dishes
  const topDishes = useMemo(() => {
    if (!restaurant?.top_dishes?.length) return [];
    return restaurant.top_dishes
      .map(id => dishes.find(d => d.id === id))
      .filter(Boolean);
  }, [restaurant?.top_dishes, dishes]);

  const handlePay = (amount) => {
    setPayAmount(amount);
    setPayOpen(true);
  };

  const handleUnlock = () => {
    setShowUnlockAlert(true);
    if (restaurant?.id) {
      queryClient.setQueryData(['restaurant'], (old) => {
        if (!old?.length) return old;
        return [{ ...old[0], hide_user_icon: false }];
      });
      base44.entities.Restaurant.update(restaurant.id, { hide_user_icon: false });
    }
  };

  // Auto-dismiss unlock alert after 1 second
  useEffect(() => {
    if (showUnlockAlert) {
      const timer = setTimeout(() => setShowUnlockAlert(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showUnlockAlert]);

  const handleOrderPlaced = () => {
    setCartOpen(false);
    setOrderToast(true);
    setTimeout(() => setOrderToast(false), 3000);
  };

  if (showSplash) {
    return <SplashScreen restaurant={restaurant} onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MenuHeader
        restaurant={restaurant}
        onSearchOpen={() => setSearchOpen(true)}
        onFilterOpen={() => setFilterOpen(true)}
        onUserClick={() => setAdminOpen(true)}
        hideUserIcon={restaurant?.hide_user_icon}
      />

      {/* Content below sticky header */}
      <div className="pt-[60px] md:pt-[64px]">
        <BannerCarousel banners={banners} />

        <CategoryNav
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* Today's Top Dishes — directly below category nav */}
        <TopDishesCarousel
          dishes={topDishes}
          restaurant={restaurant}
          onReviewOpen={setReviewDish}
        />

        {/* View toggle — always visible, sticks to top on scroll */}
        <div className="px-4 max-w-7xl mx-auto z-30 sticky top-[58px] md:top-[62px] bg-background py-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {filteredDishes.length} dish{filteredDishes.length !== 1 ? 'es' : ''}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground'}`}
              >
                <LayoutGrid className="w-4 h-4 flex-shrink-0" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground'}`}
              >
                <List className="w-4 h-4 flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Dishes */}
        <div className="px-4 max-w-7xl mx-auto">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredDishes.map((dish, index) => (
                <DishCardGrid
                  key={dish.id}
                  dish={dish}
                  restaurant={restaurant}
                  onReviewOpen={setReviewDish}
                  eager={index < 6}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDishes.map((dish, index) => (
                <DishListRow key={dish.id} dish={dish} restaurant={restaurant} eager={index < 6} />
              ))}
            </div>
          )}

          {filteredDishes.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-display text-lg">No dishes found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom action bar — horizontal, centered */}
      <BottomActionBar
        restaurant={restaurant}
        favoritesCount={store.favorites.length}
        cartCount={store.cart.length}
        onFavoritesClick={() => { setCartTab('favorites'); setCartOpen(true); }}
        onCartClick={() => { setCartTab('orders'); setCartOpen(true); }}
      />

      {/* Overlays */}
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        dishes={dishes}
        onUnlock={handleUnlock}
      />

      {/* Auto-dismissing unlock alert (1 second) */}
      {showUnlockAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] glass rounded-full px-5 py-2.5 shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <p className="text-sm font-medium text-foreground">Admin icon unlocked</p>
        </div>
      )}

      {/* Order confirmation toast */}
      {orderToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] bg-green-500 text-white rounded-full px-5 py-3 shadow-lg flex items-center gap-2 max-w-[90%]">
          <span className="text-sm font-medium text-center">🎉 Your order has been received! Your waiter will come to you shortly for confirmation.</span>
        </div>
      )}
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
        restaurant={restaurant}
      />
      <ReviewSheet
        dish={reviewDish}
        open={!!reviewDish}
        onClose={() => setReviewDish(null)}
      />
      <CartPage
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        dishes={dishes}
        restaurant={restaurant}
        onPay={handlePay}
        defaultTab={cartTab}
        onOrderPlaced={handleOrderPlaced}
      />
      <PaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        total={payAmount}
        restaurant={restaurant}
      />
      <AdminLoginDialog
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        restaurant={restaurant}
        onLogin={() => navigate('/admin')}
      />
    </div>
  );
}