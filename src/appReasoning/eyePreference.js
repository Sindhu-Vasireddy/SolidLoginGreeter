/* eslint-disable max-len */
import {myfetchFunction} from '../Utilities/customFetch';
// const QueryEngine = require('@comunica/query-sparql-file').QueryEngine;

// TODO: Find the sparql query executer for n3
// let pathtoanswern3= "https://svasired.pod.knows.idlab.ugent.be/private/answer.n3";
/**
 * Fetches data from webid
 * @param {String} pathtoanswern3 URL of answer.n3 file in pod.
 * @param {String} webid WebID of the user
 * @return {String} The output name string
 */
export async function getDataFromReasoning(pathtoanswern3, webid) {
  // var myEngine_getData = new QueryEngine();
  // const bindingsStream = await myEngine_getData.queryBindings(`
  // SELECT DISTINCT ?o
  // WHERE {
  // GRAPH ?g { <${webid}> ?p ?o }
  // }`, {
  //   sources: [`${pathtoanswern3}`],
  //   fetch: myfetchFunction,
  // });
  // myEngine_getData.invalidateHttpCache();
  // const bindings = await bindingsStream.toArray();
  // if(bindings.length==0){
  // //If none of the predicates are present, webid will be shown.
  //   return([webid,'']) }
  // else{
  //   return([bindings[0].get('o').value,""]);
  // }
  // Temporary with the string needs to revert back to above once sparql is sorted.
  const check = await myfetchFunction(pathtoanswern3);
  const file = await check.text();
  let output;
  if (file.includes('r:gives {')) {
    output = file.split('r:gives {').pop().split('}')[0].match(/"((?:\\.|[^"\\])*)"/)[1];
    // console.log(file.split('r:gives {').pop().split('}')[0].match(/"((?:\\.|[^"\\])*)"/)[1]);
  } else {
    output =window.sessionStorage.getItem('webID_later');
  }

  return output;
}
