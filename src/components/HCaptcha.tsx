
import { useEffect, useRef, useState, useCallback } from 'react';

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
  const [isRendering, setIsRendering] = useState(false);

  const handleVerify = useCallback((token: string) => {
    console.log('HCaptcha token received:', token ? 'valid token' : 'empty token');
    
    // Validate token format
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      console.error('Invalid captcha token format');
      onError?.('Invalid captcha token received');
      return;
    }
    
    onVerify(token);
  }, [onVerify, onError]);

  const handleError = useCallback((error: string) => {
    console.error('HCaptcha error:', error);
    onError?.(error || 'Captcha verification failed');
  }, [onError]);

  const handleExpire = useCallback(() => {
    console.log('HCaptcha expired');
    onExpire?.();
  }, [onExpire]);

  const reset = useCallback(() => {
    if (widgetId && window.hcaptcha) {
      console.log('Resetting hCaptcha widget');
      try {
        window.hcaptcha.reset(widgetId);
      } catch (error) {
        console.warn('Error resetting hCaptcha widget:', error);
      }
    }
  }, [widgetId]);

  const renderWidget = useCallback(() => {
    if (!isLoaded || !containerRef.current || widgetId || isRendering || !window.hcaptcha) {
      return;
    }

    setIsRendering(true);
    
    try {
      const id = window.hcaptcha.render(containerRef.current, {
        sitekey,
        theme,
        size,
        callback: handleVerify,
        'error-callback': handleError,
        'expired-callback': handleExpire,
      });
      
      console.log('HCaptcha widget rendered with ID:', id);
      setWidgetId(id);
    } catch (error) {
      console.error('Error rendering hCaptcha:', error);
      handleError('Failed to load captcha widget');
    } finally {
      setIsRendering(false);
    }
  }, [isLoaded, widgetId, isRendering, sitekey, theme, size, handleVerify, handleError, handleExpire]);

  useEffect(() => {
    // Check if script is already loaded
    if (window.hcaptcha) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src="https://js.hcaptcha.com/1/api.js"]');
    if (existingScript) {
      const handleScriptLoad = () => {
        if (window.hcaptcha) {
          window.hcaptcha.ready(() => {
            setIsLoaded(true);
          });
        }
      };

      if (existingScript.getAttribute('data-loaded') === 'true') {
        handleScriptLoad();
      } else {
        existingScript.addEventListener('load', handleScriptLoad);
        return () => existingScript.removeEventListener('load', handleScriptLoad);
      }
      return;
    }

    // Load hCaptcha script
    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      script.setAttribute('data-loaded', 'true');
      if (window.hcaptcha) {
        window.hcaptcha.ready(() => {
          setIsLoaded(true);
        });
      }
    };

    script.onerror = () => {
      console.error('Failed to load hCaptcha script');
      handleError('Failed to load captcha service');
    };

    document.head.appendChild(script);

    return () => {
      if (widgetId && window.hcaptcha) {
        try {
          window.hcaptcha.remove(widgetId);
        } catch (error) {
          console.warn('Error removing hCaptcha widget:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    renderWidget();
  }, [renderWidget]);

  // Expose reset function
  useEffect(() => {
    (containerRef.current as any)?.setAttribute('reset', reset);
  }, [reset]);

  return (
    <div className={className}>
      <div ref={containerRef} />
    </div>
  );
};

export default HCaptcha;
