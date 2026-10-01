import './Icon.css'

type IconProps = {
  icon: string
}

function Icon({ icon }: IconProps) {
  return <span className="material-symbols-rounded filled">{icon}</span>
}

export default Icon
