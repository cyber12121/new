// License Guard — STUBBED: always reports active license
(function() {
  const licenseState = {
    status: 'active',
    tier: 'pro',
    activated: true,
    expiresAt: null,
    key: 'patched-free'
  };

  window.__qlLicense = licenseState;

  chrome.storage.local.set({
    'ql_license_status': 'active',
    'ql_license_key': 'patched-free',
    'ql_license_tier': 'pro',
    'ql_license_activated': true
  });

  console.log('[License Guard] Stubbed — license checks bypassed.');
})();
