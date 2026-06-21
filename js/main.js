/* ============================================================
   SmartPickAura — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  Preloader.init();
  Navigation.init();
  ScrollReveal.init();
  AnimatedCounters.init();
  TestimonialSlider.init();
  FAQAccordion.init();
  ContactForm.init();
  NewsletterForm.init();
  BackToTop.init();
  WhatsAppButton.init();
});

/* ============================================================
   PRELOADER
   ============================================================ */
const Preloader = {
  init() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = '';
      }, 800);
    });

    // Safety fallback — hide after 4s no matter what
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 4000);
  }
};

/* ============================================================
   STICKY NAVIGATION
   ============================================================ */
const Navigation = {
  init() {
    this.navbar = document.getElementById('navbar');
    this.navToggle = document.getElementById('nav-toggle');
    this.navMenu = document.getElementById('nav-menu');
    this.navLinks = document.querySelectorAll('.nav-link');

    if (!this.navbar) return;

    // Scroll handler
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });

    // Mobile toggle
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => this.toggleMenu());
    }

    // Smooth scroll for nav links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handleNavClick(e, link));
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (this.navMenu && this.navMenu.classList.contains('open') &&
          !this.navMenu.contains(e.target) && !this.navToggle.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Set initial state
    this.onScroll();
  },

  onScroll() {
    if (window.scrollY > 80) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }

    // Update active nav link
    this.updateActiveLink();
  },

  updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        this.navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  },

  toggleMenu() {
    this.navMenu.classList.toggle('open');
    this.navToggle.classList.toggle('active');
    document.body.style.overflow = this.navMenu.classList.contains('open') ? 'hidden' : '';
  },

  closeMenu() {
    this.navMenu.classList.remove('open');
    this.navToggle.classList.remove('active');
    document.body.style.overflow = '';
  },

  handleNavClick(e, link) {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = this.navbar.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      this.closeMenu();
    }
  }
};

/* ============================================================
   SCROLL REVEAL ANIMATIONS
   ============================================================ */
const ScrollReveal = {
  init() {
    this.elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    if (!this.elements.length) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.elements.forEach(el => el.classList.add('revealed'));
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    this.elements.forEach(el => this.observer.observe(el));
  }
};

/* ============================================================
   ANIMATED COUNTERS
   ============================================================ */
const AnimatedCounters = {
  init() {
    this.counters = document.querySelectorAll('[data-counter]');
    if (!this.counters.length) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    this.counters.forEach(counter => this.observer.observe(counter));
  },

  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-counter'));
    const suffix = element.getAttribute('data-suffix') || '';
    const prefix = element.getAttribute('data-prefix') || '';
    const duration = 2000;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      element.textContent = prefix + current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }
};

/* ============================================================
   TESTIMONIAL SLIDER
   ============================================================ */
const TestimonialSlider = {
  currentIndex: 0,
  autoplayInterval: null,

  init() {
    this.track = document.getElementById('testimonials-track');
    this.cards = document.querySelectorAll('.testimonial-card');
    this.prevBtn = document.getElementById('testimonial-prev');
    this.nextBtn = document.getElementById('testimonial-next');
    this.dots = document.querySelectorAll('.testimonials-dot');

    if (!this.track || !this.cards.length) return;

    this.updateSlidesPerView();

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goTo(index));
    });

    window.addEventListener('resize', () => {
      this.updateSlidesPerView();
      this.goTo(this.currentIndex);
    });

    this.startAutoplay();

    // Pause on hover
    this.track.addEventListener('mouseenter', () => this.stopAutoplay());
    this.track.addEventListener('mouseleave', () => this.startAutoplay());
  },

  updateSlidesPerView() {
    const width = window.innerWidth;
    if (width <= 768) this.slidesPerView = 1;
    else if (width <= 1024) this.slidesPerView = 2;
    else this.slidesPerView = 3;

    this.maxIndex = Math.max(0, this.cards.length - this.slidesPerView);
  },

  goTo(index) {
    this.currentIndex = Math.max(0, Math.min(index, this.maxIndex));

    if (this.cards[0]) {
      const cardWidth = this.cards[0].offsetWidth;
      const gap = parseInt(getComputedStyle(this.cards[0]).marginRight) || 24;
      const offset = this.currentIndex * (cardWidth + gap);
      this.track.style.transform = `translateX(-${offset}px)`;
    }

    this.updateDots();
  },

  next() {
    this.goTo(this.currentIndex + 1);
  },

  prev() {
    this.goTo(this.currentIndex - 1);
  },

  updateDots() {
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });
  },

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      if (this.currentIndex >= this.maxIndex) {
        this.goTo(0);
      } else {
        this.next();
      }
    }, 5000);
  },

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
};

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
const FAQAccordion = {
  init() {
    this.items = document.querySelectorAll('.faq-item');
    if (!this.items.length) return;

    this.items.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', () => this.toggle(item));
      }
    });
  },

  toggle(item) {
    const isActive = item.classList.contains('active');

    // Close all
    this.items.forEach(i => i.classList.remove('active'));

    // Open clicked if it wasn't active
    if (!isActive) {
      item.classList.add('active');
    }
  }
};

