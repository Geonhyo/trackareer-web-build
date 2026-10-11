import type { MetadataRoute } from 'next';
import { SITE_NAME } from '@/shared/config/site';

/** 홈 화면 추가 시 이름 · 아이콘. 아이콘 원본은 모노레포 루트 `brand/app-icon-1024.png` */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
