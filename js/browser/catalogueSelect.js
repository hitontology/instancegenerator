/** @module */
import * as rdf from "../rdf.js";

export const catalogueTypes =
{
  "http://hitontology.eu/ontology/FeatureCatalogue": {citationType: "http://hitontology.eu/ontology/FeatureCitation", citationRelation: "http://hitontology.eu/ontology/feature", classifiedRelation: "http://hitontology.eu/ontology/featureClassified"},
  "http://hitontology.eu/ontology/EnterpriseFunctionCatalogue": {citationType: "http://hitontology.eu/ontology/EnterpriseFunctionCitation", citationRelation: "http://hitontology.eu/ontology/enterpriseFunction", classifiedRelation: "http://hitontology.eu/ontology/enterpriseFunctionClassified"},
  "http://hitontology.eu/ontology/ApplicationSystemCatalogue": {citationType: "http://hitontology.eu/ontology/ApplicationSystemCitation",   citationRelation: "http://hitontology.eu/ontology/applicationSystem", classifiedRelation: "http://hitontology.eu/ontology/applicationSystemClassified"},
  "http://hitontology.eu/ontology/UserGroupCatalogue": {citationType: "http://hitontology.eu/ontology/UserGroupCitation",                   citationRelation: "http://hitontology.eu/ontology/userGroup", classifiedRelation: "http://hitontology.eu/ontology/userGroupClassified"},
  "http://hitontology.eu/ontology/OrganizationalUnitCatalogue": {citationType: "http://hitontology.eu/ontology/OrganizationalUnitCitation", citationRelation: "http://hitontology.eu/ontology/organizationalUnit", classifiedRelation: "http://hitontology.eu/ontology/organizationalUnitClassified"},
};

