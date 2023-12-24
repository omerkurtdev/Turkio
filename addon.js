const { addonBuilder } = require("stremio-addon-sdk");
const { getMetaName, getSlug, getLinks, getEmbeds, getSrc } = require('./tmdb.js');
const { getSlugDizipal, getDizipalLinks } = require('./dizipal.js');

const manifest = require("./manifest.json")
const builder = new addonBuilder(manifest);

async function getStreamDataArray(titles, urls, provider) {
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
        "title": provider+ "\n" + title + "\n🇹🇷",
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


    const getSlugDizipalUrl = await getSlugDizipal(tmdbInfo);
    const dizipalLinks = await getDizipalLinks(getSlugDizipalUrl);
    const dizipalLink=dizipalLinks.srcVideo
    const dizipalTitle=dizipalLinks.players
    const dizipalProvider=dizipalLinks.provider

    const dynamicStreamsDizipal = await getStreamDataArray(dizipalTitle, dizipalLink,dizipalProvider);

    // Example usage of getStreamDataArray with hardcoded stream
    const titles = getSrcs.players;
    const urls = getSrcs.srcVideo;
    const providerHd = getSrcs.provider;

    const dynamicStreams = await getStreamDataArray(titles, urls, providerHd);
    
    return Promise.resolve(dynamicStreams,dynamicStreamsDizipal);
  } catch (error) {
    console.error('Error fetching stream data:', error);
    return Promise.resolve({ streams: [] }); // Return an empty array if there's an error
  }
});

module.exports = builder.getInterface();
