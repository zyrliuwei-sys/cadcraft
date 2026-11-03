import { useEffect } from 'react';

// Adsterra's Social Bar belongs at the end of the body, after the page DOM
// exists. Appending in an effect also prevents React's async-script hoisting.
export function SocialBar({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = 'https://bellnewyork.org/14/fce47047e81a209da1feffeb74c48996';
    script.onerror = () => script.remove();
    document.body.appendChild(script);
    return () => {
      script.onerror = null;
      script.remove();
    };
  }, [enabled]);

  return null;
}
