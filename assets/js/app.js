// Ensure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(SplitText);

let deviceWidth = window.innerWidth;

// ==========================================
// 1. Optimized Lenis Smooth Scroll Setup
// ==========================================
const lenis = new Lenis({
  lerp: 0.1, // Replaced duration with lerp for 0ms delay & instant response
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
  smoothWheel: true,
  syncTouch: false, // Keeps native smooth touch scrolling on mobile
});

// Update ScrollTrigger on every Lenis scroll tick
lenis.on("scroll", () => {
  ScrollTrigger.update();
});

// Add Lenis RAF directly to GSAP Ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Disable GSAP lag smoothing to prevent sudden scroll jumps
gsap.ticker.lagSmoothing(0);

// Stop Lenis initially while preloader is active
lenis.stop();

// ==========================================
// 2. Custom Cursor (Optimized via quickTo)
// ==========================================
const cursorDot = document.querySelector(".cursor-dot");
const cursorFollower = document.querySelector(".cursor-follower");

if (cursorDot && cursorFollower) {
  // 1. Center the elements safely using GSAP's xPercent/yPercent
  gsap.set([cursorDot, cursorFollower], { xPercent: -50, yPercent: -50 });

  // 2. Use quickSetter for instant (duration 0) updates
  const xDot = gsap.quickSetter(cursorDot, "x", "px");
  const yDot = gsap.quickSetter(cursorDot, "y", "px");

  // 3. Keep quickTo for the smoothed follower
  const xFollower = gsap.quickTo(cursorFollower, "x", {
    duration: 0.5,
    ease: "power3.out",
  });
  const yFollower = gsap.quickTo(cursorFollower, "y", {
    duration: 0.5,
    ease: "power3.out",
  });

  window.addEventListener("mousemove", (e) => {
    xDot(e.clientX);
    yDot(e.clientY);
    xFollower(e.clientX);
    yFollower(e.clientY);
  });
}

// ==========================================
// 3. Custom Split Text Helper
// ==========================================
function createSplitText(selector) {
  const elements = document.querySelectorAll(selector);

  elements.forEach((element) => {
    const text = element.innerText;
    element.innerHTML = "";

    text.split(" ").forEach((word) => {
      const wordBox = document.createElement("span");
      wordBox.style.display = "inline-block";
      wordBox.style.overflow = "hidden";
      wordBox.style.paddingTop = "0.2em";
      wordBox.style.marginRight = "0.3em";

      word.split("").forEach((char) => {
        const charBox = document.createElement("span");
        charBox.style.display = "inline-block";
        charBox.classList.add("char");
        charBox.innerText = char;
        wordBox.appendChild(charBox);
      });

      element.appendChild(wordBox);
    });
  });
}

createSplitText(".sec-title .title");

// ==========================================
// 4. Preloader & Lenis Activation
// ==========================================
const tlPreloader = gsap.timeline();
let loadProgress = { value: 0 };

tlPreloader
  .to(loadProgress, {
    value: 100,
    duration: 2.2,
    ease: "power3.inOut",
    onUpdate: () => {
      const progress = Math.round(loadProgress.value);
      const counter = document.querySelector(".preloader-counter");
      const bar = document.querySelector(".preloader-bar");

      if (counter) counter.innerText = `${progress}%`;
      if (bar) bar.style.width = `${progress}%`; // Updates bar width dynamically
    },
  })
  .to(".preloader-counter, .preloader-bar-container", {
    opacity: 0,
    y: -30,
    duration: 0.4,
    ease: "power2.inOut",
  })
  .to(
    ".preloader",
    {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 1,
      ease: "power4.inOut",
      onComplete: () => {
        // Start Lenis and force size recalculation
        lenis.start();
        lenis.resize();
        ScrollTrigger.refresh();
      },
    },
    "-=0.2",
  )
  .from(
    ".hero-section .sec-sub-title",
    {
      y: "100%",
      opacity: 0,
      rotateZ: 10,
      duration: 0.8,
      ease: "power4.out",
      stagger: 0.04,
    },
    "-=0.4",
  )
  .from(
    ".hero-section p, .hero-title, .hero-section .button-wrapper",
    {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    },
    "-=0.6",
  );

// ==========================================
// 5. Menu Items Setup
// ==========================================
document.querySelectorAll(".menu-anim > li > a").forEach((button) => {
  button.innerHTML =
    '<div class="menu-text"><span>' +
    button.textContent.split("").join("</span><span>") +
    "</span></div>";
});

setTimeout(() => {
  const menuSpans = document.querySelectorAll(".menu-text span");
  menuSpans.forEach((item) => {
    const fontSize = window
      .getComputedStyle(item)
      .getPropertyValue("font-size");
    const numericSize = parseInt(fontSize.replace("px", ""), 10);
    if (item.innerHTML === " ") {
      item.style.width = Math.floor(numericSize / 3) + "px";
    }
  });
}, 1000);

