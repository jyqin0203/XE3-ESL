(() => {
  window.__SPEAKUP_PRACTICE_EDITION_LOCAL__ = true;
  window.dataLayer = window.dataLayer || [];
  const localReferenceVideo = '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/videos/c/vp/620a0d8735da4d97b040b1cd98693898/620a0d8735da4d97b040b1cd98693898.HD-1080p-2.5Mbps-64843815.mp4';

  const replaceRemoteVideoFrames = () => {
    document.querySelectorAll('iframe[src*="youtube-nocookie.com/embed/"]').forEach((frame) => {
      const video = document.createElement('video');
      video.src = localReferenceVideo;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-label', frame.title || 'SpeakUp 参考视频');
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
    const sourceIds = {
      'ai-teacher': 'sidekick',
      goal: 'agentic',
      preparation: 'online',
      interview: 'retail',
      ielts: 'marketing',
      workplace: 'checkout',
      travel: 'operations',
      feedback: 'shop-app',
      review: 'b2b',
      memory: 'finance',
      download: 'developer',
    };
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    requestAnimationFrame(() =>
      document.getElementById(sourceIds[hash] || hash)?.scrollIntoView({ block: 'start' }),
    );
  };

  document.addEventListener('DOMContentLoaded', scrollToHash, { once: true });
  window.addEventListener('load', () => {
    scrollToHash();
    setTimeout(scrollToHash, 1200);
  }, { once: true });
})();
