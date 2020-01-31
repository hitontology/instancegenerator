/** @module */
import * as sparql from "./sparql.js";

const product = "<http://hitontology.eu/ontology/MyProduct>";

const propertyQuery = clazz =>
  `SELECT ?p STR(SAMPLE(?l)) as ?l ?range ?type
{
  ?p rdfs:domain ${clazz};
  rdfs:range ?range;
  a ?type.
  OPTIONAL {?p rdfs:label ?l.}
}`;

const instanceQuery = clazz =>
  `SELECT ?p ?i STR(SAMPLE(?l)) as ?l
{
  ?p rdfs:domain ${clazz};
  rdfs:range ?range.
  ?i a ?range.
  OPTIONAL {?i rdfs:label ?l.}
}`;

export default class Form
{
  /** Create the form but don't populate it yet.*/
  constructor(clazz)
  {
    this.clazz = clazz;
    this.labelForResource = new Map();
    this.properties = [];
    this.init().then({});
  }

  /** load the data from the SPARQL endpoint and populate */
  async init()
  {
    const form = document.getElementById("form");
    const container = document.createElement("div");
    container.classList.add("select-container");
    form.appendChild(container);
    const pBinds = await sparql.select(propertyQuery(this.clazz));
    const iBinds = await sparql.select(instanceQuery(this.clazz));
    iBinds.forEach(b=>{this.labelForResource.set(b.i.value,b.l.value);});
    const allProperties = [...new Set(iBinds.map(b=>b.p.value))];
    let instancesForProperty = new Map(allProperties.map(p=>[p,new Set(iBinds.filter(b=>b.p.value===p).map(b=>b.i.value))]));

    const dbpediaPropertyInstanceEntries = await Promise.all(pBinds
      .filter(b=>b.range.value.includes("dbpedia.org"))
      .map(async b => [b.p.value, await this.dbpediaInstances(b.range.value)]));

    instancesForProperty = new Map([...instancesForProperty,...dbpediaPropertyInstanceEntries]);

    for(const b of pBinds)
    {
      const p = b.p.value;
      this.labelForResource.set(p,b.l.value);
      if(!instancesForProperty.has(p)) {continue;}
      this.properties.push(p);

      const par =  document.createElement("p");
      container.appendChild(par);
      const label = document.createElement("label");
      label.for= p;
      label.innerText = b.l.value;
      par.appendChild(label);
      const select = document.createElement("select");
      par.appendChild(select);
      select.style.display="block";
      select.name = p;
      select.id = p;
      select.setAttribute("multiple","");
      for(const i of instancesForProperty.get(p))
      {
        const option = document.createElement("option");
        select.appendChild(option);
        option.value = i;
        option.innerText = this.getLabel(i);
      }
    }
    this.selected = select => [...select.options].filter(o => o.selected).map(o => o.value);
  }

  /** Get URI and label for the first 100 instances of the class.*/
  async dbpediaInstances()
  {
    const query =
      `SELECT ?i STR(SAMPLE(?l)) as ?l
      {
        ?i a <${this.clazz}>.
        OPTIONAL {?i rdfs:label ?l. FILTER(LANGMATCHES(LANG(?l),"en"))}
      } limit 100`;
    const binds = await sparql.select(query,sparql.DBPEDIA_GRAPH,sparql.DBPEDIA_ENDPOINT);
    binds.filter(b=>b.l).forEach(b=>{this.labelForResource.set(b.i.value,b.l.value);});
    return new Set(binds.map(b=>b.i.value));
  }

  /** Fetch or generate the label for a resource. */
  getLabel(uri)
  {
    if(!this.labelForResource.has(uri))
    {
      this.labelForResource.set(uri,uri.replace(/.*\//,""));
    }
    return this.labelForResource.get(uri);
  }

  /** Generate RDF from form*/
  submit(e)
  {
    e.preventDefault();
    let rdf = "";
    for(const p of this.properties)
    {
      //console.log(p,selected(document.getElementById(p)));
      for(const s of this.selected(document.getElementById(p)))
      {
        rdf+=product + ` <${p}> <${s}>.\n`;
      }
    }
    alert(rdf);
  }
}
