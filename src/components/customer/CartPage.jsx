import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Bookmark, ShoppingBag, Trash2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { menuStore, useMenuStore } from '@/lib/menuStore';
import { getTodayStr } from '@/lib/formatUtils';
import { supabase as base44 } from '@/api/supabaseClient';
import { sendSilently } from '@/lib/whatsappUtils';

export default function CartPage({ open, onClose, dishes = [], restaurant, onPay, defaultTab = 'orders', onOrderPlaced }) {
  const store = useMenuStore();
  const curr = restaurant?.currency_symbol || '₹';

  const favDishes = dishes.filter(d => store.favorites.includes(d.id));
  const cartItems = store.cart;

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.dish?.sale_price || item.dish?.regular_price || 0;
    return sum + price * item.quantity;
  }, 0);

  const placeOrder = () => {
    const tableNum = store.tableNumber;
    const orderLines = cartItems.map(item =>
      `${item.dish.name} x${item.quantity} — ${curr}${((item.dish.sale_price || item.dish.regular_price) * item.quantity).toLocaleString()}`
    ).join('\n');
    const msg = `📋 New Order${tableNum ? ` — Table ${tableNum}` : ''}\n\n${orderLines}\n\nTotal: ${curr}${subtotal.toLocaleString()}`;

    sendSilently(restaurant, msg, {
      type: 'order',
      table: tableNum,
      items: cartItems.map(i => ({ name: i.dish.name, qty: i.quantity, price: i.dish.sale_price || i.dish.regular_price })),
      total: subtotal,
    });

    base44.entities.Order.create({
      type: 'order',
      table_number: tableNum,
      items: cartItems.map(i => ({ name: i.dish.name, qty: i.quantity, price: i.dish.sale_price || i.dish.regular_price })),
      total: subtotal,
      status: 'pending',
    });

    onOrderPlaced?.();

    // Increment ordered_today_count for each dish
    const today = getTodayStr();
    cartItems.forEach(item => {
      const baseCount = item.dish?.ordered_today_date === today ? (item.dish?.ordered_today_count || 0) : 0;
      base44.entities.Dish.update(item.dish_id, {
        ordered_today_count: baseCount + item.quantity,
        ordered_today_date: today,
      });
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[61] bg-background rounded-t-3xl max-h-[85vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold">Your Selection</h2>
                <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>

              <Tabs defaultValue={defaultTab}>
                <TabsList className="w-full bg-secondary mb-4">
                  <TabsTrigger value="favorites" className="flex-1 gap-1.5">
                    <Bookmark className="w-3.5 h-3.5" /> Favorites ({favDishes.length})
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="flex-1 gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" /> Orders ({cartItems.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="favorites">
                  <div className="space-y-2">
                    {favDishes.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm py-8">No favorites yet</p>
                    )}
                    <AnimatePresence>
                      {favDishes.map(dish => (
                        <motion.div
                          key={dish.id}
                          layout
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={{ left: 0, right: 0.6 }}
                          onDragEnd={(e, info) => {
                            if (info.offset.x > 120) {
                              menuStore.toggleFavorite(dish.id);
                            }
                          }}
                          exit={{ x: 300, opacity: 0, transition: { duration: 0.25 } }}
                          className="glass rounded-xl p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing"
                        >
                          {dish.image_url && (
                            <img src={dish.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-sm font-semibold truncate">{dish.name}</p>
                            <p className="text-xs text-primary">{curr}{(dish.sale_price || dish.regular_price).toLocaleString()}</p>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => menuStore.moveToCart(dish)}
                            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {favDishes.length > 0 && (
                      <p className="text-center text-[11px] text-muted-foreground/60 pt-2">
                        Swipe a dish right to remove it from favourites.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="orders">
                  <div className="space-y-2">
                    {cartItems.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm py-8">Your cart is empty</p>
                    )}
                    {cartItems.map(item => (
                      <div key={item.dish_id} className="glass rounded-xl p-3 flex items-center gap-3">
                        {item.dish?.image_url && (
                          <img src={item.dish.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-sm font-semibold truncate">{item.dish?.name}</p>
                          <p className="text-xs text-primary">
                            {curr}{((item.dish?.sale_price || item.dish?.regular_price || 0) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => menuStore.updateQuantity(item.dish_id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full glass flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </motion.button>
                          <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => menuStore.updateQuantity(item.dish_id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full glass flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => menuStore.removeFromCart(item.dish_id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {cartItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground tracking-wide">Subtotal</span>
                        <span className="font-heading text-2xl font-bold text-primary tracking-wider tabular-nums">
                          {curr}{subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={placeOrder}
                          className="flex-1 bg-primary text-primary-foreground gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" /> Place Order
                        </Button>
                        {restaurant?.payment_enabled && (
                          <Button
                            onClick={() => onPay?.(subtotal)}
                            variant="outline"
                            className="gap-2"
                          >
                            <CreditCard className="w-4 h-4" /> Pay
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}