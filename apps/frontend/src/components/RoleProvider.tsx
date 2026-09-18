import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type Role = "Clinic" | "Pharmacy" | "Owner" | "Bank";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('active_role');
      if (saved) return saved as Role;
    }
    return "Clinic";
  });

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_role', newRole);
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
