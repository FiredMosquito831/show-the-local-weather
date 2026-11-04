/*
 * app.js — DOM wiring for the Local Weather app.
 * Uses WeatherLogic (pure) + DemoData (offline fallback). Gracefully
 * degrades to bundled demo data whenever geolocation or the network
 * (Open-Meteo) is unavailable, so the app always renders something.
 */
(function () {
  "use strict";
  var L = window.WeatherLogic;
  var Demo = window.DemoData;

  var state = {
    unit: "C",
    name: "My location",
    lat: null,
    lng: null,
    raw: null,
    offline: false
  };

  var $ = function (id) { return document.getElementById(id); };

  function render() {
    if (!state.raw) return;
    var p = L.parseForecast(state.raw, state.unit);
    var cur = p.current;

    // Background / icon reflect the current weather code.
    $("app").style.background = cur.bg;
    $("wx-icon").textContent = cur.icon;
    $("wx-temp").textContent = cur.temp + "°" + state.unit;
    $("wx-desc").textContent = cur.label;
    $("wx-meta").textContent =
      "Wind " + cur.wind + " km/h · Humidity " + cur.humidity + "%";
    $("loc-name").textContent = state.name;
    $("status-note").textContent = state.offline
      ? "(demo data — offline)"
      : "";

    // 3-day forecast
    var list = $("forecast-list");
    list.innerHTML = "";
    p.days.forEach(function (d) {
      var li = document.createElement("li");
      li.className = "day";
      var day = document.createElement("span");
      day.className = "date";
      day.textContent = d.date.slice(5); // MM-DD
      var ic = document.createElement("span");
      ic.className = "dicon";
      ic.textContent = d.icon;
      ic.title = d.label;
      var t = document.createElement("span");
      className(t, "range");
      t.textContent =
        d.max + "° / " + d.min + "°" + state.unit;
      li.appendChild(day);
      li.appendChild(ic);
      li.appendChild(t);
      list.appendChild(li);
    });

    $("unit-toggle").setAttribute("aria-pressed", state.unit === "F");
    $("unit-toggle").textContent =
      state.unit === "C" ? "°C → °F" : "°F → °C";
  }
  function className(el, c) { el.className = c; }

  async function loadForecast(lat, lng, name) {
    state.lat = lat;
    state.lng = lng;
    state.name = name;
    try {
      var r = await fetch(L.buildForecastUrl(lat, lng));
      if (!r.ok) throw new Error("HTTP " + r.status);
      state.raw = await r.json();
      state.offline = false;
      $("foot-note").textContent = "Data by Open-Meteo.";
    } catch (e) {
      // Offline / network failure -> bundled demo data.
      state.raw = Demo.forecast;
      state.offline = true;
      $("foot-note").textContent =
        "Offline — showing bundled demo data (London).";
    }
    render();
  }

  async function searchCity(q) {
    state.name = q;
    try {
      var r = await fetch(L.buildGeocodeUrl(q));
      if (!r.ok) throw new Error("HTTP " + r.status);
      var j = await r.json();
      var hit = j.results && j.results[0];
      if (!hit) {
        $("status-note").textContent = "no results";
        return;
      }
      await loadForecast(hit.latitude, hit.longitude, hit.name);
    } catch (e) {
      // Geocode endpoint down -> fall back to demo but keep the label.
      state.name = q;
      await loadForecast(
        Demo.location.latitude,
        Demo.location.longitude,
        q
      );
    }
  }

  function useGeolocation() {
    if (!navigator.geolocation) {
      loadForecast(Demo.location.latitude, Demo.location.longitude, "London (demo)");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        loadForecast(
          pos.coords.latitude,
          pos.coords.longitude,
          "Your location"
        );
      },
      function () {
        // Geolocation denied -> demo.
        loadForecast(Demo.location.latitude, Demo.location.longitude, "London (demo)");
      },
      { timeout: 8000 }
    );
  }

  // Events
  $("unit-toggle").addEventListener("click", function () {
    state.unit = L.toggleUnit(state.unit);
    render();
  });
  $("location-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = $("location-input").value.trim();
    if (q) searchCity(q);
  });

  // Initial load: use geolocation, fall back to demo on failure.
  useGeolocation();
})();
