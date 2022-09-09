import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';
// import {setUpRules} from '../appReasoning/setup';

/**
 * Main Reasoning function executor.
 * @param {String} webid WebID of the user.
 * @param {String} podUrl Podurl of the user.
 */
export async function getPreferredName(webid, podUrl) {
  // Preference Rules are no longer added to user pod.
  // await setUpRules(podUrl);
  // await fetchWriteFromPod(`${podUrl}private/PreferenceRules.n3`,
  //     'PreferenceRules.n3');
  await fetchWriteFromPod(webid, 'Profile.n3');

  // default fetch since file is local.
  const rules = await fetch('./PreferenceRules.n3');
  await Module.FS.writeFile('./PreferenceRules.n3', await rules.text());

  const output=[];
  let query=`main(['./Profile.n3', '--query', './PreferenceRules.n3']).`;

  if (!/\.\s*/.test(query)) {
    query += '.\n';
  }
  next(yield_.resume(query));
  output.splice(0, 10);
  output.splice(output.length-8, 8);
  output.join('\n');
  let ro = output.join('');
  const id=webid.replace('#me', '');
  ro=ro.replaceAll('file:///Profile.n3', `${id}`);
  if (ro.startsWith('** ERROR')) {
    ro='';
  }
  const file= `${podUrl}private/answer.n3`;
  const response = await solidfetch(file, {
    method: 'PUT',
    headers: {'Content-Type': 'text/n3', 'Cache-Control': 'no-cache'},
    body: ro,
    credentials: 'include',
  });
  console.log(response);
}
/**
 * Fetches the file from the pod and writes it to the swipl module fs.
 * @param {String} link Url of the file oon the pod.
 * @param {string} file FS location of the local file.
 */
async function fetchWriteFromPod(link, file) {
  const response = await solidfetch(link, {
    method: 'GET',
    headers: {'Content-Type': 'text/n3', 'Cache-Control': 'no-cache'},
    credentials: 'include',
  });
  await Module.FS.writeFile(file, await response.text());
}

// CORS headers
// 'Access-Control-Allow-Headers':
// 'Origin, X-Requested-With, Content-Type, Accept',
//   'Access-Control-Allow-Credentials':
// 'true',
//   'Access-Control-Allow-Origin': 'https://sindhu-vasireddy.github.io',
//   'Access-Control-Allow-Origin': 'http://localhost:8080'
