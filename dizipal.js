"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var needle = require("needle");
var m3u8Parser = require('m3u8-parser');
var cheerio = require("cheerio");
var getSlugDizipal = function (params) {
    return new Promise(function (resolve, reject) {
        var apiUrl = "https://dizipal730.com/api/search-autocomplete";
        var postData = { query: params.originalTitle };
        var customHeaders = {
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        };
        console.log(params.originalTitle);
        needle.post(apiUrl, postData, { headers: customHeaders }, function (err, resp, body) {
            var _a;
            if (err) {
                console.error("getFilm için POST isteği yapma hatasi:", err);
                reject(err);
                return;
            }
            console.log("POST İsteği Sonucu:", body);
            if (resp.statusCode === 200) {
                try {
                    // JSON formatındaki yanıtı parse et
                    var results = JSON.stringify(body);
                    var regex = /(?<="url":")([^"]+)/g;
                    var eslesmeler = results.match(regex);
                    params.dizipalSlug = eslesmeler[0];
                    console.log(eslesmeler[0]);
                    if (eslesmeler === null) {
                        var slug = "/dizi/" + ((_a = params.originalTitle) === null || _a === void 0 ? void 0 : _a.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/\s+/g, '-')); // Boşlukları tire ile değiştir
                        params.dizipalSlug = slug;
                        resolve(params);
                    }
                }
                catch (parseError) {
                    console.error("JSON parse hatası:", parseError);
                    reject(parseError);
                }
            }
            else {
                reject(new Error("Film alinamadi. Durum kodu: ".concat(resp.statusCode)));
            }
        });
    });
};
var getDizipalLinks = function (params) {
    return new Promise(function (resolve, reject) {
        params.links = [];
        params.players = [];
        if (params.type === "series") {
            var filmUrl = "https://dizipal730.com".concat(params.dizipalSlug, "/sezon-").concat(params.sezon, "/bolum-").concat(params.episode);
            needle.get(filmUrl, function (err, resp, body) {
                var $ = cheerio.load(body);
                var player = $("iframe").attr("data-src");
                console.log(player);
                var headers = {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                    "accept-language": "en-US,en;q=0.5",
                    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Brave\";v=\"120\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Linux\"",
                    "sec-fetch-dest": "iframe",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "cross-site",
                    "sec-gpc": "1",
                    "upgrade-insecure-requests": "1",
                    "Referer": "https://dizipal730.com/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                };
                needle('get', player, { headers: headers })
                    .then(function (response) {
                    var regex = /((\w+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]`#|]+)/g;
                    var eslesmeler = response.body.match(regex);
                    needle('get', eslesmeler[2], function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var decodedString = body.toString("utf-8");
                            console.log(decodedString);
                            var parser = new m3u8Parser.Parser();
                            parser.push(decodedString);
                            parser.end();
                            var parsedData = parser.manifest;
                            parsedData.playlists.forEach(function (playlist) {
                                var _a, _b;
                                params.provider = "Dizipal";
                                (_a = params.srcVideo) === null || _a === void 0 ? void 0 : _a.push(playlist.uri);
                                (_b = params.players) === null || _b === void 0 ? void 0 : _b.push(playlist.attributes.RESOLUTION.width + "x" + playlist.attributes.RESOLUTION.height + params.title);
                                console.log("Stream URI: ".concat(playlist.uri));
                                console.log("Resolution: ".concat(playlist.attributes.RESOLUTION.width, "x").concat(playlist.attributes.RESOLUTION.height));
                                resolve(params);
                            });
                        }
                        else {
                            console.error("Error: ".concat(error));
                        }
                    });
                })
                    .catch(function (error) {
                    console.error(error);
                });
            });
        }
    });
};
module.exports = { getSlugDizipal: getSlugDizipal, getDizipalLinks: getDizipalLinks };
