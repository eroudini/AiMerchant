import axios from 'axios';
import { WeatherRow } from './googleTrendsConnector.js';

export async function fetchWeatherDaily(country: string, city: string, startDate: string, endDate: string): Promise<WeatherRow[]> {
  if (process.env.MOCK === '1') {
    const today = new Date();
    const d = new Date(today.getTime() - 24 * 3600 * 1000);
    const iso = d.toISOString().slice(0, 10);
    return [{ date: iso, country, city, temp_avg_c: 17.5, rain_mm: 2.1, wind_kmh: 9.2 }];
  }
  // Placeholder: call a public weather API; here we just synthesize rows
  void axios; // silence unused if not implemented
  const rows: WeatherRow[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let t = start.getTime(); t <= end.getTime(); t += 24 * 3600 * 1000) {
    const dd = new Date(t).toISOString().slice(0, 10);
    rows.push({
      date: dd,
      country,
      city,
      temp_avg_c: 10 + Math.random() * 15,
      rain_mm: Math.random() < 0.3 ? Math.random() * 10 : 0,
      wind_kmh: 5 + Math.random() * 20,
    });
  }
  return rows;
}
