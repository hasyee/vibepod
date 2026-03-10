import { useApi } from './api';
import { useFeedCache } from './feedCache';

export function useFeed() {
  const api = useApi();
  const feedCache = useFeedCache();

  async function getFeed(feedUrl: string): Promise<string> {
    const cached = await feedCache.get(feedUrl);
    if (cached) return cached;
    return api.fetchFeed(feedUrl);
  }

  return { getFeed };
}
