import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Receipt, Package, ShieldCheck, FileText, Stethoscope, Pill , Wallet as WalletIcon } , Sparkles } from "lucide-react";
import { useRole } from "./RoleProvider";

export default function Sidebar() {
  const { role } = useRole();

  const showTransactions = role === 'Clinic' || role === 'Pharmacy' || role === 'Owner';
  const showInventory = role === 'Pharmacy' || role === 'Owner';
  const showPassport = role === 'Pharmacy' || role === 'Owner' || role === 'Bank';

  const getBusinessName = (r: string) => {
    switch (r) {
      case 'Clinic': return 'Grace Medical Centre';
      case 'Pharmacy': return 'Wellcare Pharmacy';
      case 'Owner': return 'Wellcare Pharmacy Admin';
      case 'Bank': return 'Wema Bank';
      default: return 'Business';
    }
  };

  const businessName = getBusinessName(role);

  return (
    <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl leading-none">{businessName.charAt(0)}</span>
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground">{businessName}</span>
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

        {showTransactions && (
          <Link 
            to="/wallet" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
          >
            <WalletIcon className="w-5 h-5" />
            Wallet
          </Link>
        )}

        
        {showTransactions && (
          <Link 
            to="/transactions" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
          >
            <Receipt className="w-5 h-5" />
            Transactions
          </Link>
        )}

        {showInventory && (
          <Link 
            to="/inventory" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
          >
            <Package className="w-5 h-5" />
            Inventory
          </Link>
        )}

        
        {role === 'Clinic' && (
          <Link 
            to="/prescribe" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
          >
            <Stethoscope className="w-5 h-5" />
            New Prescription
          </Link>
        )}

        {(role === 'Pharmacy' || role === 'Owner') && (
          <Link 
            to="/dispense" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
          >
            <Pill className="w-5 h-5" />
            Verify & Dispense
          </Link>
        )}

        
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-3">
          Intelligence
        </div>
        <Link 
          to="/ai" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 font-medium transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
          activeProps={{ className: "bg-indigo-100 dark:bg-indigo-900/40" }}
        >
          <Sparkles className="w-5 h-5" />
          AI Hub
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

        {showPassport && (
          <Link 
            to="/passport" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
          >
            <FileText className="w-5 h-5" />
            Financial Passport
          </Link>
        )}
      </nav>
    </aside>
  );
}
