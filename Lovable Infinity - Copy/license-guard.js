(function () {
  const licenseState = { status: 'active', tier: 'pro', activated: true, expiresAt: null, key: 'bypass-0000-0000' };
  window.__qlLicense = licenseState;
  chrome.storage.local.set({
    'ql_license_status': 'active',
    'ql_license_key': 'bypass-0000-0000',
    'ql_license_tier': 'pro',
    'ql_license_activated': true
  });
  console.log('[License Guard] Stubbed');
})();