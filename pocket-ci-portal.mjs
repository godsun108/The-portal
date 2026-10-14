// Fixed same-origin smoke checks; deliberately no arbitrary URLs or code execution.
export const REQUIRED_FILES = Object.freeze([
  'tv.html',
  'tv-playback-state.js',
  'tv-network.js',
  'tv-catalog.js',
]);

export async function runPortalSmoke(fetcher = fetch, parse = (text) => new DOMParser().parseFromString(text, 'text/html')) {
  const checks = [];
  const contents = new Map();
  for (const path of REQUIRED_FILES) {
    try {
      const response = await fetcher(path, { cache: 'no-store', credentials: 'omit', redirect: 'error' });
      if (!response.ok || response.type === 'opaque') {
        checks.push({ label: `${path} is accessible`, passed: false });
        continue;
      }
      const body = await response.text();
      const passed = body.length > 32 && body.length <= 3000000;
      checks.push({label: `${path} responds with nonempty source`, passed});
      if (passed) contents.set(path, body);
    } catch (_) {
      checks.push({ label: `${path} is accessible`, passed: false });
    }
  }
  if (contents.has('tv.html')) {
    try {
      const doc = parse(contents.get('tv.html'));
      const ids = [...doc.querySelectorAll('[id]')].map((el) => el.id);
      checks.push({ label: 'TV markup contains unique element IDs', passed: ids.length > 0 && ids.length === new Set(ids).size });
      checks.push({ label: 'TV has an application title', passed: !!doc.querySelector('title')?.textContent?.trim() });
    } catch (_) {
      checks.push({ label: 'TV markup contains unique element IDs', passed: false });
      checks.push({ label: 'TV has an application title', passed: false });
    }
  } else {
    checks.push({ label: 'TV markup contains unique element IDs', passed: false });
    checks.push({ label: 'TV has an application title', passed: false });
  }
  return { checks, passed: checks.length === REQUIRED_FILES.length + 2 && checks.every((x) => x.passed), scope: 'same-origin-static-smoke-only' };
}
