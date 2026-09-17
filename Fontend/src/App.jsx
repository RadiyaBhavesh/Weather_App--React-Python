import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import "./WeatherEffects.css";
import "./WeatherMap.css";

const API_URL = import.meta.env.VITE_API_URL;

const weatherMarker = new L.DivIcon({
  className: "weather-map-marker",
  html: '<div class="weather-marker-pin">☀️</div>',
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -42],
});

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeather = async (cityOverride = null) => {
    const searchCity = (cityOverride ?? city).trim();
    if (!searchCity) { setError("Please enter a city name."); return; }
    if (!API_URL) { setError("Weather API URL is not configured."); return; }
    setLoading(true); setError(""); setWeather(null);
    try {
      const response = await fetch(`${API_URL}/weather/${encodeURIComponent(searchCity)}`);
      let data = {};
      try { data = await response.json(); } catch { data = {}; }
      if (!response.ok) throw new Error(data.detail || "Unable to fetch weather data.");
      setWeather(data); setCity(searchCity);
    } catch (err) {
      setError(err.message || "Unable to connect to the weather service. Please try again later.");
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") getWeather(); };
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

  const temperature = weather?.temperature ?? weather?.current_temp ?? 0;
  const feelsLike = weather?.feels_like ?? weather?.feel_like ?? 0;
  const minTemperature = weather?.min_temperature ?? weather?.temp_min ?? 0;
  const maxTemperature = weather?.max_temperature ?? weather?.temp_max ?? 0;
  const windSpeed = weather?.wind_speed ?? weather?.Wind_Gust_Speed ?? 0;
  const windDirection = weather?.wind_direction ?? "N/A";
  const windDegree = weather?.wind_degree ?? weather?.wind_gust_dir ?? 0;

  return (
    <div className="app">
      <div className="background-grid" />
      <div className="background-glow glow-one" /><div className="background-glow glow-two" /><div className="background-glow glow-three" />
      <WeatherScene condition={weather?.description} />
      <div className="particles"><span/><span/><span/><span/><span/><span/><span/><span/></div>
      <header className="header">
        <div className="logo"><div className="logo-icon"><span>☁️</span></div><div><h1>Weather AI</h1><p>Smart Weather Prediction</p></div></div>
        <div className="header-right"><div className="status-badge"><span className="status-dot"/>System Online</div><div className="ai-badge"><span>✦</span> AI Powered</div></div>
      </header>
      <main className="container">
        <section className="hero">
          <div className="hero-content">
            <div className="hero-label"><span className="label-line"/>AI WEATHER ASSISTANT<span className="label-line"/></div>
            <h2>Know your weather.<br/><span>Plan your day.</span></h2>
            <p className="hero-text">Get real-time weather information and intelligent predictions powered by Machine Learning.</p>
            <div className="search-box"><span className="search-icon">⌕</span><input type="text" placeholder="Enter city name..." value={city} onChange={(e)=>setCity(e.target.value)} onKeyDown={handleKeyDown}/><button onClick={()=>getWeather()} disabled={loading}>{loading ? <><span className="button-spinner"/> Searching</> : <>Search <span>→</span></>}</button></div>
            <div className="quick-cities"><span>Popular cities</span>{["Porbandar","Rajkot","Ahmedabad","Surat"].map(item=><button key={item} onClick={()=>getWeather(item)} disabled={loading}>{item}</button>)}</div>
            {error && <div className="error-box"><div className="error-icon">⚠</div><div><strong>Unable to get weather</strong><p>{error}</p></div></div>}
          </div>
          <div className="hero-visual"><div className="weather-orbit orbit-one"/><div className="weather-orbit orbit-two"/><div className="hero-cloud"><span className="cloud-sun">☀️</span>☁️</div><div className="floating-cloud cloud-small">☁️</div><div className="floating-cloud cloud-small-two">☁️</div><div className="weather-spark spark-one">✦</div><div className="weather-spark spark-two">✧</div><div className="weather-spark spark-three">•</div></div>
        </section>
        {loading && <section className="loading-card fade-up"><div className="loader-wrapper"><div className="loader-ring"/><div className="loader-icon">🌤️</div></div><h3>Analyzing Weather</h3><p>Fetching live data and generating AI predictions...</p><div className="loading-bar"><span/></div></section>}
        {weather && !loading && <div className="results fade-up">
          <section className="location-heading"><div><div className="section-label">CURRENT WEATHER</div><h2>{weather.city}, {weather.country}</h2><p className="description">{weather.description}</p></div><div className="live-badge"><span/> Live Data</div></section>
          <section className="weather-main-card"><div className="weather-card-glow"/><div className="temperature-area"><div className="weather-symbol animated-weather">{getWeatherIcon(weather.description)}</div><div><div className="temperature">{Math.round(temperature)}<span>°C</span></div><p>Feels like <strong>{Math.round(feelsLike)}°C</strong></p></div></div><div className="temp-range"><div className="range-item"><span>MINIMUM</span><strong>{Math.round(minTemperature)}°</strong></div><div className="range-divider"/><div className="range-item"><span>MAXIMUM</span><strong>{Math.round(maxTemperature)}°</strong></div></div></section>
          <section className="details-grid"><WeatherDetail icon="💧" title="Humidity" value={`${weather.humidity ?? 0}%`}/><WeatherDetail icon="💨" title="Wind Speed" value={`${windSpeed} m/s`}/><WeatherDetail icon="🧭" title="Wind Direction" value={`${windDirection} ${windDegree}°`}/><WeatherDetail icon="🌡️" title="Pressure" value={`${weather.pressure ?? 0} hPa`}/></section>
          <WeatherMap weather={weather} />
          <section className="ai-section"><div className="section-heading"><div><div className="section-label">MACHINE LEARNING</div><h2>AI Weather Prediction</h2><p>Intelligent analysis from trained ML models</p></div><div className="model-status"><span/> Model Active</div></div><div className="prediction-grid"><div className="prediction-card rain-card"><div className="prediction-icon">🌧️</div><div className="prediction-content"><span>Rain Prediction</span><h3>{weather.rain_prediction === "Yes" ? "Rain Expected" : "No Rain"}</h3><div className="prediction-line"><span className={weather.rain_prediction === "Yes" ? "rain" : "clear"}/></div></div><div className="card-arrow">→</div></div><div className="prediction-card probability-card"><div className="prediction-icon">🎯</div><div className="prediction-content"><span>Rain Probability</span><h3>{weather.rain_probability ?? 0}%</h3><div className="probability-bar"><span style={{width:`${Math.min(Number(weather.rain_probability ?? 0),100)}%`}}/></div></div><div className="probability-number">%</div></div></div></section>
          <section className="forecast-section"><div className="section-heading"><div><div className="section-label">AI FORECAST</div><h2>Temperature Forecast</h2><p>Predicted weather for the upcoming hours</p></div><div className="forecast-info"><span>◷</span> Next 5 Hours</div></div><div className="forecast-grid">{weather.future_temperature?.map((item,index)=>{const temp=Number(item.temperature);return <div className="forecast-card" key={index} style={{animationDelay:`${index*.08}s`}}><span className="forecast-time">{item.time}</span><div className="forecast-icon">{temp>=32?"☀️":temp>=28?"🌤️":"☁️"}</div><strong>{Math.round(temp)}°C</strong>{weather.future_humidity?.[index]&&<span className="forecast-humidity">💧 {weather.future_humidity[index].humidity}%</span>}<div className="forecast-bottom-line"/></div>})}</div></section>
        </div>}
        {!weather && !loading && !error && <section className="welcome-card fade-up"><div className="welcome-animation"><div className="welcome-sun">☀️</div><div className="welcome-cloud">☁️</div></div><div className="welcome-label">READY TO EXPLORE</div><h2>Search for a city</h2><p>Enter a city name above to get current weather, AI-powered rain predictions and future temperature forecasts.</p><div className="welcome-features"><span>🌡️ Live Weather</span><span>🤖 AI Prediction</span><span>📊 Smart Forecast</span></div></section>}
      </main>
      <footer><div className="footer-line"/><p><strong>Weather AI</strong><span>•</span>OpenStreetMap<span>•</span>OpenWeather<span>•</span>Machine Learning</p><small>Intelligent weather insights for smarter decisions.</small></footer>
    </div>
  );
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(e) { onSelect(e.latlng.lat, e.latlng.lng); }
  });
  return null;
}

