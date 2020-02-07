/** @module */
import * as rdf from '../js/rdf.js';

const propertyBenchmark =
[
  {
    class: "hito:FeatureClassified",
    graph: "http://hitontology.eu/ontology",
    endpoint: "https://hitontology.eu/sparql",
    instances: ["hito:AccessByClientToOwnMedicalRecords"],
  },
  {
    class: "hito:EnterpriseFunctionClassified",
    graph: "http://hitontology.eu/ontology",
    endpoint: "https://hitontology.eu/sparql",
    instances: ["hito:FacilityManagement"],
  },
  {
    class: "hito:UserGroupClassified",
    graph: "http://hitontology.eu/ontology",
    endpoint: "https://hitontology.eu/sparql",
    instances: ["hito:Pharmacist_occupation"],
  },
  {
    class: "http://dbpedia.org/class/yago/OperatingSystem106568134",
    graph: "http://dbpedia.org",
    endpoint: "https://dbpedia.org/sparql",
    instances: ["http://dbpedia.org/resource/Windows_95"],
  },
  {
    class: "hito:OrganizationalUnitClassified",
    graph: "http://hitontology.eu/ontology",
    endpoint: "https://hitontology.eu/sparql",
    instances: ["hito:Care_of_the_elderly_department_environment"],
  },
  {
    class: "hito:DatabaseSystem",
    graph: "http://hitontology.eu/ontology",
    endpoint: "https://hitontology.eu/sparql",
    instances: ["hito:MySql"],
  },

];

for(const entry of propertyBenchmark)
{
  entry.class = rdf.long(entry.class);
  for(const x in entry.instances) {entry.instances[x]=rdf.long(entry.instances[x]);}
}

export default propertyBenchmark;
