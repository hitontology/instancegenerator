/** @module
An RDF resource.*/
import * as rdf from "./rdf.js";
import * as sparql from "./sparql.js";

const memberRestrictions =
new Map([
  ["http://dbpedia.org/ontology/Language","?uri <http://dbpedia.org/ontology/iso6391Code> []."],
  ["http://dbpedia.org/class/yago/License106549661","[] dbo:license ?uri."],
]);

export class Resource
{
  /** Labels, altLabels and comments are arrays of strings that can be empty.  */
  constructor(uri,labels,altLabels,comments)
  {
    this.uri = uri;
    this.suffix = rdf.niceSuffix(uri);
    this.labels = labels;
    this.altLabels = altLabels;
    this.comments = comments;
  }

  /** Singular human readable representation chosen among multiple candidates.*/
  label()
  {
    /** returns string and language tag of a label*/
    const labelParts = (l)=> l.split("@");

    let label;
    const candidates = [...this.labels,...this.altLabels];

    for(const lang of ["en","de",""])
    {
      for(const c of candidates)
      {
        if(labelParts(c)[1]===lang)
        {
          label = labelParts(c)[0];
          return label;
        }
      }
    }
    return this.suffix;
  }

  /** Gets an array containing all members of the given resource using the given membership relation
  * @param memberRelation membership relation */
  async loadMembers(memberRelation)
  {
    if(this.members) {return;} // only done once
    this.members = [];

    let sources = [];
    if(this.uri.includes("dbpedia.org/")) {sources = [sparql.DBPEDIA];}
    else if(this.uri.includes("hitontology.eu/"))  {sources = [sparql.HITO];}
    else {sources = [sparql.HITO,sparql.DBPEDIA];}
    let pattern= `?uri ${memberRelation} <${this.uri}>.`;
    const restriction = memberRestrictions.get(this.uri);
    if(restriction) {pattern+="\n"+restriction;}

    const query  = `SELECT ?uri
    GROUP_CONCAT(DISTINCT(CONCAT(?l,"@",lang(?l)));SEPARATOR="|") AS ?l
    GROUP_CONCAT(DISTINCT(CONCAT(?al,"@",lang(?al)));SEPARATOR="|") AS ?al
    GROUP_CONCAT(DISTINCT(CONCAT(?cmt,"@",lang(?cmt)));SEPARATOR="|") AS ?cmt
    {
      ${pattern}
      OPTIONAL {?uri rdfs:label ?l.}
      OPTIONAL {?uri skos:altLabel ?al.}
      OPTIONAL {?uri skos:altLabel ?cmt.}
    }`;
    const bindings = [];
    for(const source of sources)
    {
      bindings.push(...sparql.flat(await sparql.select(query,source,`select all members of ${this.uri} from `+source.name)));
    }
    this.members = [];
    const unpack = s => (s && (s!=="@") && s.split('|')) || []; // "@" occurs on 0 results
    bindings.forEach(b=>
    {
      {
        this.members.push(
          new Resource(b.uri,unpack(b.l),unpack(b.al),unpack(b.cmt)));
      }
    });
    //this.instanceIndex = new ResourceIndex(this.members);
  }
}

/** Query the resource that has the given URI with all its members.
@param relation optional type relation*/
async function queryResource(uri,memberRelation)
{
  if(!owlClassInstances)
  {
    // initial fetching of all classes
    const c = new Clazz(new Resource(rdf.long("owl:Class"),[],[],[]),relation);
    owlClassInstances = c.loadInstances().then(()=>
    {
      const m = new Map();
      [...c.instances,...customClassInstances].forEach(i=>{m.set(i.uri,i);});
      return m;
    },
    );
  }
  const instance = (await owlClassInstances).get(uri);
  if(!instance)
  {
    console.error("Class does not exist: "+uri);
  }
  const resource = new Resource(instance,member);
  await resource.loadMembers();
  return resource;
}

/** Get the resource that has the given URI with all its members. Only one resource is generated for any one URI.
  Asynchronous multiton pattern, see https://stackoverflow.com/questions/60152736/asynchronous-multiton-pattern-in-javascript.
  */
export default async function getResource(uri,memberRelation)
{
  let clazz = classes.get(uri);
  if(!clazz)
  {
    // already called with the same URI, not necessarily finished but we never want to run it twice
    // return value is a promise but because the method is async it should be used with await and then it will get unpacked
    clazz = queryClass(uri,relation);
    classes.set(uri,clazz);
  }
  return clazz;
}
