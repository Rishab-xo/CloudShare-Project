import DashboardLayout from '@/Layout/DashboardLayout'
import React, { useEffect } from 'react'
import { useAuth } from '@clerk/react'

const Dashboard = () => {

  const{getToken} = useAuth();
  useEffect(()=>{
    const displayToken = async()=>{
      const token = await getToken();
      console.log(token);
      
    }
    displayToken();
  },[])

  return (
    <div>
      <DashboardLayout>
        <div>
          Dashboard Content
        </div>
      </DashboardLayout>
    </div>
  )
}

export default Dashboard