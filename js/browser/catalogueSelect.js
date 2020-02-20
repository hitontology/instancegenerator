/** @module */
import * as rdf from "../rdf.js";

/** An UI element where the user first selects a catalogue of X and then gets a list of classified X to choose from and add X-citations. */
export default class CatalogueSelect
{
  /** Create a container where the user first selects a catalogue of X and then gets a list of classified X to choose from and add X-citations.*/
  constructor(parent,catalogues)
  {
    this.catalogues = catalogues;
    this.name = rdf.niceSuffix(catalogues[0].type);
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
    {this.entryCitations.set(this.selected,value) ;}
  }

  /** Event handler for selecting a catalogue entry. */
  selectEntry(result,response)
  {
    const uri = result.id;
    this.selected = uri;
    console.log(result);
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
        categoryContent.push({category: cat.label(), title: i.label(), id: i.uri});
      }
    }
    //uiSearch.search(...) does not work
    {
      $('#'+this.uiSearch.id)
        .search({
          type: 'category',
          source: categoryContent,
          fullTextSearch: true,
          maxResults: 30,
          searchFields: ["category", "title"],
          minCharacters: 0,
          onSelect: this.selectEntry,
        });
    }
  }
}