// ==========================================
// 6. Magnetic Buttons Effect
// ==========================================
const magneticBtns = document.querySelectorAll(".magnetic-btn");

magneticBtns.forEach((btn) => {
  const fill = btn.querySelector(".btn-fill");

  let currentX = 0,
    currentY = 0;
  let targetX = 0,
    targetY = 0;
  let isHovered = false;
  let animationFrameId;

  function animate() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    btn.style.transform = `translate(${currentX}px, ${currentY}px)`;

    if (
      !isHovered &&
      Math.abs(targetX - currentX) < 0.1 &&
      Math.abs(targetY - currentY) < 0.1
    ) {
      currentX = 0;
      currentY = 0;
      btn.style.transform = "translate(0px, 0px)";
      animationFrameId = null;
    } else {
      animationFrameId = requestAnimationFrame(animate);
    }
  }

  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    targetX = (e.clientX - rect.left - rect.width / 2) * 0.4;
    targetY = (e.clientY - rect.top - rect.height / 2) * 0.4;

    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(animate);
    }
  });

  btn.addEventListener("mouseenter", (e) => {
    isHovered = true;
    if (fill) {
      const rect = btn.getBoundingClientRect();
      fill.style.left = `${e.clientX - rect.left}px`;
      fill.style.top = `${e.clientY - rect.top}px`;
    }
  });

  btn.addEventListener("mouseleave", (e) => {
    isHovered = false;
    targetX = 0;
    targetY = 0;
    if (fill) {
      const rect = btn.getBoundingClientRect();
      fill.style.left = `${e.clientX - rect.left}px`;
      fill.style.top = `${e.clientY - rect.top}px`;
    }
  });
});

// ==========================================
// 7. Portfolio Section Animations
// ==========================================
let mm = gsap.matchMedia();

// Add your desktop media query (greater than 1300px)
mm.add("(min-width: 1301px)", () => {
  // Put all your desktop-specific GSAP code inside this function
  const portfolioTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".portfolio__area",
      start: "top center-=200",
      pin: ".portfolio__text",
      end: "bottom 85%",
      pinSpacing: false,
      scrub: 1,
      markers: false,
    },
  });

  portfolioTl
    .to(".portfolio__text", { scale: 3, duration: 1 })
    .to(".portfolio__text", { scale: 3, duration: 1 })
    .to(".portfolio__text", { scale: 1, duration: 1 }, "+=2");

  // GSAP will automatically clean this up if the window shrinks below 1301px
});

const portfolioItems = gsap.utils.toArray(".portfolio__item");
portfolioItems.forEach((portfolio) => {
  gsap.set(portfolio, { opacity: 0.7 });
  const t1 = gsap.timeline();

  t1.set(portfolio, { position: "relative" });
  t1.to(portfolio, {
    scrollTrigger: {
      trigger: portfolio,
      scrub: 2,
      duration: 1.5,
      start: "top bottom+=100",
      end: "bottom center",
    },
    scale: 1,
    opacity: 1,
    rotateX: 0,
  });
});

// ==========================================
// 8. Infinite Skills Marquee
// ==========================================
const marqueeWrappers = document.querySelectorAll(".skill-tem__wrapper");

marqueeWrappers.forEach((wrapper, index) => {
  const list = wrapper.querySelector(".skill-set");
  if (!list) return;

  const clone = list.cloneNode(true);
  wrapper.appendChild(clone);

  const allLists = wrapper.querySelectorAll(".skill-set");
  const listWidth = list.offsetWidth || 1000;
  const pixelsPerSecond = 80;
  const dynamicDuration = listWidth / pixelsPerSecond;

  const isMiddleRow = index === 1;
  const marqueeTween = gsap.fromTo(
    allLists,
    { xPercent: isMiddleRow ? -100 : 0 },
    {
      xPercent: isMiddleRow ? 0 : -100,
      duration: dynamicDuration,
      ease: "none",
      repeat: -1,
    },
  );

  let currentDirection = 1;

  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      if (self.direction !== currentDirection) {
        currentDirection = self.direction;
        gsap.to(marqueeTween, {
          timeScale: currentDirection,
          duration: 0.3,
          overwrite: true,
        });
      }
    },
  });
});

// ==========================================
// 9. Stacking Cards Scroll Animation
// ==========================================

const cards = gsap.utils.toArray(".card-item");

