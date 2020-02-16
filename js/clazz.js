/** An OWL class. */
import * as rdf from "./rdf.js";
import {Resource} from "./resource.js";

/*
export class Clazz extends Resource
{
  constructor(uri,labels,altLabels,comments)
  {
    super(uri,labels,altLabels,comments,"a");
  }
}
*/

/** @type {Promise<Class>}  */
const owlClass = new Resource("http://www.w3.org/2002/07/owl#Class","http://www.w3.org/2002/07/owl#Class",["class"],[],[]);

// define any other classes here
// include yago classes manually as there are too many of them in DBpedia to fetch them all and they don't have type owl:Class

const customClasses = [["yago:ProgrammingLanguage106898352","Programming Language"],
  ["yago:License106549661","License"],
  ["yago:OperatingSystem106568134","Operating System"],
  ["rdfs:Resource","URL"]]
  .map(([uri,label]) => new Resource(rdf.long(uri),[label+"@en"],[],[]));
