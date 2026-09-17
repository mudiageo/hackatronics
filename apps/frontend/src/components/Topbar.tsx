import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { MobileNav } from "./MobileNav";

export default function Topbar() {
  return (
    <header className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-border bg-card sticky top-0 z-40 gap-4">
      <MobileNav />
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-muted-foreground absolute left-3" />
          <input 
            type="text" 
            placeholder="Search records, transactions, products..." 
            className="w-full bg-muted border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <select className="bg-muted text-foreground text-sm font-medium border-0 rounded-full py-2 px-4 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
          <option>Role: Clinic</option>
          <option>Role: Pharmacy</option>
          <option>Role: Bank</option>
        </select>

        <ModeToggle />

        <Button variant="ghost" size="icon" className="rounded-full bg-muted text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
        </Button>

        <div className="w-10 h-10 rounded-full bg-accent/10 border-2 border-background shadow-sm overflow-hidden flex items-center justify-center text-accent font-bold">
          C
        </div>
      </div>
    </header>
  );
}
