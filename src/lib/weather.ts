export interface WeatherCurrent {
  temperature: number;
  windspeed: number;
  weathercode: number;
  winddirection: number;
}

export interface WeatherDaily {
  date: string;
  tempMax: number;
  tempMin: number;
  weathercode: number;
  precipitationSum: number;
}

export interface WeatherResponse {
  current: WeatherCurrent;
  daily: WeatherDaily[];
}

export function normalizeWeatherResponse(raw: {
  current_weather?: {
    temperature: number;
    windspeed: number;
    weathercode: number;
    winddirection: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
    precipitation_sum: number[];
  };
}): WeatherResponse {
  const current: WeatherCurrent = {
    temperature: raw.current_weather?.temperature ?? 0,
    windspeed: raw.current_weather?.windspeed ?? 0,
    weathercode: raw.current_weather?.weathercode ?? 0,
    winddirection: raw.current_weather?.winddirection ?? 0,
  };

  const daily: WeatherDaily[] = (raw.daily?.time ?? []).map((date, i) => ({
    date,
    tempMax: raw.daily?.temperature_2m_max[i] ?? 0,
    tempMin: raw.daily?.temperature_2m_min[i] ?? 0,
    weathercode: raw.daily?.weathercode[i] ?? 0,
    precipitationSum: raw.daily?.precipitation_sum[i] ?? 0,
  }));

  return { current, daily };
}

export function getWeatherLabel(code: number): string {
  if (code === 0) return 'clear';
  if (code <= 3) return 'partlyCloudy';
  if (code <= 48) return 'foggy';
  if (code <= 57) return 'drizzle';
  if (code <= 67) return 'rainy';
  if (code <= 77) return 'snowy';
  if (code <= 82) return 'rainy';
  if (code <= 86) return 'snowy';
  if (code <= 99) return 'thunderstorm';
  return 'clear';
}
