// Content Script — PATCHED: License gate removed, always initializes

(function () {
    'use strict';

    const QL_READY_EVENT = 'ql-ready';

    function initExtension() {
        if (document.documentElement.hasAttribute('data-ql-loaded')) return;
        document.documentElement.setAttribute('data-ql-loaded', 'true');

        // Signal that the extension is ready
        document.dispatchEvent(new CustomEvent(QL_READY_EVENT, {
            detail: { status: 'active', tier: 'pro' }
        }));

        // Mount floating UI
        initFloatingUI();

        console.log('[Lovable Infinity] Content script initialized — patched edition');
    }

    function initFloatingUI() {
        // The floating UI is built by content-templates.js and sounds.js
        // We just need to ensure the container exists
        if (!document.getElementById('ql-floating')) {
            const floatingDiv = document.createElement('div');
            floatingDiv.id = 'ql-floating';
            floatingDiv.className = 'ql-minimized';
            floatingDiv.style.display = 'none';
            document.body.appendChild(floatingDiv);
        }
    }

    // Start immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExtension);
    } else {
        initExtension();
    }
})();