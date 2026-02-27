import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import MessMenu from "./pages/MessMenu";
import MailSummarizer from "./pages/MailSummarizer";
import Marketplace from "./pages/Marketplace";
import LostFound from "./pages/LostFound";
import Timetable from "./pages/Timetable";
import TravelSharing from "./pages/TravelSharing";
import NearbyHub from "./pages/NearbyHub";
import LMSLite from "./pages/LMSLite";
import Profile from "./pages/Profile";
import SOS from "./pages/SOS";
import Flashcards from "./pages/Flashcards";
import CampusView from "./pages/CampusView";
import Friends from "./pages/Friends";
import Hostel from "./pages/Hostel";
import EventCalendar from "./pages/EventCalendar";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import YellowAiChatbot from "@/components/YellowAiChatbot";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/mess-menu" element={<MessMenu />} />
                <Route path="/mail-summarizer" element={<MailSummarizer />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/lost-found" element={<LostFound />} />
                <Route path="/timetable" element={<Timetable />} />
                <Route path="/travel" element={<TravelSharing />} />
                <Route path="/nearby" element={<NearbyHub />} />
                <Route path="/lms" element={<LMSLite />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/sos" element={<SOS />} />
                <Route path="/flashcards" element={<Flashcards />} />
                <Route path="/campus-view" element={<CampusView />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/hostel" element={<Hostel />} />
                <Route path="/events" element={<EventCalendar />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <YellowAiChatbot />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
