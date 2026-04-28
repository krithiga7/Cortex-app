import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { authStore } from "@/store/auth";
import Login from "./pages/Login";
import VolunteerRegistration from "./pages/VolunteerRegistration";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import VolunteerAssignments from "./pages/VolunteerAssignments";
import VolunteerAnalytics from "./pages/VolunteerAnalytics";
import VolunteerUpload from "./pages/VolunteerUpload";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import Volunteers from "./pages/Volunteers";
import Assignments from "./pages/Assignments";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import DataIngestion from "./pages/DataIngestion";
import MatchingEngine from "./pages/MatchingEngine";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

// Protected Route Component - DISABLED FOR DEMO
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'volunteer' }) => {
  // Skip authentication check - allow all routes
  return <>{children}</>;
};

// Role-Based Redirect Component - AUTO LOGIN FOR DEMO
const RoleBasedDashboard = () => {
  // Skip authentication - go directly to dashboard
  return <Dashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleBasedDashboard />} />
          <Route path="/requests" element={
            <ProtectedRoute requiredRole="admin">
              <Requests />
            </ProtectedRoute>
          } />
          <Route path="/volunteers" element={
            <ProtectedRoute requiredRole="admin">
              <Volunteers />
            </ProtectedRoute>
          } />
          <Route path="/assignments" element={
            <ProtectedRoute>
              <Assignments />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute requiredRole="admin">
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute requiredRole="admin">
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/data-ingestion" element={
            <ProtectedRoute requiredRole="admin">
              <DataIngestion />
            </ProtectedRoute>
          } />
          <Route path="/matching-engine" element={
            <ProtectedRoute requiredRole="admin">
              <MatchingEngine />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
