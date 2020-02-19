/** @module */
import * as rdf from "../rdf.js";

/** An UI element where the user first selects a catalogue of X and then gets a list of classified X to choose from and add X-citations. */
export default class CatalogueSelect
{
  /** Create a container where the user first selects a catalogue of X and then gets a list of classified X to choose from and add X-citations.*/
  constructor(parent,catalogues)
  {
    this.catalogues = catalogues;

    const container = document.createElement("div");
    parent.appendChild(container);
    // clone template from index.html
    const templateContent = document.getElementById("categorySearch").content.children[0];
    this.uiSearch = templateContent.cloneNode(true);
    this.uiSearch.id = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(16);

    this.uiSearch.querySelector(".prompt").placeholder="Search "+rdf.niceSuffix(catalogues[0].type);

    /*const citation = document.createElement("input");
    input.classList.add("");
    citation.type="text";*/

    container.append(this.uiSearch);

    //console.log(catalogues);
  }

  /** Event handler for selecting a catalogue entry. */
  selectEntry(result,response)
  {
    console.log(result);
    return true; // prevent default action, see https://semantic-ui.com/modules/search.html#/settings
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
