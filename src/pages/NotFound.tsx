
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-discord-dark">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-discord-light mb-6">Oops! Page not found</p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-discord-primary hover:bg-discord-primary/90"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
