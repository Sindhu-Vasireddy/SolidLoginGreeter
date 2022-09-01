let yield_ = null;
let output = [];
const buffers = {
  stdout: [],
  stderr: [],
};

function write(to, c) {
  if (c) {
    buffers[to].push(c);
  }

  if (c == 10 || c == null) {
    flush(to);
  }
}

function flush(to) {
  const line = String.fromCharCode.apply(null, buffers[to]);

  output.push(line);

  buffers[to] = [];
}

function bindStdStreams(module) {
  module.FS.init(undefined, (c) => write('stdout', c), (c) => write('stderr', c));
}


function pl(s) {
  Module.prolog.call(s);
}

function query(query) {
  next(yield_.resume(query));
}

export async function main(webid, podUrl) {
  await fetchWrite(webid, 'Profile.n3');
  output=[];
  let query=`main(['./Profile.n3', '--query', './PreferenceRules.n3']).`;

  if (!/\.\s*/.test(query)) {
    query += '.\n';
  }
  next(yield_.resume(query));
  output.splice(0, 10);
  output.splice(output.length-8, 8);
  output.join('\n');
  const ro = output.join('');
  const file= `${podUrl}answer.n3`;
  const response = await fetch(file, {
    method: 'PUT',
    headers: {'Content-Type': 'text/n3', 'Cache-Control': 'no-cache'},
    body: ro,
    credentials: 'include',
  });
  console.log(response);
}

function next(rc) {
  yield_ = null;

  if (typeof(rc) === 'object') {
    yield_ = rc;
  } else if (rc == undefined) {
    console.log('Unhandled exception; restarting');
    toplevel();
  }
}

function toplevel() {
  const rc = Module.prolog.call('\'$query_loop\'', {
    async: true,
    module: '$toplevel',
  });
  next(rc);
}

var Module = {
  noInitialRun: true,
  arguments: [],
  locateFile: function(file) {
    return './' + file;
  },
  preRun: [() => bindStdStreams(Module)],
};

async function fetchWrite(link, file) {
  const response = await fetch(link);
  await Module.FS.writeFile(file, await response.text());
}

SWIPL(Module).then(async (module) => {
  await fetchWrite('https://sindhu-vasireddy.github.io/GreeterSupplements/eye.pl', 'eye.pl');
  await fetchWrite('https://svasired.pod.knows.idlab.ugent.be/private/PreferenceRules.n3', 'PreferenceRules.n3');

  pl('set_prolog_flag(tty_control, true)');
  pl('set_prolog_flag(debug_on_error, false)');

  toplevel();
  query(`consult('./eye.pl')`);
});


