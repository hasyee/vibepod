export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

export function parseDuration(value: string): number {
  if (!value) return 0;
  const parts = value.split(':').map(Number);
  if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1000;
  return Number(value) * 1000;
}
