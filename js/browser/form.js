/** @module
Form to create a new instance of the given OWL Class. */
import * as rdf from "../rdf.js";
import {Property,DPROP,OPROP} from "../property.js";
import Select from "./select.js";

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
    const submitButton = document.createElement("input");
    submitButton.type="submit";
    submitButton.value="Create";
    this.container.append(h1,submitButton,this.form);
    this.submit=this.submit.bind(this);
    submitButton.addEventListener("click",this.submit);
  }

  /** load the data from the SPARQL endpoint and populate */
  async init()
  {
    const itemContainer = document.createElement("div");
    itemContainer.classList.add("form-item-container","ui","form");
    this.form.appendChild(itemContainer);

    this.properties = await Property.domainProperties(this.clazz);

    for(const p of this.properties)
    {
      console.log(p);
      if(p.type===OPROP&&catalogueClasses.includes(p.range.uri)) {continue;}
      const item =  document.createElement("div");
      item.classList.add("form-item","field");
      itemContainer.appendChild(item);
      const label = document.createElement("label");
      label.for= p.uri;
      label.innerText = p.label;
      item.appendChild(label);
      if(p.type===DPROP)
      {
        const text = document.createElement("input");
        item.appendChild(text);
        text.setAttribute("type",text);
        text.classList.add("textline");
        p.text = () => text.value;
      }
      else
      {
        const select = new Select(item,p);
        await select.init();
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
