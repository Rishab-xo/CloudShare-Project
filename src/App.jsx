import React from 'react'
import { BrowserRouter, Route, Routes} from 'react-router-dom'
import { RedirectToSignIn, Show, SignIn, SignInButton, SignOutButton, SignUpButton, UserButton } from '@clerk/react'
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
          <Show when={"signed-in"}><Dashboard/></Show>
          <Show when={"signed-out"}><RedirectToSignIn/></Show>
          </>

        } />
        <Route path='/my-files' element={
           <>
          <Show when={"signed-in"}><MyFiles /></Show>
          <Show when={"signed-out"}><RedirectToSignIn/></Show>
          </>
          } />
        <Route path='/upload' element={
           <>
          <Show when={"signed-in"}><Upload /></Show>
          <Show when={"signed-out"}><RedirectToSignIn/></Show>
          </>
          } />
        <Route path='/subscriptions' element={
           <>
          <Show when={"signed-in"}><Subscription /></Show>
          <Show when={"signed-out"}><RedirectToSignIn/></Show>
          </>
          } />
        <Route path='/transactions' element={
           <>
          <Show when={"signed-in"}><Transactions /></Show>
          <Show when={"signed-out"}><RedirectToSignIn/></Show>
          </>
          } />
        <Route path='/*' element={<RedirectToSignIn />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App