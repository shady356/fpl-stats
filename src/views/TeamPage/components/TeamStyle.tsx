import Icon from '@/components/ui/Icon/Icon'
import type { Team } from '@/types/team'
import { ordinal } from '@/utils/ordinal'

import './TeamStyle.css'

type StyleMeter = {
  label: string
  icon: string
  /** Higher means more of this trait. */
  value: (team: Team) => number
  /** The stat behind the meter, for the tooltip. */
  detail: (team: Team) => string
  /** One-word summary; defaults to High/Medium/Low by league third. */
  summary?: (team: Team) => string
}

const STYLE_METERS: StyleMeter[] = [
  {
    label: 'Pressing',
    icon: 'bolt',
    // Fewer passes allowed per defensive action means a harder press.
    value: (team) => -team.ppda_per_game,
    detail: (team) => `${team.ppda_per_game.toFixed(1)} PPDA`,
    summary: (team) => team.pressing,
  },
  {
    label: 'Build-up',
    icon: 'flag',
    value: (team) => team.deep_per_game,
    detail: (team) => `${team.deep_per_game.toFixed(1)} deep completions per game`,
    summary: (team) => team.play_style,
  },
  {
    label: 'Attack',
    icon: 'sports_soccer',
    value: (team) => team.shots / team.games_played,
    detail: (team) => `${(team.shots / team.games_played).toFixed(1)} shots per game`,
  },
]

const TIER_LABELS = ['High', 'Medium', 'Low']

/**
 * How the team plays, as meters showing where it ranks in the league.
 */
export default function TeamStyle({ team, teams }: { team: Team; teams: Team[] }) {
  return (
    <section className="card team-style">
      <div className="card-header">
        <h2>Style</h2>
      </div>

      <ul className="team-style-meters">
        {STYLE_METERS.map((meter) => {
          const rank = teams.filter((other) => meter.value(other) > meter.value(team)).length + 1
          const tier = Math.min(Math.floor(((rank - 1) * 3) / teams.length), 2)
          // 1st fills the bar, last leaves a sliver.
          const fill = (teams.length - rank + 1) / teams.length

          return (
            <li
              key={meter.label}
              className="team-style-meter"
              title={`${meter.detail(team)} · ${ordinal(rank)} in the league`}
            >
              <span className="team-style-icon">
                <Icon icon={meter.icon} />
              </span>
              <div className="team-style-body">
                <div className="team-style-labels">
                  <span className="team-style-label">{meter.label}</span>
                  <span className="team-style-summary">
                    {meter.summary?.(team) ?? TIER_LABELS[tier]}
                  </span>
                </div>
                <div className="team-style-bar">
                  <div className="team-style-fill" style={{ width: `${fill * 100}%` }} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
