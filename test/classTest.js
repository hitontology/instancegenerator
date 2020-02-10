import Clazz from '../js/clazz.js';
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
      let c;
      for(let i=0;i<1000;i++) // test caching
      {
        c = await Clazz.get(uri);
      }
      assert.includeMembers(c.instances.map(i=>i.uri),benchmark[uri].instances);
    }
  },
  );
});
