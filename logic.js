/*
 * weatherLogic.js — pure functions for the "Show the Local Weather" project.
 *
 * UMD: in the browser it attaches to window.WeatherLogic; in Node it is
 * require()-able (module.exports). No DOM, no network — fully unit-testable.
 *
 * Provider: Open-Meteo (https://open-meteo.com). It is key-less and HTTPS,
 * so the app also degrades gracefully to bundled demo data when offline.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.WeatherLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast";
  var OPEN_METEO_GEOCODE = "https://geocoding-api.open-meteo.com/v1/search";

  // ---- Unit conversion ------------------------------------------------------
  function celsiusToFahrenheit(c) {
    return (Number(c) * 9) / 5 + 32;
  }
  function fahrenheitToCelsius(f) {
    return ((Number(f) - 32) * 5) / 9;
  }
  function roundTemp(t) {
    return Math.round(Number(t) * 100) / 100;
  }
  function toggleUnit(unit) {
    return unit === "C" ? "F" : "C";
  }

  // ---- Weather code -> visual + label --------------------------------------
  // Open-Meteo uses WMO weather interpretation codes.
  var WEATHER_CODES = {
    0: { label: "Clear sky", icon: "☀️", bg: "#f6c445" },
    1: { label: "Mainly clear", icon: "🌤️", bg: "#f7d794" },
    2: { label: "Partly cloudy", icon: "⛅", bg: "#f5f6fa" },
    3: { label: "Overcast", icon: "☁️", bg: "#d7dbe0" },
    45: { label: "Fog", icon: "🌫️", bg: "#dfe4ea" },
    48: { label: "Depositing rime fog", icon: "🌫️", bg: "#dfe4ea" },
    51: { label: "Light drizzle", icon: "🌦️", bg: "#b2bec3" },
    53: { label: "Moderate drizzle", icon: "🌦️", bg: "#b2bec3" },
    55: { label: "Dense drizzle", icon: "🌧️", bg: "#a5b1bd" },
    56: { label: "Light freezing drizzle", icon: "🌧️", bg: "#a9cce4" },
    57: { label: "Dense freezing drizzle", icon: "🌧️", bg: "#a9cce4" },
    61: { label: "Slight rain", icon: "🌦️", bg: "#b2bec3" },
    63: { label: "Moderate rain", icon: "🌧️", bg: "#8ea9b8" },
    65: { label: "Heavy rain", icon: "🌧️", bg: "#7f919f" },
    66: { label: "Light freezing rain", icon: "🌧️", bg: "#a9cce4" },
    67: { label: "Heavy freezing rain", icon: "🌧️", bg: "#a9cce4" },
    71: { label: "Slight snow", icon: "🌨️", bg: "#e8f0f5" },
    73: { label: "Moderate snow", icon: "❄️", bg: "#dce8f0" },
    75: { label: "Heavy snow", icon: "❄️", bg: "#d2e0ea" },
    77: { label: "Snow grains", icon: "❄️", bg: "#dce8f0" },
    80: { label: "Rain showers", icon: "🌦️", bg: "#b2bec3" },
    81: { label: "Slight rain showers", icon: "🌧️", bg: "#b2bec3" },
    82: { label: "Violent rain showers", icon: "🌧️", bg: "#8ea9b8" },
    85: { label: "Snow showers", icon: "❄️", bg: "#dce8f0" },
    86: { label: "Towering snow showers", icon: "❄️", bg: "#d2e0ea" },
    95: { label: "Thunderstorm", icon: "🌩️", bg: "#6d5f9c" },
    96: { label: "Thunderstorm with slight hail", icon: "🌩️", bg: "#6d5f9c" },
    99: { label: "Thunderstorm with heavy hail", icon: "🌩️", bg: "#5b4f86" }
  };
  var UNKNOWN = { label: "Unknown conditions", icon: "🌡️", bg: "#dfe4ea" };

  function describeWeather(code) {
    if (code == null) return UNKNOWN;
    return Object.prototype.hasOwnProperty.call(WEATHER_CODES, code)
      ? WEATHER_CODES[code]
      : UNKNOWN;
  }

  // ---- Request builders -----------------------------------------------------
  function buildForecastUrl(lat, lng) {
    var current =
      "temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m";
    var daily =
      "weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m";
    return (
      OPEN_METEO_FORECAST +
      "?latitude=" + lat +
      "&longitude=" + lng +
      "&current=" + current +
      "&daily=" + daily +
      "&timezone=auto&forecast_days=3"
    );
  }

  function buildGeocodeUrl(query) {
    return (
      OPEN_METEO_GEOCODE +
      "?name=" + encodeURIComponent(query) +
      "&count=1&language=en&format=json"
    );
  }

  // ---- Response parsing -----------------------------------------------------
  function parseForecast(json, unit) {
    var toUnit = function (v) {
      var c = Number(v);
      return unit === "F" ? roundTemp(celsiusToFahrenheit(c)) : roundTemp(c);
    };
    var cur = json.current || {};
    var desc = describeWeather(cur.weather_code);
    var current = {
      temp: toUnit(cur.temperature_2m),
      unit: unit,
      code: cur.weather_code,
      label: desc.label,
      icon: desc.icon,
      bg: desc.bg,
      wind: Number(cur.wind_speed_10m),
      humidity: Number(cur.relative_humidity_2m)
    };
    var days = [];
    if (json.daily && json.daily.time) {
      days = json.daily.time.map(function (day, i) {
        var d = describeWeather(json.daily.weather_code[i]);
        return {
          date: day,
          max: toUnit(json.daily.temperature_2m_max[i]),
          min: toUnit(json.daily.temperature_2m_min[i]),
          code: json.daily.weather_code[i],
          label: d.label,
          icon: d.icon,
          wind: Number(json.daily.wind_speed_10m[i])
        };
      });
    }
    return { current: current, days: days };
  }

  return {
    OPEN_METEO_FORECAST: OPEN_METEO_FORECAST,
    OPEN_METEO_GEOCODE: OPEN_METEO_GEOCODE,
    WEATHER_CODES: WEATHER_CODES,
    celsiusToFahrenheit: celsiusToFahrenheit,
    fahrenheitToCelsius: fahrenheitToCelsius,
    roundTemp: roundTemp,
    toggleUnit: toggleUnit,
    describeWeather: describeWeather,
    buildForecastUrl: buildForecastUrl,
    buildGeocodeUrl: buildGeocodeUrl,
    parseForecast: parseForecast
  };
});
