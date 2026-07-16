// Sidepanel JS — PATCHED: No license gate, no fingerprinting, full functionality

(function () {
    'use strict';

    const mainEl = document.getElementById('sp-main');

    function init() {
        showStatus('Connected', 'You are logged in. Navigate to a Lovable project to get started.');
        setupProjectDetection();
    }

    function showStatus(title, message) {
        mainEl.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:32px;text-align:center;gap:16px;">
        <div style="width:48px;height:48px;border-radius:14px;background:var(--ql-accent-subtle);display:flex;align-items:center;justify-content:center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ql-accent)" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div style="font-size:18px;font-weight:700;font-family:var(--ql-font-display);color:var(--ql-text-primary);">${title}</div>
        <div style="font-size:13px;color:var(--ql-text-secondary);max-width:280px;line-height:1.5;">${message}</div>
      </div>
    `;
    }

    function setupProjectDetection() {
        // Detect when user is on a lovable.dev project page
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (tab && tab.url && tab.url.includes('lovable.dev')) {
                const match = tab.url.match(/\/projects\/([0-9a-fA-F-]{36})/);
                if (match) {
                    showProjectActive(match[1]);
                } else {
                    showStatus('On Lovable', 'Open a project to use the Infinity panel.');
                }
            }
        });

        // Listen for tab changes
        chrome.tabs.onActivated.addListener(() => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tab = tabs[0];
                if (tab && tab.url) {
                    const match = tab.url.match(/\/projects\/([0-9a-fA-F-]{36})/);
                    if (match) {
                        showProjectActive(match[1]);
                    }
                }
            });
        });
    }

    function showProjectActive(projectId) {
        mainEl.innerHTML = `
      <div style="padding:24px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <div style="width:10px;height:10px;border-radius:50%;background:var(--ql-success);box-shadow:0 0 8px var(--ql-success);"></div>
          <span style="font-size:14px;font-weight:600;color:var(--ql-text-primary);">Project Active</span>
          <span style="font-size:11px;color:var(--ql-text-muted);font-family:var(--ql-font-mono);">${projectId.slice(0, 8)}...</span>
        </div>

        <div style="background:var(--ql-bg-surface);border:1px solid var(--ql-border);border-radius:var(--ql-radius);padding:16px;">
          <div style="font-size:13px;font-weight:600;color:var(--ql-text-secondary);margin-bottom:12px;">Quick Actions</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <button class="ql-action-btn" data-action="refresh">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Refresh Project
            </button>
          </div>
        </div>

        <div style="margin-top:16px;font-size:12px;color:var(--ql-text-muted);text-align:center;">
          All features unlocked — Patched Edition
        </div>
      </div>
    `;

        document.querySelectorAll('.ql-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                chrome.tabs.sendMessage(projectId, { type: 'ping' }, () => { });
            });
        });
    }

    // Inject styles for action buttons
    const style = document.createElement('style');
    style.textContent = `
    .ql-action-btn {
      display:flex;align-items:center;gap:8px;
      width:100%;padding:10px 14px;
      border:1px solid var(--ql-border);
      border-radius:var(--ql-radius-sm);
      background:var(--ql-bg-surface);
      color:var(--ql-text-primary);
      font-size:13px;font-weight:500;
      cursor:pointer;
      transition:all var(--ql-transition);
      font-family:inherit;
    }
    .ql-action-btn:hover {
      background:var(--ql-bg-hover);
      border-color:var(--ql-border-hover);
    }
  `;
    document.head.appendChild(style);

    // Start
    document.addEventListener('DOMContentLoaded', init);
    if (document.readyState !== 'loading') init();
})();