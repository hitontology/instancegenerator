/** @module */
import getClass from '../js/clazz.js';

/** All catalogues of a certain type, such as FeatureCatalogue.*/
export class Catalogue
{
  /** A catalogue of classified elements that can be cited */
  constructor(catalogueClass,classifiedClass,citationClass)
  {
    this.catalogueClass=catalogueClass;
    this.classifiedClass=classifiedClass;
    this.citationClass=citationClass;
  }
}

/** A HITO feature catalogue */
export async function featureCatalogue()
{
  return new Catalogue(
    await getClass("http://hitontology.eu/ontology/FeatureCatalogue"),
    await getClass("http://hitontology.eu/ontology/FeatureClassified"),
    await getClass("http://hitontology.eu/ontology/FeatureCitation"));
}