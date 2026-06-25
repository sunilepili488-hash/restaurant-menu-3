import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/api/supabaseClient';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CategoriesSection({ categories = [], onRefresh }) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const addCategory = async () => {
    if (!newName.trim()) return;
    await supabase.entities.Category.create({
      name: newName.trim(),
      sort_order: categories.length,
      is_active: true,
    });
    setNewName('');
    onRefresh();
  };

  const deleteCategory = async (id) => {
    await supabase.entities.Category.delete(id);
    onRefresh();
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    await supabase.entities.Category.update(id, { name: editName.trim() });
    setEditingId(null);
    onRefresh();
  };

  const moveCategory = async (index, direction) => {
    const sorted = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const updates = sorted.map((cat, i) => {
      if (i === index) return { id: cat.id, sort_order: target };
      if (i === target) return { id: cat.id, sort_order: index };
      return null;
    }).filter(Boolean);
    for (const u of updates) {
      await supabase.entities.Category.update(u.id, { sort_order: u.sort_order });
    }
    onRefresh();
  };

  const sorted = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Categories</h2>

      {/* Add new */}
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New category name"
          className="bg-secondary"
          onKeyDown={e => e.key === 'Enter' && addCategory()}
        />
        <Button onClick={addCategory} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {sorted.map((cat, i) => (
          <motion.div
            key={cat.id}
            layout
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
          >
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveCategory(i, -1)} className="text-muted-foreground hover:text-foreground text-xs">▲</button>
              <button onClick={() => moveCategory(i, 1)} className="text-muted-foreground hover:text-foreground text-xs">▼</button>
            </div>
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            {editingId === cat.id ? (
              <div className="flex-1 flex gap-2">
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="bg-secondary flex-1"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && saveEdit(cat.id)}
                />
                <Button size="sm" onClick={() => saveEdit(cat.id)}>
                  <Save className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <span
                className="flex-1 text-sm font-medium cursor-pointer"
                onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
              >
                {cat.name}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteCategory(cat.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No categories yet</p>
        )}
      </div>
    </div>
  );
}