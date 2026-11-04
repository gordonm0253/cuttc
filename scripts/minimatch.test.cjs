const assert = require('node:assert/strict');
const path = require('node:path');
const { createRequire } = require('node:module');
const { test } = require('node:test');
const { Linter } = require('eslint');
const react = require('eslint-plugin-react');

const eslintRequire = createRequire(require.resolve('eslint/package.json'));
const minimatch = eslintRequire('minimatch');

test('ESLint resolves the patched matcher with legacy and named CommonJS APIs', () => {
  assert.equal(eslintRequire('minimatch/package.json').version, '11.0.1');
  assert.equal(typeof minimatch, 'function');
  assert.equal(minimatch.minimatch, minimatch);
  assert.equal(minimatch('src/home.jsx', '**/*.jsx'), true);
  assert.equal(minimatch.minimatch('src/home.js', '**/*.jsx'), false);
  assert.equal(new minimatch.Minimatch('**/*.jsx').match('src/home.jsx'), true);
});

test('ESM default and named exports work for both ESLint configuration packages', async () => {
  const matcher = await import('minimatch');
  assert.equal(matcher.default, matcher.minimatch);
  assert.equal(matcher.default('src/home.jsx', '**/*.jsx'), true);
  assert.equal(new matcher.Minimatch('**/*.jsx').match('src/home.jsx'), true);

  const { ConfigArray } = await import('@eslint/config-array');
  const configs = new ConfigArray([{ files: ['**/*.jsx'], enabled: true }], {
    basePath: __dirname,
    schema: { enabled: { merge: 'overwrite', validate: 'boolean' } },
  });
  await configs.normalize();
  assert.equal(configs.getConfig(path.join(__dirname, 'view.jsx')).enabled, true);
  assert.equal(configs.getConfig(path.join(__dirname, 'view.ts')), undefined);

  const { FlatCompat } = await import('@eslint/eslintrc');
  const compat = new FlatCompat({ baseDirectory: __dirname });
  const overrides = compat.config({ overrides: [{ files: ['**/*.jsx'], rules: { eqeqeq: 'error' } }] });
  assert.equal(overrides[0].files[0](path.join(__dirname, 'view.jsx')), true);
  assert.equal(overrides[0].files[0](path.join(__dirname, 'view.ts')), false);
});

test('glob preprocessing caps amplification at braceExpandMax', () => {
  const pattern = Array(30).fill('**/../a/b').join('/');
  const matcher = new minimatch.Minimatch(pattern, { optimizationLevel: 2, braceExpandMax: 64 });
  assert.equal(matcher.set.length, 64);
});

test('large glob sets skip quadratic second-phase comparisons and still match correctly', () => {
  const small = new minimatch.Minimatch('{x,*}/{0..9}', { optimizationLevel: 2 });
  assert.equal(small.set.length, 10);

  const large = new minimatch.Minimatch('{x,*}/{0..999}', { optimizationLevel: 2 });
  assert.equal(large.set.length, 2000);
  assert.equal(large.match('x/5'), true);
  assert.equal(large.match('y/999'), true);
  assert.equal(large.match('.y/5'), false);
});

const ruleCases = [
  {
    rule: 'forbid-component-props',
    options: { forbid: [{ propNamePattern: 'data-*', allowedForPatterns: ['Safe*'] }] },
    source: '<><WidgetCard data-secret="x" /><SafeCard data-secret="x" /></>',
    messageId: 'propIsForbidden',
  },
  {
    rule: 'jsx-handler-names',
    options: { checkLocalVariables: true, ignoreComponentNames: ['Ignored*'] },
    source: '<><WidgetCard onClick={click} /><IgnoredCard onClick={click} /></>',
    messageId: 'badHandlerName',
  },
  {
    rule: 'jsx-pascal-case',
    options: { ignore: ['Ignored*'] },
    source: '<><UI_WIDGET /><Ignored_WIDGET /></>',
    messageId: 'usePascalCase',
  },
  {
    rule: 'no-danger',
    options: { customComponentNames: ['Unsafe*'] },
    source: '<><UnsafeCard dangerouslySetInnerHTML={{ __html: "" }} /><SafeCard dangerouslySetInnerHTML={{ __html: "" }} /></>',
    messageId: 'dangerousProp',
  },
  {
    rule: 'no-unstable-nested-components',
    options: { propNamePattern: 'render*' },
    source: 'function View() { return <Widget renderHeader={() => <div />} footer={() => <div />} />; }',
  },
];

for (const { rule, options, source, messageId } of ruleCases) {
  test(`React ${rule} still evaluates glob options`, () => {
    const ruleId = `react/${rule}`;
    const messages = new Linter().verify(source, [{
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      settings: { react: { version: '19.2' } },
      plugins: { react },
      rules: { [ruleId]: ['error', options] },
    }]);
    assert.equal(messages.length, 1, JSON.stringify(messages));
    assert.equal(messages[0].ruleId, ruleId);
    assert.equal(messages[0].fatal, undefined);
    if (messageId) assert.equal(messages[0].messageId, messageId);
  });
}
