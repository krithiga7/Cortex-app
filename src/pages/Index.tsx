// CORTEX - Community Resource Intelligence Engine
// Main landing page - redirects to dashboard

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to main app
    navigate('/', { replace: true });
  }, [navigate]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading CORTEX...</p>
      </div>
    </div>
  );
};

export default Index;
