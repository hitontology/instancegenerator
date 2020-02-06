/** @module */
import * as rdf from '../js/rdf.js';

const benchmark =
[
  {
    class: "hito:FeatureClassified",
    graph: "http://hitontology.eu/ontology",
    endpoint: "https://hitontology.eu/sparql",
    instance: "hito:AccessByClientToOwnMedicalRecords",
    queries: ["Access by client to own medical records", "Access by client", "Aces by client to medical record"],
  },
/*["hito:FunctionClassified",""],
["hito:UserGroupClassified",""],
["hito:EnterpriseFunctionClassified",""],
["hito:OrganizationalUnitClassified",""]]*/
];

for(const entry of benchmark)
{
  entry.class = rdf.long(entry.class);
  entry.instance = rdf.long(entry.instance);
}

export default benchmark;
