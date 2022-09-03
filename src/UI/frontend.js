/* eslint-disable max-len */
/* eslint-disable new-cap */
import {Login} from '../Login/LoginWithWebID';
import {getDataFromReasoning} from '../appReasoning/sayHi';
import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';
import {getIssuerFromWebID, getPodUrlFromWebID} from '../Login/webIDfetch';

/**
 * Sets up the Login UI functionalities.
 */
export function setupLogin() {
  document.getElementById('webid_Login').addEventListener('click', async () => {
    const webID = document.getElementById('webid').value;
    try {
      const oidcIssuer=await getIssuerFromWebID(webID);
      window.sessionStorage.setItem('webID_later', webID);
      window.sessionStorage.setItem('oidcIssuer_later', oidcIssuer);
      console.log(`This is the oidcIssuer:${oidcIssuer}`);
      Login(oidcIssuer);
    } catch (error) {
      document.getElementById('output').textContent=
      'OIDC Issuer not found in webid or invalid webID.'+error;
    }
  } );
}

/**
 * Greets the user on UI with the name.
 * @param {String} name username string of reasoning.
 */
export function greetUser(name) {
  // document.getElementById('output').innerHTML='<h2>'+"Hi "+ dataArray[0]+" "+dataArray[1]+"!"+'</h2>';
  // Temporary with the string needs to revert back to above once sparql is sorted.
  document.getElementById('output').innerHTML='<h2>'+'Hi '+ name+'!'+'</h2>';
  document.getElementById('webid').classList.add('hidden');
  document.getElementById('webid_Login').classList.add('hidden');
}

/**
 * Provides UI for adding name to webid if not present.
 */
export async function addNameToWebID() {
  document.getElementById('Name').classList.remove('hidden');
  document.getElementById('output_name').textContent='Would you like to be called by your name instead!?';
  const input = document.getElementById('Name');
  input.addEventListener('keypress', async function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === 'Enter') {
      // Cancel the default action, if needed
      event.preventDefault();
      const queryExtra= `INSERT DATA {:me <http://xmlns.com/foaf/0.1/name> "${document.getElementById('Name').value}".}`;
      // Send a GET and PUT request to update the source
      const query = queryExtra;
      const responsePut = await solidfetch(window.sessionStorage.getItem('webID_later'), {
        method: 'PATCH',
        headers: {'Content-Type': 'application/sparql-update'},
        body: query,
        credentials: 'include',
      });
      if (responsePut.status>=200&&responsePut.status<=300) {
        console.log(responsePut);
        document.getElementById('Name').classList.add('hidden');
        document.getElementById('output_name').classList.add('hidden');
        const podUrl = await getPodUrlFromWebID(window.sessionStorage.getItem('webID_later'));
        console.log(podUrl);
        const dataArray=await getDataFromReasoning(`${podUrl}private/answer.n3`, window.sessionStorage.getItem('webID_later'));
        console.log(dataArray);
        document.getElementById('output').innerHTML='<h1>'+'Hi '+ dataArray+'!'+'</h1>';
      }
    }
  });
}
