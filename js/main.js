/** @module */
import Form from "./form.js";
import * as rdf from "./rdf.js";

const classes = ["http://hitontology.eu/ontology/SoftwareProduct","http://hitontology.eu/ontology/Study"];

const select = document.createElement("select");
document.body.appendChild(select);
for(const clazz of classes)
{
  const option = document.createElement("option");
  select.appendChild(option);
  option.value = clazz;
  option.innerText = rdf.short(clazz);
}
select.addEventListener("change", new Form(clazz);


//document.addEventListener("DOMContentLoaded",form.init);
//document.addEventListener("submit",form.submit);
