import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/api/supabaseClient';
import { Plus, Trash2, Pencil, Upload } from 'lucide-react';

const defaultDish = {
  name: '', short_description: '', long_description: '', image_url: '',
  regular_price: 0, sale_price: 0, category_id: '', is_veg: true,
  dietary_tags: [], prep_time_value: 0, prep_time_unit: 'min',
  like_count: 0, ordered_today_count: 0, spice_level: 'medium', calories: 0, is_active: true, sort_order: 0,
};

export default function DishesSection({ dishes = [], categories = [], onRefresh }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...defaultDish });
  const [editId, setEditId] = useState(null);

  const openNew = () => {
    setForm({ ...defaultDish, sort_order: dishes.length });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (dish) => {
    setForm({ ...defaultDish, ...dish });
    setEditId(dish.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const data = { ...form, regular_price: Number(form.regular_price), sale_price: Number(form.sale_price), prep_time_value: Number(form.prep_time_value), calories: Number(form.calories), like_count: Number(form.like_count), ordered_today_count: Number(form.ordered_today_count) };
    if (editId) {
      await supabase.entities.Dish.update(editId, data);
    } else {
      await supabase.entities.Dish.create(data);
    }
    setDialogOpen(false);
    onRefresh();
  };

  const handleDelete = async (id) => {
    await supabase.entities.Dish.delete(id);
    onRefresh();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await supabase.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Dishes</h2>
        <Button onClick={openNew} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="w-4 h-4" /> Add Dish
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {dishes.map(dish => (
          <div key={dish.id} className="bg-card border border-border rounded-xl p-3 flex items-start gap-3">
            {dish.image_url && (
              <img src={dish.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-semibold truncate">{dish.name}</p>
              <p className="text-xs text-muted-foreground">
                ₹{dish.sale_price || dish.regular_price} · Likes: {dish.like_count || 0} · Ordered Today: {dish.ordered_today_count || 0}
              </p>
              <p className="text-xs text-muted-foreground truncate">{dish.short_description}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={() => openEdit(dish)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(dish.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle className="font-display">{editId ? 'Edit Dish' : 'Add Dish'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} className="mt-1 bg-secondary" />
            </div>
            <div>
              <Label>Image</Label>
              <div className="mt-1 flex items-center gap-3">
                {form.image_url && <img src={form.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm">
                    <Upload className="w-4 h-4" /> Upload
                  </span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Regular Price</Label>
                <Input type="number" value={form.regular_price} onChange={e => set('regular_price', e.target.value)} className="mt-1 bg-secondary" />
              </div>
              <div>
                <Label>Sale Price</Label>
                <Input type="number" value={form.sale_price} onChange={e => set('sale_price', e.target.value)} className="mt-1 bg-secondary" />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={v => set('category_id', v)}>
                <SelectTrigger className="mt-1 bg-secondary"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Short Description</Label>
              <Input value={form.short_description} onChange={e => set('short_description', e.target.value)} className="mt-1 bg-secondary" />
            </div>
            <div>
              <Label>Long Description</Label>
              <Textarea value={form.long_description} onChange={e => set('long_description', e.target.value)} className="mt-1 bg-secondary" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Prep Time</Label>
                <Input type="number" value={form.prep_time_value} onChange={e => set('prep_time_value', e.target.value)} className="mt-1 bg-secondary" />
              </div>
              <div>
                <Label>Unit</Label>
                <Select value={form.prep_time_unit} onValueChange={v => set('prep_time_unit', v)}>
                  <SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sec">Seconds</SelectItem>
                    <SelectItem value="min">Minutes</SelectItem>
                    <SelectItem value="hr">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Likes</Label>
                <Input type="number" value={form.like_count} onChange={e => set('like_count', e.target.value)} className="mt-1 bg-secondary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ordered Today</Label>
                <Input type="number" value={form.ordered_today_count} onChange={e => set('ordered_today_count', e.target.value)} className="mt-1 bg-secondary" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_veg} onCheckedChange={v => set('is_veg', v)} />
                <Label>{form.is_veg ? 'Veg' : 'Non-Veg'}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => set('is_active', v)} />
                <Label>{form.is_active ? 'Active' : 'Hidden'}</Label>
              </div>
            </div>
            <div>
              <Label>Spice Level</Label>
              <Select value={form.spice_level} onValueChange={v => set('spice_level', v)}>
                <SelectTrigger className="mt-1 bg-secondary"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="extra_hot">Extra Hot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground">
              {editId ? 'Update Dish' : 'Create Dish'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}