/* Toast Popup Library - Pure JS */
(function () {
  const DEFAULTS = {
    position: 'top-right',
    duration: 4000, // ms; confirm ignores unless specified
    dismissible: true,
    maxVisible: 5,
    ariaLive: 'polite',
  };

  const POS_CLASS = {
    'top-right': 'toast-top-right',
    'top-left': 'toast-top-left',
    'bottom-right': 'toast-bottom-right',
    'bottom-left': 'toast-bottom-left',
    'top-center': 'toast-top-center',
    'bottom-center': 'toast-bottom-center',
  };

  const state = {
    defaults: { ...DEFAULTS },
    containers: new Map(),
  };

  function getContainer(position) {
    const pos = POS_CLASS[position] ? position : DEFAULTS.position;
    if (state.containers.has(pos)) return state.containers.get(pos);
    const el = document.createElement('div');
    el.className = `toast-container ${POS_CLASS[pos]}`;
    el.dataset.position = pos;
    document.body.appendChild(el);
    state.containers.set(pos, el);
    return el;
  }

  function clampVisible(container, max) {
    const items = Array.from(container.children);
    if (items.length <= max) return;
    const excess = items.length - max;
    const isBottom = (container.dataset.position || '').includes('bottom');
    if (isBottom) {
      // bottom containers append new to end -> oldest at start
      for (let i = 0; i < excess; i++) hideToast(items[i]);
    } else {
      // top containers prepend new to start -> oldest at end
      for (let i = 0; i < excess; i++) hideToast(items[items.length - 1 - i]);
    }
  }

  function createButton(label, className, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn ${className || ''}`.trim();
    btn.textContent = label;
    if (typeof onClick === 'function') btn.addEventListener('click', onClick);
    return btn;
  }

  function hideToast(el) {
    if (!el || el.__hiding) return;
    el.__hiding = true;
    el.classList.add('hide');
    const remove = () => el.remove();
    el.addEventListener('animationend', remove, { once: true });
    // Fallback in case animation events are lost
    setTimeout(remove, 400);
  }

  function makeToast({ type, title, message, options }) {
    const opts = { ...state.defaults, ...(options || {}) };
    const sticky = opts.duration === 0 || opts.duration === false;
    const container = getContainer(opts.position);

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'alert' ? 'alert' : type === 'confirm' ? 'alertdialog' : 'status');
    toast.setAttribute('aria-live', opts.ariaLive);
    toast.tabIndex = -1;

    if (title) {
      const t = document.createElement('div');
      t.className = 'toast-title';
      t.textContent = title;
      toast.appendChild(t);
    } else {
      // Occupy grid space nicely by inserting empty title when needed
      const s = document.createElement('div');
      s.className = 'toast-title';
      s.style.display = 'none';
      toast.appendChild(s);
    }

    const msg = document.createElement('div');
    msg.className = 'toast-message';
    if (typeof message === 'string') msg.textContent = message;
    else if (message instanceof Node) msg.appendChild(message);
    toast.appendChild(msg);

    if ((opts.dismissible || sticky) && type !== 'confirm') {
      const close = document.createElement('button');
      close.className = 'toast-close';
      close.setAttribute('aria-label', '닫기');
      close.innerHTML = '\u2715';
      close.addEventListener('click', () => hideToast(toast));
      toast.appendChild(close);
    }

    const actions = document.createElement('div');
    actions.className = 'toast-actions';

    let timer = null;
    let resolved = false;

    function armAutoHide() {
      if (type === 'confirm' || sticky) return; // confirm or sticky: no auto-hide
      if (opts.duration && opts.duration > 0) {
        timer = setTimeout(() => hideToast(toast), opts.duration);
      }
    }

    function clearAutoHide() {
      if (timer) { clearTimeout(timer); timer = null; }
    }

    toast.addEventListener('mouseenter', clearAutoHide);
    toast.addEventListener('mouseleave', armAutoHide);

    if (type === 'confirm') {
      const okLabel = opts.okText || '확인';
      const cancelLabel = opts.cancelText || '취소';
      const onOk = () => {
        if (resolved) return; resolved = true;
        if (typeof opts.onConfirm === 'function') opts.onConfirm();
        hideToast(toast);
      };
      const onCancel = () => {
        if (resolved) return; resolved = true;
        if (typeof opts.onCancel === 'function') opts.onCancel();
        hideToast(toast);
      };
      actions.appendChild(createButton(cancelLabel, 'secondary', onCancel));
      actions.appendChild(createButton(okLabel, 'primary', onOk));

      toast.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
        if (e.key === 'Enter') { e.stopPropagation(); onOk(); }
      });

      if (opts.duration && opts.duration > 0) {
        timer = setTimeout(() => { if (!resolved) onCancel(); }, opts.duration);
      }
    } else if (Array.isArray(opts.actions)) {
      opts.actions.slice(0, 3).forEach((a, i) => {
        const btn = createButton(a.label || `Action ${i+1}`, a.className || 'secondary', (ev) => {
          try { a.onClick && a.onClick(ev); } finally { hideToast(toast); }
        });
        actions.appendChild(btn);
      });
    }

    if (actions.childElementCount > 0) toast.appendChild(actions);

    // Insert and manage stacking based on container position
    const isBottom = (container.dataset.position || '').includes('bottom');
    if (isBottom) container.appendChild(toast); else container.prepend(toast);
    clampVisible(container, opts.maxVisible);

    // Focus confirm toasts for accessibility
    if (type === 'confirm' || opts.focus) {
      setTimeout(() => { try { toast.focus(); } catch {} }, 0);
    }

    // Start auto hide where applicable
    armAutoHide();

    return {
      element: toast,
      close: () => hideToast(toast),
    };
  }

  const API = {
    setDefaults(next) { state.defaults = { ...state.defaults, ...(next || {}) }; },
    clear(position) {
      if (position) {
        const c = state.containers.get(position);
        if (c) Array.from(c.children).forEach(hideToast);
      } else {
        state.containers.forEach(c => Array.from(c.children).forEach(hideToast));
      }
    },
    info(message, options = {}) {
      const { title = '정보', ...rest } = options;
      return makeToast({ type: 'info', title, message, options: rest });
    },
    alert(message, options = {}) {
      const { title = '알림', ...rest } = options;
      // Alerts should be assertive
      rest.ariaLive = rest.ariaLive || 'assertive';
      return makeToast({ type: 'alert', title, message, options: rest });
    },
    confirm(message, onConfirm, onCancel, options = {}) {
      const { title = '확인', ...rest } = options;
      rest.onConfirm = onConfirm;
      rest.onCancel = onCancel;
      return makeToast({ type: 'confirm', title, message, options: rest });
    },
  };

  // Expose globally
  if (typeof window !== 'undefined') {
    window.Toast = API;
  }
})();
