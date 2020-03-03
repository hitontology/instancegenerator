/** An OWL class. */
import * as rdf from "./rdf.js";
import {Resource} from "./resource.js";

/** @type {Promise<Class>}  */
const owlClass = new Resource("http://www.w3.org/2002/07/owl#Class",["http://www.w3.org/2002/07/owl#Class"],["class"],[],[]);

/** define any other classes here
 include yago classes manually as there are too many of them in DBpedia to fetch them all and they don't have type owl:Class */
const customClassData =
  [
    ["yago:WikicatProgrammingLanguages","Programming Language"],
    ["yago:License106549661","License"],
    ["yago:OperatingSystem106568134","Operating System"],
    ["rdfs:Resource","URL"]]
    .map(([uri,label]) => new Resource(rdf.long(uri),[rdf.long("owl:Class")],[label+"@en"],[],[]))
    .map(r=>[r.uri,r]);
const customClasses = new Map(customClassData);

/** Get the class with the given URI. */
export default async function getClass(uri)
{
  let clazz = (await owlClass.getMembers()).get(uri);
  if(!clazz) {clazz = customClasses.get(uri);} // fallback
  if(!clazz) {throw new Error("No class found with URI "+uri);}
  return clazz;
}
