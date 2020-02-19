/** Container with a Form this.select element containing instances and a search function.
@module */
const SEARCH = false;

export default class Select
{
  /** Add a dropdown menu to the given field where the user can this.select from the given values and a search field and attach it to the given field.*/
  constructor(field,property)
  {
    //const container = document.createElement("div");
    //container.classList.add("field");
    this.field = field;

    this.select = document.createElement("select");
    this.field.append(this.select);
    this.property = property;
    //this.select.style.display="block";
    this.select.classList.add("large");
    this.select.classList.add("ui","fluid","dropdown","multiple","search","loading");
    this.select.name = property.uri;
    this.select.id = property.uri;
    this.select.setAttribute("multiple","");
    const labelOption = document.createElement("option"); // not actually clickable, used by semantic ui as placeholder when no items are this.selected
    labelOption.innerText = property.range.label();
    labelOption.value="";
    this.select.appendChild(labelOption);
  }

  /** *Adds search on change. */
  addSearch(options)
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
    this.field.append(input);
  }

  /** Populate the list. */
  async init()
  {
    const options = [];
    try
    {
      const members = (await this.property.range.getMembers()).values();
      for(const i of members)
      {
        const option = document.createElement("option");
        option.instance = i;
        options.push(option);
        option.value = i.uri;
        option.innerText = i.label();
      }
      options.sort((a,b)=>a.innerText.localeCompare(b.innerText));
      this.select.append(...options);
      this.property.selected = () => [...options].filter(o => o.selected).map(o => o.value);
      if(SEARCH) {this.addSearch(options);}
    }
    catch (e)
    {
      this.select.parentElement.classList.add("error","disabled");
    }
    finally
    {
      this.select.parentElement.classList.remove("loading"); // Semantic UI may have already created a parent div with the loading class
    }
  }
}
