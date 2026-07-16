#!/bin/bash
# Create the patched build directory
git clone https://github.com/cyber12121/infi.git infi_patched
cd infi_patched

# Remove the original license/device tracking/fingerprint files
rm -f license-guard.js hwFingerprint.js lovable-auth.js lovable-feature-api.js

# Create stub files
cat > license-guard.js << 'EOF'
(function() {
  const licenseState = { status: 'active', tier: 'pro', activated: true, expiresAt: null, key: 'patched-free' };
  window.__qlLicense = licenseState;
  chrome.storage.local.set({
    'ql_license_status': 'active',
    'ql_license_key': 'patched-free',
    'ql_license_tier': 'pro',
    'ql_license_activated': true
  });
  console.log('[License Guard] Stubbed');
})();
EOF

cat > hwFingerprint.js << 'EOF'
const HW_FINGERPRINT_STUB = '00000000-0000-0000-0000-000000000001';
let _cachedFingerprint = null;
async function generateHardwareFingerprint() { return HW_FINGERPRINT_STUB; }
async function getHardwareFingerprint() {
  if (_cachedFingerprint) return _cachedFingerprint;
  return new Promise((resolve) => {
    chrome.storage.local.get(['ql_hw_fingerprint'], (result) => {
      if (result.ql_hw_fingerprint) { _cachedFingerprint = result.ql_hw_fingerprint; resolve(_cachedFingerprint); }
      else { _cachedFingerprint = HW_FINGERPRINT_STUB; chrome.storage.local.set({ 'ql_hw_fingerprint': _cachedFingerprint }, () => resolve(_cachedFingerprint)); }
    });
  });
}
EOF

cat > lovable-auth.js << 'EOF'
function lovableProjectIdFromUrl(url) { if (!url) return ''; const m = String(url).match(/\/projects\/([0-9a-fA-F-]{36})/i); return m ? m[1] : ''; }
function isValidLovableProjectId(id) { return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(String(id||'')); }
function pickLovableApiToken(t1, t2, t3) { const c = [t2, t3].filter(Boolean); if (c.length) return c[0]; return String(t1||'').replace(/^Bearer\s+/i,'').trim(); }
async function fetchLovableApiToken() { try { const r = await fetch('/api/auth/user',{credentials:'include',headers:{'Accept':'application/json'}}); if(r.ok){const d=await r.json();return d.token||d.access_token||'';} }catch(e){} return ''; }
EOF

cat > lovable-feature-api.js << 'EOF'
async function getFeatureFlags() { return {features:[], flags:{}}; }
async function reportFeatureUsage(feature, data) { return true; }
async function checkFeatureAccess(feature) { return {allowed:true, reason:null}; }
EOF

# Update manifest.json to remove the blocked files
python3 -c "
import json
with open('manifest.json','r') as f:
    m = json.load(f)
# Remove permissions
m['permissions'] = [p for p in m['permissions'] if p != 'cookies']
# Remove external hosts
m['host_permissions'] = [h for h in m['host_permissions'] if 'powerkits.net' not in h and 'lovableinfy.lovable.app' not in h and 'lovable-api.com' not in h]
# Remove hwFingerprint, license-guard, lovable-auth, lovable-feature-api from content_scripts
for cs in m['content_scripts']:
    cs['js'] = [j for j in cs['js'] if j not in ['hwFingerprint.js','license-guard.js','lovable-auth.js','lovable-feature-api.js']]
with open('manifest.json','w') as f:
    json.dump(m, f, indent=2)
"

# Replace popup.html with clean version
cat > popup.html << 'POPEOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Lovable Infinity</title>
  <link rel="stylesheet" href="theme.css"/>
  <style>
    body { width:340px; padding:20px; font-family:'Inter',system-ui,sans-serif; background:var(--ql-bg); color:var(--ql-text-primary); }
    .header { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
    .header img { width:32px; height:32px; border-radius:50%; }
    .header h1 { font-size:18px; font-weight:700; margin:0; font-family:'Outfit',system-ui,sans-serif; }
    .card { background:var(--ql-bg-surface); border:1px solid var(--ql-border); border-radius:var(--ql-radius); padding:16px; margin-bottom:16px; }
    .active-row { display:flex; align-items:center; gap:8px; color:var(--ql-success); font-weight:600; }
    .dot { width:8px; height:8px; border-radius:50%; background:var(--ql-success); box-shadow:0 0 8px var(--ql-success); }
    .row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; }
    .lbl { color:var(--ql-text-secondary); }
    .val { color:var(--ql-text-primary); font-weight:500; }
    .badge { background:var(--ql-accent-subtle); color:var(--ql-accent); padding:2px 10px; border-radius:9999px; font-size:12px; font-weight:600; }
    .footer { text-align:center; font-size:11px; color:var(--ql-text-muted); margin-top:16px; }
  </style>
