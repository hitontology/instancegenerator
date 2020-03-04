/** @module
Form to create a new instance of the given OWL Class. */
import * as rdf from "../rdf.js";
import * as sparql from "../sparql.js";
import {Property,DPROP,OPROP} from "../property.js";
import {selectPropertyRange} from "./select.js";
import CatalogueSelect from "./catalogueSelect.js";
import {functionCatalogues,featureCatalogues,applicationSystemCatalogues} from '../catalogue.js';

const product = "<http://hitontology.eu/ontology/MyProduct>";

const catalogueClasses = [ // handled by catalogues
  "hito:ApplicationSystemCatalogue","hito:ApplicationSystemClassified","hito:ApplicationSystemCitation",
  "hito:FeatureCatalogue","hito:FeatureClassified","hito:FeatureCitation",
  "hito:EnterpriseFunctionCatalogue","hito:EnterpriseFunctionClassified","hito:EnterpriseFunctionCitation"]
  .map(x=>rdf.long(x));

export default class Form
{
  /** Create the form but don't populate it yet. Use myForm.container to attach it to the DOM.*/
  constructor(clazzUri)
  {
    this.clazzUri = clazzUri;
    this.labelForResource = new Map();
    this.container = document.createElement("div");
    this.container.classList.add("form-container"); // flexbox
    const h1 = document.createElement("h1");
    h1.innerText = "Add "+rdf.short(clazzUri);

    //loadSelect = new Select(field,p);

    this.form = document.createElement("form");
    //this.form.id=id;
    this.container.append(h1,this.form);
    this.submit=this.submit.bind(this);
  }

  /** load the data from the SPARQL endpoint and populate */
  async init()
  {
    const form = document.createElement("div");
    form.classList.add("ui","form");
    this.form.appendChild(form);

    this.properties = await Property.domainProperties(this.clazzUri);

    this.catalogueSelects = [
      await new CatalogueSelect(form,await applicationSystemCatalogues()).init(),
      await new CatalogueSelect(form,await functionCatalogues()).init(),
      await new CatalogueSelect(form,await featureCatalogues()).init(),
    ];
    for(const p of this.properties)
    {
      if(p.type===OPROP&&!p.range) {console.warn("No range found for property "+p.uri);continue;}
      if(p.type===OPROP&&catalogueClasses.includes(p.range.uri)) {continue;} // catalogues are handled separately

      const field = document.createElement("div");
      field.classList.add("field");
      form.appendChild(field);
      const label = document.createElement("label");
      label.htmlFor= p.uri;
      label.innerText = p.label;
      field.appendChild(label);

      if(p.type===DPROP)
      {
        const text = document.createElement("input");
        field.appendChild(text);
        text.setAttribute("type","text");
        text.classList.add("textline");
        p.text = () => text.value;
      }
      else
      {
        p.select = await selectPropertyRange(field,p);
      }
    }
    const submitButton = document.createElement("input");
    submitButton.classList.add("ui","submit","button");
    submitButton.type="submit";
    submitButton.value="Create";
    this.form.appendChild(submitButton);
    submitButton.addEventListener("click",this.submit);

    //await this.load("http://hitontology.eu/ontology/Bahmni");
  }

  /** Remove the form from the DOM. */
  /*unregister()
  {
    document.body.removeChild(this.container);
  }*/

  /** Generate RDF from form*/
  submit(e)
  {
    e.preventDefault();
    let text = "";
    for(const p of this.properties)
    {
      if(!p.selected) // the selected function is added by the select element
      {
        if(!p.text) {continue;}
        text+=product + ` <${p.uri}> "${p.text()}"@en.\n`;
        continue;
      }
      for(const s of p.selected())
      {
        text+=product + ` <${p.uri}> <${s}>.\n`;
      }
    }
    for(const c of this.catalogueSelects)
    {
      console.log(c,c.text());
      text+=c.text()+"\n";
    }
    alert(text);
  }

  /** Load an existing instance into a new form. Form needs to be initialized. */
  async load(uri)
  {
    // all triples with the given uri as subject
    const query = `SELECT ?p ?o
      {
        <${uri}> ?p ?o.
      }`;
    const bindings = sparql.flat(await sparql.select(query,sparql.HITO,`select all triples of ${uri}`));
    //console.log(bindings);
    const values = new Map();
    this.properties.forEach(p=>{values.set(p.uri,[]);}); // JavaScript doesn't have a native multi map, so emulate our own
    bindings.forEach(b=>
    {
      const v = values.get(b.p);
      if(!v) {return;} // we don't use the property in our form
      //console.log(values.get(p.uri));
      v.push(b.o);
    });

    for(const p of this.properties)
    {
      if(!p.select) {continue;}
      console.log(`Setting values ${JSON.stringify(values.get(p.uri))} for property ${p.uri}.`);
      //p.select.select.value = values.get(p.uri);
      for(const v of values.get(p.uri))
      {
        // select.options is of type HTMLOptionsCollection, see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionsCollection
        // see https://stackoverflow.com/a/43255752/398963
        const options = [...p.select.select.options];
        if(!options) {break;}
        //console.log(options);
        const opt = options.find(o =>o.value === v);
        if(opt){opt.selected = true;}
        //p.select.select.selected = v;
        //break;
      }
    }
  }
}
