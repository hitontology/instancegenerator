import {getResource} from '../js/resource.js';
import benchmark from "./classBenchmark.js";

import chai from 'chai';
const assert = chai.assert;
import 'isomorphic-fetch';
import Fuse from 'fuse.js';
global.Fuse = Fuse;

describe('Resource', function()
{
  it('getResource()', async () =>
  {
    for(const uri of Object.keys(benchmark))
    {
      const promises = [];
      for(let i=0;i<100;i++) // test caching
      {
        promises.push(getResource(uri));
      }
      const r = (await Promise.all(promises))[0];
      assert.includeMembers((await r.members()).map(m=>m.uri),benchmark[uri].instances);
    }
  },
  );
});
