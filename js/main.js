/** @module */
import Form from "./form.js";
import * as rdf from "./rdf.js";

const classes = ["http://hitontology.eu/ontology/SoftwareProduct","http://hitontology.eu/ontology/Study",
  "http://hitontology.eu/ontology/FeatureClassified"];
const select = document.createElement("select");

let activeForm;

/** Sets the active form class. */
function setClass(clazz)
{
  if(activeForm) {activeForm.unregister();}
  {activeForm = new Form(clazz);}
}

select.addEventListener("change", (event)=>
{
  setClass(event.target.value);
});
document.body.appendChild(select);
for(const clazz of classes)
{
  const option = document.createElement("option");
  select.appendChild(option);
  option.value = clazz;
  option.innerText = rdf.short(clazz);
}
setClass(select.value);

//document.addEventListener("DOMContentLoaded",form.init);
//document.addEventListener("submit",form.submit);
