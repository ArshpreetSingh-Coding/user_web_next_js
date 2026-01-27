"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"

export default function ClientSessionHydrator({ session }: { session: any }) {
  const { setSession, isAuthenticated, fetchProfile } = useAuthStore()

  useEffect(() => {
    // Set global session
    if (session && session.session_id && session.session_identifier) {
      setSession(session.session_id, session.session_identifier)
    }

    // Validate user session if logged in
    if (isAuthenticated) {
      console.log("🔄 Validating user session on startup...")
      fetchProfile().catch((err) => {
        // console.error("❌ Session validation failed:", err)
        // Store handles logout on flag 101
      })
    }
  }, [session, setSession, isAuthenticated, fetchProfile])

  return null
}
