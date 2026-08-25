"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createSession, deleteSession } from "@/lib/session"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) {
    return { error: "Username atau password salah" }
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return { error: "Username atau password salah" }
  }

  await createSession({
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  })

  redirect("/")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
