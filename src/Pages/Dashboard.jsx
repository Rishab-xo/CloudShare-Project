import DashboardLayout from '@/Layout/DashboardLayout'
import { UserButton } from '@clerk/clerk-react'
import React from 'react'

const Dashboard = () => {
  return (
    <div>
      <DashboardLayout>
        <div>
          <UserButton/>
        </div>
      </DashboardLayout>
    </div>
  )
}

export default Dashboard