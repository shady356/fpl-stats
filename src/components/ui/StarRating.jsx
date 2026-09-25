/**
 * @param {number} score - Rating from 0 (1 star) to 100 (5 stars)
 */
export default function StarRating({ score }) {
  const stars = new Array(5).fill(0)
  const value = score / 25 + 1
  const fullStars = Math.floor(value)
  const isHalfStar = value % 1 >= 0.5

  return (
    <div className="star-container">
      {stars.map((_, i) => (
        <span
          key={i}
          className={`material-symbols-rounded filled${i < fullStars || (isHalfStar && i === fullStars) ? ' colored' : ''}`}
        >
          {isHalfStar && i === fullStars ? 'star_half' : 'star'}
        </span>
      ))}
    </div>
  )
}
