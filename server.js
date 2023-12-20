#!/usr/bin/env node

const { serveHTTP, publishToCentral } = require("stremio-addon-sdk")
const addonInterface = require("./addon.js")
serveHTTP(addonInterface, { port: process.env.PORT || 60880 })
publishToCentral("h3a33eebd6e68-turkio.baby-beamup.club/manifest.json")
