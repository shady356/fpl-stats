import './BaseButton.css'

type ButtonProps = {
  children: React.ReactNode
}

function BaseButton({ children }: ButtonProps) {
  return <button className="base-button">{children}</button>
}

export default BaseButton
