// pageHook.js — Injects license bypass into page context BEFORE any lovable code runs
(function () {
    'use strict';

    // Inject license data into localStorage synchronously before anything else
    try {
        localStorage.setItem('ql_license_status', 'active');
        localStorage.setItem('ql_license_tier', 'pro');
        localStorage.setItem('ql_license_key', 'bypass-0000-0000');
        localStorage.setItem('ql_license_activated', 'true');
        localStorage.setItem('ql_expires_at', '');
        localStorage.setItem('ql_hw_fingerprint', 'bypass-static-0001');
        // Also set the pkLic variants the obfuscated code checks
        localStorage.setItem('pkLicStatus', 'active');
        localStorage.setItem('pkLicenseKey', 'bypass-0000-0000');
        localStorage.setItem('pkLicTier', 'pro');
        localStorage.setItem('pkLicActivated', 'true');
        localStorage.setItem('is_trial', 'false');
        localStorage.setItem('pk_device_id', 'bypass-device-0001');
        localStorage.setItem('ql_license_data', JSON.stringify({
            status: 'active',
            tier: 'pro',
            key: 'bypass-0000-0000',
            activated: true,
            expiresAt: null
        }));
    } catch (e) { }

    // Also set sessionStorage
    try {
        sessionStorage.setItem('ql_license_status', 'active');
        sessionStorage.setItem('ql_license_tier', 'pro');
    } catch (e) { }

    // Set global variable for any inline checks
    window.__qlLicense = {
        status: 'active',
        tier: 'pro',
        activated: true,
        key: 'bypass-0000-0000',
        expiresAt: null,
        raw: 'active'
    };

    // Override localStorage.getItem for any runtime checks
    const originalGetItem = localStorage.getItem.bind(localStorage);
    localStorage.getItem = function (key) {
        if (!key) return originalGetItem(key);
        // Intercept any license-related key
        if (key.includes('ql_license') || key.includes('pkLic') || key.includes('pkLicense') || key === 'is_trial') {
            if (key.includes('status') || key === 'ql_license_status') return 'active';
            if (key.includes('tier') || key === 'ql_license_tier') return 'pro';
            if (key.includes('key') || key === 'ql_license_key') return 'bypass-0000-0000';
            if (key.includes('activated')) return 'true';
            if (key === 'is_trial') return 'false';
            if (key.includes('hw_fingerprint') || key === 'ql_hw_fingerprint') return 'bypass-static-0001';
            if (key === 'pkLicStatus') return 'active';
            if (key === 'pkLicenseKey') return 'bypass-0000-0000';
            if (key === 'pkLicTier') return 'pro';
            if (key === 'pkLicActivated') return 'true';
            if (key === 'pk_device_id') return 'bypass-device-0001';
            // For any other license key, return active
            return 'active';
        }
        return originalGetItem(key);
    };

    console.log('[pageHook] License bypass injected into page context');
    console.log('[pageHook] localStorage ql_license_status:', localStorage.getItem('ql_license_status'));
})();