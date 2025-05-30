"use client";

import type { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBox,
  faUsers,
  faBars,
  faShoppingCart,
  faSignOut,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { faListUl } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getBrandLogo } from "@/lib/utils";
import Image from "next/image";
const AdminSidebar: FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      toast.success("Sesión cerrada exitosamente");
      router.push("/auth");
    } catch (error) {
      toast.error("Error al cerrar sesión");
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const navigationItems = [
    { href: "/admin", icon: faHome, label: "Dashboard" },
    { href: "/admin/products", icon: faBox, label: "Productos" },
    { href: "/admin/categories", icon: faListUl, label: "Categorías" },
    { href: "/admin/orders", icon: faShoppingCart, label: "Órdenes" },
    { href: "/admin/users", icon: faUsers, label: "Usuarios" },
  ];

  return (
    <aside
      className={cn(
        "bg-primary text-primary-foreground min-h-screen p-4 transition-all duration-300 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between mb-8">
        {!isCollapsed && (
          <Image
            src={getBrandLogo(theme === "dark" ? "azul-marino" : "blanco")}
            alt="Astro"
            width={120}
            height={40}
            className="object-contain"
            priority
          />
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:bg-primary-foreground/10"
          >
            <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Nombre del administrador */}
      {!isCollapsed && (
        <div className="mb-6 text-sm text-primary-foreground/80">
          Administrador: {user?.user_metadata?.full_name || "Admin"}
        </div>
      )}

      <nav className="flex-1 space-y-2">
        {navigationItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 hover:bg-primary-foreground/10",
                pathname === item.href && "bg-primary-foreground/20",
                isCollapsed && "justify-center"
              )}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className={cn("h-5 w-5", isCollapsed && "mr-0")}
              />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Footer con Switch de tema y botón de logout */}
      <div
        className={cn(
          "mt-auto pt-4 border-t border-primary-foreground/20",
          isCollapsed ? "items-center" : "space-y-4"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed && <span className="text-sm">Tema Oscuro</span>}
          <Switch
            checked={theme === "dark"}
            onCheckedChange={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
          />
        </div>

        <Button
          variant="ghost"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={cn(
            "w-full hover:bg-primary-foreground/10",
            isCollapsed && "justify-center"
          )}
        >
          <FontAwesomeIcon
            icon={faSignOut}
            className={cn(
              "h-5 w-5",
              !isCollapsed && "mr-2",
              isSigningOut && "animate-spin"
            )}
          />
          {!isCollapsed && (
            <span>{isSigningOut ? "Cerrando sesión..." : "Cerrar Sesión"}</span>
          )}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
