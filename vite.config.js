import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/sample04/',
  plugins: [react()],
  server: {
    proxy: {
      '/api-stablecoin': {
        target: 'https://stablecoinstats.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-stablecoin/, '/api'),
      },
      '/api-exchange': {
        target: 'https://oapi.koreaexim.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-exchange/, ''),
        secure: false, // <--- Add this line
      },
      '/api-upbit': {
        target: 'https://api.upbit.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-upbit/, ''),
      },
      '/api-naver': {
        target: 'https://m.search.naver.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-naver/, ''),
      },
      '/api-coinmarketcap': {
        target: 'https://pro-api.coinmarketcap.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-coinmarketcap/, ''),
        secure: true,
      },
      '/api-stablecoin': {
        target: 'https://stablecoinstats.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-stablecoin/, ''),
      },
    },
  },
});
