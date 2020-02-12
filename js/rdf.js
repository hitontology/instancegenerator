/**
RDF helper functions.
@module */
/** Order important! substrings of other prefixes must come later. */
const prefixes =
[
  ["owl","http://www.w3.org/2002/07/owl#"],
  ["rdfs","http://www.w3.org/2000/01/rdf-schema#"],
  ["rdf","http://www.w3.org/1999/02/22-rdf-syntax-ns#"],
  ["hito","http://hitontology.eu/ontology/"],
  ["dbr","http://dbpedia.org/resource/"],
];

/**@return {String} the prefix part of a URI if it is defined in this file.*/
export function longPrefix(uri)
{
  for(const prefix of prefixes) {if(uri.startsWith(prefix[1])) {return prefix[1].replace(/\/$/,'');}}
  return uri;
}

/** Shortens a URI if possible using SNIK prefixes defined in this file.
* @param  {String} uri a URI, for example "http://www.snik.eu/ontology/meta/Function".
* @return {String} the shortened URI, for example "meta:Function". If no prefix applies, return the input as is.
*/
export function short(uri)
{
  for(const prefix of prefixes) {uri=uri.replace(prefix[1],prefix[0]+":");}
  return uri;
}

/** Restores a URI if possible that is shortened using a SNIK prefix to its usual form using prefixes defined in this file.
* @param  {String} uri a prefixed URI, for example "meta:Function".
* @return {String} the restored URI, for example "http://www.snik.eu/ontology/meta/Function".  If no prefix applies, return the input as is.
*/
export function long(uri)
{
  for(const prefix of prefixes) {uri=uri.replace(prefix[0]+":",prefix[1]);}
  return uri;
}

/** Returns the URI part after the prefix. */
export function suffix(uri)
{
  return uri.replace(/.*[#/]/,"");
}

/** Human readable suffix. Example: ".../ProgrammingLanguage12345" -> "Programming Language" */
export function niceSuffix(uri)
{
  return suffix(uri)
    .replace(/[0-9]/g,"") // remove yago class numbers
    .replace(/([A-Z])/g, ' $1').trim(); // camel case to space
}
