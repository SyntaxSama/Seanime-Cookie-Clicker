/// <reference path="./onlinestream-provider.d.ts" />
/// <reference path="./core.d.ts" />

// Video type should be m3u8 based on 2anime player

declare type VideoSourceType = "mp4" | "m3u8";

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
      headers: { Referer: "https://2anime.xyz" },
    };

    try {
      const res = await fetch(episode.url);
      const html = await res.text();
      const doc = LoadDoc(html);

      const scriptTag = doc('script').filter((_, el) => {
        return el.text().includes("eval(");
      }).first();

      const scriptContent = scriptTag.text();

      if (!scriptContent) {
        throw new Error("No packed script found in embed.");
      }

      // Try to eval inside a safer context
      const m3u8Match = scriptContent.match(/file\s*:\s*"(https?:\\/\\/[^\"]+\.m3u8)"/);

      if (m3u8Match && m3u8Match[1]) {
        const videoUrl = m3u8Match[1].replace(/\\/g, "");

        result.videoSources.push({
          url: videoUrl,
          type: "m3u8",
          quality: "default",
          subtitles: [],
        });
      } else {
        console.warn("Failed to extract m3u8 link, fallback to iframe.");
        result.videoSources.push({
          url: episode.url,
          type: "m3u8",
          quality: "default",
          subtitles: [],
        });
      }

      return result;
    } catch (err) {
      console.error("Find server error:", err);
      throw new Error("Failed to load episode stream.");
    }
  }
}

const provider = new Provider();
