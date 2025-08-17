"use client";

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Script from 'next/script';
import { useEffect } from 'react';

interface TrackingScriptsProps {
  slug: string;
}

export function TrackingScripts({ slug }: TrackingScriptsProps) {
  const trackingIds = useQuery(api.tracking.getIdsBySlug, { slug });

  // Registra informações de depuração apenas em ambiente de desenvolvimento
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (trackingIds?.facebookPixelId) {
        console.log(`[DEV] Facebook Pixel ativado: ${trackingIds.facebookPixelId}`);
      }
      if (trackingIds?.googleAnalyticsId) {
        console.log(`[DEV] Google Analytics ativado: ${trackingIds.googleAnalyticsId}`);
      }
    }
  }, [trackingIds]);

  if (!trackingIds) return null;

  return (
    <>
      {/* Facebook Pixel */}
      {trackingIds.facebookPixelId && (
        <>
          <Script id="fb-pixel-init" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${trackingIds.facebookPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${trackingIds.facebookPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* Google Analytics */}
      {trackingIds.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${trackingIds.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${trackingIds.googleAnalyticsId}');

              // Configura evento de conversão ao clicar em links
              document.addEventListener('click', function(e) {
                const target = e.target.closest('a');
                if (target) {
                  gtag('event', 'click', {
                    'event_category': 'Outbound Link',
                    'event_label': target.href
                  });
                }
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}