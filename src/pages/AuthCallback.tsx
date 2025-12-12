import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // This page handles the email confirmation callback
    // Supabase will automatically process the auth tokens from URL hash
    // and trigger the onAuthStateChange event in AuthContext
    
    console.log("AuthCallback: Processing email confirmation...");
    
    // Give Supabase a moment to process the tokens
    const timer = setTimeout(() => {
      // Redirect to dashboard - AuthContext will handle the session
      navigate("/dashboard", { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg font-medium text-foreground">
        Confirming your email...
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Please wait a moment
      </p>
    </div>
  );
}
