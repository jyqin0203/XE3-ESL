(() => {
  window.__SHOPIFY_WINTER_2026_LOCAL_MIRROR__ = true;
  window.dataLayer = window.dataLayer || [];
  const localSidekickVideo = 'http://127.0.0.1:18086/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/videos/c/vp/620a0d8735da4d97b040b1cd98693898/620a0d8735da4d97b040b1cd98693898.HD-1080p-2.5Mbps-64843815.mp4';

  const replaceRemoteVideoFrames = () => {
    document.querySelectorAll('iframe[src*="youtube-nocookie.com/embed/"]').forEach((frame) => {
      const video = document.createElement('video');
      video.src = localSidekickVideo;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-label', frame.title || 'Sidekick video');
      video.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain;background:#000';
      frame.replaceWith(video);
    });
  };

  new MutationObserver(replaceRemoteVideoFrames).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  if ('serviceWorker' in navigator) {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register: async () => null, getRegistrations: async () => [] },
    });
  }

  const scrollToHash = () => {
    const hash = window.location.hash;
    if (!hash) return;
    requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }));
  };

  document.addEventListener('DOMContentLoaded', scrollToHash, { once: true });
  window.addEventListener('load', () => {
    scrollToHash();
    setTimeout(scrollToHash, 1200);
  }, { once: true });
})();