function WeatherMap({ weather }) {
  const [coords, setCoords] = useState(null);
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");

  const city = weather?.city || "";
  const country = weather?.country || "";
  const temperature = Math.round(weather?.temperature ?? weather?.current_temp ?? 0);

  useEffect(() => {
    let cancelled = false;
    const loadCity = async () => {
      if (!city) return;
      setMapLoading(true); setMapError("");
      try {
        const q = encodeURIComponent(`${city}${country ? `, ${country}` : ""}`);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${q}`);
        if (!response.ok) throw new Error("Unable to locate city on map.");
        const results = await response.json();
        if (!results.length) throw new Error("City location not found.");
        if (!cancelled) setCoords([Number(results[0].lat), Number(results[0].lon)]);
      } catch (err) { if (!cancelled) setMapError(err.message); }
      finally { if (!cancelled) setMapLoading(false); }
    };
    loadCity();
    return () => { cancelled = true; };
  }, [city, country]);

  const handleMapSelect = async (lat, lon) => {
    setCoords([lat, lon]);
    setSelectedWeather({ lat, lon, temperature, city: "Selected location", description: weather?.description || "Live weather" });
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      const place = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || "Selected location";
      setSelectedWeather({ lat, lon, temperature, city: place, description: weather?.description || "Live weather" });
    } catch { /* keep selected coordinates */ }
  };

  if (!coords) return <section className="weather-map-section"><div className="weather-map-head"><div><div className="weather-map-kicker">LOCATION INTELLIGENCE</div><h2>Weather Map</h2><p>{mapLoading ? `Locating ${city}…` : mapError || "Map location unavailable."}</p></div></div></section>;

  const shown = selectedWeather || { lat: coords[0], lon: coords[1], city, temperature, description: weather?.description || "Live weather" };
  return <section className="weather-map-section">
    <div className="weather-map-head"><div><div className="weather-map-kicker">LOCATION INTELLIGENCE</div><h2>Interactive Weather Map</h2><p>Tap or click anywhere on the map to select a location.</p></div><div className="map-live"><span/> Live Map</div></div>
    <div className="weather-map-wrap">
      <MapContainer center={coords} zoom={11} scrollWheelZoom={true} className="leaflet-weather-map">
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onSelect={handleMapSelect} />
        <Marker position={coords} icon={weatherMarker}><Popup><strong>{shown.city}</strong><br/>{shown.temperature}°C<br/>{shown.description}</Popup></Marker>
      </MapContainer>
      <div className="map-temp-card"><small>Selected location</small><div className="map-temp-row"><strong>{shown.temperature}°C</strong><span>{shown.city}</span></div><div className="map-coordinates">{shown.lat.toFixed(4)}, {shown.lon.toFixed(4)}</div></div>
      <a className="map-open" href={`https://www.openstreetmap.org/?mlat=${shown.lat}&mlon=${shown.lon}#map=12/${shown.lat}/${shown.lon}`} target="_blank" rel="noreferrer">↗ Open full map</a>
    </div>
  </section>;
}

function WeatherScene({ condition = "clear" }) {
  const text = condition.toLowerCase();
  const isRain=text.includes("rain")||text.includes("drizzle"), isSnow=text.includes("snow"), isStorm=text.includes("thunderstorm"), isFog=text.includes("mist")||text.includes("fog")||text.includes("haze"), isCloud=text.includes("cloud")||text.includes("overcast"), isClear=text.includes("clear")||(!isRain&&!isSnow&&!isStorm&&!isFog&&!isCloud), isWind=text.includes("wind")||text.includes("squall");
  return <div className="weather-scene" aria-hidden="true">{(isClear||isCloud)&&<div className="weather-sun-orb"/>}{isClear&&<div className="weather-sun-rays"/>}{(isCloud||isRain||isStorm||isFog)&&<><div className="weather-cloud-layer cloud-one"/><div className="weather-cloud-layer cloud-two"/><div className="weather-cloud-layer cloud-three"/></>}{isRain&&<div className="weather-rain">{Array.from({length:14},(_,i)=><span key={i}/>)}</div>}{isSnow&&<div className="weather-snow">{Array.from({length:7},(_,i)=><span key={i}/>)}</div>}{isStorm&&<div className="weather-lightning"/>}{isFog&&<div className="weather-fog"/>}{isWind&&<div className="weather-wind"/>}</div>;
}
function WeatherDetail({icon,title,value}) { return <div className="detail-card"><div className="detail-icon">{icon}</div><div className="detail-content"><span>{title}</span><strong>{value}</strong></div><div className="detail-shine"/></div>; }
export default App;
