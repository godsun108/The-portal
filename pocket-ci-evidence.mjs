// Pocket CI browser evidence is intentionally UNSIGNED and UNTRUSTED.
// Export only allowlisted fields. This module never handles shared secrets or arbitrary logs.
const ALLOWED_SCOPES = Object.freeze(['browser-engine-self-test','same-origin-static-smoke-only']);
const MAX_CHECKS = 64;
export function makeBrowserEvidence(scope, result, now = new Date()) {
  if (!ALLOWED_SCOPES.includes(scope)) throw new Error('Unsupported browser evidence scope');
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new Error('Invalid clock');
  if (!result || !Array.isArray(result.checks) || !result.checks.length || result.checks.length > MAX_CHECKS) {
    throw new Error('Invalid check collection');
  }
  const checks = result.checks.map((item, index) => {
    if (!item || typeof item.label !== 'string' || !item.label || item.label.length > 160 || typeof item.passed !== 'boolean') {
      throw new Error('Malformed check at index ' + index);
    }
    return { name: item.label, status: item.passed ? 'pass' : 'fail' };
  });
  const passed = checks.filter((item) => item.status === 'pass').length;
  if (result.passed !== (passed === checks.length)) throw new Error('Inconsistent result summary');
  return {
    schema: 'pocket-ci-browser-evidence/v1',
    evidence_type: 'untrusted-browser-local',
    scope,
    created_at: now.toISOString(),
    passed,
    total: checks.length,
    status: passed === checks.length ? 'pass' : 'fail',
    checks,
    limitations: 'On-device browser checks only. Not authenticated, not CI-equivalent, and not proof of production or trading outcomes.'
  };
}
export function inspectBrowserEvidence(data) {
  if (!data || data.schema !== 'pocket-ci-browser-evidence/v1' ||
      data.evidence_type !== 'untrusted-browser-local' ||
      !ALLOWED_SCOPES.includes(data.scope) ||
      !Array.isArray(data.checks) || data.checks.length < 1 || data.checks.length > MAX_CHECKS) {
    return { valid:false, status:'invalid' };
  }
  const checked = data.checks.every(x => x && typeof x.name === 'string' && x.name.length > 0 && x.name.length <= 160 && ['pass','fail'].includes(x.status));
  const count = data.checks.filter(x => x?.status === 'pass').length;
  const valid = checked && Number.isInteger(data.passed) && data.passed === count &&
    data.total === data.checks.length &&
    data.status === (count === data.total ? 'pass' : 'fail') &&
    typeof data.created_at === 'string' && !Number.isNaN(Date.parse(data.created_at)) &&
    /(?:Z|[+-]\d{2}:\d{2})$/.test(data.created_at);
  return { valid, status:valid ? 'untrusted-browser-' + data.status : 'invalid' };
}