</head>
<body>
  <div class="header"><img src="assets/icon128.png" alt=""/><h1>Lovable Infinity</h1><span class="badge">Patched</span></div>
  <div class="card">
    <div class="active-row"><div class="dot"></div><span>License Active</span></div>
    <div class="row"><span class="lbl">Status</span><span class="val">Unlimited</span></div>
    <div class="row"><span class="lbl">Tier</span><span class="val">Pro</span></div>
    <div class="row"><span class="lbl">Device Tracking</span><span class="val" style="color:var(--ql-text-muted)">Disabled</span></div>
  </div>
  <div style="font-size:13px;color:var(--ql-text-secondary);text-align:center;">Fully operational on lovable.dev</div>
  <div class="footer">Lovable Infinity · Patched Build</div>
</body>
</html>
POPEOF

# Replace popup.js
echo "document.addEventListener('DOMContentLoaded', () => console.log('[Lovable Infinity] Popup — patched'));" > popup.js

# Replace background.js with clean version
cat > background.js << 'BGEOF'
const LOVABLE_DOMAINS = ['lovable.dev','api.lovable.dev'];
chrome.runtime.onInstalled.addListener(() => {
  if(chrome.sidePanel) chrome.sidePanel.setOptions({enabled:true,path:'sidepanel.html'});
  chrome.storage.local.set({ql_license_status:'active',ql_license_tier:'pro',ql_license_key:'patched-free',ql_hw_fingerprint:'patched-static'});
});
chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab) => {
  if(changeInfo.status==='complete'&&tab.url) try {
    const u=new URL(tab.url);
    if(LOVABLE_DOMAINS.some(d=>u.hostname.endsWith(d))&&chrome.sidePanel) chrome.sidePanel.setOptions({tabId,path:'sidepanel.html',enabled:true});
  }catch(e){}
});
chrome.runtime.onMessage.addListener((msg,sender,sr) => {
  if(!msg||!msg.type){sr({ok:false,error:'no_type'});return false;}
  if(msg.type==='sendPromptToLovable'||msg.type==='sendPrompt'){
    chrome.tabs.query({url:['https://lovable.dev/*','https://*.lovable.dev/*']},tabs=>{for(const t of tabs)chrome.tabs.sendMessage(t.id,msg,r=>{if(r)sr(r);});});
    return true;
  }
  if(msg.type==='fetchProjectFiles'){
    fetch(`https://api.lovable.dev/v1/projects/${msg.projectId}/files`,{method:'GET',headers:{'Authorization':'Bearer '+msg.token,'Accept':'application/json'}})
      .then(r=>r.ok?r.json():Promise.reject(new Error('HTTP '+r.status)))
      .then(d=>sr({success:true,files:d.files||[]}))
      .catch(e=>sr({success:false,error:e.message}));
    return true;
  }
  if(msg.type==='getLovableCookies'){
    chrome.cookies.getAll({domain:'lovable.dev'},cks=>{const p=[];for(const c of cks||[])if(typeof c.value==='string')p.push(c.name+'='+c.value);sr({ok:true,cookie:p.join('; ')});});
    return true;
  }
  sr({ok:true});return false;
});
chrome.runtime.onMessageExternal.addListener((msg,sender,sr) => {
  if(msg&&msg.type==='getLicenseStatus'){sr({status:'active',tier:'pro'});return true;}
  sr({ok:false});return false;
});
BGEOF

# Replace extension-config.js
cat > extension-config.js << 'ECEOF'
const EXTENSION_CONFIG = {name:'Lovable Infinity',version:'6.4.5',isPatched:true,features:{floatingUI:true,sidePanel:true,autoSend:true,templates:true,fileUpload:true}};
function pkSetStorage(k,v){try{localStorage.setItem('ql_'+k,JSON.stringify(v));}catch(e){}}
function pkGetStorage(k){try{const v=localStorage.getItem('ql_'+k);return v?JSON.parse(v):null;}catch(e){return null;}}
function pkRemoveStorage(k){try{localStorage.removeItem('ql_'+k);}catch(e){}}
function pkParseUtcExpiry(d){if(d==null||d==='')return null;if(typeof d==='number'&&!isNaN(d))return d;const s=String(d).trim();if(!s)return null;if(!/Z|[+-]\d{2}:?\d{2}$/.test(s))return Date.parse(s+'T00:00:00Z');const t=Date.parse(s);return isNaN(t)?null:t;}
function pkResolveLicenseStatus(l){if(!l)return'inactive';if(l.activated||l.status==='active')return'active';if(l.expired||l.status==='expired')return'expired';return l.status||'inactive';}
function pkLicenseStoragePatch(l){if(!l)return{};const p={ql_license_status:pkResolveLicenseStatus(l)};if(l&&l.tier)p.ql_license_tier=l.tier;if(l&&l.expiresAt!=null)p.ql_expires_at=l.expiresAt;return p;}
ECEOF

