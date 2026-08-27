import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "@/lib/session"

// 1. Specify protected and public routes
const adminRoutes = ["/", "/crews", "/vehicles"]
const userRoutes = ["/transactions", "/transactions/new", "/update-resi"]
const publicRoutes = ["/login", "/track"]

export async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(path)
  
  // 3. Decrypt the session from the cookie
  const cookie = req.cookies.get("session")?.value
  const session = await decrypt(cookie)

  // 4. Redirect to /login if the user is not authenticated
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // 5. Redirect to /transactions if the user is authenticated but not an admin trying to access admin routes
  if (session?.role === "USER" && adminRoutes.includes(path)) {
    return NextResponse.redirect(new URL("/transactions", req.nextUrl))
  }

  // 6. Redirect to / if the user is authenticated and trying to access /login
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}