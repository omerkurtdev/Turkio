var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var needle = require("needle");
var cheerio = require("cheerio");
var apiKey = "a1ef2874782b2fbd09891a4ac821df9a";
var getMetaName = function (id) {
    return new Promise(function (resolve, reject) {
        var parts = id.split(":");
        var imdb = parts[0];
        var sezon = parts[1];
        var episode = parts[2];
        var apiUrl = "https://api.themoviedb.org/3/find/".concat(imdb, "?api_key=").concat(apiKey, "&external_source=imdb_id");
        needle.get(apiUrl, function (err, resp, body) {
            if (err) {
                console.error("Error converting IMDb to TMDb:", err);
                reject(err);
                return;
            }
            if (resp.statusCode === 200 &&
                body &&
                body.movie_results &&
                body.movie_results.length > 0) {
                var tmdbId = {
                    type: "movie",
                    title: body.movie_results[0].title,
                    imdb: imdb,
                };
                console.log(tmdbId);
                resolve(tmdbId);
            }
            else if (resp.statusCode === 200 &&
                body &&
                body.tv_results &&
                body.tv_results.length > 0) {
                var tmdbId = {
                    type: "series",
                    title: body.tv_results[0].name,
                    imdb: imdb,
                    sezon: sezon,
                    episode: episode,
                };
                console.log(tmdbId);
                resolve(tmdbId);
            }
            else {
                reject(new Error("Failed to convert IMDb to TMDb. Status code: ".concat(resp.statusCode)));
            }
        });
    });
};
var getSlug = function (params) {
    return new Promise(function (resolve, reject) {
        var apiUrl = "https://www.hdfilmcehennemi.de/search";
        var postData = { query: params.imdb };
        var customHeaders = {
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        };
        needle.post(apiUrl, postData, { headers: customHeaders }, function (err, resp, body) {
            var _a, _b;
            if (err) {
                console.error("getFilm için POST isteği yapma hatasi:", err);
                reject(err);
                return;
            }
            console.log("POST İsteği Sonucu:", body);
            if (resp.statusCode === 200) {
                try {
                    // JSON formatındaki yanıtı parse et
                    var results = JSON.parse(body);
                    params.slug = (_b = (_a = results.result[0]) === null || _a === void 0 ? void 0 : _a.slug) !== null && _b !== void 0 ? _b : "yok";
                    // Gerçek yanıt formatına göre bunu ayarlayın
                    console.log("getFilm Result:", params.slug);
                    resolve(params);
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
var getLinks = function (params) {
    return new Promise(function (resolve, reject) {
        params.links = [];
        params.players = [];
        if (params.type === "movie") {
            var filmUrl = "http://127.0.0.1:11470/proxy/d=https%3A%2F%2Fwww.hdfilmcehennemi.de&h=referer:https%3A%2F%2Fwww.hdfilmcehennemi.de/".concat(params.slug);
            needle.get(filmUrl, function (err, resp, body) {
                var _a;
                if (err) {
                    console.error("Error converting IMDb to TMDb:", err);
                    reject(err);
                    return;
                }
                var $ = cheerio.load(body);
                $("body > div.main-container.container.p-0.mt-0.mt-lg-5 > div > main > div > div > div > div:nth-child(7) > div.card-body.p-0.pt-2.pb-2 > nav > a").each(function (index, element) {
                    var _a;
                    var href = $(element).attr("href");
                    if (href !== "#") {
                        (_a = params.links) === null || _a === void 0 ? void 0 : _a.push(href);
                    }
                });
                var anchorTexts = [];
                console.log(params.links);
                var player = $("iframe").attr("data-src");
                var elementValues = [];
                $("body > div.main-container.container.p-0.mt-0.mt-lg-5 > div > main > div > div > div > div:nth-child(7) > div.card-body.p-0.pt-2.pb-2 > nav a").each(function (index, element) {
                    var _a;
                    var value = $(element).text();
                    var cleanedText = value
                        .trim()
                        .replace(/Fragman|Sinema Modu|\.fa-secondary\{opacity:\.4\}/g, "");
                    // You can directly add the cleaned text.
                    if (cleanedText) {
                        (_a = params.players) === null || _a === void 0 ? void 0 : _a.push(cleanedText);
                    }
                });
                if (player !== undefined) {
                    (_a = params.embedPlayer) === null || _a === void 0 ? void 0 : _a.push(player);
                }
                resolve(params);
            });
        }
        else if (params.type === "series") {
            var diziUrl = "http://127.0.0.1:11470/proxy/d=https%3A%2F%2Fwww.hdfilmcehennemi.de&h=referer:https%3A%2F%2Fwww.hdfilmcehennemi.de/dizi/".concat(params.slug, "/sezon-").concat(params.sezon, "/bolum-").concat(params.episode);
            needle.get(diziUrl, function (err, resp, body) {
                if (err) {
                    console.error("Error converting IMDb to TMDb:", err);
                    reject(err);
                    return;
                }
                var $ = cheerio.load(body);
                $("body > div.main-container.container.p-0.mt-0.mt-lg-5 > div > main > div > div > div > div:nth-child(7) > div.card-body.p-0.pt-2.pb-2 > nav > a").each(function (index, element) {
                    var _a;
                    var href = $(element).attr("href");
                    if (href !== "#") {
                        (_a = params.links) === null || _a === void 0 ? void 0 : _a.push(href);
                    }
                });
                console.log(params.links);
                $("body > div.main-container.container.p-0.mt-0.mt-lg-5 > div > main > div > div > div > div:nth-child(7) > div.card-body.p-0.pt-2.pb-2 > nav a").each(function (index, element) {
                    var _a;
                    var value = $(element).text();
                    var cleanedText = value
                        .trim()
                        .replace(/Fragman|Sinema Modu|\.fa-secondary\{opacity:\.4\}/g, "");
                    // You can directly add the cleaned text.
                    if (cleanedText) {
                        (_a = params.players) === null || _a === void 0 ? void 0 : _a.push(cleanedText);
                    }
                });
                console.log(params.players);
                resolve(params);
            });
        }
        else {
            reject(new Error("Invalid type"));
        }
    });
};
var getEmbeds = function (params) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var _i, _a, link, response, newLocation, $, player, error_1, error_2;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            params.embedPlayer = [];
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 8, , 9]);
                            if (!params.links) return [3 /*break*/, 7];
                            _i = 0, _a = params.links;
                            _c.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 7];
                            link = _a[_i];
                            _c.label = 3;
                        case 3:
                            _c.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, needle('get', link, { follow_max: 5 })];
                        case 4:
                            response = _c.sent();
                            // Check if the response is a redirect
                            if (response.statusCode === 301 || response.statusCode === 302) {
                                newLocation = response.headers['location'];
                                console.log("Redirecting to: ".concat(newLocation));
                                // You may want to update 'link' to the new location
                            }
                            $ = cheerio.load(response.body);
                            player = $('iframe').attr('data-src');
                            (_b = params.embedPlayer) === null || _b === void 0 ? void 0 : _b.push(player);
                            console.log("Successful request: ".concat(link, ", Status Code: ").concat(response.statusCode));
                            return [3 /*break*/, 6];
                        case 5:
                            error_1 = _c.sent();
                            console.error("Error occurred: ".concat(link));
                            return [3 /*break*/, 6];
                        case 6:
                            _i++;
                            return [3 /*break*/, 2];
                        case 7:
                            console.log(params.embedPlayer);
                            resolve(params);
                            return [3 /*break*/, 9];
                        case 8:
                            error_2 = _c.sent();
                            reject(error_2);
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var getSrc = function (params) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var promises, error_3;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            params.srcVideo = [];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            if (!params.embedPlayer) return [3 /*break*/, 3];
                            promises = params.embedPlayer.map(function (link) { return __awaiter(_this, void 0, void 0, function () {
                                var headers, response, regexPattern, match, urlParts, parts, response, $, selectedElement, regex, matchss, decodedString, error_4;
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _c.trys.push([0, 5, , 6]);
                                            if (!link.startsWith("https://vidmoly.to/embed")) return [3 /*break*/, 2];
                                            headers = {
                                                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                                                'accept-language': 'en-US,en;q=0.8',
                                                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Brave";v="120"',
                                                'sec-ch-ua-mobile': '?0',
                                                'sec-ch-ua-platform': '"Linux"',
                                                'sec-fetch-dest': 'iframe',
                                                'sec-fetch-mode': 'navigate',
                                                'sec-fetch-site': 'cross-site',
                                                'sec-gpc': '1',
                                                'upgrade-insecure-requests': '1',
                                                cookie: 'cf_clearance=gOHA.xruGRSAPdeAIHsA7QT.HPUaePy95lysHMPTG5o-1702927700-0-1-84a37b5c.795771af.2f674833-0.2.1702927700',
                                                Referer: 'https://www.hdfilmcehennemi.de/',
                                                'Referrer-Policy': 'strict-origin-when-cross-origin',
                                            };
                                            return [4 /*yield*/, needle('get', link, { headers: headers })];
                                        case 1:
                                            response = _c.sent();
                                            if (response.statusCode === 200) {
                                                regexPattern = /(https:\/\/[^"]+\.m3u8)/;
                                                match = regexPattern.exec(response.body);
                                                urlParts = match === null || match === void 0 ? void 0 : match[0].split(',');
                                                if (urlParts) {
                                                    (_a = params.srcVideo) === null || _a === void 0 ? void 0 : _a.push((urlParts === null || urlParts === void 0 ? void 0 : urlParts[0]) + (urlParts === null || urlParts === void 0 ? void 0 : urlParts[1]) + "/index-v1-a1.m3u8");
                                                }
                                            }
                                            else {
                                                console.error('Error:', response.statusCode);
                                                throw new Error("HTTP request failed with status code: ".concat(response.statusCode));
                                            }
                                            _c.label = 2;
                                        case 2:
                                            if (!link.startsWith("https://www.hdfilmcehennemi.de/playerr/")) return [3 /*break*/, 4];
                                            parts = link ? link.split('/') : [];
                                            return [4 /*yield*/, needle('get', "http://127.0.0.1:11470/proxy/d=https%3A%2F%2Fwww.hdfilmcehennemi.de&h=referer:https%3A%2F%2Fwww.hdfilmcehennemi.de/playerr/".concat(parts[4]))];
                                        case 3:
                                            response = _c.sent();
                                            if (response.statusCode === 200) {
                                                $ = cheerio.load(response.body);
                                                selectedElement = $('script:nth-child(7)').html();
                                                regex = /(?:')([aA-Zz])\w+[A-Z]/;
                                                matchss = regex.exec(selectedElement);
                                                if (matchss) {
                                                    decodedString = Buffer.from(matchss[0], 'base64').toString('utf-8');
                                                    (_b = params.srcVideo) === null || _b === void 0 ? void 0 : _b.push(decodedString);
                                                }
                                                else {
                                                    console.error('No match found or match[0] is undefined.');
                                                }
                                            }
                                            else {
                                                console.error('Error:', response.statusCode);
                                                throw new Error("HTTP request failed with status code: ".concat(response.statusCode));
                                            }
                                            _c.label = 4;
                                        case 4: return [3 /*break*/, 6];
                                        case 5:
                                            error_4 = _c.sent();
                                            console.error("Error occurred:");
                                            // Re-throw the error to ensure it propagates to Promise.allSettled
                                            throw error_4;
                                        case 6: return [2 /*return*/];
                                    }
                                });
                            }); });
                            // Wait for all promises to settle (resolve or reject)
                            return [4 /*yield*/, Promise.allSettled(promises)];
                        case 2:
                            // Wait for all promises to settle (resolve or reject)
                            _a.sent();
                            console.log(params.srcVideo);
                            resolve(params);
                            _a.label = 3;
                        case 3: return [3 /*break*/, 5];
                        case 4:
                            error_3 = _a.sent();
                            reject(error_3);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
module.exports = { getMetaName: getMetaName, getSlug: getSlug, getLinks: getLinks, getEmbeds: getEmbeds, getSrc: getSrc };
