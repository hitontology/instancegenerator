/** @module
Table that displays the citations of the given OWL Class. */

export default class ViewCitationTable
{
  /** Initialize the table but don't show the entries yet, use update() for that.*/
  constructor(catalogueSelects)
  {
    this.catalogueSelects = catalogueSelects;
    // single instance, refactor if multiples are required
    this.tableBody = document.querySelector("#view-citation-table tbody");
  }

  /** Fill the catalogue view table with all existing citations. */
  async update()
  {
    this.tableBody.innerHTML = "";
    for(const select of this.catalogueSelects)
    {
      for(const [classified,citation] of select.entryCitations.entries())
      {
        const content = select.getContent(classified);
        //const citationUri = "http://hitontology.eu/ontology/"+select.camelize(citation);
        //<a href="${citationUri}">${citation}</a>
        this.tableBody.innerHTML+=`<tr><td>${select.name}</td><td>${select.getContent(classified).category}</td><td><a href="${content.id}">${content.title}</a></td><td>${citation}</td></tr>`;
      }
    }
  }
}
