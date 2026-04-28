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

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'volunteer' }) => {
  const [authState, setAuthState] = useState(authStore.getState());
  
  useEffect(() => {
    const unsubscribe = authStore.subscribe((newState) => {
      setAuthState(newState);
    });
    return () => {
      unsubscribe();
    };
  }, []);
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && authState.user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Role-Based Redirect Component
const RoleBasedDashboard = () => {
  const [authState, setAuthState] = useState(authStore.getState());
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const unsubscribe = authStore.subscribe((newState) => {
      console.log('Auth state changed:', newState);
      setAuthState(newState);
      setIsChecking(false);
    });
    
    // Small delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);
    
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);
  
  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show loading or redirect if not authenticated
  if (!authState.isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Redirect volunteer to their dashboard
  if (authState.user?.role === 'volunteer') {
    console.log('Volunteer detected, redirecting to volunteer-dashboard', authState.user);
    return <Navigate to="/volunteer-dashboard" replace />;
  }
  
  // Admin gets the full admin dashboard
  console.log('Admin detected, showing admin dashboard', authState.user);
  return <Dashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/volunteer-registration" element={
            <ProtectedRoute requiredRole="volunteer">
              <VolunteerRegistration />
            </ProtectedRoute>
          } />
          <Route path="/volunteer-dashboard" element={
            <ProtectedRoute requiredRole="volunteer">
              <VolunteerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/volunteer-assignments" element={
            <ProtectedRoute requiredRole="volunteer">
              <VolunteerAssignments />
            </ProtectedRoute>
          } />
          <Route path="/volunteer-analytics" element={
            <ProtectedRoute requiredRole="volunteer">
              <VolunteerAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/volunteer-upload" element={
            <ProtectedRoute requiredRole="volunteer">
              <VolunteerUpload />
            </ProtectedRoute>
          } />
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
