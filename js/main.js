/** @module */
import * as sparql from "./sparql.js";

const propertyQuery =
`SELECT ?p STR(SAMPLE(?l)) as ?l ?range ?type
{
 ?p rdfs:domain hito:SoftwareProduct;
    rdfs:range ?range;
    a ?type.
 OPTIONAL {?p rdfs:label ?l.}
}`;

const instanceQuery =
`SELECT ?p ?i STR(SAMPLE(?l)) as ?l
{
  ?p rdfs:domain hito:SoftwareProduct;
    rdfs:range ?range.
  ?i a ?range.
  OPTIONAL {?i rdfs:label ?l.}
}`;

const product = "<http://hitontology.eu/ontology/MyProduct>";
const labelForResource = new Map();
const properties = [];

async function dbpediaInstances(clazz)
{
  const query =
  `SELECT ?i STR(SAMPLE(?l)) as ?l
  {
    ?i a <${clazz}>.
    OPTIONAL {?i rdfs:label ?l. FILTER(LANGMATCHES(LANG(?l),"en"))}
  } limit 100`;
  const binds = await sparql.select(query,sparql.DBPEDIA_GRAPH,sparql.DBPEDIA_ENDPOINT);
  binds.filter(b=>b.l).forEach(b=>{labelForResource.set(b.i.value,b.l.value);});
  return new Set(binds.map(b=>b.i.value));
}

/** Fetch or generate the label for a resource. */
function getLabel(uri)
{
  if(!labelForResource.has(uri))
  {
    labelForResource.set(uri,uri.replace(/.*\//,""));
  }
  return labelForResource.get(uri);
}

/** entry point */
async function main()
{
  const form = document.getElementById("form");
  //form.innerHTML+="Hello World";

  const pBinds = await sparql.select(propertyQuery);
  const iBinds = await sparql.select(instanceQuery);
  iBinds.forEach(b=>{labelForResource.set(b.i.value,b.l.value);});
  const allProperties = [...new Set(iBinds.map(b=>b.p.value))];
  let instancesForProperty = new Map(allProperties.map(p=>[p,new Set(iBinds.filter(b=>b.p.value===p).map(b=>b.i.value))]));

  const dbpediaPropertyInstanceEntries = await Promise.all(pBinds
    .filter(b=>b.range.value.includes("dbpedia.org"))
    .map(async b => [b.p.value, await dbpediaInstances(b.range.value)]));

  instancesForProperty = new Map([...instancesForProperty,...dbpediaPropertyInstanceEntries]);



  for(const b of pBinds)
  {
    const p = b.p.value;
    labelForResource.set(p,b.l.value);
    if(!instancesForProperty.has(p)) {continue;}
    properties.push(p);

    const par =  document.createElement("p");
    form.appendChild(par);
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
      option.innerText = getLabel(i);
    }
  }
}

const selected = select => [...select.options].filter(o => o.selected).map(o => o.value);

/** Generate RDF from form*/
function submit(e)
{
  e.preventDefault();
  let rdf = "";
  for(const p of properties)
  {
    //console.log(p,selected(document.getElementById(p)));
    for(const s of selected(document.getElementById(p)))
    {
      rdf+=product + ` <${p}> <${s}>.\n`;
    }
  }
  alert(rdf);
}

document.addEventListener("DOMContentLoaded",main);
document.addEventListener("submit",submit);
