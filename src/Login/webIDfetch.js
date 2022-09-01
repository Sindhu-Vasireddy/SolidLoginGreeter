import {myfetchFunction} from '../Utilities/customFetch';
const QueryEngine = require('@comunica/query-sparql-file').QueryEngine;

/**
 * Fetches Issuer from webid.
 * @param {String} webid WebID of the user.
 * @return {String} solid:OidcIssuer from webid.
 */
export async function getIssuerFromWebID(webid) {
  const myEngineGetIssuer = new QueryEngine();
  const bindingsStream = await myEngineGetIssuer.queryBindings(`
    SELECT ?o WHERE {
     <${webid}> <http://www.w3.org/ns/solid/terms#oidcIssuer> ?o.
    }`, {
    sources: [`${webid}`],
    fetch: myfetchFunction,
  });
  myEngineGetIssuer.invalidateHttpCache();
  const bindings = await bindingsStream.toArray();
  return (bindings[0].get('o').value);
}

/**
 * Fetches podUrl from webid.
 * @param {String} webid WebID of the user.
 * @return {String} podUrl location from webid.
 */
export async function getPodUrlFromWebID(webid) {
  const myEngineGetPodUrl = new QueryEngine();
  const bindingsStream = await myEngineGetPodUrl.queryBindings(`
    SELECT ?o WHERE {
     <${webid}> <http://www.w3.org/ns/pim/space#storage> ?o.
    }`, {
    sources: [`${webid}`],
    fetch: myfetchFunction,
  });
  myEngineGetPodUrl.invalidateHttpCache();
  const bindings = await bindingsStream.toArray();
  // eslint-disable-next-line max-len

  // eslint-disable-next-line max-len
  const podUrl = (!bindings.length) ? window.sessionStorage.getItem('oidcIssuer_later') : (bindings[0].get('o').value);
  return podUrl.endsWith('/') ? podUrl : podUrl+'/';
}
