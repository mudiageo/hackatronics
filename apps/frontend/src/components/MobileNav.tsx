import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LayoutDashboard, Receipt, Package, ShieldCheck, FileText, Stethoscope, Pill } from "Wallet as WalletIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useRole } from "./RoleProvider";

export function MobileNav() {
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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-6 text-left border-b border-border">
          <SheetTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl leading-none">{businessName.charAt(0)}</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">{businessName}</span>
          </SheetTitle>
        </SheetHeader>
        <div className="p-4 flex flex-col space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-3">
            Overview
          </div>
          
          <Link 
            to="/" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
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
              <Receipt className="w-5 h-5" /> Transactions
            </Link>
          )}
          
          {showInventory && (
            <Link 
              to="/inventory" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
              activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
            >
              <Package className="w-5 h-5" /> Inventory
            </Link>
          )}

          {role === 'Clinic' && (
            <Link 
              to="/prescribe" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
              activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
            >
              <Stethoscope className="w-5 h-5" /> New Prescription
            </Link>
          )}

          {(role === 'Pharmacy' || role === 'Owner') && (
            <Link 
              to="/dispense" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
              activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
            >
              <Pill className="w-5 h-5" /> Verify & Dispense
            </Link>
          )}

          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-3">
            Trust & Verification
          </div>
          <Link 
            to="/verified-activity" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
          >
            <ShieldCheck className="w-5 h-5" /> Verified Activity
          </Link>
          {showPassport && (
            <Link 
              to="/passport" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground font-medium transition-colors hover:bg-muted/50 hover:text-foreground"
              activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
            >
              <FileText className="w-5 h-5" /> Financial Passport
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