/** An UI element where the user first selects a catalogue of X and then gets a list of classified X to choose from and add X-citations. */
export class CatalogueSelect
{
  /** Create a container where the user first selects a catalogue of X and then gets a list of classified X to choose from and add X-citations.
   * All catalogues need to be of the same rdf:type, such as all feature catalogues or all enterprise function catalogues. */
  constructor(catalogues)
  {
    this.catalogues = catalogues;
    this.type = catalogues[0].types[0];
    if(!this.type) {throw new Error("No type for catalogues "+JSON.stringify(catalogues));}
    this.types = catalogueTypes[this.type];
    this.name = rdf.niceSuffix(this.type).replace(" Catalogue",""); // the word "Catalogue" should not be included in the user interface
    /** @type {Map<string,string>} */
    this.entryCitations = new Map();

    // clone template from index.html
    const template = /** @type {HTMLTemplateElement} */ (document.getElementById("js-category-template"));
    this.element = /** @type Element */ (template.content.cloneNode(true)).children[0];

    this.uiSearch = this.element.querySelector(".js-category-search");
    this.uiSearch.id = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
    /** @type HTMLInputElement */ (this.uiSearch.querySelector(".prompt")).placeholder="Select "+this.name;

    /** @type HTMLInputElement */
    this.citation = this.element.querySelector(".js-category-citation");
    this.citation.addEventListener("change", this.enterCitation.bind(this));

    this.selectEntry = this.selectEntry.bind(this);
    this.setCitation = this.setCitation.bind(this);
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
  text(productUri)
  {
    let text = "";
    for(const [uri,name] of this.entryCitations.entries())
    {
      //console.log(uri,name);
      const citationUri = "http://hitontology.eu/ontology/"+this.camelize(name);
      text+=`<${productUri}> <${this.types.citationRelation}> <${citationUri}>.\n`;
      text+=`<${citationUri}> a <${this.types.citationType}>.\n`;
      text+=`<${citationUri}> <${this.types.classifiedRelation}> <${uri}>.\n`;
      text+=`<${citationUri}> rdfs:label "${name}"@en.\n`;
    }
    return text;
  }

  /** Set a new citation for the given classified.*/
  setCitation(classifiedUri,citationLabel,tellUser)
  {
    const message = `New citation for ${rdf.short(classifiedUri)}: "${citationLabel}"`;
    if(tellUser) {window.notyf.success(message);}
    console.log(message);
    this.entryCitations.set(classifiedUri,citationLabel);
    const content = this.getContent(classifiedUri);
    content.description = content.originalDescription + `<p>"${citationLabel}"</p>`;
    $('#'+this.uiSearch.id).search('setting', 'source', [...this.categoryContent.values()]);
  }

  /** User wants to create a new citation */
  enterCitation(changeEvent)
  {
    const newCitation = changeEvent.target.value;
    //console.log(changeEvent);
    if(!this.selectedClassified) // selected catalogue entry (classified X)
    {
      window.notyf.error("Please select a catalogue entry first.");
      //this.citation.value = "Please select a catalogue entry first.";
      return;
    }
    const content = this.getContent(this.selectedClassified);
    if(newCitation==="") // clear
    {
      window.notyf.success(`Cleared value for ${rdf.short(this.selectedClassified)}.`);
      this.entryCitations.delete(this.selectedClassified);
      content.description = content.originalDescription;
      return;
    }
    if(newCitation.length<3)
    {
      window.notyf.error("Please enter at least 3 characters.");
      //this.citation.value = "Please enter at least 3 characters.";
      return;
    }
    this.setCitation(this.selectedClassified,newCitation,true);
  }

  /** Event handler for selecting a catalogue entry. */
  selectEntry(result,response)
  {
    //console.log(result);
    const uri = result.id;
    this.selectedClassified = uri;
    this.citation.placeholder = "Enter Citation for "+result.title;
    const oldValue = this.entryCitations.get(uri);
    this.citation.value = oldValue || "";
    //return false; // prevent default action, see https://semantic-ui.com/modules/search.html#/settings
  }

  /** Set Semantic UI content entry for a catalogue entry (classified X).*/
  setContent(catalogueUri,classifiedUri,content) {this.categoryContent.set(classifiedUri,content);}
  //setContent(catalogueUri,classifiedUri,content) {this.categoryContent.set(catalogueUri+classifiedUri,content);}
  /** Get Semantic UI content entry for a catalogue entry (classified X).*/
  getContent(classifiedUri) {return this.categoryContent.get(classifiedUri);}
  //getContent(catalogueUri,classifiedUri) {return this.categoryContent.get(classifiedUri);}
  //getContent(catalogueUri,classifiedUri) {return this.categoryContent.get(catalogueUri+classifiedUri);}

  /** Populates the catalogue interface. */
  async init()
  {
    this.categoryContent = new Map();
    for(const catalogue of this.catalogues)
    {
      for(const classified of (await catalogue.getMembers()).values())
      {
        let category = catalogue.label();
        if(catalogue.comment())  {category=`<a title="${catalogue.comment()}" href="${catalogue.uri}" target="_blank">${category}</a>`;}
        //const title = i.label()+`<a href="${i.uri}" target="_blank">Browse</a>`; // is displayed incorrectly
        this.setContent(catalogue.uri,classified.uri,{category: category, title: classified.label(), id: classified.uri, description: classified.comment() || "", originalDescription: classified.comment() || ""});
      }
    }
    //console.log(this.categoryContent.values());
    //uiSearch.search(...) does not work
    document.body.appendChild(this.element); // add temporarily, otherwise it won't be found by jquery
    $('#'+this.uiSearch.id)
      .search({
        name: this.name+' Search',
        //namespace: "search"+this.uiSearch.id, // bug, see https://github.com/Semantic-Org/Semantic-UI/issues/6963
        type: 'category',
        source: [...this.categoryContent.values()],
        // @ts-ignore https://github.com/Semantic-Org/Semantic-UI/issues/6961
        fullTextSearch: "exact",
        maxResults: 30,
        searchFields: ["category", "title", "description"],
        minCharacters: 0,
        onSelect: this.selectEntry,
      });
    document.body.removeChild(this.element); // remove from DOM again
    return this;
  }
}
