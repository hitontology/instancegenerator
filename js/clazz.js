/** An OWL class. */
import Instance from "./instance.js";
import * as sparql from "./sparql.js";

const classes = new Map();

export default class Clazz
{
  /** Do not use the constructor but the static async get function instead (asynchronous multiton pattern). */
  constructor(uri)
  {
    this.uri = uri;
  }

  /** Get the class that has the given URI with all its instances. Only one class is generated for any one URI.*/
  static async get(uri)
  {
    let clazz = classes.get(uri);
    if(clazz) {return clazz;}
    clazz = new Clazz(uri);
    const p = clazz.loadInstances().then(() => {return clazz;});
    classes.set(uri,p);
    return p;
  }

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
    group_concat(distinct(str(?l));separator="|") as ?l
    group_concat(distinct(str(?al));separator="|") as ?al
    group_concat(distinct(str(?cmt));separator="|") as ?cmt
    {
      ?uri a <${this.uri}>.
      OPTIONAL {?uri rdfs:label ?l.}
      OPTIONAL {?uri skos:altLabel ?al.}
      OPTIONAL {?uri skos:altLabel ?cmt.}
    }`;// ORDER BY ASC(?uri)`;
    const bindings = sparql.flat(await sparql.select(query,graph,endpoint));
    this.instances = [];
    const unpack = s => (s && s.split('|')) || [];
    bindings.forEach(b=>
    {
      this.instances.push(
        new Instance(b.uri,unpack(b.l),unpack(b.al),unpack(b.cmt)));
    });
  }
}
