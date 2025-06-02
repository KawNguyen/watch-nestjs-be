export function extractPublicIdFromUrl(url: string): string {
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];
  return fileName.split('.')[0];
}
