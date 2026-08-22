document.addEventListener('alpine:init', () => {
  Alpine.data('topicsSlider', (start = 0) => ({
    topics: [
      { title: 'Bestand weiterbauen', kicker: 'Sanieren statt abreißen: Ressourcen schonen und Quartiere erhalten.', image: 'assets/images/park.webp' },
      { title: 'Wohnen neu denken', kicker: 'Bezahlbar, gemeinschaftlich, flexibel: neue Modelle für den Wohnungsbau.', image: 'assets/images/hero-poster.webp' },
      { title: 'Freiraumwende erreichen', kicker: 'Infrastrukturen in Stadt und Land: Grüner. Sozialer. Gesünder.', image: 'assets/images/city.webp' },
      { title: 'Teilhabe ermöglichen', kicker: 'Planungsprozesse öffnen und Menschen früh einbeziehen.', image: 'assets/images/park.webp' },
      { title: 'Inklusiv gestalten', kicker: 'Barrierefreie Räume für alle Generationen und Lebenslagen.', image: 'assets/images/hero-poster.webp' },
      { title: 'Mobilität wandeln', kicker: 'Vom Autoverkehr zur vernetzten Nahmobilität.', image: 'assets/images/city.webp' },
      { title: 'Klima anpassen', kicker: 'Schwammstadt, Hitzeschutz und blau-grüne Infrastruktur.', image: 'assets/images/park.webp' },
      { title: 'Kreisläufe schließen', kicker: 'Zirkuläres Bauen: Materialien im Kreislauf halten.', image: 'assets/images/hero-poster.webp' },
      { title: 'Energie transformieren', kicker: 'Wärmewende im Quartier: kommunal geplant, gemeinsam finanziert.', image: 'assets/images/city.webp' },
      { title: 'Zentren beleben', kicker: 'Innenstädte als Orte für Begegnung, Kultur und Produktion.', image: 'assets/images/park.webp' },
      { title: 'Ländliche Räume stärken', kicker: 'Daseinsvorsorge, Baukultur und Perspektiven abseits der Metropolen.', image: 'assets/images/hero-poster.webp' },
      { title: 'Digital planen', kicker: 'Datenbasierte Werkzeuge für schnellere und bessere Entscheidungen.', image: 'assets/images/city.webp' },
    ],

    active: start,   // index of the topic currently in focus
    step: 78,        // px between two neighbouring topics
    extra: 84,       // extra room the focused topic leaves for its kicker
    accum: 0,        // wheel delta accumulator - trackpads fire many tiny events
    locked: false,   // cooldown so one gesture only ever advances one step
    resetTimer: null,
    touchY: 0,

    init() {
      this.measure();
      window.addEventListener('resize', () => this.measure());

      const viewport = this.$refs.viewport;
      // non-passive so we can choose, per event, whether the gesture scrolls
      // the topic list or is handed back to the page.
      viewport.addEventListener('wheel', e => this.onWheel(e), { passive: false });
      viewport.addEventListener('touchstart', e => { this.touchY = e.touches[0].clientY; }, { passive: true });
      viewport.addEventListener('touchmove', e => this.onTouchMove(e), { passive: false });
    },

    measure() {
      const w = window.innerWidth;
      if (w < 768) { this.step = 46; this.extra = 56; }
      else if (w < 992) { this.step = 58; this.extra = 66; }
      else if (w < 1200) { this.step = 66; this.extra = 74; }
      else { this.step = 78; this.extra = 84; }
    },

    // vertical offset of topic i from the centre of the viewport, in px
    offsetOf(i) {
      const d = i - this.active;
      return d * this.step + (d > 0 ? this.extra : 0);
    },

    // neighbours are de-emphasised; anything beyond +/-2 is hidden -> 5 topics on screen
    opacityOf(i) {
      const d = Math.abs(i - this.active);
      return d === 0 ? 1 : d === 1 ? 0.7 : d === 2 ? 0.4 : 0;
    },

    // dot travels the full rail from the first topic to the last
    get progress() {
      return (this.active / (this.topics.length - 1)) * 100;
    },

    go(i) {
      this.active = Math.max(0, Math.min(this.topics.length - 1, i));
    },
    next() { this.go(this.active + 1); },
    prev() { this.go(this.active - 1); },

    lockFor(ms) {
      this.locked = true;
      setTimeout(() => { this.locked = false; }, ms);
    },

    onWheel(e) {
      const down = e.deltaY > 0;
      const atStart = this.active === 0;
      const atEnd = this.active === this.topics.length - 1;

      // at either end, hand scrolling back to the page instead of trapping it
      if ((down && atEnd) || (!down && atStart)) { this.accum = 0; return; }

      e.preventDefault();
      if (this.locked) return;

      this.accum += e.deltaY;
      clearTimeout(this.resetTimer);
      this.resetTimer = setTimeout(() => { this.accum = 0; }, 200);

      if (Math.abs(this.accum) < 30) return; // threshold absorbs trackpad inertia
      down ? this.next() : this.prev();
      this.accum = 0;
      this.lockFor(500);
    },

    onTouchMove(e) {
      const y = e.touches[0].clientY;
      const d = this.touchY - y; // positive = swipe up = next topic
      if (Math.abs(d) < 45) return;

      const atStart = this.active === 0;
      const atEnd = this.active === this.topics.length - 1;
      if ((d > 0 && atEnd) || (d < 0 && atStart)) return; // let the page scroll away

      e.preventDefault();
      this.touchY = y;
      if (this.locked) return;
      d > 0 ? this.next() : this.prev();
      this.lockFor(450);
    },
  }));
});

