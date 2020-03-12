/** @module */
import * as rdf from "../rdf.js";

const catalogueTypes =
{
  "http://hitontology.eu/ontology/FeatureCatalogue": {citationType: "http://hitontology.eu/ontology/FeatureCitation", citationRelation: "http://hitontology.eu/ontology/featureClassified"},
  "http://hitontology.eu/ontology/EnterpriseFunctionCatalogue": {citationType: "http://hitontology.eu/ontology/EnterpriseFunctionCitation", citationRelation: "http://hitontology.eu/ontology/enterpriseFunctionClassified"},
  "http://hitontology.eu/ontology/ApplicationSystemCatalogue": {citationType: "http://hitontology.eu/ontology/ApplicationSystemCitation", citationRelation: "http://hitontology.eu/ontology/applicationSystemClassified"},
  "http://hitontology.eu/ontology/UserGroupCatalogue": {citationType: "http://hitontology.eu/ontology/UserGroupCitation", citationRelation: "http://hitontology.eu/ontology/userGroupClassified"},
  "http://hitontology.eu/ontology/OrganizationalUnitCatalogue": {citationType: "http://hitontology.eu/ontology/OrganizationalUnitCitation", citationRelation: "http://hitontology.eu/ontology/organizationalUnitClassified"},
};

/** An UI element where the user first selects a catalogue of X and then gets a list of classified X to choose from and add X-citations. */
export default class CatalogueSelect
{
  /** Create a container where the user first selects a catalogue of X and then gets a list of classified X to choose from and add X-citations.
   * All catalogues need to be of the same rdf:type, such as all feature catalogues or all enterprise function catalogues. */
  constructor(catalogues)
  {
    console.log(catalogues);
    this.catalogues = catalogues;
    this.type = catalogues[0].types[0];
    if(!this.type) {throw new Error("No type for catalogues "+JSON.stringify(catalogues));}
    this.types = catalogueTypes[this.type];
    this.name = rdf.niceSuffix(this.type);
    /** @type {Map<string,string>} */
    this.entryCitations = new Map();

    // clone template from index.html
    const template = /** @type {HTMLTemplateElement} */ (document.getElementById("js-category-template"));
    this.element = /** @type Element */ (template.content.cloneNode(true)).children[0];

    this.uiSearch = this.element.querySelector(".js-category-search");
    this.uiSearch.id = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
    /** @type HTMLInputElement */ (this.uiSearch.querySelector(".prompt")).placeholder="Select from "+this.name;

    /** @type HTMLInputElement */
    this.citation = this.element.querySelector(".js-category-citation");
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
    const c = this.categoryContent.get(this.selected);
    if(value==="") // clear
    {
      console.log(`Cleared value for ${this.selected}.`);
      this.entryCitations.delete(this.selected,value);
      c.description = (c.oldDesc || "");
      return;
    }
    if(value.length<3)
    {
      this.citation.value = "Please enter at least 3 characters.";
      return;
    }
    console.log(`New value for ${this.selected}: ${value}`);
    this.entryCitations.set(this.selected,value);

    if(!c.oldDesc) {c.oldDesc=c.description;}
    c.description = (c.oldDesc || "") + `<p>"${value}"</p>`;
    $('#'+this.uiSearch.id).search('setting', 'source', [...this.categoryContent.values()]);
  }

  /** Event handler for selecting a catalogue entry. */
  selectEntry(result,response)
  {
    const uri = result.id;
    this.selected = uri;
    this.citation.placeholder = "Enter Citation for "+result.title;
    const oldValue = this.entryCitations.get(uri);
    this.citation.value = oldValue || "";
    //return false; // prevent default action, see https://semantic-ui.com/modules/search.html#/settings
  }

  /** Populates the catalogue interface. */
  async init()
  {
    this.categoryContent = new Map();
    for(const cat of this.catalogues)
    {
      for(const i of (await cat.getMembers()).values())
      {
        let category = cat.label();
        if(cat.comment())  {category=`<a title="${cat.comment()}" href="${cat.uri}" target="_blank">${category}</a>`;}
        //const title = i.label()+`<a href="${i.uri}" target="_blank">Browse</a>`; // is displayed incorrectly
        this.categoryContent.set(i.uri,{category: category, title: i.label(), id: i.uri, description: i.comment() || undefined});
      }
    }
    console.log(this.categoryContent.values());
    //uiSearch.search(...) does not work
    document.body.appendChild(this.element); // add temporarily, otherwise it won't be found by jquery
    $('#'+this.uiSearch.id)
      .search({
        name: this.name+' Search',
        //namespace: "search"+this.uiSearch.id, // bug, see https://github.com/Semantic-Org/Semantic-UI/issues/6963
        type: 'category',
        source: [...this.categoryContent.values()],
        // @ts-ignore https://github.com/Semantic-Org/Semantic-UI/issues/6961
        fullTextSearch: true,
        maxResults: 30,
        searchFields: ["category", "title", "description"],
        minCharacters: 0,
        onSelect: this.selectEntry,
      });
    document.body.removeChild(this.element); // remove from DOM again
    return this;
  }
}
