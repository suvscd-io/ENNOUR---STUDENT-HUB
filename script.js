
// Initialize AOS (Animate on Scroll)
document.addEventListener('DOMContentLoaded', function () {
  AOS.init({
    duration: 800, // values from 0 to 3000, with step 50ms
    easing: 'ease-in-out-quad', // default easing for AOS animations
    once: true, // whether animation should happen only once - while scrolling down
    mirror: false, // whether elements should animate out while scrolling past them
  });

  // Resource filtering
  const filterLinks = document.querySelectorAll('.resource-sidebar a');
  const resourceCards = document.querySelectorAll('.resource-card');

  filterLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      // Set active link
      filterLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      const category = this.dataset.category;

      resourceCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
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
