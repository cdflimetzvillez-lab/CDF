export const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août',
  'septembre','octobre','novembre','décembre'];
export const JOURS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

export function dateCourte(iso: string) {
  const d = new Date(iso + 'T12:00:00');
  return `${d.getDate()} ${MOIS[d.getMonth()]}`;
}
export function dateLongue(iso: string) {
  const d = new Date(iso + 'T12:00:00');
  return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
}
export function jourMois(iso: string) {
  const d = new Date(iso + 'T12:00:00');
  return { jour: JOURS[d.getDay()], date: `${d.getDate()} ${MOIS[d.getMonth()]}` };
}
export function horaires(debut: string | null, fin: string | null) {
  if (debut && fin) return `${debut} — ${fin}`;
  return debut || fin || '';
}
/** Blanc ou noir selon la luminance du fond, pour rester lisible. */
export function texteSur(hex: string) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#141014' : '#FFF8EC';
}

/** Formate une période : « 13 décembre », « 13 et 14 décembre », « du 12 au 14 décembre ». */
export function periode(debut: string, fin: string | null): string {
  if (!fin || fin === debut) return dateLongue(debut);

  const d = new Date(debut + 'T12:00:00');
  const f = new Date(fin + 'T12:00:00');
  const memeMois = d.getMonth() === f.getMonth();
  const consecutifs = (f.getTime() - d.getTime()) === 86400000;

  if (consecutifs && memeMois) {
    return `${JOURS[d.getDay()]} ${d.getDate()} et ${JOURS[f.getDay()].toLowerCase()} ${f.getDate()} ${MOIS[f.getMonth()]}`;
  }
  if (memeMois) {
    return `Du ${d.getDate()} au ${f.getDate()} ${MOIS[f.getMonth()]}`;
  }
  return `Du ${d.getDate()} ${MOIS[d.getMonth()]} au ${f.getDate()} ${MOIS[f.getMonth()]}`;
}
