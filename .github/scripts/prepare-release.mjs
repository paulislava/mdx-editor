import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const packagePath = new URL('../../package.json', import.meta.url);
const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
const current = JSON.parse(execFileSync('npm', ['view', `${pkg.name}@latest`, 'version', '--json'], { encoding: 'utf8' }));
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const isCanary = process.env.GITHUB_EVENT_NAME === 'pull_request';
const tags = execFileSync('git', ['tag', '--points-at', 'HEAD', '--list', 'v*'], { encoding: 'utf8' }).trim();

if (!isCanary && tags) {
  console.log(`Commit already released as ${tags.split('\n')[0]}`);
  appendFileSync(process.env.GITHUB_OUTPUT, 'skip=true\n');
  process.exit(0);
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) throw new Error(`Unsupported stable version: ${version}`);
  return match.slice(1).map(Number);
}

const localVersion = parseVersion(pkg.version);
const publishedVersion = parseVersion(current);
const base = [localVersion, publishedVersion].sort((a, b) =>
  a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
).at(-1);
const next = `${base[0]}.${base[1]}.${base[2] + 1}`;
const pr = process.env.PR_NUMBER;
if (isCanary && !/^\d+$/.test(pr || '')) throw new Error('Missing PR number');
const version = isCanary ? `${next}-canary.${pr}.${commit.slice(0, 8)}` : next;

try {
  execFileSync('npm', ['view', `${pkg.name}@${version}`, 'version', '--json'], { stdio: 'ignore' });
  console.log(`${pkg.name}@${version} already exists`);
  appendFileSync(process.env.GITHUB_OUTPUT, 'skip=true\n');
  process.exit(0);
} catch {
  // This exact version has not been published yet.
}

pkg.version = version;
writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
appendFileSync(process.env.GITHUB_OUTPUT, `skip=false\nversion=${version}\n`);
console.log(`Prepared ${pkg.name}@${version}`);
