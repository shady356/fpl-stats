import './App.css'
import 'material-symbols/rounded.css'
import plLogoSVG from './assets/pl_logo.svg'
import Overview from './views/Overview/Overview.jsx'

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

function Header() {
  return (
    <header>
      <img className="pl-logo" src={plLogoSVG} alt="" />

      <nav>
        <ul>
          <li>
            <a href="/overview">Overview</a>
          </li>
          <li>
            <a href="#">Fixtures</a>
          </li>
        </ul>
      </nav>

      <div>
        <button>settings</button>
      </div>
    </header>
  )
}

export default App
