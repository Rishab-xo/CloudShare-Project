import CardNav from '@/Components/Landing/CardNav';
import { useUser } from '@clerk/clerk-react'
import React from 'react'

const DashboardLayout = ({children}) => {
  const {user} = useUser();

  return (
    <div>
      Navbar
      {user && (
        <div className="flex">
        
        <div className='max-[1080]:hidden'>
          side menu
        </div>
        <div className="grow mx-5">{children}</div>
      </div>
      )}
    </div>
  )
}

export default DashboardLayout