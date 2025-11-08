/**
 * Next.js App Component
 * 
 * This component wraps all pages and imports global styles.
 * Learn more: https://nextjs.org/docs/advanced-features/custom-app
 */

import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

