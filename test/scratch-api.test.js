const { it } = require('node:test');
const assert = require('node:assert/strict');
const ScratchAPI = require('../src/scratch-api');

it('getProjectMeta on shared project', async () => {
    const sharedProject = await ScratchAPI.getProjectMeta('437419376');
    assert.equal(sharedProject.id, 437419376);
    assert.equal(sharedProject.title, 'Bouncing');
});

it('getProjectMeta on unshared project', async () => {
    await assert.rejects(ScratchAPI.getProjectMeta('531027641'), /unshared/);
});
