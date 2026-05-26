const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

if (menuToggle && mobileMenu) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Menüyü aç");
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
  };
  const openMenu = () => {
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Menüyü kapat");
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
  };
  menuToggle.addEventListener("click", () => {
    if (mobileMenu.classList.contains("is-open")) closeMenu();
    else openMenu();
  });
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
      closeMenu();
      menuToggle.focus();
    }
  });
}

const revealItems = document.querySelectorAll("[data-reveal]");
const workSection = document.querySelector(".work-pin-section");
const workTrack = document.querySelector(".work-track");
const servicesStage = document.querySelector(".services-stage");
const servicesTrack = document.querySelector(".services-track");
const servicesNextBtn = document.querySelector(".services-next");
const servicesPrevBtn = document.querySelector(".services-prev");
const cardNextButtons = document.querySelectorAll(".card-next");
const cardPrevButtons = document.querySelectorAll(".card-prev");
const serviceDots = document.querySelectorAll(".services-dot");
const instagramEmbeds = document.querySelectorAll(".social-gallery .social-embed-card");
const TOTAL_SERVICE_PAGES = 4;
let currentServicePage = 0;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.12,
  }
);

revealItems.forEach((item, index) => {
  if (item.getBoundingClientRect().top < window.innerHeight * 1.05) {
    item.classList.add("is-visible");
    return;
  }

  item.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
  revealObserver.observe(item);
});

requestAnimationFrame(() => {
  document.body.classList.add("reveal-ready");
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

let workGeometry = null;

function recalculateWorkGeometry() {
  if (!workSection || !workTrack) {
    workGeometry = null;
    return;
  }

  const cards = workTrack.querySelectorAll(".work-card");
  const cardCount = cards.length;
  if (cardCount === 0) {
    workGeometry = null;
    return;
  }

  const firstCard = cards[0];
  const lastCard = cards[cardCount - 1];
  const distance = Math.max(0, lastCard.offsetLeft - firstCard.offsetLeft);
  const slideStep = cardCount > 1 ? distance / (cardCount - 1) : 0;

  const vh = window.innerHeight;
  const isMobileWork = window.matchMedia("(max-width: 720px)").matches;
  const sticky = workSection.querySelector(".work-sticky");
  const stickyHeight = sticky ? sticky.offsetHeight : vh;
  const entryHold = isMobileWork ? clamp(vh * 0.1, 56, 110) : clamp(vh * 0.18, 100, 240);
  const revealLength = isMobileWork ? clamp(vh * 0.68, 430, 620) : clamp(vh * 0.85, 520, 900);
  const slideLength = isMobileWork ? clamp(vh * 0.56, 340, 520) : clamp(vh * 0.75, 460, 820);
  const exitHold = isMobileWork ? clamp(vh * 0.08, 48, 90) : 0;
  const totalAnim = cardCount * revealLength + (cardCount - 1) * slideLength;

  workGeometry = {
    cards,
    cardCount,
    slideStep,
    entryHold,
    revealLength,
    slideLength,
    totalAnim,
  };

  workSection.style.setProperty(
    "--work-section-height",
    `${stickyHeight + totalAnim + entryHold + exitHold}px`
  );
}

function updateWorkSection() {
  if (!workSection || !workGeometry) return;

  const { cards, cardCount, slideStep, entryHold, revealLength, slideLength, totalAnim } = workGeometry;

  const sectionRect = workSection.getBoundingClientRect();
  const scrolled = clamp(0 - sectionRect.top - entryHold, 0, totalAnim);

  const reveals = new Array(cardCount).fill(0);
  let translateX = 0;
  let landed = false;
  let acc = 0;

  for (let i = 0; i < cardCount; i++) {
    const revealStart = acc;
    const revealEnd = acc + revealLength;
    if (scrolled <= revealEnd) {
      const p = clamp((scrolled - revealStart) / revealLength, 0, 1);
      reveals[i] = easeInOutCubic(p);
      translateX = -i * slideStep;
      landed = true;
      break;
    }
    reveals[i] = 1;
    acc = revealEnd;

    if (i === cardCount - 1) break;

    const slideStart = acc;
    const slideEnd = acc + slideLength;
    if (scrolled <= slideEnd) {
      const p = clamp((scrolled - slideStart) / slideLength, 0, 1);
      translateX = -(i + easeInOutCubic(p)) * slideStep;
      landed = true;
      break;
    }
    acc = slideEnd;
  }

  if (!landed) {
    translateX = -(cardCount - 1) * slideStep;
    reveals[cardCount - 1] = 1;
  }

  workTrack.style.setProperty("--work-x", `${translateX}px`);
  workSection.style.setProperty("--work-progress", (scrolled / Math.max(totalAnim, 1)).toFixed(4));

  cards.forEach((card, i) => {
    card.style.setProperty("--reveal", `${(reveals[i] * 100).toFixed(2)}%`);
  });
}

function setServicePage(page) {
  if (!servicesTrack) return;
  currentServicePage = Math.min(Math.max(page, 0), TOTAL_SERVICE_PAGES - 1);
  servicesTrack.style.transform = `translateX(-${(currentServicePage * 100) / TOTAL_SERVICE_PAGES}%)`;
  servicesTrack.dataset.page = String(currentServicePage);
  serviceDots.forEach((dot, i) => {
    dot.classList.toggle("is-active", i === currentServicePage);
  });
  if (servicesStage) {
    servicesStage.classList.toggle("is-past-start", currentServicePage > 0);
    servicesStage.classList.toggle("is-at-end", currentServicePage === TOTAL_SERVICE_PAGES - 1);
  }
}

function nextServicePage() {
  setServicePage(currentServicePage + 1);
}

function prevServicePage() {
  setServicePage(currentServicePage - 1);
}

if (servicesNextBtn) {
  servicesNextBtn.addEventListener("click", nextServicePage);
}

if (servicesPrevBtn) {
  servicesPrevBtn.addEventListener("click", () => {
    if (currentServicePage === TOTAL_SERVICE_PAGES - 1) {
      setServicePage(0);
    } else {
      prevServicePage();
    }
  });
}

cardNextButtons.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    nextServicePage();
  });
});

