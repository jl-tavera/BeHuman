"use client";

import { User, MessageSquare, ClipboardList, Lightbulb, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BehumanLogo from "@/components/BehumanLogo";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className = "", isOpen = false, onClose }: SidebarProps) {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    onClose?.();
  };

  const menuItems = [
    {
      icon: User,
      label: "Perfil",
      href: "/profile",
    },
    {
      icon: MessageSquare,
      label: "Chat",
      href: "/chat",
    },
    {
      icon: ClipboardList,
      label: "Quiz",
      href: "/quiz",
    },
    {
      icon: Lightbulb,
      label: "Recomendaciones",
      href: "/recommendations",
    },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex h-screen w-64 flex-col border-r bg-[hsl(var(--sidebar-background))]",
          "fixed left-0 top-0 z-50 lg:sticky",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
        style={{ borderColor: "hsl(var(--sidebar-border))" }}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between gap-3 p-6">
          <div className="flex items-center gap-3">
            <BehumanLogo size={40} />
            <h1 className="text-xl font-bold text-[hsl(var(--sidebar-foreground))]">
              behuman
            </h1>
          </div>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-[hsl(var(--sidebar-foreground))]"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

      <Separator />

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              variant="ghost"
              className="w-full justify-start gap-3 text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
              onClick={() => handleNavClick(item.href)}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <Separator className="mb-4" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
      </aside>
    </>
  );
}
