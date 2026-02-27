import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, CheckCircle, Clock, GraduationCap, Upload, User,
  MapPin, Mail as MailIcon, BarChart3, PieChart, AlertTriangle
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, Legend,
  LineChart, Line
} from "recharts";

interface Course {
  id: string;
  code: string;
  name: string;
  instructor_name: string;
  instructor_email: string | null;
  instructor_office: string | null;
  instructor_office_hours: string | null;
  credits: number;
}

// Mock data used when no DB data exists
const mockAssignments: Record<string, { id: number; title: string; due: string; status: string; grade: string | null }[]> = {
  CS201: [
    { id: 1, title: "Binary Tree Implementation", due: "Feb 10", status: "submitted", grade: "A" },
    { id: 2, title: "Graph Algorithms Report", due: "Feb 18", status: "pending", grade: null },
  ],
  CS301: [
    { id: 3, title: "Process Scheduling Simulation", due: "Feb 12", status: "submitted", grade: "B+" },
    { id: 4, title: "Memory Management Report", due: "Feb 20", status: "pending", grade: null },
  ],
  MA201: [
    { id: 5, title: "Eigenvalue Problem Set", due: "Feb 9", status: "submitted", grade: "A-" },
  ],
  CS202: [
    { id: 6, title: "ER Diagram Design", due: "Feb 11", status: "submitted", grade: "A" },
    { id: 7, title: "SQL Query Optimization", due: "Feb 19", status: "pending", grade: null },
  ],
};

const mockAttendance: Record<string, { total: number; attended: number }> = {
  CS201: { total: 30, attended: 26 },
  CS301: { total: 28, attended: 20 },
  MA201: { total: 25, attended: 24 },
  CS202: { total: 22, attended: 21 },
};

const mockScores: Record<string, { exam: string; score: number; max: number }[]> = {
  CS201: [{ exam: "Quiz 1", score: 18, max: 20 }, { exam: "Midterm", score: 72, max: 100 }],
  CS301: [{ exam: "Quiz 1", score: 14, max: 20 }, { exam: "Midterm", score: 58, max: 100 }],
  MA201: [{ exam: "Quiz 1", score: 19, max: 20 }, { exam: "Midterm", score: 85, max: 100 }],
  CS202: [{ exam: "Quiz 1", score: 17, max: 20 }, { exam: "Midterm", score: 78, max: 100 }],
};

const gradePoints: Record<string, number> = { A: 10, "A-": 9, "B+": 8, B: 7, "B-": 6, C: 5 };

