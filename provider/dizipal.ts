var needle = require("needle");
const m3u8Parser = require('m3u8-parser');
var cheerio = require("cheerio");
import { TmdbId } from './tmdb';

var getSlugDizipal = (params: TmdbId): Promise<TmdbId> => {
    return new Promise((resolve, reject) => {
      const apiUrl: string = "https://dizipal730.com/api/search-autocomplete";
      var postData = { query: params.originalTitle};
      var customHeaders = {
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      };
  console.log(params.originalTitle)
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
              var results:any = JSON.stringify(body);
              const regex = /(?<="url":")([^"]+)/g;
              const eslesmeler = results.match(regex);
              params.dizipalSlug=eslesmeler[0]
              console.log(eslesmeler[0])
              if(eslesmeler === null){
              const slug  = "/dizi/" + params.originalTitle?.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/\s+/g, '-'); // Boşlukları tire ile değiştir
              params.dizipalSlug=slug;
              resolve(params)    
              }             
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

  const getDizipalLinks = (params: TmdbId): Promise<TmdbId> => {
    return new Promise((resolve, reject) => {
      params.links = [];
      params.players = [];
      if (params.type === "series") {
        const filmUrl: string = `https://dizipal730.com${params.dizipalSlug}/sezon-${params.sezon}/bolum-${params.episode}`;

        needle.get(filmUrl, (err: any, resp: any, body: any) => {
          const $ = cheerio.load(body);
          const player: string = $("iframe").attr("data-src");

         
          console.log(player);
          const headers = {
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
            .then((response: { body: any; }) => {
              const regex = /((\w+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]`#|]+)/g;
              const eslesmeler = response.body.match(regex);
              needle('get', eslesmeler[2], (error: any, response: { statusCode: number; }, body: any) => {
                if (!error && response.statusCode == 200) {
                  const decodedString = body.toString("utf-8");
                  console.log(decodedString);
                  const parser = new m3u8Parser.Parser();
                  parser.push(decodedString);
                  parser.end();
                  const parsedData = parser.manifest;
                  parsedData.playlists.forEach((playlist: { uri: any; attributes: { RESOLUTION: { width: any; height: any; }; }; }) => {
                    params.provider="Dizipal"
                    params.srcVideo?.push(playlist.uri);
                    params.players?.push(playlist.attributes.RESOLUTION.width+"x"+playlist.attributes.RESOLUTION.height+params.title);

                    console.log(`Stream URI: ${playlist.uri}`);
                    console.log(`Resolution: ${playlist.attributes.RESOLUTION.width}x${playlist.attributes.RESOLUTION.height}`);
                    resolve(params);
                  });
                  
                  
                } else {
                  console.error(`Error: ${error}`);
                }
              });

            })
            .catch((error: any) => {
              console.error(error);
            });


        
  
  })}
    });
  };

  module.exports = { getSlugDizipal, getDizipalLinks };
