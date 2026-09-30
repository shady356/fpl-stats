import './App.css'
import 'material-symbols/rounded.css'

import Header from '@/components/layout/Header.tsx'
import Fixtures from '@/views/Fixtures/Fixtures.tsx'

function App() {
  return (
    <>
      <Header />
      <main className="main">
        <Fixtures />
      </main>
    </>
  )
}

export default App
