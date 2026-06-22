(function() {
    'use strict';

    class SimpleScroll {
        constructor(options = {}) {
            this.options = {
                speed: 0.5,
                lerp: 0.1,
                ...options
            };

            this.body = document.body;
            this.html = document.documentElement;
            this.windowHeight = window.innerHeight;
            this.windowWidth = window.innerWidth;
            this.scrollY = 0;
            this.targetY = 0;
            this.isScrolling = false;
            this.rafId = null;
            this.content = null;
            
            // Get speed from attributes
            const speedAttr = this.body.getAttribute('scroll-speed') || 
                             this.body.getAttribute('data-scroll-speed');
            if (speedAttr !== null) {
                this.options.speed = parseFloat(speedAttr);
            }

            this.init();
        }

        init() {
            // Create a wrapper for content
            this.content = document.createElement('div');
            this.content.className = 'scroll-content';
            
            // Move all body children into the wrapper
            while (this.body.firstChild) {
                this.content.appendChild(this.body.firstChild);
            }
            this.body.appendChild(this.content);

            // Set initial styles
            this.body.style.margin = '0';
            this.body.style.overflow = 'hidden';
            this.body.style.height = '100vh';
            this.body.style.position = 'relative';
            
            this.html.style.overflow = 'hidden';
            this.html.style.height = '100%';
            
            this.content.style.willChange = 'transform';
            this.content.style.transform = 'translate3d(0, 0, 0)';

            // Set initial scroll position
            this.targetY = 0;
            this.scrollY = 0;

            // Add classes
            this.html.classList.add('has-scroll-smooth');
            this.html.classList.add('has-scroll-init');

            // Setup event listeners
            this.setupVirtualScroll();
            window.addEventListener('resize', () => this.onResize());

            // Start the scroll loop
            this.loop();
        }

        setupVirtualScroll() {
            // Handle wheel events
            this.onWheel = this.onWheel.bind(this);
            window.addEventListener('wheel', this.onWheel, { passive: false });

            // Handle touch events
            this.onTouchStart = this.onTouchStart.bind(this);
            this.onTouchMove = this.onTouchMove.bind(this);
            window.addEventListener('touchstart', this.onTouchStart, { passive: true });
            window.addEventListener('touchmove', this.onTouchMove, { passive: false });
        }

        onWheel(e) {
            e.preventDefault();
            const delta = e.deltaY || e.wheelDelta || -e.detail;
            this.targetY += delta * this.options.speed;
            this.limitScroll();
            this.startScrolling();
        }

        onTouchStart(e) {
            this.touchY = e.touches[0].clientY;
        }

        onTouchMove(e) {
            e.preventDefault();
            const touchY = e.touches[0].clientY;
            const delta = (this.touchY - touchY) * 2;
            this.targetY += delta * this.options.speed;
            this.touchY = touchY;
            this.limitScroll();
            this.startScrolling();
        }

        limitScroll() {
            const contentHeight = this.content.offsetHeight;
            const maxScroll = Math.max(0, contentHeight - this.windowHeight);
            this.targetY = Math.max(0, Math.min(this.targetY, maxScroll));
        }

        startScrolling() {
            if (!this.isScrolling) {
                this.isScrolling = true;
                this.html.classList.add('has-scroll-scrolling');
            }
        }

        stopScrolling() {
            if (this.isScrolling) {
                this.isScrolling = false;
                this.html.classList.remove('has-scroll-scrolling');
            }
        }

        onResize() {
            this.windowHeight = window.innerHeight;
            this.windowWidth = window.innerWidth;
            this.limitScroll();
        }

        update() {
            // Smooth interpolation
            const diff = this.targetY - this.scrollY;
            if (Math.abs(diff) > 0.01) {
                this.scrollY += diff * this.options.lerp;
                this.isScrolling = true;
            } else {
                this.scrollY = this.targetY;
                this.stopScrolling();
            }

            // Apply transform to content
            this.content.style.transform = `translate3d(0, -${this.scrollY}px, 0)`;

            // Dispatch scroll event
            this.dispatchScrollEvent();
        }

        loop() {
            this.update();
            this.rafId = requestAnimationFrame(() => this.loop());
        }

        dispatchScrollEvent() {
            const event = new CustomEvent('scroll', {
                detail: {
                    y: this.scrollY,
                    targetY: this.targetY,
                    limit: Math.max(0, this.content.offsetHeight - this.windowHeight),
                    progress: this.scrollY / Math.max(1, this.content.offsetHeight - this.windowHeight),
                    speed: this.options.speed
                }
            });
            document.dispatchEvent(event);
        }

        scrollTo(target, duration = 1000) {
            const startY = this.scrollY;
            let endY = typeof target === 'number' ? target : 
                       target.getBoundingClientRect().top + this.scrollY;
            
            // Clamp end position
            const maxScroll = Math.max(0, this.content.offsetHeight - this.windowHeight);
            endY = Math.max(0, Math.min(endY, maxScroll));
            
            const startTime = Date.now();

            const easeInOut = (t) => {
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            };

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeInOut(progress);
                
                this.targetY = startY + (endY - startY) * easedProgress;
                this.limitScroll();
                this.startScrolling();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            animate();
        }

        destroy() {
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
            }
            
            window.removeEventListener('wheel', this.onWheel);
            window.removeEventListener('touchstart', this.onTouchStart);
            window.removeEventListener('touchmove', this.onTouchMove);
            window.removeEventListener('resize', this.onResize);
            
            // Restore content
            while (this.content.firstChild) {
                this.body.appendChild(this.content.firstChild);
            }
            this.content.remove();
            
            // Restore styles
            this.body.style.margin = '';
            this.body.style.overflow = '';
            this.body.style.height = '';
            this.body.style.position = '';
            this.html.style.overflow = '';
            this.html.style.height = '';
            
            this.html.classList.remove('has-scroll-smooth');
            this.html.classList.remove('has-scroll-scrolling');
            this.html.classList.remove('has-scroll-init');
        }
    }

    // Auto-initialize
    if (document.body.hasAttribute('scroll') || document.body.hasAttribute('data-scroll')) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.simpleScroll = new SimpleScroll();
            });
        } else {
            window.simpleScroll = new SimpleScroll();
        }
    }

    // Export for npm
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SimpleScroll;
    }
})();