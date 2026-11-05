import type { ImageMetadata } from 'astro';
const photos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/photos/*.{jpg,jpeg,webp,JPG,JPEG,WEBP}');
export async function imageFor(src: string): Promise<ImageMetadata> {
  const loader = photos[src];
  if (!loader) throw new Error('Image introuvable : ' + src);
  return (await loader()).default;
}
