
'use strict';

/**
 * Initializes the application.
 * Sets up event listeners and year display.
 */
function init() {
  // Initialize AOS (Animate on Scroll)
  AOS.init({
    duration: 800,
    once: true,
    offset: 50,
  });

  // Mobile navigation toggle
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('is-open');
      // Simple accessibility for the toggle button
      const isOpen = mainNav.classList.contains('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // Header scroll effect
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Resource page category filter
  const resourceFilters = document.querySelectorAll('.resource-header a');
  const resourceCards = document.querySelectorAll('.resource-card');

  if (resourceFilters.length > 0 && resourceCards.length > 0) {
    resourceFilters.forEach(filter => {
      filter.addEventListener('click', (e) => {
        e.preventDefault();

        // Update active filter button
        resourceFilters.forEach(btn => btn.classList.remove('active'));
        filter.classList.add('active');

        const category = filter.dataset.category;

        // Show/hide cards based on category
        resourceCards.forEach(card => {
          if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'flex'; // Or 'block', depending on your styling
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
  
  // Set current year in the footer
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
