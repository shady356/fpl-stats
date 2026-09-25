// Derives a short "style of play" label per team by ranking them into
// tiers (top/mid/bottom third of the league) across a few proxy metrics:
// pressing intensity (PPDA), territorial control (deep completions) and
// attacking volume (shots per game).

const TIER_COUNT = 3

// Splits teams into TIER_COUNT roughly-equal groups ordered by `getValue`.
// `reverse = true` means higher values rank into tier 0 instead of lower ones.
function rankTiers(teams, getValue, reverse = false) {
  const sorted = [...teams].sort((a, b) => {
    const diff = getValue(a) - getValue(b)
    return reverse ? -diff : diff
  })
  const tierSize = Math.ceil(sorted.length / TIER_COUNT)
  const tierByTeamId = {}
  sorted.forEach((team, index) => {
    tierByTeamId[team.team_id] = Math.min(Math.floor(index / tierSize), TIER_COUNT - 1)
  })
  return tierByTeamId
}

function getPressingRank(ppda) {
  switch (true) {
    case ppda < 10:
      return 'High'
    case ppda >= 10 && ppda <= 13:
      return 'Medium'
    case ppda > 13:
      return 'Low'
    default:
      return `Error (ppda: ${ppda})`
  }
}

// More deep completions = more sustained territorial/buildup presence.
const TEMPO_LABELS = ['Territorial', 'Balanced buildup', 'Counter-attacking']
// More shots per game = higher attacking volume.
const ATTACK_LABELS = ['High-volume attack', 'Balanced attack', 'Low-volume attack']

export function computePlayStyles(teams) {
  const tempoTiers = rankTiers(teams, (t) => t.deep_per_game, { reverse: true })
  const attackTiers = rankTiers(teams, (t) => t.shots / t.games_played, { reverse: true })

  teams.forEach((team) => {
    const tempo = TEMPO_LABELS[tempoTiers[team.team_id]]
    const attack = ATTACK_LABELS[attackTiers[team.team_id]]
    const shotsPerGame = (team.shots / team.games_played).toFixed(1)
    const pressing = getPressingRank(team.ppda_per_game)

    team.pressing = pressing
    team.play_style = `${tempo}`
    team.play_style_detail =
      `${tempo} (${team.deep_per_game.toFixed(1)} deep/game) · ` +
      `${attack} (${shotsPerGame} shots/game)`
  })

  return teams
}
