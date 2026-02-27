import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, Plus, Users, Clock, IndianRupee, ArrowRight, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  trip_date: string;
  trip_time: string;
  total_seats: number;
  seats_left: number;
  cost_per_seat: number;
  driver_name: string;
  driver_contact: string;
  created_at: string;
}

export default function TravelSharing() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({ from: "", to: "", date: "", time: "", seats: "4", cost: "", contact: "" });

  const fetchTrips = async () => {
    const { data } = await supabase.from("travel_trips").select("*").order("created_at", { ascending: false });
    if (data) setTrips(data as Trip[]);
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleCreate = async () => {
    if (!user) return;
    if (!form.from || !form.to || !form.date || !form.time || !form.cost) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    const seats = parseInt(form.seats) || 4;
    const { error } = await supabase.from("travel_trips").insert({
      user_id: user.id,
      from_location: form.from,
      to_location: form.to,
      trip_date: form.date,
      trip_time: form.time,
      total_seats: seats,
      seats_left: seats,
      cost_per_seat: parseInt(form.cost),
      driver_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonymous",
      driver_contact: form.contact,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to post trip", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Trip posted!" });
      setForm({ from: "", to: "", date: "", time: "", seats: "4", cost: "", contact: "" });
      setDialogOpen(false);
      fetchTrips();
    }
  };

  return (
    <>
      <PageHeader
        title="Travel Sharing"
        description="Share rides, split costs"
        icon={<Car className="w-5 h-5 text-primary-foreground" />}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Post a Trip</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Post a Trip</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>From *</Label><Input placeholder="Campus" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></div>
                  <div><Label>To *</Label><Input placeholder="Chandigarh" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                  <div><Label>Time *</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Seats</Label><Input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} /></div>
                  <div><Label>Cost per seat (₹) *</Label><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
                </div>
                <div><Label>Contact (phone/WhatsApp)</Label><Input placeholder="+91 ..." value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
                <Button className="w-full" onClick={handleCreate} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Post Trip
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map((trip, i) => (
          <motion.div key={trip.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-semibold text-foreground">{trip.from_location}</span>
                    </div>
                    <div className="ml-1 w-px h-4 bg-border" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="text-sm font-semibold text-foreground">{trip.to_location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground flex items-center">
                      <IndianRupee className="w-4 h-4" />{trip.cost_per_seat}
                    </div>
                    <span className="text-[10px] text-muted-foreground">per seat</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="text-[10px]">
                    <Clock className="w-2.5 h-2.5 mr-1" /> {trip.trip_date}, {trip.trip_time}
                  </Badge>
                  <Badge className={cn("text-[10px]", trip.seats_left <= 1 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success")}>
                    <Users className="w-2.5 h-2.5 mr-1" /> {trip.seats_left}/{trip.total_seats} seats
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <span className="text-xs text-muted-foreground">by {trip.driver_name}</span>
                    {trip.driver_contact && <p className="text-[10px] text-muted-foreground">{trip.driver_contact}</p>}
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Join <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {trips.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Car className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No trips posted yet</p>
          <p className="text-xs mt-1">Be the first to share a ride!</p>
        </div>
      )}
    </>
  );
}
