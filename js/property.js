/** @module
An RDF property.*/
import * as rdf from "./rdf.js";
import * as sparql from "./sparql.js";

const OPROP = rdf.long("owl:ObjectProperty");

/** returns an array of instances of the given class */
async function queryInstances(clazz)
{
  let [graph,endpoint] = [sparql.HITO_GRAPH,sparql.HITO_ENDPOINT];
  if(clazz.includes("dbpedia.org/"))
  {
    [graph,endpoint] = [sparql.DBPEDIA_GRAPH,sparql.DBPEDIA_ENDPOINT];
  }
  const query  = `SELECT ?uri STR(SAMPLE(?label)) as ?label
  {
    ?uri a <${clazz}>.
    OPTIONAL {?uri rdfs:label ?label. filter(langmatches(lang(?label),"en"))}
  } ORDER BY ASC(?uri)`;
  return sparql.flat(await sparql.select(query,graph,endpoint));
}

export default class Property
{
  /** */
  constructor(uri,label,type,range,instances)
  {
    this.uri = uri;
    this.label = label;
    this.type = type;
    if(!label) {console.log(range);this.label = rdf.short(uri);}
    this.range = range;
    this.instances=instances;
  }

  /** returns an array of all properties that have the given domain*/
  static async domainProperties(domain)
  {
    const query=
    `SELECT ?uri STR(SAMPLE(?label)) as ?label ?type ?range
    {
      ?uri rdfs:domain <${domain}>;
      rdfs:range ?range;
      rdf:type ?type.
      FILTER(?type=owl:DatatypeProperty OR ?type=owl:ObjectProperty)
      OPTIONAL {?uri rdfs:label ?label.}
    }`;
    const bindings = sparql.flat(await sparql.select(query));
    const properties = [];
    // parallelize
    for(const b of bindings)
    {
      if(b.type!==OPROP) {continue;}
      {b.promise = queryInstances(b.range);}
    }
    for(const b of bindings)
    {
      properties.push(new Property(b.uri,b.label,b.type,b.range,await b.promise));
      b.promise=undefined;
    }
    return properties;
  }
}
