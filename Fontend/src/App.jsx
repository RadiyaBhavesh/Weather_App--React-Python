import { useState } from "react";
import "./App.css";

// Read the backend address from the environment file.
// This keeps the API URL out of the React code.
const API_URL = import.meta.env.VITE_API_URL;

// Choose an emoji based on the weather description.
function iconFor(description = "") {
  const d = description.toLowerCase();

  if (d.includes("thunder")) return "⛈️";
  if (d.includes("rain")) return "🌧️";
  if (d.includes("drizzle")) return "🌦️";
  if (d.includes("snow")) return "❄️";
  if (d.includes("fog") || d.includes("mist")) return "🌫️";
  if (d.includes("cloud")) return "☁️";
  if (d.includes("clear")) return "☀️";

  // Use a partly-cloudy icon if the description is unknown.
  return "🌤️";
}

export default function App() {
  // Store the search text, API result, and UI status.
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get weather data from the backend for the selected city.
  async function searchWeather(cityName = city) {
    const name = cityName.trim();

    // Validate the input before sending a request.
    if (!name) return setError("Please enter a city name.");
    if (!API_URL) return setError("Weather API URL is not configured.");

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // Encode the city name so spaces and special characters are safe in the URL.
      const response = await fetch(`${API_URL}/weather/${encodeURIComponent(name)}`);
      const data = await response.json();

      // Show a readable error if the backend does not return a successful response.
      if (!response.ok) {
        throw new Error(data.detail || "City not found. Please try again.");
      }

      setWeather(data);
      setCity(name);
    } catch (e) {
      // Catch network errors and backend errors in one place.
      setError(e.message || "Could not connect to the weather service.");
    } finally {
      // Always stop the loading state, even if the request fails.
      setLoading(false);
    }
  }

  // Use safe defaults when optional API values are missing.
  const temperature = weather?.temperature ?? weather?.current_temp ?? 0;
  const rainChance = Math.min(100, Math.max(0, Number(weather?.rain_probability ?? 0)));

  return (
    <div className="weather-app">
      {/* App name and top navigation */}
      <header className="topbar">
        <a className="brand" href="#">
          <img className="brand-logo" src="/weather-logo.svg" alt="" /> <span>weather_app</span>
        </a>
      </header>

      <main className="page">
        {/* Page heading */}
        <section className="intro">
          <h1>Weather</h1>
        </section>

        {/* Search input and quick city shortcuts */}
        <section className="search-panel">
          <div className="search-row">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchWeather()}
              placeholder="Search city (e.g. Porbandar)"
              aria-label="City name"
            />
            <button onClick={() => searchWeather()} disabled={loading}>
              {loading ? "Loading..." : "Search"}
            </button>
          </div>

          <div className="city-shortcuts">
            <span>Try:</span>
            {["Porbandar", "Rajkot", "Ahmedabad", "Surat"].map((c) => (
              <button key={c} onClick={() => searchWeather(c)} disabled={loading}>
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Display API errors or the loading message */}
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Getting weather data…</div>}

        {/* Show the welcome screen before the first successful search. */}
        {!weather && !loading && !error && (
          <section className="empty-state">
            <div className="empty-icon">🌤️</div>
            <h2>Check the weather in your city</h2>
            <p></p>
          </section>
        )}

        {/* Weather result sections appear after a successful API request. */}
        {weather && !loading && (
          <div className="weather-results">
            {/* Current temperature and weather condition */}
            <section className="current-card">
              <div className="current-heading">
                <div>
                  <h2>{weather.city}{weather.country ? `, ${weather.country}` : ""}</h2>
                  <p className="condition">{weather.description}</p>
                </div>
                <div className="current-icon">{iconFor(weather.description)}</div>
              </div>

              <div className="temperature">
                {Math.round(temperature)}<span>°C</span>
              </div>
              <p className="feels">
                Feels like {Math.round(weather.feels_like ?? weather.feel_like ?? temperature)}°C
              </p>
              <div className="range">
                <span>Min {Math.round(weather.min_temperature ?? weather.temp_min ?? 0)}°</span>
                <span>Max {Math.round(weather.max_temperature ?? weather.temp_max ?? 0)}°</span>
              </div>
            </section>

            {/* Small cards for humidity, wind, pressure, and direction */}
            <section className="metrics">
              <article className="metric">
                <span className="metric-icon">💧</span>
                <span className="metric-label">Humidity</span>
                <strong>{weather.humidity ?? 0}%</strong>
              </article>
              <article className="metric">
                <span className="metric-icon">💨</span>
                <span className="metric-label">Wind speed</span>
                <strong>{weather.wind_speed ?? weather.Wind_Gust_Speed ?? 0} m/s</strong>
              </article>
              <article className="metric">
                <span className="metric-icon">🌡️</span>
                <span className="metric-label">Pressure</span>
                <strong>{weather.pressure ?? 0} hPa</strong>
              </article>
              <article className="metric">
                <span className="metric-icon">🧭</span>
                <span className="metric-label">Wind direction</span>
                <strong>{weather.wind_direction ?? "N/A"} {weather.wind_degree ?? weather.wind_gust_dir ?? ""}°</strong>
              </article>
            </section>

            {/* Rain prediction and percentage bar */}
            <section className="section-card">
              <div className="section-title">
                <div><h2>Rain Chance</h2></div>
              </div>
              <div className="rain-grid">
                <div className="rain-result">
                  <span className="rain-icon">{weather.rain_prediction === "Yes" ? "🌧️" : "☀️"}</span>
                  <div>
                    <small>Expected rainfall</small>
                    <strong>{weather.rain_prediction === "Yes" ? "Rain expected" : "No rain expected"}</strong>
                  </div>
                </div>
                <div className="rain-result probability">
                  <div>
                    <small>Rain probability</small>
                    <strong>{rainChance}%</strong>
                  </div>
                  <div className="bar">
                    <span style={{ width: `${rainChance}%` }} />
                  </div>
                </div>
              </div>
            </section>

            {/* Show the next five hourly temperature predictions. */}
            <section className="section-card">
              <div className="section-title">
                <div><h2>Next 5 Hours</h2></div>
              </div>
              <div className="forecast">
                {(weather.future_temperature || []).map((item, i) => (
                  <article className="forecast-item" key={i}>
                    <span className="forecast-time">{item.time}</span>
                    <span className="forecast-icon">{iconFor(weather.description)}</span>
                    <strong>{Math.round(item.temperature)}°C</strong>
                    {weather.future_humidity?.[i] && (
                      <small>💧 {weather.future_humidity[i].humidity}%</small>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Contact information at the bottom of the page */}
      <footer className="footer">
        <strong className="footer-title">Weater_app</strong>
        <span className="footer-credit">Developed by Bhavesh Radiya</span>
        <a className="footer-contact" href="tel:9904516703">📞 9904516703</a>
        <a className="footer-contact" href="mailto:bhaveshradiya1230@gmail.com">
          ✉️ bhaveshradiya1230@gmail.com
        </a>
      </footer>
    </div>
  );
}
