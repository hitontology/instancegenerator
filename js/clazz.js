/** An OWL class. */
import Resource from "./resource.js";
//import ResourceIndex from "./resourceIndex.js";
import * as sparql from "./sparql.js";
import * as rdf from "./rdf.js";

const classes = new Map();

class Clazz extends Resource
{
  /** @param resource Treats the resource as a class
   * @param relation optional type relation. needs to be enquoted in <> not prefixed or "a".*/
  constructor(uri,labels,altLabels,comments)
  {
    super(uri,labels,altLabels,comments);
  }

  async loadMembers() {return super.loadMembers("a");}
}

/** @type {Promise<Class>}  */
const owlClassInstances = null;

// define any other classes here
// include yago classes manually as there are too many of them in DBpedia to fetch them all and they don't have type owl:Class

const customClassData = [["yago:ProgrammingLanguage106898352","Programming Language"],
  ["yago:License106549661","License"],
  ["yago:OperatingSystem106568134","Operating System"],
  ["rdfs:Resource","URL"]];
const customClassInstances = customClassData.map(([uri,label]) => new Resource(rdf.long(uri),[label+"@en"],[],[]));
