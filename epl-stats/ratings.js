// Ports the 1-5 team rating system from an earlier Vue project.
// Each team gets three sub-ratings (points, attack, defense), blending
// actual + expected stats, plus a total rating re-normalized across teams.

export function round(value, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

// Rescale `score` from [scoreMin, scoreMax] onto a 1-5 scale.
// `reverse` flips the scale for stats where lower is better (e.g. goals against).
export function calcRating(scoreMax, scoreMin, score, reverse = false) {
  const min = 1;
  const max = 5;
  const newRange = max - min;
  const currentRange = scoreMax - scoreMin;
  let rating = round(((score - scoreMin) / currentRange) * newRange + min, 2);
  if (reverse) {
    rating = round((max + min) - rating, 2);
  }
  return rating;
}

export function calcExtremum(teams) {
  const extremum = {};
  extremum.ptsMax = Math.max(...teams.map(t => t.points));
  extremum.ptsMin = Math.min(...teams.map(t => t.points));
  extremum.xPtsMax = Math.max(...teams.map(t => t.expected_points));
  extremum.xPtsMin = Math.min(...teams.map(t => t.expected_points));
  extremum.gMax = Math.max(...teams.map(t => t.goals));
  extremum.gMin = Math.min(...teams.map(t => t.goals));
  extremum.xGMax = Math.max(...teams.map(t => t.xg));
  extremum.xGMin = Math.min(...teams.map(t => t.xg));
  extremum.gAMax = Math.max(...teams.map(t => t.ga));
  extremum.gAMin = Math.min(...teams.map(t => t.ga));
  extremum.xGaMax = Math.max(...teams.map(t => t.xga));
  extremum.xGaMin = Math.min(...teams.map(t => t.xga));
  return extremum;
}

// points/attack/defense each blend actual + expected into one 1-5 rating.
export function calcTeamRating(team, extremum) {
  const points = calcRating(
    round(extremum.ptsMax + extremum.xPtsMax, 2),
    round(extremum.ptsMin + extremum.xPtsMin, 2),
    round(team.points + team.expected_points, 2)
  );
  const attack = calcRating(
    round(extremum.gMax + extremum.xGMax, 2),
    round(extremum.gMin + extremum.xGMin, 2),
    round(team.goals + team.xg, 2)
  );
  const defense = calcRating(
    round(extremum.gAMax + extremum.xGaMax, 2),
    round(extremum.gAMin + extremum.xGaMin, 2),
    round(team.ga + team.xga, 2),
    true
  );

  return {
    points,
    attack,
    defense,
    totalCrude: round((points + attack + defense) / 3, 2),
  };
}

// Custom rounding for the final integer rating: floor unless the
// decimal part is >= 0.5, in which case round up.
export function reviseTotalRating(rating) {
  const decimal = rating - Math.floor(rating);
  return decimal >= 0.5 ? Math.floor(rating + 1) : Math.floor(rating);
}

// Color scale from green (best, rating 1) to red (worst, rating 5).
export const RATING_COLORS = {
  1: 'rgb(0, 78, 47)',
  2: 'rgb(0, 150, 73)',
  3: 'rgb(108, 108, 108)',
  4: 'rgb(233, 44, 91)',
  5: 'rgb(128, 7, 45)',
};

// Mutates and returns `teams`, adding flat rating_* fields to each team.
export function computeRatings(teams) {
  const extremum = calcExtremum(teams);
  const crudeRatings = teams.map(team => calcTeamRating(team, extremum));

  // Re-normalize totalCrude against its own min/max so the best/worst
  // team's total rating actually spans the 1-5 scale.
  const totalMax = Math.max(...crudeRatings.map(r => r.totalCrude));
  const totalMin = Math.min(...crudeRatings.map(r => r.totalCrude));

  teams.forEach((team, index) => {
    const { points, attack, defense, totalCrude } = crudeRatings[index];
    const total = round(calcRating(totalMax, totalMin, totalCrude), 2);

    team.rating_points = points;
    team.rating_points_rounded = reviseTotalRating(points);
    team.rating_attack = attack;
    team.rating_attack_rounded = reviseTotalRating(attack);
    team.rating_defense = defense;
    team.rating_defense_rounded = reviseTotalRating(defense);
    team.rating_total = total;
    team.rating_total_rounded = reviseTotalRating(total);
    team.rating_color = RATING_COLORS[team.rating_total_rounded];
  });

  return teams;
}
