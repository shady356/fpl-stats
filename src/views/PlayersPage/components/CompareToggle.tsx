import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Icon from '@/components/ui/Icon/Icon'

type CompareToggleProps = {
  comparing: boolean
  onToggle: () => void
}

/**
 * Turns compare mode on or off: while on, the players table shows a checkbox on each row.
 */
function CompareToggle({ comparing, onToggle }: CompareToggleProps) {
  return (
    <BaseButton
      className={`players-compare-toggle ${comparing ? 'active' : ''}`}
      aria-pressed={comparing}
      title={comparing ? 'Stop comparing' : 'Pick players to compare'}
      onClick={onToggle}
    >
      <Icon icon="compare_arrows" />
      Compare
    </BaseButton>
  )
}

export default CompareToggle
