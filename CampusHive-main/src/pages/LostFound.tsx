import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MapPin, Clock, Eye, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const itemCategories = ["Electronics", "ID/Cards", "Personal", "Academic", "Other"];
const categoryIcons: Record<string, string> = { Electronics: "🔌", "ID/Cards": "🪪", Personal: "🎒", Academic: "📓", Other: "📦" };

interface LFItem {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  location: string;
  reporter_name: string;
  reporter_contact: string;
  status: string;
  match_note: string | null;
  created_at: string;
}

export default function LostFound() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState<LFItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({ type: "lost", title: "", description: "", category: "", location: "", contact: "" });

  const fetchItems = async () => {
    const { data } = await supabase.from("lost_found_items").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as LFItem[]);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleCreate = async () => {
    if (!user) return;
    if (!form.title || !form.category || !form.location) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("lost_found_items").insert({
      user_id: user.id,
      type: form.type,
      title: form.title,
      description: form.description,
      category: form.category,
      location: form.location,
      reporter_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonymous",
      reporter_contact: form.contact,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to report item", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item reported!" });
      setForm({ type: "lost", title: "", description: "", category: "", location: "", contact: "" });
      setDialogOpen(false);
      fetchItems();
    }
  };

  const filtered = items.filter(
    (item) =>
      (tab === "all" || item.type === tab) &&
      (!search || item.title.toLowerCase().includes(search.toLowerCase()))
  );

  const timeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <>
      <PageHeader
        title="Lost & Found"
        description="Help reunite items with owners"
        icon={<Search className="w-5 h-5 text-primary-foreground" />}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Report Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Report an Item</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Type *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lost">I Lost Something</SelectItem>
                      <SelectItem value="found">I Found Something</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Item Name *</Label><Input placeholder="e.g. Blue Water Bottle" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category *</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                      <SelectContent>{itemCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Location *</Label><Input placeholder="Where?" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                </div>
                <div><Label>Contact (optional)</Label><Input placeholder="Phone / email" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea placeholder="More details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <Button className="w-full" onClick={handleCreate} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Report Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="lost">Lost</TabsTrigger>
          <TabsTrigger value="found">Found</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={cn("shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5", item.match_note && "ring-1 ring-primary/30")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{categoryIcons[item.category] || "📦"}</span>
                    <Badge className={cn("text-[10px]", item.type === "lost" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success")}>
                      {item.type === "lost" ? <AlertCircle className="w-2.5 h-2.5 mr-0.5" /> : <Eye className="w-2.5 h-2.5 mr-0.5" />}
                      {item.type}
                    </Badge>
                  </div>
                  {item.status === "resolved" && (
                    <Badge className="bg-success/10 text-success text-[10px]"><CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Resolved</Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{item.description}</p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {item.location}</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {timeSince(item.created_at)}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-border text-xs text-muted-foreground">
                  <p>Reported by: {item.reporter_name}</p>
                  {item.reporter_contact && <p>Contact: {item.reporter_contact}</p>}
                </div>
                {item.match_note && (
                  <div className="mt-3 p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-[11px] text-primary font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Potential Match</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.match_note}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No items found</p>
        </div>
      )}
    </>
  );
}
