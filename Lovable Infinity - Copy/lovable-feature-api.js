// Lovable Feature API — STUBBED: no-op
async function getFeatureFlags() {
    return { features: [], flags: {} };
}

async function reportFeatureUsage(feature, data) {
    // silently ignored
    return true;
}

async function checkFeatureAccess(feature) {
    return { allowed: true, reason: null };
}