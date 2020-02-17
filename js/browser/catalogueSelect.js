/** @module */

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
    container.appendChild(this.uiSearch);

    //console.log(catalogues);
  }

  /** Populates the catalogue interface. */
  async init()
  {
    const categoryContent = [
      //      { category: 'South America', title: 'Brazil' },
      //{ category: 'Asia', title: 'China' },
    ];

    for(const cat of this.catalogues)
    {
      for(const i of (await cat.getMembers()).values())
      {
        //console.log({category: cat.label(), title: i.label()});
        categoryContent.push({category: cat.label(), title: i.label()});
      }
    }
    /*
    for(const cat of catalogue.catalogueClass.instances)
    {
    for(const cl of catalogue.classifiedClass.instances)
    {
    categoryContent.push({category: cat.label(), title: cl.label()});
  }
}
console.log(categoryContent);
*/
    //uiSearch.search(...) does not work
    {
      $('#'+this.uiSearch.id)
        .search({
          type: 'category',
          source: categoryContent,
          fullTextSearch: true,
          maxResults: 20,
          //searchFields: ...
          minCharacters: 0,
        });
    }

    // = new Select(container,catalogue.classifiedClass);
  }
}
