//import * as search from '../js/search.js';
import Search from '../js/search.js';
import chai from 'chai';
const assert = chai.assert;
import 'isomorphic-fetch';
// the global "log" is normally registered in the index file, so we have to do that here
import * as rdf from '../js/rdf.js';
import * as sparql from '../js/sparql.js';
import benchmark from "./benchmark.js";

import Fuse from 'fuse.js';
global.Fuse = Fuse;
//const fs = require('fs');

function equals(as, bs)
{
  if (as.size !== bs.size) {return false;}
  for (const a of as) {if (!bs.has(a)) {return false;}}
  return true;
}

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
  /*
  // each of the terms in the first array of each entry should lead to each in the second array
  const benchmark = [
  // space and case insensitive
  [[],
  [["3LGM2 Service Class","3LGM²-S Service Class"],["bb:3LGM2SServiceClass"]],
  [["DurchfuehrungJourFixeCEO","Durchfuehrung Jour-Fixe CEO","Durchführung Jour-Fixé CEO"],["ciox:DurchfuehrungJourFixeCEO"]],
];
for(const entry of benchmark)
{
const queries = entry[0];
const correctResults = entry[1];
for(const query of queries)
{
const results = await fuse.search(query);
assert.includeMembers(results,correctResults.map(r=>rdf.long(r)));

}
*/
});
