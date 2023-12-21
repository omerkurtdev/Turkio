var needle = require("needle");
var cheerio = require("cheerio");
type TmdbId = {
  type: "movie" | "series";
  title: string;
  imdb: string;
  sezon?: string;
  episode?: string;
  slug?: string;
  players?:Array<string>;
  links?:Array<string>;
  embedPlayer?: Array<string>;
  provider?: string;
  srcVideo?:Array<string>;
};
const apiKey: string = "a1ef2874782b2fbd09891a4ac821df9a";

var getMetaName = (id: string): Promise<TmdbId> => {
  return new Promise((resolve, reject) => {
    var parts = id.split(":");
    var imdb = parts[0];
    var sezon = parts[1];
    var episode = parts[2];
    var apiUrl = `https://api.themoviedb.org/3/find/${imdb}?api_key=${apiKey}&external_source=imdb_id`;

    needle.get(apiUrl, (err: any, resp: any, body: any) => {
      if (err) {
        console.error("Error converting IMDb to TMDb:", err);
        reject(err);
        return;
      }

      if (
        resp.statusCode === 200 &&
        body &&
        body.movie_results &&
        body.movie_results.length > 0
      ) {
        var tmdbId: TmdbId = {
          type: "movie",
          title: body.movie_results[0].title,
          imdb: imdb,
        };
        console.log(tmdbId);
        resolve(tmdbId);
      } else if (
        resp.statusCode === 200 &&
        body &&
        body.tv_results &&
        body.tv_results.length > 0
      ) {
        var tmdbId: TmdbId = {
          type: "series",
          title: body.tv_results[0].name,
          imdb: imdb,
          sezon: sezon,
          episode: episode,
        };
        console.log(tmdbId);

        resolve(tmdbId);
      } else {
        reject(
          new Error(
            `Failed to convert IMDb to TMDb. Status code: ${resp.statusCode}`
          )
        );
      }
    });
  });
};

