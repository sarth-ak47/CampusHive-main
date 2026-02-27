import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Sparkles, AlertTriangle, Calendar, Tag, Loader2, Clock, ArrowRight, Inbox } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SummaryResult {
  summary: string;
  actionItems: string[];
  deadlines: string[];
  category: string;
  priority: "high" | "medium" | "low";
  relevance: string;
}

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

const sampleEmails = [
  {
    subject: "Mid-Semester Exam Schedule",
    body: `Dear Students,\n\nThis is to inform you that the mid-semester examinations for the Fall 2025 semester will be held from March 15 to March 22, 2025. The detailed schedule has been uploaded to the academic portal.\n\nKey points:\n1. All students must carry their ID cards to the examination hall.\n2. Seating arrangements will be displayed outside exam halls 30 minutes before each exam.\n3. Students with medical issues should contact the Dean's office by March 10 for special arrangements.\n4. Any change requests must be submitted through the proper channel by March 8.\n5. The library will have extended hours (7 AM - 12 AM) during the exam period.\n\nPlease ensure you have completed all prerequisite assignments before appearing for the exams. Late submissions will not be accepted.\n\nRegards,\nDean of Academic Affairs`,
  },
  {
    subject: "Cultural Fest Volunteer Call",
    body: `Hey everyone!\n\nOur annual cultural fest "Resonance 2025" is happening from April 5-7, and we need YOUR help to make it amazing!\n\nWe're looking for volunteers in the following departments:\n- Stage Management (50 volunteers needed)\n- Hospitality & Registration (30 volunteers)\n- Technical/Sound (20 volunteers)\n- Decoration & Setup (40 volunteers)\n- Social Media Coverage (15 volunteers)\n\nPerks of volunteering:\n✅ Free fest pass (worth ₹500)\n✅ Official volunteer t-shirt\n✅ Certificate of participation\n✅ Priority seating for headliner performance\n\nDeadline to sign up: March 20, 2025\nRegistration link: https://resonance2025.college.edu/volunteer\n\nLast year we had 10,000+ attendees and this year is going to be even bigger! Don't miss out!\n\nReach out to culturalclub@college.edu for any queries.\n\nBest,\nCultural Committee`,
  },
];

export default function MailSummarizer() {
  const [emailText, setEmailText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [history, setHistory] = useState<(SummaryResult & { originalSnippet: string })[]>([]);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!emailText.trim()) {
      toast({ title: "Please paste an email first", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);

    if (emailText.trim().length < 10) {
      toast({ title: "Email text too short", description: "Please paste at least 10 characters.", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("summarize-email", {
        body: { emailText: emailText.trim() },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const parsed = data as SummaryResult;
      setResult(parsed);
      setHistory((prev) => [{ ...parsed, originalSnippet: emailText.slice(0, 80) + "..." }, ...prev].slice(0, 10));
    } catch (err: any) {
      console.error("Summarize error:", err);
      toast({
        title: "Failed to summarize",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Mail Summarizer"
        description="AI-powered email intelligence"
        icon={<Mail className="w-5 h-5 text-primary-foreground" />}
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="shadow-card">
            <CardContent className="p-5">
              <Textarea
                placeholder="Paste your college email here..."
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                className="min-h-[200px] resize-none text-sm bg-muted/30 border-0 focus-visible:ring-1"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  {sampleEmails.map((s, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant="outline"
                      className="text-[11px] h-7"
                      onClick={() => setEmailText(s.body)}
                    >
                      Try: {s.subject.slice(0, 20)}…
                    </Button>
                  ))}
                </div>
                <Button onClick={handleSummarize} disabled={loading || !emailText.trim()}>
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-1" /> Summarize</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="shadow-card border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> AI Summary
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        <Tag className="w-2.5 h-2.5 mr-1" />
                        {result.category}
                      </Badge>
                      <Badge className={`text-[10px] ${priorityStyles[result.priority]}`}>
                        {result.priority} priority
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>

                  {result.actionItems.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Action Items</h4>
                      <ul className="space-y-1.5">
                        {result.actionItems.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <ArrowRight className="w-3 h-3 text-primary mt-1 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.deadlines.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Deadlines</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.deadlines.map((d, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" /> {d}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Relevance:</span> {result.relevance}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* History */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Inbox className="w-4 h-4 text-primary" /> Recent Summaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No summaries yet</p>
                  <p className="text-xs">Paste an email to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] h-4">{h.category}</Badge>
                        <Badge className={`text-[10px] h-4 ${priorityStyles[h.priority]}`}>{h.priority}</Badge>
                      </div>
                      <p className="text-xs text-foreground line-clamp-2">{h.summary}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate">{h.originalSnippet}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
