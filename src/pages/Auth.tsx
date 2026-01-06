import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, Sparkles, Eye, EyeOff, Sun, Moon } from "lucide-react";
import EmailConfirmation from "@/features/auth/EmailConfirmation";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().optional(),
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
}).refine((data) => {
  // Only validate if confirmPassword has a value
  if (data.confirmPassword && data.confirmPassword.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { setTheme, isDark } = useTheme();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Set page title for branding on auth page
  useEffect(() => {
    document.title = "Aura Notebook | Login";
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signUpSchema.parse({ email, password, confirmPassword, fullName: fullName || undefined });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        console.log('Attempting sign in for:', email);
        
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Sign in error:', error);
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else if (error.message.includes('Email not confirmed')) {
            toast({
              title: "Email not confirmed",
              description: "Please check your email and click the confirmation link.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          console.log('Sign in successful:', data.user?.email);
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
          // Navigation will be handled by AuthContext
        }
      } else {
        console.log('Attempting sign up for:', email);
        
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || undefined,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (error) {
          console.error('Sign up error:', error);
          if (error.message.includes('User already registered')) {
            toast({
              title: "Email already in use",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          console.log('Sign up successful:', data);
          
          // Check if user already exists (Supabase returns user with empty identities array)
          if (data.user && data.user.identities && data.user.identities.length === 0) {
            // Email already registered
            console.log('Email already exists:', data.user.email);
            toast({
              title: "Email already in use",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
            return;
          }
          
          // Check if email confirmation is required
          if (data.user && !data.session) {
            // Email confirmation required
            console.log('Email confirmation required for:', data.user.email);
            setPendingEmail(email);
            setShowEmailConfirmation(true);
          } else if (data.session) {
            // User is already logged in (email confirmation disabled)
            console.log('User signed up and logged in:', data.user?.email);
            toast({
              title: "Account created!",
              description: "Welcome! You're now signed in.",
            });
            // Navigation will be handled by AuthContext
          }
        }
      }
    } catch (err) {
      console.error('Auth form error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show email confirmation screen
  if (showEmailConfirmation) {
    return (
      <EmailConfirmation 
        email={pendingEmail} 
        onClose={() => {
          setShowEmailConfirmation(false);
          // Reset form
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setFullName("");
          setIsLogin(true);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md space-y-4"
      >
        

        <Card className="border-border/50 shadow-2xl">
          <div className="flex justify-end p-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          <CardHeader className="text-center space-y-2 select-none">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-2"
            >
              <img
                src="/icon.svg"
                alt="Aura Notebook"
                className="h-8 w-8"
              />
            </motion.div>
            <div className="text-sm font-semibold text-primary">Aura Notebook</div>
            <CardTitle className="text-2xl font-bold select-none">
              {isLogin ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription className="space-y-1 select-none">
              <div className="text-base font-medium text-foreground/80">
                Transform your learning with AI-powered study notebooks
              </div>
              <div className="text-sm text-muted-foreground">
                {isLogin
                  ? "Sign in to access your personalized study materials"
                  : "Create intelligent notes, generate summaries, and enhance your learning experience"}
              </div>
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="fullName" className="select-none">Full name</Label>
                  <div className="relative select-none">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="select-none">Email</Label>
                <div className="relative select-none">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="select-none">Password</Label>
                <div className="relative select-none">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative select-none">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-form-type="other"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10 pointer-events-auto"
                      tabIndex={-1}
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </motion.div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 select-none">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>{isLogin ? "Sign in" : "Create account"}</>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
