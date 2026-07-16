// Lovable Auth — STUBBED: extracts token from page context only

function lovableProjectIdFromUrl(url) {
    if (!url) return '';
    const match = String(url).match(/\/projects\/([0-9a-fA-F-]{36})/i);
    return match ? match[1] : '';
}

function isValidLovableProjectId(id) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(String(id || ''));
}

function pickLovableApiToken(token1, token2, token3) {
    const candidates = [token2, token3].filter(Boolean);
    if (candidates.length > 0) return candidates[0];
    return String(token1 || '').replace(/^Bearer\s+/i, '').trim();
}

async function fetchLovableApiToken() {
    try {
        const response = await fetch('/api/auth/user', {
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            const data = await response.json();
            return data.token || data.access_token || '';
        }
    } catch (e) {
        // silent
    }
    return '';
}