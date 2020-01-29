/**
Functions for querying the HITO SPARQL endpoint.
@module */

const HITO_GRAPH = "http://hitontology.eu/ontology";
const HITO_ENDPOINT = "https://hitontology.eu/sparql";

export const DBPEDIA_GRAPH = "http://dbpedia.org";
export const DBPEDIA_ENDPOINT = "http://dbpedia.org/sparql";

/** Query public SNIK SPARQL endpoint with a SELECT query.
ASK queries should also work but better use {@link ask} instead as it is more convenient.
{@param query} A valid SPARQL query.
{@param graph} An optional SPARQL graph. By default, HITO is used.
{@param endpoint} An optional SPARQL endpoint. By default, HITO is used.
@return {Promise<object[]>} A promise of a set of SPARQL select result bindings.
*/
export async function select(query,graph=HITO_GRAPH, endpoint=HITO_ENDPOINT)
{
  let url = endpoint + '?query=' + encodeURIComponent(query) + '&format=json';
  if(graph) {url+= '&default-graph-uri=' + encodeURIComponent(graph);}
  try
  {
    const response = await fetch(url);
    const json = await response.json();
    const bindings = json.results.bindings;

    console.groupCollapsed("SPARQL "+query.split('\n',1)[0]+"...");
    if(bindings.length<100)
    {
      console.table(bindings.map(b=>Object.keys(b).reduce((result,key)=>{result[key]=b[key].value;return result;},{})));
    }
    console.log(query);
    console.log(url);
    console.groupEnd();

    return bindings;
  }
  catch(err)
  {
    console.error(err);
    console.error(`Error executing SPARQL query:\n${query}\nURL: ${url}\n\n`);
    return [];
  }
}
