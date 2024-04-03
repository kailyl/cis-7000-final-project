import '../styles/global.css';
import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const handleResize = () => {
      const minSize = Math.min(window.innerHeight, window.innerWidth);
      document.body.style.fontSize = minSize * 0.017 + 'px';
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(document.documentElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default MyApp;
