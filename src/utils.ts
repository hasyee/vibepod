import type { Episode, Podcast } from './types';

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function parseDuration(value: string): number {
  if (!value) return 0;
  const parts = value.split(':').map(Number);
  if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1000;
  return Number(value) * 1000;
}

export function parsePodcast(feedUrl: string, text: string): Podcast | null {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const channel = doc.querySelector('channel');
  if (!channel) return null;
  const channelImage = channel.getElementsByTagName('itunes:image')[0];
  const itunesAuthor = channel.getElementsByTagName('itunes:author')[0];
  const itunesCategory = channel.getElementsByTagName('itunes:category')[0];
  return {
    feedUrl,
    title: channel.querySelector('title')?.textContent ?? '',
    author: itunesAuthor?.textContent ?? channel.querySelector('managingEditor')?.textContent ?? '',
    artworkUrl: channelImage?.getAttribute('href') ?? '',
    genre: itunesCategory?.getAttribute('text') ?? '',
    trackCount: channel.querySelectorAll('item').length,
    description: channel.querySelector('description')?.textContent ?? ''
  };
}

export function parseEpisodes(feedUrl: string, text: string): Episode[] {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const channel = doc.querySelector('channel');
  const podcastTitle = channel?.querySelector('title')?.textContent ?? '';
  const channelImage = channel?.getElementsByTagName('itunes:image')[0];
  const podcastArtworkUrl = channelImage?.getAttribute('href') ?? '';
  return Array.from(doc.querySelectorAll('item')).map((item): Episode => {
    const enclosure = item.querySelector('enclosure');
    const itunesImage = item.getElementsByTagName('itunes:image')[0];
    const itunesDuration = item.getElementsByTagName('itunes:duration')[0];
    const audioUrl = enclosure?.getAttribute('url') ?? '';
    return {
      title: item.querySelector('title')?.textContent ?? '',
      description: item.querySelector('description')?.textContent ?? '',
      duration: parseDuration(itunesDuration?.textContent ?? ''),
      releaseDate: item.querySelector('pubDate')?.textContent ?? '',
      artworkUrl: itunesImage?.getAttribute('href') ?? '',
      podcastTitle,
      feedUrl,
      podcastArtworkUrl,
      audioUrl
    };
  });
}