# Replace content-bridge.js
cat > content-bridge.js << 'CBEOF'
(function(){'use strict';
chrome.runtime.onMessage.addListener((msg,sender,sr)=>{
  if(!msg||!msg.type){sr({ok:false});return false;}
  if(msg.type==='getProjectInfo'){const m=window.location.pathname.match(/\/projects\/([0-9a-fA-F-]{36})/i);sr({ok:true,projectId:m?m[1]:'',url:window.location.href});return false;}
  if(msg.type==='ping'){sr({ok:true,alive:true});return false;}
  if(msg.type==='forwardToLovable'){window.postMessage({type:'lovable-infy-command',payload:msg.payload},'*');sr({ok:true});return false;}
  sr({ok:true});return false;
});
window.addEventListener('message',e=>{if(e.source!==window||!e.data||!e.data.type)return;if(e.data.type==='__lovable_infy_bridge')chrome.runtime.sendMessage(e.data.payload,r=>{window.postMessage({type:'__lovable_infy_response',id:e.data.id,payload:r},'*');});});
console.log('[Content Bridge] Patched');
})();
CBEOF

# Replace content.js
cat > content.js << 'CEOF'
(function(){'use strict';
function init(){
  if(document.documentElement.hasAttribute('data-ql-loaded'))return;
  document.documentElement.setAttribute('data-ql-loaded','true');
  document.dispatchEvent(new CustomEvent('ql-ready',{detail:{status:'active',tier:'pro'}}));
  if(!document.getElementById('ql-floating')){const d=document.createElement('div');d.id='ql-floating';d.className='ql-minimized';d.style.display='none';document.body.appendChild(d);}
  console.log('[Lovable Infinity] Content script — patched');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
CEOF

# Replace sidepanel.js with clean version
cat > sidepanel.js << 'SPEOF'
(function(){'use strict';
const mainEl=document.getElementById('sp-main');
function showStatus(t,m){
  mainEl.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:32px;text-align:center;gap:16px;">'
    +'<div style="width:48px;height:48px;border-radius:14px;background:var(--ql-accent-subtle);display:flex;align-items:center;justify-content:center;">'
    +'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ql-accent)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>'
    +'<div style="font-size:18px;font-weight:700;font-family:var(--ql-font-display);color:var(--ql-text-primary)">'+t+'</div>'
    +'<div style="font-size:13px;color:var(--ql-text-secondary);max-width:280px;line-height:1.5">'+m+'</div></div>';
}
function showProjectActive(id){
  mainEl.innerHTML='<div style="padding:24px;">'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">'
    +'<div style="width:10px;height:10px;border-radius:50%;background:var(--ql-success);box-shadow:0 0 8px var(--ql-success)"></div>'
    +'<span style="font-size:14px;font-weight:600;color:var(--ql-text-primary)">Project Active</span>'
    +'<span style="font-size:11px;color:var(--ql-text-muted);font-family:var(--ql-font-mono)">'+id.slice(0,8)+'...</span></div>'
    +'<div style="background:var(--ql-bg-surface);border:1px solid var(--ql-border);border-radius:var(--ql-radius);padding:16px;">'
    +'<div style="font-size:13px;font-weight:600;color:var(--ql-text-secondary);margin-bottom:12px;">Quick Actions</div>'
    +'<button class="ql-action-btn" onclick="chrome.tabs.query({active:true,currentWindow:true},t=>{if(t[0])chrome.tabs.sendMessage(t[0].id,{type:\'ping\'})})">'
    +'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Refresh</button></div></div>'
    +'<div style="margin-top:16px;font-size:12px;color:var(--ql-text-muted);text-align:center">All features unlocked — Patched Edition</div></div>';
}
function setupDetection(){
  chrome.tabs.query({active:true,currentWindow:true},tabs=>{const t=tabs[0];if(t&&t.url&&t.url.includes('lovable.dev')){const m=t.url.match(/\/projects\/([0-9a-fA-F-]{36})/);if(m)showProjectActive(m[1]);else showStatus('On Lovable','Open a project to use the Infinity panel.');}});
  chrome.tabs.onActivated.addListener(()=>{chrome.tabs.query({active:true,currentWindow:true},tabs=>{const t=tabs[0];if(t&&t.url){const m=t.url.match(/\/projects\/([0-9a-fA-F-]{36})/);if(m)showProjectActive(m[1]);}});});
}
const s=document.createElement('style');s.textContent='.ql-action-btn{display:flex;align-items:center;gap:8px;width:100%;padding:10px 14px;border:1px solid var(--ql-border);border-radius:var(--ql-radius-sm);background:var(--ql-bg-surface);color:var(--ql-text-primary);font-size:13px;font-weight:500;cursor:pointer;transition:all var(--ql-transition);font-family:inherit}.ql-action-btn:hover{background:var(--ql-bg-hover);border-color:var(--ql-border-hover)}';document.head.appendChild(s);
document.addEventListener('DOMContentLoaded',()=>{setupDetection();});
})();
SPEOF

echo "[✓] All files patched. Now create the zip:"
cd ..
zip -r infi_patched.zip infi_patched/
echo "[✓] Created infi_patched.zip"