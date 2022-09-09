/* eslint-disable max-len */
import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
} from '@inrupt/solid-client-authn-browser';
import {getPreferredName} from '../appReasoning/fetchAnswer';
import {getDataFromReasoning} from '../appReasoning/sayHi';
import {greetUser} from '../UI/frontend';
import {getPodUrlFromWebID} from './webIDfetch';
import {addNameToWebID} from '../UI/frontend';

/**
 * Logs the user to app.
 * @param {String} Issuer OidcIssuer.
 */
export async function Login(Issuer) {
  if (Issuer) {
    if (!getDefaultSession().info.isLoggedIn) {
      await login({
        oidcIssuer: Issuer,
        redirectUrl: window.location.href,
        clientName: 'SolidLoginGreeter',
      });
    }
  }
  // OIDC error message
}

/**
 * Handles redirect from pod provider.
 */
export async function handleRedirectAfterLogin() {
  await handleIncomingRedirect();

  if (getDefaultSession().info.isLoggedIn) {
    const podUrl = await getPodUrlFromWebID(
        window.sessionStorage.getItem('webID_later'));
    await getPreferredName(window.sessionStorage.getItem('webID_later'), podUrl);
    const dataArray=await getDataFromReasoning(`${podUrl}private/answer.n3`,
        window.sessionStorage.getItem('webID_later'));
    console.log('String output', dataArray);
    if (dataArray==window.sessionStorage.getItem('webID_later')) {
      console.log(window.sessionStorage.getItem('webID_later'));
      addNameToWebID();
    }
    greetUser(dataArray);
  }
}
