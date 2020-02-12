/** Container with a Form select element containing instances and a search function.
 @module */
const SEARCH = false;

export default class Select
{
  /** Create a container where the user can select from the given values and a search field and attach it to the given parent.*/
  constructor(parent,property)
  {
    //const container = document.createElement("div");
    //container.classList.add("field");
    // parent.appendChild(container);
    const container = parent;
    const select = document.createElement("select");
    container.append(select);
    //select.style.display="block";
    select.classList.add("large");
    select.classList.add("ui","fluid","dropdown","selection","multiple");
    select.name = property.uri;
    select.id = property.uri;
    select.setAttribute("multiple","");
    const options = [];
    for(const i of property.range.instances)
    {
      const option = document.createElement("option");
      option.instance = i;
      options.push(option);
      select.appendChild(option);
      option.value = i.uri;
      option.innerText = i.label();
    }
    property.selected = () => [...select.options].filter(o => o.selected).map(o => o.value);
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
        const hits = property.range.search(input.value);
        for(const o of options)
        {
          o.style.display = hits.includes(o.instance.uri)?"":"none";
        }
      });
      container.append(input);
    }
  }
}
