/** Container with a Form select element containing instances and a search function.
 @module */

export default class Select
{
  /** Create a container where the user can select from the given values and a search field and attach it to the given parent.*/
  constructor(parent,property)
  {
    const container  = document.createElement("div");
    parent.appendChild(container);
    const select = document.createElement("select");
    container.appendChild(select);
    select.style.display="block";
    select.classList.add("large");
    select.name = property.uri;
    select.id = property.uri;
    select.setAttribute("multiple","");
    for(const i of property.instances)
    {
      const option = document.createElement("option");
      select.appendChild(option);
      option.value = i.uri;
      option.innerText = i.label;
    }
    property.selected = () => [...select.options].filter(o => o.selected).map(o => o.value);
  }
}
