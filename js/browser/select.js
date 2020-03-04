/** Container with a Form multi select element containing resources and a search function.
@module */

class Select
{
  /** Add a dropdown menu to the given field where the user can this.select from the given values and a search field and attach it to the given field.
  @param {HTMLElement} field the container to append this element to. Should have class "field".
  @param {String} label the label of the select element
  @param {String} id the id of the select element
  @param {Array} resources the resources to fill in the list
  */
  constructor(field,label,placeholder,id,resources)
  {
    //const container = document.createElement("div");
    //container.classList.add("field");
    this.field = field;

    this.select = document.createElement("select");
    this.field.append(this.select);
    this.select.classList.add("large","ui","fluid","dropdown","multiple","search","loading");
    this.select.id = id;
    this.select.setAttribute("multiple","");
    const labelOption = document.createElement("option"); // not actually clickable, used by semantic ui as placeholder when no items are selected
    labelOption.innerText = placeholder;
    labelOption.value="";
    this.select.appendChild(labelOption);

    this.options = [];
    try
    {
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
      this.select.append(...this.options);
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
  const select = new Select(field,property.label,property.range.label(),property.id,(await property.range.getMembers()).values());
  property.selected = () => select.options.filter(o => o.selected).map(o => o.value);
  return select;
}
