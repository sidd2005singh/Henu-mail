"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";
import { loginSchema } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("admin@henuos.com");
  const [password, setPassword] = React.useState("••••••••••••");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const validation = loginSchema.safeParse({ email, password: "validPassword123" });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between items-center p-6 selection:bg-henu-500/30 selection:text-white">
      {/* Header */}
      <div className="w-full max-w-md pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-surface-200/50 border border-border-default flex items-center justify-center p-1 overflow-hidden">
            <img src="/logo.png" alt="HENU Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-sm font-bold font-mono tracking-wider text-foreground">
              HENU <span className="text-henu-400">MAIL</span>
            </div>
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
              HENU OS PVT LTD
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3" />
          <span>AUTH v1</span>
        </div>
      </div>

      {/* Main Login Card */}
      <Card className="w-full max-w-md my-8 space-y-6 shadow-2xl border-border-default">
        <div>
          <h2 className="text-lg font-bold font-mono tracking-tight text-foreground">
            DISPATCH CONSOLE ACCESS
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Authenticate using your HENU OS workspace credentials
          </p>
        </div>

        {error && (
          <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Corporate Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-300 tracking-wide uppercase font-mono">
                Security Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-mono text-henu-400 hover:text-henu-300 transition-colors"
              >
                Reset Password
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full font-mono text-xs gap-2 py-2.5 mt-2"
            isLoading={isLoading}
          >
            <span>AUTHENTICATE & ENTER WORKSPACE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs font-mono text-slate-400">
          <span>New organization?</span>
          <Link href="/register" className="text-henu-400 hover:underline">
            Register Workspace
          </Link>
        </div>
      </Card>

      {/* Footer */}
      <div className="w-full max-w-md pb-6 text-center text-xs font-mono text-slate-500">
        &copy; {new Date().getFullYear()} HENU OS Private Limited. All Rights Reserved.
      </div>
    </div>
  );
}
