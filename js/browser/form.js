/** @module
Form to create a new instance of the given OWL Class. */
import * as rdf from "../rdf.js";
import * as sparql from "../sparql.js";
import {Property,DPROP,OPROP} from "../property.js";
import {selectPropertyRange,Select} from "./select.js";
import CatalogueSelect from "./catalogueSelect.js";
import {functionCatalogues,featureCatalogues,applicationSystemCatalogues} from '../catalogue.js';
import getClass from '../clazz.js';
import field from './field.js';

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
    this.container = document.createElement("div");
    this.container.classList.add("form-container"); // flexbox
    const h1 = document.createElement("h1");
    h1.innerText = "Add "+rdf.short(clazzUri);

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

    // Loading **************************************************************
    {
      const clazz = await getClass(this.clazzUri);
      const loadSelect = new Select("Load Existing "+clazz.label(),"myid",(await clazz.getMembers()).values(),false);
      const s = loadSelect.element;
      s.addEventListener("change",()=>this.load(s.options[s.selectedIndex].value));
    }
    // **********************************************************************

    this.catalogueSelects = [
      await new CatalogueSelect(await applicationSystemCatalogues()).init(),
      await new CatalogueSelect(await functionCatalogues()).init(),
      await new CatalogueSelect(await featureCatalogues()).init(),
    ];
    this.catalogueSelects.forEach(c=>
      form.appendChild(field(c.name,c.element)),
    );

    for(const p of this.properties)
    {
      if(p.type===OPROP&&!p.range) {console.warn("No range found for property "+p.uri);continue;}
      if(p.type===OPROP&&catalogueClasses.includes(p.range.uri)) {continue;} // catalogues are handled separately

      if(p.type===DPROP)
      {
        const text = document.createElement("input");
        text.setAttribute("type","text");
        text.classList.add("textline");
        p.text = () => text.value;
        form.appendChild(field(p.label,text));
      }
      else
      {
        p.select = await selectPropertyRange(field,p);
        form.appendChild(field(p.label,p.select.element));
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

  /** Generate R      console.log(`Setting values ${JSON.stringify(values.get(p.uri))} for property ${p.uri}.`);
DF from form*/
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

  /** Clear all selected values. */
  clear()
  {
    for(const p of this.properties)
    {
      if(!p.select) {continue;}
      // ********************in case it is not converted yet by Semantic UI to its own structure *******
      const options = [...p.select.element.options];
      options.forEach(o=>{o.selected=false;});
      // Semantic UI Way *******************************************************************************
      const div = p.select.element.parentElement;
      div.id = p.select.element.id+"-div";
      $("#"+$.escapeSelector(div.id)).dropdown("clear");
    }
  }

  /** Load an existing instance. Existing values are kept. Form needs to be initialized. */
  async load(uri)
  {
    this.clear();
    console.log("Loading",uri);
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
      //p.select.element.value = values.get(p.uri);
      // select.options is of type HTMLOptionsCollection, see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionsCollection
      // see https://stackoverflow.com/a/43255752/398963
      const options = [...p.select.element.options];
      if(!options) {break;}
      const vs = values.get(p.uri);
      console.log(`Setting values ${JSON.stringify(vs)} for property ${p.uri}.`);
      // ********************in case it is not converted yet by Semantic UI to its own structure *******
      for(const v of vs)
      {
        //console.log(options);
        const opt = options.find(o =>o.value === v);
        if(opt){opt.selected = true;console.log(opt);}
        //p.select.element.selected = v;
        //break;
      }
      // Semantic UI Way *******************************************************************************
      const div = p.select.element.parentElement;
      //div.dropdown("set selected",vs); // does not work, see https://stackoverflow.com/questions/60546024/how-to-call-the-semantic-ui-dropdown-function-directly-on-an-element
      div.id = p.select.element.id+"-div";
      $("#"+$.escapeSelector(div.id)).dropdown("set selected",vs);
      // ***********************************************************************************************
    }
  }
}
