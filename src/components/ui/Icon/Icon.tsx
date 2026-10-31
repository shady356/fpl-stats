import './Icon.css'

type IconProps = {
  icon: string
  /** Filled or outlined; filled by default. */
  filled?: boolean
}

function Icon({ icon, filled = true }: IconProps) {
  return <span className={`material-symbols-rounded ${filled ? 'filled' : ''}`}>{icon}</span>
}

export default Icon
