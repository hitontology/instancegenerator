import getClass from '../js/clazz.js';
import ResourceIndex from '../js/resourceIndex.js';
import chai from 'chai';
const assert = chai.assert;
import 'isomorphic-fetch';
import benchmark from "./resourceIndexBenchmark.js";

import Fuse from 'fuse.js';
global.Fuse = Fuse;

describe('search', function()
{
  it('index#search()', async () =>
  {
    for(const entry of benchmark)
    {
      const c = await getClass(entry.class);
      const members = (await c.getMembers()).values();
      if(!c.index) {c.index = new ResourceIndex(members);}

      for(const query of entry.queries)
      {
        const result = c.index.search(query);
        assert.include(result,entry.instance,query+" "+JSON.stringify(result));
      }
    }
  });
});
