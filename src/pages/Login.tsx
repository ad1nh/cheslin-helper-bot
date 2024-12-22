import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  // Get the current origin without any trailing slashes or colons
  const redirectTo = window.location.origin.replace(/\/$/, '');
  console.log("Redirect URL:", redirectTo);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to Cheslin</h2>
          <p className="mt-2 text-sm text-gray-600">Your AI-powered real estate assistant</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          redirectTo={redirectTo}
        />
      </div>
    </div>
  );
};

export default Login;