import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h1 className="text-lg font-bold font-mono tracking-tight text-foreground uppercase mb-2">
        403 &bull; INSUFFICIENT ROLE PRIVILEGES
      </h1>
      <p className="text-xs text-slate-400 max-w-md font-mono mb-6 leading-relaxed">
        Your current workspace role does not possess the requisite RBAC permissions to access this administrative endpoint. Contact your workspace Owner or Super Admin for role elevation.
      </p>
      <Link href="/dashboard">
        <Button variant="secondary" size="sm" className="font-mono text-xs gap-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO DASHBOARD</span>
        </Button>
      </Link>
    </div>
  );
}
