import InstanceIndex from '../js/instanceIndex.js';
import Clazz from '../js/clazz.js';
import chai from 'chai';
const assert = chai.assert;
import 'isomorphic-fetch';
import benchmark from "./instanceIndexBenchmark.js";

import Fuse from 'fuse.js';
global.Fuse = Fuse;

describe('search', function()
{
  it('index#search()', async () =>
  {
    for(const entry of benchmark)
    {
      const c = new Clazz(entry.class);
      await c.loadInstances();
      const index = new InstanceIndex(c.instances);
      for(const query of entry.queries)
      {
        const result = index.search(query);
        assert.include(result,entry.instance,query+" "+JSON.stringify(result));
      }
    }
  });
});
