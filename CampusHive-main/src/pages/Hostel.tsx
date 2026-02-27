import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building, Bed, UtensilsCrossed, Dumbbell, ShirtIcon, AlertTriangle,
  Plus, Loader2, CheckCircle, Clock, XCircle
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const statusIcons: Record<string, React.ReactNode> = {
  new: <Clock className="w-3.5 h-3.5 text-warning" />,
  "in-progress": <Loader2 className="w-3.5 h-3.5 text-info animate-spin" />,
  resolved: <CheckCircle className="w-3.5 h-3.5 text-success" />,
};

const statusColors: Record<string, string> = {
  new: "bg-warning/10 text-warning border-warning/20",
  "in-progress": "bg-info/10 text-info border-info/20",
  resolved: "bg-success/10 text-success border-success/20",
};

export default function Hostel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hostel, setHostel] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [laundry, setLaundry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [complaintCat, setComplaintCat] = useState("maintenance");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    const [h, c, l] = await Promise.all([
      supabase.from("hostel_info").select("*").eq("user_id", user!.id).maybeSingle(),
      supabase.from("hostel_complaints").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("laundry_requests").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
    ]);
    setHostel(h.data);
    setComplaints(c.data || []);
    setLaundry(l.data || []);
    setLoading(false);
  };

  const submitComplaint = async () => {
    if (!complaintDesc.trim()) return;
    setSubmitting(true);
    await supabase.from("hostel_complaints").insert({
      user_id: user!.id,
      category: complaintCat,
      description: complaintDesc.trim(),
      hostel_name: hostel?.hostel_name || "",
      room_number: hostel?.room_number || "",
    });
    toast({ title: "Complaint submitted" });
    setComplaintDesc("");
    setComplaintOpen(false);
    setSubmitting(false);
    loadAll();
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Hostel" description="Your hostel dashboard" icon={<Building className="w-5 h-5 text-primary-foreground" />} />
        <div className="text-center py-16 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
      </>
    );
  }

  // Mock data if no hostel info exists
  const info = hostel || { hostel_name: "Brahmaputra Hostel", room_number: "B-214", room_type: "double", roommates: ["Rahul K."], mess_plan: "standard", gym_active: true, gym_valid_until: "2026-06-30T00:00:00Z" };

  return (
    <>
      <PageHeader title="Hostel" description="Your hostel dashboard" icon={<Building className="w-5 h-5 text-primary-foreground" />} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="complaints">Complaints ({complaints.length})</TabsTrigger>
          <TabsTrigger value="laundry">Laundry</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Bed className="w-5 h-5 text-primary" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Room</p>
                    <p className="text-sm font-bold text-foreground">{info.room_number}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p><span className="font-medium text-foreground">Hostel:</span> {info.hostel_name}</p>
                  <p><span className="font-medium text-foreground">Type:</span> {info.room_type}</p>
                  {info.roommates?.length > 0 && <p><span className="font-medium text-foreground">Roommate(s):</span> {info.roommates.join(", ")}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center"><UtensilsCrossed className="w-5 h-5 text-warning" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mess Plan</p>
                    <p className="text-sm font-bold text-foreground capitalize">{info.mess_plan}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Your current meal subscription. Contact warden to change.</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center"><Dumbbell className="w-5 h-5 text-success" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gym</p>
                    <p className="text-sm font-bold text-foreground">{info.gym_active ? "Active" : "Inactive"}</p>
                  </div>
                </div>
                {info.gym_valid_until && (
                  <p className="text-xs text-muted-foreground">Valid until: {new Date(info.gym_valid_until).toLocaleDateString()}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Complaints */}
        <TabsContent value="complaints" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={complaintOpen} onOpenChange={setComplaintOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Complaint</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Lodge Complaint</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Select value={complaintCat} onValueChange={setComplaintCat}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["maintenance", "cleanliness", "noise", "water", "electricity", "other"].map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Describe the issue…" value={complaintDesc} onChange={(e) => setComplaintDesc(e.target.value)} />
                  <Button onClick={submitComplaint} disabled={submitting || !complaintDesc.trim()} className="w-full">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Submit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {complaints.length === 0 ? (
            <Card className="shadow-card"><CardContent className="text-center py-10 text-muted-foreground text-sm">No complaints lodged yet.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {complaints.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="shadow-card">
                    <CardContent className="p-4 flex items-start gap-3">
                      {statusIcons[c.status] || <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] capitalize">{c.category}</Badge>
                          <Badge className={`text-[10px] ${statusColors[c.status] || ""}`}>{c.status}</Badge>
                        </div>
                        <p className="text-sm text-foreground">{c.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Laundry */}
        <TabsContent value="laundry">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><ShirtIcon className="w-4 h-4 text-primary" /> Laundry Status</CardTitle>
            </CardHeader>
            <CardContent>
              {laundry.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <ShirtIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No laundry requests yet.</p>
                  <p className="text-xs">Laundry slot booking coming soon!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {laundry.map((l) => (
                    <div key={l.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                      <div>
                        <p className="text-sm font-medium text-foreground">{l.clothes_count} items</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(l.created_at).toLocaleString()}</p>
                      </div>
                      <Badge className={statusColors[l.status] || ""}>{l.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
