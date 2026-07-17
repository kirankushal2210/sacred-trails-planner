import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Smartphone } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState<"signin" | "signup" | "phone" | "otp">("signin");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Check your email for the confirmation link!");
        onOpenChange(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Successfully logged in!");
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "phone") {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
        toast.success("OTP sent to your phone!");
        setMode("otp");
      } else if (mode === "otp") {
        const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
        if (error) throw error;
        toast.success("Successfully logged in!");
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-display text-primary">
            {mode === "signin" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Phone Login"}
          </DialogTitle>
          <DialogDescription className="text-center">
            Log in to save your yatras and personalized itineraries.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mode === "signin" || mode === "signup" ? (
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePhoneAuth} className="space-y-3">
              <input
                type="tel"
                placeholder="Phone Number (e.g. +919876543210)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={mode === "otp"}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {mode === "otp" && (
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : mode === "phone" ? "Send OTP" : "Verify OTP"}
              </Button>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleGoogleAuth} type="button">
              Google
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setMode(mode === "phone" || mode === "otp" ? "signin" : "phone")} 
              type="button"
            >
              {mode === "phone" || mode === "otp" ? <Mail className="h-4 w-4 mr-2" /> : <Smartphone className="h-4 w-4 mr-2" />}
              {mode === "phone" || mode === "otp" ? "Email" : "Phone"}
            </Button>
          </div>
        </div>

        <div className="text-center text-sm">
          {mode === "signin" ? (
            <p>
              Don't have an account?{" "}
              <button className="text-primary hover:underline font-medium" onClick={() => setMode("signup")}>
                Sign up
              </button>
            </p>
          ) : mode === "signup" ? (
            <p>
              Already have an account?{" "}
              <button className="text-primary hover:underline font-medium" onClick={() => setMode("signin")}>
                Sign in
              </button>
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
