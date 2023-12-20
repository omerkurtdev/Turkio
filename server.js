#!/usr/bin/env node

const { serveHTTP, publishToCentral } = require("stremio-addon-sdk")
const addonInterface = require("./addon.js")
serveHTTP(addonInterface, { port: process.env.PORT || 60880 })
publishToCentral("https://my-addon.awesome/manifest.json")
