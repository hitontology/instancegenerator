/** @module */
import * as rdf from "../rdf.js";

const catalogueTypes =
{
  "http://hitontology.eu/ontology/FeatureCatalogue": {citationType: "http://hitontology.eu/ontology/FeatureCitation", citationRelation: "http://hitontology.eu/ontology/featureClassified"},
  "http://hitontology.eu/ontology/EnterpriseFunctionCatalogue": {citationType: "http://hitontology.eu/ontology/EnterpriseFunctionCitation", citationRelation: "http://hitontology.eu/ontology/functionClassified"},
  "http://hitontology.eu/ontology/ApplicationSystemCatalogue": {citationType: "http://hitontology.eu/ontology/ApplicationSystemCitation", citationRelation: "http://hitontology.eu/ontology/applicationSystemClassified"},
};

/** An UI element where the user first selects a catalogue of X and then gets a list of classified X to choose from and add X-citations. */
export default class CatalogueSelect
{
  /** Create a container where the user first selects a catalogue of X and then gets a list of classified X to choose from and add X-citations.
   * All catalogues need to be of the same rdf:type, such as all feature catalogues or all enterprise function catalogues. */
  constructor(parent,catalogues)
  {
    this.catalogues = catalogues;
    this.type = catalogues[0].type;
    this.types = catalogueTypes[this.type];
    this.name = rdf.niceSuffix(this.type);
    /** @type {Map<string,string>} */
    this.entryCitations = new Map();

    // clone template from index.html
    const container = document.getElementById("js-category-template").content.cloneNode(true).children[0];
    parent.appendChild(container);

    this.uiSearch = container.querySelector(".js-category-search");
    this.uiSearch.id = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
    this.uiSearch.querySelector(".prompt").placeholder="Select from "+this.name;

    this.citation = container.querySelector(".js-category-citation");
    this.citation.addEventListener("change", this.enterCitation.bind(this));

    this.selectEntry = this.selectEntry.bind(this);
  }

  /** Remove special characters and convert to camel case */
  camelize(str)
  {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index)
    {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  /** RDF triples in turtle text form.*/
  text()
  {
    console.log(this.entryCitations);
    console.log(this.entryCitations.entries());
    let text = "";
    for(const [uri,name] of this.entryCitations.entries())
    {
      console.log(uri,name);
      const citationUri = "http://hitontology.eu/ontology/"+this.camelize(name);
      text+=`<${citationUri}> a <${this.types.citationType}>.\n`;
      text+=`<${citationUri}> <${this.types.citationRelation}> <${uri}>.\n`;
      text+=`<${citationUri}> rdfs:label "${name}"@en.\n`;
    }
    return text;
  }

  /** User wants to created a new citation */
  enterCitation(e)
  {
    const value = e.target.value;
    if(!this.selected)
    {
      this.citation.value = "Please select a catalogue entry first.";
      return;
    }
    if(value.length<3)
    {
      this.citation.value = "Please enter at least 3 characters.";
      return;
    }
    console.log(`New value for ${this.selected}: ${value}`);
    this.entryCitations.set(this.selected,value);
  }

  /** Event handler for selecting a catalogue entry. */
  selectEntry(result,response)
  {
    const uri = result.id;
    this.selected = uri;
    //console.log(result);
    //console.log(`Selected ${this.name} entry`,uri);
    this.citation.placeholder = "Enter Citation for "+result.title;
    const oldValue = this.entryCitations.get(uri);
    this.citation.value = oldValue || "";
    //return false; // prevent default action, see https://semantic-ui.com/modules/search.html#/settings
  }

  /** Populates the catalogue interface. */
  async init()
  {
    const categoryContent = [];

    for(const cat of this.catalogues)
    {
      for(const i of (await cat.getMembers()).values())
      {
        //console.log({category: cat.label(), title: i.label()});
        let category = cat.label();
        if(cat.comment())  {category=`<a title="${cat.comment()}" href="${cat.uri}" target="_blank">${category}</a>`;}
        //const title = i.label()+`<a href="${i.uri}" target="_blank">Browse</a>`; // is displayed incorrectly
        categoryContent.push({category: category, title: i.label(), id: i.uri, description: i.comment() || undefined});
      }
    }
    //uiSearch.search(...) does not work
    {
      $('#'+this.uiSearch.id)
        .search({
          name: this.name+' Search',
          namespace: "search"+this.uiSearch.id,
          type: 'category',
          source: categoryContent,
          fullTextSearch: true,
          maxResults: 30,
          searchFields: ["category", "title", "description"],
          minCharacters: 0,
          onSelect: this.selectEntry,
        });
    }
    return this;
  }
}