var getSlug = (params: TmdbId): Promise<TmdbId> => {
  return new Promise((resolve, reject) => {
    const apiUrl: string = "https://www.hdfilmcehennemi.de/search";
    var postData = { query: params.imdb };
    var customHeaders = {
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    };

    needle.post(
      apiUrl,
      postData,
      { headers: customHeaders },
      (err: any, resp: any, body: any) => {
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
            params.slug = results.result[0]?.slug ?? "yok";
            // Gerçek yanıt formatına göre bunu ayarlayın
            console.log("getFilm Result:", params.slug);

            resolve(params);
          } catch (parseError) {
            console.error("JSON parse hatası:", parseError);
            reject(parseError);
          }
        } else {
          reject(new Error(`Film alinamadi. Durum kodu: ${resp.statusCode}`));
        }
      }
    );
  });
};
const getLinks = (params: TmdbId): Promise<TmdbId> => {
  return new Promise((resolve, reject) => {
    params.links = [];
    params.players = [];
    if (params.type === "movie") {
      const filmUrl: string = `https://www.hdfilmcehennemi.de/${params.slug}/`;

      needle.get(filmUrl, (err: any, resp: any, body: any) => {
        if (err) {
          console.error("Error converting IMDb to TMDb:", err);
          reject(err);
          return;
        }

        const $ = cheerio.load(body);
        $("body > div.main-container.container.p-0.mt-0.mt-lg-5 > div > main > div > div > div > div:nth-child(7) > div.card-body.p-0.pt-2.pb-2 > nav > a").each((index: any, element: HTMLElement) => {
          const href = $(element).attr("href");
          if (href !== "#") {
            params.links?.push(href);
          }
        });

        const anchorTexts: any[] = [];
        console.log(params.links);

        const player: string = $("iframe").attr("data-src");
        const elementValues: any[] = [];

        $("body > div.main-container.container.p-0.mt-0.mt-lg-5 > div > main > div > div > div > div:nth-child(7) > div.card-body.p-0.pt-2.pb-2 > nav a").each((index: any, element: HTMLElement) => {
          const value = $(element).text();
          const cleanedText = value
            .trim()
            .replace(/Fragman|Sinema Modu|\.fa-secondary\{opacity:\.4\}/g, "");

          // You can directly add the cleaned text.
          if (cleanedText) {
            params.players?.push(cleanedText);
          }
        });


        if (player !== undefined) {
          params.embedPlayer?.push(player);
        }

        resolve(params);
      });
    } 
    else if(params.type === "series"){
    const diziUrl: string = `https://www.hdfilmcehennemi.de/dizi/${params.slug}/sezon-${params.sezon}/bolum-${params.episode}/`;
    needle.get(diziUrl, (err: any, resp: any, body: any) => {
      if (err) {
        console.error("Error converting IMDb to TMDb:", err);
        reject(err);
        return;
      }
      const $ = cheerio.load(body);
      $("body > div.main-container.container.p-0.mt-0.mt-lg-5 > div > main > div > div > div > div:nth-child(7) > div.card-body.p-0.pt-2.pb-2 > nav > a").each((index: any, element: HTMLElement) => {
        const href = $(element).attr("href");
        if (href !== "#") {
          params.links?.push(href);
        }
      });
      console.log(params.links);
      $("body > div.main-container.container.p-0.mt-0.mt-lg-5 > div > main > div > div > div > div:nth-child(7) > div.card-body.p-0.pt-2.pb-2 > nav a").each((index: any, element: HTMLElement) => {
        const value = $(element).text();
        const cleanedText = value
          .trim()
          .replace(/Fragman|Sinema Modu|\.fa-secondary\{opacity:\.4\}/g, "");

        // You can directly add the cleaned text.
        if (cleanedText) {
          params.players?.push(cleanedText);
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

const getEmbeds = async (params:TmdbId) => {
  return new Promise(async (resolve, reject) => {
    params.embedPlayer = [];
    try {
      if (params.links) {
        for (const link of params.links) {
          try {
            const response = await needle('get', link, { follow_max: 5 });

            // Check if the response is a redirect
            if (response.statusCode === 301 || response.statusCode === 302) {
              const newLocation = response.headers['location'];
              console.log(`Redirecting to: ${newLocation}`);
              // You may want to update 'link' to the new location
            }

            const $ = cheerio.load(response.body);
            const player = $('iframe').attr('data-src');
            params.embedPlayer?.push(player);
            console.log(`Successful request: ${link}, Status Code: ${response.statusCode}`);
            // Perform your operations with the 'response' here
          } catch (error) {
            console.error(`Error occurred: ${link}`);
            // Handle errors here
            reject(error); // Make sure to reject the promise in case of an error
          }
        }
      }
      console.log(params.embedPlayer);
      resolve(params);
    } catch (error) {
      reject(error);
    }
  });
};
const getSrc = async (params: TmdbId): Promise<TmdbId> => {
  return new Promise(async (resolve, reject) => {
    params.srcVideo = [];
    try {
      if (params.embedPlayer) {
        const promises = params.embedPlayer.map(async (link) => {
          try {
            if (link.startsWith("https://vidmoly.to/embed")) {
              // Define the headers
              const headers = {
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

              // Make the GET request using needle
              const response = await needle('get', link, { headers });

              if (response.statusCode === 200) {
                const regexPattern = /(https:\/\/[^"]+\.m3u8)/;
                const match: Array<string> | null = regexPattern.exec(response.body);
                const urlParts = match?.[0].split(',');
                if (urlParts) {
                  params.srcVideo?.push(urlParts?.[0] + urlParts?.[1] + "/index-v1-a1.m3u8");
                }
              } else {
                console.error('Error:', response.statusCode);
                throw new Error(`HTTP request failed with status code: ${response.statusCode}`);
              }
            }

            if (link.startsWith("https://www.hdfilmcehennemi.de/playerr/")) {
              const parts = link ? link.split('/') : [];
              const headers = {
                Referer: "https://www.hdfilmcehennemi.de/",
                'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                // Other headers as needed
              };
              const response = await needle('get', `https://www.hdfilmcehennemi.de/playerr/${parts[4]}/`, {headers});

              if (response.statusCode === 200) {
                const $ = cheerio.load(response.body);
                const selectedElement = $('script:nth-child(7)').html();
                const regex = /(?:')([aA-Zz])\w+[A-Z]/;
                const matchss = regex.exec(selectedElement);

                if (matchss) {
                  const decodedString = Buffer.from(matchss[0], 'base64').toString('utf-8');
                  params.srcVideo?.push(decodedString);
                } else {
                  console.error('No match found or match[0] is undefined.');
                }
              } else {
                console.error('Error:', response.statusCode);
                throw new Error(`HTTP request failed with status code: ${response.statusCode}`);
              }
            }
          } catch (error) {
            console.error(`Error occurred:`);
            // Re-throw the error to ensure it propagates to Promise.allSettled
            throw error;
          }
        });

        // Wait for all promises to settle (resolve or reject)
        await Promise.allSettled(promises);

        console.log(params.srcVideo);
        resolve(params);
      }
    } catch (error) {
      reject(error);
    }
  });
};



module.exports = { getMetaName, getSlug, getLinks, getEmbeds, getSrc };
