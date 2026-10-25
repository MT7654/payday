import test from 'node:test';
import assert from 'node:assert/strict';
import { discoveryPath, legacyDiscoveryPath } from '../lib/navigation.ts';

test('calendar links target discovery and retain the exact reward identifier', () => {
  assert.equal(discoveryPath(), '/discover');
  const id = 'saved/reward?one&two=#✓';
  const url = new URL(discoveryPath(id), 'https://payday.test');
  assert.equal(url.pathname, '/discover');
  assert.equal(url.searchParams.get('reward'), id);
  assert.equal(url.searchParams.size, 1);
  assert.equal(url.hash, '');
});

test('old calendar and companion links bypass the landing page without accepting redirect destinations', () => {
  assert.equal(legacyDiscoveryPath({ reward: 'sample-11' }), '/discover?reward=sample-11');
  assert.equal(legacyDiscoveryPath({ reward: ['first', 'second'] }), '/discover?reward=first');
  assert.equal(legacyDiscoveryPath({ companion: 'save' }), '/discover?companion=save');
  assert.equal(legacyDiscoveryPath({}), undefined);
  assert.equal(legacyDiscoveryPath({ reward: '', redirect: 'https://other.test' }), undefined);
  const url = new URL(legacyDiscoveryPath({ reward: '//other.test/#value' }), 'https://payday.test');
  assert.equal(url.origin, 'https://payday.test');
  assert.equal(url.pathname, '/discover');
  assert.equal(url.searchParams.get('reward'), '//other.test/#value');
});
