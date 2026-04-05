import React from 'react';

export const supportedUrlPatterns = (
  <div className="max-w-md">
    <div className="font-semibold mb-2">Supported URL Patterns</div>
    <div className="space-y-2 text-xs">
      <div><strong>1) Optional Protocol:</strong><br /><code>https://example.com/*</code></div>
      <div><strong>2) Wildcard Subdomains:</strong><br /><code>https://*.example.com/*</code></div>
      <div><strong>3) Hostname Suffix Wildcard:</strong><br /><code>http://github.co*</code></div>
      <div><strong>4) Hostname Prefix Wildcard:</strong><br /><code>http://*example.com/*</code></div>
      <div><strong>5) Full Hostname Wildcard:</strong><br /><code>http://*</code></div>
      <div><strong>6) Path Wildcard (single segment):</strong><br /><code>https://example.com/checkout/*</code></div>
      <div><strong>7) Path Wildcard (multiple segments):</strong><br /><code>http://example.com/*/abc</code></div>
      <div><strong>8) Query Wildcard:</strong><br /><code>https://example.com/search?query=*</code></div>
      <div><strong>9) Hash Wildcard:</strong><br /><code>https://example.com/docs#*</code></div>
      <div><strong>10) Combination of Subdomain + Path Wildcard:</strong><br /><code>https://*.example.com/*/product/*</code></div>
      <div><strong>11) Protocol Optional + Hostname Prefix Wildcard:</strong><br /><code>https://*example.com/*</code></div>
      <div><strong>12) Any Protocol + Any Host + Path Wildcard:</strong><br /><code>*://*/*</code></div>
      <div><strong>13) Bare Domain:</strong><br /><code>example.com/*</code></div>
      <div><strong>14) Bare Domain with Path and Query:</strong><br /><code>example.com/search?*</code></div>
      <div><strong>15) Any Path After Domain:</strong><br /><code>example.com/*/details</code></div>
    </div>
  </div>
);
