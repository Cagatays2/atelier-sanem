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

function updateWorkSection() {
  if (!workSection || !workTrack) return;

  const sectionRect = workSection.getBoundingClientRect();
  const cards = workTrack.querySelectorAll(".work-card");
  const firstCard = cards[0];
  const lastCard = cards[cards.length - 1];
  const distance = firstCard && lastCard ? Math.max(0, lastCard.offsetLeft - firstCard.offsetLeft) : 0;
  const entryHold = clamp(window.innerHeight * 0.34, 180, 320);
  const scrollable = Math.max(1, workSection.offsetHeight - window.innerHeight);
  const activeDistance = Math.max(1, scrollable - entryHold);
  const progress = clamp((0 - sectionRect.top - entryHold) / activeDistance, 0, 1);

  workTrack.style.setProperty("--work-x", `${-distance * progress}px`);
  workSection.style.setProperty("--work-progress", progress.toFixed(4));
  workSection.style.setProperty("--work-section-height", `${window.innerHeight + distance + entryHold}px`);
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
  requestWorkUpdate();
});

setServicePage(0);
window.addEventListener("load", () => {
  updateWorkSection();

  requestAnimationFrame(() => {
    updateWorkSection();
    scrollToCurrentHash();
  });
});
window.addEventListener("hashchange", () => {
  requestAnimationFrame(scrollToCurrentHash);
});
updateWorkSection();
