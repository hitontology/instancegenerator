/** @module */

/** An UI element where the user first selects a catalogue of X and then gets a list of classified X to choose from and add X-citations. */
export default class CatalogueSelect
{
  /** Create a container where the user first selects a catalogue of X and then gets a list of classified X to choose from and add X-citations.*/
  constructor(parent,catalogue)
  {
    const container = document.createElement("div");
    parent.appendChild(container);

    const uiSearch = document.getElementById("categorySearch").content.cloneNode(true);
    uiSearch.id = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
    container.appendChild(uiSearch);

    const categoryContent = [
      { category: 'South America', title: 'Brazil' },
      { category: 'Asia', title: 'China' },
    ];

    console.log(catalogue);
    for(const cat of catalogue.catalogueClass.instances)
    {
      for(const cl of catalogue.classifiedClass.instances)
      {
        categoryContent.push({category: cat.label(), title: cl.label()});
      }
    }
    console.log(categoryContent);

    //uiSearch.search(...) does not work
    {
      $('.ui.search')
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
