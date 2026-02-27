import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Heart, Dumbbell, Moon, BookOpen, MapPin, Clock, Save, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const INTEREST_OPTIONS = [
  { id: "gym", label: "Gym Partner", icon: Dumbbell },
  { id: "night_walk", label: "Night Walk", icon: Moon },
  { id: "study", label: "Group Study", icon: BookOpen },
  { id: "discussion", label: "Discussion", icon: Users },
];

const TIME_OPTIONS = ["morning", "afternoon", "evening", "night"];
const LOCATION_OPTIONS = ["hostel", "library", "gym", "campus_paths", "cafeteria"];

interface BuddyMatch {
  user_id: string;
  bio: string;
  interests: string[];
  available_times: string[];
  preferred_locations: string[];
  profile?: { full_name: string; department: string | null; year: number | null };
}

export default function Friends() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [interests, setInterests] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [matches, setMatches] = useState<BuddyMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadPreferences();
    loadMatches();
  }, [user]);

  const loadPreferences = async () => {
    const { data } = await supabase
      .from("buddy_preferences")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();
    if (data) {
      setInterests(data.interests || []);
      setTimes(data.available_times || []);
      setLocations(data.preferred_locations || []);
      setBio(data.bio || "");
    }
  };

  const loadMatches = async () => {
    setLoadingMatches(true);
    const { data } = await supabase
      .from("buddy_preferences")
      .select("*")
      .neq("user_id", user!.id)
      .limit(20);
    if (data) {
      const userIds = data.map((d) => d.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, department, year")
        .in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
      const withProfiles: BuddyMatch[] = data.map((d) => ({
        ...d,
        profile: profileMap.get(d.user_id) as BuddyMatch["profile"],
      }));
      // Sort by overlap with current user's interests
      withProfiles.sort((a, b) => {
        const overlapA = a.interests.filter((i) => interests.includes(i)).length;
        const overlapB = b.interests.filter((i) => interests.includes(i)).length;
        return overlapB - overlapA;
      });
      setMatches(withProfiles);
    }
    setLoadingMatches(false);
  };

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((a) => a !== val) : [...arr, val]);
  };

  const savePreferences = async () => {
    if (!user) return;
    setSaving(true);
    const payload = { user_id: user.id, interests, available_times: times, preferred_locations: locations, bio, updated_at: new Date().toISOString() };
    const { data: existing } = await supabase.from("buddy_preferences").select("id").eq("user_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("buddy_preferences").update(payload).eq("user_id", user.id);
    } else {
      await supabase.from("buddy_preferences").insert(payload);
    }
    toast({ title: "Preferences saved!" });
    setSaving(false);
    loadMatches();
  };

  return (
    <>
      <PageHeader
        title="Buddy Finder"
        description="Find partners for study, gym, walks & more"
        icon={<Users className="w-5 h-5 text-primary-foreground" />}
      />

      <Tabs defaultValue="find" className="space-y-4">
        <TabsList>
          <TabsTrigger value="find">Find Buddies</TabsTrigger>
          <TabsTrigger value="preferences">My Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Interests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((opt) => (
                  <Button
                    key={opt.id}
                    size="sm"
                    variant={interests.includes(opt.id) ? "default" : "outline"}
                    onClick={() => toggle(interests, opt.id, setInterests)}
                    className="h-8 text-xs"
                  >
                    <opt.icon className="w-3.5 h-3.5 mr-1" /> {opt.label}
                  </Button>
                ))}
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Available Times</p>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.map((t) => (
                    <Button key={t} size="sm" variant={times.includes(t) ? "default" : "outline"} onClick={() => toggle(times, t, setTimes)} className="h-7 text-xs capitalize">
                      <Clock className="w-3 h-3 mr-1" /> {t}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Preferred Locations</p>
                <div className="flex flex-wrap gap-2">
                  {LOCATION_OPTIONS.map((l) => (
                    <Button key={l} size="sm" variant={locations.includes(l) ? "default" : "outline"} onClick={() => toggle(locations, l, setLocations)} className="h-7 text-xs capitalize">
                      <MapPin className="w-3 h-3 mr-1" /> {l.replace("_", " ")}
                    </Button>
                  ))}
                </div>
              </div>

              <Textarea placeholder="Short bio – e.g. 'Looking for a gym buddy, 3rd year CS'" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[60px] text-sm" />

              <Button onClick={savePreferences} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="find">
          {loadingMatches ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Finding buddies…</p>
            </div>
          ) : matches.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="text-center py-12">
                <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No buddies found yet.</p>
                <p className="text-xs text-muted-foreground">Set your preferences first and more students will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((m, i) => {
                const overlap = m.interests.filter((int) => interests.includes(int)).length;
                return (
                  <motion.div key={m.user_id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="shadow-card hover:shadow-card-hover transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {(m.profile?.full_name || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{m.profile?.full_name || "Student"}</h3>
                            <p className="text-[10px] text-muted-foreground">
                              {m.profile?.department || "—"} {m.profile?.year ? `• Year ${m.profile.year}` : ""}
                            </p>
                          </div>
                          {overlap > 0 && (
                            <Badge className="ml-auto text-[10px] bg-success/10 text-success border-success/20">
                              <Heart className="w-2.5 h-2.5 mr-0.5" /> {overlap} match{overlap > 1 ? "es" : ""}
                            </Badge>
                          )}
                        </div>
                        {m.bio && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{m.bio}</p>}
                        <div className="flex flex-wrap gap-1">
                          {m.interests.map((int) => (
                            <Badge key={int} variant="outline" className="text-[9px] capitalize">{int.replace("_", " ")}</Badge>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {m.available_times.map((t) => (
                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">{t}</span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
