/** @module */
import Form from "./form.js";

const form = new Form("http://hitontology.eu/ontology/SoftwareProduct");

//document.addEventListener("DOMContentLoaded",form.init);
document.addEventListener("submit",form.submit);
