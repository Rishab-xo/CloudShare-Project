import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './Pages/Landing'
import Dashboard from './Pages/Dashboard'
import MyFiles from './Pages/MyFiles'
import Upload from './Pages/Upload'
import Subscription from './Pages/Subscription'
import Transactions from './Pages/Transactions'
import PublicFileView from './Pages/PublicFileView'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/my-files' element={<MyFiles />} />
        <Route path='/upload' element={<Upload />} />
        <Route path='/subscription' element={<Subscription />} />
        <Route path='/transactions' element={<Transactions />} />
        <Route path='/public-file/:id' element={<PublicFileView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App