// 1. Initial State: Card 1 visible, Cards 2..7 HIDDEN completely via autoAlpha: 0
cards.forEach((card, index) => {
  gsap.set(card, {
    zIndex: index + 1,
    yPercent: index === 0 ? 0 : 100,
    autoAlpha: index === 0 ? 1 : 0, // CRITICAL: Completely hides cards 2..7 before scroll
    scale: 1,
    filter: "brightness(1)",
  });
});

// 2. Single Master Timeline on .experince-section
const stackTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".experince-section",
    start: "top top+=40px", // Pins as section reaches top
    end: `+=${cards.length * 550}`, // Scroll duration for all 7 cards
    pin: true, // Pins section
    scrub: 1, // Smooth scroll sync
    anticipatePin: 1,
    invalidateOnRefresh: true,
  },
});

// 3. Sequentially reveal cards 2..7 and animate autoAlpha to 1
cards.forEach((card, i) => {
  if (i === 0) return; // Card 1 stays in place

  stackTl
    // Dim & scale down previous card
    .to(
      cards[i - 1],
      {
        scale: 0.93 - i * 0.008,
        filter: "brightness(0.4)",
        duration: 1,
        ease: "none",
      },
      `card-${i}`,
    )
    // Reveal current card smoothly (yPercent: 0 + autoAlpha: 1)
    .to(
      card,
      {
        yPercent: 0,
        autoAlpha: 1, // Fades in & makes visible as it slides up
        duration: 1,
        ease: "none",
      },
      `card-${i}`,
    );
});

// ==========================================
// 10. Testimonial Slider
// ==========================================
var slider = new Swiper(".three-item__carousel", {
  slidesPerView: 3,
  spaceBetween: 30,
  loop: true,
  autoplay: {
    enabled: true,
    delay: 6000,
  },
  // Navigation arrows
  navigation: {
    nextEl: ".testimonial-next",
    prevEl: ".testimonial-prev",
    clickable: true,
  },
  //Pagination
  pagination: {
    el: ".testimonial-pagination",
    clickable: true,
  },
  speed: 500,
  breakpoints: {
    1600: {
      slidesPerView: 3,
    },
    1200: {
      slidesPerView: 3,
    },
    992: {
      slidesPerView: 2,
    },
    768: {
      slidesPerView: 1,
    },
    576: {
      slidesPerView: 1,
    },
    0: {
      slidesPerView: 1,
    },
  },
});

/////////////////////////////////////////////////////
// 11. Title Animation
let splitTitleLines = gsap.utils.toArray(".title-anim");

splitTitleLines.forEach((splitTextLine) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: splitTextLine,
      start: "top 90%",
      end: "bottom 60%",
      scrub: false,
      markers: false,
      toggleActions: "play none none none",
    },
  });

  const itemSplitted = new SplitText(splitTextLine, { type: "words, lines" });
  gsap.set(splitTextLine, { perspective: 400 });
  itemSplitted.split({ type: "lines" });
  tl.from(itemSplitted.lines, {
    duration: 1,
    delay: 0.3,
    opacity: 0,
    rotationX: -80,
    force3D: true,
    transformOrigin: "top center -50",
    stagger: 0.1,
  });
});
/////////////////////////////////////////////////////

// ==========================================
// 12. Text Animation
// ==========================================
let splitTextLines = gsap.utils.toArray(".text-anim p");

splitTextLines.forEach((splitTextLine) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: splitTextLine,
      start: "top 90%",
      duration: 2,
      end: "bottom 60%",
      scrub: false,
      markers: false,
      toggleActions: "play none none none",
    },
  });

  const itemSplitted = new SplitText(splitTextLine, { type: "lines" });
  gsap.set(splitTextLine, { perspective: 400 });
  itemSplitted.split({ type: "lines" });
  tl.from(itemSplitted.lines, {
    duration: 1,
    delay: 0.5,
    opacity: 0,
    rotationX: -80,
    force3D: true,
    transformOrigin: "top center -50",
    stagger: 0.1,
  });
});

// ==========================================
// 13. Buttons Animation
// ==========================================
let arr2 = gsap.utils.toArray(".button-wrapper");

arr2.forEach((btn) => {
  gsap.from(btn, {
    scrollTrigger: {
      trigger: btn,
      start: "top center+=150",
      markers: false,
    },
    opacity: 0,
    y: -70,
    ease: "bounce",
    duration: 1.5,
  });
});

// ==========================================
// 14. Services Animation
// ==========================================
gsap.set(".service-animation .portfolio__service-item", { x: 50, opacity: 0 });

