import Search from '../js/search.js';
import chai from 'chai';
const assert = chai.assert;
import 'isomorphic-fetch';
import benchmark from "./benchmark.js";

import Fuse from 'fuse.js';
global.Fuse = Fuse;

describe('search', function()
{
  let search;
  it('index#search()', async () =>
  {
    for(const entry of benchmark)
    {
      search = new Search(entry.class,[entry.graph],entry.endpoint);
      await search.init();
      for(const query of entry.queries)
      {
        const result = search.search(query);
        assert.include(result,entry.instance,query+" "+JSON.stringify(result));
      }
    }
  });
});
