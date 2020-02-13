import getClass from '../js/clazz.js';
import {featureCatalogue} from '../js/catalogue.js';
import chai from 'chai';
const assert = chai.assert;
import 'isomorphic-fetch';
/*
import Fuse from 'fuse.js';
global.Fuse = Fuse;
*/
describe('Catalogue', function()
{
  it('new', async () =>
  {
    const cat = featureCatalogue();
  });
});