export default function LMSLite() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [tab, setTab] = useState("courses");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const { data } = await supabase.from("courses").select("*");
    if (data && data.length > 0) {
      setCourses(data as Course[]);
      setSelectedCourse(data[0] as Course);
    }
  };

  const assignments = selectedCourse ? (mockAssignments[selectedCourse.code] || []) : [];
  const allGrades = courses.flatMap((c) => (mockAssignments[c.code] || []).filter((a) => a.grade).map((a) => a.grade!));
  const gpa = allGrades.length > 0
    ? (allGrades.reduce((sum, g) => sum + (gradePoints[g] || 0), 0) / allGrades.length).toFixed(1)
    : "N/A";
  const totalAssignments = courses.reduce((sum, c) => sum + (mockAssignments[c.code] || []).length, 0);
  const submitted = courses.reduce((sum, c) => sum + (mockAssignments[c.code] || []).filter((a) => a.status === "submitted").length, 0);

  // Performance chart data
  const performanceData = courses.map((c) => {
    const scores = mockScores[c.code] || [];
    const midterm = scores.find((s) => s.exam === "Midterm");
    const pct = midterm ? Math.round((midterm.score / midterm.max) * 100) : 0;
    return { name: c.code, score: pct, fill: pct < 60 ? "hsl(var(--destructive))" : pct < 75 ? "hsl(var(--warning))" : "hsl(var(--primary))" };
  });

  // Attendance chart data
  const attendanceData = courses.map((c) => {
    const att = mockAttendance[c.code] || { total: 0, attended: 0 };
    const pct = att.total > 0 ? Math.round((att.attended / att.total) * 100) : 0;
    return { name: c.code, percentage: pct, attended: att.attended, total: att.total };
  });

  const overallAttendance = attendanceData.length > 0
    ? Math.round(attendanceData.reduce((s, a) => s + a.percentage, 0) / attendanceData.length)
    : 0;

  return (
    <>
      <PageHeader
        title="LMS Lite"
        description="Your academic command center"
        icon={<BookOpen className="w-5 h-5 text-primary-foreground" />}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card"><CardContent className="p-4 text-center">
          <GraduationCap className="w-5 h-5 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold text-foreground">{gpa}</div>
          <div className="text-[10px] text-muted-foreground">Current GPA</div>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4 text-center">
          <BookOpen className="w-5 h-5 mx-auto mb-1 text-info" />
          <div className="text-2xl font-bold text-foreground">{courses.length}</div>
          <div className="text-[10px] text-muted-foreground">Enrolled Courses</div>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4 text-center">
          <CheckCircle className="w-5 h-5 mx-auto mb-1 text-success" />
          <div className="text-2xl font-bold text-foreground">{submitted}/{totalAssignments}</div>
          <div className="text-[10px] text-muted-foreground">Submitted</div>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4 text-center">
          <BarChart3 className="w-5 h-5 mx-auto mb-1 text-warning" />
          <div className="text-2xl font-bold text-foreground">{overallAttendance}%</div>
          <div className="text-[10px] text-muted-foreground">Attendance</div>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-all border",
                    selectedCourse?.id === course.id
                      ? "bg-primary/5 border-primary/20 shadow-sm"
                      : "bg-card border-border hover:bg-muted/50"
                  )}
                >
                  <div className="text-xs font-bold text-primary">{course.code}</div>
                  <div className="text-sm font-medium text-foreground truncate">{course.name}</div>
                  <div className="text-[10px] text-muted-foreground">{course.instructor_name}</div>
                </button>
              ))}
            </div>
            <div className="lg:col-span-3">
              {selectedCourse && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{selectedCourse.code} — {selectedCourse.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {assignments.map((a, i) => (
                      <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-4 p-3 rounded-lg border bg-muted/20"
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", a.status === "submitted" ? "bg-success/10" : "bg-warning/10")}>
                          {a.status === "submitted" ? <CheckCircle className="w-4 h-4 text-success" /> : <Clock className="w-4 h-4 text-warning" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">Due: {a.due}</span>
                            {a.grade && <Badge className="bg-primary/10 text-primary text-[10px] h-4">{a.grade}</Badge>}
                          </div>
                        </div>
                        {a.status === "pending" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs shrink-0">
                            <Upload className="w-3 h-3 mr-1" /> Submit
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Subject-wise Midterm Scores (%)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Performance Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {performanceData.map((d) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-12 text-xs font-bold text-foreground">{d.name}</div>
                    <div className="flex-1">
                      <Progress value={d.score} className="h-2.5" />
                    </div>
                    <span className="text-xs font-medium w-10 text-right" style={{ color: d.fill }}>{d.score}%</span>
                    {d.score < 60 && <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />}
                  </div>
                ))}
                <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-xs text-destructive font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {performanceData.filter((d) => d.score < 60).length > 0
                      ? `You're lagging in ${performanceData.filter((d) => d.score < 60).map((d) => d.name).join(", ")}. Focus on these subjects!`
                      : "Great job! All subjects above threshold."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Subject-wise Attendance</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      formatter={(value: any, name: string, props: any) => [`${props.payload.attended}/${props.payload.total} (${value}%)`, "Attendance"]}
                    />
                    <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Attendance Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {attendanceData.map((d) => {
                  const danger = d.percentage < 75;
                  return (
                    <div key={d.name} className="p-3 rounded-lg border bg-muted/20">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-foreground">{d.name}</span>
                        <span className={cn("text-xs font-medium", danger ? "text-destructive" : "text-success")}>
                          {d.percentage}%
                        </span>
                      </div>
                      <Progress value={d.percentage} className={cn("h-2", danger && "[&>div]:bg-destructive")} />
                      <p className="text-[10px] text-muted-foreground mt-1">{d.attended} / {d.total} classes attended</p>
                      {danger && <p className="text-[10px] text-destructive mt-0.5">⚠ Below 75% minimum requirement</p>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Faculty Tab */}
        <TabsContent value="faculty">
          <div className="grid sm:grid-cols-2 gap-4">
            {courses.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {c.instructor_name.split(" ").pop()?.[0] || "?"}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{c.instructor_name}</h3>
                        <p className="text-[10px] text-muted-foreground">{c.code} — {c.name}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {c.instructor_office && (
                        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0" /><span>{c.instructor_office}</span></div>
                      )}
                      {c.instructor_office_hours && (
                        <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 shrink-0" /><span>{c.instructor_office_hours}</span></div>
                      )}
                      {c.instructor_email && (
                        <div className="flex items-center gap-2"><MailIcon className="w-3.5 h-3.5 shrink-0" /><span>{c.instructor_email}</span></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
