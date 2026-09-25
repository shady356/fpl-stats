import './App.css'
import 'material-symbols/rounded.css'

import Header from '@/components/layout/Header.tsx'
import Overview from '@/views/Overview/Overview.tsx'

function App() {
  return (
    <>
      <Header />
      <main className="main">
        <Overview />
      </main>
    </>
  )
}

export default App
