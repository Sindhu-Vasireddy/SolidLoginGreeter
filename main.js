
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
            console.log("I'm inside!!!!");
            let data_array=await getDataFromWebID(window.sessionStorage.getItem('webID_later'));

            if(data_array[0]==window.sessionStorage.getItem('webID_later')){
                document.getElementById('Name').classList.remove("hidden")
                document.getElementById('output_name').textContent="Would you like to be called by your name instead!?";
                // Get the input field
                var input = document.getElementById("Name");

                // Execute a function when the user presses a key on the keyboard
                input.addEventListener("keypress", async function(event) {
                  // If the user presses the "Enter" key on the keyboard
                  if (event.key === "Enter") {
                    // Cancel the default action, if needed
                    event.preventDefault();

                    const query_extra= `INSERT DATA {:me <http://xmlns.com/foaf/0.1/Name> "${document.getElementById('Name').value}".}`;
                
                    // Send a GET and PUT request to update the source
                    const query = query_extra;
                    const response_put = await solidfetch(window.sessionStorage.getItem('webID_later'), {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/sparql-update' },
                    body: query,
                    credentials:'include'
                    });
                     if(response_put.status>=200&&response_put.status<=300){
                        document.getElementById('Name').classList.add("hidden");
                        document.getElementById('output_name').classList.add("hidden");

                        let data_array=await getDataFromWebID(window.sessionStorage.getItem('webID_later'));
                        console.log(data_array);   
                        document.getElementById('output').textContent="Hi "+ data_array[0]+" "+data_array[1]+"!";                     
                    }
                }
                  

                });



            
        }


            document.getElementById('output').textContent="Hi "+ data_array[0]+" "+data_array[1]+"!";
            document.getElementById('webid').classList.add("hidden");

            document.getElementById('webid_Login').classList.add("hidden");
       
        }
}

handleRedirectAfterLogin();

document.getElementById('webid_Login').addEventListener('click', async () => { let webID = document.getElementById('webid').value; /*console.log(webID);*/
    try{let oidcIssuer=await getIssuerFromWebID(webID);window.sessionStorage.setItem('webID_later',webID);window.sessionStorage.setItem('oidcIssuer_later',oidcIssuer);console.log(`This is the oidcIssuer:${oidcIssuer}`); Login(oidcIssuer);}
  catch(error){
    document.getElementById('output').textContent="OIDC Issuer not found in webid or invalid webID."+error;
  }} );

async function myfetchFunction(url){
  return await solidfetch(url, {
       method: 'GET',
       headers: { 'Content-Type': 'application/sparql-update','Cache-Control': 'no-cache' },
       credentials: 'include'
        });
}

async function getIssuerFromWebID(webid){
  var myEngine_getIssuer = new QueryEngine();

  const bindingsStream = await myEngine_getIssuer.queryBindings(`
  SELECT ?o WHERE {
   ?s <http://www.w3.org/ns/solid/terms#oidcIssuer> ?o.
  }`, {
    sources: [`${webid}`],
    fetch: myfetchFunction,
  });
  myEngine_getIssuer.invalidateHttpCache();
  const bindings = await bindingsStream.toArray();
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
    fetch: myfetchFunction,
  });
  myEngine_getData.invalidateHttpCache();
    const bindings = await bindingsStream.toArray();
     if(bindings.length==0){ //When the foaf:givenName and foaf:FamilyName is absent but foaf:name is present
          var myEngine_getData_ = new QueryEngine();
          const bindingsStream_ = await myEngine_getData_.queryBindings(`
          SELECT ?Name  WHERE {
           ?s <http://xmlns.com/foaf/0.1/Name> ?Name.
          }`, {
            sources: [`${webid}`],
            fetch: myfetchFunction,
          });
          myEngine_getData_.invalidateHttpCache();
        const bindings_ = await bindingsStream_.toArray();
            
        if(bindings_.length==0){ 
        //When the foaf:givenName, foaf:Name and foaf:FamilyName are absent webid will be shown
            return([webid,'']) }

        else{
            return([bindings_[0].get('Name').value,""]);
        } 

    }
        else{
            return([bindings[0].get('givenName').value,bindings[0].get('familyName').value]);
         }
}
