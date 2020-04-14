/** @module
An RDF resource.*/
import * as rdf from "./rdf.js";
import * as sparql from "./sparql.js";

/** Data quality fixes for low precision, i.e. the given resources contain too many incorrect members.
In those cases, members that are presented to the user for selection can be filtered using triple patterns.*/
const memberRestrictions =
new Map([
  ["http://dbpedia.org/ontology/Language","?uri <http://dbpedia.org/ontology/iso6391Code> []."],
  ["http://dbpedia.org/class/yago/License106549661","[] <http://dbpedia.org/ontology/license> ?uri."],
]);

/** To prevent code duplication, the Resource class queries "members" of both classes and catalogues using the same methods.
The memberRelations constant specifies, which property to use.*/
const memberRelations =
new Map([
  ["owl:Class","rdf:type"],
  ["hito:FeatureCatalogue","hito:featureCatalogue"],
  ["hito:FeatureClassified","hito:featureClassified"],
  ["hito:EnterpriseFunctionCatalogue","hito:functionCatalogue"],
  ["hito:ApplicationSystemCatalogue","hito:applicationSystemCatalogue"],
  ["hito:OrganizationalUnitCatalogue","hito:organizationalUnitCatalogue"],
  ["hito:UserGroupCatalogue","hito:userGroupCatalogue"],
  //["hito:FeatureCitation","hito:featureC"],
].map(([x,y])=>[rdf.long(x),rdf.long(y)]));

//const resources = new Map();

/** Guess the SPARQL sources of a URI */
function guessSources(uri)
{
  let sources = [];
  if(uri.includes("dbpedia.org/")) {sources = [sparql.DBPEDIA];}
  else if(uri.includes("hitontology.eu/")||uri.includes("http://www.ebi.ac.uk/swo/"))  {sources = [sparql.HITO];}
  else {sources = [sparql.HITO,sparql.DBPEDIA];}
  return sources;
}

export class Resource
{
  /** Labels, altLabels and comments are arrays of strings that can be empty.
  * @param {Array<String>} types the rdf:types of the resource*/
  constructor(uri,types,labels,altLabels,comments)
  {
    this.uri = uri;
    this.types = types;
    this.memberRelation = memberRelations.get(types[0]);
    this.suffix = rdf.suffix(uri);
    this.niceSuffix = rdf.niceSuffix(uri);
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
    return this.niceSuffix;
  }

  /** Lexical form of the first comment, or null if there is none.*/
  comment()
  {
    if(this.comments.length===0) {return null;}
    return this.comments[0].split("@")[0];
  }

  /** Queries the SPARQL endpoint for a map of URIs to resources for all members of the given resource
  * Use the cached versions getMember() and getMembers() instead.
  * @return {Promise<Map<string,Resource>>} the members of the resource */
  async queryMembers()
  {
    const members = new Map();
    if(this.uri==="http://www.w3.org/2000/01/rdf-schema#Resource") {return members;} // workaround, rdfs:Resource instances should be user defined

    let pattern= `?uri <${this.memberRelation}> <${this.uri}>.`;
    // workaround to support subclasses from The Software Ontology
    if(this.uri==="http://www.ebi.ac.uk/swo/SWO_0000002")
    {
      pattern = `?uri rdfs:subClassOf+ <${this.uri}>.`;
    }
    const restriction = memberRestrictions.get(this.uri);
    if(restriction) {pattern+="\n"+restriction;}

    const typePattern = this.memberRelation===rdf.long("rdf:type")?
      "":"?uri a ?type.";

    const languages = ["en","de",""];
    //LANGMATCHES(LANG(${y})
    const languageFilter = (v) => `FILTER(${
      languages.map(l=>`LANGMATCHES(LANG(?${v}),"${l}")`)
        .reduce((a,b)=>a+" || "+b)
    })`;

    const query  = `SELECT ?uri
    ${(this.memberRelation===rdf.long("rdf:type"))?"":"GROUP_CONCAT(DISTINCT(?type);SEPARATOR="|") AS ?types"}
    GROUP_CONCAT(DISTINCT(CONCAT(?l,"@",lang(?l)));SEPARATOR="|") AS ?l
    GROUP_CONCAT(DISTINCT(CONCAT(?al,"@",lang(?al)));SEPARATOR="|") AS ?al
    GROUP_CONCAT(DISTINCT(CONCAT(?cmt,"@",lang(?cmt)));SEPARATOR="|") AS ?cmt
    {
      ${typePattern}
      ${pattern}
      OPTIONAL {?uri rdfs:label ?l. ${languageFilter("l")}}
      OPTIONAL {?uri skos:altLabel ?al. ${languageFilter("al")}}
      OPTIONAL {?uri rdfs:comment ?cmt. ${languageFilter("cmt")}}
    }`;

    const bindings = [];
    for(const source of guessSources(this.uri))
    {
      bindings.push(...sparql.flat(await sparql.select(query,source,`select all members of ${this.uri} from `+source.name)));
    }

    const unpack = s => (s && (s!=="@") && s.split('|')) || []; // "@" occurs on 0 results
    bindings.forEach(b=>
    {
      {
        const types =  this.memberRelation===rdf.long("rdf:type")?
          [this.uri]:unpack(b.types);
        members.set(b.uri,
          new Resource(b.uri,types,unpack(b.l),unpack(b.al),unpack(b.cmt)));
      }
    });
    //this.instanceIndex = new ResourceIndex(this.members);
    return members;
  }

  /** Cached.
      * @returns the a map of uris to members*/
  async getMembers()
  {
    if(!this.members) {this.members=this.queryMembers();} // promise, prevent conflicts
    return (await this.members);
  }
}

/** Query the resource that has the given URI with all its members.
    @param relation optional type relation*/
/*
    async function queryResource(uri)
    {
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
}
*/

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
/*
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
*/
