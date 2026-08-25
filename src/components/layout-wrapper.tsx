"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Truck, Users, LayoutDashboard, Moon, Sun, Menu } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const navItems = [
    { href: "/", label: "Beranda", icon: LayoutDashboard },
    { href: "/transactions", label: "Manifest Pengiriman", icon: Truck },
    { href: "/crews", label: "Data Supir & Kenek", icon: Users },
    { href: "/vehicles", label: "Data Kendaraan", icon: Truck },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } md:block w-64 border-r bg-card/50 backdrop-blur shrink-0 flex flex-col`}
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
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  pathname === item.href
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
        <div className="p-4 border-t">
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
    </div>
  )
}
