/** @module */
/* eslint max-len: off */
import * as rdf from '../js/rdf.js';

const classBenchmark =
{
  "http://hitontology.eu/ontology/FeatureClassified":
  {
    instances: ["hito:AccessByClientToOwnMedicalRecords","hito:ActiveDataCapturedocumentationByClient","hito:AssessCapacityOfHealthcareProvider","hito:AssessHealthFacilities","hito:AutomatedAnalysisOfDataToGenerateNewInformationOrPredictionsOnFutureEvents","hito:CaptureFromDigitalDevices","hito:CertifyBirthEvent","hito:CertifyDeathEvent","hito:CitizenBasedReporting","hito:ClassifyDiseaseCodesOrCauseOfMortality","hito:ClientFinancialTransactions","hito:ClientLookupOfHealthInformation","hito:ClientToClientCommunication","hito:CommunicationAndPerformanceFeedbackToHealthcareProviders","hito:CommunicationFromHealthcareProvidersToSupervisor","hito:ConsultationsBetweenRemoteClientAndHealthcareProvider","hito:ConsultationsForCaseManagementBetweenHealthcareProviders","hito:CoordinateEmergencyResponseAndTransport","hito:DataCoding","hito:DataCollectionManagementAndUse","hito:DataExchangeAcrossSystems","hito:DataExchangeAndInteroperability","hito:DataStorageAndAggregation","hito:DataSynthesisAndVisualization","hito:EnrolClientForHealthServicesclinicalCarePlan","hito:IdentifyClientsInNeedOfServices","hito:ListHealthFacilitiesAndRelatedInformation","hito:ListHealthWorkforceCadresAndRelatedIdentificationInformation","hito:LocationMapping","hito:LongitudinalTrackingOfClientsHealthStatusAndServices","hito:ManageBudgetAndExpenditures","hito:ManageCertificationregistrationOfHealthcareProviders","hito:ManageClientsStructuredClinicalRecords","hito:ManageClientsUnstructuredClinicalRecords","hito:ManageInventoryAndDistributionOfHealthCommoditiesStockLevelsOf","hito:ManageOfCommodities","hito:ManageReferralsBetweenHealthAndOtherSectors","hito:ManageReferralsBetweenPointsOfServiceWithinHealthSector","hito:MapLocationOfClientsAndHouseholds","hito:MapLocationOfHealthEvents","hito:MapLocationOfHealthFacilitiesstructures"],
  },
  "http://hitontology.eu/ontology/EnterpriseFunctionClassified":
  {
    instances: ["hito:CivilRegistrationAndVitalStatistic","hito:ClientHealthRecords","hito:ClientIdentificationAndRegistration","hito:EquipmentAndAssetManagement","hito:FacilityManagement","hito:HealthFinancing","hito:HealthWorkerActivityPlanningAndScheduling","hito:HealthcareProviderCommunication","hito:HealthcareProviderDecisionSupport","hito:HealthcareProviderTraining","hito:HumanResourceManagement"],
  },
  "http://hitontology.eu/ontology/UserGroupClassified":
{
  instances: ["hito:Administrative_healthcare_staff_occupation","hito:Clerical_occupation_occupation","hito:Clerk_occupation","hito:Laboratory_technician_occupation","hito:Medical_technician_occupation","hito:Pharmacist_occupation","hito:Physician_occupation","hito:Professional_nurse_occupation","hito:Radiologist_occupation","hito:Surgeon_occupation","hito:Woman_person"],
},
  "http://dbpedia.org/class/yago/OperatingSystem106568134":
{
  instances: ["dbr:Windows_95","dbr:Windows_2000","dbr:MS-DOS","dbr:OS_X","dbr:Virtual_machine", "dbr:Linux"],
},
  "http://hitontology.eu/ontology/OrganizationalUnitClassified":
{
  instances: ["hito:Accident_and_Emergency_department_environment","hito:Cardiology_department_environment","hito:Care_of_the_elderly_department_environment","hito:Dermatology_department_environment","hito:Endocrinology_department_environment","hito:Gastroenterology_department_environment","hito:General_medical_department_environment","hito:Gynecology_department_environment","hito:Hospital_environment","hito:Infectious_diseases_department_environment","hito:Intensive_care_unit_environment","hito:Laboratory_environment","hito:Neonatal_intensive_care_unit_environment","hito:Nephrology_department_environment","hito:Orthopedic_department_environment","hito:Pediatric_department_environment","hito:Pediatric_intensive_care_unit_environment","hito:Psychiatry_department_environment","hito:Radiology_department_environment","hito:Rheumatology_department_environment","hito:Surgical_department_environment","hito:Genetics_department_environment","hito:Medical_center_environment"],
},
  "http://hitontology.eu/ontology/DatabaseSystem":
{
  instances: ["hito:MySql","hito:PostgreSql"],
},
};

for(const x in classBenchmark)
{
  classBenchmark[x].instances=classBenchmark[x].instances.map(i=>rdf.long(i));
}

export default classBenchmark;
