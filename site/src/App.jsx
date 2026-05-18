import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import BadgeModal from './components/BadgeModal'
import Home from './pages/Home'
import Intro from './pages/Intro'
import Capture from './pages/Capture'
import Filters from './pages/Filters'
import Dissectors from './pages/Dissectors'
import Modbus from './pages/Modbus'
import Dnp3 from './pages/Dnp3'
import OpcUa from './pages/OpcUa'
import Security from './pages/Security'
import Advanced from './pages/Advanced'
import Lab from './pages/Lab'
import Flashcards from './pages/Flashcards'

export default function App() {
  return (
    <div className="flex min-h-screen font-sans">
      <BadgeModal />
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 lg:pt-0">
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/intro"         element={<Intro />} />
          <Route path="/capture"     element={<Capture />} />
          <Route path="/filters"     element={<Filters />} />
          <Route path="/dissectors"  element={<Dissectors />} />
          <Route path="/modbus"      element={<Modbus />} />
          <Route path="/dnp3"        element={<Dnp3 />} />
          <Route path="/opcua"       element={<OpcUa />} />
          <Route path="/security"    element={<Security />} />
          <Route path="/advanced"    element={<Advanced />} />
          <Route path="/lab"         element={<Lab />} />
          <Route path="/flashcards"  element={<Flashcards />} />
        </Routes>
      </main>
    </div>
  )
}
