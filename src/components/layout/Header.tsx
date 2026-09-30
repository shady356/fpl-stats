import { NavLink } from 'react-router'

import plLogoSVG from '@/assets/pl_logo.svg'

function Header() {
  return (
    <header>
      <img className="pl-logo" src={plLogoSVG} alt="" />

      <nav>
        <ul>
          <li>
            <NavLink to="/overview">Overview</NavLink>
          </li>
          <li>
            <NavLink to="/fixtures">Fixtures</NavLink>
          </li>
        </ul>
      </nav>

      <div>
        <button>settings</button>
      </div>
    </header>
  )
}

export default Header
