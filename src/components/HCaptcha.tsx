
import { useEffect, useRef, useState } from 'react';

interface HCaptchaProps {
  sitekey: string;
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  className?: string;
}

declare global {
  interface Window {
    hcaptcha: {
      render: (container: string | HTMLElement, config: any) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
      ready: (callback: () => void) => void;
    };
  }
}

const HCaptcha = ({ 
  sitekey, 
  onVerify, 
  onError, 
  onExpire, 
  theme = 'light', 
  size = 'normal',
  className = '' 
}: HCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load hCaptcha script
    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.hcaptcha) {
        window.hcaptcha.ready(() => {
          setIsLoaded(true);
        });
      }
    };

    // Check if script is already loaded
    if (!document.querySelector('script[src="https://js.hcaptcha.com/1/api.js"]')) {
      document.head.appendChild(script);
    } else if (window.hcaptcha) {
      setIsLoaded(true);
    }

    return () => {
      if (widgetId && window.hcaptcha) {
        try {
          window.hcaptcha.remove(widgetId);
        } catch (error) {
          console.warn('Error removing hCaptcha widget:', error);
        }
      }
    };
  }, [widgetId]);

  useEffect(() => {
    if (isLoaded && containerRef.current && !widgetId && window.hcaptcha) {
      try {
        const id = window.hcaptcha.render(containerRef.current, {
          sitekey,
          theme,
          size,
          callback: onVerify,
          'error-callback': onError,
          'expired-callback': onExpire,
        });
        setWidgetId(id);
      } catch (error) {
        console.error('Error rendering hCaptcha:', error);
        onError?.('Failed to load captcha');
      }
    }
  }, [isLoaded, sitekey, theme, size, onVerify, onError, onExpire, widgetId]);

  const reset = () => {
    if (widgetId && window.hcaptcha) {
      window.hcaptcha.reset(widgetId);
    }
  };

  return (
    <div className={className}>
      <div ref={containerRef} />
    </div>
  );
};

export default HCaptcha;
