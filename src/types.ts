export interface Book {
  id: string;
  title: string;
  folder: string;
  thumbnail: string;
}

export interface Hotspot {
  type: 'audio' | 'video' | 'link';
  label: string;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  start?: number;
  url?: string;
}

export interface Page {
  img: string;
  hotspots: Hotspot[];
}

export interface BookData {
  pages: Page[];
}
