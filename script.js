
// Initialize AOS (Animate on Scroll)
document.addEventListener('DOMContentLoaded', function () {
  AOS.init({
    duration: 800, // values from 0 to 3000, with step 50ms
    easing: 'ease-in-out-quad', // default easing for AOS animations
    once: true, // whether animation should happen only once - while scrolling down
    mirror: false, // whether elements should animate out while scrolling past them
  });
});

// Sticky Header with background on scroll
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    navToggle.classList.toggle('open');
  });
}

// Optional: Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
  if (mainNav && mainNav.classList.contains('open')) {
    if (!mainNav.contains(e.target) && e.target !== navToggle) {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
    }
  }
});

// Set current year in footer
const yearSpan = document.getElementById('year');
if(yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}
