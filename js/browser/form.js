/** @module
Form to create a new instance of the given OWL Class. */
import * as rdf from "../rdf.js";
import * as sparql from "../sparql.js";
import {Property,DPROP,OPROP} from "../property.js";
import {selectPropertyRange,Select} from "./select.js";
import {CatalogueSelect,catalogueTypes} from "./catalogueSelect.js";
import * as catalogue from '../catalogue.js';
import getClass from '../clazz.js';
import field from './field.js';
import {createGitHubIssue} from './util.js';
import ViewCitationTable from './viewCitationTable.js';

export default class Form
{
  /** Create the form but don't populate it yet. Use myForm.container to attach it to the DOM.*/
  constructor(clazzUri)
  {
    this.clazzUri = clazzUri;
    const template = /** @type {HTMLTemplateElement} */ (document.getElementById("js-form-template"));
    this.element = /** @type Element */ (template.content.cloneNode(true)).children[0];
    [this.editCitationTab,this.viewCitationTab,this.attributeTab] = this.element.querySelectorAll(".tab");
    this.element.querySelector("h1").innerText = "Add "+rdf.short(clazzUri);
    this.product = "http://hitontology.eu/ontology/"+Math.random().toString(36).substring(2, 15);  //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    this.submit=this.submit.bind(this);
    this.submitButton = this.element.querySelector("input");
    this.submitButton.addEventListener("click",this.submit);
  }

  /** load the data from the SPARQL endpoint and populate */
  async init()
  {
    this.properties = await Property.domainProperties(this.clazzUri);

    // Loading **************************************************************
    {
      const clazz = await getClass(this.clazzUri);
      const loadSelect = new Select("Load Existing "+clazz.label(),"myid",(await clazz.getMembers()).values(),false);
      const s = loadSelect.element;
      this.element.prepend(s);
      s.addEventListener("change",()=>this.load(s.options[s.selectedIndex].value));
    }
    // **********************************************************************

    this.catalogueSelects = [
      await new CatalogueSelect(await catalogue.applicationSystemCatalogues(),this).init(),
      await new CatalogueSelect(await catalogue.functionCatalogues(),this).init(),
      await new CatalogueSelect(await catalogue.featureCatalogues(),this).init(),
      await new CatalogueSelect(await catalogue.userGroupCatalogues(),this).init(),
      await new CatalogueSelect(await catalogue.organizationalUnitCatalogues(),this).init(),
    ];
    this.viewCitationTable=new ViewCitationTable(this.catalogueSelects);

    this.catalogueSelectsByCitationType = new Map();
    this.catalogueSelects.forEach(c=>
    {
      this.editCitationTab.appendChild(field(c.name,c.element));
      this.catalogueSelectsByCitationType.set(c.types.citationType,c);
    });

    const catalogueProperties = new Set(Object.values(catalogueTypes).map(v=>[v.citationRelation,v.classifiedRelation]).flat());

    for(const p of this.properties)
    {
      //console.log(p);
      if(p.type===OPROP&&!p.range) {console.warn("No range found for property "+p.uri);continue;}
      if(p.type===OPROP&&catalogueProperties.has(p.uri)) {continue;} // catalogues are handled separately

      if(p.type===DPROP||p.range.uri==="http://www.w3.org/2000/01/rdf-schema#Resource")
      {
        const text = document.createElement("input");
        text.setAttribute("type","text");
        text.classList.add("textline");
        p.text = () => text.value;
        this.attributeTab.appendChild(field(p.label,text));
      }
      else
      {
        p.select = await selectPropertyRange(field,p);
        this.attributeTab.appendChild(field(p.label,p.select.element));
      }
    }
    //await this.load("http://hitontology.eu/ontology/Bahmni");
    $('.menu .item').tab();
  }

  /** Remove the form from the DOM. */ /*unregister() {document.body.removeChild(this.container);}*/

  /** Generate RDF from the form*/
  submit(e)
  {
    e.preventDefault();
    let turtle = "";
    for(const p of this.properties)
    {
      if(!p.selected) // the selected function is added by the select element
      {
        if(!p.text) {continue;}
        if(p.range&&p.range.uri==="http://www.w3.org/2000/01/rdf-schema#Resource")
        {turtle+=`<${this.product}> <${p.uri}> <${p.text().replace(/[^a-zA-Z0-9-_.:/]/g, '')}>.\n`;}
        else {turtle+=`<${this.product}> <${p.uri}> "${p.text()}"@en.\n`;}
        continue;
      }
      for(const s of p.selected())
      {
        turtle+=`<${this.product}> <${p.uri}> <${s}>.\n`;
      }
    }
    for(const c of this.catalogueSelects)
    {
      console.log(c,c.turtle(this.product));
      turtle+=c.turtle(this.product)+"\n";
    }
    //alert(text);
    createGitHubIssue("Create Instance","```"+turtle+"```");
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

    this.element.querySelector("h1").innerHTML = `Edit <a href="${uri}">${rdf.short(uri)}</a>`;

    const loadAttributes = async ()=>
    {
      // all non-citation triples with the given uri as subject
      const query = `SELECT ?p ?o
      {
        <${uri}> ?p ?o.
        MINUS {?o a [rdfs:subClassOf hito:Citation].}
      }`;
      const bindings = sparql.flat(await sparql.select(query,sparql.HITO,`select all attributes of ${uri}`));
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
        if(vs.length===0) {continue;}
        //console.log(`Setting values ${JSON.stringify(vs)} for property ${p.uri}.`);
        // ********************in case it is not converted yet by Semantic UI to its own structure *******
        for(const v of vs)
        {
          //console.log(options);
          const opt = options.find(o =>o.value === v);
          if(opt)
          {
            opt.selected = true;
            //console.log(opt);
          }
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
    };

    const loadCatalogues = async ()=>
    {
      const query = `SELECT (STR(SAMPLE(?citationLabel)) AS ?citationLabel) ?citationType ?classified
        {
          <${uri}> ?p ?citation.

          ?citation a ?citationType;
          rdfs:label ?citationLabel;
          ?q ?classified.

          ?citationType rdfs:subClassOf hito:Citation.

          ?classified a [rdfs:subClassOf hito:Classified].
        }`;
      for(const s of this.catalogueSelectsByCitationType.values()) {s.clearCitations();}
      const bindings = sparql.flat(await sparql.select(query,sparql.HITO,`select all citations of ${uri}`));
      bindings.forEach(b=>
      {
        const catalogueSelect = this.catalogueSelectsByCitationType.get(b.citationType);
        catalogueSelect.setCitation(b.classified,b.citationLabel);
      });
    };

    await loadCatalogues();
    this.viewCitationTable.update();
    await loadAttributes();
  }

  /** Update the form view.*/
  update()
  {
    this.viewCitationTable.update();
  }
}
