import Navbar from '@/Components/ui/navbar';
import { useUser } from '@clerk/clerk-react'
import React from 'react'

const DashboardLayout = ({children}) => {
  const {user} = useUser();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {user && (
        <div className="flex">
          <div className='max-[1080]:hidden border-r h-[calc(100vh-4rem)] sticky top-16 w-64 bg-background p-4'>
            {/* Desktop side menu content */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Side Menu Bar</p>
            <div className="flex flex-col gap-2">
              <a href="/dashboard" className="px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">Dashboard</a>
              <a href="/my-files" className="px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">My Files</a>
              <a href="/upload" className="px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">Upload File</a>
              <a href="/subscriptions" className="px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">Subscriptions</a>
              <a href="/transactions" className="px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">Transactions</a>
            </div>
          </div>
          <div className="grow p-6">{children}</div>
        </div>
      )}
    </div>
  )
}

export default DashboardLayout