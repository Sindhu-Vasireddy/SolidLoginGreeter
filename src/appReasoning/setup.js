import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';
/**
 * Initializes the reasoning preference rules.
 * @param {String} podurl Location of the user pod.
 */
export async function setUpRules(podurl) {
  const file=`${podurl}private/PreferenceRules.n3`;
  // Send a GET request to check if inbox exists
  const response_ = await solidfetch(file, {
    method: 'GET',
    headers: {'Content-Type': 'text/turtle'},
    credentials: 'include',
  });

  if (300<response_.status&&response_.status<500) {
    fetch('./PreferenceRules.n3')
        .then(async (q) => {
          q.text()
              .then(async (data) =>{
                const query=data;
                // console.log("This is query",query)
                const response = await solidfetch(
                    `${podurl}private/PreferenceRules.n3`, {
                      method: 'PUT',
                      headers: {'Content-Type': 'text/n3'},
                      body: query,
                      credentials: 'include',
                    });
                console.log('This is the response upon rules put in pod',
                    response);
              });
        });
  }
}
