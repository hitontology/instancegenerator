/** @module */
import * as sparql from "./sparql.js";
import * as rdf from "./rdf.js";

const product = "<http://hitontology.eu/ontology/MyProduct>";

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
    OPTIONAL {?uri rdfs:label ?label.}
  }`;
  return sparql.flat(await sparql.select(query,graph,endpoint));
}

class Property
{
  /** */
  constructor(uri,label,range,instances)
  {
    this.uri = uri;
    this.label = label;
    if(!label) {label = "No label for "+uri;}
    this.range = range;
    this.instances=instances;
  }

  /** returns an array of all properties that have the given domain*/
  static async domainProperties(domain)
  {
    const query=
    `SELECT ?uri STR(SAMPLE(?label)) as ?label ?range
    {
      ?uri rdfs:domain <${domain}>;
      rdfs:range ?range.
      OPTIONAL {?uri rdfs:label ?label.}
    }`;
    const bindings = sparql.flat(await sparql.select(query));
    const properties = [];
    // parallelize
    for(const b of bindings) {b.promise = queryInstances(b.range);}
    for(const b of bindings)
    {
      properties.push(new Property(b.uri,b.label,b.range,await b.promise));
      b.promise=undefined;
    }
    return properties;
  }
}

export default class Form
{
  /** Create the form but don't populate it yet.*/
  constructor(clazz)
  {
    this.clazz = clazz;
    this.labelForResource = new Map();

    const div = document.createElement("div");
    document.body.appendChild(div);
    const h1 = document.createElement("h1");
    h1.innerText = "Add "+rdf.short(clazz);
    this.form = document.createElement("form");
    //this.form.id=id;
    const submitButton = document.createElement("input");
    submitButton.type="submit";
    submitButton.value="Create";
    div.append(h1,submitButton,this.form);
    this.init().then({});
    this.submit=this.submit.bind(this);
    submitButton.addEventListener("click",this.submit);
  }

  /** load the data from the SPARQL endpoint and populate */
  async init()
  {
    const container = document.createElement("div");
    container.classList.add("select-container"); // flexbox
    this.form.appendChild(container);

    this.properties = await Property.domainProperties(this.clazz);

    for(const p of this.properties)
    {
      const par =  document.createElement("p");
      container.appendChild(par);
      const label = document.createElement("label");
      label.for= p.uri;
      label.innerText = p.label;
      par.appendChild(label);
      const select = document.createElement("select");
      par.appendChild(select);
      select.style.display="block";
      select.name = p.uri;
      select.id = p.uri;
      select.setAttribute("multiple","");

      for(const i of p.instances)
      {
        const option = document.createElement("option");
        select.appendChild(option);
        option.value = i.uri;
        option.innerText = i.label;
        //option.innerText = this.getLabel(i);
      }
    }
    this.selected = select => [...select.options].filter(o => o.selected).map(o => o.value);
  }

  /** Generate RDF from form*/
  submit(e)
  {
    e.preventDefault();
    let text = "";
    for(const p of this.properties)
    {
      for(const s of this.selected(document.getElementById(p.uri)))
      {
        text+=product + ` <${p.uri}> <${s}>.\n`;
      }
    }
    alert(rdf);
  }
}
