// toast.js - RiverFlow Toast v2
// Zero deps • Drop-in • Just vibes

(function() {
    'use strict';

    // -------- CONFIG --------
    const DEFAULTS = {
        duration: 4000,
        position: 'bottom-right',
        containerId: 'rf-toast-container',
        mode: 'dark',
        animation: 'right-left'
    };

    // -------- STATE --------
    let toastCount = 0;
    let currentMode = DEFAULTS.mode;
    let currentAnim = DEFAULTS.animation;
    let container = null;

    // -------- ICON MAP --------
    const ICONS = {
        default: '📢',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: '💡'
    };

    // -------- STYLES (auto-injected) --------
    const STYLES = `
        .rf-toast-container {
            position: fixed;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 400px;
            width: 100%;
            pointer-events: none;
            padding: 16px;
        }
        .rf-toast-container.bottom-right { bottom: 0; right: 0; }
        .rf-toast-container.bottom-left { bottom: 0; left: 0; }
        .rf-toast-container.top-right { top: 0; right: 0; }
        .rf-toast-container.top-left { top: 0; left: 0; }
        .rf-toast-container.top-center { top: 0; left: 50%; transform: translateX(-50%); }
        .rf-toast-container.bottom-center { bottom: 0; left: 50%; transform: translateX(-50%); }

        .rf-toast-container .rf-toast {
            pointer-events: auto;
            padding: 16px 20px;
            border-radius: 16px;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            font-size: 0.95rem;
            line-height: 1.5;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
            display: flex;
            align-items: center;
            gap: 14px;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            transition: opacity 0.35s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
            will-change: transform, opacity;
            opacity: 0;
            transform: var(--rf-toast-transform-out, translateX(120%)) scale(0.95);
            border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .rf-toast-container .rf-toast.show {
            opacity: 1;
            transform: var(--rf-toast-transform-in, translateX(0)) scale(1);
        }
        .rf-toast-container .rf-toast.hide {
            opacity: 0;
            transform: var(--rf-toast-transform-out, translateX(120%)) scale(0.95);
        }

        .rf-toast-container .rf-toast .rf-toast-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
            line-height: 1;
        }
        .rf-toast-container .rf-toast .rf-toast-msg {
            flex: 1;
            font-weight: 450;
        }
        .rf-toast-container .rf-toast .rf-toast-close {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0 0 0 8px;
            line-height: 1;
            opacity: 0.5;
            transition: opacity 0.2s, transform 0.2s;
            color: inherit;
        }
        .rf-toast-container .rf-toast .rf-toast-close:hover {
            opacity: 1;
            transform: rotate(90deg);
        }

        /* MODES */
        .rf-toast.light {
            background: rgba(255, 255, 255, 0.92);
            color: #1a1a2e;
            border-color: rgba(0, 0, 0, 0.05);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
        }
        .rf-toast.dark {
            background: rgba(26, 26, 46, 0.92);
            color: #eee;
            border-color: rgba(255, 255, 255, 0.06);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
        }
        .rf-toast.neon {
            background: rgba(10, 10, 30, 0.92);
            color: #00f5ff;
            border-color: #00f5ff44;
            box-shadow: 0 0 30px rgba(0, 245, 255, 0.15), inset 0 0 30px rgba(0, 245, 255, 0.03);
            text-shadow: 0 0 20px rgba(0, 245, 255, 0.2);
        }
        .rf-toast.glass {
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
        }
        .rf-toast.gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 0 12px 40px rgba(118, 75, 162, 0.3);
        }
        .rf-toast.gradient.success {
            background: linear-gradient(135deg, #11998e, #38ef7d);
        }
        .rf-toast.gradient.warning {
            background: linear-gradient(135deg, #f093fb, #f5576c);
        }
        .rf-toast.gradient.error {
            background: linear-gradient(135deg, #eb3349, #f45c43);
        }
        .rf-toast.gradient.info {
            background: linear-gradient(135deg, #4facfe, #00f2fe);
        }
        .rf-toast.minimal {
            background: rgba(255, 255, 255, 0.05);
            color: #ccc;
            border-color: rgba(255, 255, 255, 0.04);
            box-shadow: none;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            border-radius: 8px;
            padding: 12px 16px;
        }

        /* Type colors for dark/light modes */
        .rf-toast.dark.success, .rf-toast.light.success {
            background: rgba(0, 200, 81, 0.12);
        }
        .rf-toast.dark.warning, .rf-toast.light.warning {
            background: rgba(255, 187, 51, 0.12);
        }
        .rf-toast.dark.error, .rf-toast.light.error {
            background: rgba(255, 68, 68, 0.12);
        }
        .rf-toast.dark.info, .rf-toast.light.info {
            background: rgba(51, 181, 229, 0.12);
        }

        /* ANIMATIONS */
        .rf-toast.anim-up-down {
            --rf-toast-transform-out: translateY(80px) scale(0.95);
            --rf-toast-transform-in: translateY(0) scale(1);
        }
        .rf-toast.anim-down-up {
            --rf-toast-transform-out: translateY(-80px) scale(0.95);
            --rf-toast-transform-in: translateY(0) scale(1);
        }
        .rf-toast.anim-left-right {
            --rf-toast-transform-out: translateX(-120%) scale(0.95);
            --rf-toast-transform-in: translateX(0) scale(1);
        }
        .rf-toast.anim-right-left {
            --rf-toast-transform-out: translateX(120%) scale(0.95);
            --rf-toast-transform-in: translateX(0) scale(1);
        }
        .rf-toast.anim-zoom {
            --rf-toast-transform-out: scale(0.6) translateY(40px);
            --rf-toast-transform-in: scale(1) translateY(0);
        }
        .rf-toast.anim-bounce {
            --rf-toast-transform-out: translateX(120%) scale(0.8);
            --rf-toast-transform-in: translateX(0) scale(1);
            transition: opacity 0.35s ease, transform 0.6s cubic-bezier(0.34, 1.7, 0.64, 1);
        }
    `;

    // -------- INJECT STYLES --------
    let stylesInjected = false;

    function injectStyles() {
        if (stylesInjected) return;
        const style = document.createElement('style');
        style.textContent = STYLES;
        document.head.appendChild(style);
        stylesInjected = true;
    }

    // -------- GET/CREATE CONTAINER --------
    function getContainer() {
        if (!container) {
            container = document.getElementById(DEFAULTS.containerId);
            if (!container) {
                container = document.createElement('div');
                container.id = DEFAULTS.containerId;
                container.className = 'rf-toast-container ' + DEFAULTS.position;
                document.body.appendChild(container);
            }
        }
        return container;
    }

    // -------- CORE API --------
    window.RiverFlow = window.RiverFlow || {};

    function getAnimClass(anim) {
        const map = {
            'up-down': 'anim-up-down',
            'down-up': 'anim-down-up',
            'left-right': 'anim-left-right',
            'right-left': 'anim-right-left',
            'zoom': 'anim-zoom',
            'bounce': 'anim-bounce'
        };
        return map[anim] || 'anim-right-left';
    }

    window.RiverFlow.toast = function toast(message, options) {
        if (!message) return;

        // Inject styles on first use
        injectStyles();

        const opts = Object.assign({}, DEFAULTS, options || {});
        const type = opts.type || 'default';
        const icon = ICONS[type] || ICONS.default;
        const duration = opts.duration;
        const closeable = opts.closeable !== false;
        const mode = opts.mode || currentMode;
        const anim = opts.animation || currentAnim;
        const position = opts.position || DEFAULTS.position;

        // Update container position if needed
        const container = getContainer();
        if (position && !container.classList.contains(position)) {
            // Remove all position classes
            ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'top-center', 'bottom-center'].forEach(pos => {
                container.classList.remove(pos);
            });
            container.classList.add(position);
        }

        const toast = document.createElement('div');
        toast.className = `rf-toast ${mode} ${getAnimClass(anim)} ${type}`;
        toast.id = `rf-toast-${++toastCount}`;
        toast.setAttribute('role', 'alert');

        let html = `<span class="rf-toast-icon">${icon}</span>`;
        html += `<span class="rf-toast-msg">${message}</span>`;
        if (closeable) {
            html += `<button class="rf-toast-close" aria-label="Close toast">&times;</button>`;
        }
        toast.innerHTML = html;

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        let hideTimer = null;

        function hideToast() {
            if (hideTimer) clearTimeout(hideTimer);
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 500);
        }

        if (duration > 0) {
            hideTimer = setTimeout(hideToast, duration);
        }

        const closeBtn = toast.querySelector('.rf-toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideToast);
        }

        toast.addEventListener('mouseenter', () => {
            if (hideTimer) clearTimeout(hideTimer);
        });
        toast.addEventListener('mouseleave', () => {
            if (duration > 0) {
                hideTimer = setTimeout(hideToast, duration);
            }
        });

        return {
            hide: hideToast,
            element: toast
        };
    };

    // -------- SHORTHANDS --------
    window.RiverFlow.toastSuccess = function(msg, opts) {
        return window.RiverFlow.toast(msg, Object.assign({ type: 'success' }, opts));
    };
    window.RiverFlow.toastWarning = function(msg, opts) {
        return window.RiverFlow.toast(msg, Object.assign({ type: 'warning' }, opts));
    };
    window.RiverFlow.toastError = function(msg, opts) {
        return window.RiverFlow.toast(msg, Object.assign({ type: 'error' }, opts));
    };
    window.RiverFlow.toastInfo = function(msg, opts) {
        return window.RiverFlow.toast(msg, Object.assign({ type: 'info' }, opts));
    };

    // -------- SET CONFIG --------
    window.RiverFlow.setToastMode = function(mode) {
        if (['light', 'dark', 'neon', 'glass', 'gradient', 'minimal'].includes(mode)) {
            currentMode = mode;
        }
    };

    window.RiverFlow.setToastAnimation = function(anim) {
        if (['up-down', 'down-up', 'left-right', 'right-left', 'zoom', 'bounce'].includes(anim)) {
            currentAnim = anim;
        }
    };

    window.RiverFlow.setToastPosition = function(pos) {
        if (['bottom-right', 'bottom-left', 'top-right', 'top-left', 'top-center', 'bottom-center'].includes(pos)) {
            DEFAULTS.position = pos;
            const c = getContainer();
            // Remove all position classes
            ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'top-center', 'bottom-center'].forEach(p => {
                c.classList.remove(p);
            });
            c.classList.add(pos);
        }
    };

    window.RiverFlow.setToastDuration = function(ms) {
        if (typeof ms === 'number' && ms >= 0) {
            DEFAULTS.duration = ms;
        }
    };

    window.RiverFlow.bindToast = function(config) {
        if (!config || !config.id || !config.message) return;

        const element = document.getElementById(config.id);
        if (!element) return;

        // Get position from button class
        let position = null;
        const positions = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'top-center', 'bottom-center'];
        for (let i = 0; i < positions.length; i++) {
            if (element.classList.contains(positions[i])) {
                position = positions[i];
                break;
            }
        }

        const handler = function(e) {
            const opts = {
                type: config.type || 'default',
                mode: config.mode || currentMode,
                animation: config.animation || currentAnim,
                duration: config.duration || DEFAULTS.duration,
                closeable: config.closeable !== undefined ? config.closeable : true,
                position: position || DEFAULTS.position
            };
            
            window.RiverFlow.toast(config.message, opts);
        };

        element.addEventListener('click', handler);
    };

    // -------- EXPOSE TO WINDOW --------
    window.toast = window.RiverFlow.toast;
    window.toastSuccess = window.RiverFlow.toastSuccess;
    window.toastWarning = window.RiverFlow.toastWarning;
    window.toastError = window.RiverFlow.toastError;
    window.toastInfo = window.RiverFlow.toastInfo;
    window.setToastMode = window.RiverFlow.setToastMode;
    window.setToastAnimation = window.RiverFlow.setToastAnimation;
    window.setToastPosition = window.RiverFlow.setToastPosition;
    window.setToastDuration = window.RiverFlow.setToastDuration;
    window.bindToast = window.RiverFlow.bindToast;

    console.log('RiverFlow Toast v2 loaded!');
    console.log('  Try: toast("Hello world!")');
    console.log('  Try: toastSuccess("Success!")');
    console.log('  Try: setToastMode("neon")');
    console.log('  Try: setToastAnimation("bounce")');

})();
