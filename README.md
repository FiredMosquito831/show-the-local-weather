# Show the Local Weather

**A freeCodeCamp Legacy Front-End certification project.**

## What it does

A static, no-build weather app that:

- Shows the weather at your current location (HTML5 Geolocation) and lets
  you search any city.
- Switches the icon **and** the whole-page background to match the current
  conditions (clear / rainy / snowy / stormy, etc.).
- Lets you toggle between °C and °F with one button.
- Shows a 3-day forecast.

It is built against the published user stories:

1. I can see the weather in my current location.
2. I can see a different icon or background image depending on the weather.
3. I can push a button to toggle between Fahrenheit and Celsius.

## Tech stack

- Vanilla HTML / CSS / JavaScript — no build step, no framework.
- **Open-Meteo** (free, key-less, HTTPS) for geocoding + forecast data.
- The core logic (unit conversion, weather-code → icon/background mapping,
  request builders and response parsing) lives in `logic.js`, a UMD module
  that works both in the browser (`window.WeatherLogic`) and in Node
  (`require("./logic.js")`).

## Graceful offline fallback

When Geolocation is denied or Open-Meteo is unreachable, the app falls back
to bundled demo data (`demo-data.js`, London) and says so. The whole app
therefore runs offline.

## How to run

It is a static app — open `index.html` directly in a browser, or serve the
folder:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## How to test

```bash
node test_local.js
```

Runs 21 assertions over the pure logic module (unit conversion, weather-code
mapping, URL builders, forecast parsing in both units, and the offline demo
shape). Exits `0` and prints `PASS` when green. The captured output is
committed as `local-test.log`.

## Files

| file | role |
|---|---|
| `index.html` | UI |
| `styles.css` | styling |
| `logic.js` | pure, testable logic (UMD) |
| `demo-data.js` | offline fallback data (UMD) |
| `app.js` | DOM wiring + fetch + fallback |
| `fixtures/*.json` | sample provider responses for tests |
| `test_local.js` | Node test runner |

## Licence

MIT © 2026 FiredMosquito831. Written from scratch against the published project
user stories; no freeCodeCamp starter or reference-solution code was used.


## Verification

Built and tested locally before publication: **21/21 assertions passing**
(`node test_local.js`). Captured output committed as [`local-test.log`](local-test.log).

Core logic lives in `logic.js (window.WeatherLogic)`; the test exercises it in Node without a browser.

## Source

Written from scratch against the project's published freeCodeCamp specification. No freeCodeCamp
starter or reference-solution code was used.
