import { useEffect } from 'react';

export function useScrollReveal(options?: IntersectionObserverInit) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (elements.length === 0) return;

    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            if (!target.classList.contains('reveal-in')) {
              target.classList.add('reveal-in');
            }
            observer.unobserve(target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -10% 0px',
        ...options,
      }
    );

    elements.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [options]);
}



