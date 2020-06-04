/** @module */
import Form from "./form.js";
/*
import * as rdf from "../rdf.js";
const classes = ["http://hitontology.eu/ontology/SoftwareProduct","http://hitontology.eu/ontology/Study",
  "http://hitontology.eu/ontology/FeatureClassified"];
const select = document.createElement("select");
*/
let form = null;

/** Sets the active form class. */
async function setClass(clazz)
{
  if(form) {document.body.removeChild(form);}
  form = new Form(clazz);
  document.body.prepend(form.element);
  await form.init();
}

/** entry point */
async function main()
{
  console.group("Init");
  /*
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
  await setClass(select.value);
  */
  await setClass("http://hitontology.eu/ontology/SoftwareProduct");

  $('.ui.dropdown').dropdown({fullTextSearch: true});
  console.groupEnd();
}

main();
