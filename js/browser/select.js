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
    select.style.display="block";
    select.classList.add("large");
    select.name = property.uri;
    select.id = property.uri;
    select.setAttribute("multiple","");
    const options = [];

    for(const i of property.instances)
    {
      const option = document.createElement("option");
      options.push(option);
      select.appendChild(option);
      option.value = i.uri;
      option.innerText = i.label;
    }
    property.selected = () => [...select.options].filter(o => o.selected).map(o => o.value);
    const input = document.createElement("input");
    input.addEventListener("change",()=>
    {
      if(input.value==="")
      {
        for(const o of options) {o.style.display="";}
        return;
      }
      for(const o of options)
      {
        o.style.display="none";
      }
    });
    container.append(input,select);
  }
}
