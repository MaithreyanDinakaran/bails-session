// ======== main.js — Bails Session ========

// Navbar scroll glass effect
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
}

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
}

// Scroll reveal (IntersectionObserver)
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// Counter animation for hero stats
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current);
        if (current >= target) clearInterval(timer);
    }, 16);
}

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    const statsObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.stat-number').forEach(animateCounter);
            statsObserver.disconnect();
        }
    }, { threshold: 0.5 });
    statsObserver.observe(heroStats);
}

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 220) current = sec.id;
    });
    allNavLinks.forEach(link => {
        link.classList.toggle('active-link', link.getAttribute('href') === `#${current}`);
    });
}, { passive: true });

// Contact form handler
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        showToast('✅ Message sent! We\'ll get back to you soon.');
        contactForm.reset();
    });
}

// Toast utility
function showToast(msg, duration = 4000) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 350);
    }, duration);
}
