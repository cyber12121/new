// Extension Config — PATCHED: all license/telemetry removed

const EXTENSION_CONFIG = {
    name: 'Lovable Infinity',
    version: '6.4.5',
    isPatched: true,
    features: {
        floatingUI: true,
        sidePanel: true,
        autoSend: true,
        templates: true,
        fileUpload: true
    }
};

// Storage helpers (cleaned)
function pkSetStorage(key, value) {
    try {
        localStorage.setItem('ql_' + key, JSON.stringify(value));
    } catch (e) { }
}

function pkGetStorage(key) {
    try {
        const val = localStorage.getItem('ql_' + key);
        return val ? JSON.parse(val) : null;
    } catch (e) { return null; }
}

function pkRemoveStorage(key) {
    try {
        localStorage.removeItem('ql_' + key);
    } catch (e) { }
}

function pkParseUtcExpiry(dateStr) {
    if (dateStr == null || dateStr === '') return null;
    if (typeof dateStr === 'number' && !isNaN(dateStr)) return dateStr;
    const s = String(dateStr).trim();
    if (!s) return null;
    if (!/Z|[+-]\d{2}:?\d{2}$/.test(s)) {
        return Date.parse(s + 'T00:00:00Z');
    }
    const t = Date.parse(s);
    return isNaN(t) ? null : t;
}

function pkResolveLicenseStatus(licenseData) {
    if (!licenseData) return 'inactive';
    if (licenseData.activated || licenseData.status === 'active') return 'active';
    if (licenseData.expired || licenseData.status === 'expired') return 'expired';
    return licenseData.status || 'inactive';
}

function pkLicenseStoragePatch(licenseData) {
    if (!licenseData) return {};
    const patch = {
        ql_license_status: pkResolveLicenseStatus(licenseData)
    };
    if (licenseData && licenseData.tier) patch.ql_license_tier = licenseData.tier;
    if (licenseData && licenseData.expiresAt != null) patch.ql_expires_at = licenseData.expiresAt;
    return patch;
}