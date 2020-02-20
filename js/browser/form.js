/** @module
Form to create a new instance of the given OWL Class. */
import * as rdf from "../rdf.js";
import {Property,DPROP,OPROP} from "../property.js";
import Select from "./select.js";
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
  /** Create the form but don't populate it yet.*/
  constructor(clazz)
  {
    this.clazz = clazz;
    this.labelForResource = new Map();
    this.container = document.createElement("div");
    this.container.classList.add("form-container"); // flexbox
    document.body.appendChild(this.container);
    const h1 = document.createElement("h1");
    h1.innerText = "Add "+rdf.short(clazz);
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

    this.properties = await Property.domainProperties(this.clazz);

    this.catalogueSelects = [
      await new CatalogueSelect(form,await featureCatalogues()).init(),
      await new CatalogueSelect(form,await functionCatalogues()).init(),
      await new CatalogueSelect(form,await applicationSystemCatalogues()).init(),
    ];

    for(const p of this.properties)
    {
      if(p.type===OPROP&&catalogueClasses.includes(p.range.uri)) {continue;}

      const field = document.createElement("div");
      field.classList.add("field");
      form.appendChild(field);
      const label = document.createElement("label");
      label.for= p.uri;
      label.innerText = p.label;
      field.appendChild(label);

      if(p.type===DPROP)
      {
        const text = document.createElement("input");
        field.appendChild(text);
        text.setAttribute("type",text);
        text.classList.add("textline");
        p.text = () => text.value;
      }
      else
      {
        const select = new Select(field,p);
        /*await*/ select.init();
      }
    }

    const submitButton = document.createElement("input");
    submitButton.classList.add("ui","submit","button");
    submitButton.type="submit";
    submitButton.value="Create";
    this.form.appendChild(submitButton);
    submitButton.addEventListener("click",this.submit);
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
}
