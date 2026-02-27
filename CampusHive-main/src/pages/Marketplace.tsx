import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Plus, Search, Heart, Sparkles, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const categories = ["All", "Textbooks", "Electronics", "Furniture", "Cycles", "Clothing", "Other"];
const conditions = ["Like New", "Good", "Fair", "Worn"];
const emojiMap: Record<string, string> = {
  Textbooks: "📘", Electronics: "🖥️", Furniture: "🪑", Cycles: "🚲", Clothing: "👕", Other: "📦",
};

const conditionColors: Record<string, string> = {
  "Like New": "bg-success/10 text-success",
  Good: "bg-info/10 text-info",
  Fair: "bg-warning/10 text-warning",
  Worn: "bg-destructive/10 text-destructive",
};

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  seller_name: string;
  seller_contact: string;
  image_emoji: string;
  ai_price: number | null;
  created_at: string;
}

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [form, setForm] = useState({ title: "", description: "", price: "", category: "", condition: "", contact: "" });

  const fetchListings = async () => {
    const { data } = await supabase.from("marketplace_listings").select("*").order("created_at", { ascending: false });
    if (data) setListings(data as Listing[]);
  };

  useEffect(() => { fetchListings(); }, []);

  const handleCreate = async () => {
    if (!user) return;
    if (!form.title || !form.category || !form.condition || !form.price) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("marketplace_listings").insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      price: parseInt(form.price),
      category: form.category,
      condition: form.condition,
      seller_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonymous",
      seller_contact: form.contact,
      image_emoji: emojiMap[form.category] || "📦",
    });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to create listing", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Listing created!" });
      setForm({ title: "", description: "", price: "", category: "", condition: "", contact: "" });
      setDialogOpen(false);
      fetchListings();
    }
  };

  const filtered = listings.filter(
    (l) =>
      (category === "All" || l.category === category) &&
      (!search || l.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <PageHeader
        title="Marketplace"
        description="Buy & sell within campus"
        icon={<ShoppingBag className="w-5 h-5 text-primary-foreground" />}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Listing</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Listing</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Title *</Label><Input placeholder="What are you selling?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category *</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                      <SelectContent>{categories.slice(1).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Condition *</Label>
                    <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                      <SelectTrigger><SelectValue placeholder="Condition" /></SelectTrigger>
                      <SelectContent>{conditions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Price (₹) *</Label><Input type="number" placeholder="Enter price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                <div><Label>Contact (optional)</Label><Input placeholder="Phone / WhatsApp" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea placeholder="Describe the item..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <Button className="w-full" onClick={handleCreate} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
                  Create Listing
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <Button key={c} size="sm" variant={category === c ? "default" : "outline"} onClick={() => setCategory(c)} className="h-8 text-xs">{c}</Button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}>
              <Card className="shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 group overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-32 bg-muted/50 flex items-center justify-center text-5xl relative">
                    {item.image_emoji}
                    <button
                      onClick={() => setFavorites((prev) => { const n = new Set(prev); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n; })}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center border shadow-sm"
                    >
                      <Heart className={cn("w-4 h-4", favorites.has(item.id) ? "fill-destructive text-destructive" : "text-muted-foreground")} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">{item.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={cn("text-[10px] h-5", conditionColors[item.condition])}>{item.condition}</Badge>
                      <Badge variant="outline" className="text-[10px] h-5">{item.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">₹{item.price}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-[11px] text-muted-foreground">Seller: {item.seller_name}</p>
                      {item.seller_contact && <p className="text-[11px] text-muted-foreground">Contact: {item.seller_contact}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No listings found</p>
        </div>
      )}
    </>
  );
}
