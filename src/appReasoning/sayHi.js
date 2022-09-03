/* eslint-disable max-len */
import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';
import {myfetchFunction} from '../Utilities/customFetch';
const QueryEngine = require('@comunica/query-sparql').QueryEngine;

/**
 * Fetches data from webid
 * @param {String} pathtoanswern3 URL of answer.n3 file in pod.
 * @param {String} webid WebID of the user
 * @return {String} The output name string
 */
export async function getDataFromReasoning(pathtoanswern3, webid) {
  const link=pathtoanswern3.split('answer.n3').shift()+'PreferenceRules.n3';
  const res=await doFetch(link);
  if (res.status>=400||res.status==0) {
    return ', could not fetch your preference rules';
  } else {
    const myEngineGetData = new QueryEngine();
    const bindingsStream = await myEngineGetData.queryBindings(`
    SELECT DISTINCT ?o
    WHERE {
    GRAPH ?g { <${webid}> ?p ?o }
    }`, {
      sources: [`${pathtoanswern3}`],
      fetch: myfetchFunction,
    });
    myEngineGetData.invalidateHttpCache();
    const bindings = await bindingsStream.toArray();
    // If none of the predicates are present, webid will be shown.
    return (!bindings.length)?(webid):(bindings[0].get('o').value);
  }
}

/**
 * A wrapper on solid fetch to get files from pod.
 * @param {String} link Url to fetch.
 * @return {*} response object.
 */
export async function doFetch(link) {
  const response = await solidfetch(link, {
    method: 'GET',
    headers: {'Content-Type': 'text/n3', 'Cache-Control': 'no-cache'},
    credentials: 'include',
  });
  return response;
}


// Alternative solution.
// const check = await myfetchFunction(pathtoanswern3);
// const file = await check.text();
// let output;
// if (file.includes('r:gives {')) {
//   output = file.split('r:gives {').pop().split('}')[0].match(/"((?:\\.|[^"\\])*)"/)[1];
//   // console.log(file.split('r:gives {').pop().split('}')[0].match(/"((?:\\.|[^"\\])*)"/)[1]);
// } else {
//   output =window.sessionStorage.getItem('webID_later');
// }
// return output;
