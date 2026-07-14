import { supabase } from './supabase';

export type GalleryItem = {
  id: string;
  imagePath: string;
  title: string;
  location: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
};

export type GalleryDisplayItem = {
  id: string;
  img: string;
  caption: string;
  location: string;
  widthClass: string;
};

const galleryWidths = [
  'w-[280px] sm:w-[380px] md:w-[480px]',
  'w-[240px] sm:w-[320px] md:w-[400px]',
  'w-[300px] sm:w-[420px] md:w-[520px]',
  'w-[260px] sm:w-[360px] md:w-[450px]',
  'w-[320px] sm:w-[450px] md:w-[560px]',
];

export function getGalleryImageUrl(imagePath: string) {
  if (!supabase) return '';
  return supabase.storage.from('gallery').getPublicUrl(imagePath).data.publicUrl;
}

export async function fetchPublishedGalleryItems(): Promise<GalleryDisplayItem[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('gallery_items')
    .select('id, image_path, title, location, sort_order, is_published, created_at')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((item, index) => ({
    id: item.id,
    img: getGalleryImageUrl(item.image_path),
    caption: item.title,
    location: item.location ?? 'Ved Trust',
    widthClass: galleryWidths[index % galleryWidths.length],
  }));
}

export function toGalleryItem(row: {
  id: string;
  image_path: string;
  title: string;
  location: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}): GalleryItem {
  return {
    id: row.id,
    imagePath: row.image_path,
    title: row.title,
    location: row.location,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    createdAt: row.created_at,
  };
}
