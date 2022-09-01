import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';

/**
 * custom fetch wrapper on solidfetch.
 * @param {String} url URL to fecth resource from.
 * @return {String} the response of fetch
 */
export async function myfetchFunction(url) {
  return await solidfetch(url, {
    method: 'GET',
    headers: {'Content-Type': 'application/sparql-update',
      'Cache-Control': 'no-cache'},
  });
}
