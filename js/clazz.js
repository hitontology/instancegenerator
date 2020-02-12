/** An OWL class. */
import Instance from "./instance.js";
import InstanceIndex from "./instanceIndex.js";
import * as sparql from "./sparql.js";
import * as rdf from "./rdf.js";

const classes = new Map();

class Clazz
{
  /** */
  constructor(uri,label) {this.uri = uri;this.label=label;}

  /** Searches amongst the instances, see InstanceIndex#search() */
  search(query) {return this.instanceIndex.search(query);}

  /** Gets all instances array containing all instances of the given class */
  async loadInstances()
  {
    if(this.instances) {return;}
    let [graph,endpoint] = [undefined,undefined]; // default values
    if(this.uri.includes("dbpedia.org/"))
    {
      [graph,endpoint] = [sparql.DBPEDIA_GRAPH,sparql.DBPEDIA_ENDPOINT];
    }
    const query  = `SELECT ?uri
    GROUP_CONCAT(DISTINCT(CONCAT(?l,"@",lang(?l)));SEPARATOR="|") AS ?l
    GROUP_CONCAT(DISTINCT(CONCAT(?al,"@",lang(?al)));SEPARATOR="|") AS ?al
    GROUP_CONCAT(DISTINCT(CONCAT(?cmt,"@",lang(?cmt)));SEPARATOR="|") AS ?cmt
    {
      ?uri a <${this.uri}>.
      OPTIONAL {?uri rdfs:label ?l.}
      OPTIONAL {?uri skos:altLabel ?al.}
      OPTIONAL {?uri skos:altLabel ?cmt.}
    }`;// ORDER BY ASC(?uri)`;
    const bindings = sparql.flat(await sparql.select(query,graph,endpoint,`select all instances of class ${this.uri}`));
    this.instances = [];
    const unpack = s => (s && (s!=="@") && s.split('|')) || []; // "@" occurs on 0 results
    bindings.forEach(b=>
    {
      this.instances.push(
        new Instance(b.uri,unpack(b.l),unpack(b.al),unpack(b.cmt)));
    });

    this.instanceIndex = new InstanceIndex(this.instances);
  }
}

let labels = null;

/** Fetches all class labels*/
async function getLabel(uri)
{
  if(labels===null)
  {
    labels = new Map();
    const labelQuery  = `SELECT ?clazz SAMPLE(?label) as ?label
  {
    ?clazz a owl:Class;
       rdfs:label ?label.
    FILTER(LANGMATCHES(LANG(?label),"en"))
  }`;
    const bindings = sparql.flat(
      [...await sparql.select(labelQuery,sparql.HITO_GRAPH,sparql.HITO_ENDPOINT,`select all labels of classes from HITO`),
        ...await sparql.select(labelQuery,sparql.DBPEDIA_GRAPH,sparql.DBPEDIA_ENDPOINT,`select all labels of classes from DBpedia`)]);
    bindings.forEach((b) => {labels.set(b.clazz,b.label);});
  }
  return labels.get(uri) || rdf.niceSuffix(uri);
}

/** Get the class that has the given URI with all its instances. Only one class is generated for any one URI.
    Asynchronous multiton pattern, see https://stackoverflow.com/questions/60152736/asynchronous-multiton-pattern-in-javascript.*/
export default async function getClass(uri)
{
  let clazz = classes.get(uri);
  if(clazz)
  {
    // already called with the same URI, not necessarily finished but we never want to run it twice
    // return value is a promise but because the method is async it should be used with await and then it will get unpacked
    return clazz;
  }

  clazz = new Clazz(uri,await getLabel(uri));
  const promise = clazz.loadInstances().then(() => {return clazz;});
  classes.set(uri,promise);
  return promise;
}
