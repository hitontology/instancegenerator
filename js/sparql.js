/**
Functions for querying the HITO SPARQL endpoint.
@module */

const HITO_GRAPH = "http://hitontology.eu/ontology";
const HITO_ENDPOINT = "https://hitontology.eu/sparql";

const DBPEDIA_GRAPH = "http://dbpedia.org";
const DBPEDIA_ENDPOINT = "https://dbpedia.org/sparql";

// DBpedia is down or slow sometimes, a mirror could help
export const DBPEDIA = {graph: DBPEDIA_GRAPH,endpoint: DBPEDIA_ENDPOINT, name: "DBpedia"};
export const HITO = {graph: HITO_GRAPH,endpoint: HITO_ENDPOINT, name: "HITO"};

const LOG = false;

class SparqlError extends Error
{
  /** Wrapper for Sparql related errors */
  constructor(query, url, cause)
  {
    super(cause.message+`\n${query}\nURL, ${url}`);
    console.groupCollapsed("Error executing SPARQL query");
    console.error(this);
    console.groupEnd();
    this.cause = cause;
    this.name = "SparqlError";
  }
}
/** Query public SNIK SPARQL endpoint with a SELECT query.
ASK queries should also work but better use {@link ask} instead as it is more convenient.
{@param query} A valid SPARQL query.
{@param graph} An optional SPARQL graph. By default, HITO is used.
{@param endpoint} An optional SPARQL endpoint. By default, HITO is used.
@return {Promise<object[]>} A promise of a set of SPARQL select result bindings.
*/
export async function select(query,source=HITO, debugMessage)
{
  let url = source.endpoint + '?query=' + encodeURIComponent(query) + '&format=json';
  if(source.graph) {url+= '&default-graph-uri=' + encodeURIComponent(source.graph);}
  try
  {
    const response = await fetch(url, {cache: "force-cache"});
    const json = await response.json();
    const bindings = json.results.bindings;

    if(!debugMessage) {debugMessage = query.split('\n',1)[0]+"...";}
    if(LOG)
    {
      {console.groupCollapsed(`SPARQL ${debugMessage}: ${bindings.length} results`);}
      console.log(source.graph,source.endpoint,"\n",query);
      console.table(bindings.slice(0,5).map(b=>Object.keys(b).reduce((result,key)=>{result[key]=b[key].value;return result;},{})));
      //console.log(url);
      console.groupEnd();
    }
    return bindings;
  }
  catch(err)
  {
    //console.error(err);
    //console.error(`Error executing SPARQL query:\n${query}\nURL: ${url}\n\n`);
    //return [];
    throw new SparqlError(query,url,err);
  }
}

/** reduces the {type,value} object to just the value for each binding attribute */
export function flat(bindings)
{
  return bindings.map(b=>Object.keys(b).reduce((result,key)=>{result[key]=b[key].value;return result;},{}));
}
