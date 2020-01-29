/** @module */
import Form from "./form.js";

const form = new Form("hito:SoftwareProduct");

//document.addEventListener("DOMContentLoaded",form.init);
document.addEventListener("submit",form.submit);
