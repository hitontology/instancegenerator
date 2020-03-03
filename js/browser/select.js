/** Container with a Form multi select element containing resources and a search function.
@module */
const SEARCH = false;

class Select
{
  /** Add a dropdown menu to the given field where the user can this.select from the given values and a search field and attach it to the given field.
  @param {HTMLElement} field the container to append this element to. Should have class "field".
  @param {String} label the label of the select element
  @param {String} id the id of the select element
  @param {Array} resources the resources to fill in the list
   */
  constructor(field/*,name*/,label,id,resources)
  {
    //const container = document.createElement("div");
    //container.classList.add("field");
    this.field = field;

    this.select = document.createElement("select");
    this.field.append(this.select);
    this.select.classList.add("large","ui","fluid","dropdown","multiple","search","loading");
    //this.select.name = name;
    this.select.id = id;
    this.select.setAttribute("multiple","");
    const labelOption = document.createElement("option"); // not actually clickable, used by semantic ui as placeholder when no items are this.selected
    labelOption.innerText = label;
    labelOption.value="";
    this.select.appendChild(labelOption);

    const options = [];
    try
    {
      for(const r of resources)
      {
        const option = document.createElement("option");
        // @ts-ignore
        option.resource = r;
        options.push(option);
        option.value = r.uri;
        option.innerText = r.label();
      }
      options.sort((a,b)=>a.innerText.localeCompare(b.innerText));
      this.select.append(...options);
      // @ts-ignore
      this.property.selected = () => [...options].filter(o => o.selected).map(o => o.value);
      if(SEARCH) {this.addSearch(options);}
    }
    catch (e)
    {
      this.select.parentElement.classList.add("error","disabled");
    }
    finally
    {
      this.select.classList.remove("loading");
      this.select.parentElement.classList.remove("loading"); // Semantic UI may have already created a parent div with the loading class
    }
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
        o.style.display = hits.includes(o.resource.uri)?"":"none";
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
        // @ts-ignore
        option.resource = i;
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
      this.select.classList.remove("loading");
      this.select.parentElement.classList.remove("loading"); // Semantic UI may have already created a parent div with the loading class
    }
  }
}

/** @return a new Select filled with the instances of the range of a property.*/
export async function selectPropertyRange(field,property)
{
  return new Select(field,property.label,property.id,(await property.range.getMembers()).values());
}
