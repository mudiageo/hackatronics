import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Receipt, Package, ShieldCheck, FileText } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl leading-none">F</span>
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground">Passport</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-3">
          Overview
        </div>
        
        <Link 
          to="/" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
          activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        
        <Link 
          to="/transactions" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
          activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
        >
          <Receipt className="w-5 h-5" />
          Transactions
        </Link>

        <Link 
          to="/inventory" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
          activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
        >
          <Package className="w-5 h-5" />
          Inventory
        </Link>

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-3">
          Trust & Verification
        </div>

        <Link 
          to="/verified-activity" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
          activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
        >
          <ShieldCheck className="w-5 h-5" />
          Verified Activity
        </Link>

        <Link 
          to="/passport" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
          activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
        >
          <FileText className="w-5 h-5" />
          Financial Passport
        </Link>
      </nav>
    </aside>
  );
}
