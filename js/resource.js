/** @module
An RDF resource.*/
import * as rdf from "./rdf.js";
import * as sparql from "./sparql.js";

const memberRestrictions =
new Map([
  ["http://dbpedia.org/ontology/Language","?uri <http://dbpedia.org/ontology/iso6391Code> []."],
  ["http://dbpedia.org/class/yago/License106549661","[] dbo:license ?uri."],
]);

const memberRelations =
new Map([
  ["owl:Class","rdf:type"],
  ["hito:FeatureCatalogue","hito:featureCatalogue"],
  ["hito:FeatureClassified","hito:featureClassified"],
  //["hito:FeatureCitation","hito:featureC"],
].map(([x,y])=>[rdf.long(x),rdf.long(y)]));

const resources = new Map();

/** Guess the SPARQL sources of a URI */
function guessSources(uri)
{
  let sources = [];
  if(this.uri.includes("dbpedia.org/")) {sources = [sparql.DBPEDIA];}
  else if(this.uri.includes("hitontology.eu/"))  {sources = [sparql.HITO];}
  else {sources = [sparql.HITO,sparql.DBPEDIA];}
  return sources;
}

export class Resource
{
  /** Labels, altLabels and comments are arrays of strings that can be empty.  */
  constructor(uri,type,labels,altLabels,comments)
  {
    this.uri = uri;
    this.type = type;
    this.memberRelation = memberRelations.get(type);
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

  /** Gets an array containing all members of the given resource */
  async queryMembers()
  {
    let pattern= `?uri ${this.memberRelation} <${this.uri}>.`;
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
    for(const source of guessSources(this.uri))
    {
      bindings.push(...sparql.flat(await sparql.select(query,source,`select all members of ${this.uri} from `+source.name)));
    }
    const members = [];
    const unpack = s => (s && (s!=="@") && s.split('|')) || []; // "@" occurs on 0 results
    bindings.forEach(b=>
    {
      {
        members.push(
          new Resource(b.uri,unpack(b.l),unpack(b.al),unpack(b.cmt)));
      }
    });
    //this.instanceIndex = new ResourceIndex(this.members);
    return members;
  }

  /** Cached member function. */
  async members()
  {
    if(!this.members) {this.members=this.queryMembers();} // promise
    return this.members;
  }
}

/** Query the resource that has the given URI with all its members.
    @param relation optional type relation*/
async function queryResource(uri)
{
  /*
  if(!owlClassInstances)
  {
    // initial fetching of all classes
    const c = (new Resource(rdf.long("owl:Class"),[],[],[]),relation);
    owlClassInstances = c.loadInstances().then(()=>
    {
      const m = new Map();
      [...c.instances,...customClassInstances].forEach(i=>{m.set(i.uri,i);});
      return m;
    },
    );
  }
  */
}

/*const instance = (await owlClassInstances).get(uri);
if(!instance)
{
console.error("Class does not exist: "+uri);
}
const resource = new Resource(instance);
await resource.loadMembers();
return resource;
}
*/

/** Get the resource that has the given URI with all its members. Only one resource is generated for any one URI.
Asynchronous multiton pattern, see https://stackoverflow.com/questions/60152736/asynchronous-multiton-pattern-in-javascript.
*/
async function getResource(uri)
{
  let resource = resources.get(uri);
  if(!resource)
  {
    // already called with the same URI, not necessarily finished but we never want to run it twice
    // return value is a promise but because the method is async it should be used with await and then it will get unpacked
    resource = queryResource(uri);
    resources.set(uri,resource);
  }
  return resource;
}

async function initCache()
{

}
