/**
Fuzzy search index with fuse.js.
@module */
import * as sparql from "./sparql.js";

const options =
{
  shouldSort: true,
  tokenize: true,
  threshold: 0.25,
  maxPatternLength: 40,
  minMatchCharLength: 3,
  matchAllTokens: true,
  location: 0,
  distance: 100,
  id: "uri",
  keys:
  [
    {name:"l", weight: 0.7}, // label
    {name:"al", weight: 0.6}, // alternative label
    {name:"cmt", weight: 0.4}, // alternative label
  ],
};

/** Fulltext index of all instances of a class from a SPARQL endpoint. */
export default class Search
{
  /** Needs to be initialized with init().*/
  constructor(clazz,graphs,endpoint)
  {
    this.clazz = clazz;
    this.graphs = graphs;
    this.endpoint = endpoint;
  }

  /** Fills the index with the instances from the SPARQL endpoint. Gets called automatically on first search.*/
  async init()
  {
    console.log("Create Fuse Search Index");
    const froms = this.graphs.map(graph=>`from <${graph}>`).reduce((a,b)=>a+"\n"+b);
    const sparqlQuery = `select ?c as ?uri
    group_concat(distinct(str(?l));separator="|") as ?l
    group_concat(distinct(str(?al));separator="|") as ?al
    group_concat(distinct(str(?cmt));separator="|") as ?cmt
    ${froms}
    {
      ?c a <${this.clazz}>.
      OPTIONAL {?c rdfs:label ?l.}
      OPTIONAL {?c skos:altLabel ?al.}
      OPTIONAL {?c skos:altLabel ?cmt.}
    }`;
    const bindings = sparql.flat(await sparql.select(sparqlQuery,this.endpoint));
    const items = [];
    const unpack = s => (s && s.split('|')) || [];
    for(const b of bindings)
    {
      const item = {};
      items.push(item);
      const suffix = b.uri.replace(/.*\//,"");
      item.uri = b.uri;
      item.l = [...new Set([...unpack(b.l),suffix])]; // remove duplicates
      item.al = unpack(b.al);
      item.cmt = unpack(b.cmt);
    }
    this.index = new Fuse(items,options);
    return items; // for testing
  }

  /** Searches the Fuse index for classes with a similar label. Needs to be initialized before use.
    @param {string} userQuery
    @return {Promise<string[]>} the class URIs found.
    */
  search(userQuery)
  {
    const result = this.index.search(userQuery);
    return result;
  }
}
