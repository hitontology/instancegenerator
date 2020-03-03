/** @module */
import getClass from '../js/clazz.js';

/** All catalogues of a certain type, such as FeatureCatalogue.*/
export class Catalogue
{
  /** A catalogue of classified elements that can be cited */
  /*
  constructor(catalogueClass,classifiedClass,citationClass)
  {
  this.catalogueClass=catalogueClass;
  this.classifiedClass=classifiedClass;
  this.citationClass=citationClass;
}
*/
}

/** A HITO feature catalogue */
export async function featureCatalogue()
{
  /*return new Catalogue(
  await getClass("http://hitontology.eu/ontology/FeatureCatalogue"),
  await getClass("http://hitontology.eu/ontology/FeatureClassified"),
  await getClass("http://hitontology.eu/ontology/FeatureCitation"));*/

}

/**@returns Array<Resource> the catalogue resources of the class with the given URI. */
export async function getCatalogues(classUri)// catalogueClass,catalogueRelation
{
  const catalogueClass = await getClass(classUri);
  const catalogues = [...(await catalogueClass.getMembers()).values()];
  return catalogues;
}

/** All HITO feature catalogues. */
export async function featureCatalogues() {return await getCatalogues("http://hitontology.eu/ontology/FeatureCatalogue");}
/** All HITO enterprise function catalogues. */
export async function functionCatalogues() {return await getCatalogues("http://hitontology.eu/ontology/EnterpriseFunctionCatalogue");}
/** All HITO . */
export async function applicationSystemCatalogues() {return await getCatalogues("http://hitontology.eu/ontology/ApplicationSystemCatalogue");}
