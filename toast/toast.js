// Simple: toast(message, type, mode, animation)
// Types: 'success', 'error', 'warning', 'info', 'default'
// Modes: 'dark', 'light', 'neon', 'glass', 'gradient', 'minimal'
// Animations: 'right-left', 'left-right', 'up-down', 'down-up', 'zoom', 'bounce'

(function() {
    'use strict';

    var styles = `
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
            top: 20px;
            right: 20px;
            bottom: auto;
            left: auto;
        }

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

        .rf-toast.light { background: rgba(255,255,255,0.92); color: #1a1a2e; border-color: rgba(0,0,0,0.05); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
        .rf-toast.dark { background: rgba(26,26,46,0.92); color: #eee; border-color: rgba(255,255,255,0.06); box-shadow: 0 12px 40px rgba(0,0,0,0.35); }
        .rf-toast.neon { background: rgba(10,10,30,0.92); color: #00f5ff; border-color: #00f5ff44; box-shadow: 0 0 30px rgba(0,245,255,0.15), inset 0 0 30px rgba(0,245,255,0.03); text-shadow: 0 0 20px rgba(0,245,255,0.2); }
        .rf-toast.glass { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.15); box-shadow: 0 12px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .rf-toast.gradient { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border-color: rgba(255,255,255,0.15); box-shadow: 0 12px 40px rgba(118,75,162,0.3); }
        .rf-toast.minimal { background: rgba(255,255,255,0.05); color: #ccc; border-color: rgba(255,255,255,0.04); box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; border-radius: 8px; padding: 12px 16px; }

        .rf-toast.gradient.success { background: linear-gradient(135deg, #11998e, #38ef7d); }
        .rf-toast.gradient.warning { background: linear-gradient(135deg, #f093fb, #f5576c); }
        .rf-toast.gradient.error { background: linear-gradient(135deg, #eb3349, #f45c43); }
        .rf-toast.gradient.info { background: linear-gradient(135deg, #4facfe, #00f2fe); }

        .rf-toast.dark.success, .rf-toast.light.success { background: rgba(0,200,81,0.12); }
        .rf-toast.dark.warning, .rf-toast.light.warning { background: rgba(255,187,51,0.12); }
        .rf-toast.dark.error, .rf-toast.light.error { background: rgba(255,68,68,0.12); }
        .rf-toast.dark.info, .rf-toast.light.info { background: rgba(51,181,229,0.12); }

        .rf-toast.anim-up-down { --rf-toast-transform-out: translateY(80px) scale(0.95); --rf-toast-transform-in: translateY(0) scale(1); }
        .rf-toast.anim-down-up { --rf-toast-transform-out: translateY(-80px) scale(0.95); --rf-toast-transform-in: translateY(0) scale(1); }
        .rf-toast.anim-left-right { --rf-toast-transform-out: translateX(-120%) scale(0.95); --rf-toast-transform-in: translateX(0) scale(1); }
        .rf-toast.anim-right-left { --rf-toast-transform-out: translateX(120%) scale(0.95); --rf-toast-transform-in: translateX(0) scale(1); }
        .rf-toast.anim-zoom { --rf-toast-transform-out: scale(0.6) translateY(40px); --rf-toast-transform-in: scale(1) translateY(0); }
        .rf-toast.anim-bounce { --rf-toast-transform-out: translateX(120%) scale(0.8); --rf-toast-transform-in: translateX(0) scale(1); transition: opacity 0.35s ease, transform 0.6s cubic-bezier(0.34, 1.7, 0.64, 1); }
    `;

    var styleTag = document.createElement('style');
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
    var container = document.createElement('div');
    container.id = 'rf-toast-container';
    container.className = 'rf-toast-container';
    document.documentElement.appendChild(container);

    var toastCount = 0;
    var currentMode = 'dark';
    var currentAnim = 'right-left';
    var currentDuration = 4000;

    var ICONS = {
        default: '',
        success: '',
        warning: '',
        error: '',
        info: ''
    };

    function getAnimClass(anim) {
        var map = {
            'up-down': 'anim-up-down',
            'down-up': 'anim-down-up',
            'left-right': 'anim-left-right',
            'right-left': 'anim-right-left',
            'zoom': 'anim-zoom',
            'bounce': 'anim-bounce'
        };
        return map[anim] || 'anim-right-left';
    }

    function toast(message, type, mode, animation) {
        if (!message) return;

        var typeVal = type || 'default';
        var modeVal = mode || currentMode;
        var animVal = animation || currentAnim;
        var icon = ICONS[typeVal] || ICONS.default;

        var toastEl = document.createElement('div');
        toastEl.className = 'rf-toast ' + modeVal + ' ' + getAnimClass(animVal) + ' ' + typeVal;
        toastEl.id = 'rf-toast-' + (++toastCount);
        toastEl.setAttribute('role', 'alert');

        var html = '<span class="rf-toast-icon">' + icon + '</span>';
        html += '<span class="rf-toast-msg">' + message + '</span>';
        html += '<button class="rf-toast-close" aria-label="Close toast">&times;</button>';
        toastEl.innerHTML = html;

        container.appendChild(toastEl);

        requestAnimationFrame(function() {
            toastEl.classList.add('show');
        });

        var hideTimer = null;

        function hideToast() {
            if (hideTimer) clearTimeout(hideTimer);
            toastEl.classList.remove('show');
            toastEl.classList.add('hide');
            setTimeout(function() {
                if (toastEl.parentNode) toastEl.remove();
            }, 500);
        }

        hideTimer = setTimeout(hideToast, currentDuration);

        var closeBtn = toastEl.querySelector('.rf-toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideToast);
        }

        toastEl.addEventListener('mouseenter', function() {
            clearTimeout(hideTimer);
        });
        toastEl.addEventListener('mouseleave', function() {
            hideTimer = setTimeout(hideToast, currentDuration);
        });

        return {
            hide: hideToast,
            element: toastEl
        };
    }

    function setMode(mode) {
        var modes = ['light', 'dark', 'neon', 'glass', 'gradient', 'minimal'];
        if (modes.indexOf(mode) !== -1) currentMode = mode;
    }

    function setAnimation(anim) {
        var anims = ['up-down', 'down-up', 'left-right', 'right-left', 'zoom', 'bounce'];
        if (anims.indexOf(anim) !== -1) currentAnim = anim;
    }

    function setPosition(pos) {
        var positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'];
        if (positions.indexOf(pos) !== -1) {
            container.className = 'rf-toast-container ' + pos;
        }
    }

    function setDuration(ms) {
        if (typeof ms === 'number' && ms > 0) currentDuration = ms;
    }

    function toastSuccess(msg, mode, anim) { return toast(msg, 'success', mode, anim); }
    function toastError(msg, mode, anim) { return toast(msg, 'error', mode, anim); }
    function toastWarning(msg, mode, anim) { return toast(msg, 'warning', mode, anim); }
    function toastInfo(msg, mode, anim) { return toast(msg, 'info', mode, anim); }

    window.toast = toast;
    window.toastSuccess = toastSuccess;
    window.toastError = toastError;
    window.toastWarning = toastWarning;
    window.toastInfo = toastInfo;
    window.setToastMode = setMode;
    window.setToastAnimation = setAnimation;
    window.setToastPosition = setPosition;
    window.setToastDuration = setDuration;

    console.log('🍞 RiverFlow Toast loaded!');
    console.log('  toast("hi", "success", "neon")');
    console.log('  toastSuccess("Done!", "glass", "bounce")');
})();
