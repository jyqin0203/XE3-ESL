export class CardStackSwitcher {
  constructor(root, options = {}) {
    if (!(root instanceof HTMLElement)) throw new TypeError("CardStackSwitcher requires an element");

    this.root = root;
    this.stage = root.querySelector("[data-card-switch-stage]");
    this.cards = [...root.querySelectorAll("[data-card-switch-card]")];
    this.nextButtons = [...root.querySelectorAll("[data-card-switch-next]")];
    this.pauseButton = root.querySelector("[data-card-switch-pause]");
    this.status = root.querySelector("[data-card-switch-status]");
    this.interval = Number(options.interval ?? root.dataset.interval ?? 1000);
    this.duration = Number(options.duration ?? root.dataset.duration ?? 520);
    this.timer = 0;
    this.transitionTimer = 0;
    this.transitioning = false;
    this.visible = false;
    this.manuallyPaused = false;
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    if (!this.stage || this.cards.length < 2) return;

    this.cards.forEach((card, index) => {
      card.dataset.slot = String(index);
      card.dataset.cardIndex ||= String(index + 1);
    });
    this.root.style.setProperty("--card-switch-duration", `${this.duration}ms`);
    this.bind();
    this.updateAccessibility();
  }

  bind() {
    this.nextButtons.forEach((button) => button.addEventListener("click", () => this.next(true)));
    this.pauseButton?.addEventListener("click", () => this.togglePause());

    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        if (this.visible) this.schedule();
        else this.clearTimer();
      },
      { threshold: 0.25 },
    );
    this.observer.observe(this.root);

    this.onMotionChange = () => {
      if (this.reducedMotion.matches) this.clearTimer();
      else this.schedule();
      this.updatePauseButton();
    };
    this.reducedMotion.addEventListener("change", this.onMotionChange);
  }

  schedule() {
    this.clearTimer();
    if (!this.visible || this.manuallyPaused || this.reducedMotion.matches || this.cards.length < 2) return;
    this.timer = window.setTimeout(() => this.next(false), this.interval);
  }

  clearTimer() {
    window.clearTimeout(this.timer);
    this.timer = 0;
  }

  next(fromUser = false) {
    if (this.transitioning || this.cards.length < 2) return;
    this.clearTimer();
    this.transitioning = true;

    const outgoing = this.cards[0];
    const incoming = this.cards[1];
    outgoing.classList.add("is-exiting");
    incoming.dataset.slot = "0";
    this.cards.slice(2).forEach((card, index) => card.dataset.slot = String(index + 1));
    this.updateAccessibility(incoming);

    window.clearTimeout(this.transitionTimer);
    this.transitionTimer = window.setTimeout(() => {
      outgoing.classList.remove("is-exiting");
      this.cards.push(this.cards.shift());
      outgoing.dataset.slot = String(this.cards.length - 1);
      this.transitioning = false;
      this.root.dispatchEvent(new CustomEvent("cardswitchchange", {
        detail: { activeCard: this.cards[0], fromUser },
      }));
      this.schedule();
    }, this.reducedMotion.matches ? 0 : this.duration);
  }

  togglePause() {
    this.manuallyPaused = !this.manuallyPaused;
    if (this.manuallyPaused) this.clearTimer();
    else this.schedule();
    this.updatePauseButton();
  }

  updateAccessibility(activeCard = this.cards[0]) {
    this.cards.forEach((card) => {
      const active = card === activeCard;
      card.setAttribute("aria-hidden", String(!active));
      if ("inert" in card) card.inert = !active;
    });
    const index = activeCard?.dataset.cardIndex;
    if (this.status && index) this.status.textContent = `Card ${index} of ${this.cards.length}`;
  }

  updatePauseButton() {
    if (!this.pauseButton) return;
    const paused = this.manuallyPaused || this.reducedMotion.matches;
    this.pauseButton.textContent = paused ? "播放" : "暂停";
    this.pauseButton.setAttribute("aria-pressed", String(paused));
  }

  destroy() {
    this.clearTimer();
    window.clearTimeout(this.transitionTimer);
    this.observer?.disconnect();
    this.reducedMotion.removeEventListener("change", this.onMotionChange);
  }
}

function installReferencePlayback(video) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !motion.matches) video.play().catch(() => {});
    else video.pause();
  }, { threshold: 0.25 });
  observer.observe(video);
}

document.querySelectorAll("[data-card-switch]").forEach((root) => new CardStackSwitcher(root));
document.querySelectorAll("[data-reference-video]").forEach(installReferencePlayback);
