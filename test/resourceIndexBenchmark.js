/** @module */
import * as rdf from '../js/rdf.js';

const benchmark =
[
  {
    class: "hito:DatabaseSystem",
    instance: "hito:MySql",
    queries: ["MySql", "MySQL", "mysql", "sql", "SQL"],
  },
  {
    class: "hito:FeatureClassified",
    instance: "hito:AccessByClientToOwnMedicalRecords",
    queries: ["Access by client to own medical records", "Access by client", "Aces by client to medical record"],
  },
  {
    class: "hito:OrganizationalUnitClassified",
    instance: "hito:Care_of_the_elderly_department_environment",
    queries: ["Care_of_the_elderly_department_environment", "Care of the elderly department environment", "Care of the elderly", "department environment", "elderly department", "care the elderly department"],
  },
  {
    class: "http://dbpedia.org/class/yago/WikicatProgrammingLanguages",
    instance: "http://dbpedia.org/resource/Python_(programming_language)",
    queries: ["Python", "python", "py", "Pithon"],
  },
  {
    class: "http://dbpedia.org/class/yago/License106549661",
    instance: "http://dbpedia.org/resource/Apple_Public_Source_License",
    queries: ["Apple_Public_Source_License", "Apple Public Source License", "Public Source License", "Apple License"],
  },
  {
    class: "http://dbpedia.org/class/yago/OperatingSystem106568134",
    instance: "http://dbpedia.org/resource/Windows_95",
    queries: ["Windows 95", "Windows", "Win", "Win 95", "Wimdows 95", "Microsoft Windows 95"],
  },
  {
    class: "hito:SoftwareProduct",
    instance: "hito:Medicator",
    queries: ["Medicator", "medicator", "Mediator", "Medcator"],
  },
  {
    class: "hito:EnterpriseFunctionClassified",
    instance: "hito:FacilityManagement",
    queries: ["Facility Management", "FacilityManagement", "facility management", "facility", "management", "Facilty Managemen", "facilityMangement"],
  },
  {
    class: "hito:UserGroupClassified",
    instance: "hito:Pharmacist_occupation",
    queries: ["Pharmacist occupation", "Pharmacist", "occupation", "Pharmcist ocupation"],
  },

];

for(const entry of benchmark)
{
  entry.class = rdf.long(entry.class);
  entry.instance = rdf.long(entry.instance);
}

export default benchmark;
