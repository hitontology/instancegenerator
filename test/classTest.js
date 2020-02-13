import getClass from '../js/clazz.js';
import benchmark from "./classBenchmark.js";

import chai from 'chai';
const assert = chai.assert;
import 'isomorphic-fetch';
import Fuse from 'fuse.js';
global.Fuse = Fuse;

describe('Clazz', function()
{
  it('get()', async () =>
  {
    for(const uri of Object.keys(benchmark))
    {
      const promises = [];
      for(let i=0;i<100;i++) // test caching
      {
        promises.push(getClass(uri));
      }
      const c = (await Promise.all(promises))[0];
      assert.includeMembers(c.instances.map(i=>i.uri),benchmark[uri].instances);
    }
  },
  );
});