cardPrevButtons.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    prevServicePage();
  });
});

serviceDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const target = Number(dot.dataset.page || 0);
    setServicePage(target);
  });
});

instagramEmbeds.forEach((embed) => {
  const permalink = embed.dataset.permalink;
  if (!permalink) return;

  let pointerStart = null;
  embed.setAttribute("role", "link");
  embed.setAttribute("tabindex", "0");

  embed.addEventListener("pointerdown", (event) => {
    pointerStart = { x: event.clientX, y: event.clientY };
  });

  embed.addEventListener("pointerup", (event) => {
    if (!pointerStart) return;

    const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
    pointerStart = null;

    if (moved < 8) {
      window.open(permalink, "_blank", "noopener,noreferrer");
    }
  });

  embed.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.open(permalink, "_blank", "noopener,noreferrer");
    }
  });
});

function normalizeInstagramEmbeds() {
  if (!window.matchMedia("(max-width: 720px)").matches) return;

  document.querySelectorAll(".social-embed-card iframe.instagram-media").forEach((iframe) => {
    iframe.style.setProperty("width", "100%", "important");
    iframe.style.setProperty("max-width", "100%", "important");
    iframe.style.setProperty("min-width", "0", "important");
    iframe.style.setProperty("height", "420px", "important");
    iframe.style.setProperty("min-height", "420px", "important");
    iframe.style.setProperty("pointer-events", "none", "important");
  });
}

window.addEventListener("load", () => {
  normalizeInstagramEmbeds();
  setTimeout(normalizeInstagramEmbeds, 800);
  setTimeout(normalizeInstagramEmbeds, 1800);
});
window.addEventListener("resize", normalizeInstagramEmbeds);

function scrollToCurrentHash() {
  if (!window.location.hash) return;

  const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  if (!target) return;

  target.scrollIntoView({ block: "start", behavior: "auto" });
}

let ticking = false;

function requestWorkUpdate() {
  if (ticking) return;
  ticking = true;

  requestAnimationFrame(() => {
    updateWorkSection();
    ticking = false;
  });
}

window.addEventListener("scroll", requestWorkUpdate, { passive: true });
window.addEventListener("resize", () => {
  recalculateWorkGeometry();
  requestWorkUpdate();
});
window.addEventListener("orientationchange", () => {
  recalculateWorkGeometry();
  requestWorkUpdate();
});

setServicePage(0);
recalculateWorkGeometry();
updateWorkSection();

window.addEventListener("load", () => {
  recalculateWorkGeometry();
  updateWorkSection();

  requestAnimationFrame(() => {
    recalculateWorkGeometry();
    updateWorkSection();
    scrollToCurrentHash();
  });
});
window.addEventListener("hashchange", () => {
  requestAnimationFrame(scrollToCurrentHash);
});
