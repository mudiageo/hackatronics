import { Search, Bell, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { MobileNav } from "./MobileNav";
import { useRole } from "./RoleProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Topbar() {
  const { role, setRole } = useRole();

  return (
    <header className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-border bg-card sticky top-0 z-40 gap-2 md:gap-4">
      <MobileNav />
      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-muted-foreground absolute left-3" />
          <input 
            type="text" 
            placeholder="Search records, transactions, products..." 
            className="w-full bg-muted border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <select 
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="bg-muted text-foreground text-sm font-medium border-0 rounded-full py-1.5 px-3 md:py-2 md:px-4 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer max-w-[120px] md:max-w-none"
        >
          <option value="Clinic">Role: Clinic</option>
          <option value="Pharmacy">Role: Pharmacy</option>
          <option value="Owner">Role: Owner</option>
          <option value="Bank">Role: Bank</option>
        </select>

        <div className="hidden sm:block">
          <ModeToggle />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-muted text-muted-foreground hover:text-foreground relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>New transaction attested</DropdownMenuItem>
            <DropdownMenuItem>Low stock alert</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 rounded-full bg-accent/10 border-2 border-background shadow-sm overflow-hidden flex items-center justify-center text-accent font-bold hover:ring-2 hover:ring-primary/20 transition-all outline-none">
              {role.charAt(0)}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><User className="w-4 h-4 mr-2" /> Profile</DropdownMenuItem>
            <DropdownMenuItem><Settings className="w-4 h-4 mr-2" /> Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600"><LogOut className="w-4 h-4 mr-2" /> Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
