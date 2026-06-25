import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Heart, MessageCircle, ChevronDown, ShoppingBag, Leaf, Drumstick } from 'lucide-react';
import { Bookmark } from 'lucide-react';
import { menuStore, useMenuStore } from '@/lib/menuStore';
import { supabase as base44 } from '@/api/supabaseClient';
import { formatCount, getOrderedToday } from '@/lib/formatUtils';
import { User } from 'lucide-react';
import LazyImage from './LazyImage';

function DishCardGrid({ dish, restaurant, onReviewOpen, eager }) {
  const store = useMenuStore();
  const [expanded, setExpanded] = useState(false);
  const [likeCount, setLikeCount] = useState(dish.like_count || 0);
  const orderedToday = getOrderedToday(dish);
  const isFav = store.favorites.includes(dish.id);
  const isLiked = store.likedDishes[dish.id] || false;
  const icons = restaurant?.icon_settings || {};

  const hasDiscount = dish.sale_price && dish.sale_price < dish.regular_price;
  const discountPct = hasDiscount
    ? Math.round(((dish.regular_price - dish.sale_price) / dish.regular_price) * 100)
    : 0;
  const curr = restaurant?.currency_symbol || '₹';

  const prepTimeStr = dish.prep_time_value
    ? `${dish.prep_time_value} ${dish.prep_time_unit || 'min'}`
    : null;

  const isHidden = (key) => icons[key]?.hidden === true;

  const handleLike = async (e) => {
    e.stopPropagation();
    const nowLiked = menuStore.toggleLike(dish.id);
    const newCount = nowLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLikeCount(newCount);
    base44.entities.Dish.update(dish.id, { like_count: newCount });
  };

  return (
    <div className="glass rounded-2xl overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <LazyImage
          src={dish.image_url}
          alt={dish.name}
          fallbackText="No Image"
          eager={eager}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top-left: discount + veg/non-veg */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {hasDiscount && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              {discountPct}% OFF
            </span>
          )}
          <span className={`w-5 h-5 rounded-full flex items-center justify-center ${dish.is_veg ? 'bg-green-600' : 'bg-red-600'}`}>
            {dish.is_veg ? <Leaf className="w-3 h-3 text-white" /> : <Drumstick className="w-3 h-3 text-white" />}
          </span>
        </div>

        {/* Top-right: Favorite (bookmark icon) */}
        {!isHidden('favorite') && (
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); menuStore.toggleFavorite(dish.id); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full glass flex items-center justify-center"
          >
            <Bookmark className={`w-4 h-4 transition-colors ${isFav ? 'text-primary fill-primary' : 'text-foreground/60'}`} />
          </motion.button>
        )}

        {/* Bottom-left: prep time */}
        {prepTimeStr && (
          <span className="absolute bottom-2 left-2 glass text-[10px] text-foreground/80 px-2 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> {prepTimeStr}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-display text-base font-semibold text-foreground leading-tight line-clamp-1">
          {dish.name}
        </h3>
        {dish.short_description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{dish.short_description}</p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-primary font-bold text-sm">
            {curr}{(dish.sale_price || dish.regular_price).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-muted-foreground text-xs line-through">
              {curr}{dish.regular_price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Like row */}
        {!isHidden('like') && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className="flex items-center gap-1.5"
            >
              <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
              <span className="text-xs text-muted-foreground">{formatCount(likeCount)}</span>
            </motion.button>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground/70" />
              <span className="text-xs text-muted-foreground">{formatCount(orderedToday)}</span>
            </div>
          </div>
        )}

        {/* Icon row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          {!isHidden('comment') && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={(e) => { e.stopPropagation(); onReviewOpen?.(dish); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </motion.button>
          )}

          {!isHidden('more') && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </motion.button>
          )}

          {!isHidden('cart') && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={(e) => { e.stopPropagation(); menuStore.addToCart(dish); }}
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Expanded description */}
        <AnimatePresence>
          {expanded && dish.long_description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {dish.long_description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default memo(DishCardGrid);