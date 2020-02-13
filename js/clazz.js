/** An OWL class. */
import Resource from "./resource.js";
//import ResourceIndex from "./resourceIndex.js";
import * as sparql from "./sparql.js";
import * as rdf from "./rdf.js";

const classes = new Map();

class Clazz extends Resource
{
  /** */
  constructor(resource)
  {
    super(resource.uri,resource.labels,resource.altLabels,resource.comments);
  }

  /** Searches amongst the instances, see InstanceIndex#search() */
  search(query) {return this.instanceIndex.search(query);}

  /** Gets all instances array containing all instances of the given class */
  async loadInstances()
  {
    if(this.instances) {return;}
    let sources = [];
    //[graph,endpoint] = [undefined,undefined]; // default values
    if(this.uri.includes("dbpedia.org/")) {sources = [sparql.DBPEDIA];}
    else if(this.uri.includes("hitontology.eu/"))  {sources = [sparql.HITO];}
    else {sources = [sparql.HITO,sparql.DBPEDIA];}
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
    const bindings = [];
    for(const source of sources)
    {
      bindings.push(...sparql.flat(await sparql.select(query,source,`select all instances of class ${this.uri} from `+source.name)));
    }
    //console.log(bindings);
    this.instances = [];
    const unpack = s => (s && (s!=="@") && s.split('|')) || []; // "@" occurs on 0 results
    bindings.forEach(b=>
    {
      if(b.uri.includes("dbpedia")) {console.log("***************************************************************",b);}
      {
        this.instances.push(
          new Resource(b.uri,unpack(b.l),unpack(b.al),unpack(b.cmt)));
      }
    });
    //this.instanceIndex = new ResourceIndex(this.instances);
  }
}


/** @type {Promise<Class>}  */
let owlClassInstances = null;

/** Query the class that has the given URI with all its instances.*/
async function queryClass(uri)
{
  if(!owlClassInstances)
  {
    // initial fetching of all classes
    const c = new Clazz(new Resource(rdf.long("owl:Class"),[],[],[]));
    owlClassInstances = c.loadInstances().then(()=>
    {
      const m = new Map();
      c.instances.forEach(i=>{m.set(i.uri,i);});
      return m;
    },
    );
  }
  const instance = (await owlClassInstances).get(uri);
  if(!instance) {throw("Class does not exist: "+uri);}
  const clazz = new Clazz(instance);
  await clazz.loadInstances();
  return clazz;
}

/** Get the class that has the given URI with all its instances. Only one class is generated for any one URI.
  Asynchronous multiton pattern, see https://stackoverflow.com/questions/60152736/asynchronous-multiton-pattern-in-javascript.*/
export default async function getClass(uri)
{
  //console.log(uri);
  let clazz = classes.get(uri);
  //console.log("class",clazz);
  if(!clazz)
  {
    // already called with the same URI, not necessarily finished but we never want to run it twice
    // return value is a promise but because the method is async it should be used with await and then it will get unpacked
    clazz = queryClass(uri);
    classes.set(uri,clazz);
  }
  return clazz;
}
