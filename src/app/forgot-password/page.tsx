"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between items-center p-6">
      <div className="w-full max-w-md pt-8">
        <div className="text-sm font-bold font-mono tracking-wider text-foreground">
          HENU <span className="text-henu-400">MAIL</span>
        </div>
      </div>

      <Card className="w-full max-w-md my-8 space-y-6 shadow-2xl border-border-default">
        <div>
          <h2 className="text-lg font-bold font-mono tracking-tight text-foreground">
            CREDENTIAL RECOVERY
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Initiate cryptographic password reset link
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                If a workspace member with email <strong>{email}</strong> exists, a password reset link has been dispatched.
              </span>
            </div>
            <Link href="/login">
              <Button variant="secondary" size="sm" className="w-full font-mono text-xs gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>RETURN TO LOGIN</span>
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Corporate Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" className="w-full font-mono text-xs py-2.5">
              DISPATCH RECOVERY LINK
            </Button>
            <div className="text-center pt-2">
              <Link href="/login" className="text-xs font-mono text-slate-400 hover:text-foreground">
                Cancel & Return
              </Link>
            </div>
          </form>
        )}
      </Card>

      <div className="w-full max-w-md pb-6 text-center text-xs font-mono text-slate-500">
        &copy; {new Date().getFullYear()} HENU OS Private Limited.
      </div>
    </div>
  );
}
