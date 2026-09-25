import './App.css'
import 'material-symbols/rounded.css'
import Header from '@/components/layout/Header.jsx'
import Overview from '@/views/Overview/Overview.jsx'

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
