import axios from 'axios';

export interface TrendsRow {
  keyword: string;
  country: string;
  date: string; // YYYY-MM-DD
  score: number;
}

export async function fetchGoogleTrendsDaily(keyword: string, country: string, startDate: string, endDate: string): Promise<TrendsRow[]> {
  if (process.env.MOCK === '1') {
    const today = new Date();
    const d = new Date(today.getTime() - 24 * 3600 * 1000);
    const iso = d.toISOString().slice(0, 10);
    return [{ keyword, country, date: iso, score: 62 }];
  }
  // Placeholder: replace with real trends API/library if available
  // For now, return a simple mocked shape to keep pipeline working
  void axios; // silence unused if not implemented
  const rows: TrendsRow[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let t = start.getTime(); t <= end.getTime(); t += 24 * 3600 * 1000) {
    rows.push({ keyword, country, date: new Date(t).toISOString().slice(0, 10), score: Math.floor(40 + Math.random() * 60) });
  }
  return rows;
}

export interface WeatherRow {
  date: string; // YYYY-MM-DD
  country: string;
  city: string;
  temp_avg_c?: number;
  rain_mm?: number;
  wind_kmh?: number;
}
