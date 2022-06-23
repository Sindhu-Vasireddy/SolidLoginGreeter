
import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
} from "@inrupt/solid-client-authn-browser";

import {fetch as solidfetch} from "@inrupt/solid-client-authn-browser";
const QueryEngine = require('@comunica/query-sparql').QueryEngine;


async function Login(Issuer) {
    if (Issuer) {
       if (!getDefaultSession().info.isLoggedIn) {
            await login({
            oidcIssuer:Issuer,
            redirectUrl: window.location.href,
            clientName:"LocationHistory"
          });
         }

    }
    //OIDC error message 
}


async function handleRedirectAfterLogin() {
       await handleIncomingRedirect();
              
       if(getDefaultSession().info.isLoggedIn){
            let data_array=await getDataFromWebID(window.sessionStorage.getItem('webID_later'));
            document.getElementById('webid_Login').classList.add("hidden");
            document.getElementById('webid').classList.add("hidden");
            document.getElementById('output').textContent="Hi "+ data_array[0]+" "+data_array[1];

         
        }
}

handleRedirectAfterLogin();

document.getElementById('webid_Login').addEventListener('click', async () => { let webID = document.getElementById('webid').value; /*console.log(webID);*/
    try{let oidcIssuer=await getIssuerFromWebID(webID);window.sessionStorage.setItem('webID_later',webID);window.sessionStorage.setItem('oidcIssuer_later',oidcIssuer);console.log(`This is the oidcIssuer:${oidcIssuer}`); Login(oidcIssuer);}
  catch(error){
    document.getElementById('output').textContent="OIDC Issuer not found in webid or invalid webID."+error;
  }} );

async function getIssuerFromWebID(webid){
  var myEngine_getIssuer = new QueryEngine();

  const bindingsStream = await myEngine_getIssuer.queryBindings(`
  SELECT ?o WHERE {
   ?s <http://www.w3.org/ns/solid/terms#oidcIssuer> ?o.
  }`, {
    sources: [`${webid}`],
  });
  const bindings = await bindingsStream.toArray();
  // console.log(`${bindings[0].get('o').value}`);
  return(bindings[0].get('o').value); 
  
}

async function getDataFromWebID(webid){
  var myEngine_getData = new QueryEngine();
  const bindingsStream = await myEngine_getData.queryBindings(`
  SELECT ?familyName ?givenName WHERE {
   ?s <http://xmlns.com/foaf/0.1/familyName> ?familyName;
  <http://xmlns.com/foaf/0.1/givenName> ?givenName.
  }`, {
    sources: [`${webid}`],
  });
    const bindings = await bindingsStream.toArray();
     if(bindings.length==0){ //When the foaf:givenName and foaf:FamilyName is absent webid will be shown
        return([webid,'']) }
     else{
            return([bindings[0].get('givenName').value,bindings[0].get('familyName').value]);
         }
}
