import Icon from '@/components/ui/Icon/Icon'

type BookingCardProps = {
  color: 'yellow' | 'red'
}

/**
 * A yellow or red card, drawn as a coloured upright rectangle.
 */
export default function BookingCard({ color }: BookingCardProps) {
  return (
    <span
      className={`booking-card ${color}`}
      title={`${color === 'yellow' ? 'Yellow' : 'Red'} card`}
    >
      <Icon icon="rectangle" />
    </span>
  )
}
