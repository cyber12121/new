// pageHook.js — License bypass + original page hook
(function () {
    'use strict';

    // Step 1: Bypass license checks before anything
    // These run in MAIN world so the obfuscated code can see them

    // Override localStorage checks
    const originalGetItem = localStorage.getItem.bind(localStorage);
    localStorage.getItem = function (key) {
        if (key && (key.includes('ql_license') || key.includes('pkLic'))) {
            if (key.includes('status') || key === 'ql_license_status') return 'active';
            if (key.includes('tier') || key === 'ql_license_tier') return 'pro';
            if (key.includes('key') || key === 'ql_license_key') return 'bypass-0000-0000';
            if (key.includes('activated')) return 'true';
            return 'active';
        }
        return originalGetItem(key);
    };

    // Override sessionStorage checks
    const originalSGetItem = sessionStorage.getItem.bind(sessionStorage);
    sessionStorage.getItem = function (key) {
        if (key && (key.includes('ql_license') || key.includes('pkLic'))) {
            if (key.includes('status') || key === 'ql_license_status') return 'active';
            if (key.includes('tier') || key === 'ql_license_tier') return 'pro';
            if (key.includes('key') || key === 'ql_license_key') return 'bypass-0000-0000';
            if (key.includes('activated')) return 'true';
            return 'active';
        }
        return originalSGetItem(key);
    };

    // Set global variables the obfuscated code checks
    window.__qlLicense = {
        status: 'active',
        tier: 'pro',
        activated: true,
        key: 'bypass-0000-0000',
        expiresAt: null
    };

    // Also set it on document for good measure
    document.__qlLicense = window.__qlLicense;

    // Pre-populate localStorage
    try {
        localStorage.setItem('ql_license_status', 'active');
        localStorage.setItem('ql_license_tier', 'pro');
        localStorage.setItem('ql_license_key', 'bypass-0000-0000');
        localStorage.setItem('ql_license_activated', 'true');
        localStorage.setItem('pkLicStatus', 'active');
        localStorage.setItem('pkLicenseKey', 'bypass-0000-0000');
        localStorage.setItem('is_trial', 'false');
    } catch (e) { }

    console.log('[pageHook] License bypass active in MAIN world');

    // Step 2: Forward messages between page context and extension
    window.addEventListener('message', function (event) {
        if (event.source !== window) return;
        if (!event.data || !event.data.type) return;

        if (event.data.type === '__lovable_infy_bridge') {
            chrome.runtime.sendMessage(event.data.payload, function (response) {
                window.postMessage({
                    type: '__lovable_infy_response',
                    id: event.data.id,
                    payload: response
                }, '*');
            });
        }
    });

    // Step 3: Intercept postMessage requests from extension
    window.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'lovable-infy-command') {
            // Forward to the page's lovable handlers
            window.postMessage({ type: '__lovable_infy_command', payload: event.data.payload }, '*');
        }
    });

    console.log('[pageHook] Loaded — patched edition');
})();