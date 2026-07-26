import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
// 1. Import Show instead of SignedIn/SignedOut
import { RedirectToSignIn, Show } from '@clerk/react' 
import Landing from './Pages/Landing'
import Dashboard from './Pages/Dashboard'
import MyFiles from './Pages/MyFiles'
import Upload from './Pages/Upload'
import Subscription from './Pages/Subscription'
import Transactions from './Pages/Transactions'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        
        {/* Protected Dashboard Route */}
        <Route path='/dashboard' element={
          <Show when="signed-in" fallback={<RedirectToSignIn />}>
            <Dashboard />
          </Show>
        } />
        
        {/* Protected MyFiles Route */}
        <Route path='/my-files' element={
          <Show when="signed-in" fallback={<RedirectToSignIn />}>
            <MyFiles />
          </Show>
        } />
        
        {/* Protected Upload Route */}
        <Route path='/upload' element={
          <Show when="signed-in" fallback={<RedirectToSignIn />}>
            <Upload />
          </Show>
        } />
        
        {/* Protected Subscriptions Route */}
        <Route path='/subscriptions' element={
          <Show when="signed-in" fallback={<RedirectToSignIn />}>
            <Subscription />
          </Show>
        } />
        
        {/* Protected Transactions Route */}
        <Route path='/transactions' element={
          <Show when="signed-in" fallback={<RedirectToSignIn />}>
            <Transactions />
          </Show>
        } />
        
        {/* Catch-all route for undefined paths */}
        <Route path='/*' element={<RedirectToSignIn />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App