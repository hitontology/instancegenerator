import Property from '../js/property.js';
import benchmark from './propertyBenchmark.js';
import 'isomorphic-fetch';
import chai from 'chai';
const assert = chai.assert;

describe('Property', function()
{
  it('domainProperties', async () =>
  {
    const properties = await Property.domainProperties("http://hitontology.eu/ontology/SoftwareProduct");
    for(const p of properties)
    {
      console.log(p.uri);
      console.log(benchmark[p.uri]);
      //console.log(entry);
      /*
      for(const i of p.instances)
      {
        assert.include(result,entry.instance,query+" "+JSON.stringify(result));
      }
          */
    }
  });
});