// ---------------------------------------------------------
// Create lucide icons
// ---------------------------------------------------------

lucide.createIcons();



// ---------------------------------------------------------
// SWIPER
// ---------------------------------------------------------
 const speakerSwiper = new Swiper('.speakerSwiper', {
  slidesPerView: 1,
  spaceBetween: 0,
  loop: true,
  speed: 800,
  parallax: true, // Requires adding data-swiper-parallax attributes to HTML elements
  navigation: {
    nextEl: '.swiper-button-next-custom',
    prevEl: '.swiper-button-prev-custom',
  },
});

// ---------------------------------------------------------
// CARD POPUP
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal-popup');
    const closeBtns = document.querySelectorAll('#close-modal-btn');
    const cards = document.querySelectorAll('.speaker-card');

    function openModal() {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(e) {
        if (e) e.preventDefault();
        modal.style.display = 'none';
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Attach listeners to all speaker cards
    cards.forEach(card => card.addEventListener('click', openModal));
    
    // Attach listeners to both mobile and desktop close buttons
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

    // Close on ESC key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Close on background backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});


// ---------------------------------------------------------
// Agenda Image Height  
// ---------------------------------------------------------
 function alignMediaBox() {
        if (window.innerWidth < 1024) return; // Only execute on desktop screens

        const table = document.getElementById('scheduleTable');
        const mediaBox = document.getElementById('mediaBox');

        // Select 2nd row & 2nd to last row
        const startRow = table.querySelector('tr:nth-child(2)');
        const endRow = table.querySelector('tr:nth-last-child(2)');

        if (startRow && endRow && mediaBox) {
            const tableTop = table.getBoundingClientRect().top;
            const startTop = startRow.getBoundingClientRect().top;
            const endBottom = endRow.getBoundingClientRect().bottom;

            // Calculate precise top offset and total height
            const topOffset = startTop - tableTop;
            const totalHeight = endBottom - startTop;

            mediaBox.style.marginTop = `${topOffset}px`;
            mediaBox.style.height = `${totalHeight}px`;
        }
    }

    window.addEventListener('load', alignMediaBox);
    window.addEventListener('resize', alignMediaBox);

    
// ---------------------------------------------------------
// FOR TABLE HIDE ROW
// ---------------------------------------------------------
(function () {
    // Stores detached rows and their original DOM positions
    const detachedRows = [];

    function handleMobileRows() {
        const isMobile = window.innerWidth < 640;
        const table = document.getElementById('scheduleTable');
        if (!table) return;

        if (isMobile) {
            // Find all rows marked for hiding on mobile
            const rowsToHide = table.querySelectorAll('tr[data-mobile-hide="true"]');

            rowsToHide.forEach(row => {
                // Save original position & parent reference
                detachedRows.push({
                    element: row,
                    nextSibling: row.nextElementSibling,
                    parent: row.parentNode
                });
                // Completely detach from DOM so CSS :nth-child re-indexes properly
                row.remove();
            });
        } else {
            // Re-insert detached rows back into their original DOM positions
            while (detachedRows.length > 0) {
                const item = detachedRows.pop();
                if (item.nextSibling && item.parent.contains(item.nextSibling)) {
                    item.parent.insertBefore(item.element, item.nextSibling);
                } else {
                    item.parent.appendChild(item.element);
                }
            }
        }
    }

    // Run on initial page load
    window.addEventListener('DOMContentLoaded', handleMobileRows);

    // Run on window resize with an animation frame throttle to prevent lagging
    let isResizing = false;
    window.addEventListener('resize', () => {
        if (!isResizing) {
            requestAnimationFrame(() => {
                handleMobileRows();
                isResizing = false;
            });
            isResizing = true;
        }
    });
})();


// new accordion slider
document.addEventListener('alpine:init', () => {
    Alpine.data('timelineSlider', () => ({
        progress: 15,

        init() {
            this.updateProgress();
        },

        updateProgress() {
            const viewport = this.$refs.viewport;
            if (!viewport) return;

            const scrollTop = viewport.scrollTop;
            const scrollHeight = viewport.scrollHeight - viewport.clientHeight;

            if (scrollHeight <= 0) {
                this.progress = 100;
                return;
            }

            const rawPercent = (scrollTop / scrollHeight) * 100;
            this.progress = Math.max(15, rawPercent);
        }
    }));
});

// ---------------------------------------------------------
// CARD POPUP AGENDa
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal-popup1');
    const closeBtns = document.querySelectorAll('#close-modal-btn1');
    const cards = document.querySelectorAll('.forum-card');

    function openModal() {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(e) {
        if (e) e.preventDefault();
        modal.style.display = 'none';
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Attach listeners to all speaker cards
    cards.forEach(card => card.addEventListener('click', openModal));
    
    // Attach listeners to both mobile and desktop close buttons
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

    // Close on ESC key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Close on background backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});