export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getStartOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay(); // Sunday = 0
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function timeToMinutes(isoDateTime: string): number {
  const date = new Date(isoDateTime);
  return date.getHours() * 60 + date.getMinutes();
}

export function generateHourLabels() {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
    const period = i < 12 ? 'AM' : 'PM';
    hours.push({
      value: i,
      display: `${displayHour}:00 ${period}`
    });
  }
  return hours;
}
