"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    companyName: "",
    password: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between items-center p-6">
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
      </div>

      <Card className="w-full max-w-md my-8 space-y-6 shadow-2xl border-border-default">
        <div>
          <h2 className="text-lg font-bold font-mono tracking-tight text-foreground">
            PROVISION NEW WORKSPACE
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Initialize tenant isolation and workspace owner credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Input
            label="Organization / Company Name"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
          <Input
            label="Corporate Work Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full font-mono text-xs gap-2 py-2.5 mt-2"
            isLoading={isLoading}
          >
            <span>INITIALIZE WORKSPACE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Already registered?</span>
          <Link href="/login" className="text-henu-400 hover:underline">
            Sign In
          </Link>
        </div>
      </Card>

      <div className="w-full max-w-md pb-6 text-center text-xs font-mono text-slate-500">
        &copy; {new Date().getFullYear()} HENU OS Private Limited. All Rights Reserved.
      </div>
    </div>
  );
}
