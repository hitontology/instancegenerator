import getClass from '../js/clazz.js';
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
      const c = await getClass(entry.class);
      for(const query of entry.queries)
      {
        const result = c.search(query);
        assert.include(result,entry.instance,query+" "+JSON.stringify(result));
      }
    }
  });
});
