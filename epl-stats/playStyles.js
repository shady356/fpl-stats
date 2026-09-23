// Derives a short "style of play" label per team by ranking them into
// tiers (top/mid/bottom third of the league) across a few proxy metrics:
// pressing intensity (PPDA), territorial control (deep completions) and
// attacking volume (shots per game).

const TIER_COUNT = 3

// Splits teams into TIER_COUNT roughly-equal groups ordered by `getValue`.
// `reverse: true` means higher values rank into tier 0 instead of lower ones.
function rankTiers(teams, getValue, { reverse = false } = {}) {
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

// Lower PPDA = fewer passes allowed before a defensive action = higher press.
const PRESS_LABELS = ['High press', 'Medium press', 'Low block']
// More deep completions = more sustained territorial/buildup presence.
const TEMPO_LABELS = ['Territorial', 'Balanced buildup', 'Counter-attacking']
// More shots per game = higher attacking volume.
const ATTACK_LABELS = ['High-volume attack', 'Balanced attack', 'Low-volume attack']

export function computePlayStyles(teams) {
  const pressTiers = rankTiers(teams, (t) => t.ppda_per_game)
  const tempoTiers = rankTiers(teams, (t) => t.deep_per_game, { reverse: true })
  const attackTiers = rankTiers(teams, (t) => t.shots / t.games_played, { reverse: true })

  teams.forEach((team) => {
    const press = PRESS_LABELS[pressTiers[team.team_id]]
    const tempo = TEMPO_LABELS[tempoTiers[team.team_id]]
    const attack = ATTACK_LABELS[attackTiers[team.team_id]]
    const shotsPerGame = (team.shots / team.games_played).toFixed(1)

    team.play_style = `${press}, ${tempo}`
    team.play_style_detail =
      `${press} (PPDA ${team.ppda_per_game.toFixed(2)}) · ` +
      `${tempo} (${team.deep_per_game.toFixed(1)} deep/game) · ` +
      `${attack} (${shotsPerGame} shots/game)`
  })

  return teams
}
