/** @module
An RDF property.*/
import * as rdf from "./rdf.js";
import * as sparql from "./sparql.js";
import getClass from '../js/clazz.js';

export const OPROP = rdf.long("owl:ObjectProperty");
export const DPROP = rdf.long("owl:DatatypeProperty");

const DEFAULT_PROPERTIES = [];

export class Property
{
  /** */
  constructor(uri,label,type)
  {
    this.uri = uri;
    this.label = label;
    if(!label) {this.label = rdf.short(uri);}
    this.type = type;
    if(type!==OPROP&&type!==DPROP) {console.warn(`Unknown type ${type} for property ${uri} with label ${label}.`);}
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
    const bindings = sparql.flat(await sparql.select(query,undefined,undefined,"select all properties that have the domain "+rdf.short(domain)));
    const properties = [];
    properties.push(...DEFAULT_PROPERTIES);
    // parallelize
    /*
    for(const b of bindings)
    {
      if(b.type!==OPROP) {continue;}
      {b.promise = queryInstances(b.range);}
    }
    */
    for(const b of bindings)
    {
      const p = new Property(b.uri,b.label,b.type,b.range);
      p.range = await getClass(b.range);
      properties.push(p);
    }
    return properties;
  }
}

export const RDFS_LABEL = new Property(rdf.long("rdfs:label"),"label",DPROP);
export const RDFS_COMMENT = new Property(rdf.long("rdfs:comment"),"comment",DPROP);
DEFAULT_PROPERTIES.push(RDFS_LABEL,RDFS_COMMENT);
