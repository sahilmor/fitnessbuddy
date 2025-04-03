"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dumbbell, Home, Users, Calendar, User } from "lucide-react"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Workouts", href: "/workouts", icon: Dumbbell },
  { name: "Community", href: "/community", icon: Users },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Profile", href: "/profile", icon: User },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-sm transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="sr-only md:not-sr-only">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 