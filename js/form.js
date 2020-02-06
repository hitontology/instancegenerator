/** @module */
import * as sparql from "./sparql.js";
import * as rdf from "./rdf.js";

const product = "<http://hitontology.eu/ontology/MyProduct>";
const DPROP = rdf.long("owl:DatatypeProperty");
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

class Property
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

export default class Form
{
  /** Create the form but don't populate it yet.*/
  constructor(clazz)
  {
    this.clazz = clazz;
    this.labelForResource = new Map();

    this.container = document.createElement("div");
    document.body.appendChild(this.container);
    const h1 = document.createElement("h1");
    h1.innerText = "Add "+rdf.short(clazz);
    this.form = document.createElement("form");
    //this.form.id=id;
    const submitButton = document.createElement("input");
    submitButton.type="submit";
    submitButton.value="Create";
    this.container.append(h1,submitButton,this.form);
    this.init().then({});
    this.submit=this.submit.bind(this);
    submitButton.addEventListener("click",this.submit);
  }

  /** load the data from the SPARQL endpoint and populate */
  async init()
  {
    const classContainer = document.createElement("div");
    classContainer.classList.add("select-container"); // flexbox
    this.form.appendChild(classContainer);

    this.properties = await Property.domainProperties(this.clazz);

    for(const p of this.properties)
    {
      const par =  document.createElement("p");
      classContainer.appendChild(par);
      const label = document.createElement("label");
      label.for= p.uri;
      label.innerText = p.label;
      par.appendChild(label);
      if(p.type===DPROP)
      {
        const text = document.createElement("input");
        par.appendChild(text);
        text.setAttribute("type",text);
        text.classList.add("textline");
        p.text = () => text.value;
      }
      else
      {
        const select = document.createElement("select");
        par.appendChild(select);
        select.style.display="block";
        select.classList.add("large");
        select.name = p.uri;
        select.id = p.uri;
        select.setAttribute("multiple","");
        if(!p.instances) {continue;}
        for(const i of p.instances)
        {
          const option = document.createElement("option");
          select.appendChild(option);
          option.value = i.uri;
          option.innerText = i.label;
        //option.innerText = this.getLabel(i);
        }
        p.selected = () => [...select.options].filter(o => o.selected).map(o => o.value);
      }
    }
  }

  /** Remove the form from the DOM. */
  unregister()
  {
    document.body.removeChild(this.container);
  }

  /** Generate RDF from form*/
  submit(e)
  {
    e.preventDefault();
    let text = "";
    for(const p of this.properties)
    {
      if(!p.selected)
      {
        if(!p.text()) {continue;}
        text+=product + ` <${p.uri}> "${p.text()}".\n`;
        continue;
      }
      for(const s of p.selected())
      {
        text+=product + ` <${p.uri}> <${s}>.\n`;
      }
    }
    alert(text);
  }
}
