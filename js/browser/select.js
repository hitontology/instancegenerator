/** Container with a Form this.select element containing instances and a search function.
@module */
const SEARCH = false;

export default class Select
{
  /** Create a container where the user can this.select from the given values and a search field and attach it to the given parent.*/
  constructor(parent,property)
  {
    //const container = document.createElement("div");
    //container.classList.add("field");
    // parent.appendChild(container);
    this.container = parent;
    this.select = document.createElement("select");
    this.container.append(this.select);
    this.property = property;
    //this.select.style.display="block";
    this.select.classList.add("large");
    this.select.classList.add("ui","fluid","dropdown","this.selection","multiple","search");
    this.select.name = property.uri;
    this.select.id = property.uri;
    this.select.setAttribute("multiple","");
    const labelOption = document.createElement("option"); // not actually clickable, used by semantic ui as placeholder when no items are this.selected
    labelOption.innerText = property.range.label();
    labelOption.value="";
    this.select.appendChild(labelOption);
  }

  /** Populate the list. */
  async init()
  {
    const options = [];
    console.log(await this.property.range.getMembers());
    for(const i of (await this.property.range.getMembers()).values())
    {
      const option = document.createElement("option");
      option.instance = i;
      options.push(option);
      option.value = i.uri;
      option.innerText = i.label();
    }
    options.sort((a,b)=>a.innerText.localeCompare(b.innerText));
    this.select.append(...options);
    this.property.selected = () => [...this.options].filter(o => o.selected).map(o => o.value);
    if(SEARCH)
    {
      const input = document.createElement("input");
      input.classList.add("search");
      input.addEventListener("change",()=>
      {
        if(input.value==="")
        {
          for(const o of options) {o.style.display="none";}
          return;
        }
        console.log(options);
        const hits = this.property.range.search(input.value);
        for(const o of options)
        {
          o.style.display = hits.includes(o.instance.uri)?"":"none";
        }
      });
      this.container.append(input);
    }
  }
}
