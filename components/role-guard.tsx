'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function RoleGuard({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles: string[] 
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
          return
        }

        const user = JSON.parse(userStr)
        const userRole = (user.role || 'user').toLowerCase() // Default to 'user' if not specified

        // check if userRole is in allowedRoles (where allowedRoles are lowercased like 'admin', 'delivery_boy', 'delivery')
        if (!allowedRoles.includes(userRole) && !allowedRoles.includes(user.role)) {
          // Redirect to appropriate dashboard if unauthorized
          if (userRole === 'admin') {
            router.push('/admin')
          } else if (userRole === 'delivery' || userRole === 'delivery_boy') {
            router.push('/delivery')
          } else {
            router.push('/')
          }
          return
        }

        setAuthorized(true)
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router, pathname, allowedRoles])

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return <>{children}</>
}
