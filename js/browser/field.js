/** @module
Form field. */

/** Create a Semantic UI form field element.
@param {string} description text of the field label
@param {HTMLElement} ele the element that will be placed inside the field.*/
export default function field(description,ele)
{
  const f = document.createElement("div");
  //f.classList.add("field");

  const label = document.createElement("label");
  if(ele.id) {label.htmlFor = ele.id;}
  label.innerText = description;

  f.append(label,ele);

  return f;
}
