import { useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function iconFor(description = "") {
  const d = description.toLowerCase();
  if (d.includes("thunder")) return "⛈️";
  if (d.includes("rain")) return "🌧️";
  if (d.includes("drizzle")) return "🌦️";
  if (d.includes("snow")) return "❄️";
  if (d.includes("fog") || d.includes("mist")) return "🌫️";
  if (d.includes("cloud")) return "☁️";
  if (d.includes("clear")) return "☀️";
  return "🌤️";
}

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchWeather(cityName = city) {
    const name = cityName.trim();
    if (!name) return setError("Please enter a city name.");
    if (!API_URL) return setError("Weather API URL is not configured.");
    setLoading(true);
    setError("");
    setWeather(null);
    try {
      const response = await fetch(`${API_URL}/weather/${encodeURIComponent(name)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "City not found. Please try again.");
      setWeather(data);
      setCity(name);
    } catch (e) {
      setError(e.message || "Could not connect to the weather service.");
    } finally {
      setLoading(false);
    }
  }

  const temperature = weather?.temperature ?? weather?.current_temp ?? 0;
  const rainChance = Math.min(100, Math.max(0, Number(weather?.rain_probability ?? 0)));

  return (
    <div className="weather-app">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">☁</span> Weather AI</a>
        <span className="topbar-note">Weather forecast & ML prediction</span>
      </header>

      <main className="page">
        <section className="intro">
          <h1>Weather Forecast</h1>
          <p>Find current weather and AI-powered predictions for your city.</p>
        </section>

        <section className="search-panel">
          <div className="search-row">
            <input value={city} onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchWeather()}
              placeholder="Search city (e.g. Porbandar)" aria-label="City name" />
            <button onClick={() => searchWeather()} disabled={loading}>{loading ? "Loading..." : "Search"}</button>
          </div>
          <div className="city-shortcuts">
            <span>Try:</span>
            {["Porbandar", "Rajkot", "Ahmedabad", "Surat"].map((c) =>
              <button key={c} onClick={() => searchWeather(c)} disabled={loading}>{c}</button>
            )}
          </div>
        </section>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Getting weather data…</div>}

        {!weather && !loading && !error && (
          <section className="empty-state">
            <div className="empty-icon">🌤️</div>
            <h2>Check the weather in your city</h2>
            <p>Search above to see live conditions, rain prediction and hourly temperature forecast.</p>
          </section>
        )}

        {weather && !loading && (
          <div className="weather-results">
            <section className="current-card">
              <div className="current-heading">
                <div><h2>{weather.city}{weather.country ? `, ${weather.country}` : ""}</h2><p className="condition">{weather.description}</p></div>
                <div className="current-icon">{iconFor(weather.description)}</div>
              </div>
              <div className="temperature">{Math.round(temperature)}<span>°C</span></div>
              <p className="feels">Feels like {Math.round(weather.feels_like ?? weather.feel_like ?? temperature)}°C</p>
              <div className="range"><span>Min {Math.round(weather.min_temperature ?? weather.temp_min ?? 0)}°</span><span>Max {Math.round(weather.max_temperature ?? weather.temp_max ?? 0)}°</span></div>
            </section>

            <section className="metrics">
              <article className="metric"><span className="metric-icon">💧</span><span className="metric-label">Humidity</span><strong>{weather.humidity ?? 0}%</strong></article>
              <article className="metric"><span className="metric-icon">💨</span><span className="metric-label">Wind speed</span><strong>{weather.wind_speed ?? weather.Wind_Gust_Speed ?? 0} m/s</strong></article>
              <article className="metric"><span className="metric-icon">🌡️</span><span className="metric-label">Pressure</span><strong>{weather.pressure ?? 0} hPa</strong></article>
              <article className="metric"><span className="metric-icon">🧭</span><span className="metric-label">Wind direction</span><strong>{weather.wind_direction ?? "N/A"} {weather.wind_degree ?? weather.wind_gust_dir ?? ""}°</strong></article>
            </section>

            <section className="section-card">
              <div className="section-title"><div><h2>AI Rain Prediction</h2><p>Machine learning forecast</p></div><span className="tag">ML Prediction</span></div>
              <div className="rain-grid">
                <div className="rain-result"><span className="rain-icon">{weather.rain_prediction === "Yes" ? "🌧️" : "☀️"}</span><div><small>Expected rainfall</small><strong>{weather.rain_prediction === "Yes" ? "Rain expected" : "No rain expected"}</strong></div></div>
                <div className="rain-result probability"><div><small>Rain probability</small><strong>{rainChance}%</strong></div><div className="bar"><span style={{width: `${rainChance}%`}} /></div></div>
              </div>
            </section>

            <section className="section-card">
              <div className="section-title"><div><h2>Next 5 Hours</h2><p>Predicted temperature and humidity</p></div></div>
              <div className="forecast">
                {(weather.future_temperature || []).map((item, i) => (
                  <article className="forecast-item" key={i}>
                    <span className="forecast-time">{item.time}</span>
                    <span className="forecast-icon">{iconFor(weather.description)}</span>
                    <strong>{Math.round(item.temperature)}°C</strong>
                    {weather.future_humidity?.[i] && <small>💧 {weather.future_humidity[i].humidity}%</small>}
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="footer">Weather AI · Machine Learning Weather Forecast <span>Made by Bhavesh Radiya</span></footer>
    </div>
  );
}
