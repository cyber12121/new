// Hardware Fingerprint — STUBBED: returns a static fingerprint
const HW_FINGERPRINT_STUB = '00000000-0000-0000-0000-000000000001';
let _cachedFingerprint = null;

async function generateHardwareFingerprint() {
    return HW_FINGERPRINT_STUB;
}

async function getHardwareFingerprint() {
    if (_cachedFingerprint) return _cachedFingerprint;

    return new Promise((resolve) => {
        chrome.storage.local.get(['ql_hw_fingerprint'], (result) => {
            if (result.ql_hw_fingerprint) {
                _cachedFingerprint = result.ql_hw_fingerprint;
                resolve(_cachedFingerprint);
            } else {
                _cachedFingerprint = HW_FINGERPRINT_STUB;
                chrome.storage.local.set({ 'ql_hw_fingerprint': _cachedFingerprint }, () => {
                    resolve(_cachedFingerprint);
                });
            }
        });
    });
}