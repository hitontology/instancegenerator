/** Container with a Form multi select element containing resources and a search function.
@module */

export class Select
{
  /** Create a dropdown menu where the user can select from the given values and filter using a search field.
   * Use Select.select to attach it to the DOM.
  @param {String} placeholder the placeholder when no element is selected
  @param {String} id the id of the select element
  @param {Array} resources the resources to fill in the list
  @param {boolean} multiple Whether to allow multi select. Defaults to true.
  */
  constructor(placeholder,id,resources,multiple=true)
  {
    this.element = document.createElement("select");

    this.element.classList.add("large","ui","fluid","dropdown","search");
    if(multiple)
    {
      this.element.classList.add("multiple");
      this.element.setAttribute("multiple","");
    }
    this.element.id = id;
    const labelOption = document.createElement("option"); // not actually clickable, used by semantic ui as placeholder when no items are selected
    labelOption.innerText = placeholder;
    labelOption.value="";
    this.element.appendChild(labelOption);

    this.options = [];
    for(const r of resources)
    {
      const option = document.createElement("option");
      // @ts-ignore
      option.resource = r;
      this.options.push(option);
      option.value = r.uri;
      option.innerText = r.label();
    }
    this.options.sort((a,b)=>a.innerText.localeCompare(b.innerText));
    this.element.append(...this.options);
    //this.element.parentElement.classList.add("error","disabled");
    //this.element.classList.remove("loading");
    //this.element.parentElement.classList.remove("loading"); // Semantic UI may have already created a parent div with the loading class
  }
}

/** @return a new Select filled with the instances of the range of a property.*/
export async function selectPropertyRange(field,property)
{
  const select = new Select(property.range.label(),property.uri,(await property.range.getMembers()).values());
  property.selected = () => select.options.filter(o => o.selected).map(o => o.value);
  return select;
}
