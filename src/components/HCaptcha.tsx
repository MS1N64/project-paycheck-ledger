
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
    hcaptchaOnLoad: () => void;
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
  const [scriptError, setScriptError] = useState<string | null>(null);

  const handleVerify = useCallback((token: string) => {
    console.log('HCaptcha token received:', token ? 'valid token' : 'empty token');
    
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
      console.log('Cannot render widget yet:', { isLoaded, hasContainer: !!containerRef.current, widgetId, isRendering, hasHcaptcha: !!window.hcaptcha });
      return;
    }

    console.log('Attempting to render hCaptcha widget with sitekey:', sitekey);
    setIsRendering(true);
    
    try {
      const id = window.hcaptcha.render(containerRef.current, {
        sitekey,
        theme,
        size,
        callback: handleVerify,
        'error-callback': (error: string) => {
          console.error('hCaptcha callback error:', error);
          handleError(error);
        },
        'expired-callback': handleExpire,
      });
      
      console.log('HCaptcha widget rendered successfully with ID:', id);
      setWidgetId(id);
    } catch (error) {
      console.error('Error rendering hCaptcha:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load captcha widget';
      
      if (errorMessage.includes('Invalid site key') || errorMessage.includes('sitekey')) {
        handleError('Invalid site key configuration. Please check the hCaptcha site key.');
      } else {
        handleError(errorMessage);
      }
    } finally {
      setIsRendering(false);
    }
  }, [isLoaded, widgetId, isRendering, sitekey, theme, size, handleVerify, handleError, handleExpire]);

  const handleScriptLoad = useCallback(() => {
    console.log('hCaptcha script loaded, checking availability...');
    
    if (window.hcaptcha) {
      if (typeof window.hcaptcha.ready === 'function') {
        window.hcaptcha.ready(() => {
          console.log('hCaptcha ready callback executed');
          setIsLoaded(true);
        });
      } else {
        console.log('hCaptcha available but ready function not found, setting loaded directly');
        setIsLoaded(true);
      }
    } else {
      console.error('hCaptcha script loaded but window.hcaptcha not available');
      setScriptError('hCaptcha failed to initialize properly');
    }
  }, []);

  useEffect(() => {
    // Check if script is already loaded and working
    if (window.hcaptcha && typeof window.hcaptcha.render === 'function') {
      console.log('hCaptcha already available');
      handleScriptLoad();
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="hcaptcha.com"]');
    if (existingScript) {
      console.log('hCaptcha script already in DOM');
      if (existingScript.getAttribute('data-loaded') === 'true') {
        handleScriptLoad();
      } else {
        existingScript.addEventListener('load', handleScriptLoad);
        return () => existingScript.removeEventListener('load', handleScriptLoad);
      }
      return;
    }

    // Load hCaptcha script with onload callback
    console.log('Loading hCaptcha script...');
    
    // Set up global callback
    window.hcaptchaOnLoad = handleScriptLoad;
    
    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js?onload=hcaptchaOnLoad&render=explicit';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('hCaptcha script onload fired');
      script.setAttribute('data-loaded', 'true');
    };

    script.onerror = (error) => {
      console.error('Failed to load hCaptcha script:', error);
      setScriptError('Failed to load captcha service. Please check your internet connection.');
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
      // Clean up global callback
      if (window.hcaptchaOnLoad) {
        delete window.hcaptchaOnLoad;
      }
    };
  }, [handleScriptLoad, widgetId]);

  useEffect(() => {
    if (isLoaded && !scriptError) {
      renderWidget();
    }
  }, [isLoaded, scriptError, renderWidget]);

  // Expose reset function
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any).reset = reset;
    }
  }, [reset]);

  if (scriptError) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <div className="text-red-600 text-sm">{scriptError}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-blue-600 text-sm underline"
        >
          Reload page
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={containerRef} />
      {!isLoaded && !scriptError && (
        <div className="text-center text-slate-600 p-4">
          <div className="animate-spin inline-block w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full mr-2"></div>
          Loading security verification...
        </div>
      )}
    </div>
  );
};

export default HCaptcha;
