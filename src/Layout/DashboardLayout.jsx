import Navbar from '@/Components/ui/navbar';
import { useUser } from '@clerk/react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Upload, Files, CreditCard, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import CreditsDisplay from '@/Components/CreditsDisplay';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/my-files', label: 'My Files', icon: Files },
  { href: '/subscriptions', label: 'Subscription', icon: CreditCard },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
];

const DashboardLayout = ({ children }) => {
  const { user } = useUser();
  const location = useLocation();
  const [isNavbarVisible, setIsNavbarVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      // Only apply hide-on-scroll behavior on desktop screens (widths >= 1024px)
      if (window.innerWidth < 1024) {
        setIsNavbarVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;
      
      // Hide navbar when scrolling down past 80px, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsNavbarVisible(false);
      } else {
        setIsNavbarVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsNavbarVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [lastScrollY]);

  // Robustly check if the user is using the default Clerk profile image (checking hasImage flag and base64 encoded "type=default" URL prefix)
  const isDefaultAvatar = !user || user.hasImage === false || user.imageUrl.includes('default') || user.imageUrl.includes('eyJ0eXBlIjoiZGVmYXVsdCIs');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar isVisible={isNavbarVisible} />
      {user && (
        <div className="flex flex-1">
          {/* Sidebar - Desktop */}
          <aside 
            className={cn(
              "hidden lg:flex flex-col w-64 border-r border-slate-100 bg-white flex-shrink-0 pb-4 px-4 select-none transition-all duration-300 ease-in-out sticky",
              isNavbarVisible 
                ? "h-[calc(100vh-4rem)] top-16 pt-4" 
                : "h-screen top-0 pt-6"
            )}
          >
            {/* User Profile Section */}
            <div className="flex flex-col items-center mb-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center shadow-md overflow-hidden border border-white mb-2">
                {isDefaultAvatar ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white opacity-95 translate-y-1">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <img src={user.imageUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
                )}
              </div>
              <span className="text-base font-medium text-slate-800 tracking-wide">
                {user.fullName || 'Bushan SC'}
              </span>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-1.5 px-1 mt-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium select-none",
                      isActive
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/15 font-medium"
                        : "text-slate-700 hover:text-black hover:bg-slate-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 stroke-[2] transition-colors",
                        isActive ? "text-white" : "text-slate-600 group-hover:text-black"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Credits Display */}
            <div className="mt-auto px-1">
              <CreditsDisplay />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6 md:p-8 bg-slate-50/20 min-w-0">
            {children}
          </main>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;