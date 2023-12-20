#!/usr/bin/env node
const config = require('./config.js');
const { serveHTTP, publishToCentral } = require("stremio-addon-sdk")
const addonInterface = require("./addon.js")
serveHTTP(addonInterface, { port: process.env.PORT || 60880 })


// for more information on deploying, see: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/deploying/README.md
if(process.env.NODE_ENV){
    publishToCentral(`${config.local}/manifest.json`)
    console.log(process.env.NODE_ENV)
}