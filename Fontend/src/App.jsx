import { useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeather = async (cityOverride = null) => {
    const searchCity = (cityOverride ?? city).trim();

    if (!searchCity) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const response = await fetch(
        `${API_URL}/weather/${encodeURIComponent(searchCity)}`
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to fetch weather data."
        );
      }

      setWeather(data);
      setCity(searchCity);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the weather service. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      getWeather();
    }
  };

  const getWeatherIcon = (description = "") => {
    const text = description.toLowerCase();

    if (text.includes("thunderstorm")) return "⛈️";
    if (text.includes("rain")) return "🌧️";
    if (text.includes("drizzle")) return "🌦️";
    if (text.includes("snow")) return "❄️";
    if (text.includes("mist") || text.includes("fog")) return "🌫️";
    if (text.includes("cloud")) return "☁️";
    if (text.includes("clear")) return "☀️";

    return "🌤️";
  };

  const temperature =
    weather?.temperature ??
    weather?.current_temp ??
    0;

  const feelsLike =
    weather?.feels_like ??
    weather?.feel_like ??
    0;

  const minTemperature =
    weather?.min_temperature ??
    weather?.temp_min ??
    0;

  const maxTemperature =
    weather?.max_temperature ??
    weather?.temp_max ??
    0;

  const windSpeed =
    weather?.wind_speed ??
    weather?.Wind_Gust_Speed ??
    0;

  const windDirection =
    weather?.wind_direction ?? "N/A";

  const windDegree =
    weather?.wind_degree ??
    weather?.wind_gust_dir ??
    0;

  return (
    <div className="app">
      {/* Background Effects */}
      <div className="background-grid"></div>
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>
      <div className="background-glow glow-three"></div>

      {/* Floating particles */}
      <div className="particles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <span>☁️</span>
          </div>

          <div>
            <h1>Weather AI</h1>
            <p>Smart Weather Prediction</p>
          </div>
        </div>

        <div className="header-right">
          <div className="status-badge">
            <span className="status-dot"></span>
            System Online
          </div>

          <div className="ai-badge">
            <span>✦</span>
            AI Powered
          </div>
        </div>
      </header>

      <main className="container">

        {/* HERO */}
        <section className="hero">
          <div className="hero-content">

            <div className="hero-label">
              <span className="label-line"></span>
              AI WEATHER ASSISTANT
              <span className="label-line"></span>
            </div>

            <h2>
              Know your weather.
              <br />
              <span>Plan your day.</span>
            </h2>

            <p className="hero-text">
              Get real-time weather information and intelligent
              predictions powered by Machine Learning.
            </p>

            {/* SEARCH */}
            <div className="search-box">
              <span className="search-icon">⌕</span>

              <input
                type="text"
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button
                onClick={() => getWeather()}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Searching
                  </>
                ) : (
                  <>
                    Search
                    <span>→</span>
                  </>
                )}
              </button>
            </div>

            {/* QUICK CITIES */}
            <div className="quick-cities">
              <span>Popular cities</span>

              {[
                "Porbandar",
                "Rajkot",
                "Ahmedabad",
                "Surat",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => getWeather(item)}
                  disabled={loading}
                >
                  {item}
                </button>
              ))}
            </div>

            {error && (
              <div className="error-box">
                <div className="error-icon">⚠</div>
                <div>
                  <strong>Unable to get weather</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* HERO WEATHER ANIMATION */}
          <div className="hero-visual">
            <div className="weather-orbit orbit-one"></div>
            <div className="weather-orbit orbit-two"></div>

            <div className="hero-cloud">
              <span className="cloud-sun">☀️</span>
              ☁️
            </div>

            <div className="floating-cloud cloud-small">
              ☁️
            </div>

            <div className="floating-cloud cloud-small-two">
              ☁️
            </div>

            <div className="weather-spark spark-one">✦</div>
            <div className="weather-spark spark-two">✧</div>
            <div className="weather-spark spark-three">•</div>
          </div>
        </section>

        {/* LOADING */}
        {loading && (
          <section className="loading-card fade-up">
            <div className="loader-wrapper">
              <div className="loader-ring"></div>
              <div className="loader-icon">🌤️</div>
            </div>

            <h3>Analyzing Weather</h3>
            <p>
              Fetching live data and generating AI predictions...
            </p>

            <div className="loading-bar">
              <span></span>
            </div>
          </section>
        )}

        {/* WEATHER RESULT */}
        {weather && !loading && (
          <div className="results fade-up">

            {/* LOCATION HEADER */}
            <section className="location-heading">
              <div>
                <div className="section-label">
                  CURRENT WEATHER
                </div>

                <h2>
                  {weather.city}, {weather.country}
                </h2>

                <p className="description">
                  {weather.description}
                </p>
              </div>

              <div className="live-badge">
                <span></span>
                Live Data
              </div>
            </section>

            {/* MAIN WEATHER */}
            <section className="weather-main-card">

              <div className="weather-card-glow"></div>

              <div className="temperature-area">
                <div className="weather-symbol animated-weather">
                  {getWeatherIcon(weather.description)}
                </div>

                <div>
                  <div className="temperature">
                    {Math.round(temperature)}
                    <span>°C</span>
                  </div>

                  <p>
                    Feels like{" "}
                    <strong>{Math.round(feelsLike)}°C</strong>
                  </p>
                </div>
              </div>

              <div className="temp-range">

                <div className="range-item">
                  <span>MINIMUM</span>
                  <strong>
                    {Math.round(minTemperature)}°
                  </strong>
                </div>

                <div className="range-divider"></div>

                <div className="range-item">
                  <span>MAXIMUM</span>
                  <strong>
                    {Math.round(maxTemperature)}°
                  </strong>
                </div>

              </div>
            </section>

            {/* DETAILS */}
            <section className="details-grid">

              <WeatherDetail
                icon="💧"
                title="Humidity"
                value={`${weather.humidity ?? 0}%`}
              />

              <WeatherDetail
                icon="💨"
                title="Wind Speed"
                value={`${windSpeed} m/s`}
              />

              <WeatherDetail
                icon="🧭"
                title="Wind Direction"
                value={`${windDirection} ${windDegree}°`}
              />

              <WeatherDetail
                icon="🌡️"
                title="Pressure"
                value={`${weather.pressure ?? 0} hPa`}
              />

            </section>

            {/* AI SECTION */}
            <section className="ai-section">

              <div className="section-heading">
                <div>
                  <div className="section-label">
                    MACHINE LEARNING
                  </div>

                  <h2>AI Weather Prediction</h2>

                  <p>
                    Intelligent analysis from trained ML models
                  </p>
                </div>

                <div className="model-status">
                  <span></span>
                  Model Active
                </div>
              </div>

              <div className="prediction-grid">

                <div className="prediction-card rain-card">
                  <div className="prediction-icon">
                    🌧️
                  </div>

                  <div className="prediction-content">
                    <span>Rain Prediction</span>

                    <h3>
                      {weather.rain_prediction === "Yes"
                        ? "Rain Expected"
                        : "No Rain"}
                    </h3>

                    <div className="prediction-line">
                      <span
                        className={
                          weather.rain_prediction === "Yes"
                            ? "rain"
                            : "clear"
                        }
                      ></span>
                    </div>
                  </div>

                  <div className="card-arrow">→</div>
                </div>

                <div className="prediction-card probability-card">
                  <div className="prediction-icon">
                    🎯
                  </div>

                  <div className="prediction-content">
                    <span>Rain Probability</span>

                    <h3>
                      {weather.rain_probability ?? 0}%
                    </h3>

                    <div className="probability-bar">
                      <span
                        style={{
                          width: `${Math.min(
                            Number(weather.rain_probability ?? 0),
                            100
                          )}%`,
                        }}
                      ></span>
                    </div>
                  </div>

                  <div className="probability-number">
                    %
                  </div>
                </div>

              </div>
            </section>

            {/* FORECAST */}
            <section className="forecast-section">

              <div className="section-heading">
                <div>
                  <div className="section-label">
                    AI FORECAST
                  </div>

                  <h2>Temperature Forecast</h2>

                  <p>
                    Predicted weather for the upcoming hours
                  </p>
                </div>

                <div className="forecast-info">
                  <span>◷</span>
                  Next 5 Hours
                </div>
              </div>

              <div className="forecast-grid">

                {weather.future_temperature?.map(
                  (item, index) => {

                    const temp = Number(item.temperature);

                    return (
                      <div
                        className="forecast-card"
                        key={index}
                        style={{
                          animationDelay: `${index * 0.08}s`,
                        }}
                      >
                        <span className="forecast-time">
                          {item.time}
                        </span>

                        <div className="forecast-icon">
                          {temp >= 32
                            ? "☀️"
                            : temp >= 28
                            ? "🌤️"
                            : "☁️"}
                        </div>

                        <strong>
                          {Math.round(temp)}°C
                        </strong>

                        {weather.future_humidity?.[index] && (
                          <span className="forecast-humidity">
                            💧{" "}
                            {
                              weather.future_humidity[index]
                                .humidity
                            }
                            %
                          </span>
                        )}

                        <div className="forecast-bottom-line"></div>
                      </div>
                    );
                  }
                )}

              </div>
            </section>

          </div>
        )}

        {/* WELCOME */}
        {!weather && !loading && !error && (
          <section className="welcome-card fade-up">

            <div className="welcome-animation">
              <div className="welcome-sun">☀️</div>
              <div className="welcome-cloud">☁️</div>
            </div>

            <div className="welcome-label">
              READY TO EXPLORE
            </div>

            <h2>Search for a city</h2>

            <p>
              Enter a city name above to get current weather,
              AI-powered rain predictions and future
              temperature forecasts.
            </p>

            <div className="welcome-features">
              <span>🌡️ Live Weather</span>
              <span>🤖 AI Prediction</span>
              <span>📊 Smart Forecast</span>
            </div>

          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer>
        <div className="footer-line"></div>

        <p>
          <strong>Weather AI</strong>
          <span>•</span>
          OpenWeather
          <span>•</span>
          Machine Learning
        </p>

        <small>
          Intelligent weather insights for smarter decisions.
        </small>
      </footer>
    </div>
  );
}

function WeatherDetail({ icon, title, value }) {
  return (
    <div className="detail-card">

      <div className="detail-icon">
        {icon}
      </div>

      <div className="detail-content">
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

      <div className="detail-shine"></div>
    </div>
  );
}

export default App;