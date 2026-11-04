/*
 * demo-data.js — bundled, offline fallback for the Local Weather app.
 * Shaped exactly like the Open-Meteo forecast response so parseForecast()
 * works on it. Used when geolocation or the network is unavailable.
 * UMD: window.DemoData in the browser, require()-able in Node.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.DemoData = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var demoLocation = { name: "London", country: "GB", latitude: 51.5072, longitude: -0.1276 };
  var demoForecast = {
    current: {
      temperature_2m: 14.2,
      weather_code: 61,
      wind_speed_10m: 11.5,
      relative_humidity_2m: 88
    },
    daily: {
      time: ["2026-11-04", "2026-11-05", "2026-11-06"],
      weather_code: [63, 3, 0],
      temperature_2m_max: [15.1, 17.8, 20.4],
      temperature_2m_min: [9.6, 8.1, 10.3],
      wind_speed_10m: [14.2, 9.7, 5.5]
    }
  };
  return { location: demoLocation, forecast: demoForecast };
});
