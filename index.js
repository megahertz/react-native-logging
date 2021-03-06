/** @name module */
/** @name module.exports */
/** @name __DEV__ */
/** @name fetch */
/**
 * @param {string|Object} text
 * @param {...Object} [objects]
 * @name module.exports.warn
 */

/**
 * @param {string|Object} text
 * @param {...Object} [objects]
 * @name module.exports.error
 */
/**
 * @param {string|Object} text
 * @param {...Object} [objects]
 * @name module.exports.warn
 */
/**
 * @param {string|Object} text
 * @param {...Object} [objects]
 * @name module.exports.info
 */
/**
 * @param {string|Object} text
 * @param {...Object} [objects]
 * @name module.exports.verbose
 */
/**
 * @param {string|Object} text
 * @param {...Object} [objects]
 * @name module.exports.debug
 */
/**
 * @param {string|Object} text
 * @param {...Object} [objects]
 * @name module.exports.silly
 */

const LEVELS = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];

const transports = {
  console: transportConsole,
  logS: transportLogS
};

module.exports = {
  transports: transports,

  error:   log.bind(null, 'error'),
  warn:    log.bind(null, 'warn'),
  info:    log.bind(null, 'info'),
  verbose: log.bind(null, 'verbose'),
  debug:   log.bind(null, 'debug'),
  silly:   log.bind(null, 'silly')
};

transportConsole.level = 'silly';

transportLogS.client = { name: 'react-native-log-s' };
transportLogS.depth = 6;
transportLogS.level = __DEV__ ? 'silly' : false;
transportLogS.logNetworkError = false;
transportLogS.url = null;

function log(level) {
  const data = [].slice.call(arguments, 1);
  const msg = {
    level: level,
    data: data,
    date: new Date().getTime()
  };

  each(transports, (transport) => {
    if (typeof transport !== 'function' || !transport.level) {
    return;
  }

  if (!compareLevels(transport.level, level)) {
    return;
  }

  transport(msg);
});
}

function compareLevels(passLevel, checkLevel) {
  const pass = LEVELS.indexOf(passLevel);
  const check = LEVELS.indexOf(checkLevel);
  if (check === -1 || pass === -1) {
    return true;
  }

  return check <= pass;
}

function transportConsole(msg) {
  const data = msg.data;
  if (console[msg.level]) {
    console[msg.level].apply(console, data);
  } else {
    console.log.apply(console, data);
  }
}

function transportLogS(msg) {
  if (!transportLogS.url) return;

  const data = jsonDepth({
    client: transportLogS.client,
    data: msg.data,
    level: msg.level,
  }, transports.logS.depth + 1);

  fetch(transportLogS.url, {
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST'
  })
    .catch((e) => {
      if (!transportLogS.logNetworkError) return;
      transportConsole({ level: 'warn', data: [e], date: new Date() });
    })
}

function jsonDepth(json, depth) {
  if (depth < 1) {
    if (Array.isArray(json))  return '[array]';
    if (typeof json === 'object')  return '[object]';
    return json;
  }

  if (Array.isArray(json)) {
    return json.map(child => jsonDepth(child, depth - 1));
  }
  
  if (json && typeof json.getMonth === 'function') {
    return json; 
  }
  
  if (json === null) {
    return null;
  }

  if (typeof json === 'object') {
    if (typeof json.toJSON === 'function') {
      json = json.toJSON();
    }

    const newJson = {};
    for (const i in json) {
      //noinspection JSUnfilteredForInLoop
      newJson[i] = jsonDepth(json[i], depth - 1);
    }

    return newJson;
  }

  return json;
}
function each(object, callback) {
  for (const i in object) {
    //noinspection JSUnfilteredForInLoop
    callback(object[i], i);
  }
}