/* ============================================================
   CONTACT FORM — EmailJS Integration
   ============================================================ */
const ContactForm = {
  init() {
    this.form = document.getElementById('contact-form');
    this.status = document.getElementById('form-status');

    if (!this.form) return;

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  },

  async handleSubmit(e) {
    e.preventDefault();

    const submitBtn = this.form.querySelector('.form-submit');
    const originalText = submitBtn.textContent;

    // Validate
    const name = this.form.querySelector('#contact-name').value.trim();
    const email = this.form.querySelector('#contact-email').value.trim();
    const message = this.form.querySelector('#contact-message').value.trim();

    if (!name || !email || !message) {
      this.showStatus('Please fill in all fields.', 'error');
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Show loading
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      // ========================================
      // EmailJS Integration
      // ========================================
      // IMPORTANT: Replace these placeholders with your actual EmailJS credentials
      // 1. Sign up at https://www.emailjs.com/
      // 2. Create an Email Service (connect your Gmail)
      // 3. Create an Email Template with variables: {{from_name}}, {{from_email}}, {{message}}, {{date}}
      // 4. Replace the values below:

      const SERVICE_ID = 'YOUR_SERVICE_ID';     // e.g., 'service_abc123'
      const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';   // e.g., 'template_xyz789'
      const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';      // e.g., 'AbCdEfGhIjKlMn'

      const templateParams = {
        from_name: name,
        from_email: email,
        message: message,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        to_email: 'brotalkfinance2024@gmail.com'
      };

      // Check if EmailJS is loaded and credentials are set
      if (typeof emailjs !== 'undefined' && SERVICE_ID !== 'YOUR_SERVICE_ID') {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        this.showStatus('Message sent successfully! We\'ll get back to you soon.', 'success');
        this.form.reset();
        Toast.show('Message sent successfully! ✨', 'success');
      } else {
        // Demo mode — show success for testing when EmailJS is not configured
        console.log('EmailJS not configured. Form data:', templateParams);
        this.showStatus('Demo Mode: Form works! Configure EmailJS credentials to enable real email sending. Check the console for form data.', 'success');
        this.form.reset();
        Toast.show('Demo mode — configure EmailJS to send real emails', 'success');
      }

    } catch (error) {
      console.error('EmailJS Error:', error);
      this.showStatus('Failed to send message. Please try again or contact us directly.', 'error');
      Toast.show('Failed to send message. Please try again.', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  },

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  showStatus(message, type) {
    if (!this.status) return;
    this.status.textContent = message;
    this.status.className = `form-status ${type}`;
    setTimeout(() => {
      this.status.className = 'form-status';
    }, 8000);
  }
};

/* ============================================================
   NEWSLETTER FORM
   ============================================================ */
const NewsletterForm = {
  init() {
    this.form = document.getElementById('newsletter-form');
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  },

  handleSubmit(e) {
    e.preventDefault();
    const email = this.form.querySelector('.newsletter-input').value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Toast.show('Please enter a valid email address.', 'error');
      return;
    }

    console.log('Newsletter signup:', email);
    Toast.show('Thank you for subscribing! 🎉', 'success');
    this.form.reset();
  }
};

/* ============================================================
   BACK TO TOP BUTTON
   ============================================================ */
const BackToTop = {
  init() {
    this.button = document.getElementById('back-to-top');
    if (!this.button) return;

    window.addEventListener('scroll', () => this.toggleVisibility(), { passive: true });

    this.button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  toggleVisibility() {
    if (window.scrollY > 500) {
      this.button.classList.add('visible');
    } else {
      this.button.classList.remove('visible');
    }
  }
};

/* ============================================================
   WHATSAPP BUTTON
   ============================================================ */
const WhatsAppButton = {
  init() {
    this.button = document.getElementById('whatsapp-float');
    if (!this.button) return;

    this.button.addEventListener('click', () => {
      const phone = '923331923856';
      const message = encodeURIComponent('Hi SmartPickAura! I\'d like to know more about your product recommendations.');
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    });
  }
};

/* ============================================================
   TOAST NOTIFICATION SYSTEM
   ============================================================ */
const Toast = {
  show(message, type = 'success', duration = 4000) {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-hide
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }
};

/* ============================================================
   PARALLAX / MOUSE TRACKING (subtle hero effect)
   ============================================================ */
document.addEventListener('mousemove', (e) => {
  const orbs = document.querySelectorAll('.hero-orb');
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;

  orbs.forEach((orb, i) => {
    const speed = (i + 1) * 8;
    orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
  });
});
