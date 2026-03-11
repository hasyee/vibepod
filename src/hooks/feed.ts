import { useApi } from './api';
import { useFeedCache } from './feedCache';

const FEED_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 1 day

export function useFeed() {
  const api = useApi();
  const feedCache = useFeedCache();

  async function getFeed(feedUrl: string): Promise<string> {
    const meta = await feedCache.getMeta(feedUrl);
    const isExpired =
      !meta || Date.now() - new Date(meta.updatedAt).getTime() > FEED_EXPIRATION_MS;

    if (!isExpired) {
      const cached = await feedCache.get(feedUrl);
      if (cached) return cached;
    }

    const freshContent = await api.fetchFeed(feedUrl);
    await feedCache.set(feedUrl, freshContent);
    return freshContent;
  }

  return { getFeed };
}
