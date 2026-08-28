(() => {
  const PUBLIC_ROUTE = "/practice";
  const PAGE_TITLE = "SpeakUp Practice Edition · 下一场重要的英文沟通，先练一遍";
  const PAGE_DESCRIPTION =
    "面向真实表达场景的 AI 英语口语陪练：理解目标、组织准备、进入实战并持续复盘。";
  const isEmbedded = window.parent !== window;
  const DOWNLOAD_URL =
    "https://speak-up.top/downloads/android/v0.1.8/speakup-v0.1.8-production-arm64.apk";
  const GITHUB_URL = "https://github.com/1024XEngineer/XE3-ESL";
  const COLOR_MARK_URL = "/assets/speakup/speakup-mark.svg";
  const WHITE_MARK_URL = "/assets/speakup/speakup-mark-white.svg";
  const AI_TEACHER_VIDEO_URL = "/assets/speakup/先理解你-web.mp4";
  const AI_TEACHER_VIDEO_POSTER_URL = "/assets/speakup/先理解你-poster.jpg";
  const EXPRESSION_PREP_VIDEO_URL =
    "/assets/speakup/preparation/media/preparation.mp4";
  const EXPRESSION_PREP_QUESTION_URL =
    "/assets/speakup/preparation/media/question.png";
  const EXPRESSION_PREP_STAR_URL =
    "/assets/speakup/preparation/media/star.png";
  const EXPRESSION_PREP_READY_URL =
    "/assets/speakup/preparation/media/ready.png";
  const GOAL_CONTEXT_HAND_DESKTOP_URL =
    "/assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/chatgptdesktopposter_12_10.webp";
  const GOAL_CONTEXT_HAND_MOBILE_URL =
    "/assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/chatgptmobileposter_12_10.webp";

  const sceneChapters = {
    interview: {
      heading: "先把第一轮说顺",
      description: "从自我介绍到连续追问，先在真实面试前练一遍。",
      video: "/assets/speakup/scenes/videos/interview.mp4",
      poster: "/assets/speakup/scenes/videos/interview-poster.jpg",
      entry: "/assets/speakup/scenes/ui/screens/interview-screen.png",
      deviceVideo: "/assets/speakup/scenes/videos/interview-device.mp4",
      deviceVideoLabel: "播放 SpeakUp 英文面试真机演示",
      videoAlt: "英文面试场景预演",
      entryAlt: "SpeakUp 英文面试练习入口",
    },
    ielts: {
      heading: "从选题到开口",
      description: "选择 Part 1、2、3，再进入一轮真实问答。",
      video: "/assets/speakup/scenes/videos/ielts-laptop-speaking.mp4",
      poster: "/assets/speakup/scenes/videos/ielts-laptop-speaking-poster.jpg",
      entry: "/assets/speakup/scenes/ui/screens/ielts-screen.png",
      practice: "/assets/speakup/scenes/ui/screens/ielts-practice-screen.png",
      practiceVideos: [
        {
          label: "Part 1",
          src: "/assets/speakup/scenes/videos/ielts-part-1.mp4",
          poster: "/assets/speakup/scenes/videos/ielts-part-1-poster.jpg",
        },
        {
          label: "Part 2",
          src: "/assets/speakup/scenes/videos/ielts-part-2.mp4",
          poster: "/assets/speakup/scenes/videos/ielts-part-2-poster.jpg",
        },
        {
          label: "Part 3",
          src: "/assets/speakup/scenes/videos/ielts-part-3.mp4",
          poster: "/assets/speakup/scenes/videos/ielts-part-3-poster.jpg",
        },
      ],
      videoAlt: "IELTS 口语考试场景预演",
      entryAlt: "SpeakUp IELTS 口语练习入口",
      practiceAlt: "SpeakUp IELTS Part 1 真实问答练习页面",
    },
    workplace: {
      heading: "把会议先演一遍",
      description: "汇报、协作和客户沟通，先理清再开口。",
      video: "/assets/speakup/scenes/videos/work.mp4",
      poster: "/assets/speakup/scenes/videos/work-poster.jpg",
      entry: "/assets/speakup/scenes/ui/screens/work-screen.png",
      deviceVideo: "/assets/speakup/scenes/videos/workplace-communication-device.mp4",
      deviceVideoPoster:
        "/assets/speakup/scenes/videos/workplace-communication-device-poster.jpg",
      deviceVideoLabel: "播放 SpeakUp 职场沟通真机演示",
      videoAlt: "英文职场沟通场景预演",
      entryAlt: "SpeakUp 职场英语练习入口",
    },
    travel: {
      heading: "出发前，先说一遍",
      description: "酒店、问路与日常交流，在出发前先预演。",
      video: "/assets/speakup/scenes/videos/travel.mp4",
      poster: "/assets/speakup/scenes/videos/travel-poster.jpg",
      entry: "/assets/speakup/scenes/ui/screens/travel-screen.png",
      deviceVideo: "/assets/speakup/scenes/videos/restaurant-ordering-device.mp4",
      deviceVideoPoster:
        "/assets/speakup/scenes/videos/restaurant-ordering-device-poster.jpg",
      deviceVideoLabel: "播放 SpeakUp 餐厅点餐真机演示",
      videoAlt: "英文生活旅行场景预演",
      entryAlt: "SpeakUp 生活与旅行练习入口",
    },
  };

  const feedbackChapter = {
    keepIds: [
      "dynamic-shop-storefronts",
      "deals-feed-on-shop",
      "shoppable-videos-on-shop",
    ],
    cards: [
      {
        articleId: "dynamic-shop-storefronts",
        marker: "feedback-original",
        step: "01",
        heading: "错误出现，就地指出",
        description: "不中断整轮练习，直接在原句里标出可改位置。",
        image: "/assets/speakup/逐句纠错1.jpg",
        alt: "SpeakUp 在 IELTS Part 1 回答中原位标出语法错误，并给出 been 的修改建议",
      },
      {
        articleId: "deals-feed-on-shop",
        marker: "feedback-correction",
        step: "02",
        heading: "逐句拆开改",
        description: "划掉原表达，给出对应正确句，方便逐句对照。",
        image: "/assets/speakup/逐句纠错2.jpg",
        alt: "SpeakUp 对两句英文逐句纠错，并列出 really enjoys watching 和 doesn't have 的完整修正版",
      },
      {
        articleId: "shoppable-videos-on-shop",
        marker: "feedback-natural",
        step: "03",
        heading: "改对，也改自然",
        description: "从语法修正走到整句重写，给出能直接复述的版本。",
        image: "/assets/speakup/逐句纠错3.jpg",
        alt: "SpeakUp 在原句中标出多处错误，并给出更自然的完整英文重写",
      },
    ],
  };

  const reviewChapter = {
    keepIds: [
      "shopify-collective-available-globally",
      "ach-payments-for-b2b",
      "suppliers-can-discover-retailers",
      "payment-requests-per-fulfillment",
    ],
    cards: [
      {
        articleId: "shopify-collective-available-globally",
        marker: "review-overview",
        variant: "review-overview",
        step: "01",
        heading: "日常练习，一眼看全",
        description: "估分、四维表现与优先项，先看全貌。",
        image: "/assets/speakup/练习复盘1.jpg",
        alt: "SpeakUp 日常英语练习复盘的估分、四维表现与分项建议",
      },
      {
        articleId: "ach-payments-for-b2b",
        marker: "review-score",
        variant: "review-score",
        step: "02",
        heading: "薄弱项，逐条展开",
        description: "原回答、问题证据与建议放在一起。",
        image: "/assets/speakup/练习复盘2.jpg",
        alt: "SpeakUp 日常英语复盘展开清晰连贯、任务达成与互动表现的证据和建议",
      },
      {
        articleId: "suppliers-can-discover-retailers",
        marker: "review-advice",
        variant: "review-detail",
        step: "03",
        heading: "模考结束，马上复盘",
        description: "15 道回答汇总成阶段估分与能力画像。",
        image: "/assets/speakup/练习复盘3.jpg",
        alt: "SpeakUp IELTS 口语模考的阶段估分、四维表现与分项详情",
      },
      {
        articleId: "payment-requests-per-fulfillment",
        marker: "review-next-step",
        variant: "review-detail",
        step: "04",
        heading: "下一轮，知道练什么",
        description: "从语法、词汇到发音，建议直接落到动作。",
        image: "/assets/speakup/练习复盘4.jpg",
        alt: "SpeakUp IELTS 复盘中的词汇资源、发音问题证据和下一轮练习建议",
      },
    ],
  };

  const memoryChapter = {
    keepIds: [
      "continuous-funding-with-the-shopify-capital-flex-account",
      "automatic-transfers-in-shopify-balance",
      "staff-cards-spend-controls-with-shopify-balance",
    ],
    switchCards: [
      {
        label: "你的目标",
        value: "后端开发工程师 · 全球团队",
        description: "下一次，不再重复解释方向。",
      },
      {
        label: "真实经历",
        value: "高并发订单系统",
        description: "把做过的事接进新的追问。",
      },
      {
        label: "反复卡点",
        value: "量化结果 · 替代方案",
        description: "已经改善的，不再排在最前面。",
      },
    ],
    cards: [
      {
        articleId: "automatic-transfers-in-shopify-balance",
        marker: "memory-context",
        variant: "memory-context",
        step: "02",
        heading: "记得你为什么卡住",
        description: "目标、项目和变化，都在同一条上下文里。",
        image: "/assets/speakup/outcomes/ui/memory-context-detail.jpg",
        alt: "SpeakUp Memory 记住目标岗位、真实项目、已改善问题和反复卡点",
      },
      {
        articleId: "staff-cards-spend-controls-with-shopify-balance",
        marker: "memory-next-round",
        variant: "memory-next-round",
        step: "03",
        heading: "也知道下一轮练什么",
        description: "把已经知道的，变成新的追问。",
        image: "/assets/speakup/outcomes/ui/memory-next-round-detail.jpg",
        alt: "SpeakUp 根据长期记忆生成下一轮系统设计训练",
      },
    ],
  };

  const goalSlides = [
    {
      label: "英文面试",
      meta: "岗位 · NEXT FRIDAY",
      image: "/assets/speakup/理解目标/从岗位开始.jpg",
      alt: "SpeakUp 理解英文面试目标，并询问用户想先练具体问题还是产品经理术语",
    },
    {
      label: "IELTS 7.0",
      meta: "考试 · 3 MONTHS",
      image: "/assets/speakup/理解目标/雅思.jpg",
      alt: "SpeakUp 理解雅思口语提分目标，并建议先练 Part 2 或进行完整模考",
    },
    {
      label: "海外团队沟通",
      meta: "职场 · TOMORROW",
      image: "/assets/speakup/理解目标/职场.jpg",
      alt: "SpeakUp 理解项目延期沟通目标，并把重点整理为解决方案而不是借口",
    },
  ];

  const speakingStruggles = [
    {
      label: "/不知道怎么开始",
      description: "告诉 SpeakUp 下一场要做什么，它会整理目标、角色和轮次，直接带你进入第一轮。",
    },
    {
      label: "/听懂了却说不出",
      description: "用真实场景把被动词汇拉回主动表达。AI 老师会等你组织完，再自然追问。",
    },
    {
      label: "/一被追问就卡住",
      description: "连续追问而不是一次一题，练习如何解释、补充和澄清。",
    },
    {
      label: "/脑子突然一片空白",
      description: "先拆出表达骨架与关键词，临场忘词也能继续说下去。",
    },
    {
      label: "/文字C2·开口2G",
      description: "把写得漂亮的英文带回真实口语：少修饰，多反应，练到能当场说出来。",
    },
    {
      label: "/背了模板还是卡",
      description: "不再背通用答案。用你的经历生成个性化思路，再练成自己的话。",
    },
    {
      label: "/总要重复解释背景",
      description: "SpeakUp 记住岗位、考试目标和前几轮回答，下一次从已有上下文接着练。",
    },
    {
      label: "/练完不知道怎么改",
      description: "逐句指出发音、表达与逻辑问题，并给出下一轮可以直接执行的改法。",
    },
    {
      label: "/明天就要见客户",
      description: "输入客户背景和会面目标，快速完成一轮临场彩排。",
    },
    {
      label: "/IELTS Part 2没话说",
      description: "从你的真实经历挖素材，练清开头、转折与细节展开。",
    },
    {
      label: "/发音到底对不对",
      description: "关键发音可听、可对比、可重录，知道问题具体发生在哪个词。",
    },
    {
      label: "/单词会·句子组不出",
      description: "先给表达结构和可复用句块，再让你用自己的信息完成整句。",
    },
    {
      label: "/怕说错所以不开口",
      description: "这是私密的练习场。可以停顿、重来、说错，不会有人抢话或评判。",
    },
    {
      label: "/对方一加速就掉线",
      description: "语速和难度随你调整；听漏时练习请求重复、确认和复述。",
    },
    {
      label: "/临场只会Yes·Maybe",
      description: "模拟对方的真实回应，让你不只准备开场，也准备接下来的每一步。",
    },
    {
      label: "/想得到却翻不出来",
      description: "不强迫逐字翻译，先抓意思，再用你现有的词汇把它说出来。",
    },
    {
      label: "/练习总是坚持不下去",
      description: "每次只做一轮有明确终点的练习，用复盘把下一次接上。",
    },
    {
      label: "/找不到真实对话对象",
      description: "AI 面试官、考官和客户随时在场，并会根据你的回答继续追问。",
    },
    {
      label: "/反馈只有继续加油",
      description: "反馈落到原句、具体原因与替换说法，不用猜下一步怎么练。",
    },
    {
      label: "/学了很多年还是不敢说",
      description: "进步按真实回答积累：常见卡点、表达变化和完成过的场景都看得见。",
    },
  ];

  const socialPosts = [
    {
      id: "start-speaking",
      platform: "小红书",
      type: "图文",
      title: "英语口语到底怎么开始？",
      excerpt: "别再把“开始练口语”变成另一份学习规划。告诉 SpeakUp 你下一场要说什么，然后直接开始。",
      href: "https://xhslink.cn/o/9cueBSeKN3F",
      image: "/assets/speakup/social-wall/01-start-speaking.webp",
      width: 1080,
      height: 1440,
    },
    {
      id: "foreign-client",
      platform: "小红书",
      type: "图文",
      title: "明天要接待外国客户，现在抱佛脚来得及吗",
      excerpt: "临时准备也可以很具体：客户是谁、你要谈什么、最怕被追问什么，下一次不必重新解释。",
      href: "https://xhslink.cn/o/1kazi192sev",
      image: "/assets/speakup/social-wall/02-foreign-client.webp",
      width: 1080,
      height: 1440,
    },
    {
      id: "ai-filter",
      platform: "抖音",
      type: "图文",
      title: "AI 把我的英语 P 成了照骗",
      excerpt: "邮件里像 C2，视频会议里却只剩 Yes。写作可以润色，真实开口只能提前练过。",
      href: "https://v.douyin.com/HxcnSuHbB7Y/",
      image: "/assets/speakup/social-wall/03-ai-filter.webp",
      width: 1086,
      height: 1448,
    },
    {
      id: "product-film",
      platform: "小红书",
      type: "视频",
      title: "0 基础剪辑，我居然做出了自己的产品宣传片",
      excerpt: "从产品画面到真实使用场景：在真正开口之前，先把重要的一次练习拍给自己看。",
      href: "https://xhslink.cn/o/1J7y3NvyT6Q",
      image: "/assets/speakup/social-wall/04-product-film.webp",
      width: 1441,
      height: 1079,
    },
    {
      id: "speakup-skill",
      platform: "小红书",
      type: "视频",
      title: "什么 skill 这么厉害",
      excerpt: "一句目标，变成一次可以完成的训练：场景、角色、轮次和反馈都被组织清楚。",
      href: "https://xhslink.cn/o/6t0JXRjBUG9",
      image: "/assets/speakup/social-wall/05-speakup-skill.webp",
      width: 1441,
      height: 1080,
    },
    {
      id: "first-word",
      platform: "小红书",
      type: "视频",
      title: "原来他也在等你先开口",
      excerpt: "很多沟通不是没有机会，只差第一句话。先在没有压力的地方，把它真正说出来。",
      href: "https://xhslink.cn/o/76DNPbzgwe5",
      image: "/assets/speakup/social-wall/06-first-word.webp",
      width: 1080,
      height: 1441,
    },
    {
      id: "ielts-speaking",
      platform: "小红书",
      type: "图文",
      title: "雅思口语开口就卡？",
      excerpt: "不再背同一份模板：用你的经历生成回答，跟 AI 考官连着练，再看清每一句该怎么改。",
      href: "https://xhslink.cn/o/9r6ssNYgiNa",
      image: "/assets/speakup/social-wall/07-ielts-speaking.webp",
      width: 1080,
      height: 1350,
    },
  ];

  // Keys below are source DOM section IDs; `slug` is the public SpeakUp name.
  const chaptersBySourceId = {
    sidekick: {
      slug: "ai-teacher",
      label: "AI 老师",
      title: "AI 口语老师",
      description: "先听懂你，不急着开练。",
    },
    agentic: {
      slug: "goal",
      label: "理解目标",
      title: "理解目标",
      description: "先说清楚你为什么要开口，再决定怎么练。",
    },
    online: {
      slug: "preparation",
      label: "表达准备",
      title: "表达准备",
      description: "先教会你，再邀请你进入实战。",
    },
    retail: {
      slug: "interview",
      label: "英文面试",
      title: "英文面试",
      description: "由面试官接管，连续追问真实经历。",
    },
    marketing: {
      slug: "ielts",
      label: "IELTS",
      title: "IELTS Speaking",
      description: "覆盖 Part 1、Part 2、Part 3 与完整模考。",
    },
    checkout: {
      slug: "workplace",
      label: "职场沟通",
      title: "职场沟通",
      description: "为汇报、协作、谈判与冲突处理提前开口。",
    },
    operations: {
      slug: "travel",
      label: "生活旅行",
      title: "生活与旅行",
      description: "把租房、就医、电话与旅行交通练成自然表达。",
    },
    "shop-app": {
      slug: "feedback",
      label: "即时反馈",
      title: "即时反馈",
      description: "逐句纠错，也告诉你怎样说得更自然。",
    },
    b2b: {
      slug: "review",
      label: "练习复盘",
      title: "练习复盘",
      description: "用真实回答中的证据，找到下一步训练方向。",
    },
    finance: {
      slug: "memory",
      label: "训练记忆",
      title: "训练记忆",
      description: "记住你的目标、经历、进步与反复出现的卡点。",
    },
    developer: {
      slug: "download",
      label: "下载产品",
      title: "下载与开源",
      description: "下载 Android 版本，或在 GitHub 查看 SpeakUp。",
    },
  };

  const chapterIdBySlug = new Map(
    Object.entries(chaptersBySourceId).map(([id, chapter]) => [chapter.slug, id]),
  );

  let applying = false;
  let queued = false;
  let socialMasonryFrame = 0;
  let heroCameraController = null;
  let routedPublicHash = null;
  let runtimeReadyPublished = false;
  const memorySwitchControllers = new WeakMap();
  let bypassSecondaryEditionLoader =
    isEmbedded ||
    Boolean(location.hash && !["#top", "#hero"].includes(location.hash)) ||
    window.scrollY > 100;

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

  function replaceSourceBagLogos() {
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

  function truncateAfterSourceDetailBoundary() {
    const target = document.getElementById("agentic-commerce");
    if (!target) return;

    const developerDetails = target.parentElement;
    if (!developerDetails?.classList.contains("bg-light")) return;
    developerDetails.remove();
    document.body.dataset.speakupTruncated = "agentic-commerce";
  }

  function removeAiTeacherSourceSectionsBeforePractice() {
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
    const homeLink = document.querySelector("h1 a");
    const topNav = homeLink?.closest("nav");

    if (homeLink) {
      homeLink.href = PUBLIC_ROUTE;
      homeLink.dataset.speakupHomeLink = "true";
      homeLink.setAttribute("aria-label", "SpeakUp 首页");
      if (!homeLink.querySelector(".speakup-top-brand")) {
        homeLink.innerHTML = `
          <span class="speakup-top-brand">
            <img class="speakup-top-mark" src="${WHITE_MARK_URL}" alt="" aria-hidden="true" />
            <img class="speakup-top-wordmark" src="/assets/speakup/speakup-wordmark.png" alt="SpeakUp" />
            <small>Practice Edition</small>
          </span>`;
      }
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
            navigateToChapter("sidekick");
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
            navigateToChapter("retail");
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

    for (const [id, chapter] of Object.entries(chaptersBySourceId)) {
      panelNav
        .querySelectorAll(`a[href$="#${id}"], a[href$="#${chapter.slug}"]`)
        .forEach((link) => updateChapterLink(link, id, chapter));
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

  function removeLearningProgressSection() {
    document.querySelectorAll('a[href$="#shipping"]').forEach((link) => {
      const item = link.closest("li");
      if (item) item.remove();
      else link.remove();
    });
    document.getElementById("shipping")?.remove();
  }

  function updateChapterIntros() {
    for (const [id, chapter] of Object.entries(chaptersBySourceId)) {
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

  function setGoalCarouselIndex(carousel, requestedIndex) {
    if (!carousel) return;
    const slides = [...carousel.querySelectorAll(".speakup-goal-carousel__slide")];
    if (!slides.length) return;
    const index = ((requestedIndex % slides.length) + slides.length) % slides.length;
    carousel.dataset.activeSlide = String(index);

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === index;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    carousel.querySelectorAll(".speakup-goal-carousel__dot").forEach((dot, dotIndex) => {
      const isActive = dotIndex === index;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    const slide = goalSlides[index];
    setText(carousel.querySelector("[data-speakup-goal-meta]"), slide.meta);
    setText(carousel.querySelector("[data-speakup-goal-label]"), slide.label);
    setText(
      carousel.querySelector("[data-speakup-goal-count]"),
      `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`,
    );
  }

  function buildGoalCarousel() {
    const carousel = document.createElement("div");
    carousel.id = "speakup-goal-carousel";
    carousel.className = "speakup-goal-carousel";
    carousel.dataset.speakupGoalCarousel = "true";
    carousel.dataset.version = "1";
    carousel.dataset.activeSlide = "0";
    carousel.setAttribute("role", "region");
    carousel.setAttribute("aria-roledescription", "carousel");
    carousel.setAttribute("aria-label", "SpeakUp 理解目标示例");
    carousel.setAttribute("tabindex", "0");
    carousel.innerHTML = `
      <div class="speakup-goal-carousel__stage" data-lenis-prevent="true">
        <picture class="speakup-goal-carousel__device" aria-hidden="true">
          <source media="(max-width: 939px)" srcset="${GOAL_CONTEXT_HAND_MOBILE_URL}" />
          <img src="${GOAL_CONTEXT_HAND_DESKTOP_URL}" alt="" width="1600" height="1545" draggable="false" />
        </picture>
        <div class="speakup-goal-carousel__screen">
          ${goalSlides
            .map(
              (slide, index) => `
                <img
                  class="speakup-goal-carousel__slide${index === 0 ? " is-active" : ""}"
                  src="${slide.image}"
                  width="1080"
                  height="2400"
                  ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}
                  decoding="async"
                  alt="${slide.alt}"
                  aria-hidden="${index === 0 ? "false" : "true"}"
                />`,
            )
            .join("")}
        </div>
        <div class="speakup-goal-carousel__story" aria-live="polite">
          <p data-speakup-goal-meta>${goalSlides[0].meta}</p>
          <strong data-speakup-goal-label>${goalSlides[0].label}</strong>
          <span data-speakup-goal-count>01 / 03</span>
        </div>
        <div class="speakup-goal-carousel__controls" role="group" aria-label="选择目标示例">
          ${goalSlides
            .map(
              (slide, index) => `
                <button
                  class="speakup-goal-carousel__dot${index === 0 ? " is-active" : ""}"
                  type="button"
                  data-speakup-goal-index="${index}"
                  aria-label="查看${slide.label}示例"
                  aria-current="${index === 0 ? "true" : "false"}"
                ><span></span></button>`,
            )
            .join("")}
        </div>
      </div>`;
    return carousel;
  }

  function bindGoalCarousel(carousel) {
    if (!carousel || carousel.dataset.speakupCarouselBound === "true") return;
    carousel.dataset.speakupCarouselBound = "true";

    carousel.addEventListener("click", (event) => {
      const dot = event.target instanceof Element
        ? event.target.closest("[data-speakup-goal-index]")
        : null;
      if (!dot || !carousel.contains(dot)) return;
      setGoalCarouselIndex(carousel, Number(dot.dataset.speakupGoalIndex));
    });
    carousel.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const current = Number(carousel.dataset.activeSlide || 0);
      setGoalCarouselIndex(carousel, current + (event.key === "ArrowRight" ? 1 : -1));
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      if (!carousel.isConnected) {
        window.clearInterval(interval);
        return;
      }
      if (document.hidden || carousel.matches(":hover") || carousel.contains(document.activeElement)) {
        return;
      }
      setGoalCarouselIndex(carousel, Number(carousel.dataset.activeSlide || 0) + 1);
    }, 5800);
  }

  function updateGoalUnderstandingSection() {
    const article = document.getElementById("shopify-agentic-storefronts");
    if (article) {
      setText(article.querySelector("#card-heading-shopify-agentic-storefronts"), "先理解目标，再开始训练");
      setText(
        article.querySelector(".rich-text p"),
        "告诉 SpeakUp 你的岗位、考试目标或下一场真实沟通。它会识别期限、角色、当前水平与真正卡点，再把目标组织成一轮可以完成的练习。",
      );

      const cta = article.querySelector('a[data-component-name="cta-link"]');
      if (cta) {
        cta.href = "#speakup-goal-carousel";
        cta.removeAttribute("target");
        cta.removeAttribute("rel");
        cta.setAttribute("aria-label", "查看下一个 SpeakUp 目标示例");
        setText(cta.querySelector(":scope > span") || cta, "查看下一个目标");
        if (cta.dataset.speakupGoalBound !== "true") {
          cta.dataset.speakupGoalBound = "true";
          cta.addEventListener(
            "click",
            (event) => {
              event.preventDefault();
              const carousel = document.getElementById("speakup-goal-carousel");
              if (!carousel) return;
              setGoalCarouselIndex(carousel, Number(carousel.dataset.activeSlide || 0) + 1);
              carousel.focus({ preventScroll: true });
            },
            true,
          );
        }
      }

      const mediaWrapper = article.querySelector(".media-wrapper");
      if (mediaWrapper) {
        let carousel = mediaWrapper.querySelector(
          ':scope > [data-speakup-goal-carousel="true"][data-version="1"]',
        );
        if (!carousel) carousel = buildGoalCarousel();
        if (mediaWrapper.children.length !== 1 || mediaWrapper.firstElementChild !== carousel) {
          mediaWrapper.replaceChildren(carousel);
        }
        bindGoalCarousel(carousel);
      }
    }

    document.getElementById("agentic-storefronts-video")?.remove();
  }

  function buildExpressionPreparationStage() {
    const stage = document.createElement("div");
    stage.className = "speakup-expression-stage animate-media-entrance";
    stage.dataset.speakupExpressionStage = "true";
    stage.dataset.version = "1";
    stage.setAttribute("role", "group");
    stage.setAttribute(
      "aria-label",
      "SpeakUp 从提出问题、理清表达思路到进入模拟实战的演示",
    );
    stage.innerHTML = `
      <div class="speakup-expression-stage__screen speakup-expression-stage__screen--question" aria-hidden="true">
        <img src="${EXPRESSION_PREP_QUESTION_URL}" alt="" decoding="async" />
      </div>
      <div class="speakup-expression-stage__screen speakup-expression-stage__screen--demo">
        <video
          id="speakup-expression-video"
          src="${EXPRESSION_PREP_VIDEO_URL}"
          poster="${EXPRESSION_PREP_STAR_URL}"
          preload="metadata"
          playsinline
          disablepictureinpicture
          aria-label="SpeakUp 理清表达思路并进入模拟实战的视频演示"
        ></video>
      </div>
      <div class="speakup-expression-stage__screen speakup-expression-stage__screen--ready" aria-hidden="true">
        <img src="${EXPRESSION_PREP_READY_URL}" alt="" decoding="async" />
      </div>`;
    return stage;
  }

  function syncExpressionPreparationCta(article) {
    const cta = article?.querySelector('a[data-component-name="cta-link"]');
    const video = article?.querySelector("#speakup-expression-video");
    if (!cta || !video) return;

    const isPlaying = !video.paused && !video.ended;
    const label = video.ended
      ? "重播演示"
      : isPlaying
        ? "暂停演示"
        : video.currentTime > 0.05
          ? "继续演示"
          : "播放演示";
    setText(cta.querySelector(":scope > span") || cta, label);
    cta.setAttribute("aria-label", `${label}：SpeakUp 表达准备`);
    cta.setAttribute("aria-pressed", String(isPlaying));
  }

  function bindExpressionPreparationMedia(article) {
    const cta = article?.querySelector('a[data-component-name="cta-link"]');
    const video = article?.querySelector("#speakup-expression-video");
    if (!cta || !video) return;

    cta.href = "#speakup-expression-video";
    cta.removeAttribute("target");
    cta.removeAttribute("rel");
    cta.setAttribute("role", "button");
    cta.setAttribute("aria-controls", "speakup-expression-video");

    if (cta.dataset.speakupExpressionBound !== "true") {
      cta.dataset.speakupExpressionBound = "true";
      cta.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          const currentArticle = document.getElementById("rollouts");
          const currentVideo = currentArticle?.querySelector("#speakup-expression-video");
          if (!currentVideo) return;

          if (!currentVideo.paused && !currentVideo.ended) {
            currentVideo.pause();
            return;
          }
          if (currentVideo.ended) currentVideo.currentTime = 0;
          currentVideo.play().catch(() => syncExpressionPreparationCta(currentArticle));
        },
        true,
      );
      cta.addEventListener("keydown", (event) => {
        if (event.key !== " ") return;
        event.preventDefault();
        cta.click();
      });
    }

    if (video.dataset.speakupExpressionBound !== "true") {
      video.dataset.speakupExpressionBound = "true";
      ["play", "pause", "ended", "loadedmetadata"].forEach((eventName) => {
        video.addEventListener(eventName, () => {
          syncExpressionPreparationCta(document.getElementById("rollouts"));
        });
      });
    }
    syncExpressionPreparationCta(article);
  }

  function updateExpressionPreparationSection() {
    const section = document.getElementById("online");
    const article = section?.querySelector("#rollouts");
    if (!section || !article) return;

    section.dataset.speakupExpressionPrepared = "true";
    setText(article.querySelector("#card-heading-rollouts"), "先理清，再开练");
    setText(
      article.querySelector(".rich-text p"),
      "SpeakUp 先帮你理清思路，再进入模拟实战。",
    );

    section.querySelector("#shopify-simgym-app")?.remove();
    const contentWrapper = section.firstElementChild;
    [...(contentWrapper?.children || [])].forEach((group) => {
      const isShopifyDetailGroup =
        group.matches(".bg-light") &&
        Boolean(group.querySelector("#manage-store-details-in-the-theme-editor"));
      if (group.id === "tinker-xxl" || isShopifyDetailGroup) group.remove();
    });

    const mediaContainer = article.querySelector("[data-rollout-rive-container]");
    if (!mediaContainer) return;
    mediaContainer.setAttribute("role", "group");
    mediaContainer.setAttribute(
      "aria-label",
      "SpeakUp 从理清思路到进入模拟实战的表达准备演示",
    );

    let stage = mediaContainer.querySelector(
      ':scope > [data-speakup-expression-stage="true"][data-version="1"]',
    );
    if (!stage) stage = buildExpressionPreparationStage();
    if (mediaContainer.children.length !== 1 || mediaContainer.firstElementChild !== stage) {
      mediaContainer.replaceChildren(stage);
    }
    bindExpressionPreparationMedia(article);
  }

  function buildSceneVideo(config, modifier = "") {
    const stage = document.createElement("div");
    stage.className = `speakup-scene-video ${modifier} animate-show-media`.trim();
    stage.innerHTML = `
      <video
        src="${config.video}"
        poster="${config.poster}"
        preload="metadata"
        muted
        autoplay
        loop
        playsinline
        disablepictureinpicture
        aria-label="${config.videoAlt}"
      ></video>`;

    const video = stage.querySelector("video");
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.disablePictureInPicture = true;
    return stage;
  }

  function setPracticeState(feature, showPractice) {
    if (!feature) return;
    feature.dataset.uiState = showPractice ? "practice" : "entry";
    const entry = feature.querySelector('[data-speakup-ui-view="entry"]');
    const practice = feature.querySelector('[data-speakup-ui-view="practice"]');
    const toggle = feature.querySelector("[data-speakup-practice-toggle]");
    const partPicker = feature.querySelector("[data-speakup-practice-parts]");
    entry?.setAttribute("aria-hidden", String(showPractice));
    practice?.setAttribute("aria-hidden", String(!showPractice));
    partPicker?.setAttribute("aria-hidden", String(!showPractice));
    if (!toggle) return;
    toggle.setAttribute("aria-pressed", String(showPractice));
    toggle.setAttribute("aria-expanded", String(showPractice));
    setText(toggle, showPractice ? "返回场景选择" : "进入 IELTS 练习");
  }

  function buildSceneUi(config, chapterId, switchable = false) {
    const stage = document.createElement("div");
    stage.className = `speakup-scene-ui speakup-scene-ui--${chapterId} animate-show-media`;
    stage.dataset.uiState = "entry";
    const stageId = `speakup-${chapterId}-ui`;
    const practiceVideos = Array.isArray(config.practiceVideos)
      ? config.practiceVideos
      : [];
    const hasPracticeVideos = practiceVideos.length > 0;
    stage.innerHTML = `
      <div class="speakup-scene-ui__deck" id="${stageId}">
        <img
          class="speakup-scene-ui__shot speakup-scene-ui__shot--entry"
          data-speakup-ui-view="entry"
          src="${config.entry}"
          alt="${config.entryAlt}"
          loading="lazy"
          decoding="async"
        />
        ${
          switchable && hasPracticeVideos
            ? `<div
                class="speakup-scene-ui__practice-player"
                data-speakup-ui-view="practice"
                aria-hidden="true"
              >
                <video
                  data-speakup-practice-video="true"
                  src="${practiceVideos[0].src}"
                  poster="${practiceVideos[0].poster}"
                  preload="metadata"
                  playsinline
                  controls
                  disablepictureinpicture
                  aria-label="IELTS ${practiceVideos[0].label} 真机练习"
                ></video>
                <span class="speakup-scene-ui__practice-status" aria-live="polite">
                  ${practiceVideos[0].label}
                </span>
              </div>`
            : switchable
            ? `<img
                class="speakup-scene-ui__shot speakup-scene-ui__shot--practice"
                data-speakup-ui-view="practice"
                src="${config.practice}"
                alt="${config.practiceAlt}"
                loading="lazy"
                decoding="async"
                aria-hidden="true"
              />`
            : ""
        }
        ${
          config.deviceVideo
            ? `<video
                class="speakup-scene-ui__device-video"
                data-speakup-device-video="true"
                src="${config.deviceVideo}"
                poster="${config.deviceVideoPoster || config.entry}"
                preload="auto"
                playsinline
                aria-label="${config.deviceVideoLabel}"
                aria-hidden="true"
              ></video>
              <button
                class="speakup-scene-ui__device-play"
                type="button"
                data-speakup-device-play="true"
                aria-label="${config.deviceVideoLabel}"
              >
                <span class="speakup-scene-ui__device-play-prompt" aria-hidden="true">
                  <span class="speakup-scene-ui__device-play-icon">
                    <svg viewBox="0 0 20 20" fill="none">
                      <path d="M7.4 5.55 14 10l-6.6 4.45v-8.9Z" fill="currentColor"/>
                    </svg>
                  </span>
                  <span>播放真机演示</span>
                </span>
              </button>`
            : ""
        }
      </div>
      ${switchable
        ? `<div class="speakup-stage-controls">
            ${hasPracticeVideos
              ? `<div
                  class="speakup-stage-parts"
                  data-speakup-practice-parts="true"
                  role="group"
                  aria-label="选择 IELTS 练习部分"
                  aria-hidden="true"
                >
                  ${practiceVideos.map((item, index) => `
                    <button
                      type="button"
                      data-speakup-practice-part="${index}"
                      aria-pressed="${String(index === 0)}"
                    >${index + 1}</button>`).join("")}
                </div>`
              : ""}
            <button
              class="speakup-stage-toggle"
              type="button"
              data-speakup-practice-toggle="true"
              aria-controls="${stageId}"
              aria-pressed="false"
              aria-expanded="false"
            >进入 IELTS 练习</button>
          </div>`
        : ""}`;

    const toggle = stage.querySelector("[data-speakup-practice-toggle]");
    const practiceVideo = stage.querySelector("[data-speakup-practice-video]");
    const practiceStatus = stage.querySelector(".speakup-scene-ui__practice-status");
    const partButtons = [...stage.querySelectorAll("[data-speakup-practice-part]")];
    const suspendedPracticeVideos = new Set();
    let activePracticePart = 0;
    const suspendOtherPracticeVideos = () => {
      document.querySelectorAll("video").forEach((video) => {
        if (video === practiceVideo || video.paused) return;
        suspendedPracticeVideos.add(video);
        video.pause();
      });
    };
    const resumeOtherPracticeVideos = () => {
      suspendedPracticeVideos.forEach((video) => {
        if (!video.isConnected || document.hidden) return;
        video.play().catch(() => {});
      });
      suspendedPracticeVideos.clear();
    };
    const setActivePracticePart = (index) => {
      if (!practiceVideo || !practiceVideos[index]) return;
      const item = practiceVideos[index];
      activePracticePart = index;
      if (practiceVideo.getAttribute("src") !== item.src) {
        practiceVideo.pause();
        practiceVideo.src = item.src;
        practiceVideo.poster = item.poster;
        practiceVideo.load();
      }
      practiceVideo.setAttribute("aria-label", `IELTS ${item.label} 真机练习`);
      if (practiceStatus) practiceStatus.textContent = item.label;
      partButtons.forEach((button, buttonIndex) => {
        button.setAttribute("aria-pressed", String(buttonIndex === index));
      });
    };
    const playPracticePart = async (index) => {
      if (!practiceVideo) return;
      setActivePracticePart(index);
      suspendOtherPracticeVideos();
      stage.dataset.practiceVideoState = "loading";
      try {
        await practiceVideo.play();
        stage.dataset.practiceVideoState = "playing";
      } catch {
        stage.dataset.practiceVideoState = "paused";
        resumeOtherPracticeVideos();
      }
    };
    const stopPracticeVideo = () => {
      if (!practiceVideo) return;
      practiceVideo.pause();
      if (practiceVideo.readyState > 0) practiceVideo.currentTime = 0;
      stage.dataset.practiceVideoState = "paused";
      resumeOtherPracticeVideos();
    };
    if (toggle) {
      toggle.addEventListener("click", () => {
        const showPractice = stage.dataset.uiState !== "practice";
        setPracticeState(stage, showPractice);
        if (showPractice && practiceVideo) {
          playPracticePart(activePracticePart);
        } else if (practiceVideo) {
          stopPracticeVideo();
        }
      });
      setPracticeState(stage, false);
    }
    if (practiceVideo) {
      partButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.speakupPracticePart);
          if (!Number.isInteger(index) || !practiceVideos[index]) return;
          setPracticeState(stage, true);
          playPracticePart(index);
        });
      });
      practiceVideo.addEventListener("play", () => {
        stage.dataset.practiceVideoState = "playing";
      });
      practiceVideo.addEventListener("pause", () => {
        if (!practiceVideo.ended) stage.dataset.practiceVideoState = "paused";
      });
      practiceVideo.addEventListener("ended", () => {
        const nextPart = activePracticePart + 1;
        if (practiceVideos[nextPart]) {
          playPracticePart(nextPart);
        } else {
          stage.dataset.practiceVideoState = "complete";
          resumeOtherPracticeVideos();
        }
      });
      practiceVideo.addEventListener("error", () => {
        stage.dataset.practiceVideoState = "error";
        resumeOtherPracticeVideos();
      });
      const practiceVisibilityObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting || stage.dataset.uiState !== "practice") return;
          stopPracticeVideo();
          setPracticeState(stage, false);
        },
        { threshold: 0.08 },
      );
      practiceVisibilityObserver.observe(stage);
      setActivePracticePart(0);
      stage.dataset.practiceVideoState = "paused";
    }

    const deviceVideo = stage.querySelector("[data-speakup-device-video]");
    const devicePlay = stage.querySelector("[data-speakup-device-play]");
    if (deviceVideo && devicePlay) {
      const entry = stage.querySelector('[data-speakup-ui-view="entry"]');
      const suspendedVideos = new Set();
      const suspendOtherVideos = () => {
        document.querySelectorAll("video").forEach((video) => {
          if (video === deviceVideo || video.paused) return;
          suspendedVideos.add(video);
          video.pause();
        });
      };
      const resumeOtherVideos = () => {
        suspendedVideos.forEach((video) => {
          if (!video.isConnected || document.hidden) return;
          video.play().catch(() => {});
        });
        suspendedVideos.clear();
      };
      const setDeviceVideoState = (state) => {
        const active = state !== "poster";
        stage.dataset.deviceVideoState = state;
        deviceVideo.setAttribute("aria-hidden", String(!active));
        entry?.setAttribute("aria-hidden", String(active));
        devicePlay.hidden = active;
      };
      const resetDeviceVideo = () => {
        deviceVideo.controls = false;
        if (deviceVideo.readyState > 0) deviceVideo.currentTime = 0;
        setDeviceVideoState("poster");
        resumeOtherVideos();
      };
      devicePlay.addEventListener("click", async () => {
        suspendOtherVideos();
        setDeviceVideoState("loading");
        deviceVideo.controls = true;
        try {
          await deviceVideo.play();
          setDeviceVideoState("playing");
        } catch {
          resetDeviceVideo();
        }
      });
      deviceVideo.addEventListener("play", () => setDeviceVideoState("playing"));
      deviceVideo.addEventListener("ended", resetDeviceVideo);
      deviceVideo.addEventListener("error", resetDeviceVideo);
      const visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting || stage.dataset.deviceVideoState === "poster") return;
          deviceVideo.pause();
          resetDeviceVideo();
        },
        { threshold: 0.08 },
      );
      visibilityObserver.observe(stage);
      setDeviceVideoState("poster");
    }
    return stage;
  }

  function buildSceneCopy(config, chapterId) {
    const copy = document.createElement("div");
    copy.className = "speakup-scene-copy";
    copy.innerHTML = `
      <h3 id="speakup-${chapterId}-feature-heading">${config.heading}</h3>
      <div class="rich-text"><p>${config.description}</p></div>`;
    return copy;
  }

  function buildInterviewFeature(config, type) {
    const feature = document.createElement("div");
    feature.className = `speakup-scene-feature speakup-scene-feature--interview speakup-scene-feature--${type}`;
    feature.dataset.speakupSceneFeature = `interview-${type}`;
    feature.dataset.version = "1";
    if (type === "video") {
      feature.append(buildSceneCopy(config, "interview"), buildSceneVideo(config));
    } else {
      feature.append(buildSceneUi(config, "interview"));
    }
    return feature;
  }

  function buildIeltsFeature(config) {
    const feature = document.createElement("div");
    feature.className = "speakup-scene-feature speakup-scene-feature--ielts";
    feature.dataset.speakupSceneFeature = "ielts";
    feature.dataset.version = "1";
    const stage = document.createElement("div");
    stage.className = "speakup-scene-composition animate-show-media";
    stage.append(
      buildSceneVideo(config, "speakup-scene-video--composition"),
      buildSceneUi(config, "ielts", true),
    );
    feature.append(buildSceneCopy(config, "ielts"), stage);
    return feature;
  }

  function buildGridFeature(config, chapterId, type) {
    const feature = document.createElement("div");
    feature.className = `speakup-scene-card speakup-scene-card--${type}`;
    feature.dataset.speakupSceneFeature = `${chapterId}-${type}`;
    feature.dataset.version = "1";
    if (type === "video") {
      feature.append(buildSceneVideo(config), buildSceneCopy(config, chapterId));
    } else {
      feature.append(buildSceneUi(config, chapterId));
    }
    return feature;
  }

  function buildOutcomeImageFeature(config, chapterId) {
    const feature = document.createElement("div");
    feature.className = [
      "speakup-outcome-card",
      `speakup-outcome-card--${chapterId}`,
      config.variant ? `speakup-outcome-card--${config.variant}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    feature.dataset.speakupSceneFeature = config.marker;
    feature.dataset.speakupOutcomeFeature = config.marker;
    feature.dataset.version = "1";
    feature.innerHTML = `
      <div class="speakup-outcome-card__media animate-show-media">
        <img
          src="${config.image}"
          alt="${config.alt}"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="speakup-outcome-card__copy">
        <span class="speakup-outcome-card__step" aria-hidden="true">${config.step}</span>
        <div>
          <h3>${config.heading}</h3>
          <p>${config.description}</p>
        </div>
      </div>`;
    return feature;
  }

  function buildMemorySwitch() {
    const feature = document.createElement("div");
    feature.className =
      "speakup-outcome-card speakup-outcome-card--memory speakup-outcome-card--memory-switch";
    feature.dataset.speakupSceneFeature = "memory-switch";
    feature.dataset.speakupOutcomeFeature = "memory-switch";
    feature.dataset.version = "1";

    const cards = memoryChapter.switchCards
      .map(
        (card, index) => `
          <div
            class="speakup-memory-switch__card"
            data-memory-switch-card="true"
            data-slot="${index}"
            aria-hidden="${index === 0 ? "false" : "true"}"
          >
            <span class="speakup-memory-switch__meta">SpeakUp Memory · 0${index + 1}</span>
            <span class="speakup-memory-switch__label">${card.label}</span>
            <strong>${card.value}</strong>
            <p>${card.description}</p>
          </div>`,
      )
      .join("");

    feature.innerHTML = `
      <div
        class="speakup-memory-switch animate-show-media"
        data-memory-switch="true"
        role="group"
        aria-label="SpeakUp 记住目标、经历和反复卡点"
      >
        <div class="speakup-memory-switch__stage">${cards}</div>
      </div>
      <div class="speakup-outcome-card__copy">
        <span class="speakup-outcome-card__step" aria-hidden="true">01</span>
        <div>
          <h3>下一次，不再从零开始</h3>
          <p>目标、经历和卡点，会接着上一轮出现。</p>
        </div>
      </div>`;
    return feature;
  }

  function setMemorySwitchIndex(root, activeIndex) {
    const cards = [...root.querySelectorAll("[data-memory-switch-card]")];
    cards.forEach((card, index) => {
      const slot = (index - activeIndex + cards.length) % cards.length;
      const hidden = slot !== 0;
      card.classList.remove("is-exiting");
      card.dataset.slot = String(slot);
      card.setAttribute("aria-hidden", String(hidden));
      card.inert = hidden;
    });
    root.dataset.activeCard = String(activeIndex);
  }

  function bindMemorySwitch(root) {
    if (!root || memorySwitchControllers.has(root)) return;
    const cards = [...root.querySelectorAll("[data-memory-switch-card]")];
    if (cards.length < 2) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeIndex = 0;
    let inView = false;
    let interactionPaused = false;
    let waitTimer = 0;
    let transitionTimer = 0;
    let observer;

    const clearTimers = () => {
      window.clearTimeout(waitTimer);
      window.clearTimeout(transitionTimer);
      waitTimer = 0;
      transitionTimer = 0;
    };

    const removeListeners = () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      root.removeEventListener("mouseenter", handleInteractionStart);
      root.removeEventListener("mouseleave", handleInteractionEnd);
      root.removeEventListener("focusin", handleInteractionStart);
      root.removeEventListener("focusout", handleFocusOut);
    };

    const stop = () => {
      clearTimers();
      removeListeners();
    };

    const schedule = () => {
      if (
        reducedMotion ||
        !inView ||
        interactionPaused ||
        document.hidden ||
        waitTimer ||
        transitionTimer
      ) {
        return;
      }
      if (!root.isConnected) {
        stop();
        return;
      }
      waitTimer = window.setTimeout(() => {
        waitTimer = 0;
        const current = cards[activeIndex];
        current.classList.add("is-exiting");
        transitionTimer = window.setTimeout(() => {
          transitionTimer = 0;
          activeIndex = (activeIndex + 1) % cards.length;
          setMemorySwitchIndex(root, activeIndex);
          schedule();
        }, 520);
      }, 2400);
    };

    function pauseWaiting() {
      window.clearTimeout(waitTimer);
      waitTimer = 0;
    }

    function handleInteractionStart() {
      interactionPaused = true;
      pauseWaiting();
    }

    function handleInteractionEnd() {
      interactionPaused = false;
      schedule();
    }

    function handleFocusOut(event) {
      if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return;
      handleInteractionEnd();
    }

    function handleVisibility() {
      if (document.hidden) {
        pauseWaiting();
      } else {
        schedule();
      }
    }

    setMemorySwitchIndex(root, activeIndex);
    root.dataset.switchBound = "true";
    memorySwitchControllers.set(root, { stop });

    if (reducedMotion) {
      root.dataset.motion = "static";
      return;
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        if (!inView) {
          pauseWaiting();
        } else {
          schedule();
        }
      },
      { threshold: [0, 0.25, 0.5] },
    );
    observer.observe(root);
    document.addEventListener("visibilitychange", handleVisibility);
    root.addEventListener("mouseenter", handleInteractionStart);
    root.addEventListener("mouseleave", handleInteractionEnd);
    root.addEventListener("focusin", handleInteractionStart);
    root.addEventListener("focusout", handleFocusOut);
  }

  function installSceneFeature(article, marker, build) {
    if (!article) return null;
    let feature = article.querySelector(
      `:scope > [data-speakup-scene-feature="${marker}"][data-version="1"]`,
    );
    if (!feature) feature = build();
    if (article.children.length !== 1 || article.firstElementChild !== feature) {
      article.replaceChildren(feature);
    }
    const practicePlaybackActive = Boolean(
      feature.querySelector(
        '.speakup-scene-ui[data-ui-state="practice"] [data-speakup-practice-video]',
      ),
    );
    feature
      .querySelectorAll(
        "video:not([data-speakup-device-video]):not([data-speakup-practice-video])",
      )
      .forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.controls = false;
      video.querySelectorAll("source").forEach((source) => source.remove());
      if (practicePlaybackActive) {
        if (!video.paused) video.pause();
      } else if (video.paused) {
        video.play().catch(() => {});
      }
      });
    return feature;
  }

  function removeUnkeptArticles(group, keepIds) {
    if (!group) return;
    group.querySelectorAll("article").forEach((article) => {
      if (!keepIds.includes(article.id)) article.remove();
    });
  }

  function updateSceneChapters() {
    const interviewSection = document.getElementById("retail");
    if (interviewSection) {
      interviewSection.dataset.speakupSceneChapter = "interview";
      const wrapper = interviewSection.firstElementChild;
      [...(wrapper?.children || [])].forEach((group) => {
        if (group.matches(".bg-light")) group.remove();
      });
      const collection = interviewSection.querySelector("#pos-hub-collection");
      removeUnkeptArticles(collection, ["pos-hub", "connections-that-never-drop"]);
      const videoArticle = collection?.querySelector("#pos-hub");
      const uiArticle = collection?.querySelector("#connections-that-never-drop");
      videoArticle?.classList.add("speakup-scene-article", "speakup-scene-article--video");
      uiArticle?.classList.add("speakup-scene-article", "speakup-scene-article--ui");
      installSceneFeature(videoArticle, "interview-video", () =>
        buildInterviewFeature(sceneChapters.interview, "video"),
      );
      installSceneFeature(uiArticle, "interview-ui", () =>
        buildInterviewFeature(sceneChapters.interview, "ui"),
      );
    }

    const ieltsSection = document.getElementById("marketing");
    if (ieltsSection) {
      ieltsSection.dataset.speakupSceneChapter = "ielts";
      const wrapper = ieltsSection.firstElementChild;
      [...(wrapper?.children || [])].forEach((group) => {
        if (group.matches(".bg-light")) group.remove();
      });
      const article = ieltsSection.querySelector("#shopify-product-network");
      article?.classList.add("speakup-scene-article", "speakup-scene-article--ielts");
      installSceneFeature(article, "ielts", () =>
        buildIeltsFeature(sceneChapters.ielts),
      );
    }

    const workplaceSection = document.getElementById("checkout");
    if (workplaceSection) {
      workplaceSection.dataset.speakupSceneChapter = "workplace";
      const group = [...(workplaceSection.firstElementChild?.children || [])].find((node) =>
        node.matches(".bg-light"),
      );
      const videoId = "personalized-shop-pay-button";
      const uiId = "checkout-and-accounts-customization-per-market";
      removeUnkeptArticles(group, [videoId, uiId]);
      group?.classList.add("speakup-scene-grid", "speakup-scene-grid--workplace");
      group
        ?.querySelector(":scope > div > .full-bleed.bg-grey-light")
        ?.remove();
      const videoArticle = group?.querySelector(`#${videoId}`);
      const uiArticle = group?.querySelector(`#${uiId}`);
      videoArticle?.classList.add("speakup-scene-card-host", "speakup-scene-card-host--video");
      uiArticle?.classList.add("speakup-scene-card-host", "speakup-scene-card-host--ui");
      installSceneFeature(videoArticle, "workplace-video", () =>
        buildGridFeature(sceneChapters.workplace, "workplace", "video"),
      );
      installSceneFeature(uiArticle, "workplace-ui", () =>
        buildGridFeature(sceneChapters.workplace, "workplace", "ui"),
      );
    }

    const travelSection = document.getElementById("operations");
    if (travelSection) {
      travelSection.dataset.speakupSceneChapter = "travel";
      const group = [...(travelSection.firstElementChild?.children || [])].find((node) =>
        node.matches(".bg-light"),
      );
      const videoId = "flexible-inventory-transfers";
      const uiId = "quick-sale-in-the-shopify-mobile-app";
      removeUnkeptArticles(group, [videoId, uiId]);
      group?.classList.add("speakup-scene-grid", "speakup-scene-grid--travel");
      group
        ?.querySelector(":scope > div > .full-bleed.bg-grey-light")
        ?.remove();
      const videoArticle = group?.querySelector(`#${videoId}`);
      const uiArticle = group?.querySelector(`#${uiId}`);
      videoArticle?.classList.add("speakup-scene-card-host", "speakup-scene-card-host--video");
      uiArticle?.classList.add("speakup-scene-card-host", "speakup-scene-card-host--ui");
      installSceneFeature(videoArticle, "travel-video", () =>
        buildGridFeature(sceneChapters.travel, "travel", "video"),
      );
      installSceneFeature(uiArticle, "travel-ui", () =>
        buildGridFeature(sceneChapters.travel, "travel", "ui"),
      );
    }
  }

  function updateImmediateFeedbackChapter() {
    const section = document.getElementById("shop-app");
    if (!section) return;
    section.dataset.speakupOutcomeChapter = "feedback";

    const group = [...(section.firstElementChild?.children || [])].find((node) =>
      node.matches(".bg-light"),
    );
    if (!group) return;
    group.classList.add("speakup-outcome-grid", "speakup-outcome-grid--feedback");
    removeUnkeptArticles(group, feedbackChapter.keepIds);

    feedbackChapter.cards.forEach((card) => {
      const article = group.querySelector(`#${card.articleId}`);
      article?.classList.add(
        "speakup-outcome-card-host",
        `speakup-outcome-card-host--${card.marker}`,
      );
      installSceneFeature(article, card.marker, () =>
        buildOutcomeImageFeature(card, "feedback"),
      );
    });
  }

  function updatePracticeReviewChapter() {
    const section = document.getElementById("b2b");
    if (!section) return;
    section.dataset.speakupOutcomeChapter = "review";

    const group = [...(section.firstElementChild?.children || [])].find((node) =>
      node.matches(".bg-light"),
    );
    if (!group) return;
    group.classList.add("speakup-outcome-grid", "speakup-outcome-grid--review");
    removeUnkeptArticles(group, reviewChapter.keepIds);

    reviewChapter.cards.forEach((card) => {
      const article = group.querySelector(`#${card.articleId}`);
      article?.classList.add(
        "speakup-outcome-card-host",
        `speakup-outcome-card-host--${card.marker}`,
      );
      installSceneFeature(article, card.marker, () =>
        buildOutcomeImageFeature(card, "review"),
      );
    });

    groupPracticeReviewCards(group);
    bindPracticeReviewReveal(group);
  }

  function groupPracticeReviewCards(group) {
    const grid = group?.querySelector(":scope > .grid-template-with-gaps");
    if (!grid) return;

    const cases = [
      {
        id: "daily",
        eyebrow: "DAILY REVIEW · 01—02",
        heading: "日常英语",
        description: "从整体表现到具体问题",
        articleIds: [
          "shopify-collective-available-globally",
          "ach-payments-for-b2b",
        ],
      },
      {
        id: "ielts",
        eyebrow: "IELTS REVIEW · 03—04",
        heading: "IELTS 模考",
        description: "从阶段估分到下一轮动作",
        articleIds: [
          "suppliers-can-discover-retailers",
          "payment-requests-per-fulfillment",
        ],
      },
    ];

    const panels = cases.map((config) => {
      let panel = grid.querySelector(
        `:scope > [data-speakup-review-case="${config.id}"]`,
      );
      if (!panel) {
        panel = document.createElement("div");
        panel.className = `speakup-review-case speakup-review-case--${config.id}`;
        panel.dataset.speakupReviewCase = config.id;
        panel.setAttribute("role", "group");
        panel.setAttribute("aria-labelledby", `speakup-review-case-${config.id}`);
        panel.innerHTML = `
          <header class="speakup-review-case__header">
            <span>${config.eyebrow}</span>
            <h3 id="speakup-review-case-${config.id}">${config.heading}</h3>
            <p>${config.description}</p>
          </header>`;
      }
      const header = panel.querySelector(":scope > .speakup-review-case__header");
      const articles = config.articleIds
        .map((articleId) => group.querySelector(`#${articleId}`))
        .filter(Boolean);
      const desiredChildren = [header, ...articles].filter(Boolean);
      if (
        panel.children.length !== desiredChildren.length ||
        desiredChildren.some((child, index) => panel.children[index] !== child)
      ) {
        panel.replaceChildren(...desiredChildren);
      }
      return panel;
    });

    if (
      grid.children.length !== panels.length ||
      panels.some((panel, index) => grid.children[index] !== panel)
    ) {
      grid.replaceChildren(...panels);
    }
  }

  function bindPracticeReviewReveal(group) {
    if (!group || group.dataset.speakupReviewRevealBound) return;
    group.dataset.speakupReviewRevealBound = "true";

    const cards = [
      ...group.querySelectorAll(
        ".speakup-outcome-card-host[data-component-name='product']",
      ),
    ];
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!("IntersectionObserver" in window) || reducedMotion) {
      cards.forEach((card) => card.classList.add("is-review-visible"));
      return;
    }

    group.classList.add("is-review-reveal-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-review-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );
    cards.forEach((card) => observer.observe(card));
  }

  function updateTrainingMemoryChapter() {
    const section = document.getElementById("finance");
    if (!section) return;
    section.dataset.speakupOutcomeChapter = "memory";

    const group = [...(section.firstElementChild?.children || [])].find((node) =>
      node.matches(".bg-light"),
    );
    if (!group) return;
    group.classList.add("speakup-outcome-grid", "speakup-outcome-grid--memory");
    removeUnkeptArticles(group, memoryChapter.keepIds);

    const switchArticle = group.querySelector(
      "#continuous-funding-with-the-shopify-capital-flex-account",
    );
    switchArticle?.classList.add(
      "speakup-outcome-card-host",
      "speakup-outcome-card-host--memory-switch",
    );
    const switchFeature = installSceneFeature(switchArticle, "memory-switch", () =>
      buildMemorySwitch(),
    );
    bindMemorySwitch(
      switchFeature?.querySelector("[data-memory-switch]"),
    );

    memoryChapter.cards.forEach((card) => {
      const article = group.querySelector(`#${card.articleId}`);
      article?.classList.add(
        "speakup-outcome-card-host",
        `speakup-outcome-card-host--${card.marker}`,
      );
      installSceneFeature(article, card.marker, () =>
        buildOutcomeImageFeature(card, "memory"),
      );
    });
  }

  function updateChapterLink(link, id, chapter) {
    if (!link || link.closest("article")) return;
    setText(link, chapter.label);
    link.href = `${PUBLIC_ROUTE}#${chapter.slug}`;
    link.dataset.speakupChapterLink = id;
  }

  function publicHashFor(token) {
    if (chaptersBySourceId[token]) return chaptersBySourceId[token].slug;
    if (chapterIdBySlug.has(token)) return token;
    return token;
  }

  function publishPublicLocation(publicHash, { replace = true } = {}) {
    if (isEmbedded) {
      window.parent.postMessage(
        { type: "speakup-route", hash: publicHash, replace },
        location.origin,
      );
      return;
    }
    const nextLocation = `${PUBLIC_ROUTE}${location.search}${publicHash ? `#${publicHash}` : ""}`;
    history[replace ? "replaceState" : "pushState"](history.state, "", nextLocation);
  }

  function syncPublicAddress() {
    const token = location.hash.replace(/^#/, "");
    const publicHash = publicHashFor(token);
    if (isEmbedded) {
      publishPublicLocation(publicHash);
      return publicHash;
    }
    const nextLocation = `${PUBLIC_ROUTE}${location.search}${publicHash ? `#${publicHash}` : ""}`;
    const currentLocation = `${location.pathname}${location.search}${location.hash}`;
    if (currentLocation !== nextLocation) {
      history.replaceState(history.state, "", nextLocation);
    }
    return publicHash;
  }

  function scrollToPublicHash(behavior = "smooth") {
    const token = location.hash.replace(/^#/, "");
    if (!token || token === "top" || token === "hero") return;
    const sourceId = chapterIdBySlug.get(token) || (chaptersBySourceId[token] ? token : null);
    if (!sourceId || routedPublicHash === token) return;
    const target = document.getElementById(sourceId);
    if (!target) return;
    routedPublicHash = token;
    window.requestAnimationFrame(() => target.scrollIntoView({ behavior, block: "start" }));
  }

  function navigateToChapter(
    id,
    { replace = false, behavior = "smooth", publish = true } = {},
  ) {
    const chapter = chaptersBySourceId[id];
    if (!chapter) return;
    if (isEmbedded) {
      const internalLocation = `${location.pathname}${location.search}#${id}`;
      const currentLocation = `${location.pathname}${location.search}${location.hash}`;
      if (internalLocation !== currentLocation) {
        history.replaceState(history.state, "", internalLocation);
      }
    }
    if (publish) publishPublicLocation(chapter.slug, { replace });
    routedPublicHash = isEmbedded ? id : chapter.slug;
    bypassSecondaryEditionLoader = true;
    syncEditionLoaderScope();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior, block: "start" });
    }
  }

  function navigateHome({ replace = false, publish = true } = {}) {
    if (isEmbedded && location.hash) {
      history.replaceState(history.state, "", `${location.pathname}${location.search}`);
    }
    if (publish) publishPublicLocation("", { replace });
    routedPublicHash = null;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePublicLocationChange(behavior = "smooth") {
    syncPublicAddress();
    const token = location.hash.replace(/^#/, "");
    if (token === routedPublicHash) return;
    routedPublicHash = null;
    scrollToPublicHash(behavior);
  }

  function bindPublicNavigation() {
    if (document.documentElement.dataset.speakupPublicNavigationBound) return;
    document.documentElement.dataset.speakupPublicNavigationBound = "true";
    document.addEventListener(
      "click",
      (event) => {
        if (!(event.target instanceof Element)) return;
        const chapterLink = event.target.closest("a[data-speakup-chapter-link]");
        if (chapterLink) {
          event.preventDefault();
          event.stopImmediatePropagation();
          navigateToChapter(chapterLink.dataset.speakupChapterLink);
          return;
        }
        const homeLink = event.target.closest("a[data-speakup-home-link]");
        if (!homeLink) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        navigateHome();
      },
      true,
    );

    window.addEventListener("message", (event) => {
      if (!isEmbedded || event.origin !== location.origin || event.source !== window.parent) return;
      if (event.data?.type !== "speakup-navigate") return;
      const publicHash = String(event.data.hash || "");
      const id = chapterIdBySlug.get(publicHash);
      if (id) {
        navigateToChapter(id, { replace: true, behavior: "smooth", publish: false });
      } else if (!publicHash || publicHash === "top" || publicHash === "hero") {
        navigateHome({ replace: true, publish: false });
      }
    });
  }

  function setMetaContent(attribute, name, content) {
    let meta = document.head.querySelector(`meta[${attribute}="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attribute, name);
      document.head.append(meta);
    }
    if (meta.content !== content) meta.content = content;
  }

  function updatePageMetadata() {
    const publicUrl = new URL(PUBLIC_ROUTE, location.origin).href;
    const shareImage = new URL("/assets/speakup/hero-desktop.png", location.origin).href;
    document.title = PAGE_TITLE;
    setMetaContent("name", "description", PAGE_DESCRIPTION);
    setMetaContent("property", "og:title", PAGE_TITLE);
    setMetaContent("property", "og:description", PAGE_DESCRIPTION);
    setMetaContent("property", "og:site_name", "SpeakUp");
    setMetaContent("property", "og:type", "website");
    setMetaContent("property", "og:url", publicUrl);
    setMetaContent("property", "og:image", shareImage);
    setMetaContent("name", "image", shareImage);
    setMetaContent("name", "twitter:card", "summary_large_image");
    setMetaContent("name", "twitter:title", PAGE_TITLE);
    setMetaContent("name", "twitter:description", PAGE_DESCRIPTION);
    setMetaContent("name", "twitter:image", shareImage);

    document
      .querySelectorAll('meta[name="twitter:site"], meta[name="twitter:account_id"], link[rel="alternate"]')
      .forEach((node) => node.remove());

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    if (canonical.href !== publicUrl) canonical.href = publicUrl;

    let icon = document.head.querySelector('link[data-speakup-icon="true"]');
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      icon.type = "image/svg+xml";
      icon.dataset.speakupIcon = "true";
      document.head.append(icon);
    }
    if (icon.getAttribute("href") !== COLOR_MARK_URL) icon.href = COLOR_MARK_URL;
    document.head
      .querySelectorAll('link[rel*="icon"]:not([data-speakup-icon="true"])')
      .forEach((node) => node.remove());
  }

  function updateAllDirectoryLinks() {
    for (const [id, chapter] of Object.entries(chaptersBySourceId)) {
      document
        .querySelectorAll(
          `a[href$="#${id}"], a[href$="#${chapter.slug}"], a[data-speakup-chapter-link="${id}"]`,
        )
        .forEach((link) => updateChapterLink(link, id, chapter));
    }
  }

  function bindHeroPointerCamera(wrapper, art) {
    if (heroCameraController?.wrapper === wrapper && heroCameraController.art === art) return;
    heroCameraController?.stop();

    const supportsPointerCamera = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    ).matches;
    if (!supportsPointerCamera) {
      art.dataset.cameraMotion = "static";
      heroCameraController = { wrapper, art, stop() {} };
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;
    let lastFrameTime = 0;

    const render = (time) => {
      const elapsed = lastFrameTime ? Math.min(1000, time - lastFrameTime) : 1000 / 60;
      const ease = 1 - Math.exp(-elapsed / 115);
      lastFrameTime = time;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      art.style.setProperty("--speakup-hero-pan-x", `${(-currentX * 14).toFixed(2)}px`);
      art.style.setProperty("--speakup-hero-pan-y", `${(-currentY * 10).toFixed(2)}px`);
      art.style.setProperty("--speakup-hero-tilt-x", `${(-currentY * 1.1).toFixed(3)}deg`);
      art.style.setProperty("--speakup-hero-tilt-y", `${(currentX * 1.45).toFixed(3)}deg`);
      art.style.setProperty("--speakup-hero-light-x", `${(50 + currentX * 9).toFixed(2)}%`);
      art.style.setProperty("--speakup-hero-light-y", `${(44 + currentY * 7).toFixed(2)}%`);

      if (
        Math.abs(targetX - currentX) > 0.001 ||
        Math.abs(targetY - currentY) > 0.001
      ) {
        frame = window.requestAnimationFrame(render);
      } else {
        currentX = targetX;
        currentY = targetY;
        frame = 0;
        lastFrameTime = 0;
      }
    };

    const requestRender = () => {
      if (!frame) {
        lastFrameTime = 0;
        frame = window.requestAnimationFrame(render);
      }
    };

    const handlePointerMove = (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      const rect = wrapper.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom ||
        getComputedStyle(art).visibility === "hidden"
      ) {
        resetCamera();
        return;
      }
      targetX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      targetY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
      requestRender();
    };

    const resetCamera = () => {
      targetX = 0;
      targetY = 0;
      requestRender();
    };

    const handleVisibility = () => {
      if (document.hidden) resetCamera();
    };

    const handlePointerOut = (event) => {
      if (!event.relatedTarget) resetCamera();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mouseout", handlePointerOut, { passive: true });
    window.addEventListener("blur", resetCamera);
    document.addEventListener("visibilitychange", handleVisibility);
    art.dataset.cameraMotion = "pointer";

    heroCameraController = {
      wrapper,
      art,
      stop() {
        window.cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("mouseout", handlePointerOut);
        window.removeEventListener("blur", resetCamera);
        document.removeEventListener("visibilitychange", handleVisibility);
      },
    };
  }

  function ensureHeroArt() {
    const wrapper = document.querySelector(".canvas-wrapper");
    if (!wrapper) return;

    let picture = wrapper.querySelector(".speakup-hero-art");
    if (!picture) {
      picture = document.createElement("picture");
      picture.className = "speakup-hero-art";
      picture.setAttribute("aria-hidden", "true");
      picture.innerHTML = `
        <source media="(max-width: 767px)" type="image/webp" srcset="/assets/speakup/hero-mobile.webp" />
        <source media="(max-width: 767px)" srcset="/assets/speakup/hero-mobile.png" />
        <source type="image/webp" srcset="/assets/speakup/hero-desktop.webp" />
        <img src="/assets/speakup/hero-desktop.png" alt="" decoding="async" fetchpriority="high" />`;
      wrapper.append(picture);
    }
    const heroImage = picture.querySelector("img");
    if (isEmbedded && heroImage && !runtimeReadyPublished) {
      const publishRuntimeReady = async () => {
        if (runtimeReadyPublished) return;
        runtimeReadyPublished = true;
        if (location.hash === "#sidekick") {
          window.setTimeout(() => {
            window.parent.postMessage({ type: "speakup-runtime-ready" }, location.origin);
          }, 12000);
          return;
        }
        try {
          await heroImage.decode();
        } catch {}
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            window.setTimeout(() => {
              window.parent.postMessage({ type: "speakup-runtime-ready" }, location.origin);
            }, 1600);
          });
        });
      };
      if (location.hash === "#sidekick") publishRuntimeReady();
      else if (heroImage.complete && heroImage.naturalWidth > 0) publishRuntimeReady();
      else {
        heroImage.addEventListener("load", publishRuntimeReady, { once: true });
        heroImage.addEventListener("error", publishRuntimeReady, { once: true });
      }
    }
    bindHeroPointerCamera(wrapper, picture);
    updateHeroOpacity();
  }

  function updateAiTeacherVideoCard() {
    const mediaWrapper = document.querySelector("#sidekick-video .media-wrapper");
    if (!mediaWrapper) return;

    mediaWrapper.classList.add("speakup-ai-teacher-media");
    mediaWrapper.style.setProperty(
      "--speakup-ai-teacher-poster",
      `url("${AI_TEACHER_VIDEO_POSTER_URL}")`,
    );

    // Leave the mirrored component's React-managed media subtree untouched.
    // Project-owned poster/video siblings can remain mounted while the source
    // component lazily creates and destroys its own hidden player.
    let poster = mediaWrapper.querySelector(
      ':scope > img[data-speakup-ai-teacher-poster="true"]',
    );
    if (!poster) {
      poster = document.createElement("img");
      poster.dataset.speakupAiTeacherPoster = "true";
      mediaWrapper.append(poster);
    }
    if (poster.getAttribute("src") !== AI_TEACHER_VIDEO_POSTER_URL) {
      poster.src = AI_TEACHER_VIDEO_POSTER_URL;
    }
    poster.width = 536;
    poster.height = 960;
    poster.alt = "SpeakUp 先理解你功能演示";
    poster.loading = "eager";
    poster.classList.add("speakup-ai-teacher-poster");

    // Keep one project-owned player mounted directly on the stable media
    // wrapper so loop and scroll transitions cannot expose the source
    // component's intermittent error surface.

    let previewVideo = mediaWrapper.querySelector(
      ':scope > video[data-speakup-ai-teacher-player="true"]',
    );
    if (!previewVideo) {
      delete mediaWrapper.dataset.speakupVideoReady;
      previewVideo = document.createElement("video");
      previewVideo.dataset.speakupAiTeacherPlayer = "true";
      previewVideo.setAttribute("aria-label", "SpeakUp 先理解你功能演示视频");
      mediaWrapper.append(previewVideo);
    }

    if (previewVideo) {
      const sourceChanged = previewVideo.getAttribute("src") !== AI_TEACHER_VIDEO_URL;
      if (sourceChanged) {
        delete mediaWrapper.dataset.speakupVideoReady;
        previewVideo.src = AI_TEACHER_VIDEO_URL;
      }
      previewVideo.poster = AI_TEACHER_VIDEO_POSTER_URL;
      previewVideo.muted = true;
      previewVideo.defaultMuted = true;
      previewVideo.autoplay = true;
      previewVideo.loop = true;
      previewVideo.playsInline = true;
      previewVideo.controls = false;
      previewVideo.disablePictureInPicture = true;
      previewVideo.preload = "auto";
      previewVideo.classList.add("speakup-ai-teacher-preview-video");

      if (!previewVideo.dataset.speakupReadyBound) {
        previewVideo.dataset.speakupReadyBound = "true";
        const showPoster = () => {
          delete mediaWrapper.dataset.speakupVideoReady;
        };
        const revealVideo = () => {
          if (previewVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            mediaWrapper.dataset.speakupVideoReady = "true";
          }
        };
        previewVideo.addEventListener("loadeddata", revealVideo);
        previewVideo.addEventListener("canplay", revealVideo);
        previewVideo.addEventListener("playing", revealVideo);
        previewVideo.addEventListener("emptied", showPoster);
        previewVideo.addEventListener("error", showPoster);
      }
      if (previewVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        mediaWrapper.dataset.speakupVideoReady = "true";
      }
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

  function buildSocialWall() {
    const wall = document.createElement("section");
    wall.id = "speakup-social-wall";
    wall.className = "speakup-social-wall col-span-full";
    wall.dataset.speakupSocialWall = "true";
    wall.dataset.speakupWallVersion = "1";
    wall.setAttribute("aria-labelledby", "speakup-social-wall-title");
    wall.innerHTML = `
      <header class="speakup-social-wall__header">
        <div>
          <p class="speakup-social-wall__eyebrow">
            <span>FIELD NOTES</span>
            <span>07 STORIES</span>
          </p>
          <h4 id="speakup-social-wall-title">SpeakUp <em>in the wild</em></h4>
        </div>
        <p class="speakup-social-wall__intro">从真实困扰、真实练习到产品实验，我们把每一次“开不了口”持续记录下来。</p>
      </header>
      <div class="speakup-social-wall__grid">
        ${socialPosts
          .map(
            (post, index) => `
              <a
                id="social-story-${post.id}"
                class="speakup-social-story"
                data-story-index="${index + 1}"
                href="${post.href}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="在${post.platform}打开：${post.title}"
                style="--story-index: ${index}; --media-ratio: ${post.width} / ${post.height}"
              >
                <figure>
                  <div class="speakup-social-story__media">
                    <img
                      src="${post.image}"
                      width="${post.width}"
                      height="${post.height}"
                      loading="lazy"
                      decoding="async"
                      alt="《${post.title}》${post.platform}笔记封面"
                    />
                    ${
                      post.type === "视频"
                        ? '<span class="speakup-social-story__play" aria-hidden="true">▶</span>'
                        : ""
                    }
                  </div>
                  <figcaption>
                    <p class="speakup-social-story__meta">
                      <span>${String(index + 1).padStart(2, "0")}</span>
                      <span>${post.platform} · ${post.type}</span>
                      <span aria-hidden="true">↗</span>
                    </p>
                    <h5>${post.title}</h5>
                    <p>${post.excerpt}</p>
                  </figcaption>
                </figure>
              </a>`,
          )
          .join("")}
      </div>`;
    return wall;
  }

  function bindSocialWallReveal(wall) {
    if (wall.dataset.speakupRevealBound) return;
    wall.dataset.speakupRevealBound = "true";

    const stories = [...wall.querySelectorAll(".speakup-social-story")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reducedMotion) {
      stories.forEach((story) => story.classList.add("is-visible"));
      return;
    }

    wall.classList.add("is-reveal-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );
    stories.forEach((story) => observer.observe(story));
  }

  function layoutSocialWallMasonry() {
    socialMasonryFrame = 0;
    const grid = document.querySelector("#speakup-social-wall .speakup-social-wall__grid");
    if (!grid) return;

    const stories = [...grid.querySelectorAll(".speakup-social-story")];
    if (window.innerWidth <= 768) {
      grid.classList.remove("is-masonry-ready");
      delete grid.dataset.speakupMasonryColumns;
      stories.forEach((story) => {
        story.style.removeProperty("--masonry-span");
        story.style.removeProperty("grid-column");
        story.style.removeProperty("grid-row-start");
      });
      return;
    }

    const columnCount = window.innerWidth >= 940 ? 3 : 2;
    if (grid.dataset.speakupMasonryColumns !== String(columnCount)) {
      grid.classList.remove("is-masonry-ready");
      stories.forEach((story) => {
        story.style.removeProperty("grid-column");
        story.style.removeProperty("grid-row-start");
      });
      grid.dataset.speakupMasonryColumns = String(columnCount);
    }

    const rowHeight = 8;
    const verticalGap = window.innerWidth >= 940 ? 58 : 48;
    const spans = stories.map((story) => {
      const height = story.getBoundingClientRect().height;
      return Math.max(1, Math.ceil((height + verticalGap) / rowHeight));
    });

    const columnGroups =
      columnCount === 3
        ? [
            [0, 3, 4],
            [1, 5],
            [2, 6],
          ]
        : [
            [0, 3, 4, 6],
            [1, 2, 5],
          ];
    const maximumOffsets = columnCount === 3 ? [0, 18, 27] : [0, 12];
    const columnTotals = columnGroups.map((indices) =>
      indices.reduce((total, index) => total + (spans[index] || 0), 0),
    );
    const tallestColumn = Math.max(...columnTotals);
    const tracksPerColumn = 12 / columnCount;

    columnGroups.forEach((indices, columnIndex) => {
      const balancingOffset = Math.max(0, tallestColumn - columnTotals[columnIndex]);
      const topOffset = Math.min(balancingOffset, maximumOffsets[columnIndex]);
      let rowStart = 1 + topOffset;

      indices.forEach((storyIndex) => {
        const story = stories[storyIndex];
        if (!story) return;
        const span = spans[storyIndex];
        const columnStart = 1 + columnIndex * tracksPerColumn;
        story.style.gridColumn = `${columnStart} / span ${tracksPerColumn}`;
        story.style.gridRowStart = String(rowStart);
        story.style.setProperty("--masonry-span", String(span));
        rowStart += span;
      });
    });
    grid.classList.add("is-masonry-ready");
  }

  function scheduleSocialWallMasonry() {
    if (socialMasonryFrame) window.cancelAnimationFrame(socialMasonryFrame);
    socialMasonryFrame = window.requestAnimationFrame(layoutSocialWallMasonry);
  }

  function bindSocialWallMasonry(wall) {
    if (wall.dataset.speakupMasonryBound) return;
    wall.dataset.speakupMasonryBound = "true";
    wall.querySelectorAll("img").forEach((image) => {
      if (!image.complete) image.addEventListener("load", scheduleSocialWallMasonry, { once: true });
    });

    if (!document.documentElement.dataset.speakupMasonryResizeBound) {
      document.documentElement.dataset.speakupMasonryResizeBound = "true";
      window.addEventListener("resize", scheduleSocialWallMasonry, { passive: true });
      document.fonts?.ready.then(scheduleSocialWallMasonry).catch(() => {});
    }
  }

  function setSpeakingStruggleOpen(tag, isOpen, isPinned = false) {
    tag.classList.toggle("is-speakup-open", isOpen);
    if (isPinned) tag.dataset.speakupPinned = "true";
    else delete tag.dataset.speakupPinned;

    const button = tag.querySelector('button[data-component-name="skill-tag"]');
    const popup = tag.querySelector(".skill-tag-popup");
    if (button) button.setAttribute("aria-expanded", String(isOpen));
    if (popup) popup.setAttribute("aria-hidden", String(!isOpen));
  }

  function closeSpeakingStruggles(root, except = null) {
    root.querySelectorAll('#top-skills-card-container li[data-skill-tag="true"]').forEach((tag) => {
      if (tag !== except) setSpeakingStruggleOpen(tag, false);
    });
  }

  function bindSpeakingStruggleInteractions(skills, tags) {
    const cloud = skills.querySelector("#top-skills-card-container");
    if (!cloud) return;

    tags.forEach((tag) => {
      const button = tag.querySelector('button[data-component-name="skill-tag"]');
      const popup = tag.querySelector(".skill-tag-popup");
      if (!button || !popup) return;

      button.setAttribute("aria-controls", popup.id);
      button.setAttribute("aria-expanded", String(tag.classList.contains("is-speakup-open")));
      popup.setAttribute("aria-hidden", String(!tag.classList.contains("is-speakup-open")));
      if (tag.dataset.speakupInteractionBound) return;
      tag.dataset.speakupInteractionBound = "true";

      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          const shouldPin = tag.dataset.speakupPinned !== "true";
          closeSpeakingStruggles(skills, tag);
          setSpeakingStruggleOpen(tag, shouldPin, shouldPin);
        },
        true,
      );

      tag.addEventListener("mouseenter", () => {
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        closeSpeakingStruggles(skills, tag);
        setSpeakingStruggleOpen(tag, true, tag.dataset.speakupPinned === "true");
      });

      tag.addEventListener("mouseleave", () => {
        if (tag.dataset.speakupPinned === "true") return;
        setSpeakingStruggleOpen(tag, false);
      });

      button.addEventListener("focus", () => setSpeakingStruggleOpen(tag, true));
      button.addEventListener("blur", () => {
        if (tag.dataset.speakupPinned !== "true") setSpeakingStruggleOpen(tag, false);
      });
    });

    if (!document.documentElement.dataset.speakupStruggleDismissBound) {
      document.documentElement.dataset.speakupStruggleDismissBound = "true";
      document.addEventListener(
        "click",
        (event) => {
          if (event.target instanceof Element && event.target.closest("#top-skills-card-container")) {
            return;
          }
          const currentSkills = document.getElementById("sidekick-skills");
          if (currentSkills) closeSpeakingStruggles(currentSkills);
        },
        true,
      );
      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        const currentSkills = document.getElementById("sidekick-skills");
        if (currentSkills) closeSpeakingStruggles(currentSkills);
      });
    }
  }

  function updateSocialStoriesSection() {
    const section = document.getElementById("tedious-tasks-simplified");
    const skills = section?.querySelector("#sidekick-skills");
    const contentGrid = skills?.parentElement;
    if (!section || !skills || !contentGrid || !section.contains(contentGrid)) return;

    section.classList.add("speakup-social-stories-section");
    setText(section.querySelector(":scope > div > h3"), "Stories, spoken out loud");

    const introTitle = skills.querySelector("#card-heading-sidekick-skills");
    const introRoot = introTitle?.parentElement;
    setText(introTitle, "What keeps us from speaking?");
    setText(
      introRoot?.querySelector(":scope > .rich-text"),
      "不是没学过，而是不知道怎么开始、临场接不住，也不知道练完到底该改哪里。",
    );

    const introCta = introRoot?.querySelector(':scope > a[data-component-name="cta-link"]');
    if (introCta) {
      introCta.setAttribute("href", "#speakup-social-wall");
      introCta.removeAttribute("target");
      introCta.removeAttribute("rel");
      introCta.setAttribute("aria-label", "前往 SpeakUp 真实开口故事");
      setText(introCta.querySelector(":scope > span"), "看看真实的开口困扰");
      const arrow = introCta.querySelector("svg");
      if (arrow) arrow.setAttribute("aria-label", "前往内容墙");
    }

    const tags = skills.querySelectorAll('#top-skills-card-container li[data-skill-tag="true"]');
    tags.forEach((tag, index) => {
      const struggle = speakingStruggles[index];
      if (!struggle) return;
      tag.dataset.speakupStruggle = String(index + 1);
      setText(tag.querySelector(".skill-tag-content-label"), struggle.label);
      setText(tag.querySelector(".skill-tag-popup .rich-text"), struggle.description);
      setText(tag.querySelector(".skill-tag-popup span.text-grey-light"), "SpeakUp 怎么帮你");
    });
    bindSpeakingStruggleInteractions(skills, tags);

    skills.querySelectorAll(":scope > a[download]").forEach((link) => link.remove());

    let wall = contentGrid.querySelector(
      ':scope > #speakup-social-wall[data-speakup-social-wall="true"]',
    );
    if (wall && wall.dataset.speakupWallVersion !== "1") {
      wall.remove();
      wall = null;
    }
    if (!wall) {
      wall = buildSocialWall();
      skills.after(wall);
    } else if (wall.previousElementSibling !== skills) {
      skills.after(wall);
    }

    [...contentGrid.children].forEach((child) => {
      if (child !== skills && child !== wall) child.remove();
    });
    bindSocialWallReveal(wall);
    bindSocialWallMasonry(wall);
    scheduleSocialWallMasonry();
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

  function syncEditionLoaderScope() {
    if (!bypassSecondaryEditionLoader) {
      const isDeepLink = Boolean(
        location.hash && !["#top", "#hero"].includes(location.hash),
      );
      bypassSecondaryEditionLoader = isDeepLink || window.scrollY > 100;
    }
    if (!bypassSecondaryEditionLoader) return;

    const shell = document.querySelector('[data-section-name="side-and-lines"]');
    if (!shell) return;
    if (shell.dataset.speakupLoaderBypassed !== "true") {
      shell.dataset.speakupLoaderBypassed = "true";
    }
    if (shell.dataset.initiated !== "true") shell.dataset.initiated = "true";
    if (shell.dataset.scrolled !== "true") shell.dataset.scrolled = "true";
    if (shell.dataset.sidebarLoaded !== "true") shell.dataset.sidebarLoaded = "true";
    if (shell.dataset.sidebarReady !== "true") shell.dataset.sidebarReady = "true";
  }

  function applySpeakUpLayer() {
    if (applying) return;
    applying = true;
    try {
      ensureStyles();
      document.body?.classList.add("speakup-mode");
      syncEditionLoaderScope();
      document.documentElement.lang = "zh-CN";
      updatePageMetadata();
      syncPublicAddress();
      bindPublicNavigation();
      updateHeader();
      replaceSourceBagLogos();
      truncateAfterSourceDetailBoundary();
      removeAiTeacherSourceSectionsBeforePractice();
      removeLearningProgressSection();
      updateEditionPanel();
      updateAllDirectoryLinks();
      updateChapterIntros();
      updateGoalUnderstandingSection();
      updateExpressionPreparationSection();
      updateSceneChapters();
      updateImmediateFeedbackChapter();
      updatePracticeReviewChapter();
      updateTrainingMemoryChapter();
      ensureHeroArt();
      updateAiTeacherVideoCard();
      updateSocialStoriesSection();
      scrollToPublicHash("auto");
    } finally {
      applying = false;
    }
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
  window.addEventListener("scroll", syncEditionLoaderScope, { passive: true });
  window.addEventListener("resize", updateHeroOpacity, { passive: true });
  window.addEventListener("hashchange", syncEditionLoaderScope);
  window.addEventListener("hashchange", () => handlePublicLocationChange("smooth"));
  window.addEventListener("popstate", () => handlePublicLocationChange("smooth"));
  window.addEventListener("pageshow", syncEditionLoaderScope);
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
