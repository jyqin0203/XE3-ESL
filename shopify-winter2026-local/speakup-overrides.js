(() => {
  const DOWNLOAD_URL =
    "https://speak-up.top/downloads/android/v0.1.8/speakup-v0.1.8-production-arm64.apk";
  const GITHUB_URL = "https://github.com/1024XEngineer/XE3-ESL";
  const WHITE_MARK_URL = "/assets/speakup/speakup-mark-white.svg";
  const SIDEKICK_VIDEO_URL = "/assets/speakup/先理解你-web.mp4";
  const SIDEKICK_VIDEO_POSTER_URL = "/assets/speakup/先理解你-poster.jpg";

  const chapters = {
    sidekick: { label: "AI 老师", title: "AI 口语老师", description: "先听懂你，不急着开练。" },
    agentic: { label: "理解目标", title: "理解目标", description: "从岗位、考试或下一场真实沟通开始。" },
    online: { label: "表达准备", title: "表达准备", description: "先教会你，再邀请你进入实战。" },
    retail: { label: "英文面试", title: "英文面试", description: "由面试官接管，连续追问真实经历。" },
    marketing: { label: "IELTS", title: "IELTS Speaking", description: "覆盖 Part 1、Part 2、Part 3 与完整模考。" },
    checkout: { label: "职场沟通", title: "职场沟通", description: "为汇报、协作、谈判与冲突处理提前开口。" },
    operations: { label: "生活旅行", title: "生活与旅行", description: "把租房、就医、电话与旅行交通练成自然表达。" },
    "shop-app": { label: "即时反馈", title: "即时反馈", description: "逐句纠错，也告诉你怎样说得更自然。" },
    b2b: { label: "练习复盘", title: "练习复盘", description: "用真实回答中的证据，找到下一步训练方向。" },
    finance: { label: "训练记忆", title: "训练记忆", description: "记住你的目标、经历、进步与反复出现的卡点。" },
    shipping: { label: "学习进度", title: "学习进度", description: "让每次练习接得上，也看得见长期变化。" },
    developer: { label: "下载产品", title: "下载与开源", description: "下载 Android 版本，或在 GitHub 查看 SpeakUp。" },
  };

  let applying = false;
  let queued = false;

  function ensureStyles() {
    if (document.querySelector('link[data-speakup-overrides="true"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/speakup-overrides.css";
    link.dataset.speakupOverrides = "true";
    document.head.append(link);
  }

  function setText(element, value) {
    if (element && element.textContent.trim() !== value) element.textContent = value;
  }

  function findByExactText(root, selector, value) {
    return [...root.querySelectorAll(selector)].find(
      (element) => element.textContent.trim() === value,
    );
  }

  function replaceShopifyBagLogos() {
    document.querySelectorAll("svg").forEach((svg) => {
      const isShopifyBag = [...svg.querySelectorAll("path")].some((path) =>
        path.getAttribute("d")?.startsWith("m11.975 2.421"),
      );
      if (!isShopifyBag) return;

      const image = document.createElement("img");
      image.src = WHITE_MARK_URL;
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
      image.className = `${svg.getAttribute("class") || ""} speakup-replaced-shopify-mark`.trim();
      const width = svg.getAttribute("width");
      const height = svg.getAttribute("height");
      if (width) image.setAttribute("width", width);
      if (height) image.setAttribute("height", height);
      svg.replaceWith(image);
    });

    document.querySelectorAll("img").forEach((image) => {
      const signature = `${image.src} ${image.alt}`.toLowerCase();
      if (!/(shopify[-_ ]?(bag|logo|glyph|mark))/.test(signature)) return;
      image.src = WHITE_MARK_URL;
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
      image.classList.add("speakup-replaced-shopify-mark");
    });

    document.querySelectorAll('link[rel~="icon"]').forEach((link) => {
      if (link.getAttribute("href") !== WHITE_MARK_URL) link.setAttribute("href", WHITE_MARK_URL);
      link.setAttribute("type", "image/svg+xml");
    });
  }

  function truncateAfterAgenticCommerce() {
    const target = document.getElementById("agentic-commerce");
    if (!target) return;

    const developerDetails = target.parentElement;
    if (!developerDetails?.classList.contains("bg-light")) return;
    developerDetails.remove();
    document.body.dataset.speakupTruncated = "agentic-commerce";
  }

  function removeSidekickSectionsBeforeTediousTasks() {
    const boundary = document.getElementById("tedious-tasks-simplified");
    const parent = boundary?.parentElement;
    if (!parent) return;

    const removableIds = [
      "insights-proactively-delivered",
      "complexity-delegated",
      "designs-refined",
    ];
    removableIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section?.parentElement === parent) section.remove();
    });
    document.body.dataset.speakupSidekickTrimmed = "before-tedious-tasks";
  }

  function updateHeader() {
    const homeLink = document.querySelector('h1 a[href="/editions/winter2026"]');
    const topNav = homeLink?.closest("nav");

    if (homeLink && !homeLink.querySelector(".speakup-top-brand")) {
      homeLink.setAttribute("aria-label", "SpeakUp 首页");
      homeLink.innerHTML = `
        <span class="speakup-top-brand">
          <img class="speakup-top-mark" src="${WHITE_MARK_URL}" alt="" aria-hidden="true" />
          <img class="speakup-top-wordmark" src="/assets/speakup/speakup-wordmark.png" alt="SpeakUp" />
          <small>Practice Edition</small>
        </span>`;
    }

    const topBrand = homeLink?.querySelector(".speakup-top-brand");
    if (topBrand && !topBrand.querySelector(".speakup-top-mark")) {
      const mark = document.createElement("img");
      mark.className = "speakup-top-mark";
      mark.src = WHITE_MARK_URL;
      mark.alt = "";
      mark.setAttribute("aria-hidden", "true");
      topBrand.prepend(mark);
    }

    if (!topNav) return;

    const editionsButton = findByExactText(topNav, "button", "Editions");
    if (editionsButton) {
      setText(editionsButton, "训练目录");
      if (!editionsButton.dataset.speakupBound) {
        editionsButton.dataset.speakupBound = "true";
        editionsButton.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            document.getElementById("sidekick")?.scrollIntoView({ behavior: "smooth" });
          },
          true,
        );
      }
    }

    const searchButton = findByExactText(topNav, "button", "Search");
    if (searchButton) {
      setText(searchButton, "探索场景");
      searchButton.setAttribute("aria-label", "探索 SpeakUp 练习场景");
      if (!searchButton.dataset.speakupBound) {
        searchButton.dataset.speakupBound = "true";
        searchButton.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            document.getElementById("retail")?.scrollIntoView({ behavior: "smooth" });
          },
          true,
        );
      }
    }

    const githubLink = findByExactText(topNav, "a", "Shopify.com");
    if (githubLink) {
      setText(githubLink, "GitHub");
      githubLink.href = GITHUB_URL;
      githubLink.target = "_blank";
      githubLink.rel = "noopener noreferrer";
    }

    const downloadLink = findByExactText(topNav, "a", "Start for free");
    if (downloadLink) {
      setText(downloadLink, "下载 Android");
      downloadLink.href = DOWNLOAD_URL;
      downloadLink.removeAttribute("target");
    }
  }

  function updateEditionPanel() {
    const titleLink =
      document.querySelector("h2.title-link > a.speakup-title-link") ||
      [...document.querySelectorAll("h2.title-link > a")].find((link) =>
        link.querySelector("span.sr-only")?.textContent.includes("Renaissance"),
      );

    if (titleLink && !titleLink.querySelector(".speakup-edition-title")) {
      const srOnly = titleLink.querySelector("span.sr-only");
      if (srOnly) srOnly.textContent = "SpeakUp Practice Edition";
      titleLink.href = "#top";
      titleLink.classList.add("speakup-title-link");
      const title = document.createElement("span");
      title.className = "speakup-edition-title";
      title.setAttribute("aria-hidden", "true");
      title.innerHTML = "<span>SpeakUp</span><em>Practice</em><span>Edition</span>";
      titleLink.append(title);
    }

    const panelNav = titleLink?.closest("nav");
    if (!panelNav) return;
    panelNav.classList.add("speakup-directory");
    document.body.id ||= "top";

    const intro = [...panelNav.querySelectorAll("p")].find((paragraph) =>
      paragraph.textContent.includes("new world of commerce"),
    );
    if (intro) {
      intro.classList.add("speakup-hero-copy");
      setText(intro, "下一场重要的英文沟通，先练一遍。");
    }

    for (const [id, chapter] of Object.entries(chapters)) {
      panelNav.querySelectorAll(`a[href$="#${id}"]`).forEach((link) => setText(link, chapter.label));
    }

    const editionAside = panelNav.closest("aside");
    if (editionAside) {
      const copyright = [...editionAside.querySelectorAll("p")].find((paragraph) =>
        paragraph.textContent.includes("Shopify Inc"),
      );
      setText(copyright, "© 2026 SpeakUp");

      const legalLinks = editionAside.querySelectorAll('a[href*="shopify.com/legal"]');
      if (legalLinks[0]) {
        setText(legalLinks[0], "更新日志");
        legalLinks[0].href = "https://speak-up.top/changelog";
      }
      if (legalLinks[1]) {
        setText(legalLinks[1], "GitHub");
        legalLinks[1].href = GITHUB_URL;
        legalLinks[1].target = "_blank";
        legalLinks[1].rel = "noopener noreferrer";
      }
    }
  }

  function updateChapterIntros() {
    for (const [id, chapter] of Object.entries(chapters)) {
      const section = document.getElementById(id);
      if (!section) continue;
      section.dataset.speakupChapter = id;
      const intro = section.firstElementChild?.firstElementChild;
      const heading = intro?.querySelector("h2 > span") || intro?.querySelector("h2");
      const paragraph = intro?.querySelector(".rich-text p");
      setText(heading, chapter.title);
      setText(paragraph, chapter.description);
    }
  }

  function updateAllDirectoryLinks() {
    for (const [id, chapter] of Object.entries(chapters)) {
      document.querySelectorAll(`a[href$="#${id}"]`).forEach((link) => {
        if (link.closest("article")) return;
        setText(link, chapter.label);
      });
    }
  }

  function ensureHeroArt() {
    const wrapper = document.querySelector(".canvas-wrapper");
    if (!wrapper || wrapper.querySelector(".speakup-hero-art")) return;

    const picture = document.createElement("picture");
    picture.className = "speakup-hero-art";
    picture.setAttribute("aria-hidden", "true");
    picture.innerHTML = `
      <source media="(max-width: 767px)" srcset="/assets/speakup/hero-mobile.png" />
      <img src="/assets/speakup/hero-desktop.png" alt="" decoding="async" fetchpriority="high" />`;
    wrapper.append(picture);
    updateHeroOpacity();
  }

  function updateSidekickVideoCard() {
    const mediaWrapper = document.querySelector("#sidekick-video .media-wrapper");
    if (!mediaWrapper) return;

    mediaWrapper.classList.add("speakup-sidekick-media");
    mediaWrapper.style.setProperty(
      "--speakup-sidekick-poster",
      `url("${SIDEKICK_VIDEO_POSTER_URL}")`,
    );

    const poster = mediaWrapper.querySelector("img");
    if (poster) {
      if (poster.getAttribute("src") !== SIDEKICK_VIDEO_POSTER_URL) {
        poster.src = SIDEKICK_VIDEO_POSTER_URL;
      }
      // Hydration may restore the original responsive source even after `src`
      // is replaced, so clear these attributes on every guard pass.
      poster.removeAttribute("srcset");
      poster.removeAttribute("sizes");
      poster.width = 536;
      poster.height = 960;
      poster.alt = "SpeakUp 先理解你功能演示";
      poster.classList.add("speakup-sidekick-poster");
    }

    const previewVideo = mediaWrapper.querySelector("video");
    if (previewVideo) {
      if (previewVideo.getAttribute("src") !== SIDEKICK_VIDEO_URL) {
        previewVideo.src = SIDEKICK_VIDEO_URL;
      }
      // The mirrored component can rehydrate its original <source> children.
      // A direct source wins in the browser; removing the stale children also
      // prevents them from flashing during a later media reload.
      previewVideo.querySelectorAll("source").forEach((source) => source.remove());
      previewVideo.poster = SIDEKICK_VIDEO_POSTER_URL;
      previewVideo.muted = true;
      previewVideo.defaultMuted = true;
      previewVideo.autoplay = true;
      previewVideo.loop = true;
      previewVideo.playsInline = true;
      previewVideo.classList.add("speakup-sidekick-preview-video");
      if (previewVideo.paused) previewVideo.play().catch(() => {});
    }

    // The SpeakUp clip plays directly in the card. Remove the mirrored site's
    // modal trigger on every pass so hydration cannot bring the old overlay
    // button (and its separate video surface) back.
    mediaWrapper
      .querySelectorAll(
        'button[data-component-name="cta-open-video-modal"], button[data-transition-id="sidekick-video"], button[aria-label="Play video"], button[data-speakup-video]',
      )
      .forEach((button) => button.remove());
  }

  function updateHeroOpacity() {
    const art = document.querySelector(".speakup-hero-art");
    if (!art) return;
    const start = window.innerHeight * 0.78;
    const end = window.innerHeight * 1.42;
    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));
    art.style.setProperty("--speakup-hero-opacity", String(1 - progress));
    art.style.visibility = progress >= 1 ? "hidden" : "visible";
  }

  function applySpeakUpLayer() {
    if (applying) return;
    applying = true;
    ensureStyles();
    document.body?.classList.add("speakup-mode");
    document.documentElement.lang = "zh-CN";
    document.title = "SpeakUp · 下一场重要的英文沟通，先练一遍";
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = "面向真实表达场景的 AI 英语口语陪练：理解目标、组织准备、进入实战并持续复盘。";
    }
    updateHeader();
    replaceShopifyBagLogos();
    truncateAfterAgenticCommerce();
    removeSidekickSectionsBeforeTediousTasks();
    updateEditionPanel();
    updateAllDirectoryLinks();
    updateChapterIntros();
    ensureHeroArt();
    updateSidekickVideoCard();
    applying = false;
  }

  function queueApply() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applySpeakUpLayer();
    });
  }

  const observer = new MutationObserver(queueApply);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("scroll", updateHeroOpacity, { passive: true });
  window.addEventListener("resize", updateHeroOpacity, { passive: true });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applySpeakUpLayer, { once: true });
  } else {
    applySpeakUpLayer();
  }

  // The mirrored Remix page hydrates after the static document has loaded and
  // can replace nodes that were edited during bootstrap. Re-apply briefly while
  // hydration settles, then keep a low-frequency guard for lazy route sections.
  let hydrationPasses = 0;
  const hydrationGuard = window.setInterval(() => {
    applySpeakUpLayer();
    hydrationPasses += 1;
    if (hydrationPasses >= 20) window.clearInterval(hydrationGuard);
  }, 500);
  window.setInterval(applySpeakUpLayer, 5000);
})();
