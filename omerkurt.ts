var needle = require("needle");
var cheerio = require("cheerio");
type TmdbId = {
  type: "movie" | "series";
  title: string;
  imdb: string;
  sezon?: string;
  episode?: string;
  slug?: string;
  embedPlayer?: Array<string>;
  provider?: string;
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

var getFilm = (params: TmdbId): Promise<TmdbId> => {
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
            params.slug = results.result[0]?.slug || null;
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

var getEmbed = (params: TmdbId): Promise<TmdbId> => {
  return new Promise((resolve, reject) => {
    if (params.type === "movie") {
      params.embedPlayer = [];
      const filmUrl: string = `http://127.0.0.1:11470/proxy/d=https%3A%2F%2Fwww.hdfilmcehennemi.de&h=referer:https%3A%2F%2Fwww.hdfilmcehennemi.de/${params.slug}`;
      needle.get(filmUrl, (err: any, resp: any, body: any) => {
        if (err) {
          console.error("Error converting IMDb to TMDb:", err);
          reject(err);
          return;
        } else {
          var $ = cheerio.load(body);
          const elements = $(
            "body > div.main-container.container.p-0.mt-0.mt-lg-5 > div > main > div > div > div > div:nth-child(7) > div.card-body.p-0.pt-2.pb-2 > nav"
          );
          const hrefValues: any[] = [];
          $(
            "body > div.main-container.container.p-0.mt-0.mt-lg-5 > div > main > div > div > div > div:nth-child(7) > div.card-body.p-0.pt-2.pb-2 > nav > a"
          ).each((index: any, element: HTMLElement) => {
            const href = $(element).attr("href");
            if (href !== "#") {
              hrefValues.push(href);
            }
          });
          const anchorTexts = [];
          console.log(hrefValues);
          const player: string = $("iframe").attr("data-src");
          const elementValues: any[] = [];

          $(
            "body > div.main-container.container.p-0.mt-0.mt-lg-5 > div > main > div > div > div > div:nth-child(7) > div.card-body.p-0.pt-2.pb-2 > nav a"
          ).each((index: any, element: HTMLElement) => {
            const value = $(element).text();
            const cleanedText = value
              .trim()
              .replace(
                /Fragman|Sinema Modu|\.fa-secondary\{opacity:\.4\}/g,
                ""
              );

            // Temizlenmiş metni doğrudan ekleyebilirsiniz.
            if (cleanedText) {
              elementValues.push(cleanedText);
            }
          });
          console.log(elementValues);

          if (player !== undefined) {
            params.embedPlayer?.push(player);
          }
        }
      });
    } else if (params.type === "series") {
      const diziUrl: string = `http://127.0.0.1:11470/proxy/d=https%3A%2F%2Fwww.hdfilmcehennemi.de&h=referer:https%3A%2F%2Fwww.hdfilmcehennemi.de/dizi/${params.slug}/sezon-${params.sezon}/bolum-${params.episode}`;
      needle.get(diziUrl, (err: any, resp: any, body: any) => {
        if (err) {
          console.error("Error converting IMDb to TMDb:", err);
          reject(err);
          return;
        } else {
          var $ = cheerio.load(body);
          const elements = $(
            "body > div.main-container.container.p-0.mt-0.mt-lg-5 > div > main > div > div > div > div:nth-child(7) > div.card-body.p-0.pt-2.pb-2 > nav"
          );
          const hrefValues: any[] = [];
          $(
            "body > div.main-container.container.p-0.mt-0.mt-lg-5 > div > main > div > div > div > div:nth-child(7) > div.card-body.p-0.pt-2.pb-2 > nav > a"
          ).each((index: any, element: HTMLElement) => {
            const href = $(element).attr("href");
            if (href !== "#") {
              hrefValues.push(href);
            }
          });
          const anchorTexts = [];
          console.log(hrefValues);
          const player: string = $("iframe").attr("data-src");
          const elementValues: any[] = [];

          $(
            "body > div.main-container.container.p-0.mt-0.mt-lg-5 > div > main > div > div > div > div:nth-child(7) > div.card-body.p-0.pt-2.pb-2 > nav a"
          ).each((index: any, element: HTMLElement) => {
            const value = $(element).text();
            const cleanedText = value
              .trim()
              .replace(
                /Fragman|Sinema Modu|\.fa-secondary\{opacity:\.4\}/g,
                ""
              );

            // Temizlenmiş metni doğrudan ekleyebilirsiniz.
            if (cleanedText) {
              elementValues.push(cleanedText);
            }
          });
          console.log(elementValues);

          if (player !== undefined) {
            params.embedPlayer?.push(player);
          }
        }
      });
    }
  });
};

module.exports = { getMetaName, getFilm, getEmbed };
