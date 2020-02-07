/** @module */
import * as rdf from '../js/rdf.js';

const propertyBenchmark =
{
  "http://hitontology.eu/ontology/FeatureClassified":
  {
    graph: "http://hitontology.eu/ontology",
    endpoint: "https://hitontology.eu/sparql",
    instances: ["hito:AccessByClientToOwnMedicalRecords", "hito:CertifyDeathEvent", "hito:ClassifyDiseaseCodesOrCauseOfMortality"],
  },
  "http://hitontology.eu/ontology/EnterpriseFunctionClassified":
  {
    graph: "http://hitontology.eu/ontology",
    endpoint: "https://hitontology.eu/sparql",
    instances: ["hito:FacilityManagement", "hito:ClientHealthRecords", "hito:HealthcareProviderDecisionSupport"],
  },
  "http://hitontology.eu/ontology/UserGroupClassified":
{
  graph: "http://hitontology.eu/ontology",
  endpoint: "https://hitontology.eu/sparql",
  instances: ["hito:Pharmacist_occupation", "hito:Physician_occupation", "hito:Administrative_healthcare_staff_occupation"],
},
  "http://dbpedia.org/class/yago/OperatingSystem106568134":
{
  graph: "http://dbpedia.org",
  endpoint: "https://dbpedia.org/sparql",
  instances: ["dbr:Windows_95", "dbr:Virtual_machine", "dbr:Linux"],
},
  "http://hitontology.eu/ontology/OrganizationalUnitClassified":
{
  graph: "http://hitontology.eu/ontology",
  endpoint: "https://hitontology.eu/sparql",
  instances: ["hito:Care_of_the_elderly_department_environment", "hito:Dermatology_department_environment", "hito:Gastroenterology_department_environment"],
},
  "http://hitontology.eu/ontology/DatabaseSystem":
{
  graph: "http://hitontology.eu/ontology",
  endpoint: "https://hitontology.eu/sparql",
  instances: ["hito:MySql", "hito:ProsgreSql"],
},
};

for(const x in propertyBenchmark)
{
  propertyBenchmark[x].instances=propertyBenchmark[x].instances.map(i=>rdf.long(i));
}

export default propertyBenchmark;
