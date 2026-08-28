"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Truck, Users, LayoutDashboard, Moon, Sun, Menu, LogOut, PackageMinus, Database } from "lucide-react"
import { useTheme } from "next-themes"
import { logout } from "@/app/actions/auth"

import { Button } from "@/components/ui/button"

export function LayoutWrapper({ 
  children,
  session
}: { 
  children: React.ReactNode
  session?: { role: string, name?: string | null } | null 
}) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  // If we are on the login page, don't show the sidebar
  if (pathname === "/login") {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }

  const allNavItems = [
    { href: "/", label: "Beranda", icon: LayoutDashboard, roles: ["ADMIN", "SUPER_USER"] },
    { href: "/transactions", label: "Manifest Pengiriman", icon: Truck, roles: ["USER", "ADMIN", "SUPER_USER"] },
    { href: "/retur", label: "Retur Pengiriman", icon: PackageMinus, roles: ["ADMIN", "SUPER_USER"] },
    { href: "/crews", label: "Data Supir & Kenek", icon: Users, roles: ["ADMIN", "SUPER_USER"] },
    { href: "/vehicles", label: "Data Kendaraan", icon: Truck, roles: ["ADMIN", "SUPER_USER"] },
    { href: "/users", label: "Manajemen Akun", icon: Users, roles: ["SUPER_USER"] },
    { href: "/database", label: "Manajemen Database", icon: Database, roles: ["SUPER_USER"] },
  ]

  const navItems = allNavItems.filter(item => {
    if (!session?.role) return false
    return item.roles.includes(session.role)
  })

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          isMobileMenuOpen ? "fixed inset-y-0 left-0 z-50 flex shadow-2xl" : "hidden"
        } md:flex md:static md:w-64 w-64 border-r bg-background shrink-0 flex-col`}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">KirimBeres</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {session && (
          <div className="px-6 py-4 border-b bg-muted/20">
            <p className="text-sm font-medium text-muted-foreground">Login sebagai:</p>
            <p className="font-semibold">{session.name || session.role}</p>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/")
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 rounded-xl"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-5 w-5" />
                <span>Mode Terang</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" />
                <span>Mode Gelap</span>
              </>
            )}
          </Button>
          
          <Button
            variant="destructive"
            className="w-full justify-start gap-3 rounded-xl"
            onClick={() => logout()}
          >
            <LogOut className="h-5 w-5" />
            <span>Keluar (Logout)</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 border-b bg-background/80 backdrop-blur flex items-center justify-between px-6 md:hidden sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">KirimBeres</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8 bg-muted/20">
          {children}
        </div>
      </main>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
