// Tests for the "Show the Local Weather" logic module.
// Run:  node test_local.js   (exits 0 + prints PASS when green)
"use strict";

const path = require("path");
const WeatherLogic = require(path.join(__dirname, "logic.js"));
const DemoData = require(path.join(__dirname, "demo-data.js"));
const forecastFixture = require(path.join(__dirname, "fixtures", "forecast.json"));
const geocodeFixture = require(path.join(__dirname, "fixtures", "geocode.json"));

let pass = 0;
let fail = 0;
const failures = [];

function check(name, cond, detail) {
  if (cond) {
    pass += 1;
    console.log("PASS  " + name + (detail ? "  [" + detail + "]" : ""));
  } else {
    fail += 1;
    failures.push(name);
    console.log("FAIL  " + name + (detail ? "  [" + detail + "]" : ""));
  }
}
function approx(a, b, eps) {
  return Math.abs(a - b) <= (eps === undefined ? 1e-9 : eps);
}

// --- unit conversion -------------------------------------------------------
check("0 C == 32 F", WeatherLogic.celsiusToFahrenheit(0) === 32);
check("100 C == 212 F", WeatherLogic.celsiusToFahrenheit(100) === 212);
check("32 F == 0 C", approx(WeatherLogic.fahrenheitToCelsius(32), 0));
check("212 F == 100 C", approx(WeatherLogic.fahrenheitToCelsius(212), 100));
check(
  "conversion round-trips",
  approx(
    WeatherLogic.celsiusToFahrenheit(WeatherLogic.fahrenheitToCelsius(98.6)),
    98.6,
    1e-6
  ),
  "98.6F -> 37C -> 98.6F"
);
check("toggleUnit C->F", WeatherLogic.toggleUnit("C") === "F");
check("toggleUnit F->C", WeatherLogic.toggleUnit("F") === "C");

// --- weather code mapping --------------------------------------------------
check("code 0 is clear", WeatherLogic.describeWeather(0).label === "Clear sky");
check(
  "code 75 is snow",
  WeatherLogic.describeWeather(75).label === "Heavy snow"
);
check(
  "code 95 is thunderstorm",
  WeatherLogic.describeWeather(95).label === "Thunderstorm"
);
check(
  "unknown code falls back safely",
  WeatherLogic.describeWeather(999).label === "Unknown conditions"
);
check(
  "null code falls back safely",
  WeatherLogic.describeWeather(null).icon === "🌡️"
);

// --- request builders ------------------------------------------------------
const fu = WeatherLogic.buildForecastUrl(40.7, -74.0);
check(
  "forecast URL has coords + current + daily + timezone",
  fu.indexOf("latitude=40.7") !== -1 &&
    fu.indexOf("longitude=-74") !== -1 &&
    fu.indexOf("current=") !== -1 &&
    fu.indexOf("daily=") !== -1 &&
    fu.indexOf("timezone=auto") !== -1,
  fu.slice(0, 60)
);
check(
  "geocode URL encodes the query",
  WeatherLogic.buildGeocodeUrl("New York").indexOf("name=New%20York") !== -1
);

// --- response parsing ------------------------------------------------------
const c = WeatherLogic.parseForecast(forecastFixture, "C");
check("parseForecast current temp (C)", approx(c.current.temp, 5.0));
check(
  "parseForecast maps code to label",
  c.current.label === "Heavy snow" && c.current.icon === "❄️"
);
check(
  "parseForecast builds 3 daily rows",
  Array.isArray(c.days) && c.days.length === 3
);

const f = WeatherLogic.parseForecast(forecastFixture, "F");
check(
  "parseForecast converts to Fahrenheit",
  approx(f.current.temp, WeatherLogic.celsiusToFahrenheit(5.0))
);
check(
  "parseForecast daily F conversion",
  approx(f.days[2].max, WeatherLogic.celsiusToFahrenheit(18.0)),
  "2nd day max 18C -> F"
);

// --- geocode fixture shape (what the app expects) -------------------------
check(
  "geocode fixture exposes lat/lng",
  geocodeFixture.results.length === 1 &&
    typeof geocodeFixture.results[0].latitude === "number"
);

// --- offline demo data matches the provider shape -------------------------
const demo = WeatherLogic.parseForecast(DemoData.forecast, "C");
check(
  "demo data parses (offline fallback)",
  demo.current.code === 61 && demo.days.length === 3,
  "code " + demo.current.code
);

// --- summary ----------------------------------------------------------------
console.log("");
const total = pass + fail;
console.log("SUMMARY: " + pass + " passed, " + fail + " failed / " + total);
if (fail === 0) {
  console.log("PASS");
  process.exit(0);
} else {
  console.log("FAILED: " + failures.join(", "));
  process.exit(1);
}
