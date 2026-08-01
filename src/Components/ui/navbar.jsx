import React, { useState, useEffect, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Wallet, Menu, X, LayoutGrid, Upload, Files, CreditCard, Receipt } from 'lucide-react'
// 1. Replaced SignedIn and SignedOut with Show
import { Show, UserButton, SignInButton, useUser, useAuth } from '@clerk/react'
import { cn } from '@/lib/utils'
import { Button } from '@/Components/ui/button'
import CreditsDisplay from '@/Components/CreditsDisplay'
import { UserCreditsContext } from '@/context/UserCreditsContext'

const navigationLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/my-files', label: 'My Files', icon: Files },
  { href: '/subscriptions', label: 'Subscription', icon: CreditCard },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
]

function ShareLogo({ className }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.7699 21.8258L7.42207 20.485C5 19.9996 5 20 6.6277 17.875L9.77497 13.9892C10.4003 13.2172 11.3407 12.7687 12.3342 12.7687L19.2668 13.0726M11.7699 21.8258C11.7699 21.8258 12.8773 24.5436 14.1667 25.833C15.4561 27.1223 18.1738 28.2296 18.1738 28.2296M18.1738 28.2296L19.0938 32.0266C19.5 34.5 19.5 34.5 21.6117 33.0063L25.7725 30.2146C26.684 29.603 27.2308 28.5775 27.2308 27.4798L26.927 20.733M26.927 20.733C31.5822 16.4657 34.5802 12.4926 34.9962 6.59335C35.1164 4.8888 35.1377 4.88137 33.4062 5.00345C27.507 5.41937 23.534 8.4174 19.2668 13.0726M11.7699 31.6146C11.7699 33.4841 10.2544 34.9996 8.38495 34.9996H5V31.6146C5 29.7453 6.5155 28.2298 8.38495 28.2298C10.2544 28.2298 11.7699 29.7453 11.7699 31.6146Z"
        fill="currentColor"
      />
      <path
        d="M12.5 22.9996L11 20.4996C11 20.0996 16 12.9996 20 12.9996C22.1667 14.8329 26.1172 16.4682 27 19.9996C27.5 21.9996 21.5 26.1663 18.5 28.4996L12.5 22.9996Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Navbar({ isVisible: propIsVisible }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [localIsVisible, setLocalIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const location = useLocation()
  const { isSignedIn } = useUser()
  const { credits } = useContext(UserCreditsContext)

  useEffect(() => {
    // Only track scroll locally if propIsVisible is not provided (e.g. on landing page)
    if (propIsVisible !== undefined) return

    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        // Only apply hide-on-scroll behavior on desktop screens (widths >= 1024px)
        if (window.innerWidth < 1024) {
          setLocalIsVisible(true)
          return
        }

        const currentScrollY = window.scrollY
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          setLocalIsVisible(false)
        } else {
          setLocalIsVisible(true)
        }
        setLastScrollY(currentScrollY)
      }
    }

    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setLocalIsVisible(true)
      }
    }

    window.addEventListener('scroll', controlNavbar, { passive: true })
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', controlNavbar)
      window.removeEventListener('resize', handleResize)
    }
  }, [lastScrollY, propIsVisible])

  const isVisible = propIsVisible !== undefined ? propIsVisible : localIsVisible

  return (
    <>
      <header 
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out",
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="w-full flex h-16 items-center justify-between px-4 md:px-6">
          
          {/* Left section: Hamburger (mobile only) + Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-md border bg-background hover:bg-accent hover:text-accent-foreground lg:hidden"
              aria-label="Toggle Menu"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link to={isSignedIn ? "/dashboard" : "/"} className="flex items-center gap-2">
              <ShareLogo className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Cloud Share
              </span>
            </Link>
          </div>

          {/* Right section: Wallet + User Profile */}
          <div className="flex items-center gap-4">
            {/* Wallet Icon */}
            <Link
              to="/subscriptions"
              className="flex h-10 items-center gap-2 px-3 rounded-md border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground text-sm font-medium select-none"
              title="Wallet & Subscriptions"
            >
              <Wallet className="h-5 w-5 text-slate-600" />
              <span className="hidden sm:inline">{credits} Credits</span>
            </Link>

            {/* Authentication Actions */}
            {/* 2. Replaced SignedIn with Show when="signed-in" */}
            <Show when="signed-in">
              <div className="flex items-center justify-center">
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-9 w-9 rounded-full border border-primary/20 shadow-sm"
                    }
                  }}
                />
              </div>
            </Show>

            {/* 3. Replaced SignedOut with Show when="signed-out" */}
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button size="sm" className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Sign In
                </Button>
              </SignInButton>
            </Show>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 lg:hidden animate-in fade-in-0 duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-white dark:bg-zinc-950 border-r p-6 shadow-xl flex flex-col gap-6 lg:hidden transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <ShareLogo className="h-7 w-7 text-blue-600 dark:text-blue-500" />
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Cloud Share
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md border bg-background hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar Menu items */}
        <div className="flex flex-col gap-1.5 grow">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Side menu bar
          </p>
          {navigationLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-5 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 select-none",
                  isActive 
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/15"
                    : "text-slate-800 hover:text-black hover:bg-slate-50"
                )}
              >
                <Icon className={cn("h-[24px] w-[24px] stroke-[2] transition-colors", isActive ? "text-white" : "text-slate-700")} />
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Credits Display */}
        <div className="px-2 mb-2">
          <CreditsDisplay />
        </div>

        {/* Sidebar Footer / User section for mobile */}
        <div className="border-t pt-4 flex flex-col gap-4">
          {/* 4. Replaced mobile SignedIn with Show when="signed-in" */}
          <Show when="signed-in">
            <div className="flex items-center gap-3 px-2">
              <UserButton afterSignOutUrl="/" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">My Account</span>
                <span className="text-xs text-muted-foreground">Manage profile</span>
              </div>
            </div>
          </Show>

          {/* 5. Replaced mobile SignedOut with Show when="signed-out" */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                Sign In
              </Button>
            </SignInButton>
          </Show>
        </div>
      </div>
    </>
  )
}