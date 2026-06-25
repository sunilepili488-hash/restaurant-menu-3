import React from 'react';
import { Search, SlidersHorizontal, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MenuHeader({ restaurant, onSearchOpen, onFilterOpen, onUserClick, hideUserIcon }) {
  const IconBtn = ({ children, onClick, label }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={label}
      className="w-10 h-10 rounded-full glass flex items-center justify-center text-primary/80 hover:text-primary transition-colors"
    >
      {children}
    </motion.button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Logo + Name + Hours */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {restaurant?.logo_url && (
            <img
              src={restaurant.logo_url}
              alt=""
              className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-lg flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <h1 className="font-display text-lg md:text-xl font-semibold text-foreground truncate leading-tight">
              {restaurant?.name || 'Restaurant'}
            </h1>
            {restaurant?.operating_hours && (
              <p className="text-[10px] md:text-xs text-muted-foreground leading-tight truncate">
                {restaurant.operating_hours}
              </p>
            )}
          </div>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <IconBtn onClick={onSearchOpen} label="Search">
            <Search className="w-4 h-4" />
          </IconBtn>
          <IconBtn onClick={onFilterOpen} label="Filter">
            <SlidersHorizontal className="w-4 h-4" />
          </IconBtn>
          {!hideUserIcon && (
            <IconBtn onClick={onUserClick} label="Account">
              <User className="w-4 h-4" />
            </IconBtn>
          )}
        </div>
      </div>
    </header>
  );
}