/// <reference path="./onlinestream-provider.d.ts" />
/// <reference path="./core.d.ts" />

class Provider {
  api = "https://animeapi.skin";

  getSettings(): Settings {
    return {
      episodeServers: ["default"],
      supportsDub: true,
    };
  }

  async search(opts: SearchOptions): Promise<SearchResult[]> {
    const query = encodeURIComponent(opts.query.trim());
    const url = `${this.api}/search?q=${query}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const results: SearchResult[] = [];

      if (!data || !Array.isArray(data)) {
        return [];
      }

      for (const item of data) {
        results.push({
          id: item.title, 
          title: item.title,
          url: item.embed_url, 
          subOrDub: "sub",
        });
      }

      return results;
    } catch (err) {
      console.error("Search error:", err);
      return [];
    }
  }

  async findEpisodes(id: string): Promise<EpisodeDetails[]> {
    const title = encodeURIComponent(id.trim());
    const url = `${this.api}/episodes?title=${title}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const episodes: EpisodeDetails[] = [];

      if (!data || !Array.isArray(data)) {
        return [];
      }

      for (let i = 0; i < data.length; i++) {
        const ep = data[i];
        episodes.push({
          id: ep.link_url, 
          number: parseInt(ep.episode) || i + 1,
          title: `Episode ${ep.episode}`,
          url: ep.embed_url, 
        });
      }

      return episodes;
    } catch (err) {
      console.error("Find episodes error:", err);
      return [];
    }
  }

  async findEpisodeServer(episode: EpisodeDetails, server: string): Promise<EpisodeServer> {
    const result: EpisodeServer = {
      videoSources: [],
      server: "default",
      headers: { Referer: this.api },
    };

    result.videoSources.push({
      url: episode.url,
      type: "embed",
      quality: "default",
      subtitles: [],
    });

    return result;
  }
}

const provider = new Provider();
