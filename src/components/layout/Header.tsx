import { NavLink } from 'react-router'

import plLogoSVG from '@/assets/pl_logo.svg'

import BaseButton from '../ui/BaseButton/BaseButton'
import Icon from '../ui/Icon/Icon'

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
        <BaseButton aria-label="Settings" square>
          <Icon icon="settings" />
        </BaseButton>
      </div>
    </header>
  )
}

export default Header
