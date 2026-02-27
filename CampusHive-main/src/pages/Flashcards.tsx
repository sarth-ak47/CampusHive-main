import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Loader2, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Flashcard {
  question: string;
  answer: string;
}

export default function Flashcards() {
  const [notes, setNotes] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    if (!notes.trim() || notes.trim().length < 20) {
      toast({ title: "Please paste more text", variant: "destructive" });
      return;
    }
    setLoading(true);
    setCards([]);
    try {
      const { data, error } = await supabase.functions.invoke("generate-flashcards", {
        body: { notes: notes.slice(0, 5000) },
      });
      if (error) throw error;
      setCards(data.flashcards || []);
      setCurrentIdx(0);
      setFlipped(false);
    } catch (err: any) {
      toast({ title: "Failed to generate", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const card = cards[currentIdx];

  return (
    <>
      <PageHeader
        title="AI Flashcards"
        description="Generate study cards from notes"
        icon={<BookOpen className="w-5 h-5 text-primary-foreground" />}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-5">
            <Textarea
              placeholder="Paste your lecture notes, textbook passages, or any study material here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[250px] resize-none text-sm bg-muted/30 border-0 focus-visible:ring-1"
            />
            <Button onClick={generate} disabled={loading || !notes.trim()} className="w-full mt-4">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
              Generate Flashcards
            </Button>
          </CardContent>
        </Card>

        <div>
          {cards.length > 0 && card ? (
            <div className="space-y-4">
              <div
                className="cursor-pointer perspective-1000"
                onClick={() => setFlipped(!flipped)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentIdx}-${flipped}`}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`shadow-card min-h-[200px] flex items-center justify-center ${flipped ? "border-primary/30" : ""}`}>
                      <CardContent className="p-8 text-center">
                        <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">
                          {flipped ? "Answer" : "Question"} · Click to flip
                        </p>
                        <p className="text-lg font-medium text-foreground leading-relaxed">
                          {flipped ? card.answer : card.question}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentIdx === 0}
                  onClick={() => { setCurrentIdx(currentIdx - 1); setFlipped(false); }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentIdx + 1} / {cards.length}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentIdx === cards.length - 1}
                  onClick={() => { setCurrentIdx(currentIdx + 1); setFlipped(false); }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : !loading ? (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Paste your notes and hit generate</p>
                <p className="text-xs mt-1">AI will create Q&A flashcards for you</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
