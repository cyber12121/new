// Background Service Worker — PATCHED: all license auth & telemetry removed

const LOVABLE_DOMAINS = ['lovable.dev', 'api.lovable.dev'];

// Side panel setup
chrome.runtime.onInstalled.addListener(() => {
    if (chrome.sidePanel) {
        chrome.sidePanel.setOptions({
            enabled: true,
            path: 'sidepanel.html'
        });
    }

    // Set patched license state
    chrome.storage.local.set({
        'ql_license_status': 'active',
        'ql_license_tier': 'pro',
        'ql_license_key': 'patched-free',
        'ql_hw_fingerprint': 'patched-static-fingerprint'
    });
});

// Enable side panel on lovable.dev
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        try {
            const url = new URL(tab.url);
            if (LOVABLE_DOMAINS.some(d => url.hostname.endsWith(d))) {
                if (chrome.sidePanel) {
                    chrome.sidePanel.setOptions({
                        tabId,
                        path: 'sidepanel.html',
                        enabled: true
                    });
                }
            }
        } catch (e) { }
    }
});

// Message router — only handles functional messages, no license
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || !message.type) {
        sendResponse({ ok: false, error: 'no_type' });
        return false;
    }

    const type = message.type;

    // Forward messages to content script in lovable tabs
    if (type === 'sendPromptToLovable' || type === 'sendPrompt') {
        chrome.tabs.query({ url: ['https://lovable.dev/*', 'https://*.lovable.dev/*'] }, (tabs) => {
            for (const tab of tabs) {
                chrome.tabs.sendMessage(tab.id, message, (response) => {
                    if (response) {
                        sendResponse(response);
                    }
                });
            }
        });
        return true; // keep channel open
    }

    // Project file fetch
    if (type === 'fetchProjectFiles') {
        const url = `https://api.lovable.dev/v1/projects/${message.projectId}/files`;
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${message.token}`,
                'Accept': 'application/json'
            }
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => sendResponse({ success: true, files: data.files || [] }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    // Cookie reader (scoped to lovable.dev only)
    if (type === 'getLovableCookies') {
        chrome.cookies.getAll({ domain: 'lovable.dev' }, (cookies) => {
            const pairs = [];
            if (cookies) {
                for (const c of cookies) {
                    if (typeof c.value === 'string') {
                        pairs.push(c.name + '=' + c.value);
                    }
                }
            }
            sendResponse({ ok: true, cookie: pairs.join('; ') });
        });
        return true;
    }

    // Default passthrough
    sendResponse({ ok: true });
    return false;
});

// Always respond to license checks with 'active'
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message && message.type === 'getLicenseStatus') {
        sendResponse({ status: 'active', tier: 'pro' });
        return true;
    }
    sendResponse({ ok: false });
    return false;
});