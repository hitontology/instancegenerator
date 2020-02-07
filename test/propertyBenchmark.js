/** @module */
import * as rdf from '../js/rdf.js';

const propertyBenchmark =
{
  "http://hitontology.eu/ontology/FeatureClassified":
  {
    graph: "http://hitontology.eu/ontology",
    endpoint: "https://hitontology.eu/sparql",
    instances: ["hito:AccessByClientToOwnMedicalRecords"],
  },
  "http://hitontology.eu/ontology/EnterpriseFunctionClassified":
  {
    graph: "http://hitontology.eu/ontology",
    endpoint: "https://hitontology.eu/sparql",
    instances: ["hito:FacilityManagement"],
  },
  "http://hitontology.eu/ontology/UserGroupClassified":
{
  graph: "http://hitontology.eu/ontology",
  endpoint: "https://hitontology.eu/sparql",
  instances: ["hito:Pharmacist_occupation"],
},
  "http://dbpedia.org/class/yago/OperatingSystem106568134":
{
  graph: "http://dbpedia.org",
  endpoint: "https://dbpedia.org/sparql",
  instances: ["dbr:Windows_95"],
},
  "http://hitontology.eu/ontology/OrganizationalUnitClassified":
{
  graph: "http://hitontology.eu/ontology",
  endpoint: "https://hitontology.eu/sparql",
  instances: ["hito:Care_of_the_elderly_department_environment"],
},
  "http://hitontology.eu/ontology/DatabaseSystem":
{
  graph: "http://hitontology.eu/ontology",
  endpoint: "https://hitontology.eu/sparql",
  instances: ["hito:MySql"],
},
};

for(const x in propertyBenchmark)
{
  propertyBenchmark[x].instances=propertyBenchmark[x].instances.map(i=>rdf.long(i));
}

export default propertyBenchmark;
