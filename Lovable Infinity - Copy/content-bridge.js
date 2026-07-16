// Content Bridge — PATCHED: No license checks, no fingerprint collection

(function () {
    'use strict';

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (!message || !message.type) {
            sendResponse({ ok: false });
            return false;
        }

        const type = message.type;

        // Project info request — handled locally
        if (type === 'getProjectInfo') {
            const projectId = getProjectIdFromUrl();
            sendResponse({
                ok: true,
                projectId: projectId,
                url: window.location.href
            });
            return false;
        }

        // Ping — always respond
        if (type === 'ping') {
            sendResponse({ ok: true, alive: true });
            return false;
        }

        // Forward to Lovable page context
        if (type === 'forwardToLovable') {
            window.postMessage({ type: 'lovable-infy-command', payload: message.payload }, '*');
            sendResponse({ ok: true });
            return false;
        }

        // Default response
        sendResponse({ ok: true });
        return false;
    });

    // Listen for postMessage from page context
    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        if (!event.data || !event.data.type) return;

        // Bridge pageHook messages to background
        if (event.data.type === '__lovable_infy_bridge') {
            chrome.runtime.sendMessage(event.data.payload, (response) => {
                window.postMessage({
                    type: '__lovable_infy_response',
                    id: event.data.id,
                    payload: response
                }, '*');
            });
        }
    });

    function getProjectIdFromUrl() {
        const match = window.location.pathname.match(/\/projects\/([0-9a-fA-F-]{36})/i);
        return match ? match[1] : '';
    }

    console.log('[Content Bridge] Loaded — patched edition');
})();