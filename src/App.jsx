import React from 'react'
import { BrowserRouter, Route, Routes} from 'react-router-dom'
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react'
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
        <Route path='/dashboard' element={
          <>
            <SignedIn><Dashboard /></SignedIn>
            <SignedOut><RedirectToSignIn /></SignedOut>
          </>

        } />
        <Route path='/my-files' element={
           <>
            <SignedIn><MyFiles /></SignedIn>
            <SignedOut><RedirectToSignIn /></SignedOut>
          </>
          } />
        <Route path='/upload' element={
           <>
            <SignedIn><Upload /></SignedIn>
            <SignedOut><RedirectToSignIn /></SignedOut>
          </>
          } />
        <Route path='/subscriptions' element={
           <>
            <SignedIn><Subscription /></SignedIn>
            <SignedOut><RedirectToSignIn /></SignedOut>
          </>
          } />
        <Route path='/transactions' element={
           <>
            <SignedIn><Transactions /></SignedIn>
            <SignedOut><RedirectToSignIn /></SignedOut>
          </>
          } />
        <Route path='/*' element={<RedirectToSignIn />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App