/**
Fuzzy search with fuse.js.
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
    {name:"c", weight: 0.3}, // comment
  ],
};

/** Fulltext index of all instances of a class from a SPARQL endpoint. */
export class Index
{
  /** Needs to be initialized with init().*/
  constructor(clazz,graphs)
  {
    this.clazz = clazz;
    this.graphs = graphs;
  }

  /** Fills the index with the instances from the SPARQL endpoint. Gets called automatically on first search.*/
  async init()
  {
    console.log("Create Fuse Search Index");
    const froms = this.graphs.map(graph=>`from <${graph}>`).reduce((a,b)=>a+"\n"+b);
    const sparqlQuery = `select
    ?c as ?uri
    group_concat(distinct(str(?l));separator="|") as ?l
    group_concat(distinct(str(?cmt));separator="|") as ?cmt
    ${froms}
    {
      ?c a <${this.clazz}>.
      OPTIONAL {?c rdfs:label ?l.}
    }`;
    const bindings = sparql.flat(await sparql.select(sparqlQuery));
    const items = [];
    for(const b of bindings)
    {
      const item = {};
      items.push(item);
      const suffix = b.uri.replace(/.*\//,"");
      item.uri = b.uri;
      const labels = (b.l && b.l.split('|')) || [];
      item.l = [...labels,suffix];
      item.l = [...new Set(item.l)]; // remove duplicates
    }
    this.index = new Fuse(items,options);
    return items; // for testing
  }

  /** Searches the Fuse index for classes with a similar label.
    @param {string} userQuery
    @return {Promise<string[]>} the class URIs found.
    */
  async search(userQuery)
  {
    if(!this.index) {await this.init();}
    const result = this.index.search(userQuery);
    return result;
  }
}
