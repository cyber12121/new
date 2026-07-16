// License Bypass — Injects active license state before anything else runs
(function () {
    // Override chrome.storage to always return active license
    const originalGet = chrome.storage.local.get;
    chrome.storage.local.get = function (keys, callback) {
        if (typeof keys === 'string') keys = [keys];
        if (Array.isArray(keys)) {
            const hasLicenseKey = keys.some(k =>
                typeof k === 'string' &&
                (k.includes('ql_license') || k.includes('pkLic') || k === 'ql_hw_fingerprint')
            );
            if (hasLicenseKey) {
                const result = {};
                keys.forEach(k => {
                    if (k.includes('license_status') || k === 'ql_license_status') result[k] = 'active';
                    else if (k.includes('license_tier') || k === 'ql_license_tier') result[k] = 'pro';
                    else if (k.includes('license_key') || k === 'ql_license_key') result[k] = 'bypass-0000-0000';
                    else if (k.includes('license_activated')) result[k] = true;
                    else if (k.includes('hw_fingerprint') || k === 'ql_hw_fingerprint') result[k] = 'bypass-static-fingerprint-0001';
                    else if (k.includes('pkLic')) result[k] = 'bypass';
                    else result[k] = 'active';
                });
                if (callback) callback(result);
                return;
            }
        }
        return originalGet.call(chrome.storage.local, keys, callback);
    };

    // Set license data immediately
    chrome.storage.local.set({
        'ql_license_status': 'active',
        'ql_license_tier': 'pro',
        'ql_license_key': 'bypass-0000-0000',
        'ql_license_activated': true,
        'ql_hw_fingerprint': 'bypass-static-fingerprint-0001'
    });

    // Set global variables the obfuscated code checks
    window.__qlLicense = {
        status: 'active',
        tier: 'pro',
        activated: true,
        key: 'bypass-0000-0000'
    };

    console.log('[License Bypass] Active — license checks intercepted');
})();