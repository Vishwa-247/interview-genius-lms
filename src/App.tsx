
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CourseGenerator from "./pages/CourseGenerator";
import MockInterview from "./pages/MockInterview";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import CourseDetail from "./pages/CourseDetail";
import InterviewResult from "./pages/InterviewResult";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/course-generator" element={<Layout><CourseGenerator /></Layout>} />
          <Route path="/course/:id" element={<Layout><CourseDetail /></Layout>} />
          <Route path="/mock-interview" element={<Layout><MockInterview /></Layout>} />
          <Route path="/interview-result/:id" element={<Layout><InterviewResult /></Layout>} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
