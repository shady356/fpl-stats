import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Icon from '@/components/ui/Icon/Icon'
import { useFavoritePlayers } from '@/hooks/useFavoritePlayers'

import './FavoriteButton.css'

type FavoriteButtonProps = {
  playerId: number
  /** Used in the button's accessible label. */
  playerName: string
}

/**
 * Heart that adds the player to, or removes them from, the wish list.
 */
export default function FavoriteButton({ playerId, playerName }: FavoriteButtonProps) {
  const { favoriteIds, toggleFavorite } = useFavoritePlayers()
  const isFavorite = favoriteIds.includes(playerId)

  return (
    <BaseButton
      className={`favorite-button ${isFavorite ? 'active' : ''}`}
      square
      ghost
      aria-pressed={isFavorite}
      aria-label={`${isFavorite ? 'Remove' : 'Add'} ${playerName} ${isFavorite ? 'from' : 'to'} wish list`}
      title={isFavorite ? 'Remove from wish list' : 'Add to wish list'}
      onClick={() => toggleFavorite(playerId)}
    >
      <Icon icon="favorite" filled={isFavorite} />
    </BaseButton>
  )
}