if (deviceWidth < 1023) {
  // MOBILE: Trigger each item individually
  const serviceList = gsap.utils.toArray(
    ".service-animation .portfolio__service-item",
  );

  serviceList.forEach((item) => {
    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: "top center+=200",
      },
      x: 0,
      opacity: 1,
      ease: "power2.out",
      duration: 1.5,
    });
  });
} else {
  // DESKTOP: Batch items that enter the viewport at the same time (rows)
  ScrollTrigger.batch(".service-animation .portfolio__service-item", {
    start: "top center+=300",
    markers: false,
    onEnter: (batch) => {
      // 'batch' is an array of items in the current row that just entered the viewport
      gsap.to(batch, {
        x: 0,
        opacity: 1,
        ease: "power2.out",
        duration: 2,
        stagger: 0.3, // Staggers only the items in this specific row
        overwrite: true, // Prevents conflicts if the user scrolls very fast
      });
    },
  });
}

// ==========================================
// 14. Lets Talk Animation
// ==========================================

let endTl = gsap.timeline({
  repeat: -1,
  delay: 0.5,
  scrollTrigger: {
    trigger: ".end",
    start: "bottom 100%-=50px",
  },
});
gsap.set(".end", {
  opacity: 0,
});
gsap.to(".end", {
  opacity: 1,
  duration: 1,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".end",
    start: "bottom 100%-=50px",
    once: true,
  },
});
let mySplitText = new SplitText(".end", { type: "words,chars" });
let chars = mySplitText.chars;
let endGradient = chroma.scale(["#F9D371", "#F47340", "#EF2F88", "#8843F2"]);
endTl.to(chars, {
  duration: 0.5,
  scaleY: 0.6,
  ease: "power3.out",
  stagger: 0.04,
  transformOrigin: "center bottom",
});
endTl.to(
  chars,
  {
    yPercent: -20,
    ease: "elastic",
    stagger: 0.03,
    duration: 0.8,
  },
  0.5,
);
endTl.to(
  chars,
  {
    scaleY: 1,
    ease: "elastic.out(2.5, 0.2)",
    stagger: 0.03,
    duration: 1.5,
  },
  0.5,
);
endTl.to(
  chars,
  {
    color: (i, el, arr) => {
      return endGradient(i / arr.length).hex();
    },
    ease: "power2.out",
    stagger: 0.03,
    duration: 0.3,
  },
  0.5,
);
endTl.to(
  chars,
  {
    yPercent: 0,
    ease: "back",
    stagger: 0.03,
    duration: 0.8,
  },
  0.7,
);
endTl.to(chars, {
  color: "#c9f31d",
  duration: 1.4,
  stagger: 0.05,
});

// ==========================================
// 15. Scroll To Top
// ==========================================

let scroll_top = document.getElementById("scroll_top");
if (scroll_top) {
  window.onscroll = function () {
    if (
      document.body.scrollTop > 50 ||
      document.documentElement.scrollTop > 50
    ) {
      scroll_top.style.display = "block";
    } else {
      scroll_top.style.display = "none";
    }
  };

  scroll_top.addEventListener("click", function () {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });
}

// ==========================================
// 16. Sticky Header
// ==========================================

let fixedHeader = document.querySelector(".fixed-header");
if (fixedHeader) {
  window.onscroll = function () {
    if (
      document.body.scrollTop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      fixedHeader.classList.add("sticky");
      if (scroll_top) {
        scroll_top.style.display = "block";
      }
    } else {
      fixedHeader.classList.remove("sticky");
      if (scroll_top) {
        scroll_top.style.display = "none";
      }
    }
  };
}

// ==========================================
// 17. One Page Scroll
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // Select all your menu links
  const scrollLinks = document.querySelectorAll(".scroll-link");

  scrollLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // 1. Stop the default HTML instant jump
      e.preventDefault();

      // 2. Get the target section's ID (e.g., "#about")
      const targetId = link.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      // 3. Tell Lenis to smoothly scroll to that section
      if (targetSection) {
        // NOTE: Make sure your Lenis instance is actually named 'lenis'
        lenis.scrollTo(targetSection, {
          offset: 0, // Change to something like -80 if you have a fixed header
          duration: 1.2, // Scroll duration in seconds
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth ease-out
        });
      }
    });
  });
});

$("#open_offcanvas").click(function () {
  $(".offcanvas__area").css("opacity", "1");
  $(".offcanvas__area").css("visibility", "visible");
});
$("#close_offcanvas").click(function () {
  $(".offcanvas__area").css("opacity", "0");
  $(".offcanvas__area").css("visibility", "hidden");
});
/////////////////////////////////////////////////////

jQuery(document).ready(function () {
  /////////////////////////////////////////////////////
  // 29. Offcanvas Menu
  $(".offcanvas__menu").meanmenu({
    meanScreenWidth: "5000",
    meanMenuContainer: ".offcanvas__menu-wrapper",
    meanMenuCloseSize: "36px",
  });
  /////////////////////////////////////////////////////
});

// Update Lenis on window resize
window.addEventListener("resize", () => {
  lenis.resize();
});
