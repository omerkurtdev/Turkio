const { addonBuilder } = require("stremio-addon-sdk");
const { getMetaName, getSlug, getLinks, getEmbeds, getSrc } = require('./tmdb.js');
const manifest = require("./manifest.json")
const builder = new addonBuilder(manifest);

async function getStreamDataArray(titles, urls) {
  try {
    const streams = titles.map((title, index) => {
      return {
        "behaviorHints": {
          "notWebReady": true,
          "proxyHeaders": {
            "request": {
              "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
              "Referer": "https://vidmoly.to/",
            }
          }
        },
        "title": "Hdfilmcehennemi \n" + title + "\n🇹🇷",
        "url": urls[index]
      };
    });

    return { streams };
  } catch (error) {
    console.error('Error fetching stream data:', error);
    return { streams: [] }; // Return an empty array if there's an error
  }
}

builder.defineStreamHandler(async ({ type, id }) => {
  console.log("Request for streams: " + type + " " + id);

  try {
    // main fonksiyonunu çağırarak TMDb bilgilerini alın
    const tmdbInfo = await getMetaName(id);
    console.log('TMDb Bilgisi:', tmdbInfo);

    // Burada getFilm fonksiyonunu çağırabilir ve sonuçları işleyebilirsiniz
    const getSlugs = await getSlug(tmdbInfo);
    const getlink = await getLinks(getSlugs);
    const getEmbed = await getEmbeds(getlink);
    const getSrcs = await getSrc(getEmbed);



    
    console.log(getSrcs.srcVideo);

    // Example usage of getStreamDataArray with hardcoded stream
    const titles = getSrcs.players;
    const urls = getSrcs.srcVideo;

    const dynamicStreams = await getStreamDataArray(titles, urls);
    
    return Promise.resolve(dynamicStreams);
  } catch (error) {
    console.error('Error fetching stream data:', error);
    return Promise.resolve({ streams: [] }); // Return an empty array if there's an error
  }
});

module.exports = builder.getInterface();
