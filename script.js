// Slider functionality
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const indicators = document.querySelectorAll(".indicator");
let autoSlideInterval;

/**
 * Display the specified slide
 * @param {number} n - Index of the slide to show
 */
function showSlide(n) {
  // Remove active class from current slide
  slides[currentSlide].classList.remove("active");
  indicators[currentSlide].classList.remove("active");

  // Calculate new slide index (with wrapping)
  currentSlide = (n + slides.length) % slides.length;

  // Add active class to new slide
  slides[currentSlide].classList.add("active");
  indicators[currentSlide].classList.add("active");
}

/**
 * Change slide by direction
 * @param {number} direction - Direction to move (-1 for previous, 1 for next)
 */
function changeSlide(direction) {
  showSlide(currentSlide + direction);
  resetAutoSlide();
}

/**
 * Go to a specific slide
 * @param {number} n 
 */
function goToSlide(n) {
  showSlide(n);
  resetAutoSlide();
}


function autoSlide() {
  autoSlideInterval = setInterval(() => {
    showSlide(currentSlide + 1);
  }, 3000);
}

function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlide();
}

autoSlide();

// TOGGLE MENU
function toggleMobileMenu() {
  const mobileMenu = document.querySelector(".mobile-menu");
  const menuToggle = document.querySelector(".mobile-menu-toggle");

  mobileMenu.classList.toggle("active");
  menuToggle.classList.toggle("active");
}

// What We Do Scroll Animation
const wwdSections = document.querySelectorAll(".what-we-do-section");
const wwdWrapper = document.querySelector(".what-we-do-wrapper");

function updateWWDSections() {
  if (!wwdWrapper) return;

  const wrapperTop = wwdWrapper.getBoundingClientRect().top;
  const wrapperHeight = wwdWrapper.offsetHeight;
  const viewportHeight = window.innerHeight;
  const scrollProgress = Math.max(
    0,
    Math.min(1, -wrapperTop / (wrapperHeight - viewportHeight))
  );

  const totalSections = wwdSections.length;

  wwdSections.forEach((section, index) => {
    const sectionStart = index / totalSections;
    const sectionEnd = (index + 1) / totalSections;

    if (scrollProgress >= sectionStart && scrollProgress < sectionEnd) {
      section.classList.add("active");
    } else {
      section.classList.remove("active");
    }
  });

  // Keep last section active when at the end
  if (scrollProgress >= 1) {
    wwdSections[totalSections - 1].classList.add("active");
  }
}

window.addEventListener("scroll", updateWWDSections);
window.addEventListener("load", updateWWDSections);
