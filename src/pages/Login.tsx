import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Instagram, Twitter, Linkedin, Mail, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      return;
    }

    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-primary mb-2">Cheslin</h1>
          <p className="text-muted-foreground">Your AI-powered real estate assistant</p>
        </div>

        <Card className="w-full max-w-md p-6 shadow-md bg-white">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold">Log in</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-primary"
                >
                  Forgot?
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#6366f1] hover:bg-[#5558e7]">
              Log in
            </Button>

            <div className="flex items-center">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-muted-foreground">
                Remember me
              </label>
            </div>
          </form>
        </Card>
      </div>

      <footer className="py-6 px-8 border-t">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              English (US)
            </Button>
            <div className="h-4 w-px bg-border" />
            <Button variant="link" size="sm" asChild>
              <a href="/terms">Terms of Service</a>
            </Button>
            <Button variant="link" size="sm" asChild>
              <a href="/privacy">Privacy Policy</a>
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <a href="https://instagram.com" className="text-muted-foreground hover:text-primary">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://twitter.com" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" className="text-muted-foreground hover:text-primary">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>

          <div className="text-sm text-muted-foreground">
            Cheslin is a real estate agent's best friend.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;