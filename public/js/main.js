// ======== main.js — Bails Session ========

// ── All page sections (in nav order) ──
const PAGE_SECTIONS = ['home', 'sports', 'features', 'gallery', 'about', 'contact'];

// ── Show only the requested section, hide the rest ──
function showSection(id) {
    PAGE_SECTIONS.forEach(sId => {
        const el = document.getElementById(sId);
        if (!el) return;
        if (sId === id) {
            el.style.display = '';
            el.classList.add('section-visible');
            el.classList.remove('section-hidden');
        } else {
            el.style.display = 'none';
            el.classList.remove('section-visible');
            el.classList.add('section-hidden');
        }
    });

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active-link', link.getAttribute('href') === `#${id}`);
    });

    // Update URL hash without scrolling
    history.replaceState(null, '', `#${id}`);

    // Trigger reveal animations for newly shown section
    setTimeout(() => {
        document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
            el.classList.add('visible');
        });
    }, 50);

    // Run counter animation when home is shown
    if (id === 'home') {
        const statNums = document.querySelectorAll('.stat-number');
        statNums.forEach(el => {
            el.textContent = '0';
            animateCounter(el);
        });
    }

    // Close mobile menu if open
    const navLinksEl = document.getElementById('navLinks');
    if (navLinksEl) navLinksEl.classList.remove('open');

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Determine start section from URL hash ──
function getStartSection() {
    const hash = window.location.hash.replace('#', '');
    return PAGE_SECTIONS.includes(hash) ? hash : 'home';
}

// ── Init: show correct section on load ──
document.addEventListener('DOMContentLoaded', () => {
    showSection(getStartSection());
});

// ── Nav link clicks ──
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = link.getAttribute('href').replace('#', '');
        if (PAGE_SECTIONS.includes(target)) {
            showSection(target);
        }
    });
});

// ── Logo click → Home ──
document.querySelectorAll('.nav-logo').forEach(logo => {
    logo.addEventListener('click', e => {
        e.preventDefault();
        showSection('home');
    });
});

// ── "Book a Slot" CTA in nav → stays as link (booking.html) ──
// ── Hero "Explore Sports" → switch to sports tab ──
document.querySelectorAll('a[href="#sports"]').forEach(el => {
    el.addEventListener('click', e => {
        e.preventDefault();
        showSection('sports');
    });
});

// ── Navbar scroll glass effect ──
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
}

// ── Hamburger menu ──
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');
if (hamburger && navLinksEl) {
    hamburger.addEventListener('click', () => {
        navLinksEl.classList.toggle('open');
    });
}

// ── Counter animation ──
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target')) || 0;
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current);
        if (current >= target) clearInterval(timer);
    }, 16);
}

// ── Contact form ──
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        showToast('✅ Message sent! We\'ll get back to you soon.');
        contactForm.reset();
    });
}

// ── Toast utility ──
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

// ── Sport Tabs (inside Sports section) ──
document.querySelectorAll('.sport-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const sport = tab.getAttribute('data-sport');
        document.querySelectorAll('.sport-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.sport-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.getElementById('panel' + sport.charAt(0).toUpperCase() + sport.slice(1));
        if (panel) panel.classList.add('active');
    });
});
