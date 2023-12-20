#!/usr/bin/env node

const { serveHTTP, publishToCentral } = require("stremio-addon-sdk")
const addonInterface = require("./addon.js")
serveHTTP(addonInterface, { port: process.env.PORT || 60880 })
publishToCentral("https://3a33eebd6e68-turkio.baby-beamup.club/manifest.json" )
// for more information on deploying, see: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/deploying/README.md
