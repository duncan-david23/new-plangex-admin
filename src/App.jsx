import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import Login from './Pages/Login.jsx'
import Register from './Pages/Register.jsx'
import Dashboard from './components/DashboardSection.jsx'
import AuthWrapper from './components/AuthWrapper.jsx'
import AdminPanel from './Pages/AdminPanel.jsx'
import { AppContext } from './contexts/AppContext.jsx'


const App = () => {

  const location = useLocation()
  const isAuthPage = ['/login', '/register', '/', ].includes(location.pathname)

  if (isAuthPage) {
    return (
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/login' element={<Login />} />
        {/* <Route path='/register' element={<Register />} /> */}
      </Routes>
    )
  }

  return (
    <>
    <AppContext>
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Routes>
        <Route path="/admin-panel" element={
          <AuthWrapper>
            <AdminPanel />
          </AuthWrapper>
        } />
      </Routes>
    </div>
    </AppContext>
    </>
  )
}

export default App