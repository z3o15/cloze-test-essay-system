
      let global = globalThis;

      class MessageChannel {
        constructor() {
          this.port1 = new MessagePort();
          this.port2 = new MessagePort();
        }
      }
      class MessagePort {
        constructor() {
          this.onmessage = null;
        }
        postMessage(data) {
          if (this.onmessage) {
            setTimeout(() => this.onmessage({ data }), 0);
          }
        }
      }
      global.MessageChannel = MessageChannel;

      async function handleRequest(context){
        let routeParams = {};
        let pagesFunctionResponse = null;
        const request = context.request;
        const waitUntil = context.waitUntil;
        const urlInfo = new URL(request.url);

        if (urlInfo.pathname !== '/' && urlInfo.pathname.endsWith('/')) {
          urlInfo.pathname = urlInfo.pathname.slice(0, -1);
        }

        let matchedFunc = false;
        
          if('/api/translate' === urlInfo.pathname) {
            matchedFunc = true;
              "use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all3) => {
    for (var name in all3)
      __defProp(target, name, { get: all3[name], enumerable: true });
  };

  // node_modules/axios/lib/helpers/bind.js
  function bind(fn, thisArg) {
    return function wrap() {
      return fn.apply(thisArg, arguments);
    };
  }

  // node_modules/axios/lib/utils.js
  var { toString } = Object.prototype;
  var { getPrototypeOf } = Object;
  var { iterator, toStringTag } = Symbol;
  var kindOf = /* @__PURE__ */ ((cache) => (thing) => {
    const str = toString.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
  })(/* @__PURE__ */ Object.create(null));
  var kindOfTest = (type) => {
    type = type.toLowerCase();
    return (thing) => kindOf(thing) === type;
  };
  var typeOfTest = (type) => (thing) => typeof thing === type;
  var { isArray } = Array;
  var isUndefined = typeOfTest("undefined");
  function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
  }
  var isArrayBuffer = kindOfTest("ArrayBuffer");
  function isArrayBufferView(val) {
    let result;
    if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
      result = ArrayBuffer.isView(val);
    } else {
      result = val && val.buffer && isArrayBuffer(val.buffer);
    }
    return result;
  }
  var isString = typeOfTest("string");
  var isFunction = typeOfTest("function");
  var isNumber = typeOfTest("number");
  var isObject = (thing) => thing !== null && typeof thing === "object";
  var isBoolean = (thing) => thing === true || thing === false;
  var isPlainObject = (val) => {
    if (kindOf(val) !== "object") {
      return false;
    }
    const prototype3 = getPrototypeOf(val);
    return (prototype3 === null || prototype3 === Object.prototype || Object.getPrototypeOf(prototype3) === null) && !(toStringTag in val) && !(iterator in val);
  };
  var isEmptyObject = (val) => {
    if (!isObject(val) || isBuffer(val)) {
      return false;
    }
    try {
      return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
    } catch (e) {
      return false;
    }
  };
  var isDate = kindOfTest("Date");
  var isFile = kindOfTest("File");
  var isBlob = kindOfTest("Blob");
  var isFileList = kindOfTest("FileList");
  var isStream = (val) => isObject(val) && isFunction(val.pipe);
  var isFormData = (thing) => {
    let kind;
    return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
    kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]"));
  };
  var isURLSearchParams = kindOfTest("URLSearchParams");
  var [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
  var trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
  function forEach(obj, fn, { allOwnKeys = false } = {}) {
    if (obj === null || typeof obj === "undefined") {
      return;
    }
    let i;
    let l;
    if (typeof obj !== "object") {
      obj = [obj];
    }
    if (isArray(obj)) {
      for (i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      if (isBuffer(obj)) {
        return;
      }
      const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
      const len = keys.length;
      let key;
      for (i = 0; i < len; i++) {
        key = keys[i];
        fn.call(null, obj[key], key, obj);
      }
    }
  }
  function findKey(obj, key) {
    if (isBuffer(obj)) {
      return null;
    }
    key = key.toLowerCase();
    const keys = Object.keys(obj);
    let i = keys.length;
    let _key;
    while (i-- > 0) {
      _key = keys[i];
      if (key === _key.toLowerCase()) {
        return _key;
      }
    }
    return null;
  }
  var _global = (() => {
    if (typeof globalThis !== "undefined")
      return globalThis;
    return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
  })();
  var isContextDefined = (context) => !isUndefined(context) && context !== _global;
  function merge() {
    const { caseless, skipUndefined } = isContextDefined(this) && this || {};
    const result = {};
    const assignValue = (val, key) => {
      const targetKey = caseless && findKey(result, key) || key;
      if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
        result[targetKey] = merge(result[targetKey], val);
      } else if (isPlainObject(val)) {
        result[targetKey] = merge({}, val);
      } else if (isArray(val)) {
        result[targetKey] = val.slice();
      } else if (!skipUndefined || !isUndefined(val)) {
        result[targetKey] = val;
      }
    };
    for (let i = 0, l = arguments.length; i < l; i++) {
      arguments[i] && forEach(arguments[i], assignValue);
    }
    return result;
  }
  var extend = (a, b, thisArg, { allOwnKeys } = {}) => {
    forEach(b, (val, key) => {
      if (thisArg && isFunction(val)) {
        a[key] = bind(val, thisArg);
      } else {
        a[key] = val;
      }
    }, { allOwnKeys });
    return a;
  };
  var stripBOM = (content) => {
    if (content.charCodeAt(0) === 65279) {
      content = content.slice(1);
    }
    return content;
  };
  var inherits = (constructor, superConstructor, props, descriptors2) => {
    constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
    constructor.prototype.constructor = constructor;
    Object.defineProperty(constructor, "super", {
      value: superConstructor.prototype
    });
    props && Object.assign(constructor.prototype, props);
  };
  var toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
    let props;
    let i;
    let prop;
    const merged = {};
    destObj = destObj || {};
    if (sourceObj == null)
      return destObj;
    do {
      props = Object.getOwnPropertyNames(sourceObj);
      i = props.length;
      while (i-- > 0) {
        prop = props[i];
        if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
          destObj[prop] = sourceObj[prop];
          merged[prop] = true;
        }
      }
      sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
    } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
    return destObj;
  };
  var endsWith = (str, searchString, position) => {
    str = String(str);
    if (position === void 0 || position > str.length) {
      position = str.length;
    }
    position -= searchString.length;
    const lastIndex = str.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };
  var toArray = (thing) => {
    if (!thing)
      return null;
    if (isArray(thing))
      return thing;
    let i = thing.length;
    if (!isNumber(i))
      return null;
    const arr = new Array(i);
    while (i-- > 0) {
      arr[i] = thing[i];
    }
    return arr;
  };
  var isTypedArray = /* @__PURE__ */ ((TypedArray) => {
    return (thing) => {
      return TypedArray && thing instanceof TypedArray;
    };
  })(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
  var forEachEntry = (obj, fn) => {
    const generator = obj && obj[iterator];
    const _iterator = generator.call(obj);
    let result;
    while ((result = _iterator.next()) && !result.done) {
      const pair = result.value;
      fn.call(obj, pair[0], pair[1]);
    }
  };
  var matchAll = (regExp, str) => {
    let matches;
    const arr = [];
    while ((matches = regExp.exec(str)) !== null) {
      arr.push(matches);
    }
    return arr;
  };
  var isHTMLForm = kindOfTest("HTMLFormElement");
  var toCamelCase = (str) => {
    return str.toLowerCase().replace(
      /[-_\s]([a-z\d])(\w*)/g,
      function replacer(m, p1, p2) {
        return p1.toUpperCase() + p2;
      }
    );
  };
  var hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
  var isRegExp = kindOfTest("RegExp");
  var reduceDescriptors = (obj, reducer) => {
    const descriptors2 = Object.getOwnPropertyDescriptors(obj);
    const reducedDescriptors = {};
    forEach(descriptors2, (descriptor, name) => {
      let ret;
      if ((ret = reducer(descriptor, name, obj)) !== false) {
        reducedDescriptors[name] = ret || descriptor;
      }
    });
    Object.defineProperties(obj, reducedDescriptors);
  };
  var freezeMethods = (obj) => {
    reduceDescriptors(obj, (descriptor, name) => {
      if (isFunction(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
        return false;
      }
      const value = obj[name];
      if (!isFunction(value))
        return;
      descriptor.enumerable = false;
      if ("writable" in descriptor) {
        descriptor.writable = false;
        return;
      }
      if (!descriptor.set) {
        descriptor.set = () => {
          throw Error("Can not rewrite read-only method '" + name + "'");
        };
      }
    });
  };
  var toObjectSet = (arrayOrString, delimiter) => {
    const obj = {};
    const define = (arr) => {
      arr.forEach((value) => {
        obj[value] = true;
      });
    };
    isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
    return obj;
  };
  var noop = () => {
  };
  var toFiniteNumber = (value, defaultValue) => {
    return value != null && Number.isFinite(value = +value) ? value : defaultValue;
  };
  function isSpecCompliantForm(thing) {
    return !!(thing && isFunction(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
  }
  var toJSONObject = (obj) => {
    const stack = new Array(10);
    const visit = (source, i) => {
      if (isObject(source)) {
        if (stack.indexOf(source) >= 0) {
          return;
        }
        if (isBuffer(source)) {
          return source;
        }
        if (!("toJSON" in source)) {
          stack[i] = source;
          const target = isArray(source) ? [] : {};
          forEach(source, (value, key) => {
            const reducedValue = visit(value, i + 1);
            !isUndefined(reducedValue) && (target[key] = reducedValue);
          });
          stack[i] = void 0;
          return target;
        }
      }
      return source;
    };
    return visit(obj, 0);
  };
  var isAsyncFn = kindOfTest("AsyncFunction");
  var isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
  var _setImmediate = ((setImmediateSupported, postMessageSupported) => {
    if (setImmediateSupported) {
      return setImmediate;
    }
    return postMessageSupported ? ((token, callbacks) => {
      _global.addEventListener("message", ({ source, data }) => {
        if (source === _global && data === token) {
          callbacks.length && callbacks.shift()();
        }
      }, false);
      return (cb) => {
        callbacks.push(cb);
        _global.postMessage(token, "*");
      };
    })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
  })(
    typeof setImmediate === "function",
    isFunction(_global.postMessage)
  );
  var asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
  var isIterable = (thing) => thing != null && isFunction(thing[iterator]);
  var utils_default = {
    isArray,
    isArrayBuffer,
    isBuffer,
    isFormData,
    isArrayBufferView,
    isString,
    isNumber,
    isBoolean,
    isObject,
    isPlainObject,
    isEmptyObject,
    isReadableStream,
    isRequest,
    isResponse,
    isHeaders,
    isUndefined,
    isDate,
    isFile,
    isBlob,
    isRegExp,
    isFunction,
    isStream,
    isURLSearchParams,
    isTypedArray,
    isFileList,
    forEach,
    merge,
    extend,
    trim,
    stripBOM,
    inherits,
    toFlatObject,
    kindOf,
    kindOfTest,
    endsWith,
    toArray,
    forEachEntry,
    matchAll,
    isHTMLForm,
    hasOwnProperty,
    hasOwnProp: hasOwnProperty,
    // an alias to avoid ESLint no-prototype-builtins detection
    reduceDescriptors,
    freezeMethods,
    toObjectSet,
    toCamelCase,
    noop,
    toFiniteNumber,
    findKey,
    global: _global,
    isContextDefined,
    isSpecCompliantForm,
    toJSONObject,
    isAsyncFn,
    isThenable,
    setImmediate: _setImmediate,
    asap,
    isIterable
  };

  // node_modules/axios/lib/core/AxiosError.js
  function AxiosError(message, code, config, request, response) {
    Error.call(this);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
    this.message = message;
    this.name = "AxiosError";
    code && (this.code = code);
    config && (this.config = config);
    request && (this.request = request);
    if (response) {
      this.response = response;
      this.status = response.status ? response.status : null;
    }
  }
  utils_default.inherits(AxiosError, Error, {
    toJSON: function toJSON() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: utils_default.toJSONObject(this.config),
        code: this.code,
        status: this.status
      };
    }
  });
  var prototype = AxiosError.prototype;
  var descriptors = {};
  [
    "ERR_BAD_OPTION_VALUE",
    "ERR_BAD_OPTION",
    "ECONNABORTED",
    "ETIMEDOUT",
    "ERR_NETWORK",
    "ERR_FR_TOO_MANY_REDIRECTS",
    "ERR_DEPRECATED",
    "ERR_BAD_RESPONSE",
    "ERR_BAD_REQUEST",
    "ERR_CANCELED",
    "ERR_NOT_SUPPORT",
    "ERR_INVALID_URL"
    // eslint-disable-next-line func-names
  ].forEach((code) => {
    descriptors[code] = { value: code };
  });
  Object.defineProperties(AxiosError, descriptors);
  Object.defineProperty(prototype, "isAxiosError", { value: true });
  AxiosError.from = (error, code, config, request, response, customProps) => {
    const axiosError = Object.create(prototype);
    utils_default.toFlatObject(error, axiosError, function filter2(obj) {
      return obj !== Error.prototype;
    }, (prop) => {
      return prop !== "isAxiosError";
    });
    const msg = error && error.message ? error.message : "Error";
    const errCode = code == null && error ? error.code : code;
    AxiosError.call(axiosError, msg, errCode, config, request, response);
    if (error && axiosError.cause == null) {
      Object.defineProperty(axiosError, "cause", { value: error, configurable: true });
    }
    axiosError.name = error && error.name || "Error";
    customProps && Object.assign(axiosError, customProps);
    return axiosError;
  };
  var AxiosError_default = AxiosError;

  // node_modules/axios/lib/helpers/null.js
  var null_default = null;

  // node_modules/axios/lib/helpers/toFormData.js
  function isVisitable(thing) {
    return utils_default.isPlainObject(thing) || utils_default.isArray(thing);
  }
  function removeBrackets(key) {
    return utils_default.endsWith(key, "[]") ? key.slice(0, -2) : key;
  }
  function renderKey(path, key, dots) {
    if (!path)
      return key;
    return path.concat(key).map(function each(token, i) {
      token = removeBrackets(token);
      return !dots && i ? "[" + token + "]" : token;
    }).join(dots ? "." : "");
  }
  function isFlatArray(arr) {
    return utils_default.isArray(arr) && !arr.some(isVisitable);
  }
  var predicates = utils_default.toFlatObject(utils_default, {}, null, function filter(prop) {
    return /^is[A-Z]/.test(prop);
  });
  function toFormData(obj, formData, options) {
    if (!utils_default.isObject(obj)) {
      throw new TypeError("target must be an object");
    }
    formData = formData || new (null_default || FormData)();
    options = utils_default.toFlatObject(options, {
      metaTokens: true,
      dots: false,
      indexes: false
    }, false, function defined(option, source) {
      return !utils_default.isUndefined(source[option]);
    });
    const metaTokens = options.metaTokens;
    const visitor = options.visitor || defaultVisitor;
    const dots = options.dots;
    const indexes = options.indexes;
    const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
    const useBlob = _Blob && utils_default.isSpecCompliantForm(formData);
    if (!utils_default.isFunction(visitor)) {
      throw new TypeError("visitor must be a function");
    }
    function convertValue(value) {
      if (value === null)
        return "";
      if (utils_default.isDate(value)) {
        return value.toISOString();
      }
      if (utils_default.isBoolean(value)) {
        return value.toString();
      }
      if (!useBlob && utils_default.isBlob(value)) {
        throw new AxiosError_default("Blob is not supported. Use a Buffer instead.");
      }
      if (utils_default.isArrayBuffer(value) || utils_default.isTypedArray(value)) {
        return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
      }
      return value;
    }
    function defaultVisitor(value, key, path) {
      let arr = value;
      if (value && !path && typeof value === "object") {
        if (utils_default.endsWith(key, "{}")) {
          key = metaTokens ? key : key.slice(0, -2);
          value = JSON.stringify(value);
        } else if (utils_default.isArray(value) && isFlatArray(value) || (utils_default.isFileList(value) || utils_default.endsWith(key, "[]")) && (arr = utils_default.toArray(value))) {
          key = removeBrackets(key);
          arr.forEach(function each(el, index) {
            !(utils_default.isUndefined(el) || el === null) && formData.append(
              // eslint-disable-next-line no-nested-ternary
              indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
              convertValue(el)
            );
          });
          return false;
        }
      }
      if (isVisitable(value)) {
        return true;
      }
      formData.append(renderKey(path, key, dots), convertValue(value));
      return false;
    }
    const stack = [];
    const exposedHelpers = Object.assign(predicates, {
      defaultVisitor,
      convertValue,
      isVisitable
    });
    function build(value, path) {
      if (utils_default.isUndefined(value))
        return;
      if (stack.indexOf(value) !== -1) {
        throw Error("Circular reference detected in " + path.join("."));
      }
      stack.push(value);
      utils_default.forEach(value, function each(el, key) {
        const result = !(utils_default.isUndefined(el) || el === null) && visitor.call(
          formData,
          el,
          utils_default.isString(key) ? key.trim() : key,
          path,
          exposedHelpers
        );
        if (result === true) {
          build(el, path ? path.concat(key) : [key]);
        }
      });
      stack.pop();
    }
    if (!utils_default.isObject(obj)) {
      throw new TypeError("data must be an object");
    }
    build(obj);
    return formData;
  }
  var toFormData_default = toFormData;

  // node_modules/axios/lib/helpers/AxiosURLSearchParams.js
  function encode(str) {
    const charMap = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+",
      "%00": "\0"
    };
    return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
      return charMap[match];
    });
  }
  function AxiosURLSearchParams(params, options) {
    this._pairs = [];
    params && toFormData_default(params, this, options);
  }
  var prototype2 = AxiosURLSearchParams.prototype;
  prototype2.append = function append(name, value) {
    this._pairs.push([name, value]);
  };
  prototype2.toString = function toString2(encoder) {
    const _encode = encoder ? function(value) {
      return encoder.call(this, value, encode);
    } : encode;
    return this._pairs.map(function each(pair) {
      return _encode(pair[0]) + "=" + _encode(pair[1]);
    }, "").join("&");
  };
  var AxiosURLSearchParams_default = AxiosURLSearchParams;

  // node_modules/axios/lib/helpers/buildURL.js
  function encode2(val) {
    return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
  }
  function buildURL(url, params, options) {
    if (!params) {
      return url;
    }
    const _encode = options && options.encode || encode2;
    if (utils_default.isFunction(options)) {
      options = {
        serialize: options
      };
    }
    const serializeFn = options && options.serialize;
    let serializedParams;
    if (serializeFn) {
      serializedParams = serializeFn(params, options);
    } else {
      serializedParams = utils_default.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams_default(params, options).toString(_encode);
    }
    if (serializedParams) {
      const hashmarkIndex = url.indexOf("#");
      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }
      url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
    }
    return url;
  }

  // node_modules/axios/lib/core/InterceptorManager.js
  var InterceptorManager = class {
    constructor() {
      this.handlers = [];
    }
    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled,
        rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    }
    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     *
     * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
     */
    eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    }
    /**
     * Clear all interceptors from the stack
     *
     * @returns {void}
     */
    clear() {
      if (this.handlers) {
        this.handlers = [];
      }
    }
    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     *
     * @returns {void}
     */
    forEach(fn) {
      utils_default.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    }
  };
  var InterceptorManager_default = InterceptorManager;

  // node_modules/axios/lib/defaults/transitional.js
  var transitional_default = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  };

  // node_modules/axios/lib/platform/browser/classes/URLSearchParams.js
  var URLSearchParams_default = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams_default;

  // node_modules/axios/lib/platform/browser/classes/FormData.js
  var FormData_default = typeof FormData !== "undefined" ? FormData : null;

  // node_modules/axios/lib/platform/browser/classes/Blob.js
  var Blob_default = typeof Blob !== "undefined" ? Blob : null;

  // node_modules/axios/lib/platform/browser/index.js
  var browser_default = {
    isBrowser: true,
    classes: {
      URLSearchParams: URLSearchParams_default,
      FormData: FormData_default,
      Blob: Blob_default
    },
    protocols: ["http", "https", "file", "blob", "url", "data"]
  };

  // node_modules/axios/lib/platform/common/utils.js
  var utils_exports = {};
  __export(utils_exports, {
    hasBrowserEnv: () => hasBrowserEnv,
    hasStandardBrowserEnv: () => hasStandardBrowserEnv,
    hasStandardBrowserWebWorkerEnv: () => hasStandardBrowserWebWorkerEnv,
    navigator: () => _navigator,
    origin: () => origin
  });
  var hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
  var _navigator = typeof navigator === "object" && navigator || void 0;
  var hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
  var hasStandardBrowserWebWorkerEnv = (() => {
    return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
    self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
  })();
  var origin = hasBrowserEnv && window.location.href || "http://localhost";

  // node_modules/axios/lib/platform/index.js
  var platform_default = {
    ...utils_exports,
    ...browser_default
  };

  // node_modules/axios/lib/helpers/toURLEncodedForm.js
  function toURLEncodedForm(data, options) {
    return toFormData_default(data, new platform_default.classes.URLSearchParams(), {
      visitor: function(value, key, path, helpers) {
        if (platform_default.isNode && utils_default.isBuffer(value)) {
          this.append(key, value.toString("base64"));
          return false;
        }
        return helpers.defaultVisitor.apply(this, arguments);
      },
      ...options
    });
  }

  // node_modules/axios/lib/helpers/formDataToJSON.js
  function parsePropPath(name) {
    return utils_default.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
      return match[0] === "[]" ? "" : match[1] || match[0];
    });
  }
  function arrayToObject(arr) {
    const obj = {};
    const keys = Object.keys(arr);
    let i;
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      obj[key] = arr[key];
    }
    return obj;
  }
  function formDataToJSON(formData) {
    function buildPath(path, value, target, index) {
      let name = path[index++];
      if (name === "__proto__")
        return true;
      const isNumericKey = Number.isFinite(+name);
      const isLast = index >= path.length;
      name = !name && utils_default.isArray(target) ? target.length : name;
      if (isLast) {
        if (utils_default.hasOwnProp(target, name)) {
          target[name] = [target[name], value];
        } else {
          target[name] = value;
        }
        return !isNumericKey;
      }
      if (!target[name] || !utils_default.isObject(target[name])) {
        target[name] = [];
      }
      const result = buildPath(path, value, target[name], index);
      if (result && utils_default.isArray(target[name])) {
        target[name] = arrayToObject(target[name]);
      }
      return !isNumericKey;
    }
    if (utils_default.isFormData(formData) && utils_default.isFunction(formData.entries)) {
      const obj = {};
      utils_default.forEachEntry(formData, (name, value) => {
        buildPath(parsePropPath(name), value, obj, 0);
      });
      return obj;
    }
    return null;
  }
  var formDataToJSON_default = formDataToJSON;

  // node_modules/axios/lib/defaults/index.js
  function stringifySafely(rawValue, parser, encoder) {
    if (utils_default.isString(rawValue)) {
      try {
        (parser || JSON.parse)(rawValue);
        return utils_default.trim(rawValue);
      } catch (e) {
        if (e.name !== "SyntaxError") {
          throw e;
        }
      }
    }
    return (encoder || JSON.stringify)(rawValue);
  }
  var defaults = {
    transitional: transitional_default,
    adapter: ["xhr", "http", "fetch"],
    transformRequest: [function transformRequest(data, headers) {
      const contentType = headers.getContentType() || "";
      const hasJSONContentType = contentType.indexOf("application/json") > -1;
      const isObjectPayload = utils_default.isObject(data);
      if (isObjectPayload && utils_default.isHTMLForm(data)) {
        data = new FormData(data);
      }
      const isFormData2 = utils_default.isFormData(data);
      if (isFormData2) {
        return hasJSONContentType ? JSON.stringify(formDataToJSON_default(data)) : data;
      }
      if (utils_default.isArrayBuffer(data) || utils_default.isBuffer(data) || utils_default.isStream(data) || utils_default.isFile(data) || utils_default.isBlob(data) || utils_default.isReadableStream(data)) {
        return data;
      }
      if (utils_default.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils_default.isURLSearchParams(data)) {
        headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
        return data.toString();
      }
      let isFileList2;
      if (isObjectPayload) {
        if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
          return toURLEncodedForm(data, this.formSerializer).toString();
        }
        if ((isFileList2 = utils_default.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
          const _FormData = this.env && this.env.FormData;
          return toFormData_default(
            isFileList2 ? { "files[]": data } : data,
            _FormData && new _FormData(),
            this.formSerializer
          );
        }
      }
      if (isObjectPayload || hasJSONContentType) {
        headers.setContentType("application/json", false);
        return stringifySafely(data);
      }
      return data;
    }],
    transformResponse: [function transformResponse(data) {
      const transitional2 = this.transitional || defaults.transitional;
      const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
      const JSONRequested = this.responseType === "json";
      if (utils_default.isResponse(data) || utils_default.isReadableStream(data)) {
        return data;
      }
      if (data && utils_default.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
        const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
        const strictJSONParsing = !silentJSONParsing && JSONRequested;
        try {
          return JSON.parse(data, this.parseReviver);
        } catch (e) {
          if (strictJSONParsing) {
            if (e.name === "SyntaxError") {
              throw AxiosError_default.from(e, AxiosError_default.ERR_BAD_RESPONSE, this, null, this.response);
            }
            throw e;
          }
        }
      }
      return data;
    }],
    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
      FormData: platform_default.classes.FormData,
      Blob: platform_default.classes.Blob
    },
    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    },
    headers: {
      common: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": void 0
      }
    }
  };
  utils_default.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
    defaults.headers[method] = {};
  });
  var defaults_default = defaults;

  // node_modules/axios/lib/helpers/parseHeaders.js
  var ignoreDuplicateOf = utils_default.toObjectSet([
    "age",
    "authorization",
    "content-length",
    "content-type",
    "etag",
    "expires",
    "from",
    "host",
    "if-modified-since",
    "if-unmodified-since",
    "last-modified",
    "location",
    "max-forwards",
    "proxy-authorization",
    "referer",
    "retry-after",
    "user-agent"
  ]);
  var parseHeaders_default = (rawHeaders) => {
    const parsed = {};
    let key;
    let val;
    let i;
    rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
      i = line.indexOf(":");
      key = line.substring(0, i).trim().toLowerCase();
      val = line.substring(i + 1).trim();
      if (!key || parsed[key] && ignoreDuplicateOf[key]) {
        return;
      }
      if (key === "set-cookie") {
        if (parsed[key]) {
          parsed[key].push(val);
        } else {
          parsed[key] = [val];
        }
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
      }
    });
    return parsed;
  };

  // node_modules/axios/lib/core/AxiosHeaders.js
  var $internals = Symbol("internals");
  function normalizeHeader(header) {
    return header && String(header).trim().toLowerCase();
  }
  function normalizeValue(value) {
    if (value === false || value == null) {
      return value;
    }
    return utils_default.isArray(value) ? value.map(normalizeValue) : String(value);
  }
  function parseTokens(str) {
    const tokens = /* @__PURE__ */ Object.create(null);
    const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
    let match;
    while (match = tokensRE.exec(str)) {
      tokens[match[1]] = match[2];
    }
    return tokens;
  }
  var isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
  function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
    if (utils_default.isFunction(filter2)) {
      return filter2.call(this, value, header);
    }
    if (isHeaderNameFilter) {
      value = header;
    }
    if (!utils_default.isString(value))
      return;
    if (utils_default.isString(filter2)) {
      return value.indexOf(filter2) !== -1;
    }
    if (utils_default.isRegExp(filter2)) {
      return filter2.test(value);
    }
  }
  function formatHeader(header) {
    return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
      return char.toUpperCase() + str;
    });
  }
  function buildAccessors(obj, header) {
    const accessorName = utils_default.toCamelCase(" " + header);
    ["get", "set", "has"].forEach((methodName) => {
      Object.defineProperty(obj, methodName + accessorName, {
        value: function(arg1, arg2, arg3) {
          return this[methodName].call(this, header, arg1, arg2, arg3);
        },
        configurable: true
      });
    });
  }
  var AxiosHeaders = class {
    constructor(headers) {
      headers && this.set(headers);
    }
    set(header, valueOrRewrite, rewrite) {
      const self2 = this;
      function setHeader(_value, _header, _rewrite) {
        const lHeader = normalizeHeader(_header);
        if (!lHeader) {
          throw new Error("header name must be a non-empty string");
        }
        const key = utils_default.findKey(self2, lHeader);
        if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
          self2[key || _header] = normalizeValue(_value);
        }
      }
      const setHeaders = (headers, _rewrite) => utils_default.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
      if (utils_default.isPlainObject(header) || header instanceof this.constructor) {
        setHeaders(header, valueOrRewrite);
      } else if (utils_default.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
        setHeaders(parseHeaders_default(header), valueOrRewrite);
      } else if (utils_default.isObject(header) && utils_default.isIterable(header)) {
        let obj = {}, dest, key;
        for (const entry of header) {
          if (!utils_default.isArray(entry)) {
            throw TypeError("Object iterator must return a key-value pair");
          }
          obj[key = entry[0]] = (dest = obj[key]) ? utils_default.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
        }
        setHeaders(obj, valueOrRewrite);
      } else {
        header != null && setHeader(valueOrRewrite, header, rewrite);
      }
      return this;
    }
    get(header, parser) {
      header = normalizeHeader(header);
      if (header) {
        const key = utils_default.findKey(this, header);
        if (key) {
          const value = this[key];
          if (!parser) {
            return value;
          }
          if (parser === true) {
            return parseTokens(value);
          }
          if (utils_default.isFunction(parser)) {
            return parser.call(this, value, key);
          }
          if (utils_default.isRegExp(parser)) {
            return parser.exec(value);
          }
          throw new TypeError("parser must be boolean|regexp|function");
        }
      }
    }
    has(header, matcher) {
      header = normalizeHeader(header);
      if (header) {
        const key = utils_default.findKey(this, header);
        return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
      }
      return false;
    }
    delete(header, matcher) {
      const self2 = this;
      let deleted = false;
      function deleteHeader(_header) {
        _header = normalizeHeader(_header);
        if (_header) {
          const key = utils_default.findKey(self2, _header);
          if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
            delete self2[key];
            deleted = true;
          }
        }
      }
      if (utils_default.isArray(header)) {
        header.forEach(deleteHeader);
      } else {
        deleteHeader(header);
      }
      return deleted;
    }
    clear(matcher) {
      const keys = Object.keys(this);
      let i = keys.length;
      let deleted = false;
      while (i--) {
        const key = keys[i];
        if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
          delete this[key];
          deleted = true;
        }
      }
      return deleted;
    }
    normalize(format) {
      const self2 = this;
      const headers = {};
      utils_default.forEach(this, (value, header) => {
        const key = utils_default.findKey(headers, header);
        if (key) {
          self2[key] = normalizeValue(value);
          delete self2[header];
          return;
        }
        const normalized = format ? formatHeader(header) : String(header).trim();
        if (normalized !== header) {
          delete self2[header];
        }
        self2[normalized] = normalizeValue(value);
        headers[normalized] = true;
      });
      return this;
    }
    concat(...targets) {
      return this.constructor.concat(this, ...targets);
    }
    toJSON(asStrings) {
      const obj = /* @__PURE__ */ Object.create(null);
      utils_default.forEach(this, (value, header) => {
        value != null && value !== false && (obj[header] = asStrings && utils_default.isArray(value) ? value.join(", ") : value);
      });
      return obj;
    }
    [Symbol.iterator]() {
      return Object.entries(this.toJSON())[Symbol.iterator]();
    }
    toString() {
      return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
    }
    getSetCookie() {
      return this.get("set-cookie") || [];
    }
    get [Symbol.toStringTag]() {
      return "AxiosHeaders";
    }
    static from(thing) {
      return thing instanceof this ? thing : new this(thing);
    }
    static concat(first, ...targets) {
      const computed = new this(first);
      targets.forEach((target) => computed.set(target));
      return computed;
    }
    static accessor(header) {
      const internals = this[$internals] = this[$internals] = {
        accessors: {}
      };
      const accessors = internals.accessors;
      const prototype3 = this.prototype;
      function defineAccessor(_header) {
        const lHeader = normalizeHeader(_header);
        if (!accessors[lHeader]) {
          buildAccessors(prototype3, _header);
          accessors[lHeader] = true;
        }
      }
      utils_default.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
      return this;
    }
  };
  AxiosHeaders.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
  utils_default.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
    let mapped = key[0].toUpperCase() + key.slice(1);
    return {
      get: () => value,
      set(headerValue) {
        this[mapped] = headerValue;
      }
    };
  });
  utils_default.freezeMethods(AxiosHeaders);
  var AxiosHeaders_default = AxiosHeaders;

  // node_modules/axios/lib/core/transformData.js
  function transformData(fns, response) {
    const config = this || defaults_default;
    const context = response || config;
    const headers = AxiosHeaders_default.from(context.headers);
    let data = context.data;
    utils_default.forEach(fns, function transform2(fn) {
      data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
    });
    headers.normalize();
    return data;
  }

  // node_modules/axios/lib/cancel/isCancel.js
  function isCancel(value) {
    return !!(value && value.__CANCEL__);
  }

  // node_modules/axios/lib/cancel/CanceledError.js
  function CanceledError(message, config, request) {
    AxiosError_default.call(this, message == null ? "canceled" : message, AxiosError_default.ERR_CANCELED, config, request);
    this.name = "CanceledError";
  }
  utils_default.inherits(CanceledError, AxiosError_default, {
    __CANCEL__: true
  });
  var CanceledError_default = CanceledError;

  // node_modules/axios/lib/core/settle.js
  function settle(resolve, reject, response) {
    const validateStatus2 = response.config.validateStatus;
    if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
      resolve(response);
    } else {
      reject(new AxiosError_default(
        "Request failed with status code " + response.status,
        [AxiosError_default.ERR_BAD_REQUEST, AxiosError_default.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
        response.config,
        response.request,
        response
      ));
    }
  }

  // node_modules/axios/lib/helpers/parseProtocol.js
  function parseProtocol(url) {
    const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
    return match && match[1] || "";
  }

  // node_modules/axios/lib/helpers/speedometer.js
  function speedometer(samplesCount, min) {
    samplesCount = samplesCount || 10;
    const bytes = new Array(samplesCount);
    const timestamps = new Array(samplesCount);
    let head = 0;
    let tail = 0;
    let firstSampleTS;
    min = min !== void 0 ? min : 1e3;
    return function push(chunkLength) {
      const now = Date.now();
      const startedAt = timestamps[tail];
      if (!firstSampleTS) {
        firstSampleTS = now;
      }
      bytes[head] = chunkLength;
      timestamps[head] = now;
      let i = tail;
      let bytesCount = 0;
      while (i !== head) {
        bytesCount += bytes[i++];
        i = i % samplesCount;
      }
      head = (head + 1) % samplesCount;
      if (head === tail) {
        tail = (tail + 1) % samplesCount;
      }
      if (now - firstSampleTS < min) {
        return;
      }
      const passed = startedAt && now - startedAt;
      return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
    };
  }
  var speedometer_default = speedometer;

  // node_modules/axios/lib/helpers/throttle.js
  function throttle(fn, freq) {
    let timestamp = 0;
    let threshold = 1e3 / freq;
    let lastArgs;
    let timer;
    const invoke = (args, now = Date.now()) => {
      timestamp = now;
      lastArgs = null;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      fn(...args);
    };
    const throttled = (...args) => {
      const now = Date.now();
      const passed = now - timestamp;
      if (passed >= threshold) {
        invoke(args, now);
      } else {
        lastArgs = args;
        if (!timer) {
          timer = setTimeout(() => {
            timer = null;
            invoke(lastArgs);
          }, threshold - passed);
        }
      }
    };
    const flush = () => lastArgs && invoke(lastArgs);
    return [throttled, flush];
  }
  var throttle_default = throttle;

  // node_modules/axios/lib/helpers/progressEventReducer.js
  var progressEventReducer = (listener, isDownloadStream, freq = 3) => {
    let bytesNotified = 0;
    const _speedometer = speedometer_default(50, 250);
    return throttle_default((e) => {
      const loaded = e.loaded;
      const total = e.lengthComputable ? e.total : void 0;
      const progressBytes = loaded - bytesNotified;
      const rate = _speedometer(progressBytes);
      const inRange = loaded <= total;
      bytesNotified = loaded;
      const data = {
        loaded,
        total,
        progress: total ? loaded / total : void 0,
        bytes: progressBytes,
        rate: rate ? rate : void 0,
        estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
        event: e,
        lengthComputable: total != null,
        [isDownloadStream ? "download" : "upload"]: true
      };
      listener(data);
    }, freq);
  };
  var progressEventDecorator = (total, throttled) => {
    const lengthComputable = total != null;
    return [(loaded) => throttled[0]({
      lengthComputable,
      total,
      loaded
    }), throttled[1]];
  };
  var asyncDecorator = (fn) => (...args) => utils_default.asap(() => fn(...args));

  // node_modules/axios/lib/helpers/isURLSameOrigin.js
  var isURLSameOrigin_default = platform_default.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
    url = new URL(url, platform_default.origin);
    return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
  })(
    new URL(platform_default.origin),
    platform_default.navigator && /(msie|trident)/i.test(platform_default.navigator.userAgent)
  ) : () => true;

  // node_modules/axios/lib/helpers/cookies.js
  var cookies_default = platform_default.hasStandardBrowserEnv ? (
    // Standard browser envs support document.cookie
    {
      write(name, value, expires, path, domain, secure) {
        const cookie = [name + "=" + encodeURIComponent(value)];
        utils_default.isNumber(expires) && cookie.push("expires=" + new Date(expires).toGMTString());
        utils_default.isString(path) && cookie.push("path=" + path);
        utils_default.isString(domain) && cookie.push("domain=" + domain);
        secure === true && cookie.push("secure");
        document.cookie = cookie.join("; ");
      },
      read(name) {
        const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
        return match ? decodeURIComponent(match[3]) : null;
      },
      remove(name) {
        this.write(name, "", Date.now() - 864e5);
      }
    }
  ) : (
    // Non-standard browser env (web workers, react-native) lack needed support.
    {
      write() {
      },
      read() {
        return null;
      },
      remove() {
      }
    }
  );

  // node_modules/axios/lib/helpers/isAbsoluteURL.js
  function isAbsoluteURL(url) {
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
  }

  // node_modules/axios/lib/helpers/combineURLs.js
  function combineURLs(baseURL, relativeURL) {
    return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
  }

  // node_modules/axios/lib/core/buildFullPath.js
  function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
    let isRelativeUrl = !isAbsoluteURL(requestedURL);
    if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  }

  // node_modules/axios/lib/core/mergeConfig.js
  var headersToObject = (thing) => thing instanceof AxiosHeaders_default ? { ...thing } : thing;
  function mergeConfig(config1, config2) {
    config2 = config2 || {};
    const config = {};
    function getMergedValue(target, source, prop, caseless) {
      if (utils_default.isPlainObject(target) && utils_default.isPlainObject(source)) {
        return utils_default.merge.call({ caseless }, target, source);
      } else if (utils_default.isPlainObject(source)) {
        return utils_default.merge({}, source);
      } else if (utils_default.isArray(source)) {
        return source.slice();
      }
      return source;
    }
    function mergeDeepProperties(a, b, prop, caseless) {
      if (!utils_default.isUndefined(b)) {
        return getMergedValue(a, b, prop, caseless);
      } else if (!utils_default.isUndefined(a)) {
        return getMergedValue(void 0, a, prop, caseless);
      }
    }
    function valueFromConfig2(a, b) {
      if (!utils_default.isUndefined(b)) {
        return getMergedValue(void 0, b);
      }
    }
    function defaultToConfig2(a, b) {
      if (!utils_default.isUndefined(b)) {
        return getMergedValue(void 0, b);
      } else if (!utils_default.isUndefined(a)) {
        return getMergedValue(void 0, a);
      }
    }
    function mergeDirectKeys(a, b, prop) {
      if (prop in config2) {
        return getMergedValue(a, b);
      } else if (prop in config1) {
        return getMergedValue(void 0, a);
      }
    }
    const mergeMap = {
      url: valueFromConfig2,
      method: valueFromConfig2,
      data: valueFromConfig2,
      baseURL: defaultToConfig2,
      transformRequest: defaultToConfig2,
      transformResponse: defaultToConfig2,
      paramsSerializer: defaultToConfig2,
      timeout: defaultToConfig2,
      timeoutMessage: defaultToConfig2,
      withCredentials: defaultToConfig2,
      withXSRFToken: defaultToConfig2,
      adapter: defaultToConfig2,
      responseType: defaultToConfig2,
      xsrfCookieName: defaultToConfig2,
      xsrfHeaderName: defaultToConfig2,
      onUploadProgress: defaultToConfig2,
      onDownloadProgress: defaultToConfig2,
      decompress: defaultToConfig2,
      maxContentLength: defaultToConfig2,
      maxBodyLength: defaultToConfig2,
      beforeRedirect: defaultToConfig2,
      transport: defaultToConfig2,
      httpAgent: defaultToConfig2,
      httpsAgent: defaultToConfig2,
      cancelToken: defaultToConfig2,
      socketPath: defaultToConfig2,
      responseEncoding: defaultToConfig2,
      validateStatus: mergeDirectKeys,
      headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
    };
    utils_default.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
      const merge3 = mergeMap[prop] || mergeDeepProperties;
      const configValue = merge3(config1[prop], config2[prop], prop);
      utils_default.isUndefined(configValue) && merge3 !== mergeDirectKeys || (config[prop] = configValue);
    });
    return config;
  }

  // node_modules/axios/lib/helpers/resolveConfig.js
  var resolveConfig_default = (config) => {
    const newConfig = mergeConfig({}, config);
    let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
    newConfig.headers = headers = AxiosHeaders_default.from(headers);
    newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
    if (auth) {
      headers.set(
        "Authorization",
        "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
      );
    }
    if (utils_default.isFormData(data)) {
      if (platform_default.hasStandardBrowserEnv || platform_default.hasStandardBrowserWebWorkerEnv) {
        headers.setContentType(void 0);
      } else if (utils_default.isFunction(data.getHeaders)) {
        const formHeaders = data.getHeaders();
        const allowedHeaders = ["content-type", "content-length"];
        Object.entries(formHeaders).forEach(([key, val]) => {
          if (allowedHeaders.includes(key.toLowerCase())) {
            headers.set(key, val);
          }
        });
      }
    }
    if (platform_default.hasStandardBrowserEnv) {
      withXSRFToken && utils_default.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
      if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin_default(newConfig.url)) {
        const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies_default.read(xsrfCookieName);
        if (xsrfValue) {
          headers.set(xsrfHeaderName, xsrfValue);
        }
      }
    }
    return newConfig;
  };

  // node_modules/axios/lib/adapters/xhr.js
  var isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
  var xhr_default = isXHRAdapterSupported && function(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      const _config = resolveConfig_default(config);
      let requestData = _config.data;
      const requestHeaders = AxiosHeaders_default.from(_config.headers).normalize();
      let { responseType, onUploadProgress, onDownloadProgress } = _config;
      let onCanceled;
      let uploadThrottled, downloadThrottled;
      let flushUpload, flushDownload;
      function done() {
        flushUpload && flushUpload();
        flushDownload && flushDownload();
        _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
        _config.signal && _config.signal.removeEventListener("abort", onCanceled);
      }
      let request = new XMLHttpRequest();
      request.open(_config.method.toUpperCase(), _config.url, true);
      request.timeout = _config.timeout;
      function onloadend() {
        if (!request) {
          return;
        }
        const responseHeaders = AxiosHeaders_default.from(
          "getAllResponseHeaders" in request && request.getAllResponseHeaders()
        );
        const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
        const response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        };
        settle(function _resolve(value) {
          resolve(value);
          done();
        }, function _reject(err) {
          reject(err);
          done();
        }, response);
        request = null;
      }
      if ("onloadend" in request) {
        request.onloadend = onloadend;
      } else {
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
            return;
          }
          setTimeout(onloadend);
        };
      }
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }
        reject(new AxiosError_default("Request aborted", AxiosError_default.ECONNABORTED, config, request));
        request = null;
      };
      request.onerror = function handleError(event) {
        const msg = event && event.message ? event.message : "Network Error";
        const err = new AxiosError_default(msg, AxiosError_default.ERR_NETWORK, config, request);
        err.event = event || null;
        reject(err);
        request = null;
      };
      request.ontimeout = function handleTimeout() {
        let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
        const transitional2 = _config.transitional || transitional_default;
        if (_config.timeoutErrorMessage) {
          timeoutErrorMessage = _config.timeoutErrorMessage;
        }
        reject(new AxiosError_default(
          timeoutErrorMessage,
          transitional2.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED,
          config,
          request
        ));
        request = null;
      };
      requestData === void 0 && requestHeaders.setContentType(null);
      if ("setRequestHeader" in request) {
        utils_default.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
          request.setRequestHeader(key, val);
        });
      }
      if (!utils_default.isUndefined(_config.withCredentials)) {
        request.withCredentials = !!_config.withCredentials;
      }
      if (responseType && responseType !== "json") {
        request.responseType = _config.responseType;
      }
      if (onDownloadProgress) {
        [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
        request.addEventListener("progress", downloadThrottled);
      }
      if (onUploadProgress && request.upload) {
        [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
        request.upload.addEventListener("progress", uploadThrottled);
        request.upload.addEventListener("loadend", flushUpload);
      }
      if (_config.cancelToken || _config.signal) {
        onCanceled = (cancel) => {
          if (!request) {
            return;
          }
          reject(!cancel || cancel.type ? new CanceledError_default(null, config, request) : cancel);
          request.abort();
          request = null;
        };
        _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
        if (_config.signal) {
          _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
        }
      }
      const protocol = parseProtocol(_config.url);
      if (protocol && platform_default.protocols.indexOf(protocol) === -1) {
        reject(new AxiosError_default("Unsupported protocol " + protocol + ":", AxiosError_default.ERR_BAD_REQUEST, config));
        return;
      }
      request.send(requestData || null);
    });
  };

  // node_modules/axios/lib/helpers/composeSignals.js
  var composeSignals = (signals, timeout) => {
    const { length } = signals = signals ? signals.filter(Boolean) : [];
    if (timeout || length) {
      let controller = new AbortController();
      let aborted;
      const onabort = function(reason) {
        if (!aborted) {
          aborted = true;
          unsubscribe();
          const err = reason instanceof Error ? reason : this.reason;
          controller.abort(err instanceof AxiosError_default ? err : new CanceledError_default(err instanceof Error ? err.message : err));
        }
      };
      let timer = timeout && setTimeout(() => {
        timer = null;
        onabort(new AxiosError_default(`timeout ${timeout} of ms exceeded`, AxiosError_default.ETIMEDOUT));
      }, timeout);
      const unsubscribe = () => {
        if (signals) {
          timer && clearTimeout(timer);
          timer = null;
          signals.forEach((signal2) => {
            signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
          });
          signals = null;
        }
      };
      signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
      const { signal } = controller;
      signal.unsubscribe = () => utils_default.asap(unsubscribe);
      return signal;
    }
  };
  var composeSignals_default = composeSignals;

  // node_modules/axios/lib/helpers/trackStream.js
  var streamChunk = function* (chunk, chunkSize) {
    let len = chunk.byteLength;
    if (!chunkSize || len < chunkSize) {
      yield chunk;
      return;
    }
    let pos = 0;
    let end;
    while (pos < len) {
      end = pos + chunkSize;
      yield chunk.slice(pos, end);
      pos = end;
    }
  };
  var readBytes = async function* (iterable, chunkSize) {
    for await (const chunk of readStream(iterable)) {
      yield* streamChunk(chunk, chunkSize);
    }
  };
  var readStream = async function* (stream) {
    if (stream[Symbol.asyncIterator]) {
      yield* stream;
      return;
    }
    const reader = stream.getReader();
    try {
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        yield value;
      }
    } finally {
      await reader.cancel();
    }
  };
  var trackStream = (stream, chunkSize, onProgress, onFinish) => {
    const iterator2 = readBytes(stream, chunkSize);
    let bytes = 0;
    let done;
    let _onFinish = (e) => {
      if (!done) {
        done = true;
        onFinish && onFinish(e);
      }
    };
    return new ReadableStream({
      async pull(controller) {
        try {
          const { done: done2, value } = await iterator2.next();
          if (done2) {
            _onFinish();
            controller.close();
            return;
          }
          let len = value.byteLength;
          if (onProgress) {
            let loadedBytes = bytes += len;
            onProgress(loadedBytes);
          }
          controller.enqueue(new Uint8Array(value));
        } catch (err) {
          _onFinish(err);
          throw err;
        }
      },
      cancel(reason) {
        _onFinish(reason);
        return iterator2.return();
      }
    }, {
      highWaterMark: 2
    });
  };

  // node_modules/axios/lib/adapters/fetch.js
  var DEFAULT_CHUNK_SIZE = 64 * 1024;
  var { isFunction: isFunction2 } = utils_default;
  var globalFetchAPI = (({ Request, Response: Response2 }) => ({
    Request,
    Response: Response2
  }))(utils_default.global);
  var {
    ReadableStream: ReadableStream2,
    TextEncoder: TextEncoder2
  } = utils_default.global;
  var test = (fn, ...args) => {
    try {
      return !!fn(...args);
    } catch (e) {
      return false;
    }
  };
  var factory = (env) => {
    env = utils_default.merge.call({
      skipUndefined: true
    }, globalFetchAPI, env);
    const { fetch: envFetch, Request, Response: Response2 } = env;
    const isFetchSupported = envFetch ? isFunction2(envFetch) : typeof fetch === "function";
    const isRequestSupported = isFunction2(Request);
    const isResponseSupported = isFunction2(Response2);
    if (!isFetchSupported) {
      return false;
    }
    const isReadableStreamSupported = isFetchSupported && isFunction2(ReadableStream2);
    const encodeText = isFetchSupported && (typeof TextEncoder2 === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder2()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
    const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
      let duplexAccessed = false;
      const hasContentType = new Request(platform_default.origin, {
        body: new ReadableStream2(),
        method: "POST",
        get duplex() {
          duplexAccessed = true;
          return "half";
        }
      }).headers.has("Content-Type");
      return duplexAccessed && !hasContentType;
    });
    const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils_default.isReadableStream(new Response2("").body));
    const resolvers = {
      stream: supportsResponseStream && ((res) => res.body)
    };
    isFetchSupported && (() => {
      ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
        !resolvers[type] && (resolvers[type] = (res, config) => {
          let method = res && res[type];
          if (method) {
            return method.call(res);
          }
          throw new AxiosError_default(`Response type '${type}' is not supported`, AxiosError_default.ERR_NOT_SUPPORT, config);
        });
      });
    })();
    const getBodyLength = async (body) => {
      if (body == null) {
        return 0;
      }
      if (utils_default.isBlob(body)) {
        return body.size;
      }
      if (utils_default.isSpecCompliantForm(body)) {
        const _request = new Request(platform_default.origin, {
          method: "POST",
          body
        });
        return (await _request.arrayBuffer()).byteLength;
      }
      if (utils_default.isArrayBufferView(body) || utils_default.isArrayBuffer(body)) {
        return body.byteLength;
      }
      if (utils_default.isURLSearchParams(body)) {
        body = body + "";
      }
      if (utils_default.isString(body)) {
        return (await encodeText(body)).byteLength;
      }
    };
    const resolveBodyLength = async (headers, body) => {
      const length = utils_default.toFiniteNumber(headers.getContentLength());
      return length == null ? getBodyLength(body) : length;
    };
    return async (config) => {
      let {
        url,
        method,
        data,
        signal,
        cancelToken,
        timeout,
        onDownloadProgress,
        onUploadProgress,
        responseType,
        headers,
        withCredentials = "same-origin",
        fetchOptions
      } = resolveConfig_default(config);
      let _fetch = envFetch || fetch;
      responseType = responseType ? (responseType + "").toLowerCase() : "text";
      let composedSignal = composeSignals_default([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
      let request = null;
      const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
        composedSignal.unsubscribe();
      });
      let requestContentLength;
      try {
        if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
          let _request = new Request(url, {
            method: "POST",
            body: data,
            duplex: "half"
          });
          let contentTypeHeader;
          if (utils_default.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
            headers.setContentType(contentTypeHeader);
          }
          if (_request.body) {
            const [onProgress, flush] = progressEventDecorator(
              requestContentLength,
              progressEventReducer(asyncDecorator(onUploadProgress))
            );
            data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
          }
        }
        if (!utils_default.isString(withCredentials)) {
          withCredentials = withCredentials ? "include" : "omit";
        }
        const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
        const resolvedOptions = {
          ...fetchOptions,
          signal: composedSignal,
          method: method.toUpperCase(),
          headers: headers.normalize().toJSON(),
          body: data,
          duplex: "half",
          credentials: isCredentialsSupported ? withCredentials : void 0
        };
        request = isRequestSupported && new Request(url, resolvedOptions);
        let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
        const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
        if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
          const options = {};
          ["status", "statusText", "headers"].forEach((prop) => {
            options[prop] = response[prop];
          });
          const responseContentLength = utils_default.toFiniteNumber(response.headers.get("content-length"));
          const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
            responseContentLength,
            progressEventReducer(asyncDecorator(onDownloadProgress), true)
          ) || [];
          response = new Response2(
            trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
              flush && flush();
              unsubscribe && unsubscribe();
            }),
            options
          );
        }
        responseType = responseType || "text";
        let responseData = await resolvers[utils_default.findKey(resolvers, responseType) || "text"](response, config);
        !isStreamResponse && unsubscribe && unsubscribe();
        return await new Promise((resolve, reject) => {
          settle(resolve, reject, {
            data: responseData,
            headers: AxiosHeaders_default.from(response.headers),
            status: response.status,
            statusText: response.statusText,
            config,
            request
          });
        });
      } catch (err) {
        unsubscribe && unsubscribe();
        if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
          throw Object.assign(
            new AxiosError_default("Network Error", AxiosError_default.ERR_NETWORK, config, request),
            {
              cause: err.cause || err
            }
          );
        }
        throw AxiosError_default.from(err, err && err.code, config, request);
      }
    };
  };
  var seedCache = /* @__PURE__ */ new Map();
  var getFetch = (config) => {
    let env = config ? config.env : {};
    const { fetch: fetch2, Request, Response: Response2 } = env;
    const seeds = [
      Request,
      Response2,
      fetch2
    ];
    let len = seeds.length, i = len, seed, target, map = seedCache;
    while (i--) {
      seed = seeds[i];
      target = map.get(seed);
      target === void 0 && map.set(seed, target = i ? /* @__PURE__ */ new Map() : factory(env));
      map = target;
    }
    return target;
  };
  var adapter = getFetch();

  // node_modules/axios/lib/adapters/adapters.js
  var knownAdapters = {
    http: null_default,
    xhr: xhr_default,
    fetch: {
      get: getFetch
    }
  };
  utils_default.forEach(knownAdapters, (fn, value) => {
    if (fn) {
      try {
        Object.defineProperty(fn, "name", { value });
      } catch (e) {
      }
      Object.defineProperty(fn, "adapterName", { value });
    }
  });
  var renderReason = (reason) => `- ${reason}`;
  var isResolvedHandle = (adapter2) => utils_default.isFunction(adapter2) || adapter2 === null || adapter2 === false;
  var adapters_default = {
    getAdapter: (adapters, config) => {
      adapters = utils_default.isArray(adapters) ? adapters : [adapters];
      const { length } = adapters;
      let nameOrAdapter;
      let adapter2;
      const rejectedReasons = {};
      for (let i = 0; i < length; i++) {
        nameOrAdapter = adapters[i];
        let id;
        adapter2 = nameOrAdapter;
        if (!isResolvedHandle(nameOrAdapter)) {
          adapter2 = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
          if (adapter2 === void 0) {
            throw new AxiosError_default(`Unknown adapter '${id}'`);
          }
        }
        if (adapter2 && (utils_default.isFunction(adapter2) || (adapter2 = adapter2.get(config)))) {
          break;
        }
        rejectedReasons[id || "#" + i] = adapter2;
      }
      if (!adapter2) {
        const reasons = Object.entries(rejectedReasons).map(
          ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
        );
        let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
        throw new AxiosError_default(
          `There is no suitable adapter to dispatch the request ` + s,
          "ERR_NOT_SUPPORT"
        );
      }
      return adapter2;
    },
    adapters: knownAdapters
  };

  // node_modules/axios/lib/core/dispatchRequest.js
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }
    if (config.signal && config.signal.aborted) {
      throw new CanceledError_default(null, config);
    }
  }
  function dispatchRequest(config) {
    throwIfCancellationRequested(config);
    config.headers = AxiosHeaders_default.from(config.headers);
    config.data = transformData.call(
      config,
      config.transformRequest
    );
    if (["post", "put", "patch"].indexOf(config.method) !== -1) {
      config.headers.setContentType("application/x-www-form-urlencoded", false);
    }
    const adapter2 = adapters_default.getAdapter(config.adapter || defaults_default.adapter, config);
    return adapter2(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);
      response.data = transformData.call(
        config,
        config.transformResponse,
        response
      );
      response.headers = AxiosHeaders_default.from(response.headers);
      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);
        if (reason && reason.response) {
          reason.response.data = transformData.call(
            config,
            config.transformResponse,
            reason.response
          );
          reason.response.headers = AxiosHeaders_default.from(reason.response.headers);
        }
      }
      return Promise.reject(reason);
    });
  }

  // node_modules/axios/lib/env/data.js
  var VERSION = "1.12.2";

  // node_modules/axios/lib/helpers/validator.js
  var validators = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
    validators[type] = function validator(thing) {
      return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
    };
  });
  var deprecatedWarnings = {};
  validators.transitional = function transitional(validator, version, message) {
    function formatMessage(opt, desc) {
      return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
    }
    return (value, opt, opts) => {
      if (validator === false) {
        throw new AxiosError_default(
          formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
          AxiosError_default.ERR_DEPRECATED
        );
      }
      if (version && !deprecatedWarnings[opt]) {
        deprecatedWarnings[opt] = true;
        console.warn(
          formatMessage(
            opt,
            " has been deprecated since v" + version + " and will be removed in the near future"
          )
        );
      }
      return validator ? validator(value, opt, opts) : true;
    };
  };
  validators.spelling = function spelling(correctSpelling) {
    return (value, opt) => {
      console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
      return true;
    };
  };
  function assertOptions(options, schema, allowUnknown) {
    if (typeof options !== "object") {
      throw new AxiosError_default("options must be an object", AxiosError_default.ERR_BAD_OPTION_VALUE);
    }
    const keys = Object.keys(options);
    let i = keys.length;
    while (i-- > 0) {
      const opt = keys[i];
      const validator = schema[opt];
      if (validator) {
        const value = options[opt];
        const result = value === void 0 || validator(value, opt, options);
        if (result !== true) {
          throw new AxiosError_default("option " + opt + " must be " + result, AxiosError_default.ERR_BAD_OPTION_VALUE);
        }
        continue;
      }
      if (allowUnknown !== true) {
        throw new AxiosError_default("Unknown option " + opt, AxiosError_default.ERR_BAD_OPTION);
      }
    }
  }
  var validator_default = {
    assertOptions,
    validators
  };

  // node_modules/axios/lib/core/Axios.js
  var validators2 = validator_default.validators;
  var Axios = class {
    constructor(instanceConfig) {
      this.defaults = instanceConfig || {};
      this.interceptors = {
        request: new InterceptorManager_default(),
        response: new InterceptorManager_default()
      };
    }
    /**
     * Dispatch a request
     *
     * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
     * @param {?Object} config
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    async request(configOrUrl, config) {
      try {
        return await this._request(configOrUrl, config);
      } catch (err) {
        if (err instanceof Error) {
          let dummy = {};
          Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
          const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
          try {
            if (!err.stack) {
              err.stack = stack;
            } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
              err.stack += "\n" + stack;
            }
          } catch (e) {
          }
        }
        throw err;
      }
    }
    _request(configOrUrl, config) {
      if (typeof configOrUrl === "string") {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }
      config = mergeConfig(this.defaults, config);
      const { transitional: transitional2, paramsSerializer, headers } = config;
      if (transitional2 !== void 0) {
        validator_default.assertOptions(transitional2, {
          silentJSONParsing: validators2.transitional(validators2.boolean),
          forcedJSONParsing: validators2.transitional(validators2.boolean),
          clarifyTimeoutError: validators2.transitional(validators2.boolean)
        }, false);
      }
      if (paramsSerializer != null) {
        if (utils_default.isFunction(paramsSerializer)) {
          config.paramsSerializer = {
            serialize: paramsSerializer
          };
        } else {
          validator_default.assertOptions(paramsSerializer, {
            encode: validators2.function,
            serialize: validators2.function
          }, true);
        }
      }
      if (config.allowAbsoluteUrls !== void 0) {
      } else if (this.defaults.allowAbsoluteUrls !== void 0) {
        config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
      } else {
        config.allowAbsoluteUrls = true;
      }
      validator_default.assertOptions(config, {
        baseUrl: validators2.spelling("baseURL"),
        withXsrfToken: validators2.spelling("withXSRFToken")
      }, true);
      config.method = (config.method || this.defaults.method || "get").toLowerCase();
      let contextHeaders = headers && utils_default.merge(
        headers.common,
        headers[config.method]
      );
      headers && utils_default.forEach(
        ["delete", "get", "head", "post", "put", "patch", "common"],
        (method) => {
          delete headers[method];
        }
      );
      config.headers = AxiosHeaders_default.concat(contextHeaders, headers);
      const requestInterceptorChain = [];
      let synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
          return;
        }
        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });
      const responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });
      let promise;
      let i = 0;
      let len;
      if (!synchronousRequestInterceptors) {
        const chain = [dispatchRequest.bind(this), void 0];
        chain.unshift(...requestInterceptorChain);
        chain.push(...responseInterceptorChain);
        len = chain.length;
        promise = Promise.resolve(config);
        while (i < len) {
          promise = promise.then(chain[i++], chain[i++]);
        }
        return promise;
      }
      len = requestInterceptorChain.length;
      let newConfig = config;
      while (i < len) {
        const onFulfilled = requestInterceptorChain[i++];
        const onRejected = requestInterceptorChain[i++];
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected.call(this, error);
          break;
        }
      }
      try {
        promise = dispatchRequest.call(this, newConfig);
      } catch (error) {
        return Promise.reject(error);
      }
      i = 0;
      len = responseInterceptorChain.length;
      while (i < len) {
        promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
      }
      return promise;
    }
    getUri(config) {
      config = mergeConfig(this.defaults, config);
      const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
      return buildURL(fullPath, config.params, config.paramsSerializer);
    }
  };
  utils_default.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
    Axios.prototype[method] = function(url, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        url,
        data: (config || {}).data
      }));
    };
  });
  utils_default.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
    function generateHTTPMethod(isForm) {
      return function httpMethod(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          headers: isForm ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url,
          data
        }));
      };
    }
    Axios.prototype[method] = generateHTTPMethod();
    Axios.prototype[method + "Form"] = generateHTTPMethod(true);
  });
  var Axios_default = Axios;

  // node_modules/axios/lib/cancel/CancelToken.js
  var CancelToken = class _CancelToken {
    constructor(executor) {
      if (typeof executor !== "function") {
        throw new TypeError("executor must be a function.");
      }
      let resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });
      const token = this;
      this.promise.then((cancel) => {
        if (!token._listeners)
          return;
        let i = token._listeners.length;
        while (i-- > 0) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });
      this.promise.then = (onfulfilled) => {
        let _resolve;
        const promise = new Promise((resolve) => {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);
        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };
        return promise;
      };
      executor(function cancel(message, config, request) {
        if (token.reason) {
          return;
        }
        token.reason = new CanceledError_default(message, config, request);
        resolvePromise(token.reason);
      });
    }
    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    }
    /**
     * Subscribe to the cancel signal
     */
    subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }
      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    }
    /**
     * Unsubscribe from the cancel signal
     */
    unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      const index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    }
    toAbortSignal() {
      const controller = new AbortController();
      const abort = (err) => {
        controller.abort(err);
      };
      this.subscribe(abort);
      controller.signal.unsubscribe = () => this.unsubscribe(abort);
      return controller.signal;
    }
    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    static source() {
      let cancel;
      const token = new _CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token,
        cancel
      };
    }
  };
  var CancelToken_default = CancelToken;

  // node_modules/axios/lib/helpers/spread.js
  function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  }

  // node_modules/axios/lib/helpers/isAxiosError.js
  function isAxiosError(payload) {
    return utils_default.isObject(payload) && payload.isAxiosError === true;
  }

  // node_modules/axios/lib/helpers/HttpStatusCode.js
  var HttpStatusCode = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511
  };
  Object.entries(HttpStatusCode).forEach(([key, value]) => {
    HttpStatusCode[value] = key;
  });
  var HttpStatusCode_default = HttpStatusCode;

  // node_modules/axios/lib/axios.js
  function createInstance(defaultConfig) {
    const context = new Axios_default(defaultConfig);
    const instance = bind(Axios_default.prototype.request, context);
    utils_default.extend(instance, Axios_default.prototype, context, { allOwnKeys: true });
    utils_default.extend(instance, context, null, { allOwnKeys: true });
    instance.create = function create(instanceConfig) {
      return createInstance(mergeConfig(defaultConfig, instanceConfig));
    };
    return instance;
  }
  var axios = createInstance(defaults_default);
  axios.Axios = Axios_default;
  axios.CanceledError = CanceledError_default;
  axios.CancelToken = CancelToken_default;
  axios.isCancel = isCancel;
  axios.VERSION = VERSION;
  axios.toFormData = toFormData_default;
  axios.AxiosError = AxiosError_default;
  axios.Cancel = axios.CanceledError;
  axios.all = function all(promises) {
    return Promise.all(promises);
  };
  axios.spread = spread;
  axios.isAxiosError = isAxiosError;
  axios.mergeConfig = mergeConfig;
  axios.AxiosHeaders = AxiosHeaders_default;
  axios.formToJSON = (thing) => formDataToJSON_default(utils_default.isHTMLForm(thing) ? new FormData(thing) : thing);
  axios.getAdapter = adapters_default.getAdapter;
  axios.HttpStatusCode = HttpStatusCode_default;
  axios.default = axios;
  var axios_default = axios;

  // node_modules/axios/index.js
  var {
    Axios: Axios2,
    AxiosError: AxiosError2,
    CanceledError: CanceledError2,
    isCancel: isCancel2,
    CancelToken: CancelToken2,
    VERSION: VERSION2,
    all: all2,
    Cancel,
    isAxiosError: isAxiosError2,
    spread: spread2,
    toFormData: toFormData2,
    AxiosHeaders: AxiosHeaders2,
    HttpStatusCode: HttpStatusCode2,
    formToJSON,
    getAdapter,
    mergeConfig: mergeConfig2
  } = axios_default;

  // node_modules/uncrypto/dist/crypto.web.mjs
  var webCrypto = globalThis.crypto;
  var subtle = webCrypto.subtle;

  // node_modules/@upstash/redis/chunk-TAJI6TAE.mjs
  var __defProp2 = Object.defineProperty;
  var __export2 = (target, all3) => {
    for (var name in all3)
      __defProp2(target, name, { get: all3[name], enumerable: true });
  };
  var error_exports = {};
  __export2(error_exports, {
    UpstashError: () => UpstashError,
    UpstashJSONParseError: () => UpstashJSONParseError,
    UrlError: () => UrlError
  });
  var UpstashError = class extends Error {
    constructor(message, options) {
      super(message, options);
      this.name = "UpstashError";
    }
  };
  var UrlError = class extends Error {
    constructor(url) {
      super(
        `Upstash Redis client was passed an invalid URL. You should pass a URL starting with https. Received: "${url}". `
      );
      this.name = "UrlError";
    }
  };
  var UpstashJSONParseError = class extends UpstashError {
    constructor(body, options) {
      const truncatedBody = body.length > 200 ? body.slice(0, 200) + "..." : body;
      super(`Unable to parse response body: ${truncatedBody}`, options);
      this.name = "UpstashJSONParseError";
    }
  };
  function parseRecursive(obj) {
    const parsed = Array.isArray(obj) ? obj.map((o) => {
      try {
        return parseRecursive(o);
      } catch {
        return o;
      }
    }) : JSON.parse(obj);
    if (typeof parsed === "number" && parsed.toString() !== obj) {
      return obj;
    }
    return parsed;
  }
  function parseResponse(result) {
    try {
      return parseRecursive(result);
    } catch {
      return result;
    }
  }
  function deserializeScanResponse(result) {
    return [result[0], ...parseResponse(result.slice(1))];
  }
  function deserializeScanWithTypesResponse(result) {
    const [cursor, keys] = result;
    const parsedKeys = [];
    for (let i = 0; i < keys.length; i += 2) {
      parsedKeys.push({ key: keys[i], type: keys[i + 1] });
    }
    return [cursor, parsedKeys];
  }
  function mergeHeaders(...headers) {
    const merged = {};
    for (const header of headers) {
      if (!header)
        continue;
      for (const [key, value] of Object.entries(header)) {
        if (value !== void 0 && value !== null) {
          merged[key] = value;
        }
      }
    }
    return merged;
  }
  var HttpClient = class {
    baseUrl;
    headers;
    options;
    readYourWrites;
    upstashSyncToken = "";
    hasCredentials;
    retry;
    constructor(config) {
      this.options = {
        backend: config.options?.backend,
        agent: config.agent,
        responseEncoding: config.responseEncoding ?? "base64",
        // default to base64
        cache: config.cache,
        signal: config.signal,
        keepAlive: config.keepAlive ?? true
      };
      this.upstashSyncToken = "";
      this.readYourWrites = config.readYourWrites ?? true;
      this.baseUrl = (config.baseUrl || "").replace(/\/$/, "");
      const urlRegex = /^https?:\/\/[^\s#$./?].\S*$/;
      if (this.baseUrl && !urlRegex.test(this.baseUrl)) {
        throw new UrlError(this.baseUrl);
      }
      this.headers = {
        "Content-Type": "application/json",
        ...config.headers
      };
      this.hasCredentials = Boolean(this.baseUrl && this.headers.authorization.split(" ")[1]);
      if (this.options.responseEncoding === "base64") {
        this.headers["Upstash-Encoding"] = "base64";
      }
      this.retry = typeof config.retry === "boolean" && !config.retry ? {
        attempts: 1,
        backoff: () => 0
      } : {
        attempts: config.retry?.retries ?? 5,
        backoff: config.retry?.backoff ?? ((retryCount) => Math.exp(retryCount) * 50)
      };
    }
    mergeTelemetry(telemetry) {
      this.headers = merge2(this.headers, "Upstash-Telemetry-Runtime", telemetry.runtime);
      this.headers = merge2(this.headers, "Upstash-Telemetry-Platform", telemetry.platform);
      this.headers = merge2(this.headers, "Upstash-Telemetry-Sdk", telemetry.sdk);
    }
    async request(req) {
      const requestHeaders = mergeHeaders(this.headers, req.headers ?? {});
      const requestUrl = [this.baseUrl, ...req.path ?? []].join("/");
      const isEventStream = requestHeaders.Accept === "text/event-stream";
      const signal = req.signal ?? this.options.signal;
      const isSignalFunction = typeof signal === "function";
      const requestOptions = {
        //@ts-expect-error this should throw due to bun regression
        cache: this.options.cache,
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(req.body),
        keepalive: this.options.keepAlive,
        agent: this.options.agent,
        signal: isSignalFunction ? signal() : signal,
        /**
         * Fastly specific
         */
        backend: this.options.backend
      };
      if (!this.hasCredentials) {
        console.warn(
          "[Upstash Redis] Redis client was initialized without url or token. Failed to execute command."
        );
      }
      if (this.readYourWrites) {
        const newHeader = this.upstashSyncToken;
        this.headers["upstash-sync-token"] = newHeader;
      }
      let res = null;
      let error = null;
      for (let i = 0; i <= this.retry.attempts; i++) {
        try {
          res = await fetch(requestUrl, requestOptions);
          break;
        } catch (error_) {
          if (requestOptions.signal?.aborted && isSignalFunction) {
            throw error_;
          } else if (requestOptions.signal?.aborted) {
            const myBlob = new Blob([
              JSON.stringify({ result: requestOptions.signal.reason ?? "Aborted" })
            ]);
            const myOptions = {
              status: 200,
              statusText: requestOptions.signal.reason ?? "Aborted"
            };
            res = new Response(myBlob, myOptions);
            break;
          }
          error = error_;
          if (i < this.retry.attempts) {
            await new Promise((r) => setTimeout(r, this.retry.backoff(i)));
          }
        }
      }
      if (!res) {
        throw error ?? new Error("Exhausted all retries");
      }
      if (!res.ok) {
        let body2;
        const rawBody2 = await res.text();
        try {
          body2 = JSON.parse(rawBody2);
        } catch (error2) {
          throw new UpstashJSONParseError(rawBody2, { cause: error2 });
        }
        throw new UpstashError(`${body2.error}, command was: ${JSON.stringify(req.body)}`);
      }
      if (this.readYourWrites) {
        const headers = res.headers;
        this.upstashSyncToken = headers.get("upstash-sync-token") ?? "";
      }
      if (isEventStream && req && req.onMessage && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        (async () => {
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done)
                break;
              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");
              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  req.onMessage?.(data);
                }
              }
            }
          } catch (error2) {
            if (error2 instanceof Error && error2.name === "AbortError") {
            } else {
              console.error("Stream reading error:", error2);
            }
          } finally {
            try {
              await reader.cancel();
            } catch {
            }
          }
        })();
        return { result: 1 };
      }
      let body;
      const rawBody = await res.text();
      try {
        body = JSON.parse(rawBody);
      } catch (error2) {
        throw new UpstashJSONParseError(rawBody, { cause: error2 });
      }
      if (this.readYourWrites) {
        const headers = res.headers;
        this.upstashSyncToken = headers.get("upstash-sync-token") ?? "";
      }
      if (this.options.responseEncoding === "base64") {
        if (Array.isArray(body)) {
          return body.map(({ result: result2, error: error2 }) => ({
            result: decode(result2),
            error: error2
          }));
        }
        const result = decode(body.result);
        return { result, error: body.error };
      }
      return body;
    }
  };
  function base64decode(b64) {
    let dec = "";
    try {
      const binString = atob(b64);
      const size = binString.length;
      const bytes = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        bytes[i] = binString.charCodeAt(i);
      }
      dec = new TextDecoder().decode(bytes);
    } catch {
      dec = b64;
    }
    return dec;
  }
  function decode(raw) {
    let result = void 0;
    switch (typeof raw) {
      case "undefined": {
        return raw;
      }
      case "number": {
        result = raw;
        break;
      }
      case "object": {
        if (Array.isArray(raw)) {
          result = raw.map(
            (v) => typeof v === "string" ? base64decode(v) : Array.isArray(v) ? v.map((element) => decode(element)) : v
          );
        } else {
          result = null;
        }
        break;
      }
      case "string": {
        result = raw === "OK" ? "OK" : base64decode(raw);
        break;
      }
      default: {
        break;
      }
    }
    return result;
  }
  function merge2(obj, key, value) {
    if (!value) {
      return obj;
    }
    obj[key] = obj[key] ? [obj[key], value].join(",") : value;
    return obj;
  }
  var defaultSerializer = (c) => {
    switch (typeof c) {
      case "string":
      case "number":
      case "boolean": {
        return c;
      }
      default: {
        return JSON.stringify(c);
      }
    }
  };
  var Command = class {
    command;
    serialize;
    deserialize;
    headers;
    path;
    onMessage;
    isStreaming;
    signal;
    /**
     * Create a new command instance.
     *
     * You can define a custom `deserialize` function. By default we try to deserialize as json.
     */
    constructor(command, opts) {
      this.serialize = defaultSerializer;
      this.deserialize = opts?.automaticDeserialization === void 0 || opts.automaticDeserialization ? opts?.deserialize ?? parseResponse : (x) => x;
      this.command = command.map((c) => this.serialize(c));
      this.headers = opts?.headers;
      this.path = opts?.path;
      this.onMessage = opts?.streamOptions?.onMessage;
      this.isStreaming = opts?.streamOptions?.isStreaming ?? false;
      this.signal = opts?.streamOptions?.signal;
      if (opts?.latencyLogging) {
        const originalExec = this.exec.bind(this);
        this.exec = async (client) => {
          const start = performance.now();
          const result = await originalExec(client);
          const end = performance.now();
          const loggerResult = (end - start).toFixed(2);
          console.log(
            `Latency for \x1B[38;2;19;185;39m${this.command[0].toString().toUpperCase()}\x1B[0m: \x1B[38;2;0;255;255m${loggerResult} ms\x1B[0m`
          );
          return result;
        };
      }
    }
    /**
     * Execute the command using a client.
     */
    async exec(client) {
      const { result, error } = await client.request({
        body: this.command,
        path: this.path,
        upstashSyncToken: client.upstashSyncToken,
        headers: this.headers,
        onMessage: this.onMessage,
        isStreaming: this.isStreaming,
        signal: this.signal
      });
      if (error) {
        throw new UpstashError(error);
      }
      if (result === void 0) {
        throw new TypeError("Request did not return a result");
      }
      return this.deserialize(result);
    }
  };
  function deserialize(result) {
    if (result.length === 0) {
      return null;
    }
    const obj = {};
    for (let i = 0; i < result.length; i += 2) {
      const key = result[i];
      const value = result[i + 1];
      try {
        obj[key] = JSON.parse(value);
      } catch {
        obj[key] = value;
      }
    }
    return obj;
  }
  var HRandFieldCommand = class extends Command {
    constructor(cmd, opts) {
      const command = ["hrandfield", cmd[0]];
      if (typeof cmd[1] === "number") {
        command.push(cmd[1]);
      }
      if (cmd[2]) {
        command.push("WITHVALUES");
      }
      super(command, {
        // @ts-expect-error to silence compiler
        deserialize: cmd[2] ? (result) => deserialize(result) : opts?.deserialize,
        ...opts
      });
    }
  };
  var AppendCommand = class extends Command {
    constructor(cmd, opts) {
      super(["append", ...cmd], opts);
    }
  };
  var BitCountCommand = class extends Command {
    constructor([key, start, end], opts) {
      const command = ["bitcount", key];
      if (typeof start === "number") {
        command.push(start);
      }
      if (typeof end === "number") {
        command.push(end);
      }
      super(command, opts);
    }
  };
  var BitFieldCommand = class {
    constructor(args, client, opts, execOperation = (command) => command.exec(this.client)) {
      this.client = client;
      this.opts = opts;
      this.execOperation = execOperation;
      this.command = ["bitfield", ...args];
    }
    command;
    chain(...args) {
      this.command.push(...args);
      return this;
    }
    get(...args) {
      return this.chain("get", ...args);
    }
    set(...args) {
      return this.chain("set", ...args);
    }
    incrby(...args) {
      return this.chain("incrby", ...args);
    }
    overflow(overflow) {
      return this.chain("overflow", overflow);
    }
    exec() {
      const command = new Command(this.command, this.opts);
      return this.execOperation(command);
    }
  };
  var BitOpCommand = class extends Command {
    constructor(cmd, opts) {
      super(["bitop", ...cmd], opts);
    }
  };
  var BitPosCommand = class extends Command {
    constructor(cmd, opts) {
      super(["bitpos", ...cmd], opts);
    }
  };
  var CopyCommand = class extends Command {
    constructor([key, destinationKey, opts], commandOptions) {
      super(["COPY", key, destinationKey, ...opts?.replace ? ["REPLACE"] : []], {
        ...commandOptions,
        deserialize(result) {
          if (result > 0) {
            return "COPIED";
          }
          return "NOT_COPIED";
        }
      });
    }
  };
  var DBSizeCommand = class extends Command {
    constructor(opts) {
      super(["dbsize"], opts);
    }
  };
  var DecrCommand = class extends Command {
    constructor(cmd, opts) {
      super(["decr", ...cmd], opts);
    }
  };
  var DecrByCommand = class extends Command {
    constructor(cmd, opts) {
      super(["decrby", ...cmd], opts);
    }
  };
  var DelCommand = class extends Command {
    constructor(cmd, opts) {
      super(["del", ...cmd], opts);
    }
  };
  var EchoCommand = class extends Command {
    constructor(cmd, opts) {
      super(["echo", ...cmd], opts);
    }
  };
  var EvalROCommand = class extends Command {
    constructor([script, keys, args], opts) {
      super(["eval_ro", script, keys.length, ...keys, ...args ?? []], opts);
    }
  };
  var EvalCommand = class extends Command {
    constructor([script, keys, args], opts) {
      super(["eval", script, keys.length, ...keys, ...args ?? []], opts);
    }
  };
  var EvalshaROCommand = class extends Command {
    constructor([sha, keys, args], opts) {
      super(["evalsha_ro", sha, keys.length, ...keys, ...args ?? []], opts);
    }
  };
  var EvalshaCommand = class extends Command {
    constructor([sha, keys, args], opts) {
      super(["evalsha", sha, keys.length, ...keys, ...args ?? []], opts);
    }
  };
  var ExecCommand = class extends Command {
    constructor(cmd, opts) {
      const normalizedCmd = cmd.map((arg) => typeof arg === "string" ? arg : String(arg));
      super(normalizedCmd, opts);
    }
  };
  var ExistsCommand = class extends Command {
    constructor(cmd, opts) {
      super(["exists", ...cmd], opts);
    }
  };
  var ExpireCommand = class extends Command {
    constructor(cmd, opts) {
      super(["expire", ...cmd.filter(Boolean)], opts);
    }
  };
  var ExpireAtCommand = class extends Command {
    constructor(cmd, opts) {
      super(["expireat", ...cmd], opts);
    }
  };
  var FlushAllCommand = class extends Command {
    constructor(args, opts) {
      const command = ["flushall"];
      if (args && args.length > 0 && args[0].async) {
        command.push("async");
      }
      super(command, opts);
    }
  };
  var FlushDBCommand = class extends Command {
    constructor([opts], cmdOpts) {
      const command = ["flushdb"];
      if (opts?.async) {
        command.push("async");
      }
      super(command, cmdOpts);
    }
  };
  var GeoAddCommand = class extends Command {
    constructor([key, arg1, ...arg2], opts) {
      const command = ["geoadd", key];
      if ("nx" in arg1 && arg1.nx) {
        command.push("nx");
      } else if ("xx" in arg1 && arg1.xx) {
        command.push("xx");
      }
      if ("ch" in arg1 && arg1.ch) {
        command.push("ch");
      }
      if ("latitude" in arg1 && arg1.latitude) {
        command.push(arg1.longitude, arg1.latitude, arg1.member);
      }
      command.push(
        ...arg2.flatMap(({ latitude, longitude, member }) => [longitude, latitude, member])
      );
      super(command, opts);
    }
  };
  var GeoDistCommand = class extends Command {
    constructor([key, member1, member2, unit = "M"], opts) {
      super(["GEODIST", key, member1, member2, unit], opts);
    }
  };
  var GeoHashCommand = class extends Command {
    constructor(cmd, opts) {
      const [key] = cmd;
      const members = Array.isArray(cmd[1]) ? cmd[1] : cmd.slice(1);
      super(["GEOHASH", key, ...members], opts);
    }
  };
  var GeoPosCommand = class extends Command {
    constructor(cmd, opts) {
      const [key] = cmd;
      const members = Array.isArray(cmd[1]) ? cmd[1] : cmd.slice(1);
      super(["GEOPOS", key, ...members], {
        deserialize: (result) => transform(result),
        ...opts
      });
    }
  };
  function transform(result) {
    const final = [];
    for (const pos of result) {
      if (!pos?.[0] || !pos?.[1]) {
        continue;
      }
      final.push({ lng: Number.parseFloat(pos[0]), lat: Number.parseFloat(pos[1]) });
    }
    return final;
  }
  var GeoSearchCommand = class extends Command {
    constructor([key, centerPoint, shape, order, opts], commandOptions) {
      const command = ["GEOSEARCH", key];
      if (centerPoint.type === "FROMMEMBER" || centerPoint.type === "frommember") {
        command.push(centerPoint.type, centerPoint.member);
      }
      if (centerPoint.type === "FROMLONLAT" || centerPoint.type === "fromlonlat") {
        command.push(centerPoint.type, centerPoint.coordinate.lon, centerPoint.coordinate.lat);
      }
      if (shape.type === "BYRADIUS" || shape.type === "byradius") {
        command.push(shape.type, shape.radius, shape.radiusType);
      }
      if (shape.type === "BYBOX" || shape.type === "bybox") {
        command.push(shape.type, shape.rect.width, shape.rect.height, shape.rectType);
      }
      command.push(order);
      if (opts?.count) {
        command.push("COUNT", opts.count.limit, ...opts.count.any ? ["ANY"] : []);
      }
      const transform2 = (result) => {
        if (!opts?.withCoord && !opts?.withDist && !opts?.withHash) {
          return result.map((member) => {
            try {
              return { member: JSON.parse(member) };
            } catch {
              return { member };
            }
          });
        }
        return result.map((members) => {
          let counter = 1;
          const obj = {};
          try {
            obj.member = JSON.parse(members[0]);
          } catch {
            obj.member = members[0];
          }
          if (opts.withDist) {
            obj.dist = Number.parseFloat(members[counter++]);
          }
          if (opts.withHash) {
            obj.hash = members[counter++].toString();
          }
          if (opts.withCoord) {
            obj.coord = {
              long: Number.parseFloat(members[counter][0]),
              lat: Number.parseFloat(members[counter][1])
            };
          }
          return obj;
        });
      };
      super(
        [
          ...command,
          ...opts?.withCoord ? ["WITHCOORD"] : [],
          ...opts?.withDist ? ["WITHDIST"] : [],
          ...opts?.withHash ? ["WITHHASH"] : []
        ],
        {
          deserialize: transform2,
          ...commandOptions
        }
      );
    }
  };
  var GeoSearchStoreCommand = class extends Command {
    constructor([destination, key, centerPoint, shape, order, opts], commandOptions) {
      const command = ["GEOSEARCHSTORE", destination, key];
      if (centerPoint.type === "FROMMEMBER" || centerPoint.type === "frommember") {
        command.push(centerPoint.type, centerPoint.member);
      }
      if (centerPoint.type === "FROMLONLAT" || centerPoint.type === "fromlonlat") {
        command.push(centerPoint.type, centerPoint.coordinate.lon, centerPoint.coordinate.lat);
      }
      if (shape.type === "BYRADIUS" || shape.type === "byradius") {
        command.push(shape.type, shape.radius, shape.radiusType);
      }
      if (shape.type === "BYBOX" || shape.type === "bybox") {
        command.push(shape.type, shape.rect.width, shape.rect.height, shape.rectType);
      }
      command.push(order);
      if (opts?.count) {
        command.push("COUNT", opts.count.limit, ...opts.count.any ? ["ANY"] : []);
      }
      super([...command, ...opts?.storeDist ? ["STOREDIST"] : []], commandOptions);
    }
  };
  var GetCommand = class extends Command {
    constructor(cmd, opts) {
      super(["get", ...cmd], opts);
    }
  };
  var GetBitCommand = class extends Command {
    constructor(cmd, opts) {
      super(["getbit", ...cmd], opts);
    }
  };
  var GetDelCommand = class extends Command {
    constructor(cmd, opts) {
      super(["getdel", ...cmd], opts);
    }
  };
  var GetExCommand = class extends Command {
    constructor([key, opts], cmdOpts) {
      const command = ["getex", key];
      if (opts) {
        if ("ex" in opts && typeof opts.ex === "number") {
          command.push("ex", opts.ex);
        } else if ("px" in opts && typeof opts.px === "number") {
          command.push("px", opts.px);
        } else if ("exat" in opts && typeof opts.exat === "number") {
          command.push("exat", opts.exat);
        } else if ("pxat" in opts && typeof opts.pxat === "number") {
          command.push("pxat", opts.pxat);
        } else if ("persist" in opts && opts.persist) {
          command.push("persist");
        }
      }
      super(command, cmdOpts);
    }
  };
  var GetRangeCommand = class extends Command {
    constructor(cmd, opts) {
      super(["getrange", ...cmd], opts);
    }
  };
  var GetSetCommand = class extends Command {
    constructor(cmd, opts) {
      super(["getset", ...cmd], opts);
    }
  };
  var HDelCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hdel", ...cmd], opts);
    }
  };
  var HExistsCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hexists", ...cmd], opts);
    }
  };
  var HExpireCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields, seconds, option] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(
        [
          "hexpire",
          key,
          seconds,
          ...option ? [option] : [],
          "FIELDS",
          fieldArray.length,
          ...fieldArray
        ],
        opts
      );
    }
  };
  var HExpireAtCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields, timestamp, option] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(
        [
          "hexpireat",
          key,
          timestamp,
          ...option ? [option] : [],
          "FIELDS",
          fieldArray.length,
          ...fieldArray
        ],
        opts
      );
    }
  };
  var HExpireTimeCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(["hexpiretime", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
    }
  };
  var HPersistCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(["hpersist", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
    }
  };
  var HPExpireCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields, milliseconds, option] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(
        [
          "hpexpire",
          key,
          milliseconds,
          ...option ? [option] : [],
          "FIELDS",
          fieldArray.length,
          ...fieldArray
        ],
        opts
      );
    }
  };
  var HPExpireAtCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields, timestamp, option] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(
        [
          "hpexpireat",
          key,
          timestamp,
          ...option ? [option] : [],
          "FIELDS",
          fieldArray.length,
          ...fieldArray
        ],
        opts
      );
    }
  };
  var HPExpireTimeCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(["hpexpiretime", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
    }
  };
  var HPTtlCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(["hpttl", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
    }
  };
  var HGetCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hget", ...cmd], opts);
    }
  };
  function deserialize2(result) {
    if (result.length === 0) {
      return null;
    }
    const obj = {};
    for (let i = 0; i < result.length; i += 2) {
      const key = result[i];
      const value = result[i + 1];
      try {
        const valueIsNumberAndNotSafeInteger = !Number.isNaN(Number(value)) && !Number.isSafeInteger(Number(value));
        obj[key] = valueIsNumberAndNotSafeInteger ? value : JSON.parse(value);
      } catch {
        obj[key] = value;
      }
    }
    return obj;
  }
  var HGetAllCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hgetall", ...cmd], {
        deserialize: (result) => deserialize2(result),
        ...opts
      });
    }
  };
  var HIncrByCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hincrby", ...cmd], opts);
    }
  };
  var HIncrByFloatCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hincrbyfloat", ...cmd], opts);
    }
  };
  var HKeysCommand = class extends Command {
    constructor([key], opts) {
      super(["hkeys", key], opts);
    }
  };
  var HLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hlen", ...cmd], opts);
    }
  };
  function deserialize3(fields, result) {
    if (result.every((field) => field === null)) {
      return null;
    }
    const obj = {};
    for (const [i, field] of fields.entries()) {
      try {
        obj[field] = JSON.parse(result[i]);
      } catch {
        obj[field] = result[i];
      }
    }
    return obj;
  }
  var HMGetCommand = class extends Command {
    constructor([key, ...fields], opts) {
      super(["hmget", key, ...fields], {
        deserialize: (result) => deserialize3(fields, result),
        ...opts
      });
    }
  };
  var HMSetCommand = class extends Command {
    constructor([key, kv2], opts) {
      super(["hmset", key, ...Object.entries(kv2).flatMap(([field, value]) => [field, value])], opts);
    }
  };
  var HScanCommand = class extends Command {
    constructor([key, cursor, cmdOpts], opts) {
      const command = ["hscan", key, cursor];
      if (cmdOpts?.match) {
        command.push("match", cmdOpts.match);
      }
      if (typeof cmdOpts?.count === "number") {
        command.push("count", cmdOpts.count);
      }
      super(command, {
        deserialize: deserializeScanResponse,
        ...opts
      });
    }
  };
  var HSetCommand = class extends Command {
    constructor([key, kv2], opts) {
      super(["hset", key, ...Object.entries(kv2).flatMap(([field, value]) => [field, value])], opts);
    }
  };
  var HSetNXCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hsetnx", ...cmd], opts);
    }
  };
  var HStrLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hstrlen", ...cmd], opts);
    }
  };
  var HTtlCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(["httl", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
    }
  };
  var HValsCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hvals", ...cmd], opts);
    }
  };
  var IncrCommand = class extends Command {
    constructor(cmd, opts) {
      super(["incr", ...cmd], opts);
    }
  };
  var IncrByCommand = class extends Command {
    constructor(cmd, opts) {
      super(["incrby", ...cmd], opts);
    }
  };
  var IncrByFloatCommand = class extends Command {
    constructor(cmd, opts) {
      super(["incrbyfloat", ...cmd], opts);
    }
  };
  var JsonArrAppendCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.ARRAPPEND", ...cmd], opts);
    }
  };
  var JsonArrIndexCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.ARRINDEX", ...cmd], opts);
    }
  };
  var JsonArrInsertCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.ARRINSERT", ...cmd], opts);
    }
  };
  var JsonArrLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.ARRLEN", cmd[0], cmd[1] ?? "$"], opts);
    }
  };
  var JsonArrPopCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.ARRPOP", ...cmd], opts);
    }
  };
  var JsonArrTrimCommand = class extends Command {
    constructor(cmd, opts) {
      const path = cmd[1] ?? "$";
      const start = cmd[2] ?? 0;
      const stop = cmd[3] ?? 0;
      super(["JSON.ARRTRIM", cmd[0], path, start, stop], opts);
    }
  };
  var JsonClearCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.CLEAR", ...cmd], opts);
    }
  };
  var JsonDelCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.DEL", ...cmd], opts);
    }
  };
  var JsonForgetCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.FORGET", ...cmd], opts);
    }
  };
  var JsonGetCommand = class extends Command {
    constructor(cmd, opts) {
      const command = ["JSON.GET"];
      if (typeof cmd[1] === "string") {
        command.push(...cmd);
      } else {
        command.push(cmd[0]);
        if (cmd[1]) {
          if (cmd[1].indent) {
            command.push("INDENT", cmd[1].indent);
          }
          if (cmd[1].newline) {
            command.push("NEWLINE", cmd[1].newline);
          }
          if (cmd[1].space) {
            command.push("SPACE", cmd[1].space);
          }
        }
        command.push(...cmd.slice(2));
      }
      super(command, opts);
    }
  };
  var JsonMergeCommand = class extends Command {
    constructor(cmd, opts) {
      const command = ["JSON.MERGE", ...cmd];
      super(command, opts);
    }
  };
  var JsonMGetCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.MGET", ...cmd[0], cmd[1]], opts);
    }
  };
  var JsonMSetCommand = class extends Command {
    constructor(cmd, opts) {
      const command = ["JSON.MSET"];
      for (const c of cmd) {
        command.push(c.key, c.path, c.value);
      }
      super(command, opts);
    }
  };
  var JsonNumIncrByCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.NUMINCRBY", ...cmd], opts);
    }
  };
  var JsonNumMultByCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.NUMMULTBY", ...cmd], opts);
    }
  };
  var JsonObjKeysCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.OBJKEYS", ...cmd], opts);
    }
  };
  var JsonObjLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.OBJLEN", ...cmd], opts);
    }
  };
  var JsonRespCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.RESP", ...cmd], opts);
    }
  };
  var JsonSetCommand = class extends Command {
    constructor(cmd, opts) {
      const command = ["JSON.SET", cmd[0], cmd[1], cmd[2]];
      if (cmd[3]) {
        if (cmd[3].nx) {
          command.push("NX");
        } else if (cmd[3].xx) {
          command.push("XX");
        }
      }
      super(command, opts);
    }
  };
  var JsonStrAppendCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.STRAPPEND", ...cmd], opts);
    }
  };
  var JsonStrLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.STRLEN", ...cmd], opts);
    }
  };
  var JsonToggleCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.TOGGLE", ...cmd], opts);
    }
  };
  var JsonTypeCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.TYPE", ...cmd], opts);
    }
  };
  var KeysCommand = class extends Command {
    constructor(cmd, opts) {
      super(["keys", ...cmd], opts);
    }
  };
  var LIndexCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lindex", ...cmd], opts);
    }
  };
  var LInsertCommand = class extends Command {
    constructor(cmd, opts) {
      super(["linsert", ...cmd], opts);
    }
  };
  var LLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["llen", ...cmd], opts);
    }
  };
  var LMoveCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lmove", ...cmd], opts);
    }
  };
  var LmPopCommand = class extends Command {
    constructor(cmd, opts) {
      const [numkeys, keys, direction, count] = cmd;
      super(["LMPOP", numkeys, ...keys, direction, ...count ? ["COUNT", count] : []], opts);
    }
  };
  var LPopCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lpop", ...cmd], opts);
    }
  };
  var LPosCommand = class extends Command {
    constructor(cmd, opts) {
      const args = ["lpos", cmd[0], cmd[1]];
      if (typeof cmd[2]?.rank === "number") {
        args.push("rank", cmd[2].rank);
      }
      if (typeof cmd[2]?.count === "number") {
        args.push("count", cmd[2].count);
      }
      if (typeof cmd[2]?.maxLen === "number") {
        args.push("maxLen", cmd[2].maxLen);
      }
      super(args, opts);
    }
  };
  var LPushCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lpush", ...cmd], opts);
    }
  };
  var LPushXCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lpushx", ...cmd], opts);
    }
  };
  var LRangeCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lrange", ...cmd], opts);
    }
  };
  var LRemCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lrem", ...cmd], opts);
    }
  };
  var LSetCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lset", ...cmd], opts);
    }
  };
  var LTrimCommand = class extends Command {
    constructor(cmd, opts) {
      super(["ltrim", ...cmd], opts);
    }
  };
  var MGetCommand = class extends Command {
    constructor(cmd, opts) {
      const keys = Array.isArray(cmd[0]) ? cmd[0] : cmd;
      super(["mget", ...keys], opts);
    }
  };
  var MSetCommand = class extends Command {
    constructor([kv2], opts) {
      super(["mset", ...Object.entries(kv2).flatMap(([key, value]) => [key, value])], opts);
    }
  };
  var MSetNXCommand = class extends Command {
    constructor([kv2], opts) {
      super(["msetnx", ...Object.entries(kv2).flat()], opts);
    }
  };
  var PersistCommand = class extends Command {
    constructor(cmd, opts) {
      super(["persist", ...cmd], opts);
    }
  };
  var PExpireCommand = class extends Command {
    constructor(cmd, opts) {
      super(["pexpire", ...cmd], opts);
    }
  };
  var PExpireAtCommand = class extends Command {
    constructor(cmd, opts) {
      super(["pexpireat", ...cmd], opts);
    }
  };
  var PfAddCommand = class extends Command {
    constructor(cmd, opts) {
      super(["pfadd", ...cmd], opts);
    }
  };
  var PfCountCommand = class extends Command {
    constructor(cmd, opts) {
      super(["pfcount", ...cmd], opts);
    }
  };
  var PfMergeCommand = class extends Command {
    constructor(cmd, opts) {
      super(["pfmerge", ...cmd], opts);
    }
  };
  var PingCommand = class extends Command {
    constructor(cmd, opts) {
      const command = ["ping"];
      if (cmd?.[0] !== void 0) {
        command.push(cmd[0]);
      }
      super(command, opts);
    }
  };
  var PSetEXCommand = class extends Command {
    constructor(cmd, opts) {
      super(["psetex", ...cmd], opts);
    }
  };
  var PTtlCommand = class extends Command {
    constructor(cmd, opts) {
      super(["pttl", ...cmd], opts);
    }
  };
  var PublishCommand = class extends Command {
    constructor(cmd, opts) {
      super(["publish", ...cmd], opts);
    }
  };
  var RandomKeyCommand = class extends Command {
    constructor(opts) {
      super(["randomkey"], opts);
    }
  };
  var RenameCommand = class extends Command {
    constructor(cmd, opts) {
      super(["rename", ...cmd], opts);
    }
  };
  var RenameNXCommand = class extends Command {
    constructor(cmd, opts) {
      super(["renamenx", ...cmd], opts);
    }
  };
  var RPopCommand = class extends Command {
    constructor(cmd, opts) {
      super(["rpop", ...cmd], opts);
    }
  };
  var RPushCommand = class extends Command {
    constructor(cmd, opts) {
      super(["rpush", ...cmd], opts);
    }
  };
  var RPushXCommand = class extends Command {
    constructor(cmd, opts) {
      super(["rpushx", ...cmd], opts);
    }
  };
  var SAddCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sadd", ...cmd], opts);
    }
  };
  var ScanCommand = class extends Command {
    constructor([cursor, opts], cmdOpts) {
      const command = ["scan", cursor];
      if (opts?.match) {
        command.push("match", opts.match);
      }
      if (typeof opts?.count === "number") {
        command.push("count", opts.count);
      }
      if (opts && "withType" in opts && opts.withType === true) {
        command.push("withtype");
      } else if (opts && "type" in opts && opts.type && opts.type.length > 0) {
        command.push("type", opts.type);
      }
      super(command, {
        // @ts-expect-error ignore types here
        deserialize: opts?.withType ? deserializeScanWithTypesResponse : deserializeScanResponse,
        ...cmdOpts
      });
    }
  };
  var SCardCommand = class extends Command {
    constructor(cmd, opts) {
      super(["scard", ...cmd], opts);
    }
  };
  var ScriptExistsCommand = class extends Command {
    constructor(hashes, opts) {
      super(["script", "exists", ...hashes], {
        deserialize: (result) => result,
        ...opts
      });
    }
  };
  var ScriptFlushCommand = class extends Command {
    constructor([opts], cmdOpts) {
      const cmd = ["script", "flush"];
      if (opts?.sync) {
        cmd.push("sync");
      } else if (opts?.async) {
        cmd.push("async");
      }
      super(cmd, cmdOpts);
    }
  };
  var ScriptLoadCommand = class extends Command {
    constructor(args, opts) {
      super(["script", "load", ...args], opts);
    }
  };
  var SDiffCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sdiff", ...cmd], opts);
    }
  };
  var SDiffStoreCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sdiffstore", ...cmd], opts);
    }
  };
  var SetCommand = class extends Command {
    constructor([key, value, opts], cmdOpts) {
      const command = ["set", key, value];
      if (opts) {
        if ("nx" in opts && opts.nx) {
          command.push("nx");
        } else if ("xx" in opts && opts.xx) {
          command.push("xx");
        }
        if ("get" in opts && opts.get) {
          command.push("get");
        }
        if ("ex" in opts && typeof opts.ex === "number") {
          command.push("ex", opts.ex);
        } else if ("px" in opts && typeof opts.px === "number") {
          command.push("px", opts.px);
        } else if ("exat" in opts && typeof opts.exat === "number") {
          command.push("exat", opts.exat);
        } else if ("pxat" in opts && typeof opts.pxat === "number") {
          command.push("pxat", opts.pxat);
        } else if ("keepTtl" in opts && opts.keepTtl) {
          command.push("keepTtl");
        }
      }
      super(command, cmdOpts);
    }
  };
  var SetBitCommand = class extends Command {
    constructor(cmd, opts) {
      super(["setbit", ...cmd], opts);
    }
  };
  var SetExCommand = class extends Command {
    constructor(cmd, opts) {
      super(["setex", ...cmd], opts);
    }
  };
  var SetNxCommand = class extends Command {
    constructor(cmd, opts) {
      super(["setnx", ...cmd], opts);
    }
  };
  var SetRangeCommand = class extends Command {
    constructor(cmd, opts) {
      super(["setrange", ...cmd], opts);
    }
  };
  var SInterCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sinter", ...cmd], opts);
    }
  };
  var SInterStoreCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sinterstore", ...cmd], opts);
    }
  };
  var SIsMemberCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sismember", ...cmd], opts);
    }
  };
  var SMembersCommand = class extends Command {
    constructor(cmd, opts) {
      super(["smembers", ...cmd], opts);
    }
  };
  var SMIsMemberCommand = class extends Command {
    constructor(cmd, opts) {
      super(["smismember", cmd[0], ...cmd[1]], opts);
    }
  };
  var SMoveCommand = class extends Command {
    constructor(cmd, opts) {
      super(["smove", ...cmd], opts);
    }
  };
  var SPopCommand = class extends Command {
    constructor([key, count], opts) {
      const command = ["spop", key];
      if (typeof count === "number") {
        command.push(count);
      }
      super(command, opts);
    }
  };
  var SRandMemberCommand = class extends Command {
    constructor([key, count], opts) {
      const command = ["srandmember", key];
      if (typeof count === "number") {
        command.push(count);
      }
      super(command, opts);
    }
  };
  var SRemCommand = class extends Command {
    constructor(cmd, opts) {
      super(["srem", ...cmd], opts);
    }
  };
  var SScanCommand = class extends Command {
    constructor([key, cursor, opts], cmdOpts) {
      const command = ["sscan", key, cursor];
      if (opts?.match) {
        command.push("match", opts.match);
      }
      if (typeof opts?.count === "number") {
        command.push("count", opts.count);
      }
      super(command, {
        deserialize: deserializeScanResponse,
        ...cmdOpts
      });
    }
  };
  var StrLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["strlen", ...cmd], opts);
    }
  };
  var SUnionCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sunion", ...cmd], opts);
    }
  };
  var SUnionStoreCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sunionstore", ...cmd], opts);
    }
  };
  var TimeCommand = class extends Command {
    constructor(opts) {
      super(["time"], opts);
    }
  };
  var TouchCommand = class extends Command {
    constructor(cmd, opts) {
      super(["touch", ...cmd], opts);
    }
  };
  var TtlCommand = class extends Command {
    constructor(cmd, opts) {
      super(["ttl", ...cmd], opts);
    }
  };
  var TypeCommand = class extends Command {
    constructor(cmd, opts) {
      super(["type", ...cmd], opts);
    }
  };
  var UnlinkCommand = class extends Command {
    constructor(cmd, opts) {
      super(["unlink", ...cmd], opts);
    }
  };
  var XAckCommand = class extends Command {
    constructor([key, group, id], opts) {
      const ids = Array.isArray(id) ? [...id] : [id];
      super(["XACK", key, group, ...ids], opts);
    }
  };
  var XAddCommand = class extends Command {
    constructor([key, id, entries, opts], commandOptions) {
      const command = ["XADD", key];
      if (opts) {
        if (opts.nomkStream) {
          command.push("NOMKSTREAM");
        }
        if (opts.trim) {
          command.push(opts.trim.type, opts.trim.comparison, opts.trim.threshold);
          if (opts.trim.limit !== void 0) {
            command.push("LIMIT", opts.trim.limit);
          }
        }
      }
      command.push(id);
      for (const [k, v] of Object.entries(entries)) {
        command.push(k, v);
      }
      super(command, commandOptions);
    }
  };
  var XAutoClaim = class extends Command {
    constructor([key, group, consumer, minIdleTime, start, options], opts) {
      const commands = [];
      if (options?.count) {
        commands.push("COUNT", options.count);
      }
      if (options?.justId) {
        commands.push("JUSTID");
      }
      super(["XAUTOCLAIM", key, group, consumer, minIdleTime, start, ...commands], opts);
    }
  };
  var XClaimCommand = class extends Command {
    constructor([key, group, consumer, minIdleTime, id, options], opts) {
      const ids = Array.isArray(id) ? [...id] : [id];
      const commands = [];
      if (options?.idleMS) {
        commands.push("IDLE", options.idleMS);
      }
      if (options?.idleMS) {
        commands.push("TIME", options.timeMS);
      }
      if (options?.retryCount) {
        commands.push("RETRYCOUNT", options.retryCount);
      }
      if (options?.force) {
        commands.push("FORCE");
      }
      if (options?.justId) {
        commands.push("JUSTID");
      }
      if (options?.lastId) {
        commands.push("LASTID", options.lastId);
      }
      super(["XCLAIM", key, group, consumer, minIdleTime, ...ids, ...commands], opts);
    }
  };
  var XDelCommand = class extends Command {
    constructor([key, ids], opts) {
      const cmds = Array.isArray(ids) ? [...ids] : [ids];
      super(["XDEL", key, ...cmds], opts);
    }
  };
  var XGroupCommand = class extends Command {
    constructor([key, opts], commandOptions) {
      const command = ["XGROUP"];
      switch (opts.type) {
        case "CREATE": {
          command.push("CREATE", key, opts.group, opts.id);
          if (opts.options) {
            if (opts.options.MKSTREAM) {
              command.push("MKSTREAM");
            }
            if (opts.options.ENTRIESREAD !== void 0) {
              command.push("ENTRIESREAD", opts.options.ENTRIESREAD.toString());
            }
          }
          break;
        }
        case "CREATECONSUMER": {
          command.push("CREATECONSUMER", key, opts.group, opts.consumer);
          break;
        }
        case "DELCONSUMER": {
          command.push("DELCONSUMER", key, opts.group, opts.consumer);
          break;
        }
        case "DESTROY": {
          command.push("DESTROY", key, opts.group);
          break;
        }
        case "SETID": {
          command.push("SETID", key, opts.group, opts.id);
          if (opts.options?.ENTRIESREAD !== void 0) {
            command.push("ENTRIESREAD", opts.options.ENTRIESREAD.toString());
          }
          break;
        }
        default: {
          throw new Error("Invalid XGROUP");
        }
      }
      super(command, commandOptions);
    }
  };
  var XInfoCommand = class extends Command {
    constructor([key, options], opts) {
      const cmds = [];
      if (options.type === "CONSUMERS") {
        cmds.push("CONSUMERS", key, options.group);
      } else {
        cmds.push("GROUPS", key);
      }
      super(["XINFO", ...cmds], opts);
    }
  };
  var XLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["XLEN", ...cmd], opts);
    }
  };
  var XPendingCommand = class extends Command {
    constructor([key, group, start, end, count, options], opts) {
      const consumers = options?.consumer === void 0 ? [] : Array.isArray(options.consumer) ? [...options.consumer] : [options.consumer];
      super(
        [
          "XPENDING",
          key,
          group,
          ...options?.idleTime ? ["IDLE", options.idleTime] : [],
          start,
          end,
          count,
          ...consumers
        ],
        opts
      );
    }
  };
  function deserialize4(result) {
    const obj = {};
    for (const e of result) {
      for (let i = 0; i < e.length; i += 2) {
        const streamId = e[i];
        const entries = e[i + 1];
        if (!(streamId in obj)) {
          obj[streamId] = {};
        }
        for (let j = 0; j < entries.length; j += 2) {
          const field = entries[j];
          const value = entries[j + 1];
          try {
            obj[streamId][field] = JSON.parse(value);
          } catch {
            obj[streamId][field] = value;
          }
        }
      }
    }
    return obj;
  }
  var XRangeCommand = class extends Command {
    constructor([key, start, end, count], opts) {
      const command = ["XRANGE", key, start, end];
      if (typeof count === "number") {
        command.push("COUNT", count);
      }
      super(command, {
        deserialize: (result) => deserialize4(result),
        ...opts
      });
    }
  };
  var UNBALANCED_XREAD_ERR = "ERR Unbalanced XREAD list of streams: for each stream key an ID or '$' must be specified";
  var XReadCommand = class extends Command {
    constructor([key, id, options], opts) {
      if (Array.isArray(key) && Array.isArray(id) && key.length !== id.length) {
        throw new Error(UNBALANCED_XREAD_ERR);
      }
      const commands = [];
      if (typeof options?.count === "number") {
        commands.push("COUNT", options.count);
      }
      if (typeof options?.blockMS === "number") {
        commands.push("BLOCK", options.blockMS);
      }
      commands.push(
        "STREAMS",
        ...Array.isArray(key) ? [...key] : [key],
        ...Array.isArray(id) ? [...id] : [id]
      );
      super(["XREAD", ...commands], opts);
    }
  };
  var UNBALANCED_XREADGROUP_ERR = "ERR Unbalanced XREADGROUP list of streams: for each stream key an ID or '$' must be specified";
  var XReadGroupCommand = class extends Command {
    constructor([group, consumer, key, id, options], opts) {
      if (Array.isArray(key) && Array.isArray(id) && key.length !== id.length) {
        throw new Error(UNBALANCED_XREADGROUP_ERR);
      }
      const commands = [];
      if (typeof options?.count === "number") {
        commands.push("COUNT", options.count);
      }
      if (typeof options?.blockMS === "number") {
        commands.push("BLOCK", options.blockMS);
      }
      if (typeof options?.NOACK === "boolean" && options.NOACK) {
        commands.push("NOACK");
      }
      commands.push(
        "STREAMS",
        ...Array.isArray(key) ? [...key] : [key],
        ...Array.isArray(id) ? [...id] : [id]
      );
      super(["XREADGROUP", "GROUP", group, consumer, ...commands], opts);
    }
  };
  var XRevRangeCommand = class extends Command {
    constructor([key, end, start, count], opts) {
      const command = ["XREVRANGE", key, end, start];
      if (typeof count === "number") {
        command.push("COUNT", count);
      }
      super(command, {
        deserialize: (result) => deserialize5(result),
        ...opts
      });
    }
  };
  function deserialize5(result) {
    const obj = {};
    for (const e of result) {
      for (let i = 0; i < e.length; i += 2) {
        const streamId = e[i];
        const entries = e[i + 1];
        if (!(streamId in obj)) {
          obj[streamId] = {};
        }
        for (let j = 0; j < entries.length; j += 2) {
          const field = entries[j];
          const value = entries[j + 1];
          try {
            obj[streamId][field] = JSON.parse(value);
          } catch {
            obj[streamId][field] = value;
          }
        }
      }
    }
    return obj;
  }
  var XTrimCommand = class extends Command {
    constructor([key, options], opts) {
      const { limit, strategy, threshold, exactness = "~" } = options;
      super(["XTRIM", key, strategy, exactness, threshold, ...limit ? ["LIMIT", limit] : []], opts);
    }
  };
  var ZAddCommand = class extends Command {
    constructor([key, arg1, ...arg2], opts) {
      const command = ["zadd", key];
      if ("nx" in arg1 && arg1.nx) {
        command.push("nx");
      } else if ("xx" in arg1 && arg1.xx) {
        command.push("xx");
      }
      if ("ch" in arg1 && arg1.ch) {
        command.push("ch");
      }
      if ("incr" in arg1 && arg1.incr) {
        command.push("incr");
      }
      if ("lt" in arg1 && arg1.lt) {
        command.push("lt");
      } else if ("gt" in arg1 && arg1.gt) {
        command.push("gt");
      }
      if ("score" in arg1 && "member" in arg1) {
        command.push(arg1.score, arg1.member);
      }
      command.push(...arg2.flatMap(({ score, member }) => [score, member]));
      super(command, opts);
    }
  };
  var ZCardCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zcard", ...cmd], opts);
    }
  };
  var ZCountCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zcount", ...cmd], opts);
    }
  };
  var ZIncrByCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zincrby", ...cmd], opts);
    }
  };
  var ZInterStoreCommand = class extends Command {
    constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
      const command = ["zinterstore", destination, numKeys];
      if (Array.isArray(keyOrKeys)) {
        command.push(...keyOrKeys);
      } else {
        command.push(keyOrKeys);
      }
      if (opts) {
        if ("weights" in opts && opts.weights) {
          command.push("weights", ...opts.weights);
        } else if ("weight" in opts && typeof opts.weight === "number") {
          command.push("weights", opts.weight);
        }
        if ("aggregate" in opts) {
          command.push("aggregate", opts.aggregate);
        }
      }
      super(command, cmdOpts);
    }
  };
  var ZLexCountCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zlexcount", ...cmd], opts);
    }
  };
  var ZPopMaxCommand = class extends Command {
    constructor([key, count], opts) {
      const command = ["zpopmax", key];
      if (typeof count === "number") {
        command.push(count);
      }
      super(command, opts);
    }
  };
  var ZPopMinCommand = class extends Command {
    constructor([key, count], opts) {
      const command = ["zpopmin", key];
      if (typeof count === "number") {
        command.push(count);
      }
      super(command, opts);
    }
  };
  var ZRangeCommand = class extends Command {
    constructor([key, min, max, opts], cmdOpts) {
      const command = ["zrange", key, min, max];
      if (opts?.byScore) {
        command.push("byscore");
      }
      if (opts?.byLex) {
        command.push("bylex");
      }
      if (opts?.rev) {
        command.push("rev");
      }
      if (opts?.count !== void 0 && opts.offset !== void 0) {
        command.push("limit", opts.offset, opts.count);
      }
      if (opts?.withScores) {
        command.push("withscores");
      }
      super(command, cmdOpts);
    }
  };
  var ZRankCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zrank", ...cmd], opts);
    }
  };
  var ZRemCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zrem", ...cmd], opts);
    }
  };
  var ZRemRangeByLexCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zremrangebylex", ...cmd], opts);
    }
  };
  var ZRemRangeByRankCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zremrangebyrank", ...cmd], opts);
    }
  };
  var ZRemRangeByScoreCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zremrangebyscore", ...cmd], opts);
    }
  };
  var ZRevRankCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zrevrank", ...cmd], opts);
    }
  };
  var ZScanCommand = class extends Command {
    constructor([key, cursor, opts], cmdOpts) {
      const command = ["zscan", key, cursor];
      if (opts?.match) {
        command.push("match", opts.match);
      }
      if (typeof opts?.count === "number") {
        command.push("count", opts.count);
      }
      super(command, {
        deserialize: deserializeScanResponse,
        ...cmdOpts
      });
    }
  };
  var ZScoreCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zscore", ...cmd], opts);
    }
  };
  var ZUnionCommand = class extends Command {
    constructor([numKeys, keyOrKeys, opts], cmdOpts) {
      const command = ["zunion", numKeys];
      if (Array.isArray(keyOrKeys)) {
        command.push(...keyOrKeys);
      } else {
        command.push(keyOrKeys);
      }
      if (opts) {
        if ("weights" in opts && opts.weights) {
          command.push("weights", ...opts.weights);
        } else if ("weight" in opts && typeof opts.weight === "number") {
          command.push("weights", opts.weight);
        }
        if ("aggregate" in opts) {
          command.push("aggregate", opts.aggregate);
        }
        if (opts.withScores) {
          command.push("withscores");
        }
      }
      super(command, cmdOpts);
    }
  };
  var ZUnionStoreCommand = class extends Command {
    constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
      const command = ["zunionstore", destination, numKeys];
      if (Array.isArray(keyOrKeys)) {
        command.push(...keyOrKeys);
      } else {
        command.push(keyOrKeys);
      }
      if (opts) {
        if ("weights" in opts && opts.weights) {
          command.push("weights", ...opts.weights);
        } else if ("weight" in opts && typeof opts.weight === "number") {
          command.push("weights", opts.weight);
        }
        if ("aggregate" in opts) {
          command.push("aggregate", opts.aggregate);
        }
      }
      super(command, cmdOpts);
    }
  };
  var ZDiffStoreCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zdiffstore", ...cmd], opts);
    }
  };
  var ZMScoreCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, members] = cmd;
      super(["zmscore", key, ...members], opts);
    }
  };
  var Pipeline = class {
    client;
    commands;
    commandOptions;
    multiExec;
    constructor(opts) {
      this.client = opts.client;
      this.commands = [];
      this.commandOptions = opts.commandOptions;
      this.multiExec = opts.multiExec ?? false;
      if (this.commandOptions?.latencyLogging) {
        const originalExec = this.exec.bind(this);
        this.exec = async (options) => {
          const start = performance.now();
          const result = await (options ? originalExec(options) : originalExec());
          const end = performance.now();
          const loggerResult = (end - start).toFixed(2);
          console.log(
            `Latency for \x1B[38;2;19;185;39m${this.multiExec ? ["MULTI-EXEC"] : ["PIPELINE"].toString().toUpperCase()}\x1B[0m: \x1B[38;2;0;255;255m${loggerResult} ms\x1B[0m`
          );
          return result;
        };
      }
    }
    exec = async (options) => {
      if (this.commands.length === 0) {
        throw new Error("Pipeline is empty");
      }
      const path = this.multiExec ? ["multi-exec"] : ["pipeline"];
      const res = await this.client.request({
        path,
        body: Object.values(this.commands).map((c) => c.command)
      });
      return options?.keepErrors ? res.map(({ error, result }, i) => {
        return {
          error,
          result: this.commands[i].deserialize(result)
        };
      }) : res.map(({ error, result }, i) => {
        if (error) {
          throw new UpstashError(
            `Command ${i + 1} [ ${this.commands[i].command[0]} ] failed: ${error}`
          );
        }
        return this.commands[i].deserialize(result);
      });
    };
    /**
     * Returns the length of pipeline before the execution
     */
    length() {
      return this.commands.length;
    }
    /**
     * Pushes a command into the pipeline and returns a chainable instance of the
     * pipeline
     */
    chain(command) {
      this.commands.push(command);
      return this;
    }
    /**
     * @see https://redis.io/commands/append
     */
    append = (...args) => this.chain(new AppendCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/bitcount
     */
    bitcount = (...args) => this.chain(new BitCountCommand(args, this.commandOptions));
    /**
     * Returns an instance that can be used to execute `BITFIELD` commands on one key.
     *
     * @example
     * ```typescript
     * redis.set("mykey", 0);
     * const result = await redis.pipeline()
     *   .bitfield("mykey")
     *   .set("u4", 0, 16)
     *   .incr("u4", "#1", 1)
     *   .exec();
     * console.log(result); // [[0, 1]]
     * ```
     *
     * @see https://redis.io/commands/bitfield
     */
    bitfield = (...args) => new BitFieldCommand(args, this.client, this.commandOptions, this.chain.bind(this));
    /**
     * @see https://redis.io/commands/bitop
     */
    bitop = (op, destinationKey, sourceKey, ...sourceKeys) => this.chain(
      new BitOpCommand([op, destinationKey, sourceKey, ...sourceKeys], this.commandOptions)
    );
    /**
     * @see https://redis.io/commands/bitpos
     */
    bitpos = (...args) => this.chain(new BitPosCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/copy
     */
    copy = (...args) => this.chain(new CopyCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zdiffstore
     */
    zdiffstore = (...args) => this.chain(new ZDiffStoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/dbsize
     */
    dbsize = () => this.chain(new DBSizeCommand(this.commandOptions));
    /**
     * @see https://redis.io/commands/decr
     */
    decr = (...args) => this.chain(new DecrCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/decrby
     */
    decrby = (...args) => this.chain(new DecrByCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/del
     */
    del = (...args) => this.chain(new DelCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/echo
     */
    echo = (...args) => this.chain(new EchoCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/eval_ro
     */
    evalRo = (...args) => this.chain(new EvalROCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/eval
     */
    eval = (...args) => this.chain(new EvalCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/evalsha_ro
     */
    evalshaRo = (...args) => this.chain(new EvalshaROCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/evalsha
     */
    evalsha = (...args) => this.chain(new EvalshaCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/exists
     */
    exists = (...args) => this.chain(new ExistsCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/expire
     */
    expire = (...args) => this.chain(new ExpireCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/expireat
     */
    expireat = (...args) => this.chain(new ExpireAtCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/flushall
     */
    flushall = (args) => this.chain(new FlushAllCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/flushdb
     */
    flushdb = (...args) => this.chain(new FlushDBCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/geoadd
     */
    geoadd = (...args) => this.chain(new GeoAddCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/geodist
     */
    geodist = (...args) => this.chain(new GeoDistCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/geopos
     */
    geopos = (...args) => this.chain(new GeoPosCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/geohash
     */
    geohash = (...args) => this.chain(new GeoHashCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/geosearch
     */
    geosearch = (...args) => this.chain(new GeoSearchCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/geosearchstore
     */
    geosearchstore = (...args) => this.chain(new GeoSearchStoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/get
     */
    get = (...args) => this.chain(new GetCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/getbit
     */
    getbit = (...args) => this.chain(new GetBitCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/getdel
     */
    getdel = (...args) => this.chain(new GetDelCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/getex
     */
    getex = (...args) => this.chain(new GetExCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/getrange
     */
    getrange = (...args) => this.chain(new GetRangeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/getset
     */
    getset = (key, value) => this.chain(new GetSetCommand([key, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/hdel
     */
    hdel = (...args) => this.chain(new HDelCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hexists
     */
    hexists = (...args) => this.chain(new HExistsCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hexpire
     */
    hexpire = (...args) => this.chain(new HExpireCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hexpireat
     */
    hexpireat = (...args) => this.chain(new HExpireAtCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hexpiretime
     */
    hexpiretime = (...args) => this.chain(new HExpireTimeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/httl
     */
    httl = (...args) => this.chain(new HTtlCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hpexpire
     */
    hpexpire = (...args) => this.chain(new HPExpireCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hpexpireat
     */
    hpexpireat = (...args) => this.chain(new HPExpireAtCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hpexpiretime
     */
    hpexpiretime = (...args) => this.chain(new HPExpireTimeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hpttl
     */
    hpttl = (...args) => this.chain(new HPTtlCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hpersist
     */
    hpersist = (...args) => this.chain(new HPersistCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hget
     */
    hget = (...args) => this.chain(new HGetCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hgetall
     */
    hgetall = (...args) => this.chain(new HGetAllCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hincrby
     */
    hincrby = (...args) => this.chain(new HIncrByCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hincrbyfloat
     */
    hincrbyfloat = (...args) => this.chain(new HIncrByFloatCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hkeys
     */
    hkeys = (...args) => this.chain(new HKeysCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hlen
     */
    hlen = (...args) => this.chain(new HLenCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hmget
     */
    hmget = (...args) => this.chain(new HMGetCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hmset
     */
    hmset = (key, kv2) => this.chain(new HMSetCommand([key, kv2], this.commandOptions));
    /**
     * @see https://redis.io/commands/hrandfield
     */
    hrandfield = (key, count, withValues) => this.chain(new HRandFieldCommand([key, count, withValues], this.commandOptions));
    /**
     * @see https://redis.io/commands/hscan
     */
    hscan = (...args) => this.chain(new HScanCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hset
     */
    hset = (key, kv2) => this.chain(new HSetCommand([key, kv2], this.commandOptions));
    /**
     * @see https://redis.io/commands/hsetnx
     */
    hsetnx = (key, field, value) => this.chain(new HSetNXCommand([key, field, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/hstrlen
     */
    hstrlen = (...args) => this.chain(new HStrLenCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hvals
     */
    hvals = (...args) => this.chain(new HValsCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/incr
     */
    incr = (...args) => this.chain(new IncrCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/incrby
     */
    incrby = (...args) => this.chain(new IncrByCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/incrbyfloat
     */
    incrbyfloat = (...args) => this.chain(new IncrByFloatCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/keys
     */
    keys = (...args) => this.chain(new KeysCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/lindex
     */
    lindex = (...args) => this.chain(new LIndexCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/linsert
     */
    linsert = (key, direction, pivot, value) => this.chain(new LInsertCommand([key, direction, pivot, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/llen
     */
    llen = (...args) => this.chain(new LLenCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/lmove
     */
    lmove = (...args) => this.chain(new LMoveCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/lpop
     */
    lpop = (...args) => this.chain(new LPopCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/lmpop
     */
    lmpop = (...args) => this.chain(new LmPopCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/lpos
     */
    lpos = (...args) => this.chain(new LPosCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/lpush
     */
    lpush = (key, ...elements) => this.chain(new LPushCommand([key, ...elements], this.commandOptions));
    /**
     * @see https://redis.io/commands/lpushx
     */
    lpushx = (key, ...elements) => this.chain(new LPushXCommand([key, ...elements], this.commandOptions));
    /**
     * @see https://redis.io/commands/lrange
     */
    lrange = (...args) => this.chain(new LRangeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/lrem
     */
    lrem = (key, count, value) => this.chain(new LRemCommand([key, count, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/lset
     */
    lset = (key, index, value) => this.chain(new LSetCommand([key, index, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/ltrim
     */
    ltrim = (...args) => this.chain(new LTrimCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/mget
     */
    mget = (...args) => this.chain(new MGetCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/mset
     */
    mset = (kv2) => this.chain(new MSetCommand([kv2], this.commandOptions));
    /**
     * @see https://redis.io/commands/msetnx
     */
    msetnx = (kv2) => this.chain(new MSetNXCommand([kv2], this.commandOptions));
    /**
     * @see https://redis.io/commands/persist
     */
    persist = (...args) => this.chain(new PersistCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/pexpire
     */
    pexpire = (...args) => this.chain(new PExpireCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/pexpireat
     */
    pexpireat = (...args) => this.chain(new PExpireAtCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/pfadd
     */
    pfadd = (...args) => this.chain(new PfAddCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/pfcount
     */
    pfcount = (...args) => this.chain(new PfCountCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/pfmerge
     */
    pfmerge = (...args) => this.chain(new PfMergeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/ping
     */
    ping = (args) => this.chain(new PingCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/psetex
     */
    psetex = (key, ttl, value) => this.chain(new PSetEXCommand([key, ttl, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/pttl
     */
    pttl = (...args) => this.chain(new PTtlCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/publish
     */
    publish = (...args) => this.chain(new PublishCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/randomkey
     */
    randomkey = () => this.chain(new RandomKeyCommand(this.commandOptions));
    /**
     * @see https://redis.io/commands/rename
     */
    rename = (...args) => this.chain(new RenameCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/renamenx
     */
    renamenx = (...args) => this.chain(new RenameNXCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/rpop
     */
    rpop = (...args) => this.chain(new RPopCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/rpush
     */
    rpush = (key, ...elements) => this.chain(new RPushCommand([key, ...elements], this.commandOptions));
    /**
     * @see https://redis.io/commands/rpushx
     */
    rpushx = (key, ...elements) => this.chain(new RPushXCommand([key, ...elements], this.commandOptions));
    /**
     * @see https://redis.io/commands/sadd
     */
    sadd = (key, member, ...members) => this.chain(new SAddCommand([key, member, ...members], this.commandOptions));
    /**
     * @see https://redis.io/commands/scan
     */
    scan = (...args) => this.chain(new ScanCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/scard
     */
    scard = (...args) => this.chain(new SCardCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/script-exists
     */
    scriptExists = (...args) => this.chain(new ScriptExistsCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/script-flush
     */
    scriptFlush = (...args) => this.chain(new ScriptFlushCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/script-load
     */
    scriptLoad = (...args) => this.chain(new ScriptLoadCommand(args, this.commandOptions));
    /*)*
     * @see https://redis.io/commands/sdiff
     */
    sdiff = (...args) => this.chain(new SDiffCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/sdiffstore
     */
    sdiffstore = (...args) => this.chain(new SDiffStoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/set
     */
    set = (key, value, opts) => this.chain(new SetCommand([key, value, opts], this.commandOptions));
    /**
     * @see https://redis.io/commands/setbit
     */
    setbit = (...args) => this.chain(new SetBitCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/setex
     */
    setex = (key, ttl, value) => this.chain(new SetExCommand([key, ttl, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/setnx
     */
    setnx = (key, value) => this.chain(new SetNxCommand([key, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/setrange
     */
    setrange = (...args) => this.chain(new SetRangeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/sinter
     */
    sinter = (...args) => this.chain(new SInterCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/sinterstore
     */
    sinterstore = (...args) => this.chain(new SInterStoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/sismember
     */
    sismember = (key, member) => this.chain(new SIsMemberCommand([key, member], this.commandOptions));
    /**
     * @see https://redis.io/commands/smembers
     */
    smembers = (...args) => this.chain(new SMembersCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/smismember
     */
    smismember = (key, members) => this.chain(new SMIsMemberCommand([key, members], this.commandOptions));
    /**
     * @see https://redis.io/commands/smove
     */
    smove = (source, destination, member) => this.chain(new SMoveCommand([source, destination, member], this.commandOptions));
    /**
     * @see https://redis.io/commands/spop
     */
    spop = (...args) => this.chain(new SPopCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/srandmember
     */
    srandmember = (...args) => this.chain(new SRandMemberCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/srem
     */
    srem = (key, ...members) => this.chain(new SRemCommand([key, ...members], this.commandOptions));
    /**
     * @see https://redis.io/commands/sscan
     */
    sscan = (...args) => this.chain(new SScanCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/strlen
     */
    strlen = (...args) => this.chain(new StrLenCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/sunion
     */
    sunion = (...args) => this.chain(new SUnionCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/sunionstore
     */
    sunionstore = (...args) => this.chain(new SUnionStoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/time
     */
    time = () => this.chain(new TimeCommand(this.commandOptions));
    /**
     * @see https://redis.io/commands/touch
     */
    touch = (...args) => this.chain(new TouchCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/ttl
     */
    ttl = (...args) => this.chain(new TtlCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/type
     */
    type = (...args) => this.chain(new TypeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/unlink
     */
    unlink = (...args) => this.chain(new UnlinkCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zadd
     */
    zadd = (...args) => {
      if ("score" in args[1]) {
        return this.chain(
          new ZAddCommand([args[0], args[1], ...args.slice(2)], this.commandOptions)
        );
      }
      return this.chain(
        new ZAddCommand(
          [args[0], args[1], ...args.slice(2)],
          this.commandOptions
        )
      );
    };
    /**
     * @see https://redis.io/commands/xadd
     */
    xadd = (...args) => this.chain(new XAddCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xack
     */
    xack = (...args) => this.chain(new XAckCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xdel
     */
    xdel = (...args) => this.chain(new XDelCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xgroup
     */
    xgroup = (...args) => this.chain(new XGroupCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xread
     */
    xread = (...args) => this.chain(new XReadCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xreadgroup
     */
    xreadgroup = (...args) => this.chain(new XReadGroupCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xinfo
     */
    xinfo = (...args) => this.chain(new XInfoCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xlen
     */
    xlen = (...args) => this.chain(new XLenCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xpending
     */
    xpending = (...args) => this.chain(new XPendingCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xclaim
     */
    xclaim = (...args) => this.chain(new XClaimCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xautoclaim
     */
    xautoclaim = (...args) => this.chain(new XAutoClaim(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xtrim
     */
    xtrim = (...args) => this.chain(new XTrimCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xrange
     */
    xrange = (...args) => this.chain(new XRangeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xrevrange
     */
    xrevrange = (...args) => this.chain(new XRevRangeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zcard
     */
    zcard = (...args) => this.chain(new ZCardCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zcount
     */
    zcount = (...args) => this.chain(new ZCountCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zincrby
     */
    zincrby = (key, increment, member) => this.chain(new ZIncrByCommand([key, increment, member], this.commandOptions));
    /**
     * @see https://redis.io/commands/zinterstore
     */
    zinterstore = (...args) => this.chain(new ZInterStoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zlexcount
     */
    zlexcount = (...args) => this.chain(new ZLexCountCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zmscore
     */
    zmscore = (...args) => this.chain(new ZMScoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zpopmax
     */
    zpopmax = (...args) => this.chain(new ZPopMaxCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zpopmin
     */
    zpopmin = (...args) => this.chain(new ZPopMinCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zrange
     */
    zrange = (...args) => this.chain(new ZRangeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zrank
     */
    zrank = (key, member) => this.chain(new ZRankCommand([key, member], this.commandOptions));
    /**
     * @see https://redis.io/commands/zrem
     */
    zrem = (key, ...members) => this.chain(new ZRemCommand([key, ...members], this.commandOptions));
    /**
     * @see https://redis.io/commands/zremrangebylex
     */
    zremrangebylex = (...args) => this.chain(new ZRemRangeByLexCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zremrangebyrank
     */
    zremrangebyrank = (...args) => this.chain(new ZRemRangeByRankCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zremrangebyscore
     */
    zremrangebyscore = (...args) => this.chain(new ZRemRangeByScoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zrevrank
     */
    zrevrank = (key, member) => this.chain(new ZRevRankCommand([key, member], this.commandOptions));
    /**
     * @see https://redis.io/commands/zscan
     */
    zscan = (...args) => this.chain(new ZScanCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zscore
     */
    zscore = (key, member) => this.chain(new ZScoreCommand([key, member], this.commandOptions));
    /**
     * @see https://redis.io/commands/zunionstore
     */
    zunionstore = (...args) => this.chain(new ZUnionStoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zunion
     */
    zunion = (...args) => this.chain(new ZUnionCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/?group=json
     */
    get json() {
      return {
        /**
         * @see https://redis.io/commands/json.arrappend
         */
        arrappend: (...args) => this.chain(new JsonArrAppendCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.arrindex
         */
        arrindex: (...args) => this.chain(new JsonArrIndexCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.arrinsert
         */
        arrinsert: (...args) => this.chain(new JsonArrInsertCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.arrlen
         */
        arrlen: (...args) => this.chain(new JsonArrLenCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.arrpop
         */
        arrpop: (...args) => this.chain(new JsonArrPopCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.arrtrim
         */
        arrtrim: (...args) => this.chain(new JsonArrTrimCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.clear
         */
        clear: (...args) => this.chain(new JsonClearCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.del
         */
        del: (...args) => this.chain(new JsonDelCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.forget
         */
        forget: (...args) => this.chain(new JsonForgetCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.get
         */
        get: (...args) => this.chain(new JsonGetCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.merge
         */
        merge: (...args) => this.chain(new JsonMergeCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.mget
         */
        mget: (...args) => this.chain(new JsonMGetCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.mset
         */
        mset: (...args) => this.chain(new JsonMSetCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.numincrby
         */
        numincrby: (...args) => this.chain(new JsonNumIncrByCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.nummultby
         */
        nummultby: (...args) => this.chain(new JsonNumMultByCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.objkeys
         */
        objkeys: (...args) => this.chain(new JsonObjKeysCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.objlen
         */
        objlen: (...args) => this.chain(new JsonObjLenCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.resp
         */
        resp: (...args) => this.chain(new JsonRespCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.set
         */
        set: (...args) => this.chain(new JsonSetCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.strappend
         */
        strappend: (...args) => this.chain(new JsonStrAppendCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.strlen
         */
        strlen: (...args) => this.chain(new JsonStrLenCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.toggle
         */
        toggle: (...args) => this.chain(new JsonToggleCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.type
         */
        type: (...args) => this.chain(new JsonTypeCommand(args, this.commandOptions))
      };
    }
  };
  var EXCLUDE_COMMANDS = /* @__PURE__ */ new Set([
    "scan",
    "keys",
    "flushdb",
    "flushall",
    "dbsize",
    "hscan",
    "hgetall",
    "hkeys",
    "lrange",
    "sscan",
    "smembers",
    "xrange",
    "xrevrange",
    "zscan",
    "zrange",
    "exec"
  ]);
  function createAutoPipelineProxy(_redis, json) {
    const redis = _redis;
    if (!redis.autoPipelineExecutor) {
      redis.autoPipelineExecutor = new AutoPipelineExecutor(redis);
    }
    return new Proxy(redis, {
      get: (redis2, command) => {
        if (command === "pipelineCounter") {
          return redis2.autoPipelineExecutor.pipelineCounter;
        }
        if (command === "json") {
          return createAutoPipelineProxy(redis2, true);
        }
        const commandInRedisButNotPipeline = command in redis2 && !(command in redis2.autoPipelineExecutor.pipeline);
        const isCommandExcluded = EXCLUDE_COMMANDS.has(command);
        if (commandInRedisButNotPipeline || isCommandExcluded) {
          return redis2[command];
        }
        const isFunction3 = json ? typeof redis2.autoPipelineExecutor.pipeline.json[command] === "function" : typeof redis2.autoPipelineExecutor.pipeline[command] === "function";
        if (isFunction3) {
          return (...args) => {
            return redis2.autoPipelineExecutor.withAutoPipeline((pipeline) => {
              if (json) {
                pipeline.json[command](
                  ...args
                );
              } else {
                pipeline[command](...args);
              }
            });
          };
        }
        return redis2.autoPipelineExecutor.pipeline[command];
      }
    });
  }
  var AutoPipelineExecutor = class {
    pipelinePromises = /* @__PURE__ */ new WeakMap();
    activePipeline = null;
    indexInCurrentPipeline = 0;
    redis;
    pipeline;
    // only to make sure that proxy can work
    pipelineCounter = 0;
    // to keep track of how many times a pipeline was executed
    constructor(redis) {
      this.redis = redis;
      this.pipeline = redis.pipeline();
    }
    async withAutoPipeline(executeWithPipeline) {
      const pipeline = this.activePipeline ?? this.redis.pipeline();
      if (!this.activePipeline) {
        this.activePipeline = pipeline;
        this.indexInCurrentPipeline = 0;
      }
      const index = this.indexInCurrentPipeline++;
      executeWithPipeline(pipeline);
      const pipelineDone = this.deferExecution().then(() => {
        if (!this.pipelinePromises.has(pipeline)) {
          const pipelinePromise = pipeline.exec({ keepErrors: true });
          this.pipelineCounter += 1;
          this.pipelinePromises.set(pipeline, pipelinePromise);
          this.activePipeline = null;
        }
        return this.pipelinePromises.get(pipeline);
      });
      const results = await pipelineDone;
      const commandResult = results[index];
      if (commandResult.error) {
        throw new UpstashError(`Command failed: ${commandResult.error}`);
      }
      return commandResult.result;
    }
    async deferExecution() {
      await Promise.resolve();
      await Promise.resolve();
    }
  };
  var PSubscribeCommand = class extends Command {
    constructor(cmd, opts) {
      const sseHeaders = {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      };
      super([], {
        ...opts,
        headers: sseHeaders,
        path: ["psubscribe", ...cmd],
        streamOptions: {
          isStreaming: true,
          onMessage: opts?.streamOptions?.onMessage,
          signal: opts?.streamOptions?.signal
        }
      });
    }
  };
  var Subscriber = class extends EventTarget {
    subscriptions;
    client;
    listeners;
    opts;
    constructor(client, channels, isPattern = false, opts) {
      super();
      this.client = client;
      this.subscriptions = /* @__PURE__ */ new Map();
      this.listeners = /* @__PURE__ */ new Map();
      this.opts = opts;
      for (const channel of channels) {
        if (isPattern) {
          this.subscribeToPattern(channel);
        } else {
          this.subscribeToChannel(channel);
        }
      }
    }
    subscribeToChannel(channel) {
      const controller = new AbortController();
      const command = new SubscribeCommand([channel], {
        streamOptions: {
          signal: controller.signal,
          onMessage: (data) => this.handleMessage(data, false)
        }
      });
      command.exec(this.client).catch((error) => {
        if (error.name !== "AbortError") {
          this.dispatchToListeners("error", error);
        }
      });
      this.subscriptions.set(channel, {
        command,
        controller,
        isPattern: false
      });
    }
    subscribeToPattern(pattern) {
      const controller = new AbortController();
      const command = new PSubscribeCommand([pattern], {
        streamOptions: {
          signal: controller.signal,
          onMessage: (data) => this.handleMessage(data, true)
        }
      });
      command.exec(this.client).catch((error) => {
        if (error.name !== "AbortError") {
          this.dispatchToListeners("error", error);
        }
      });
      this.subscriptions.set(pattern, {
        command,
        controller,
        isPattern: true
      });
    }
    handleMessage(data, isPattern) {
      const messageData = data.replace(/^data:\s*/, "");
      const firstCommaIndex = messageData.indexOf(",");
      const secondCommaIndex = messageData.indexOf(",", firstCommaIndex + 1);
      const thirdCommaIndex = isPattern ? messageData.indexOf(",", secondCommaIndex + 1) : -1;
      if (firstCommaIndex !== -1 && secondCommaIndex !== -1) {
        const type = messageData.slice(0, firstCommaIndex);
        if (isPattern && type === "pmessage" && thirdCommaIndex !== -1) {
          const pattern = messageData.slice(firstCommaIndex + 1, secondCommaIndex);
          const channel = messageData.slice(secondCommaIndex + 1, thirdCommaIndex);
          const messageStr = messageData.slice(thirdCommaIndex + 1);
          try {
            const message = this.opts?.automaticDeserialization === false ? messageStr : JSON.parse(messageStr);
            this.dispatchToListeners("pmessage", { pattern, channel, message });
            this.dispatchToListeners(`pmessage:${pattern}`, { pattern, channel, message });
          } catch (error) {
            this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`));
          }
        } else {
          const channel = messageData.slice(firstCommaIndex + 1, secondCommaIndex);
          const messageStr = messageData.slice(secondCommaIndex + 1);
          try {
            if (type === "subscribe" || type === "psubscribe" || type === "unsubscribe" || type === "punsubscribe") {
              const count = Number.parseInt(messageStr);
              this.dispatchToListeners(type, count);
            } else {
              const message = this.opts?.automaticDeserialization === false ? messageStr : parseWithTryCatch(messageStr);
              this.dispatchToListeners(type, { channel, message });
              this.dispatchToListeners(`${type}:${channel}`, { channel, message });
            }
          } catch (error) {
            this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`));
          }
        }
      }
    }
    dispatchToListeners(type, data) {
      const listeners = this.listeners.get(type);
      if (listeners) {
        for (const listener of listeners) {
          listener(data);
        }
      }
    }
    on(type, listener) {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, /* @__PURE__ */ new Set());
      }
      this.listeners.get(type)?.add(listener);
    }
    removeAllListeners() {
      this.listeners.clear();
    }
    async unsubscribe(channels) {
      if (channels) {
        for (const channel of channels) {
          const subscription = this.subscriptions.get(channel);
          if (subscription) {
            try {
              subscription.controller.abort();
            } catch {
            }
            this.subscriptions.delete(channel);
          }
        }
      } else {
        for (const subscription of this.subscriptions.values()) {
          try {
            subscription.controller.abort();
          } catch {
          }
        }
        this.subscriptions.clear();
        this.removeAllListeners();
      }
    }
    getSubscribedChannels() {
      return [...this.subscriptions.keys()];
    }
  };
  var SubscribeCommand = class extends Command {
    constructor(cmd, opts) {
      const sseHeaders = {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      };
      super([], {
        ...opts,
        headers: sseHeaders,
        path: ["subscribe", ...cmd],
        streamOptions: {
          isStreaming: true,
          onMessage: opts?.streamOptions?.onMessage,
          signal: opts?.streamOptions?.signal
        }
      });
    }
  };
  var parseWithTryCatch = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  };
  var Script = class {
    script;
    /**
     * @deprecated This property is initialized to an empty string and will be set in the init method
     * asynchronously. Do not use this property immidiately after the constructor.
     *
     * This property is only exposed for backwards compatibility and will be removed in the
     * future major release.
     */
    sha1;
    redis;
    constructor(redis, script) {
      this.redis = redis;
      this.script = script;
      this.sha1 = "";
      void this.init(script);
    }
    /**
     * Initialize the script by computing its SHA-1 hash.
     */
    async init(script) {
      if (this.sha1)
        return;
      this.sha1 = await this.digest(script);
    }
    /**
     * Send an `EVAL` command to redis.
     */
    async eval(keys, args) {
      await this.init(this.script);
      return await this.redis.eval(this.script, keys, args);
    }
    /**
     * Calculates the sha1 hash of the script and then calls `EVALSHA`.
     */
    async evalsha(keys, args) {
      await this.init(this.script);
      return await this.redis.evalsha(this.sha1, keys, args);
    }
    /**
     * Optimistically try to run `EVALSHA` first.
     * If the script is not loaded in redis, it will fall back and try again with `EVAL`.
     *
     * Following calls will be able to use the cached script
     */
    async exec(keys, args) {
      await this.init(this.script);
      const res = await this.redis.evalsha(this.sha1, keys, args).catch(async (error) => {
        if (error instanceof Error && error.message.toLowerCase().includes("noscript")) {
          return await this.redis.eval(this.script, keys, args);
        }
        throw error;
      });
      return res;
    }
    /**
     * Compute the sha1 hash of the script and return its hex representation.
     */
    async digest(s) {
      const data = new TextEncoder().encode(s);
      const hashBuffer = await subtle.digest("SHA-1", data);
      const hashArray = [...new Uint8Array(hashBuffer)];
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  };
  var ScriptRO = class {
    script;
    /**
     * @deprecated This property is initialized to an empty string and will be set in the init method
     * asynchronously. Do not use this property immidiately after the constructor.
     *
     * This property is only exposed for backwards compatibility and will be removed in the
     * future major release.
     */
    sha1;
    redis;
    constructor(redis, script) {
      this.redis = redis;
      this.sha1 = "";
      this.script = script;
      void this.init(script);
    }
    async init(script) {
      if (this.sha1)
        return;
      this.sha1 = await this.digest(script);
    }
    /**
     * Send an `EVAL_RO` command to redis.
     */
    async evalRo(keys, args) {
      await this.init(this.script);
      return await this.redis.evalRo(this.script, keys, args);
    }
    /**
     * Calculates the sha1 hash of the script and then calls `EVALSHA_RO`.
     */
    async evalshaRo(keys, args) {
      await this.init(this.script);
      return await this.redis.evalshaRo(this.sha1, keys, args);
    }
    /**
     * Optimistically try to run `EVALSHA_RO` first.
     * If the script is not loaded in redis, it will fall back and try again with `EVAL_RO`.
     *
     * Following calls will be able to use the cached script
     */
    async exec(keys, args) {
      await this.init(this.script);
      const res = await this.redis.evalshaRo(this.sha1, keys, args).catch(async (error) => {
        if (error instanceof Error && error.message.toLowerCase().includes("noscript")) {
          return await this.redis.evalRo(this.script, keys, args);
        }
        throw error;
      });
      return res;
    }
    /**
     * Compute the sha1 hash of the script and return its hex representation.
     */
    async digest(s) {
      const data = new TextEncoder().encode(s);
      const hashBuffer = await subtle.digest("SHA-1", data);
      const hashArray = [...new Uint8Array(hashBuffer)];
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  };
  var Redis = class {
    client;
    opts;
    enableTelemetry;
    enableAutoPipelining;
    /**
     * Create a new redis client
     *
     * @example
     * ```typescript
     * const redis = new Redis({
     *  url: "<UPSTASH_REDIS_REST_URL>",
     *  token: "<UPSTASH_REDIS_REST_TOKEN>",
     * });
     * ```
     */
    constructor(client, opts) {
      this.client = client;
      this.opts = opts;
      this.enableTelemetry = opts?.enableTelemetry ?? true;
      if (opts?.readYourWrites === false) {
        this.client.readYourWrites = false;
      }
      this.enableAutoPipelining = opts?.enableAutoPipelining ?? true;
    }
    get readYourWritesSyncToken() {
      return this.client.upstashSyncToken;
    }
    set readYourWritesSyncToken(session) {
      this.client.upstashSyncToken = session;
    }
    get json() {
      return {
        /**
         * @see https://redis.io/commands/json.arrappend
         */
        arrappend: (...args) => new JsonArrAppendCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.arrindex
         */
        arrindex: (...args) => new JsonArrIndexCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.arrinsert
         */
        arrinsert: (...args) => new JsonArrInsertCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.arrlen
         */
        arrlen: (...args) => new JsonArrLenCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.arrpop
         */
        arrpop: (...args) => new JsonArrPopCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.arrtrim
         */
        arrtrim: (...args) => new JsonArrTrimCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.clear
         */
        clear: (...args) => new JsonClearCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.del
         */
        del: (...args) => new JsonDelCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.forget
         */
        forget: (...args) => new JsonForgetCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.get
         */
        get: (...args) => new JsonGetCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.merge
         */
        merge: (...args) => new JsonMergeCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.mget
         */
        mget: (...args) => new JsonMGetCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.mset
         */
        mset: (...args) => new JsonMSetCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.numincrby
         */
        numincrby: (...args) => new JsonNumIncrByCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.nummultby
         */
        nummultby: (...args) => new JsonNumMultByCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.objkeys
         */
        objkeys: (...args) => new JsonObjKeysCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.objlen
         */
        objlen: (...args) => new JsonObjLenCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.resp
         */
        resp: (...args) => new JsonRespCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.set
         */
        set: (...args) => new JsonSetCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.strappend
         */
        strappend: (...args) => new JsonStrAppendCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.strlen
         */
        strlen: (...args) => new JsonStrLenCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.toggle
         */
        toggle: (...args) => new JsonToggleCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.type
         */
        type: (...args) => new JsonTypeCommand(args, this.opts).exec(this.client)
      };
    }
    /**
     * Wrap a new middleware around the HTTP client.
     */
    use = (middleware) => {
      const makeRequest = this.client.request.bind(this.client);
      this.client.request = (req) => middleware(req, makeRequest);
    };
    /**
     * Technically this is not private, we can hide it from intellisense by doing this
     */
    addTelemetry = (telemetry) => {
      if (!this.enableTelemetry) {
        return;
      }
      try {
        this.client.mergeTelemetry(telemetry);
      } catch {
      }
    };
    /**
     * Creates a new script.
     *
     * Scripts offer the ability to optimistically try to execute a script without having to send the
     * entire script to the server. If the script is loaded on the server, it tries again by sending
     * the entire script. Afterwards, the script is cached on the server.
     *
     * @param script - The script to create
     * @param opts - Optional options to pass to the script `{ readonly?: boolean }`
     * @returns A new script
     *
     * @example
     * ```ts
     * const redis = new Redis({...})
     *
     * const script = redis.createScript<string>("return ARGV[1];")
     * const arg1 = await script.eval([], ["Hello World"])
     * expect(arg1, "Hello World")
     * ```
     * @example
     * ```ts
     * const redis = new Redis({...})
     *
     * const script = redis.createScript<string>("return ARGV[1];", { readonly: true })
     * const arg1 = await script.evalRo([], ["Hello World"])
     * expect(arg1, "Hello World")
     * ```
     */
    createScript(script, opts) {
      return opts?.readonly ? new ScriptRO(this, script) : new Script(this, script);
    }
    /**
     * Create a new pipeline that allows you to send requests in bulk.
     *
     * @see {@link Pipeline}
     */
    pipeline = () => new Pipeline({
      client: this.client,
      commandOptions: this.opts,
      multiExec: false
    });
    autoPipeline = () => {
      return createAutoPipelineProxy(this);
    };
    /**
     * Create a new transaction to allow executing multiple steps atomically.
     *
     * All the commands in a transaction are serialized and executed sequentially. A request sent by
     * another client will never be served in the middle of the execution of a Redis Transaction. This
     * guarantees that the commands are executed as a single isolated operation.
     *
     * @see {@link Pipeline}
     */
    multi = () => new Pipeline({
      client: this.client,
      commandOptions: this.opts,
      multiExec: true
    });
    /**
     * Returns an instance that can be used to execute `BITFIELD` commands on one key.
     *
     * @example
     * ```typescript
     * redis.set("mykey", 0);
     * const result = await redis.bitfield("mykey")
     *   .set("u4", 0, 16)
     *   .incr("u4", "#1", 1)
     *   .exec();
     * console.log(result); // [0, 1]
     * ```
     *
     * @see https://redis.io/commands/bitfield
     */
    bitfield = (...args) => new BitFieldCommand(args, this.client, this.opts);
    /**
     * @see https://redis.io/commands/append
     */
    append = (...args) => new AppendCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/bitcount
     */
    bitcount = (...args) => new BitCountCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/bitop
     */
    bitop = (op, destinationKey, sourceKey, ...sourceKeys) => new BitOpCommand([op, destinationKey, sourceKey, ...sourceKeys], this.opts).exec(
      this.client
    );
    /**
     * @see https://redis.io/commands/bitpos
     */
    bitpos = (...args) => new BitPosCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/copy
     */
    copy = (...args) => new CopyCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/dbsize
     */
    dbsize = () => new DBSizeCommand(this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/decr
     */
    decr = (...args) => new DecrCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/decrby
     */
    decrby = (...args) => new DecrByCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/del
     */
    del = (...args) => new DelCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/echo
     */
    echo = (...args) => new EchoCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/eval_ro
     */
    evalRo = (...args) => new EvalROCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/eval
     */
    eval = (...args) => new EvalCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/evalsha_ro
     */
    evalshaRo = (...args) => new EvalshaROCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/evalsha
     */
    evalsha = (...args) => new EvalshaCommand(args, this.opts).exec(this.client);
    /**
     * Generic method to execute any Redis command.
     */
    exec = (args) => new ExecCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/exists
     */
    exists = (...args) => new ExistsCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/expire
     */
    expire = (...args) => new ExpireCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/expireat
     */
    expireat = (...args) => new ExpireAtCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/flushall
     */
    flushall = (args) => new FlushAllCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/flushdb
     */
    flushdb = (...args) => new FlushDBCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/geoadd
     */
    geoadd = (...args) => new GeoAddCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/geopos
     */
    geopos = (...args) => new GeoPosCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/geodist
     */
    geodist = (...args) => new GeoDistCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/geohash
     */
    geohash = (...args) => new GeoHashCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/geosearch
     */
    geosearch = (...args) => new GeoSearchCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/geosearchstore
     */
    geosearchstore = (...args) => new GeoSearchStoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/get
     */
    get = (...args) => new GetCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/getbit
     */
    getbit = (...args) => new GetBitCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/getdel
     */
    getdel = (...args) => new GetDelCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/getex
     */
    getex = (...args) => new GetExCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/getrange
     */
    getrange = (...args) => new GetRangeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/getset
     */
    getset = (key, value) => new GetSetCommand([key, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hdel
     */
    hdel = (...args) => new HDelCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hexists
     */
    hexists = (...args) => new HExistsCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hexpire
     */
    hexpire = (...args) => new HExpireCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hexpireat
     */
    hexpireat = (...args) => new HExpireAtCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hexpiretime
     */
    hexpiretime = (...args) => new HExpireTimeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/httl
     */
    httl = (...args) => new HTtlCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hpexpire
     */
    hpexpire = (...args) => new HPExpireCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hpexpireat
     */
    hpexpireat = (...args) => new HPExpireAtCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hpexpiretime
     */
    hpexpiretime = (...args) => new HPExpireTimeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hpttl
     */
    hpttl = (...args) => new HPTtlCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hpersist
     */
    hpersist = (...args) => new HPersistCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hget
     */
    hget = (...args) => new HGetCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hgetall
     */
    hgetall = (...args) => new HGetAllCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hincrby
     */
    hincrby = (...args) => new HIncrByCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hincrbyfloat
     */
    hincrbyfloat = (...args) => new HIncrByFloatCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hkeys
     */
    hkeys = (...args) => new HKeysCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hlen
     */
    hlen = (...args) => new HLenCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hmget
     */
    hmget = (...args) => new HMGetCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hmset
     */
    hmset = (key, kv2) => new HMSetCommand([key, kv2], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hrandfield
     */
    hrandfield = (key, count, withValues) => new HRandFieldCommand([key, count, withValues], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hscan
     */
    hscan = (...args) => new HScanCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hset
     */
    hset = (key, kv2) => new HSetCommand([key, kv2], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hsetnx
     */
    hsetnx = (key, field, value) => new HSetNXCommand([key, field, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hstrlen
     */
    hstrlen = (...args) => new HStrLenCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hvals
     */
    hvals = (...args) => new HValsCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/incr
     */
    incr = (...args) => new IncrCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/incrby
     */
    incrby = (...args) => new IncrByCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/incrbyfloat
     */
    incrbyfloat = (...args) => new IncrByFloatCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/keys
     */
    keys = (...args) => new KeysCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lindex
     */
    lindex = (...args) => new LIndexCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/linsert
     */
    linsert = (key, direction, pivot, value) => new LInsertCommand([key, direction, pivot, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/llen
     */
    llen = (...args) => new LLenCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lmove
     */
    lmove = (...args) => new LMoveCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lpop
     */
    lpop = (...args) => new LPopCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lmpop
     */
    lmpop = (...args) => new LmPopCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lpos
     */
    lpos = (...args) => new LPosCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lpush
     */
    lpush = (key, ...elements) => new LPushCommand([key, ...elements], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lpushx
     */
    lpushx = (key, ...elements) => new LPushXCommand([key, ...elements], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lrange
     */
    lrange = (...args) => new LRangeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lrem
     */
    lrem = (key, count, value) => new LRemCommand([key, count, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lset
     */
    lset = (key, index, value) => new LSetCommand([key, index, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/ltrim
     */
    ltrim = (...args) => new LTrimCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/mget
     */
    mget = (...args) => new MGetCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/mset
     */
    mset = (kv2) => new MSetCommand([kv2], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/msetnx
     */
    msetnx = (kv2) => new MSetNXCommand([kv2], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/persist
     */
    persist = (...args) => new PersistCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/pexpire
     */
    pexpire = (...args) => new PExpireCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/pexpireat
     */
    pexpireat = (...args) => new PExpireAtCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/pfadd
     */
    pfadd = (...args) => new PfAddCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/pfcount
     */
    pfcount = (...args) => new PfCountCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/pfmerge
     */
    pfmerge = (...args) => new PfMergeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/ping
     */
    ping = (args) => new PingCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/psetex
     */
    psetex = (key, ttl, value) => new PSetEXCommand([key, ttl, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/psubscribe
     */
    psubscribe = (patterns) => {
      const patternArray = Array.isArray(patterns) ? patterns : [patterns];
      return new Subscriber(this.client, patternArray, true, this.opts);
    };
    /**
     * @see https://redis.io/commands/pttl
     */
    pttl = (...args) => new PTtlCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/publish
     */
    publish = (...args) => new PublishCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/randomkey
     */
    randomkey = () => new RandomKeyCommand().exec(this.client);
    /**
     * @see https://redis.io/commands/rename
     */
    rename = (...args) => new RenameCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/renamenx
     */
    renamenx = (...args) => new RenameNXCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/rpop
     */
    rpop = (...args) => new RPopCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/rpush
     */
    rpush = (key, ...elements) => new RPushCommand([key, ...elements], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/rpushx
     */
    rpushx = (key, ...elements) => new RPushXCommand([key, ...elements], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sadd
     */
    sadd = (key, member, ...members) => new SAddCommand([key, member, ...members], this.opts).exec(this.client);
    scan(cursor, opts) {
      return new ScanCommand([cursor, opts], this.opts).exec(this.client);
    }
    /**
     * @see https://redis.io/commands/scard
     */
    scard = (...args) => new SCardCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/script-exists
     */
    scriptExists = (...args) => new ScriptExistsCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/script-flush
     */
    scriptFlush = (...args) => new ScriptFlushCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/script-load
     */
    scriptLoad = (...args) => new ScriptLoadCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sdiff
     */
    sdiff = (...args) => new SDiffCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sdiffstore
     */
    sdiffstore = (...args) => new SDiffStoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/set
     */
    set = (key, value, opts) => new SetCommand([key, value, opts], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/setbit
     */
    setbit = (...args) => new SetBitCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/setex
     */
    setex = (key, ttl, value) => new SetExCommand([key, ttl, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/setnx
     */
    setnx = (key, value) => new SetNxCommand([key, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/setrange
     */
    setrange = (...args) => new SetRangeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sinter
     */
    sinter = (...args) => new SInterCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sinterstore
     */
    sinterstore = (...args) => new SInterStoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sismember
     */
    sismember = (key, member) => new SIsMemberCommand([key, member], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/smismember
     */
    smismember = (key, members) => new SMIsMemberCommand([key, members], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/smembers
     */
    smembers = (...args) => new SMembersCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/smove
     */
    smove = (source, destination, member) => new SMoveCommand([source, destination, member], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/spop
     */
    spop = (...args) => new SPopCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/srandmember
     */
    srandmember = (...args) => new SRandMemberCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/srem
     */
    srem = (key, ...members) => new SRemCommand([key, ...members], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sscan
     */
    sscan = (...args) => new SScanCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/strlen
     */
    strlen = (...args) => new StrLenCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/subscribe
     */
    subscribe = (channels) => {
      const channelArray = Array.isArray(channels) ? channels : [channels];
      return new Subscriber(this.client, channelArray, false, this.opts);
    };
    /**
     * @see https://redis.io/commands/sunion
     */
    sunion = (...args) => new SUnionCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sunionstore
     */
    sunionstore = (...args) => new SUnionStoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/time
     */
    time = () => new TimeCommand().exec(this.client);
    /**
     * @see https://redis.io/commands/touch
     */
    touch = (...args) => new TouchCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/ttl
     */
    ttl = (...args) => new TtlCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/type
     */
    type = (...args) => new TypeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/unlink
     */
    unlink = (...args) => new UnlinkCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xadd
     */
    xadd = (...args) => new XAddCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xack
     */
    xack = (...args) => new XAckCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xdel
     */
    xdel = (...args) => new XDelCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xgroup
     */
    xgroup = (...args) => new XGroupCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xread
     */
    xread = (...args) => new XReadCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xreadgroup
     */
    xreadgroup = (...args) => new XReadGroupCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xinfo
     */
    xinfo = (...args) => new XInfoCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xlen
     */
    xlen = (...args) => new XLenCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xpending
     */
    xpending = (...args) => new XPendingCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xclaim
     */
    xclaim = (...args) => new XClaimCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xautoclaim
     */
    xautoclaim = (...args) => new XAutoClaim(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xtrim
     */
    xtrim = (...args) => new XTrimCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xrange
     */
    xrange = (...args) => new XRangeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xrevrange
     */
    xrevrange = (...args) => new XRevRangeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zadd
     */
    zadd = (...args) => {
      if ("score" in args[1]) {
        return new ZAddCommand([args[0], args[1], ...args.slice(2)], this.opts).exec(
          this.client
        );
      }
      return new ZAddCommand(
        [args[0], args[1], ...args.slice(2)],
        this.opts
      ).exec(this.client);
    };
    /**
     * @see https://redis.io/commands/zcard
     */
    zcard = (...args) => new ZCardCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zcount
     */
    zcount = (...args) => new ZCountCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zdiffstore
     */
    zdiffstore = (...args) => new ZDiffStoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zincrby
     */
    zincrby = (key, increment, member) => new ZIncrByCommand([key, increment, member], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zinterstore
     */
    zinterstore = (...args) => new ZInterStoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zlexcount
     */
    zlexcount = (...args) => new ZLexCountCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zmscore
     */
    zmscore = (...args) => new ZMScoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zpopmax
     */
    zpopmax = (...args) => new ZPopMaxCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zpopmin
     */
    zpopmin = (...args) => new ZPopMinCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zrange
     */
    zrange = (...args) => new ZRangeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zrank
     */
    zrank = (key, member) => new ZRankCommand([key, member], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zrem
     */
    zrem = (key, ...members) => new ZRemCommand([key, ...members], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zremrangebylex
     */
    zremrangebylex = (...args) => new ZRemRangeByLexCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zremrangebyrank
     */
    zremrangebyrank = (...args) => new ZRemRangeByRankCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zremrangebyscore
     */
    zremrangebyscore = (...args) => new ZRemRangeByScoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zrevrank
     */
    zrevrank = (key, member) => new ZRevRankCommand([key, member], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zscan
     */
    zscan = (...args) => new ZScanCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zscore
     */
    zscore = (key, member) => new ZScoreCommand([key, member], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zunion
     */
    zunion = (...args) => new ZUnionCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zunionstore
     */
    zunionstore = (...args) => new ZUnionStoreCommand(args, this.opts).exec(this.client);
  };
  var VERSION3 = "v1.35.6";

  // node_modules/@upstash/redis/nodejs.mjs
  if (typeof atob === "undefined") {
    global.atob = (b64) => Buffer.from(b64, "base64").toString("utf8");
  }
  var Redis2 = class _Redis extends Redis {
    /**
     * Create a new redis client by providing a custom `Requester` implementation
     *
     * @example
     * ```ts
     *
     * import { UpstashRequest, Requester, UpstashResponse, Redis } from "@upstash/redis"
     *
     *  const requester: Requester = {
     *    request: <TResult>(req: UpstashRequest): Promise<UpstashResponse<TResult>> => {
     *      // ...
     *    }
     *  }
     *
     * const redis = new Redis(requester)
     * ```
     */
    constructor(configOrRequester) {
      if ("request" in configOrRequester) {
        super(configOrRequester);
        return;
      }
      if (!configOrRequester.url) {
        console.warn(
          `[Upstash Redis] The 'url' property is missing or undefined in your Redis config.`
        );
      } else if (configOrRequester.url.startsWith(" ") || configOrRequester.url.endsWith(" ") || /\r|\n/.test(configOrRequester.url)) {
        console.warn(
          "[Upstash Redis] The redis url contains whitespace or newline, which can cause errors!"
        );
      }
      if (!configOrRequester.token) {
        console.warn(
          `[Upstash Redis] The 'token' property is missing or undefined in your Redis config.`
        );
      } else if (configOrRequester.token.startsWith(" ") || configOrRequester.token.endsWith(" ") || /\r|\n/.test(configOrRequester.token)) {
        console.warn(
          "[Upstash Redis] The redis token contains whitespace or newline, which can cause errors!"
        );
      }
      const client = new HttpClient({
        baseUrl: configOrRequester.url,
        retry: configOrRequester.retry,
        headers: { authorization: `Bearer ${configOrRequester.token}` },
        agent: configOrRequester.agent,
        responseEncoding: configOrRequester.responseEncoding,
        cache: configOrRequester.cache ?? "no-store",
        signal: configOrRequester.signal,
        keepAlive: configOrRequester.keepAlive,
        readYourWrites: configOrRequester.readYourWrites
      });
      super(client, {
        automaticDeserialization: configOrRequester.automaticDeserialization,
        enableTelemetry: !process.env.UPSTASH_DISABLE_TELEMETRY,
        latencyLogging: configOrRequester.latencyLogging,
        enableAutoPipelining: configOrRequester.enableAutoPipelining
      });
      this.addTelemetry({
        runtime: (
          // @ts-expect-error to silence compiler
          typeof EdgeRuntime === "string" ? "edge-light" : `node@${process.version}`
        ),
        platform: process.env.UPSTASH_CONSOLE ? "console" : process.env.VERCEL ? "vercel" : process.env.AWS_REGION ? "aws" : "unknown",
        sdk: `@upstash/redis@${VERSION3}`
      });
      if (this.enableAutoPipelining) {
        return this.autoPipeline();
      }
    }
    /**
     * Create a new Upstash Redis instance from environment variables.
     *
     * Use this to automatically load connection secrets from your environment
     * variables. For instance when using the Vercel integration.
     *
     * This tries to load connection details from your environment using `process.env`:
     * - URL: `UPSTASH_REDIS_REST_URL` or fallback to `KV_REST_API_URL`
     * - Token: `UPSTASH_REDIS_REST_TOKEN` or fallback to `KV_REST_API_TOKEN`
     *
     * The fallback variables provide compatibility with Vercel KV and other platforms
     * that may use different naming conventions.
     */
    static fromEnv(config) {
      if (process.env === void 0) {
        throw new TypeError(
          '[Upstash Redis] Unable to get environment variables, `process.env` is undefined. If you are deploying to cloudflare, please import from "@upstash/redis/cloudflare" instead'
        );
      }
      const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
      if (!url) {
        console.warn("[Upstash Redis] Unable to find environment variable: `UPSTASH_REDIS_REST_URL`");
      }
      const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
      if (!token) {
        console.warn(
          "[Upstash Redis] Unable to find environment variable: `UPSTASH_REDIS_REST_TOKEN`"
        );
      }
      return new _Redis({ ...config, url, token });
    }
  };

  // node_modules/@vercel/kv/dist/index.js
  var _kv = null;
  process.env.UPSTASH_DISABLE_TELEMETRY = "1";
  var VercelKV = class extends Redis2 {
    // This API is based on https://github.com/redis/node-redis#scan-iterator which is not supported in @upstash/redis
    /**
     * Same as `scan` but returns an AsyncIterator to allow iteration via `for await`.
     */
    async *scanIterator(options) {
      let cursor = "0";
      let keys;
      do {
        [cursor, keys] = await this.scan(cursor, options);
        for (const key of keys) {
          yield key;
        }
      } while (cursor !== "0");
    }
    /**
     * Same as `hscan` but returns an AsyncIterator to allow iteration via `for await`.
     */
    async *hscanIterator(key, options) {
      let cursor = "0";
      let items;
      do {
        [cursor, items] = await this.hscan(key, cursor, options);
        for (const item of items) {
          yield item;
        }
      } while (cursor !== "0");
    }
    /**
     * Same as `sscan` but returns an AsyncIterator to allow iteration via `for await`.
     */
    async *sscanIterator(key, options) {
      let cursor = "0";
      let items;
      do {
        [cursor, items] = await this.sscan(key, cursor, options);
        for (const item of items) {
          yield item;
        }
      } while (cursor !== "0");
    }
    /**
     * Same as `zscan` but returns an AsyncIterator to allow iteration via `for await`.
     */
    async *zscanIterator(key, options) {
      let cursor = "0";
      let items;
      do {
        [cursor, items] = await this.zscan(key, cursor, options);
        for (const item of items) {
          yield item;
        }
      } while (cursor !== "0");
    }
  };
  function createClient(config) {
    return new VercelKV({
      // The Next.js team recommends no value or `default` for fetch requests's `cache` option
      // upstash/redis defaults to `no-store`, so we enforce `default`
      cache: "default",
      enableAutoPipelining: true,
      ...config
    });
  }
  var src_default = new Proxy(
    {},
    {
      get(target, prop, receiver) {
        if (prop === "then" || prop === "parse") {
          return Reflect.get(target, prop, receiver);
        }
        if (!_kv) {
          if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
            throw new Error(
              "@vercel/kv: Missing required environment variables KV_REST_API_URL and KV_REST_API_TOKEN"
            );
          }
          console.warn(
            '\x1B[33m"The default export has been moved to a named export and it will be removed in version 1, change to import { kv }\x1B[0m"'
          );
          _kv = createClient({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN
          });
        }
        return Reflect.get(_kv, prop);
      }
    }
  );
  var kv = new Proxy(
    {},
    {
      get(target, prop) {
        if (!_kv) {
          if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
            throw new Error(
              "@vercel/kv: Missing required environment variables KV_REST_API_URL and KV_REST_API_TOKEN"
            );
          }
          _kv = createClient({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN
          });
        }
        return Reflect.get(_kv, prop);
      }
    }
  );

  // edge-functions/api/translate.ts
  var VOLCANO_API_KEY = process.env.VOLCANO_API_KEY || "";
  var VOLCANO_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
  var BAIDU_APP_ID = process.env.BAIDU_APP_ID || "";
  var BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY || "";
  var BAIDU_TRANSLATE_URL = "https://fanyi-api.baidu.com/api/vip/translate";
  async function callBaiduTranslateAPI(text, from, to) {
    try {
      console.log("\u8C03\u7528\u767E\u5EA6\u7FFB\u8BD1API\u8FDB\u884C\u7FFB\u8BD1");
      const salt = Math.floor(Math.random() * 1e9).toString();
      const sign = crypto.createHash("md5").update(`${BAIDU_APP_ID}${text}${salt}${BAIDU_SECRET_KEY}`).digest("hex");
      const params = {
        q: text,
        from,
        to,
        appid: BAIDU_APP_ID,
        salt,
        sign
      };
      const response = await axios_default.get(BAIDU_TRANSLATE_URL, { params });
      if (response.data && response.data.trans_result && response.data.trans_result.length > 0) {
        const translatedText = response.data.trans_result.map((item) => item.dst).join("\n");
        return translatedText;
      } else {
        throw new Error("\u767E\u5EA6\u7FFB\u8BD1API\u54CD\u5E94\u683C\u5F0F\u9519\u8BEF");
      }
    } catch (error) {
      console.error("\u767E\u5EA6\u7FFB\u8BD1API\u8C03\u7528\u5931\u8D25:", error);
      throw error;
    }
  }
  async function callVolcanoAPI(text, targetLanguage, sourceLanguage) {
    if (!VOLCANO_API_KEY) {
      throw new Error("API\u5BC6\u94A5\u672A\u914D\u7F6E");
    }
    try {
      const messages = [
        {
          role: "system",
          content: `\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u7FFB\u8BD1\u52A9\u624B\uFF0C\u8BF7\u5C06\u7528\u6237\u63D0\u4F9B\u7684\u6587\u672C\u4ECE${sourceLanguage}\u7FFB\u8BD1\u6210${targetLanguage}\u3002\u8BF7\u53EA\u8FD4\u56DE\u7FFB\u8BD1\u540E\u7684\u7ED3\u679C\uFF0C\u4E0D\u8981\u6DFB\u52A0\u4EFB\u4F55\u989D\u5916\u7684\u8BF4\u660E\u6216\u89E3\u91CA\u3002`
        },
        {
          role: "user",
          content: text
        }
      ];
      const response = await axios_default.post(VOLCANO_API_URL, {
        model: "doubao-1-5-lite-32k-250115",
        messages,
        temperature: 0.1,
        max_tokens: 2e3
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${VOLCANO_API_KEY}`
        },
        timeout: 2e4
      });
      const translatedText = response.data.choices?.[0]?.message?.content || "";
      if (!translatedText.trim()) {
        throw new Error("Empty translation result");
      }
      return translatedText;
    } catch (error) {
      console.error("\u706B\u5C71AI\u63A5\u53E3\u8C03\u7528\u5931\u8D25:", error);
      throw error;
    }
  }
  function generateCacheKey(text, sourceLanguage, targetLanguage) {
    return `translation:${sourceLanguage}:${targetLanguage}:${crypto.createHash("md5").update(text).digest("hex")}`;
  }
  async function getTranslationFromCache(text, sourceLanguage, targetLanguage) {
    try {
      const cacheKey = generateCacheKey(text, sourceLanguage, targetLanguage);
      const cachedData = await kv.get(cacheKey);
      if (cachedData) {
        console.log("\u4ECE\u7F13\u5B58\u83B7\u53D6\u7FFB\u8BD1\u7ED3\u679C");
        return JSON.parse(cachedData);
      }
      return null;
    } catch (error) {
      console.error("\u4ECE\u7F13\u5B58\u8BFB\u53D6\u5931\u8D25:", error);
      return null;
    }
  }
  async function cacheTranslationResult(text, sourceLanguage, targetLanguage, translation, provider) {
    try {
      const cacheKey = generateCacheKey(text, sourceLanguage, targetLanguage);
      const cacheData = JSON.stringify({
        translation,
        provider,
        timestamp: Date.now()
      });
      await kv.set(cacheKey, cacheData, { ex: 604800 });
      console.log("\u7FFB\u8BD1\u7ED3\u679C\u5DF2\u7F13\u5B58");
    } catch (error) {
      console.error("\u7F13\u5B58\u7FFB\u8BD1\u7ED3\u679C\u5931\u8D25:", error);
    }
  }
  async function onRequest(context) {
    const { request, env } = context;
    const response = new Response();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    if (request.method === "OPTIONS") {
      response.status = 204;
      return response;
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    try {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        console.error("\u89E3\u6790\u8BF7\u6C42\u4F53\u5931\u8D25:", e);
        body = {};
      }
      const { text, targetLanguage = "zh", sourceLanguage = "en", useBaidu = true, skipCache = false } = body;
      if (!text || typeof text !== "string") {
        return new Response(JSON.stringify({ error: "\u6587\u672C\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (!skipCache) {
        const cachedResult = await getTranslationFromCache(text, sourceLanguage, targetLanguage);
        if (cachedResult) {
          return new Response(JSON.stringify({
            translation: cachedResult.translation,
            sourceLanguage,
            targetLanguage,
            provider: cachedResult.provider,
            fromCache: true
          }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
      }
      let translatedText = "";
      let provider = "";
      if (useBaidu && BAIDU_APP_ID && BAIDU_SECRET_KEY) {
        try {
          translatedText = await callBaiduTranslateAPI(text, sourceLanguage, targetLanguage);
          provider = "baidu";
          console.log("\u767E\u5EA6\u7FFB\u8BD1\u6210\u529F");
        } catch (baiduError) {
          console.error("\u767E\u5EA6\u7FFB\u8BD1\u5931\u8D25\uFF0C\u56DE\u9000\u5230\u706B\u5C71AI:", baiduError);
          translatedText = await callVolcanoAPI(text, targetLanguage, sourceLanguage);
          provider = "volcano";
        }
      } else {
        translatedText = await callVolcanoAPI(text, targetLanguage, sourceLanguage);
        provider = "volcano";
      }
      await cacheTranslationResult(text, sourceLanguage, targetLanguage, translatedText, provider);
      return new Response(JSON.stringify({
        translation: translatedText,
        sourceLanguage,
        targetLanguage,
        provider,
        fromCache: false
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      console.error("\u7FFB\u8BD1\u5904\u7406\u9519\u8BEF:", error);
      return new Response(JSON.stringify({
        error: error instanceof Error ? error.message : "\u7FFB\u8BD1\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528",
        details: error?.response?.data || null
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }

        pagesFunctionResponse = onRequest;
      })();
          }
        
          if('/translate' === urlInfo.pathname) {
            matchedFunc = true;
              "use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all3) => {
    for (var name in all3)
      __defProp(target, name, { get: all3[name], enumerable: true });
  };

  // node_modules/axios/lib/helpers/bind.js
  function bind(fn, thisArg) {
    return function wrap() {
      return fn.apply(thisArg, arguments);
    };
  }

  // node_modules/axios/lib/utils.js
  var { toString } = Object.prototype;
  var { getPrototypeOf } = Object;
  var { iterator, toStringTag } = Symbol;
  var kindOf = /* @__PURE__ */ ((cache) => (thing) => {
    const str = toString.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
  })(/* @__PURE__ */ Object.create(null));
  var kindOfTest = (type) => {
    type = type.toLowerCase();
    return (thing) => kindOf(thing) === type;
  };
  var typeOfTest = (type) => (thing) => typeof thing === type;
  var { isArray } = Array;
  var isUndefined = typeOfTest("undefined");
  function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
  }
  var isArrayBuffer = kindOfTest("ArrayBuffer");
  function isArrayBufferView(val) {
    let result;
    if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
      result = ArrayBuffer.isView(val);
    } else {
      result = val && val.buffer && isArrayBuffer(val.buffer);
    }
    return result;
  }
  var isString = typeOfTest("string");
  var isFunction = typeOfTest("function");
  var isNumber = typeOfTest("number");
  var isObject = (thing) => thing !== null && typeof thing === "object";
  var isBoolean = (thing) => thing === true || thing === false;
  var isPlainObject = (val) => {
    if (kindOf(val) !== "object") {
      return false;
    }
    const prototype3 = getPrototypeOf(val);
    return (prototype3 === null || prototype3 === Object.prototype || Object.getPrototypeOf(prototype3) === null) && !(toStringTag in val) && !(iterator in val);
  };
  var isEmptyObject = (val) => {
    if (!isObject(val) || isBuffer(val)) {
      return false;
    }
    try {
      return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
    } catch (e) {
      return false;
    }
  };
  var isDate = kindOfTest("Date");
  var isFile = kindOfTest("File");
  var isBlob = kindOfTest("Blob");
  var isFileList = kindOfTest("FileList");
  var isStream = (val) => isObject(val) && isFunction(val.pipe);
  var isFormData = (thing) => {
    let kind;
    return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
    kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]"));
  };
  var isURLSearchParams = kindOfTest("URLSearchParams");
  var [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
  var trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
  function forEach(obj, fn, { allOwnKeys = false } = {}) {
    if (obj === null || typeof obj === "undefined") {
      return;
    }
    let i;
    let l;
    if (typeof obj !== "object") {
      obj = [obj];
    }
    if (isArray(obj)) {
      for (i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      if (isBuffer(obj)) {
        return;
      }
      const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
      const len = keys.length;
      let key;
      for (i = 0; i < len; i++) {
        key = keys[i];
        fn.call(null, obj[key], key, obj);
      }
    }
  }
  function findKey(obj, key) {
    if (isBuffer(obj)) {
      return null;
    }
    key = key.toLowerCase();
    const keys = Object.keys(obj);
    let i = keys.length;
    let _key;
    while (i-- > 0) {
      _key = keys[i];
      if (key === _key.toLowerCase()) {
        return _key;
      }
    }
    return null;
  }
  var _global = (() => {
    if (typeof globalThis !== "undefined")
      return globalThis;
    return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
  })();
  var isContextDefined = (context) => !isUndefined(context) && context !== _global;
  function merge() {
    const { caseless, skipUndefined } = isContextDefined(this) && this || {};
    const result = {};
    const assignValue = (val, key) => {
      const targetKey = caseless && findKey(result, key) || key;
      if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
        result[targetKey] = merge(result[targetKey], val);
      } else if (isPlainObject(val)) {
        result[targetKey] = merge({}, val);
      } else if (isArray(val)) {
        result[targetKey] = val.slice();
      } else if (!skipUndefined || !isUndefined(val)) {
        result[targetKey] = val;
      }
    };
    for (let i = 0, l = arguments.length; i < l; i++) {
      arguments[i] && forEach(arguments[i], assignValue);
    }
    return result;
  }
  var extend = (a, b, thisArg, { allOwnKeys } = {}) => {
    forEach(b, (val, key) => {
      if (thisArg && isFunction(val)) {
        a[key] = bind(val, thisArg);
      } else {
        a[key] = val;
      }
    }, { allOwnKeys });
    return a;
  };
  var stripBOM = (content) => {
    if (content.charCodeAt(0) === 65279) {
      content = content.slice(1);
    }
    return content;
  };
  var inherits = (constructor, superConstructor, props, descriptors2) => {
    constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
    constructor.prototype.constructor = constructor;
    Object.defineProperty(constructor, "super", {
      value: superConstructor.prototype
    });
    props && Object.assign(constructor.prototype, props);
  };
  var toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
    let props;
    let i;
    let prop;
    const merged = {};
    destObj = destObj || {};
    if (sourceObj == null)
      return destObj;
    do {
      props = Object.getOwnPropertyNames(sourceObj);
      i = props.length;
      while (i-- > 0) {
        prop = props[i];
        if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
          destObj[prop] = sourceObj[prop];
          merged[prop] = true;
        }
      }
      sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
    } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
    return destObj;
  };
  var endsWith = (str, searchString, position) => {
    str = String(str);
    if (position === void 0 || position > str.length) {
      position = str.length;
    }
    position -= searchString.length;
    const lastIndex = str.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };
  var toArray = (thing) => {
    if (!thing)
      return null;
    if (isArray(thing))
      return thing;
    let i = thing.length;
    if (!isNumber(i))
      return null;
    const arr = new Array(i);
    while (i-- > 0) {
      arr[i] = thing[i];
    }
    return arr;
  };
  var isTypedArray = /* @__PURE__ */ ((TypedArray) => {
    return (thing) => {
      return TypedArray && thing instanceof TypedArray;
    };
  })(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
  var forEachEntry = (obj, fn) => {
    const generator = obj && obj[iterator];
    const _iterator = generator.call(obj);
    let result;
    while ((result = _iterator.next()) && !result.done) {
      const pair = result.value;
      fn.call(obj, pair[0], pair[1]);
    }
  };
  var matchAll = (regExp, str) => {
    let matches;
    const arr = [];
    while ((matches = regExp.exec(str)) !== null) {
      arr.push(matches);
    }
    return arr;
  };
  var isHTMLForm = kindOfTest("HTMLFormElement");
  var toCamelCase = (str) => {
    return str.toLowerCase().replace(
      /[-_\s]([a-z\d])(\w*)/g,
      function replacer(m, p1, p2) {
        return p1.toUpperCase() + p2;
      }
    );
  };
  var hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
  var isRegExp = kindOfTest("RegExp");
  var reduceDescriptors = (obj, reducer) => {
    const descriptors2 = Object.getOwnPropertyDescriptors(obj);
    const reducedDescriptors = {};
    forEach(descriptors2, (descriptor, name) => {
      let ret;
      if ((ret = reducer(descriptor, name, obj)) !== false) {
        reducedDescriptors[name] = ret || descriptor;
      }
    });
    Object.defineProperties(obj, reducedDescriptors);
  };
  var freezeMethods = (obj) => {
    reduceDescriptors(obj, (descriptor, name) => {
      if (isFunction(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
        return false;
      }
      const value = obj[name];
      if (!isFunction(value))
        return;
      descriptor.enumerable = false;
      if ("writable" in descriptor) {
        descriptor.writable = false;
        return;
      }
      if (!descriptor.set) {
        descriptor.set = () => {
          throw Error("Can not rewrite read-only method '" + name + "'");
        };
      }
    });
  };
  var toObjectSet = (arrayOrString, delimiter) => {
    const obj = {};
    const define = (arr) => {
      arr.forEach((value) => {
        obj[value] = true;
      });
    };
    isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
    return obj;
  };
  var noop = () => {
  };
  var toFiniteNumber = (value, defaultValue) => {
    return value != null && Number.isFinite(value = +value) ? value : defaultValue;
  };
  function isSpecCompliantForm(thing) {
    return !!(thing && isFunction(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
  }
  var toJSONObject = (obj) => {
    const stack = new Array(10);
    const visit = (source, i) => {
      if (isObject(source)) {
        if (stack.indexOf(source) >= 0) {
          return;
        }
        if (isBuffer(source)) {
          return source;
        }
        if (!("toJSON" in source)) {
          stack[i] = source;
          const target = isArray(source) ? [] : {};
          forEach(source, (value, key) => {
            const reducedValue = visit(value, i + 1);
            !isUndefined(reducedValue) && (target[key] = reducedValue);
          });
          stack[i] = void 0;
          return target;
        }
      }
      return source;
    };
    return visit(obj, 0);
  };
  var isAsyncFn = kindOfTest("AsyncFunction");
  var isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
  var _setImmediate = ((setImmediateSupported, postMessageSupported) => {
    if (setImmediateSupported) {
      return setImmediate;
    }
    return postMessageSupported ? ((token, callbacks) => {
      _global.addEventListener("message", ({ source, data }) => {
        if (source === _global && data === token) {
          callbacks.length && callbacks.shift()();
        }
      }, false);
      return (cb) => {
        callbacks.push(cb);
        _global.postMessage(token, "*");
      };
    })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
  })(
    typeof setImmediate === "function",
    isFunction(_global.postMessage)
  );
  var asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
  var isIterable = (thing) => thing != null && isFunction(thing[iterator]);
  var utils_default = {
    isArray,
    isArrayBuffer,
    isBuffer,
    isFormData,
    isArrayBufferView,
    isString,
    isNumber,
    isBoolean,
    isObject,
    isPlainObject,
    isEmptyObject,
    isReadableStream,
    isRequest,
    isResponse,
    isHeaders,
    isUndefined,
    isDate,
    isFile,
    isBlob,
    isRegExp,
    isFunction,
    isStream,
    isURLSearchParams,
    isTypedArray,
    isFileList,
    forEach,
    merge,
    extend,
    trim,
    stripBOM,
    inherits,
    toFlatObject,
    kindOf,
    kindOfTest,
    endsWith,
    toArray,
    forEachEntry,
    matchAll,
    isHTMLForm,
    hasOwnProperty,
    hasOwnProp: hasOwnProperty,
    // an alias to avoid ESLint no-prototype-builtins detection
    reduceDescriptors,
    freezeMethods,
    toObjectSet,
    toCamelCase,
    noop,
    toFiniteNumber,
    findKey,
    global: _global,
    isContextDefined,
    isSpecCompliantForm,
    toJSONObject,
    isAsyncFn,
    isThenable,
    setImmediate: _setImmediate,
    asap,
    isIterable
  };

  // node_modules/axios/lib/core/AxiosError.js
  function AxiosError(message, code, config, request, response) {
    Error.call(this);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
    this.message = message;
    this.name = "AxiosError";
    code && (this.code = code);
    config && (this.config = config);
    request && (this.request = request);
    if (response) {
      this.response = response;
      this.status = response.status ? response.status : null;
    }
  }
  utils_default.inherits(AxiosError, Error, {
    toJSON: function toJSON() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: utils_default.toJSONObject(this.config),
        code: this.code,
        status: this.status
      };
    }
  });
  var prototype = AxiosError.prototype;
  var descriptors = {};
  [
    "ERR_BAD_OPTION_VALUE",
    "ERR_BAD_OPTION",
    "ECONNABORTED",
    "ETIMEDOUT",
    "ERR_NETWORK",
    "ERR_FR_TOO_MANY_REDIRECTS",
    "ERR_DEPRECATED",
    "ERR_BAD_RESPONSE",
    "ERR_BAD_REQUEST",
    "ERR_CANCELED",
    "ERR_NOT_SUPPORT",
    "ERR_INVALID_URL"
    // eslint-disable-next-line func-names
  ].forEach((code) => {
    descriptors[code] = { value: code };
  });
  Object.defineProperties(AxiosError, descriptors);
  Object.defineProperty(prototype, "isAxiosError", { value: true });
  AxiosError.from = (error, code, config, request, response, customProps) => {
    const axiosError = Object.create(prototype);
    utils_default.toFlatObject(error, axiosError, function filter2(obj) {
      return obj !== Error.prototype;
    }, (prop) => {
      return prop !== "isAxiosError";
    });
    const msg = error && error.message ? error.message : "Error";
    const errCode = code == null && error ? error.code : code;
    AxiosError.call(axiosError, msg, errCode, config, request, response);
    if (error && axiosError.cause == null) {
      Object.defineProperty(axiosError, "cause", { value: error, configurable: true });
    }
    axiosError.name = error && error.name || "Error";
    customProps && Object.assign(axiosError, customProps);
    return axiosError;
  };
  var AxiosError_default = AxiosError;

  // node_modules/axios/lib/helpers/null.js
  var null_default = null;

  // node_modules/axios/lib/helpers/toFormData.js
  function isVisitable(thing) {
    return utils_default.isPlainObject(thing) || utils_default.isArray(thing);
  }
  function removeBrackets(key) {
    return utils_default.endsWith(key, "[]") ? key.slice(0, -2) : key;
  }
  function renderKey(path, key, dots) {
    if (!path)
      return key;
    return path.concat(key).map(function each(token, i) {
      token = removeBrackets(token);
      return !dots && i ? "[" + token + "]" : token;
    }).join(dots ? "." : "");
  }
  function isFlatArray(arr) {
    return utils_default.isArray(arr) && !arr.some(isVisitable);
  }
  var predicates = utils_default.toFlatObject(utils_default, {}, null, function filter(prop) {
    return /^is[A-Z]/.test(prop);
  });
  function toFormData(obj, formData, options) {
    if (!utils_default.isObject(obj)) {
      throw new TypeError("target must be an object");
    }
    formData = formData || new (null_default || FormData)();
    options = utils_default.toFlatObject(options, {
      metaTokens: true,
      dots: false,
      indexes: false
    }, false, function defined(option, source) {
      return !utils_default.isUndefined(source[option]);
    });
    const metaTokens = options.metaTokens;
    const visitor = options.visitor || defaultVisitor;
    const dots = options.dots;
    const indexes = options.indexes;
    const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
    const useBlob = _Blob && utils_default.isSpecCompliantForm(formData);
    if (!utils_default.isFunction(visitor)) {
      throw new TypeError("visitor must be a function");
    }
    function convertValue(value) {
      if (value === null)
        return "";
      if (utils_default.isDate(value)) {
        return value.toISOString();
      }
      if (utils_default.isBoolean(value)) {
        return value.toString();
      }
      if (!useBlob && utils_default.isBlob(value)) {
        throw new AxiosError_default("Blob is not supported. Use a Buffer instead.");
      }
      if (utils_default.isArrayBuffer(value) || utils_default.isTypedArray(value)) {
        return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
      }
      return value;
    }
    function defaultVisitor(value, key, path) {
      let arr = value;
      if (value && !path && typeof value === "object") {
        if (utils_default.endsWith(key, "{}")) {
          key = metaTokens ? key : key.slice(0, -2);
          value = JSON.stringify(value);
        } else if (utils_default.isArray(value) && isFlatArray(value) || (utils_default.isFileList(value) || utils_default.endsWith(key, "[]")) && (arr = utils_default.toArray(value))) {
          key = removeBrackets(key);
          arr.forEach(function each(el, index) {
            !(utils_default.isUndefined(el) || el === null) && formData.append(
              // eslint-disable-next-line no-nested-ternary
              indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
              convertValue(el)
            );
          });
          return false;
        }
      }
      if (isVisitable(value)) {
        return true;
      }
      formData.append(renderKey(path, key, dots), convertValue(value));
      return false;
    }
    const stack = [];
    const exposedHelpers = Object.assign(predicates, {
      defaultVisitor,
      convertValue,
      isVisitable
    });
    function build(value, path) {
      if (utils_default.isUndefined(value))
        return;
      if (stack.indexOf(value) !== -1) {
        throw Error("Circular reference detected in " + path.join("."));
      }
      stack.push(value);
      utils_default.forEach(value, function each(el, key) {
        const result = !(utils_default.isUndefined(el) || el === null) && visitor.call(
          formData,
          el,
          utils_default.isString(key) ? key.trim() : key,
          path,
          exposedHelpers
        );
        if (result === true) {
          build(el, path ? path.concat(key) : [key]);
        }
      });
      stack.pop();
    }
    if (!utils_default.isObject(obj)) {
      throw new TypeError("data must be an object");
    }
    build(obj);
    return formData;
  }
  var toFormData_default = toFormData;

  // node_modules/axios/lib/helpers/AxiosURLSearchParams.js
  function encode(str) {
    const charMap = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+",
      "%00": "\0"
    };
    return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
      return charMap[match];
    });
  }
  function AxiosURLSearchParams(params, options) {
    this._pairs = [];
    params && toFormData_default(params, this, options);
  }
  var prototype2 = AxiosURLSearchParams.prototype;
  prototype2.append = function append(name, value) {
    this._pairs.push([name, value]);
  };
  prototype2.toString = function toString2(encoder) {
    const _encode = encoder ? function(value) {
      return encoder.call(this, value, encode);
    } : encode;
    return this._pairs.map(function each(pair) {
      return _encode(pair[0]) + "=" + _encode(pair[1]);
    }, "").join("&");
  };
  var AxiosURLSearchParams_default = AxiosURLSearchParams;

  // node_modules/axios/lib/helpers/buildURL.js
  function encode2(val) {
    return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
  }
  function buildURL(url, params, options) {
    if (!params) {
      return url;
    }
    const _encode = options && options.encode || encode2;
    if (utils_default.isFunction(options)) {
      options = {
        serialize: options
      };
    }
    const serializeFn = options && options.serialize;
    let serializedParams;
    if (serializeFn) {
      serializedParams = serializeFn(params, options);
    } else {
      serializedParams = utils_default.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams_default(params, options).toString(_encode);
    }
    if (serializedParams) {
      const hashmarkIndex = url.indexOf("#");
      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }
      url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
    }
    return url;
  }

  // node_modules/axios/lib/core/InterceptorManager.js
  var InterceptorManager = class {
    constructor() {
      this.handlers = [];
    }
    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled,
        rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    }
    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     *
     * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
     */
    eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    }
    /**
     * Clear all interceptors from the stack
     *
     * @returns {void}
     */
    clear() {
      if (this.handlers) {
        this.handlers = [];
      }
    }
    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     *
     * @returns {void}
     */
    forEach(fn) {
      utils_default.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    }
  };
  var InterceptorManager_default = InterceptorManager;

  // node_modules/axios/lib/defaults/transitional.js
  var transitional_default = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  };

  // node_modules/axios/lib/platform/browser/classes/URLSearchParams.js
  var URLSearchParams_default = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams_default;

  // node_modules/axios/lib/platform/browser/classes/FormData.js
  var FormData_default = typeof FormData !== "undefined" ? FormData : null;

  // node_modules/axios/lib/platform/browser/classes/Blob.js
  var Blob_default = typeof Blob !== "undefined" ? Blob : null;

  // node_modules/axios/lib/platform/browser/index.js
  var browser_default = {
    isBrowser: true,
    classes: {
      URLSearchParams: URLSearchParams_default,
      FormData: FormData_default,
      Blob: Blob_default
    },
    protocols: ["http", "https", "file", "blob", "url", "data"]
  };

  // node_modules/axios/lib/platform/common/utils.js
  var utils_exports = {};
  __export(utils_exports, {
    hasBrowserEnv: () => hasBrowserEnv,
    hasStandardBrowserEnv: () => hasStandardBrowserEnv,
    hasStandardBrowserWebWorkerEnv: () => hasStandardBrowserWebWorkerEnv,
    navigator: () => _navigator,
    origin: () => origin
  });
  var hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
  var _navigator = typeof navigator === "object" && navigator || void 0;
  var hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
  var hasStandardBrowserWebWorkerEnv = (() => {
    return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
    self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
  })();
  var origin = hasBrowserEnv && window.location.href || "http://localhost";

  // node_modules/axios/lib/platform/index.js
  var platform_default = {
    ...utils_exports,
    ...browser_default
  };

  // node_modules/axios/lib/helpers/toURLEncodedForm.js
  function toURLEncodedForm(data, options) {
    return toFormData_default(data, new platform_default.classes.URLSearchParams(), {
      visitor: function(value, key, path, helpers) {
        if (platform_default.isNode && utils_default.isBuffer(value)) {
          this.append(key, value.toString("base64"));
          return false;
        }
        return helpers.defaultVisitor.apply(this, arguments);
      },
      ...options
    });
  }

  // node_modules/axios/lib/helpers/formDataToJSON.js
  function parsePropPath(name) {
    return utils_default.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
      return match[0] === "[]" ? "" : match[1] || match[0];
    });
  }
  function arrayToObject(arr) {
    const obj = {};
    const keys = Object.keys(arr);
    let i;
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      obj[key] = arr[key];
    }
    return obj;
  }
  function formDataToJSON(formData) {
    function buildPath(path, value, target, index) {
      let name = path[index++];
      if (name === "__proto__")
        return true;
      const isNumericKey = Number.isFinite(+name);
      const isLast = index >= path.length;
      name = !name && utils_default.isArray(target) ? target.length : name;
      if (isLast) {
        if (utils_default.hasOwnProp(target, name)) {
          target[name] = [target[name], value];
        } else {
          target[name] = value;
        }
        return !isNumericKey;
      }
      if (!target[name] || !utils_default.isObject(target[name])) {
        target[name] = [];
      }
      const result = buildPath(path, value, target[name], index);
      if (result && utils_default.isArray(target[name])) {
        target[name] = arrayToObject(target[name]);
      }
      return !isNumericKey;
    }
    if (utils_default.isFormData(formData) && utils_default.isFunction(formData.entries)) {
      const obj = {};
      utils_default.forEachEntry(formData, (name, value) => {
        buildPath(parsePropPath(name), value, obj, 0);
      });
      return obj;
    }
    return null;
  }
  var formDataToJSON_default = formDataToJSON;

  // node_modules/axios/lib/defaults/index.js
  function stringifySafely(rawValue, parser, encoder) {
    if (utils_default.isString(rawValue)) {
      try {
        (parser || JSON.parse)(rawValue);
        return utils_default.trim(rawValue);
      } catch (e) {
        if (e.name !== "SyntaxError") {
          throw e;
        }
      }
    }
    return (encoder || JSON.stringify)(rawValue);
  }
  var defaults = {
    transitional: transitional_default,
    adapter: ["xhr", "http", "fetch"],
    transformRequest: [function transformRequest(data, headers) {
      const contentType = headers.getContentType() || "";
      const hasJSONContentType = contentType.indexOf("application/json") > -1;
      const isObjectPayload = utils_default.isObject(data);
      if (isObjectPayload && utils_default.isHTMLForm(data)) {
        data = new FormData(data);
      }
      const isFormData2 = utils_default.isFormData(data);
      if (isFormData2) {
        return hasJSONContentType ? JSON.stringify(formDataToJSON_default(data)) : data;
      }
      if (utils_default.isArrayBuffer(data) || utils_default.isBuffer(data) || utils_default.isStream(data) || utils_default.isFile(data) || utils_default.isBlob(data) || utils_default.isReadableStream(data)) {
        return data;
      }
      if (utils_default.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils_default.isURLSearchParams(data)) {
        headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
        return data.toString();
      }
      let isFileList2;
      if (isObjectPayload) {
        if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
          return toURLEncodedForm(data, this.formSerializer).toString();
        }
        if ((isFileList2 = utils_default.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
          const _FormData = this.env && this.env.FormData;
          return toFormData_default(
            isFileList2 ? { "files[]": data } : data,
            _FormData && new _FormData(),
            this.formSerializer
          );
        }
      }
      if (isObjectPayload || hasJSONContentType) {
        headers.setContentType("application/json", false);
        return stringifySafely(data);
      }
      return data;
    }],
    transformResponse: [function transformResponse(data) {
      const transitional2 = this.transitional || defaults.transitional;
      const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
      const JSONRequested = this.responseType === "json";
      if (utils_default.isResponse(data) || utils_default.isReadableStream(data)) {
        return data;
      }
      if (data && utils_default.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
        const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
        const strictJSONParsing = !silentJSONParsing && JSONRequested;
        try {
          return JSON.parse(data, this.parseReviver);
        } catch (e) {
          if (strictJSONParsing) {
            if (e.name === "SyntaxError") {
              throw AxiosError_default.from(e, AxiosError_default.ERR_BAD_RESPONSE, this, null, this.response);
            }
            throw e;
          }
        }
      }
      return data;
    }],
    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
      FormData: platform_default.classes.FormData,
      Blob: platform_default.classes.Blob
    },
    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    },
    headers: {
      common: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": void 0
      }
    }
  };
  utils_default.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
    defaults.headers[method] = {};
  });
  var defaults_default = defaults;

  // node_modules/axios/lib/helpers/parseHeaders.js
  var ignoreDuplicateOf = utils_default.toObjectSet([
    "age",
    "authorization",
    "content-length",
    "content-type",
    "etag",
    "expires",
    "from",
    "host",
    "if-modified-since",
    "if-unmodified-since",
    "last-modified",
    "location",
    "max-forwards",
    "proxy-authorization",
    "referer",
    "retry-after",
    "user-agent"
  ]);
  var parseHeaders_default = (rawHeaders) => {
    const parsed = {};
    let key;
    let val;
    let i;
    rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
      i = line.indexOf(":");
      key = line.substring(0, i).trim().toLowerCase();
      val = line.substring(i + 1).trim();
      if (!key || parsed[key] && ignoreDuplicateOf[key]) {
        return;
      }
      if (key === "set-cookie") {
        if (parsed[key]) {
          parsed[key].push(val);
        } else {
          parsed[key] = [val];
        }
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
      }
    });
    return parsed;
  };

  // node_modules/axios/lib/core/AxiosHeaders.js
  var $internals = Symbol("internals");
  function normalizeHeader(header) {
    return header && String(header).trim().toLowerCase();
  }
  function normalizeValue(value) {
    if (value === false || value == null) {
      return value;
    }
    return utils_default.isArray(value) ? value.map(normalizeValue) : String(value);
  }
  function parseTokens(str) {
    const tokens = /* @__PURE__ */ Object.create(null);
    const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
    let match;
    while (match = tokensRE.exec(str)) {
      tokens[match[1]] = match[2];
    }
    return tokens;
  }
  var isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
  function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
    if (utils_default.isFunction(filter2)) {
      return filter2.call(this, value, header);
    }
    if (isHeaderNameFilter) {
      value = header;
    }
    if (!utils_default.isString(value))
      return;
    if (utils_default.isString(filter2)) {
      return value.indexOf(filter2) !== -1;
    }
    if (utils_default.isRegExp(filter2)) {
      return filter2.test(value);
    }
  }
  function formatHeader(header) {
    return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
      return char.toUpperCase() + str;
    });
  }
  function buildAccessors(obj, header) {
    const accessorName = utils_default.toCamelCase(" " + header);
    ["get", "set", "has"].forEach((methodName) => {
      Object.defineProperty(obj, methodName + accessorName, {
        value: function(arg1, arg2, arg3) {
          return this[methodName].call(this, header, arg1, arg2, arg3);
        },
        configurable: true
      });
    });
  }
  var AxiosHeaders = class {
    constructor(headers) {
      headers && this.set(headers);
    }
    set(header, valueOrRewrite, rewrite) {
      const self2 = this;
      function setHeader(_value, _header, _rewrite) {
        const lHeader = normalizeHeader(_header);
        if (!lHeader) {
          throw new Error("header name must be a non-empty string");
        }
        const key = utils_default.findKey(self2, lHeader);
        if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
          self2[key || _header] = normalizeValue(_value);
        }
      }
      const setHeaders = (headers, _rewrite) => utils_default.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
      if (utils_default.isPlainObject(header) || header instanceof this.constructor) {
        setHeaders(header, valueOrRewrite);
      } else if (utils_default.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
        setHeaders(parseHeaders_default(header), valueOrRewrite);
      } else if (utils_default.isObject(header) && utils_default.isIterable(header)) {
        let obj = {}, dest, key;
        for (const entry of header) {
          if (!utils_default.isArray(entry)) {
            throw TypeError("Object iterator must return a key-value pair");
          }
          obj[key = entry[0]] = (dest = obj[key]) ? utils_default.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
        }
        setHeaders(obj, valueOrRewrite);
      } else {
        header != null && setHeader(valueOrRewrite, header, rewrite);
      }
      return this;
    }
    get(header, parser) {
      header = normalizeHeader(header);
      if (header) {
        const key = utils_default.findKey(this, header);
        if (key) {
          const value = this[key];
          if (!parser) {
            return value;
          }
          if (parser === true) {
            return parseTokens(value);
          }
          if (utils_default.isFunction(parser)) {
            return parser.call(this, value, key);
          }
          if (utils_default.isRegExp(parser)) {
            return parser.exec(value);
          }
          throw new TypeError("parser must be boolean|regexp|function");
        }
      }
    }
    has(header, matcher) {
      header = normalizeHeader(header);
      if (header) {
        const key = utils_default.findKey(this, header);
        return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
      }
      return false;
    }
    delete(header, matcher) {
      const self2 = this;
      let deleted = false;
      function deleteHeader(_header) {
        _header = normalizeHeader(_header);
        if (_header) {
          const key = utils_default.findKey(self2, _header);
          if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
            delete self2[key];
            deleted = true;
          }
        }
      }
      if (utils_default.isArray(header)) {
        header.forEach(deleteHeader);
      } else {
        deleteHeader(header);
      }
      return deleted;
    }
    clear(matcher) {
      const keys = Object.keys(this);
      let i = keys.length;
      let deleted = false;
      while (i--) {
        const key = keys[i];
        if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
          delete this[key];
          deleted = true;
        }
      }
      return deleted;
    }
    normalize(format) {
      const self2 = this;
      const headers = {};
      utils_default.forEach(this, (value, header) => {
        const key = utils_default.findKey(headers, header);
        if (key) {
          self2[key] = normalizeValue(value);
          delete self2[header];
          return;
        }
        const normalized = format ? formatHeader(header) : String(header).trim();
        if (normalized !== header) {
          delete self2[header];
        }
        self2[normalized] = normalizeValue(value);
        headers[normalized] = true;
      });
      return this;
    }
    concat(...targets) {
      return this.constructor.concat(this, ...targets);
    }
    toJSON(asStrings) {
      const obj = /* @__PURE__ */ Object.create(null);
      utils_default.forEach(this, (value, header) => {
        value != null && value !== false && (obj[header] = asStrings && utils_default.isArray(value) ? value.join(", ") : value);
      });
      return obj;
    }
    [Symbol.iterator]() {
      return Object.entries(this.toJSON())[Symbol.iterator]();
    }
    toString() {
      return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
    }
    getSetCookie() {
      return this.get("set-cookie") || [];
    }
    get [Symbol.toStringTag]() {
      return "AxiosHeaders";
    }
    static from(thing) {
      return thing instanceof this ? thing : new this(thing);
    }
    static concat(first, ...targets) {
      const computed = new this(first);
      targets.forEach((target) => computed.set(target));
      return computed;
    }
    static accessor(header) {
      const internals = this[$internals] = this[$internals] = {
        accessors: {}
      };
      const accessors = internals.accessors;
      const prototype3 = this.prototype;
      function defineAccessor(_header) {
        const lHeader = normalizeHeader(_header);
        if (!accessors[lHeader]) {
          buildAccessors(prototype3, _header);
          accessors[lHeader] = true;
        }
      }
      utils_default.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
      return this;
    }
  };
  AxiosHeaders.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
  utils_default.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
    let mapped = key[0].toUpperCase() + key.slice(1);
    return {
      get: () => value,
      set(headerValue) {
        this[mapped] = headerValue;
      }
    };
  });
  utils_default.freezeMethods(AxiosHeaders);
  var AxiosHeaders_default = AxiosHeaders;

  // node_modules/axios/lib/core/transformData.js
  function transformData(fns, response) {
    const config = this || defaults_default;
    const context = response || config;
    const headers = AxiosHeaders_default.from(context.headers);
    let data = context.data;
    utils_default.forEach(fns, function transform2(fn) {
      data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
    });
    headers.normalize();
    return data;
  }

  // node_modules/axios/lib/cancel/isCancel.js
  function isCancel(value) {
    return !!(value && value.__CANCEL__);
  }

  // node_modules/axios/lib/cancel/CanceledError.js
  function CanceledError(message, config, request) {
    AxiosError_default.call(this, message == null ? "canceled" : message, AxiosError_default.ERR_CANCELED, config, request);
    this.name = "CanceledError";
  }
  utils_default.inherits(CanceledError, AxiosError_default, {
    __CANCEL__: true
  });
  var CanceledError_default = CanceledError;

  // node_modules/axios/lib/core/settle.js
  function settle(resolve, reject, response) {
    const validateStatus2 = response.config.validateStatus;
    if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
      resolve(response);
    } else {
      reject(new AxiosError_default(
        "Request failed with status code " + response.status,
        [AxiosError_default.ERR_BAD_REQUEST, AxiosError_default.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
        response.config,
        response.request,
        response
      ));
    }
  }

  // node_modules/axios/lib/helpers/parseProtocol.js
  function parseProtocol(url) {
    const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
    return match && match[1] || "";
  }

  // node_modules/axios/lib/helpers/speedometer.js
  function speedometer(samplesCount, min) {
    samplesCount = samplesCount || 10;
    const bytes = new Array(samplesCount);
    const timestamps = new Array(samplesCount);
    let head = 0;
    let tail = 0;
    let firstSampleTS;
    min = min !== void 0 ? min : 1e3;
    return function push(chunkLength) {
      const now = Date.now();
      const startedAt = timestamps[tail];
      if (!firstSampleTS) {
        firstSampleTS = now;
      }
      bytes[head] = chunkLength;
      timestamps[head] = now;
      let i = tail;
      let bytesCount = 0;
      while (i !== head) {
        bytesCount += bytes[i++];
        i = i % samplesCount;
      }
      head = (head + 1) % samplesCount;
      if (head === tail) {
        tail = (tail + 1) % samplesCount;
      }
      if (now - firstSampleTS < min) {
        return;
      }
      const passed = startedAt && now - startedAt;
      return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
    };
  }
  var speedometer_default = speedometer;

  // node_modules/axios/lib/helpers/throttle.js
  function throttle(fn, freq) {
    let timestamp = 0;
    let threshold = 1e3 / freq;
    let lastArgs;
    let timer;
    const invoke = (args, now = Date.now()) => {
      timestamp = now;
      lastArgs = null;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      fn(...args);
    };
    const throttled = (...args) => {
      const now = Date.now();
      const passed = now - timestamp;
      if (passed >= threshold) {
        invoke(args, now);
      } else {
        lastArgs = args;
        if (!timer) {
          timer = setTimeout(() => {
            timer = null;
            invoke(lastArgs);
          }, threshold - passed);
        }
      }
    };
    const flush = () => lastArgs && invoke(lastArgs);
    return [throttled, flush];
  }
  var throttle_default = throttle;

  // node_modules/axios/lib/helpers/progressEventReducer.js
  var progressEventReducer = (listener, isDownloadStream, freq = 3) => {
    let bytesNotified = 0;
    const _speedometer = speedometer_default(50, 250);
    return throttle_default((e) => {
      const loaded = e.loaded;
      const total = e.lengthComputable ? e.total : void 0;
      const progressBytes = loaded - bytesNotified;
      const rate = _speedometer(progressBytes);
      const inRange = loaded <= total;
      bytesNotified = loaded;
      const data = {
        loaded,
        total,
        progress: total ? loaded / total : void 0,
        bytes: progressBytes,
        rate: rate ? rate : void 0,
        estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
        event: e,
        lengthComputable: total != null,
        [isDownloadStream ? "download" : "upload"]: true
      };
      listener(data);
    }, freq);
  };
  var progressEventDecorator = (total, throttled) => {
    const lengthComputable = total != null;
    return [(loaded) => throttled[0]({
      lengthComputable,
      total,
      loaded
    }), throttled[1]];
  };
  var asyncDecorator = (fn) => (...args) => utils_default.asap(() => fn(...args));

  // node_modules/axios/lib/helpers/isURLSameOrigin.js
  var isURLSameOrigin_default = platform_default.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
    url = new URL(url, platform_default.origin);
    return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
  })(
    new URL(platform_default.origin),
    platform_default.navigator && /(msie|trident)/i.test(platform_default.navigator.userAgent)
  ) : () => true;

  // node_modules/axios/lib/helpers/cookies.js
  var cookies_default = platform_default.hasStandardBrowserEnv ? (
    // Standard browser envs support document.cookie
    {
      write(name, value, expires, path, domain, secure) {
        const cookie = [name + "=" + encodeURIComponent(value)];
        utils_default.isNumber(expires) && cookie.push("expires=" + new Date(expires).toGMTString());
        utils_default.isString(path) && cookie.push("path=" + path);
        utils_default.isString(domain) && cookie.push("domain=" + domain);
        secure === true && cookie.push("secure");
        document.cookie = cookie.join("; ");
      },
      read(name) {
        const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
        return match ? decodeURIComponent(match[3]) : null;
      },
      remove(name) {
        this.write(name, "", Date.now() - 864e5);
      }
    }
  ) : (
    // Non-standard browser env (web workers, react-native) lack needed support.
    {
      write() {
      },
      read() {
        return null;
      },
      remove() {
      }
    }
  );

  // node_modules/axios/lib/helpers/isAbsoluteURL.js
  function isAbsoluteURL(url) {
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
  }

  // node_modules/axios/lib/helpers/combineURLs.js
  function combineURLs(baseURL, relativeURL) {
    return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
  }

  // node_modules/axios/lib/core/buildFullPath.js
  function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
    let isRelativeUrl = !isAbsoluteURL(requestedURL);
    if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  }

  // node_modules/axios/lib/core/mergeConfig.js
  var headersToObject = (thing) => thing instanceof AxiosHeaders_default ? { ...thing } : thing;
  function mergeConfig(config1, config2) {
    config2 = config2 || {};
    const config = {};
    function getMergedValue(target, source, prop, caseless) {
      if (utils_default.isPlainObject(target) && utils_default.isPlainObject(source)) {
        return utils_default.merge.call({ caseless }, target, source);
      } else if (utils_default.isPlainObject(source)) {
        return utils_default.merge({}, source);
      } else if (utils_default.isArray(source)) {
        return source.slice();
      }
      return source;
    }
    function mergeDeepProperties(a, b, prop, caseless) {
      if (!utils_default.isUndefined(b)) {
        return getMergedValue(a, b, prop, caseless);
      } else if (!utils_default.isUndefined(a)) {
        return getMergedValue(void 0, a, prop, caseless);
      }
    }
    function valueFromConfig2(a, b) {
      if (!utils_default.isUndefined(b)) {
        return getMergedValue(void 0, b);
      }
    }
    function defaultToConfig2(a, b) {
      if (!utils_default.isUndefined(b)) {
        return getMergedValue(void 0, b);
      } else if (!utils_default.isUndefined(a)) {
        return getMergedValue(void 0, a);
      }
    }
    function mergeDirectKeys(a, b, prop) {
      if (prop in config2) {
        return getMergedValue(a, b);
      } else if (prop in config1) {
        return getMergedValue(void 0, a);
      }
    }
    const mergeMap = {
      url: valueFromConfig2,
      method: valueFromConfig2,
      data: valueFromConfig2,
      baseURL: defaultToConfig2,
      transformRequest: defaultToConfig2,
      transformResponse: defaultToConfig2,
      paramsSerializer: defaultToConfig2,
      timeout: defaultToConfig2,
      timeoutMessage: defaultToConfig2,
      withCredentials: defaultToConfig2,
      withXSRFToken: defaultToConfig2,
      adapter: defaultToConfig2,
      responseType: defaultToConfig2,
      xsrfCookieName: defaultToConfig2,
      xsrfHeaderName: defaultToConfig2,
      onUploadProgress: defaultToConfig2,
      onDownloadProgress: defaultToConfig2,
      decompress: defaultToConfig2,
      maxContentLength: defaultToConfig2,
      maxBodyLength: defaultToConfig2,
      beforeRedirect: defaultToConfig2,
      transport: defaultToConfig2,
      httpAgent: defaultToConfig2,
      httpsAgent: defaultToConfig2,
      cancelToken: defaultToConfig2,
      socketPath: defaultToConfig2,
      responseEncoding: defaultToConfig2,
      validateStatus: mergeDirectKeys,
      headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
    };
    utils_default.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
      const merge3 = mergeMap[prop] || mergeDeepProperties;
      const configValue = merge3(config1[prop], config2[prop], prop);
      utils_default.isUndefined(configValue) && merge3 !== mergeDirectKeys || (config[prop] = configValue);
    });
    return config;
  }

  // node_modules/axios/lib/helpers/resolveConfig.js
  var resolveConfig_default = (config) => {
    const newConfig = mergeConfig({}, config);
    let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
    newConfig.headers = headers = AxiosHeaders_default.from(headers);
    newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
    if (auth) {
      headers.set(
        "Authorization",
        "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
      );
    }
    if (utils_default.isFormData(data)) {
      if (platform_default.hasStandardBrowserEnv || platform_default.hasStandardBrowserWebWorkerEnv) {
        headers.setContentType(void 0);
      } else if (utils_default.isFunction(data.getHeaders)) {
        const formHeaders = data.getHeaders();
        const allowedHeaders = ["content-type", "content-length"];
        Object.entries(formHeaders).forEach(([key, val]) => {
          if (allowedHeaders.includes(key.toLowerCase())) {
            headers.set(key, val);
          }
        });
      }
    }
    if (platform_default.hasStandardBrowserEnv) {
      withXSRFToken && utils_default.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
      if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin_default(newConfig.url)) {
        const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies_default.read(xsrfCookieName);
        if (xsrfValue) {
          headers.set(xsrfHeaderName, xsrfValue);
        }
      }
    }
    return newConfig;
  };

  // node_modules/axios/lib/adapters/xhr.js
  var isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
  var xhr_default = isXHRAdapterSupported && function(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      const _config = resolveConfig_default(config);
      let requestData = _config.data;
      const requestHeaders = AxiosHeaders_default.from(_config.headers).normalize();
      let { responseType, onUploadProgress, onDownloadProgress } = _config;
      let onCanceled;
      let uploadThrottled, downloadThrottled;
      let flushUpload, flushDownload;
      function done() {
        flushUpload && flushUpload();
        flushDownload && flushDownload();
        _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
        _config.signal && _config.signal.removeEventListener("abort", onCanceled);
      }
      let request = new XMLHttpRequest();
      request.open(_config.method.toUpperCase(), _config.url, true);
      request.timeout = _config.timeout;
      function onloadend() {
        if (!request) {
          return;
        }
        const responseHeaders = AxiosHeaders_default.from(
          "getAllResponseHeaders" in request && request.getAllResponseHeaders()
        );
        const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
        const response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        };
        settle(function _resolve(value) {
          resolve(value);
          done();
        }, function _reject(err) {
          reject(err);
          done();
        }, response);
        request = null;
      }
      if ("onloadend" in request) {
        request.onloadend = onloadend;
      } else {
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
            return;
          }
          setTimeout(onloadend);
        };
      }
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }
        reject(new AxiosError_default("Request aborted", AxiosError_default.ECONNABORTED, config, request));
        request = null;
      };
      request.onerror = function handleError(event) {
        const msg = event && event.message ? event.message : "Network Error";
        const err = new AxiosError_default(msg, AxiosError_default.ERR_NETWORK, config, request);
        err.event = event || null;
        reject(err);
        request = null;
      };
      request.ontimeout = function handleTimeout() {
        let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
        const transitional2 = _config.transitional || transitional_default;
        if (_config.timeoutErrorMessage) {
          timeoutErrorMessage = _config.timeoutErrorMessage;
        }
        reject(new AxiosError_default(
          timeoutErrorMessage,
          transitional2.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED,
          config,
          request
        ));
        request = null;
      };
      requestData === void 0 && requestHeaders.setContentType(null);
      if ("setRequestHeader" in request) {
        utils_default.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
          request.setRequestHeader(key, val);
        });
      }
      if (!utils_default.isUndefined(_config.withCredentials)) {
        request.withCredentials = !!_config.withCredentials;
      }
      if (responseType && responseType !== "json") {
        request.responseType = _config.responseType;
      }
      if (onDownloadProgress) {
        [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
        request.addEventListener("progress", downloadThrottled);
      }
      if (onUploadProgress && request.upload) {
        [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
        request.upload.addEventListener("progress", uploadThrottled);
        request.upload.addEventListener("loadend", flushUpload);
      }
      if (_config.cancelToken || _config.signal) {
        onCanceled = (cancel) => {
          if (!request) {
            return;
          }
          reject(!cancel || cancel.type ? new CanceledError_default(null, config, request) : cancel);
          request.abort();
          request = null;
        };
        _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
        if (_config.signal) {
          _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
        }
      }
      const protocol = parseProtocol(_config.url);
      if (protocol && platform_default.protocols.indexOf(protocol) === -1) {
        reject(new AxiosError_default("Unsupported protocol " + protocol + ":", AxiosError_default.ERR_BAD_REQUEST, config));
        return;
      }
      request.send(requestData || null);
    });
  };

  // node_modules/axios/lib/helpers/composeSignals.js
  var composeSignals = (signals, timeout) => {
    const { length } = signals = signals ? signals.filter(Boolean) : [];
    if (timeout || length) {
      let controller = new AbortController();
      let aborted;
      const onabort = function(reason) {
        if (!aborted) {
          aborted = true;
          unsubscribe();
          const err = reason instanceof Error ? reason : this.reason;
          controller.abort(err instanceof AxiosError_default ? err : new CanceledError_default(err instanceof Error ? err.message : err));
        }
      };
      let timer = timeout && setTimeout(() => {
        timer = null;
        onabort(new AxiosError_default(`timeout ${timeout} of ms exceeded`, AxiosError_default.ETIMEDOUT));
      }, timeout);
      const unsubscribe = () => {
        if (signals) {
          timer && clearTimeout(timer);
          timer = null;
          signals.forEach((signal2) => {
            signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
          });
          signals = null;
        }
      };
      signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
      const { signal } = controller;
      signal.unsubscribe = () => utils_default.asap(unsubscribe);
      return signal;
    }
  };
  var composeSignals_default = composeSignals;

  // node_modules/axios/lib/helpers/trackStream.js
  var streamChunk = function* (chunk, chunkSize) {
    let len = chunk.byteLength;
    if (!chunkSize || len < chunkSize) {
      yield chunk;
      return;
    }
    let pos = 0;
    let end;
    while (pos < len) {
      end = pos + chunkSize;
      yield chunk.slice(pos, end);
      pos = end;
    }
  };
  var readBytes = async function* (iterable, chunkSize) {
    for await (const chunk of readStream(iterable)) {
      yield* streamChunk(chunk, chunkSize);
    }
  };
  var readStream = async function* (stream) {
    if (stream[Symbol.asyncIterator]) {
      yield* stream;
      return;
    }
    const reader = stream.getReader();
    try {
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        yield value;
      }
    } finally {
      await reader.cancel();
    }
  };
  var trackStream = (stream, chunkSize, onProgress, onFinish) => {
    const iterator2 = readBytes(stream, chunkSize);
    let bytes = 0;
    let done;
    let _onFinish = (e) => {
      if (!done) {
        done = true;
        onFinish && onFinish(e);
      }
    };
    return new ReadableStream({
      async pull(controller) {
        try {
          const { done: done2, value } = await iterator2.next();
          if (done2) {
            _onFinish();
            controller.close();
            return;
          }
          let len = value.byteLength;
          if (onProgress) {
            let loadedBytes = bytes += len;
            onProgress(loadedBytes);
          }
          controller.enqueue(new Uint8Array(value));
        } catch (err) {
          _onFinish(err);
          throw err;
        }
      },
      cancel(reason) {
        _onFinish(reason);
        return iterator2.return();
      }
    }, {
      highWaterMark: 2
    });
  };

  // node_modules/axios/lib/adapters/fetch.js
  var DEFAULT_CHUNK_SIZE = 64 * 1024;
  var { isFunction: isFunction2 } = utils_default;
  var globalFetchAPI = (({ Request, Response: Response2 }) => ({
    Request,
    Response: Response2
  }))(utils_default.global);
  var {
    ReadableStream: ReadableStream2,
    TextEncoder: TextEncoder2
  } = utils_default.global;
  var test = (fn, ...args) => {
    try {
      return !!fn(...args);
    } catch (e) {
      return false;
    }
  };
  var factory = (env) => {
    env = utils_default.merge.call({
      skipUndefined: true
    }, globalFetchAPI, env);
    const { fetch: envFetch, Request, Response: Response2 } = env;
    const isFetchSupported = envFetch ? isFunction2(envFetch) : typeof fetch === "function";
    const isRequestSupported = isFunction2(Request);
    const isResponseSupported = isFunction2(Response2);
    if (!isFetchSupported) {
      return false;
    }
    const isReadableStreamSupported = isFetchSupported && isFunction2(ReadableStream2);
    const encodeText = isFetchSupported && (typeof TextEncoder2 === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder2()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
    const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
      let duplexAccessed = false;
      const hasContentType = new Request(platform_default.origin, {
        body: new ReadableStream2(),
        method: "POST",
        get duplex() {
          duplexAccessed = true;
          return "half";
        }
      }).headers.has("Content-Type");
      return duplexAccessed && !hasContentType;
    });
    const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils_default.isReadableStream(new Response2("").body));
    const resolvers = {
      stream: supportsResponseStream && ((res) => res.body)
    };
    isFetchSupported && (() => {
      ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
        !resolvers[type] && (resolvers[type] = (res, config) => {
          let method = res && res[type];
          if (method) {
            return method.call(res);
          }
          throw new AxiosError_default(`Response type '${type}' is not supported`, AxiosError_default.ERR_NOT_SUPPORT, config);
        });
      });
    })();
    const getBodyLength = async (body) => {
      if (body == null) {
        return 0;
      }
      if (utils_default.isBlob(body)) {
        return body.size;
      }
      if (utils_default.isSpecCompliantForm(body)) {
        const _request = new Request(platform_default.origin, {
          method: "POST",
          body
        });
        return (await _request.arrayBuffer()).byteLength;
      }
      if (utils_default.isArrayBufferView(body) || utils_default.isArrayBuffer(body)) {
        return body.byteLength;
      }
      if (utils_default.isURLSearchParams(body)) {
        body = body + "";
      }
      if (utils_default.isString(body)) {
        return (await encodeText(body)).byteLength;
      }
    };
    const resolveBodyLength = async (headers, body) => {
      const length = utils_default.toFiniteNumber(headers.getContentLength());
      return length == null ? getBodyLength(body) : length;
    };
    return async (config) => {
      let {
        url,
        method,
        data,
        signal,
        cancelToken,
        timeout,
        onDownloadProgress,
        onUploadProgress,
        responseType,
        headers,
        withCredentials = "same-origin",
        fetchOptions
      } = resolveConfig_default(config);
      let _fetch = envFetch || fetch;
      responseType = responseType ? (responseType + "").toLowerCase() : "text";
      let composedSignal = composeSignals_default([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
      let request = null;
      const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
        composedSignal.unsubscribe();
      });
      let requestContentLength;
      try {
        if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
          let _request = new Request(url, {
            method: "POST",
            body: data,
            duplex: "half"
          });
          let contentTypeHeader;
          if (utils_default.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
            headers.setContentType(contentTypeHeader);
          }
          if (_request.body) {
            const [onProgress, flush] = progressEventDecorator(
              requestContentLength,
              progressEventReducer(asyncDecorator(onUploadProgress))
            );
            data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
          }
        }
        if (!utils_default.isString(withCredentials)) {
          withCredentials = withCredentials ? "include" : "omit";
        }
        const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
        const resolvedOptions = {
          ...fetchOptions,
          signal: composedSignal,
          method: method.toUpperCase(),
          headers: headers.normalize().toJSON(),
          body: data,
          duplex: "half",
          credentials: isCredentialsSupported ? withCredentials : void 0
        };
        request = isRequestSupported && new Request(url, resolvedOptions);
        let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
        const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
        if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
          const options = {};
          ["status", "statusText", "headers"].forEach((prop) => {
            options[prop] = response[prop];
          });
          const responseContentLength = utils_default.toFiniteNumber(response.headers.get("content-length"));
          const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
            responseContentLength,
            progressEventReducer(asyncDecorator(onDownloadProgress), true)
          ) || [];
          response = new Response2(
            trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
              flush && flush();
              unsubscribe && unsubscribe();
            }),
            options
          );
        }
        responseType = responseType || "text";
        let responseData = await resolvers[utils_default.findKey(resolvers, responseType) || "text"](response, config);
        !isStreamResponse && unsubscribe && unsubscribe();
        return await new Promise((resolve, reject) => {
          settle(resolve, reject, {
            data: responseData,
            headers: AxiosHeaders_default.from(response.headers),
            status: response.status,
            statusText: response.statusText,
            config,
            request
          });
        });
      } catch (err) {
        unsubscribe && unsubscribe();
        if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
          throw Object.assign(
            new AxiosError_default("Network Error", AxiosError_default.ERR_NETWORK, config, request),
            {
              cause: err.cause || err
            }
          );
        }
        throw AxiosError_default.from(err, err && err.code, config, request);
      }
    };
  };
  var seedCache = /* @__PURE__ */ new Map();
  var getFetch = (config) => {
    let env = config ? config.env : {};
    const { fetch: fetch2, Request, Response: Response2 } = env;
    const seeds = [
      Request,
      Response2,
      fetch2
    ];
    let len = seeds.length, i = len, seed, target, map = seedCache;
    while (i--) {
      seed = seeds[i];
      target = map.get(seed);
      target === void 0 && map.set(seed, target = i ? /* @__PURE__ */ new Map() : factory(env));
      map = target;
    }
    return target;
  };
  var adapter = getFetch();

  // node_modules/axios/lib/adapters/adapters.js
  var knownAdapters = {
    http: null_default,
    xhr: xhr_default,
    fetch: {
      get: getFetch
    }
  };
  utils_default.forEach(knownAdapters, (fn, value) => {
    if (fn) {
      try {
        Object.defineProperty(fn, "name", { value });
      } catch (e) {
      }
      Object.defineProperty(fn, "adapterName", { value });
    }
  });
  var renderReason = (reason) => `- ${reason}`;
  var isResolvedHandle = (adapter2) => utils_default.isFunction(adapter2) || adapter2 === null || adapter2 === false;
  var adapters_default = {
    getAdapter: (adapters, config) => {
      adapters = utils_default.isArray(adapters) ? adapters : [adapters];
      const { length } = adapters;
      let nameOrAdapter;
      let adapter2;
      const rejectedReasons = {};
      for (let i = 0; i < length; i++) {
        nameOrAdapter = adapters[i];
        let id;
        adapter2 = nameOrAdapter;
        if (!isResolvedHandle(nameOrAdapter)) {
          adapter2 = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
          if (adapter2 === void 0) {
            throw new AxiosError_default(`Unknown adapter '${id}'`);
          }
        }
        if (adapter2 && (utils_default.isFunction(adapter2) || (adapter2 = adapter2.get(config)))) {
          break;
        }
        rejectedReasons[id || "#" + i] = adapter2;
      }
      if (!adapter2) {
        const reasons = Object.entries(rejectedReasons).map(
          ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
        );
        let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
        throw new AxiosError_default(
          `There is no suitable adapter to dispatch the request ` + s,
          "ERR_NOT_SUPPORT"
        );
      }
      return adapter2;
    },
    adapters: knownAdapters
  };

  // node_modules/axios/lib/core/dispatchRequest.js
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }
    if (config.signal && config.signal.aborted) {
      throw new CanceledError_default(null, config);
    }
  }
  function dispatchRequest(config) {
    throwIfCancellationRequested(config);
    config.headers = AxiosHeaders_default.from(config.headers);
    config.data = transformData.call(
      config,
      config.transformRequest
    );
    if (["post", "put", "patch"].indexOf(config.method) !== -1) {
      config.headers.setContentType("application/x-www-form-urlencoded", false);
    }
    const adapter2 = adapters_default.getAdapter(config.adapter || defaults_default.adapter, config);
    return adapter2(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);
      response.data = transformData.call(
        config,
        config.transformResponse,
        response
      );
      response.headers = AxiosHeaders_default.from(response.headers);
      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);
        if (reason && reason.response) {
          reason.response.data = transformData.call(
            config,
            config.transformResponse,
            reason.response
          );
          reason.response.headers = AxiosHeaders_default.from(reason.response.headers);
        }
      }
      return Promise.reject(reason);
    });
  }

  // node_modules/axios/lib/env/data.js
  var VERSION = "1.12.2";

  // node_modules/axios/lib/helpers/validator.js
  var validators = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
    validators[type] = function validator(thing) {
      return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
    };
  });
  var deprecatedWarnings = {};
  validators.transitional = function transitional(validator, version, message) {
    function formatMessage(opt, desc) {
      return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
    }
    return (value, opt, opts) => {
      if (validator === false) {
        throw new AxiosError_default(
          formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
          AxiosError_default.ERR_DEPRECATED
        );
      }
      if (version && !deprecatedWarnings[opt]) {
        deprecatedWarnings[opt] = true;
        console.warn(
          formatMessage(
            opt,
            " has been deprecated since v" + version + " and will be removed in the near future"
          )
        );
      }
      return validator ? validator(value, opt, opts) : true;
    };
  };
  validators.spelling = function spelling(correctSpelling) {
    return (value, opt) => {
      console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
      return true;
    };
  };
  function assertOptions(options, schema, allowUnknown) {
    if (typeof options !== "object") {
      throw new AxiosError_default("options must be an object", AxiosError_default.ERR_BAD_OPTION_VALUE);
    }
    const keys = Object.keys(options);
    let i = keys.length;
    while (i-- > 0) {
      const opt = keys[i];
      const validator = schema[opt];
      if (validator) {
        const value = options[opt];
        const result = value === void 0 || validator(value, opt, options);
        if (result !== true) {
          throw new AxiosError_default("option " + opt + " must be " + result, AxiosError_default.ERR_BAD_OPTION_VALUE);
        }
        continue;
      }
      if (allowUnknown !== true) {
        throw new AxiosError_default("Unknown option " + opt, AxiosError_default.ERR_BAD_OPTION);
      }
    }
  }
  var validator_default = {
    assertOptions,
    validators
  };

  // node_modules/axios/lib/core/Axios.js
  var validators2 = validator_default.validators;
  var Axios = class {
    constructor(instanceConfig) {
      this.defaults = instanceConfig || {};
      this.interceptors = {
        request: new InterceptorManager_default(),
        response: new InterceptorManager_default()
      };
    }
    /**
     * Dispatch a request
     *
     * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
     * @param {?Object} config
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    async request(configOrUrl, config) {
      try {
        return await this._request(configOrUrl, config);
      } catch (err) {
        if (err instanceof Error) {
          let dummy = {};
          Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
          const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
          try {
            if (!err.stack) {
              err.stack = stack;
            } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
              err.stack += "\n" + stack;
            }
          } catch (e) {
          }
        }
        throw err;
      }
    }
    _request(configOrUrl, config) {
      if (typeof configOrUrl === "string") {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }
      config = mergeConfig(this.defaults, config);
      const { transitional: transitional2, paramsSerializer, headers } = config;
      if (transitional2 !== void 0) {
        validator_default.assertOptions(transitional2, {
          silentJSONParsing: validators2.transitional(validators2.boolean),
          forcedJSONParsing: validators2.transitional(validators2.boolean),
          clarifyTimeoutError: validators2.transitional(validators2.boolean)
        }, false);
      }
      if (paramsSerializer != null) {
        if (utils_default.isFunction(paramsSerializer)) {
          config.paramsSerializer = {
            serialize: paramsSerializer
          };
        } else {
          validator_default.assertOptions(paramsSerializer, {
            encode: validators2.function,
            serialize: validators2.function
          }, true);
        }
      }
      if (config.allowAbsoluteUrls !== void 0) {
      } else if (this.defaults.allowAbsoluteUrls !== void 0) {
        config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
      } else {
        config.allowAbsoluteUrls = true;
      }
      validator_default.assertOptions(config, {
        baseUrl: validators2.spelling("baseURL"),
        withXsrfToken: validators2.spelling("withXSRFToken")
      }, true);
      config.method = (config.method || this.defaults.method || "get").toLowerCase();
      let contextHeaders = headers && utils_default.merge(
        headers.common,
        headers[config.method]
      );
      headers && utils_default.forEach(
        ["delete", "get", "head", "post", "put", "patch", "common"],
        (method) => {
          delete headers[method];
        }
      );
      config.headers = AxiosHeaders_default.concat(contextHeaders, headers);
      const requestInterceptorChain = [];
      let synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
          return;
        }
        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });
      const responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });
      let promise;
      let i = 0;
      let len;
      if (!synchronousRequestInterceptors) {
        const chain = [dispatchRequest.bind(this), void 0];
        chain.unshift(...requestInterceptorChain);
        chain.push(...responseInterceptorChain);
        len = chain.length;
        promise = Promise.resolve(config);
        while (i < len) {
          promise = promise.then(chain[i++], chain[i++]);
        }
        return promise;
      }
      len = requestInterceptorChain.length;
      let newConfig = config;
      while (i < len) {
        const onFulfilled = requestInterceptorChain[i++];
        const onRejected = requestInterceptorChain[i++];
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected.call(this, error);
          break;
        }
      }
      try {
        promise = dispatchRequest.call(this, newConfig);
      } catch (error) {
        return Promise.reject(error);
      }
      i = 0;
      len = responseInterceptorChain.length;
      while (i < len) {
        promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
      }
      return promise;
    }
    getUri(config) {
      config = mergeConfig(this.defaults, config);
      const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
      return buildURL(fullPath, config.params, config.paramsSerializer);
    }
  };
  utils_default.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
    Axios.prototype[method] = function(url, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        url,
        data: (config || {}).data
      }));
    };
  });
  utils_default.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
    function generateHTTPMethod(isForm) {
      return function httpMethod(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          headers: isForm ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url,
          data
        }));
      };
    }
    Axios.prototype[method] = generateHTTPMethod();
    Axios.prototype[method + "Form"] = generateHTTPMethod(true);
  });
  var Axios_default = Axios;

  // node_modules/axios/lib/cancel/CancelToken.js
  var CancelToken = class _CancelToken {
    constructor(executor) {
      if (typeof executor !== "function") {
        throw new TypeError("executor must be a function.");
      }
      let resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });
      const token = this;
      this.promise.then((cancel) => {
        if (!token._listeners)
          return;
        let i = token._listeners.length;
        while (i-- > 0) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });
      this.promise.then = (onfulfilled) => {
        let _resolve;
        const promise = new Promise((resolve) => {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);
        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };
        return promise;
      };
      executor(function cancel(message, config, request) {
        if (token.reason) {
          return;
        }
        token.reason = new CanceledError_default(message, config, request);
        resolvePromise(token.reason);
      });
    }
    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    }
    /**
     * Subscribe to the cancel signal
     */
    subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }
      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    }
    /**
     * Unsubscribe from the cancel signal
     */
    unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      const index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    }
    toAbortSignal() {
      const controller = new AbortController();
      const abort = (err) => {
        controller.abort(err);
      };
      this.subscribe(abort);
      controller.signal.unsubscribe = () => this.unsubscribe(abort);
      return controller.signal;
    }
    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    static source() {
      let cancel;
      const token = new _CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token,
        cancel
      };
    }
  };
  var CancelToken_default = CancelToken;

  // node_modules/axios/lib/helpers/spread.js
  function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  }

  // node_modules/axios/lib/helpers/isAxiosError.js
  function isAxiosError(payload) {
    return utils_default.isObject(payload) && payload.isAxiosError === true;
  }

  // node_modules/axios/lib/helpers/HttpStatusCode.js
  var HttpStatusCode = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511
  };
  Object.entries(HttpStatusCode).forEach(([key, value]) => {
    HttpStatusCode[value] = key;
  });
  var HttpStatusCode_default = HttpStatusCode;

  // node_modules/axios/lib/axios.js
  function createInstance(defaultConfig) {
    const context = new Axios_default(defaultConfig);
    const instance = bind(Axios_default.prototype.request, context);
    utils_default.extend(instance, Axios_default.prototype, context, { allOwnKeys: true });
    utils_default.extend(instance, context, null, { allOwnKeys: true });
    instance.create = function create(instanceConfig) {
      return createInstance(mergeConfig(defaultConfig, instanceConfig));
    };
    return instance;
  }
  var axios = createInstance(defaults_default);
  axios.Axios = Axios_default;
  axios.CanceledError = CanceledError_default;
  axios.CancelToken = CancelToken_default;
  axios.isCancel = isCancel;
  axios.VERSION = VERSION;
  axios.toFormData = toFormData_default;
  axios.AxiosError = AxiosError_default;
  axios.Cancel = axios.CanceledError;
  axios.all = function all(promises) {
    return Promise.all(promises);
  };
  axios.spread = spread;
  axios.isAxiosError = isAxiosError;
  axios.mergeConfig = mergeConfig;
  axios.AxiosHeaders = AxiosHeaders_default;
  axios.formToJSON = (thing) => formDataToJSON_default(utils_default.isHTMLForm(thing) ? new FormData(thing) : thing);
  axios.getAdapter = adapters_default.getAdapter;
  axios.HttpStatusCode = HttpStatusCode_default;
  axios.default = axios;
  var axios_default = axios;

  // node_modules/axios/index.js
  var {
    Axios: Axios2,
    AxiosError: AxiosError2,
    CanceledError: CanceledError2,
    isCancel: isCancel2,
    CancelToken: CancelToken2,
    VERSION: VERSION2,
    all: all2,
    Cancel,
    isAxiosError: isAxiosError2,
    spread: spread2,
    toFormData: toFormData2,
    AxiosHeaders: AxiosHeaders2,
    HttpStatusCode: HttpStatusCode2,
    formToJSON,
    getAdapter,
    mergeConfig: mergeConfig2
  } = axios_default;

  // node_modules/uncrypto/dist/crypto.web.mjs
  var webCrypto = globalThis.crypto;
  var subtle = webCrypto.subtle;

  // node_modules/@upstash/redis/chunk-TAJI6TAE.mjs
  var __defProp2 = Object.defineProperty;
  var __export2 = (target, all3) => {
    for (var name in all3)
      __defProp2(target, name, { get: all3[name], enumerable: true });
  };
  var error_exports = {};
  __export2(error_exports, {
    UpstashError: () => UpstashError,
    UpstashJSONParseError: () => UpstashJSONParseError,
    UrlError: () => UrlError
  });
  var UpstashError = class extends Error {
    constructor(message, options) {
      super(message, options);
      this.name = "UpstashError";
    }
  };
  var UrlError = class extends Error {
    constructor(url) {
      super(
        `Upstash Redis client was passed an invalid URL. You should pass a URL starting with https. Received: "${url}". `
      );
      this.name = "UrlError";
    }
  };
  var UpstashJSONParseError = class extends UpstashError {
    constructor(body, options) {
      const truncatedBody = body.length > 200 ? body.slice(0, 200) + "..." : body;
      super(`Unable to parse response body: ${truncatedBody}`, options);
      this.name = "UpstashJSONParseError";
    }
  };
  function parseRecursive(obj) {
    const parsed = Array.isArray(obj) ? obj.map((o) => {
      try {
        return parseRecursive(o);
      } catch {
        return o;
      }
    }) : JSON.parse(obj);
    if (typeof parsed === "number" && parsed.toString() !== obj) {
      return obj;
    }
    return parsed;
  }
  function parseResponse(result) {
    try {
      return parseRecursive(result);
    } catch {
      return result;
    }
  }
  function deserializeScanResponse(result) {
    return [result[0], ...parseResponse(result.slice(1))];
  }
  function deserializeScanWithTypesResponse(result) {
    const [cursor, keys] = result;
    const parsedKeys = [];
    for (let i = 0; i < keys.length; i += 2) {
      parsedKeys.push({ key: keys[i], type: keys[i + 1] });
    }
    return [cursor, parsedKeys];
  }
  function mergeHeaders(...headers) {
    const merged = {};
    for (const header of headers) {
      if (!header)
        continue;
      for (const [key, value] of Object.entries(header)) {
        if (value !== void 0 && value !== null) {
          merged[key] = value;
        }
      }
    }
    return merged;
  }
  var HttpClient = class {
    baseUrl;
    headers;
    options;
    readYourWrites;
    upstashSyncToken = "";
    hasCredentials;
    retry;
    constructor(config) {
      this.options = {
        backend: config.options?.backend,
        agent: config.agent,
        responseEncoding: config.responseEncoding ?? "base64",
        // default to base64
        cache: config.cache,
        signal: config.signal,
        keepAlive: config.keepAlive ?? true
      };
      this.upstashSyncToken = "";
      this.readYourWrites = config.readYourWrites ?? true;
      this.baseUrl = (config.baseUrl || "").replace(/\/$/, "");
      const urlRegex = /^https?:\/\/[^\s#$./?].\S*$/;
      if (this.baseUrl && !urlRegex.test(this.baseUrl)) {
        throw new UrlError(this.baseUrl);
      }
      this.headers = {
        "Content-Type": "application/json",
        ...config.headers
      };
      this.hasCredentials = Boolean(this.baseUrl && this.headers.authorization.split(" ")[1]);
      if (this.options.responseEncoding === "base64") {
        this.headers["Upstash-Encoding"] = "base64";
      }
      this.retry = typeof config.retry === "boolean" && !config.retry ? {
        attempts: 1,
        backoff: () => 0
      } : {
        attempts: config.retry?.retries ?? 5,
        backoff: config.retry?.backoff ?? ((retryCount) => Math.exp(retryCount) * 50)
      };
    }
    mergeTelemetry(telemetry) {
      this.headers = merge2(this.headers, "Upstash-Telemetry-Runtime", telemetry.runtime);
      this.headers = merge2(this.headers, "Upstash-Telemetry-Platform", telemetry.platform);
      this.headers = merge2(this.headers, "Upstash-Telemetry-Sdk", telemetry.sdk);
    }
    async request(req) {
      const requestHeaders = mergeHeaders(this.headers, req.headers ?? {});
      const requestUrl = [this.baseUrl, ...req.path ?? []].join("/");
      const isEventStream = requestHeaders.Accept === "text/event-stream";
      const signal = req.signal ?? this.options.signal;
      const isSignalFunction = typeof signal === "function";
      const requestOptions = {
        //@ts-expect-error this should throw due to bun regression
        cache: this.options.cache,
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(req.body),
        keepalive: this.options.keepAlive,
        agent: this.options.agent,
        signal: isSignalFunction ? signal() : signal,
        /**
         * Fastly specific
         */
        backend: this.options.backend
      };
      if (!this.hasCredentials) {
        console.warn(
          "[Upstash Redis] Redis client was initialized without url or token. Failed to execute command."
        );
      }
      if (this.readYourWrites) {
        const newHeader = this.upstashSyncToken;
        this.headers["upstash-sync-token"] = newHeader;
      }
      let res = null;
      let error = null;
      for (let i = 0; i <= this.retry.attempts; i++) {
        try {
          res = await fetch(requestUrl, requestOptions);
          break;
        } catch (error_) {
          if (requestOptions.signal?.aborted && isSignalFunction) {
            throw error_;
          } else if (requestOptions.signal?.aborted) {
            const myBlob = new Blob([
              JSON.stringify({ result: requestOptions.signal.reason ?? "Aborted" })
            ]);
            const myOptions = {
              status: 200,
              statusText: requestOptions.signal.reason ?? "Aborted"
            };
            res = new Response(myBlob, myOptions);
            break;
          }
          error = error_;
          if (i < this.retry.attempts) {
            await new Promise((r) => setTimeout(r, this.retry.backoff(i)));
          }
        }
      }
      if (!res) {
        throw error ?? new Error("Exhausted all retries");
      }
      if (!res.ok) {
        let body2;
        const rawBody2 = await res.text();
        try {
          body2 = JSON.parse(rawBody2);
        } catch (error2) {
          throw new UpstashJSONParseError(rawBody2, { cause: error2 });
        }
        throw new UpstashError(`${body2.error}, command was: ${JSON.stringify(req.body)}`);
      }
      if (this.readYourWrites) {
        const headers = res.headers;
        this.upstashSyncToken = headers.get("upstash-sync-token") ?? "";
      }
      if (isEventStream && req && req.onMessage && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        (async () => {
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done)
                break;
              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");
              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  req.onMessage?.(data);
                }
              }
            }
          } catch (error2) {
            if (error2 instanceof Error && error2.name === "AbortError") {
            } else {
              console.error("Stream reading error:", error2);
            }
          } finally {
            try {
              await reader.cancel();
            } catch {
            }
          }
        })();
        return { result: 1 };
      }
      let body;
      const rawBody = await res.text();
      try {
        body = JSON.parse(rawBody);
      } catch (error2) {
        throw new UpstashJSONParseError(rawBody, { cause: error2 });
      }
      if (this.readYourWrites) {
        const headers = res.headers;
        this.upstashSyncToken = headers.get("upstash-sync-token") ?? "";
      }
      if (this.options.responseEncoding === "base64") {
        if (Array.isArray(body)) {
          return body.map(({ result: result2, error: error2 }) => ({
            result: decode(result2),
            error: error2
          }));
        }
        const result = decode(body.result);
        return { result, error: body.error };
      }
      return body;
    }
  };
  function base64decode(b64) {
    let dec = "";
    try {
      const binString = atob(b64);
      const size = binString.length;
      const bytes = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        bytes[i] = binString.charCodeAt(i);
      }
      dec = new TextDecoder().decode(bytes);
    } catch {
      dec = b64;
    }
    return dec;
  }
  function decode(raw) {
    let result = void 0;
    switch (typeof raw) {
      case "undefined": {
        return raw;
      }
      case "number": {
        result = raw;
        break;
      }
      case "object": {
        if (Array.isArray(raw)) {
          result = raw.map(
            (v) => typeof v === "string" ? base64decode(v) : Array.isArray(v) ? v.map((element) => decode(element)) : v
          );
        } else {
          result = null;
        }
        break;
      }
      case "string": {
        result = raw === "OK" ? "OK" : base64decode(raw);
        break;
      }
      default: {
        break;
      }
    }
    return result;
  }
  function merge2(obj, key, value) {
    if (!value) {
      return obj;
    }
    obj[key] = obj[key] ? [obj[key], value].join(",") : value;
    return obj;
  }
  var defaultSerializer = (c) => {
    switch (typeof c) {
      case "string":
      case "number":
      case "boolean": {
        return c;
      }
      default: {
        return JSON.stringify(c);
      }
    }
  };
  var Command = class {
    command;
    serialize;
    deserialize;
    headers;
    path;
    onMessage;
    isStreaming;
    signal;
    /**
     * Create a new command instance.
     *
     * You can define a custom `deserialize` function. By default we try to deserialize as json.
     */
    constructor(command, opts) {
      this.serialize = defaultSerializer;
      this.deserialize = opts?.automaticDeserialization === void 0 || opts.automaticDeserialization ? opts?.deserialize ?? parseResponse : (x) => x;
      this.command = command.map((c) => this.serialize(c));
      this.headers = opts?.headers;
      this.path = opts?.path;
      this.onMessage = opts?.streamOptions?.onMessage;
      this.isStreaming = opts?.streamOptions?.isStreaming ?? false;
      this.signal = opts?.streamOptions?.signal;
      if (opts?.latencyLogging) {
        const originalExec = this.exec.bind(this);
        this.exec = async (client) => {
          const start = performance.now();
          const result = await originalExec(client);
          const end = performance.now();
          const loggerResult = (end - start).toFixed(2);
          console.log(
            `Latency for \x1B[38;2;19;185;39m${this.command[0].toString().toUpperCase()}\x1B[0m: \x1B[38;2;0;255;255m${loggerResult} ms\x1B[0m`
          );
          return result;
        };
      }
    }
    /**
     * Execute the command using a client.
     */
    async exec(client) {
      const { result, error } = await client.request({
        body: this.command,
        path: this.path,
        upstashSyncToken: client.upstashSyncToken,
        headers: this.headers,
        onMessage: this.onMessage,
        isStreaming: this.isStreaming,
        signal: this.signal
      });
      if (error) {
        throw new UpstashError(error);
      }
      if (result === void 0) {
        throw new TypeError("Request did not return a result");
      }
      return this.deserialize(result);
    }
  };
  function deserialize(result) {
    if (result.length === 0) {
      return null;
    }
    const obj = {};
    for (let i = 0; i < result.length; i += 2) {
      const key = result[i];
      const value = result[i + 1];
      try {
        obj[key] = JSON.parse(value);
      } catch {
        obj[key] = value;
      }
    }
    return obj;
  }
  var HRandFieldCommand = class extends Command {
    constructor(cmd, opts) {
      const command = ["hrandfield", cmd[0]];
      if (typeof cmd[1] === "number") {
        command.push(cmd[1]);
      }
      if (cmd[2]) {
        command.push("WITHVALUES");
      }
      super(command, {
        // @ts-expect-error to silence compiler
        deserialize: cmd[2] ? (result) => deserialize(result) : opts?.deserialize,
        ...opts
      });
    }
  };
  var AppendCommand = class extends Command {
    constructor(cmd, opts) {
      super(["append", ...cmd], opts);
    }
  };
  var BitCountCommand = class extends Command {
    constructor([key, start, end], opts) {
      const command = ["bitcount", key];
      if (typeof start === "number") {
        command.push(start);
      }
      if (typeof end === "number") {
        command.push(end);
      }
      super(command, opts);
    }
  };
  var BitFieldCommand = class {
    constructor(args, client, opts, execOperation = (command) => command.exec(this.client)) {
      this.client = client;
      this.opts = opts;
      this.execOperation = execOperation;
      this.command = ["bitfield", ...args];
    }
    command;
    chain(...args) {
      this.command.push(...args);
      return this;
    }
    get(...args) {
      return this.chain("get", ...args);
    }
    set(...args) {
      return this.chain("set", ...args);
    }
    incrby(...args) {
      return this.chain("incrby", ...args);
    }
    overflow(overflow) {
      return this.chain("overflow", overflow);
    }
    exec() {
      const command = new Command(this.command, this.opts);
      return this.execOperation(command);
    }
  };
  var BitOpCommand = class extends Command {
    constructor(cmd, opts) {
      super(["bitop", ...cmd], opts);
    }
  };
  var BitPosCommand = class extends Command {
    constructor(cmd, opts) {
      super(["bitpos", ...cmd], opts);
    }
  };
  var CopyCommand = class extends Command {
    constructor([key, destinationKey, opts], commandOptions) {
      super(["COPY", key, destinationKey, ...opts?.replace ? ["REPLACE"] : []], {
        ...commandOptions,
        deserialize(result) {
          if (result > 0) {
            return "COPIED";
          }
          return "NOT_COPIED";
        }
      });
    }
  };
  var DBSizeCommand = class extends Command {
    constructor(opts) {
      super(["dbsize"], opts);
    }
  };
  var DecrCommand = class extends Command {
    constructor(cmd, opts) {
      super(["decr", ...cmd], opts);
    }
  };
  var DecrByCommand = class extends Command {
    constructor(cmd, opts) {
      super(["decrby", ...cmd], opts);
    }
  };
  var DelCommand = class extends Command {
    constructor(cmd, opts) {
      super(["del", ...cmd], opts);
    }
  };
  var EchoCommand = class extends Command {
    constructor(cmd, opts) {
      super(["echo", ...cmd], opts);
    }
  };
  var EvalROCommand = class extends Command {
    constructor([script, keys, args], opts) {
      super(["eval_ro", script, keys.length, ...keys, ...args ?? []], opts);
    }
  };
  var EvalCommand = class extends Command {
    constructor([script, keys, args], opts) {
      super(["eval", script, keys.length, ...keys, ...args ?? []], opts);
    }
  };
  var EvalshaROCommand = class extends Command {
    constructor([sha, keys, args], opts) {
      super(["evalsha_ro", sha, keys.length, ...keys, ...args ?? []], opts);
    }
  };
  var EvalshaCommand = class extends Command {
    constructor([sha, keys, args], opts) {
      super(["evalsha", sha, keys.length, ...keys, ...args ?? []], opts);
    }
  };
  var ExecCommand = class extends Command {
    constructor(cmd, opts) {
      const normalizedCmd = cmd.map((arg) => typeof arg === "string" ? arg : String(arg));
      super(normalizedCmd, opts);
    }
  };
  var ExistsCommand = class extends Command {
    constructor(cmd, opts) {
      super(["exists", ...cmd], opts);
    }
  };
  var ExpireCommand = class extends Command {
    constructor(cmd, opts) {
      super(["expire", ...cmd.filter(Boolean)], opts);
    }
  };
  var ExpireAtCommand = class extends Command {
    constructor(cmd, opts) {
      super(["expireat", ...cmd], opts);
    }
  };
  var FlushAllCommand = class extends Command {
    constructor(args, opts) {
      const command = ["flushall"];
      if (args && args.length > 0 && args[0].async) {
        command.push("async");
      }
      super(command, opts);
    }
  };
  var FlushDBCommand = class extends Command {
    constructor([opts], cmdOpts) {
      const command = ["flushdb"];
      if (opts?.async) {
        command.push("async");
      }
      super(command, cmdOpts);
    }
  };
  var GeoAddCommand = class extends Command {
    constructor([key, arg1, ...arg2], opts) {
      const command = ["geoadd", key];
      if ("nx" in arg1 && arg1.nx) {
        command.push("nx");
      } else if ("xx" in arg1 && arg1.xx) {
        command.push("xx");
      }
      if ("ch" in arg1 && arg1.ch) {
        command.push("ch");
      }
      if ("latitude" in arg1 && arg1.latitude) {
        command.push(arg1.longitude, arg1.latitude, arg1.member);
      }
      command.push(
        ...arg2.flatMap(({ latitude, longitude, member }) => [longitude, latitude, member])
      );
      super(command, opts);
    }
  };
  var GeoDistCommand = class extends Command {
    constructor([key, member1, member2, unit = "M"], opts) {
      super(["GEODIST", key, member1, member2, unit], opts);
    }
  };
  var GeoHashCommand = class extends Command {
    constructor(cmd, opts) {
      const [key] = cmd;
      const members = Array.isArray(cmd[1]) ? cmd[1] : cmd.slice(1);
      super(["GEOHASH", key, ...members], opts);
    }
  };
  var GeoPosCommand = class extends Command {
    constructor(cmd, opts) {
      const [key] = cmd;
      const members = Array.isArray(cmd[1]) ? cmd[1] : cmd.slice(1);
      super(["GEOPOS", key, ...members], {
        deserialize: (result) => transform(result),
        ...opts
      });
    }
  };
  function transform(result) {
    const final = [];
    for (const pos of result) {
      if (!pos?.[0] || !pos?.[1]) {
        continue;
      }
      final.push({ lng: Number.parseFloat(pos[0]), lat: Number.parseFloat(pos[1]) });
    }
    return final;
  }
  var GeoSearchCommand = class extends Command {
    constructor([key, centerPoint, shape, order, opts], commandOptions) {
      const command = ["GEOSEARCH", key];
      if (centerPoint.type === "FROMMEMBER" || centerPoint.type === "frommember") {
        command.push(centerPoint.type, centerPoint.member);
      }
      if (centerPoint.type === "FROMLONLAT" || centerPoint.type === "fromlonlat") {
        command.push(centerPoint.type, centerPoint.coordinate.lon, centerPoint.coordinate.lat);
      }
      if (shape.type === "BYRADIUS" || shape.type === "byradius") {
        command.push(shape.type, shape.radius, shape.radiusType);
      }
      if (shape.type === "BYBOX" || shape.type === "bybox") {
        command.push(shape.type, shape.rect.width, shape.rect.height, shape.rectType);
      }
      command.push(order);
      if (opts?.count) {
        command.push("COUNT", opts.count.limit, ...opts.count.any ? ["ANY"] : []);
      }
      const transform2 = (result) => {
        if (!opts?.withCoord && !opts?.withDist && !opts?.withHash) {
          return result.map((member) => {
            try {
              return { member: JSON.parse(member) };
            } catch {
              return { member };
            }
          });
        }
        return result.map((members) => {
          let counter = 1;
          const obj = {};
          try {
            obj.member = JSON.parse(members[0]);
          } catch {
            obj.member = members[0];
          }
          if (opts.withDist) {
            obj.dist = Number.parseFloat(members[counter++]);
          }
          if (opts.withHash) {
            obj.hash = members[counter++].toString();
          }
          if (opts.withCoord) {
            obj.coord = {
              long: Number.parseFloat(members[counter][0]),
              lat: Number.parseFloat(members[counter][1])
            };
          }
          return obj;
        });
      };
      super(
        [
          ...command,
          ...opts?.withCoord ? ["WITHCOORD"] : [],
          ...opts?.withDist ? ["WITHDIST"] : [],
          ...opts?.withHash ? ["WITHHASH"] : []
        ],
        {
          deserialize: transform2,
          ...commandOptions
        }
      );
    }
  };
  var GeoSearchStoreCommand = class extends Command {
    constructor([destination, key, centerPoint, shape, order, opts], commandOptions) {
      const command = ["GEOSEARCHSTORE", destination, key];
      if (centerPoint.type === "FROMMEMBER" || centerPoint.type === "frommember") {
        command.push(centerPoint.type, centerPoint.member);
      }
      if (centerPoint.type === "FROMLONLAT" || centerPoint.type === "fromlonlat") {
        command.push(centerPoint.type, centerPoint.coordinate.lon, centerPoint.coordinate.lat);
      }
      if (shape.type === "BYRADIUS" || shape.type === "byradius") {
        command.push(shape.type, shape.radius, shape.radiusType);
      }
      if (shape.type === "BYBOX" || shape.type === "bybox") {
        command.push(shape.type, shape.rect.width, shape.rect.height, shape.rectType);
      }
      command.push(order);
      if (opts?.count) {
        command.push("COUNT", opts.count.limit, ...opts.count.any ? ["ANY"] : []);
      }
      super([...command, ...opts?.storeDist ? ["STOREDIST"] : []], commandOptions);
    }
  };
  var GetCommand = class extends Command {
    constructor(cmd, opts) {
      super(["get", ...cmd], opts);
    }
  };
  var GetBitCommand = class extends Command {
    constructor(cmd, opts) {
      super(["getbit", ...cmd], opts);
    }
  };
  var GetDelCommand = class extends Command {
    constructor(cmd, opts) {
      super(["getdel", ...cmd], opts);
    }
  };
  var GetExCommand = class extends Command {
    constructor([key, opts], cmdOpts) {
      const command = ["getex", key];
      if (opts) {
        if ("ex" in opts && typeof opts.ex === "number") {
          command.push("ex", opts.ex);
        } else if ("px" in opts && typeof opts.px === "number") {
          command.push("px", opts.px);
        } else if ("exat" in opts && typeof opts.exat === "number") {
          command.push("exat", opts.exat);
        } else if ("pxat" in opts && typeof opts.pxat === "number") {
          command.push("pxat", opts.pxat);
        } else if ("persist" in opts && opts.persist) {
          command.push("persist");
        }
      }
      super(command, cmdOpts);
    }
  };
  var GetRangeCommand = class extends Command {
    constructor(cmd, opts) {
      super(["getrange", ...cmd], opts);
    }
  };
  var GetSetCommand = class extends Command {
    constructor(cmd, opts) {
      super(["getset", ...cmd], opts);
    }
  };
  var HDelCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hdel", ...cmd], opts);
    }
  };
  var HExistsCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hexists", ...cmd], opts);
    }
  };
  var HExpireCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields, seconds, option] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(
        [
          "hexpire",
          key,
          seconds,
          ...option ? [option] : [],
          "FIELDS",
          fieldArray.length,
          ...fieldArray
        ],
        opts
      );
    }
  };
  var HExpireAtCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields, timestamp, option] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(
        [
          "hexpireat",
          key,
          timestamp,
          ...option ? [option] : [],
          "FIELDS",
          fieldArray.length,
          ...fieldArray
        ],
        opts
      );
    }
  };
  var HExpireTimeCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(["hexpiretime", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
    }
  };
  var HPersistCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(["hpersist", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
    }
  };
  var HPExpireCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields, milliseconds, option] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(
        [
          "hpexpire",
          key,
          milliseconds,
          ...option ? [option] : [],
          "FIELDS",
          fieldArray.length,
          ...fieldArray
        ],
        opts
      );
    }
  };
  var HPExpireAtCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields, timestamp, option] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(
        [
          "hpexpireat",
          key,
          timestamp,
          ...option ? [option] : [],
          "FIELDS",
          fieldArray.length,
          ...fieldArray
        ],
        opts
      );
    }
  };
  var HPExpireTimeCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(["hpexpiretime", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
    }
  };
  var HPTtlCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(["hpttl", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
    }
  };
  var HGetCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hget", ...cmd], opts);
    }
  };
  function deserialize2(result) {
    if (result.length === 0) {
      return null;
    }
    const obj = {};
    for (let i = 0; i < result.length; i += 2) {
      const key = result[i];
      const value = result[i + 1];
      try {
        const valueIsNumberAndNotSafeInteger = !Number.isNaN(Number(value)) && !Number.isSafeInteger(Number(value));
        obj[key] = valueIsNumberAndNotSafeInteger ? value : JSON.parse(value);
      } catch {
        obj[key] = value;
      }
    }
    return obj;
  }
  var HGetAllCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hgetall", ...cmd], {
        deserialize: (result) => deserialize2(result),
        ...opts
      });
    }
  };
  var HIncrByCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hincrby", ...cmd], opts);
    }
  };
  var HIncrByFloatCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hincrbyfloat", ...cmd], opts);
    }
  };
  var HKeysCommand = class extends Command {
    constructor([key], opts) {
      super(["hkeys", key], opts);
    }
  };
  var HLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hlen", ...cmd], opts);
    }
  };
  function deserialize3(fields, result) {
    if (result.every((field) => field === null)) {
      return null;
    }
    const obj = {};
    for (const [i, field] of fields.entries()) {
      try {
        obj[field] = JSON.parse(result[i]);
      } catch {
        obj[field] = result[i];
      }
    }
    return obj;
  }
  var HMGetCommand = class extends Command {
    constructor([key, ...fields], opts) {
      super(["hmget", key, ...fields], {
        deserialize: (result) => deserialize3(fields, result),
        ...opts
      });
    }
  };
  var HMSetCommand = class extends Command {
    constructor([key, kv2], opts) {
      super(["hmset", key, ...Object.entries(kv2).flatMap(([field, value]) => [field, value])], opts);
    }
  };
  var HScanCommand = class extends Command {
    constructor([key, cursor, cmdOpts], opts) {
      const command = ["hscan", key, cursor];
      if (cmdOpts?.match) {
        command.push("match", cmdOpts.match);
      }
      if (typeof cmdOpts?.count === "number") {
        command.push("count", cmdOpts.count);
      }
      super(command, {
        deserialize: deserializeScanResponse,
        ...opts
      });
    }
  };
  var HSetCommand = class extends Command {
    constructor([key, kv2], opts) {
      super(["hset", key, ...Object.entries(kv2).flatMap(([field, value]) => [field, value])], opts);
    }
  };
  var HSetNXCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hsetnx", ...cmd], opts);
    }
  };
  var HStrLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hstrlen", ...cmd], opts);
    }
  };
  var HTtlCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, fields] = cmd;
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      super(["httl", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
    }
  };
  var HValsCommand = class extends Command {
    constructor(cmd, opts) {
      super(["hvals", ...cmd], opts);
    }
  };
  var IncrCommand = class extends Command {
    constructor(cmd, opts) {
      super(["incr", ...cmd], opts);
    }
  };
  var IncrByCommand = class extends Command {
    constructor(cmd, opts) {
      super(["incrby", ...cmd], opts);
    }
  };
  var IncrByFloatCommand = class extends Command {
    constructor(cmd, opts) {
      super(["incrbyfloat", ...cmd], opts);
    }
  };
  var JsonArrAppendCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.ARRAPPEND", ...cmd], opts);
    }
  };
  var JsonArrIndexCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.ARRINDEX", ...cmd], opts);
    }
  };
  var JsonArrInsertCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.ARRINSERT", ...cmd], opts);
    }
  };
  var JsonArrLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.ARRLEN", cmd[0], cmd[1] ?? "$"], opts);
    }
  };
  var JsonArrPopCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.ARRPOP", ...cmd], opts);
    }
  };
  var JsonArrTrimCommand = class extends Command {
    constructor(cmd, opts) {
      const path = cmd[1] ?? "$";
      const start = cmd[2] ?? 0;
      const stop = cmd[3] ?? 0;
      super(["JSON.ARRTRIM", cmd[0], path, start, stop], opts);
    }
  };
  var JsonClearCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.CLEAR", ...cmd], opts);
    }
  };
  var JsonDelCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.DEL", ...cmd], opts);
    }
  };
  var JsonForgetCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.FORGET", ...cmd], opts);
    }
  };
  var JsonGetCommand = class extends Command {
    constructor(cmd, opts) {
      const command = ["JSON.GET"];
      if (typeof cmd[1] === "string") {
        command.push(...cmd);
      } else {
        command.push(cmd[0]);
        if (cmd[1]) {
          if (cmd[1].indent) {
            command.push("INDENT", cmd[1].indent);
          }
          if (cmd[1].newline) {
            command.push("NEWLINE", cmd[1].newline);
          }
          if (cmd[1].space) {
            command.push("SPACE", cmd[1].space);
          }
        }
        command.push(...cmd.slice(2));
      }
      super(command, opts);
    }
  };
  var JsonMergeCommand = class extends Command {
    constructor(cmd, opts) {
      const command = ["JSON.MERGE", ...cmd];
      super(command, opts);
    }
  };
  var JsonMGetCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.MGET", ...cmd[0], cmd[1]], opts);
    }
  };
  var JsonMSetCommand = class extends Command {
    constructor(cmd, opts) {
      const command = ["JSON.MSET"];
      for (const c of cmd) {
        command.push(c.key, c.path, c.value);
      }
      super(command, opts);
    }
  };
  var JsonNumIncrByCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.NUMINCRBY", ...cmd], opts);
    }
  };
  var JsonNumMultByCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.NUMMULTBY", ...cmd], opts);
    }
  };
  var JsonObjKeysCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.OBJKEYS", ...cmd], opts);
    }
  };
  var JsonObjLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.OBJLEN", ...cmd], opts);
    }
  };
  var JsonRespCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.RESP", ...cmd], opts);
    }
  };
  var JsonSetCommand = class extends Command {
    constructor(cmd, opts) {
      const command = ["JSON.SET", cmd[0], cmd[1], cmd[2]];
      if (cmd[3]) {
        if (cmd[3].nx) {
          command.push("NX");
        } else if (cmd[3].xx) {
          command.push("XX");
        }
      }
      super(command, opts);
    }
  };
  var JsonStrAppendCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.STRAPPEND", ...cmd], opts);
    }
  };
  var JsonStrLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.STRLEN", ...cmd], opts);
    }
  };
  var JsonToggleCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.TOGGLE", ...cmd], opts);
    }
  };
  var JsonTypeCommand = class extends Command {
    constructor(cmd, opts) {
      super(["JSON.TYPE", ...cmd], opts);
    }
  };
  var KeysCommand = class extends Command {
    constructor(cmd, opts) {
      super(["keys", ...cmd], opts);
    }
  };
  var LIndexCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lindex", ...cmd], opts);
    }
  };
  var LInsertCommand = class extends Command {
    constructor(cmd, opts) {
      super(["linsert", ...cmd], opts);
    }
  };
  var LLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["llen", ...cmd], opts);
    }
  };
  var LMoveCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lmove", ...cmd], opts);
    }
  };
  var LmPopCommand = class extends Command {
    constructor(cmd, opts) {
      const [numkeys, keys, direction, count] = cmd;
      super(["LMPOP", numkeys, ...keys, direction, ...count ? ["COUNT", count] : []], opts);
    }
  };
  var LPopCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lpop", ...cmd], opts);
    }
  };
  var LPosCommand = class extends Command {
    constructor(cmd, opts) {
      const args = ["lpos", cmd[0], cmd[1]];
      if (typeof cmd[2]?.rank === "number") {
        args.push("rank", cmd[2].rank);
      }
      if (typeof cmd[2]?.count === "number") {
        args.push("count", cmd[2].count);
      }
      if (typeof cmd[2]?.maxLen === "number") {
        args.push("maxLen", cmd[2].maxLen);
      }
      super(args, opts);
    }
  };
  var LPushCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lpush", ...cmd], opts);
    }
  };
  var LPushXCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lpushx", ...cmd], opts);
    }
  };
  var LRangeCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lrange", ...cmd], opts);
    }
  };
  var LRemCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lrem", ...cmd], opts);
    }
  };
  var LSetCommand = class extends Command {
    constructor(cmd, opts) {
      super(["lset", ...cmd], opts);
    }
  };
  var LTrimCommand = class extends Command {
    constructor(cmd, opts) {
      super(["ltrim", ...cmd], opts);
    }
  };
  var MGetCommand = class extends Command {
    constructor(cmd, opts) {
      const keys = Array.isArray(cmd[0]) ? cmd[0] : cmd;
      super(["mget", ...keys], opts);
    }
  };
  var MSetCommand = class extends Command {
    constructor([kv2], opts) {
      super(["mset", ...Object.entries(kv2).flatMap(([key, value]) => [key, value])], opts);
    }
  };
  var MSetNXCommand = class extends Command {
    constructor([kv2], opts) {
      super(["msetnx", ...Object.entries(kv2).flat()], opts);
    }
  };
  var PersistCommand = class extends Command {
    constructor(cmd, opts) {
      super(["persist", ...cmd], opts);
    }
  };
  var PExpireCommand = class extends Command {
    constructor(cmd, opts) {
      super(["pexpire", ...cmd], opts);
    }
  };
  var PExpireAtCommand = class extends Command {
    constructor(cmd, opts) {
      super(["pexpireat", ...cmd], opts);
    }
  };
  var PfAddCommand = class extends Command {
    constructor(cmd, opts) {
      super(["pfadd", ...cmd], opts);
    }
  };
  var PfCountCommand = class extends Command {
    constructor(cmd, opts) {
      super(["pfcount", ...cmd], opts);
    }
  };
  var PfMergeCommand = class extends Command {
    constructor(cmd, opts) {
      super(["pfmerge", ...cmd], opts);
    }
  };
  var PingCommand = class extends Command {
    constructor(cmd, opts) {
      const command = ["ping"];
      if (cmd?.[0] !== void 0) {
        command.push(cmd[0]);
      }
      super(command, opts);
    }
  };
  var PSetEXCommand = class extends Command {
    constructor(cmd, opts) {
      super(["psetex", ...cmd], opts);
    }
  };
  var PTtlCommand = class extends Command {
    constructor(cmd, opts) {
      super(["pttl", ...cmd], opts);
    }
  };
  var PublishCommand = class extends Command {
    constructor(cmd, opts) {
      super(["publish", ...cmd], opts);
    }
  };
  var RandomKeyCommand = class extends Command {
    constructor(opts) {
      super(["randomkey"], opts);
    }
  };
  var RenameCommand = class extends Command {
    constructor(cmd, opts) {
      super(["rename", ...cmd], opts);
    }
  };
  var RenameNXCommand = class extends Command {
    constructor(cmd, opts) {
      super(["renamenx", ...cmd], opts);
    }
  };
  var RPopCommand = class extends Command {
    constructor(cmd, opts) {
      super(["rpop", ...cmd], opts);
    }
  };
  var RPushCommand = class extends Command {
    constructor(cmd, opts) {
      super(["rpush", ...cmd], opts);
    }
  };
  var RPushXCommand = class extends Command {
    constructor(cmd, opts) {
      super(["rpushx", ...cmd], opts);
    }
  };
  var SAddCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sadd", ...cmd], opts);
    }
  };
  var ScanCommand = class extends Command {
    constructor([cursor, opts], cmdOpts) {
      const command = ["scan", cursor];
      if (opts?.match) {
        command.push("match", opts.match);
      }
      if (typeof opts?.count === "number") {
        command.push("count", opts.count);
      }
      if (opts && "withType" in opts && opts.withType === true) {
        command.push("withtype");
      } else if (opts && "type" in opts && opts.type && opts.type.length > 0) {
        command.push("type", opts.type);
      }
      super(command, {
        // @ts-expect-error ignore types here
        deserialize: opts?.withType ? deserializeScanWithTypesResponse : deserializeScanResponse,
        ...cmdOpts
      });
    }
  };
  var SCardCommand = class extends Command {
    constructor(cmd, opts) {
      super(["scard", ...cmd], opts);
    }
  };
  var ScriptExistsCommand = class extends Command {
    constructor(hashes, opts) {
      super(["script", "exists", ...hashes], {
        deserialize: (result) => result,
        ...opts
      });
    }
  };
  var ScriptFlushCommand = class extends Command {
    constructor([opts], cmdOpts) {
      const cmd = ["script", "flush"];
      if (opts?.sync) {
        cmd.push("sync");
      } else if (opts?.async) {
        cmd.push("async");
      }
      super(cmd, cmdOpts);
    }
  };
  var ScriptLoadCommand = class extends Command {
    constructor(args, opts) {
      super(["script", "load", ...args], opts);
    }
  };
  var SDiffCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sdiff", ...cmd], opts);
    }
  };
  var SDiffStoreCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sdiffstore", ...cmd], opts);
    }
  };
  var SetCommand = class extends Command {
    constructor([key, value, opts], cmdOpts) {
      const command = ["set", key, value];
      if (opts) {
        if ("nx" in opts && opts.nx) {
          command.push("nx");
        } else if ("xx" in opts && opts.xx) {
          command.push("xx");
        }
        if ("get" in opts && opts.get) {
          command.push("get");
        }
        if ("ex" in opts && typeof opts.ex === "number") {
          command.push("ex", opts.ex);
        } else if ("px" in opts && typeof opts.px === "number") {
          command.push("px", opts.px);
        } else if ("exat" in opts && typeof opts.exat === "number") {
          command.push("exat", opts.exat);
        } else if ("pxat" in opts && typeof opts.pxat === "number") {
          command.push("pxat", opts.pxat);
        } else if ("keepTtl" in opts && opts.keepTtl) {
          command.push("keepTtl");
        }
      }
      super(command, cmdOpts);
    }
  };
  var SetBitCommand = class extends Command {
    constructor(cmd, opts) {
      super(["setbit", ...cmd], opts);
    }
  };
  var SetExCommand = class extends Command {
    constructor(cmd, opts) {
      super(["setex", ...cmd], opts);
    }
  };
  var SetNxCommand = class extends Command {
    constructor(cmd, opts) {
      super(["setnx", ...cmd], opts);
    }
  };
  var SetRangeCommand = class extends Command {
    constructor(cmd, opts) {
      super(["setrange", ...cmd], opts);
    }
  };
  var SInterCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sinter", ...cmd], opts);
    }
  };
  var SInterStoreCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sinterstore", ...cmd], opts);
    }
  };
  var SIsMemberCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sismember", ...cmd], opts);
    }
  };
  var SMembersCommand = class extends Command {
    constructor(cmd, opts) {
      super(["smembers", ...cmd], opts);
    }
  };
  var SMIsMemberCommand = class extends Command {
    constructor(cmd, opts) {
      super(["smismember", cmd[0], ...cmd[1]], opts);
    }
  };
  var SMoveCommand = class extends Command {
    constructor(cmd, opts) {
      super(["smove", ...cmd], opts);
    }
  };
  var SPopCommand = class extends Command {
    constructor([key, count], opts) {
      const command = ["spop", key];
      if (typeof count === "number") {
        command.push(count);
      }
      super(command, opts);
    }
  };
  var SRandMemberCommand = class extends Command {
    constructor([key, count], opts) {
      const command = ["srandmember", key];
      if (typeof count === "number") {
        command.push(count);
      }
      super(command, opts);
    }
  };
  var SRemCommand = class extends Command {
    constructor(cmd, opts) {
      super(["srem", ...cmd], opts);
    }
  };
  var SScanCommand = class extends Command {
    constructor([key, cursor, opts], cmdOpts) {
      const command = ["sscan", key, cursor];
      if (opts?.match) {
        command.push("match", opts.match);
      }
      if (typeof opts?.count === "number") {
        command.push("count", opts.count);
      }
      super(command, {
        deserialize: deserializeScanResponse,
        ...cmdOpts
      });
    }
  };
  var StrLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["strlen", ...cmd], opts);
    }
  };
  var SUnionCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sunion", ...cmd], opts);
    }
  };
  var SUnionStoreCommand = class extends Command {
    constructor(cmd, opts) {
      super(["sunionstore", ...cmd], opts);
    }
  };
  var TimeCommand = class extends Command {
    constructor(opts) {
      super(["time"], opts);
    }
  };
  var TouchCommand = class extends Command {
    constructor(cmd, opts) {
      super(["touch", ...cmd], opts);
    }
  };
  var TtlCommand = class extends Command {
    constructor(cmd, opts) {
      super(["ttl", ...cmd], opts);
    }
  };
  var TypeCommand = class extends Command {
    constructor(cmd, opts) {
      super(["type", ...cmd], opts);
    }
  };
  var UnlinkCommand = class extends Command {
    constructor(cmd, opts) {
      super(["unlink", ...cmd], opts);
    }
  };
  var XAckCommand = class extends Command {
    constructor([key, group, id], opts) {
      const ids = Array.isArray(id) ? [...id] : [id];
      super(["XACK", key, group, ...ids], opts);
    }
  };
  var XAddCommand = class extends Command {
    constructor([key, id, entries, opts], commandOptions) {
      const command = ["XADD", key];
      if (opts) {
        if (opts.nomkStream) {
          command.push("NOMKSTREAM");
        }
        if (opts.trim) {
          command.push(opts.trim.type, opts.trim.comparison, opts.trim.threshold);
          if (opts.trim.limit !== void 0) {
            command.push("LIMIT", opts.trim.limit);
          }
        }
      }
      command.push(id);
      for (const [k, v] of Object.entries(entries)) {
        command.push(k, v);
      }
      super(command, commandOptions);
    }
  };
  var XAutoClaim = class extends Command {
    constructor([key, group, consumer, minIdleTime, start, options], opts) {
      const commands = [];
      if (options?.count) {
        commands.push("COUNT", options.count);
      }
      if (options?.justId) {
        commands.push("JUSTID");
      }
      super(["XAUTOCLAIM", key, group, consumer, minIdleTime, start, ...commands], opts);
    }
  };
  var XClaimCommand = class extends Command {
    constructor([key, group, consumer, minIdleTime, id, options], opts) {
      const ids = Array.isArray(id) ? [...id] : [id];
      const commands = [];
      if (options?.idleMS) {
        commands.push("IDLE", options.idleMS);
      }
      if (options?.idleMS) {
        commands.push("TIME", options.timeMS);
      }
      if (options?.retryCount) {
        commands.push("RETRYCOUNT", options.retryCount);
      }
      if (options?.force) {
        commands.push("FORCE");
      }
      if (options?.justId) {
        commands.push("JUSTID");
      }
      if (options?.lastId) {
        commands.push("LASTID", options.lastId);
      }
      super(["XCLAIM", key, group, consumer, minIdleTime, ...ids, ...commands], opts);
    }
  };
  var XDelCommand = class extends Command {
    constructor([key, ids], opts) {
      const cmds = Array.isArray(ids) ? [...ids] : [ids];
      super(["XDEL", key, ...cmds], opts);
    }
  };
  var XGroupCommand = class extends Command {
    constructor([key, opts], commandOptions) {
      const command = ["XGROUP"];
      switch (opts.type) {
        case "CREATE": {
          command.push("CREATE", key, opts.group, opts.id);
          if (opts.options) {
            if (opts.options.MKSTREAM) {
              command.push("MKSTREAM");
            }
            if (opts.options.ENTRIESREAD !== void 0) {
              command.push("ENTRIESREAD", opts.options.ENTRIESREAD.toString());
            }
          }
          break;
        }
        case "CREATECONSUMER": {
          command.push("CREATECONSUMER", key, opts.group, opts.consumer);
          break;
        }
        case "DELCONSUMER": {
          command.push("DELCONSUMER", key, opts.group, opts.consumer);
          break;
        }
        case "DESTROY": {
          command.push("DESTROY", key, opts.group);
          break;
        }
        case "SETID": {
          command.push("SETID", key, opts.group, opts.id);
          if (opts.options?.ENTRIESREAD !== void 0) {
            command.push("ENTRIESREAD", opts.options.ENTRIESREAD.toString());
          }
          break;
        }
        default: {
          throw new Error("Invalid XGROUP");
        }
      }
      super(command, commandOptions);
    }
  };
  var XInfoCommand = class extends Command {
    constructor([key, options], opts) {
      const cmds = [];
      if (options.type === "CONSUMERS") {
        cmds.push("CONSUMERS", key, options.group);
      } else {
        cmds.push("GROUPS", key);
      }
      super(["XINFO", ...cmds], opts);
    }
  };
  var XLenCommand = class extends Command {
    constructor(cmd, opts) {
      super(["XLEN", ...cmd], opts);
    }
  };
  var XPendingCommand = class extends Command {
    constructor([key, group, start, end, count, options], opts) {
      const consumers = options?.consumer === void 0 ? [] : Array.isArray(options.consumer) ? [...options.consumer] : [options.consumer];
      super(
        [
          "XPENDING",
          key,
          group,
          ...options?.idleTime ? ["IDLE", options.idleTime] : [],
          start,
          end,
          count,
          ...consumers
        ],
        opts
      );
    }
  };
  function deserialize4(result) {
    const obj = {};
    for (const e of result) {
      for (let i = 0; i < e.length; i += 2) {
        const streamId = e[i];
        const entries = e[i + 1];
        if (!(streamId in obj)) {
          obj[streamId] = {};
        }
        for (let j = 0; j < entries.length; j += 2) {
          const field = entries[j];
          const value = entries[j + 1];
          try {
            obj[streamId][field] = JSON.parse(value);
          } catch {
            obj[streamId][field] = value;
          }
        }
      }
    }
    return obj;
  }
  var XRangeCommand = class extends Command {
    constructor([key, start, end, count], opts) {
      const command = ["XRANGE", key, start, end];
      if (typeof count === "number") {
        command.push("COUNT", count);
      }
      super(command, {
        deserialize: (result) => deserialize4(result),
        ...opts
      });
    }
  };
  var UNBALANCED_XREAD_ERR = "ERR Unbalanced XREAD list of streams: for each stream key an ID or '$' must be specified";
  var XReadCommand = class extends Command {
    constructor([key, id, options], opts) {
      if (Array.isArray(key) && Array.isArray(id) && key.length !== id.length) {
        throw new Error(UNBALANCED_XREAD_ERR);
      }
      const commands = [];
      if (typeof options?.count === "number") {
        commands.push("COUNT", options.count);
      }
      if (typeof options?.blockMS === "number") {
        commands.push("BLOCK", options.blockMS);
      }
      commands.push(
        "STREAMS",
        ...Array.isArray(key) ? [...key] : [key],
        ...Array.isArray(id) ? [...id] : [id]
      );
      super(["XREAD", ...commands], opts);
    }
  };
  var UNBALANCED_XREADGROUP_ERR = "ERR Unbalanced XREADGROUP list of streams: for each stream key an ID or '$' must be specified";
  var XReadGroupCommand = class extends Command {
    constructor([group, consumer, key, id, options], opts) {
      if (Array.isArray(key) && Array.isArray(id) && key.length !== id.length) {
        throw new Error(UNBALANCED_XREADGROUP_ERR);
      }
      const commands = [];
      if (typeof options?.count === "number") {
        commands.push("COUNT", options.count);
      }
      if (typeof options?.blockMS === "number") {
        commands.push("BLOCK", options.blockMS);
      }
      if (typeof options?.NOACK === "boolean" && options.NOACK) {
        commands.push("NOACK");
      }
      commands.push(
        "STREAMS",
        ...Array.isArray(key) ? [...key] : [key],
        ...Array.isArray(id) ? [...id] : [id]
      );
      super(["XREADGROUP", "GROUP", group, consumer, ...commands], opts);
    }
  };
  var XRevRangeCommand = class extends Command {
    constructor([key, end, start, count], opts) {
      const command = ["XREVRANGE", key, end, start];
      if (typeof count === "number") {
        command.push("COUNT", count);
      }
      super(command, {
        deserialize: (result) => deserialize5(result),
        ...opts
      });
    }
  };
  function deserialize5(result) {
    const obj = {};
    for (const e of result) {
      for (let i = 0; i < e.length; i += 2) {
        const streamId = e[i];
        const entries = e[i + 1];
        if (!(streamId in obj)) {
          obj[streamId] = {};
        }
        for (let j = 0; j < entries.length; j += 2) {
          const field = entries[j];
          const value = entries[j + 1];
          try {
            obj[streamId][field] = JSON.parse(value);
          } catch {
            obj[streamId][field] = value;
          }
        }
      }
    }
    return obj;
  }
  var XTrimCommand = class extends Command {
    constructor([key, options], opts) {
      const { limit, strategy, threshold, exactness = "~" } = options;
      super(["XTRIM", key, strategy, exactness, threshold, ...limit ? ["LIMIT", limit] : []], opts);
    }
  };
  var ZAddCommand = class extends Command {
    constructor([key, arg1, ...arg2], opts) {
      const command = ["zadd", key];
      if ("nx" in arg1 && arg1.nx) {
        command.push("nx");
      } else if ("xx" in arg1 && arg1.xx) {
        command.push("xx");
      }
      if ("ch" in arg1 && arg1.ch) {
        command.push("ch");
      }
      if ("incr" in arg1 && arg1.incr) {
        command.push("incr");
      }
      if ("lt" in arg1 && arg1.lt) {
        command.push("lt");
      } else if ("gt" in arg1 && arg1.gt) {
        command.push("gt");
      }
      if ("score" in arg1 && "member" in arg1) {
        command.push(arg1.score, arg1.member);
      }
      command.push(...arg2.flatMap(({ score, member }) => [score, member]));
      super(command, opts);
    }
  };
  var ZCardCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zcard", ...cmd], opts);
    }
  };
  var ZCountCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zcount", ...cmd], opts);
    }
  };
  var ZIncrByCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zincrby", ...cmd], opts);
    }
  };
  var ZInterStoreCommand = class extends Command {
    constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
      const command = ["zinterstore", destination, numKeys];
      if (Array.isArray(keyOrKeys)) {
        command.push(...keyOrKeys);
      } else {
        command.push(keyOrKeys);
      }
      if (opts) {
        if ("weights" in opts && opts.weights) {
          command.push("weights", ...opts.weights);
        } else if ("weight" in opts && typeof opts.weight === "number") {
          command.push("weights", opts.weight);
        }
        if ("aggregate" in opts) {
          command.push("aggregate", opts.aggregate);
        }
      }
      super(command, cmdOpts);
    }
  };
  var ZLexCountCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zlexcount", ...cmd], opts);
    }
  };
  var ZPopMaxCommand = class extends Command {
    constructor([key, count], opts) {
      const command = ["zpopmax", key];
      if (typeof count === "number") {
        command.push(count);
      }
      super(command, opts);
    }
  };
  var ZPopMinCommand = class extends Command {
    constructor([key, count], opts) {
      const command = ["zpopmin", key];
      if (typeof count === "number") {
        command.push(count);
      }
      super(command, opts);
    }
  };
  var ZRangeCommand = class extends Command {
    constructor([key, min, max, opts], cmdOpts) {
      const command = ["zrange", key, min, max];
      if (opts?.byScore) {
        command.push("byscore");
      }
      if (opts?.byLex) {
        command.push("bylex");
      }
      if (opts?.rev) {
        command.push("rev");
      }
      if (opts?.count !== void 0 && opts.offset !== void 0) {
        command.push("limit", opts.offset, opts.count);
      }
      if (opts?.withScores) {
        command.push("withscores");
      }
      super(command, cmdOpts);
    }
  };
  var ZRankCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zrank", ...cmd], opts);
    }
  };
  var ZRemCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zrem", ...cmd], opts);
    }
  };
  var ZRemRangeByLexCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zremrangebylex", ...cmd], opts);
    }
  };
  var ZRemRangeByRankCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zremrangebyrank", ...cmd], opts);
    }
  };
  var ZRemRangeByScoreCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zremrangebyscore", ...cmd], opts);
    }
  };
  var ZRevRankCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zrevrank", ...cmd], opts);
    }
  };
  var ZScanCommand = class extends Command {
    constructor([key, cursor, opts], cmdOpts) {
      const command = ["zscan", key, cursor];
      if (opts?.match) {
        command.push("match", opts.match);
      }
      if (typeof opts?.count === "number") {
        command.push("count", opts.count);
      }
      super(command, {
        deserialize: deserializeScanResponse,
        ...cmdOpts
      });
    }
  };
  var ZScoreCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zscore", ...cmd], opts);
    }
  };
  var ZUnionCommand = class extends Command {
    constructor([numKeys, keyOrKeys, opts], cmdOpts) {
      const command = ["zunion", numKeys];
      if (Array.isArray(keyOrKeys)) {
        command.push(...keyOrKeys);
      } else {
        command.push(keyOrKeys);
      }
      if (opts) {
        if ("weights" in opts && opts.weights) {
          command.push("weights", ...opts.weights);
        } else if ("weight" in opts && typeof opts.weight === "number") {
          command.push("weights", opts.weight);
        }
        if ("aggregate" in opts) {
          command.push("aggregate", opts.aggregate);
        }
        if (opts.withScores) {
          command.push("withscores");
        }
      }
      super(command, cmdOpts);
    }
  };
  var ZUnionStoreCommand = class extends Command {
    constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
      const command = ["zunionstore", destination, numKeys];
      if (Array.isArray(keyOrKeys)) {
        command.push(...keyOrKeys);
      } else {
        command.push(keyOrKeys);
      }
      if (opts) {
        if ("weights" in opts && opts.weights) {
          command.push("weights", ...opts.weights);
        } else if ("weight" in opts && typeof opts.weight === "number") {
          command.push("weights", opts.weight);
        }
        if ("aggregate" in opts) {
          command.push("aggregate", opts.aggregate);
        }
      }
      super(command, cmdOpts);
    }
  };
  var ZDiffStoreCommand = class extends Command {
    constructor(cmd, opts) {
      super(["zdiffstore", ...cmd], opts);
    }
  };
  var ZMScoreCommand = class extends Command {
    constructor(cmd, opts) {
      const [key, members] = cmd;
      super(["zmscore", key, ...members], opts);
    }
  };
  var Pipeline = class {
    client;
    commands;
    commandOptions;
    multiExec;
    constructor(opts) {
      this.client = opts.client;
      this.commands = [];
      this.commandOptions = opts.commandOptions;
      this.multiExec = opts.multiExec ?? false;
      if (this.commandOptions?.latencyLogging) {
        const originalExec = this.exec.bind(this);
        this.exec = async (options) => {
          const start = performance.now();
          const result = await (options ? originalExec(options) : originalExec());
          const end = performance.now();
          const loggerResult = (end - start).toFixed(2);
          console.log(
            `Latency for \x1B[38;2;19;185;39m${this.multiExec ? ["MULTI-EXEC"] : ["PIPELINE"].toString().toUpperCase()}\x1B[0m: \x1B[38;2;0;255;255m${loggerResult} ms\x1B[0m`
          );
          return result;
        };
      }
    }
    exec = async (options) => {
      if (this.commands.length === 0) {
        throw new Error("Pipeline is empty");
      }
      const path = this.multiExec ? ["multi-exec"] : ["pipeline"];
      const res = await this.client.request({
        path,
        body: Object.values(this.commands).map((c) => c.command)
      });
      return options?.keepErrors ? res.map(({ error, result }, i) => {
        return {
          error,
          result: this.commands[i].deserialize(result)
        };
      }) : res.map(({ error, result }, i) => {
        if (error) {
          throw new UpstashError(
            `Command ${i + 1} [ ${this.commands[i].command[0]} ] failed: ${error}`
          );
        }
        return this.commands[i].deserialize(result);
      });
    };
    /**
     * Returns the length of pipeline before the execution
     */
    length() {
      return this.commands.length;
    }
    /**
     * Pushes a command into the pipeline and returns a chainable instance of the
     * pipeline
     */
    chain(command) {
      this.commands.push(command);
      return this;
    }
    /**
     * @see https://redis.io/commands/append
     */
    append = (...args) => this.chain(new AppendCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/bitcount
     */
    bitcount = (...args) => this.chain(new BitCountCommand(args, this.commandOptions));
    /**
     * Returns an instance that can be used to execute `BITFIELD` commands on one key.
     *
     * @example
     * ```typescript
     * redis.set("mykey", 0);
     * const result = await redis.pipeline()
     *   .bitfield("mykey")
     *   .set("u4", 0, 16)
     *   .incr("u4", "#1", 1)
     *   .exec();
     * console.log(result); // [[0, 1]]
     * ```
     *
     * @see https://redis.io/commands/bitfield
     */
    bitfield = (...args) => new BitFieldCommand(args, this.client, this.commandOptions, this.chain.bind(this));
    /**
     * @see https://redis.io/commands/bitop
     */
    bitop = (op, destinationKey, sourceKey, ...sourceKeys) => this.chain(
      new BitOpCommand([op, destinationKey, sourceKey, ...sourceKeys], this.commandOptions)
    );
    /**
     * @see https://redis.io/commands/bitpos
     */
    bitpos = (...args) => this.chain(new BitPosCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/copy
     */
    copy = (...args) => this.chain(new CopyCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zdiffstore
     */
    zdiffstore = (...args) => this.chain(new ZDiffStoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/dbsize
     */
    dbsize = () => this.chain(new DBSizeCommand(this.commandOptions));
    /**
     * @see https://redis.io/commands/decr
     */
    decr = (...args) => this.chain(new DecrCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/decrby
     */
    decrby = (...args) => this.chain(new DecrByCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/del
     */
    del = (...args) => this.chain(new DelCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/echo
     */
    echo = (...args) => this.chain(new EchoCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/eval_ro
     */
    evalRo = (...args) => this.chain(new EvalROCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/eval
     */
    eval = (...args) => this.chain(new EvalCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/evalsha_ro
     */
    evalshaRo = (...args) => this.chain(new EvalshaROCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/evalsha
     */
    evalsha = (...args) => this.chain(new EvalshaCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/exists
     */
    exists = (...args) => this.chain(new ExistsCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/expire
     */
    expire = (...args) => this.chain(new ExpireCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/expireat
     */
    expireat = (...args) => this.chain(new ExpireAtCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/flushall
     */
    flushall = (args) => this.chain(new FlushAllCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/flushdb
     */
    flushdb = (...args) => this.chain(new FlushDBCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/geoadd
     */
    geoadd = (...args) => this.chain(new GeoAddCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/geodist
     */
    geodist = (...args) => this.chain(new GeoDistCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/geopos
     */
    geopos = (...args) => this.chain(new GeoPosCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/geohash
     */
    geohash = (...args) => this.chain(new GeoHashCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/geosearch
     */
    geosearch = (...args) => this.chain(new GeoSearchCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/geosearchstore
     */
    geosearchstore = (...args) => this.chain(new GeoSearchStoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/get
     */
    get = (...args) => this.chain(new GetCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/getbit
     */
    getbit = (...args) => this.chain(new GetBitCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/getdel
     */
    getdel = (...args) => this.chain(new GetDelCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/getex
     */
    getex = (...args) => this.chain(new GetExCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/getrange
     */
    getrange = (...args) => this.chain(new GetRangeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/getset
     */
    getset = (key, value) => this.chain(new GetSetCommand([key, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/hdel
     */
    hdel = (...args) => this.chain(new HDelCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hexists
     */
    hexists = (...args) => this.chain(new HExistsCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hexpire
     */
    hexpire = (...args) => this.chain(new HExpireCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hexpireat
     */
    hexpireat = (...args) => this.chain(new HExpireAtCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hexpiretime
     */
    hexpiretime = (...args) => this.chain(new HExpireTimeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/httl
     */
    httl = (...args) => this.chain(new HTtlCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hpexpire
     */
    hpexpire = (...args) => this.chain(new HPExpireCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hpexpireat
     */
    hpexpireat = (...args) => this.chain(new HPExpireAtCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hpexpiretime
     */
    hpexpiretime = (...args) => this.chain(new HPExpireTimeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hpttl
     */
    hpttl = (...args) => this.chain(new HPTtlCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hpersist
     */
    hpersist = (...args) => this.chain(new HPersistCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hget
     */
    hget = (...args) => this.chain(new HGetCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hgetall
     */
    hgetall = (...args) => this.chain(new HGetAllCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hincrby
     */
    hincrby = (...args) => this.chain(new HIncrByCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hincrbyfloat
     */
    hincrbyfloat = (...args) => this.chain(new HIncrByFloatCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hkeys
     */
    hkeys = (...args) => this.chain(new HKeysCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hlen
     */
    hlen = (...args) => this.chain(new HLenCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hmget
     */
    hmget = (...args) => this.chain(new HMGetCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hmset
     */
    hmset = (key, kv2) => this.chain(new HMSetCommand([key, kv2], this.commandOptions));
    /**
     * @see https://redis.io/commands/hrandfield
     */
    hrandfield = (key, count, withValues) => this.chain(new HRandFieldCommand([key, count, withValues], this.commandOptions));
    /**
     * @see https://redis.io/commands/hscan
     */
    hscan = (...args) => this.chain(new HScanCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hset
     */
    hset = (key, kv2) => this.chain(new HSetCommand([key, kv2], this.commandOptions));
    /**
     * @see https://redis.io/commands/hsetnx
     */
    hsetnx = (key, field, value) => this.chain(new HSetNXCommand([key, field, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/hstrlen
     */
    hstrlen = (...args) => this.chain(new HStrLenCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/hvals
     */
    hvals = (...args) => this.chain(new HValsCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/incr
     */
    incr = (...args) => this.chain(new IncrCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/incrby
     */
    incrby = (...args) => this.chain(new IncrByCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/incrbyfloat
     */
    incrbyfloat = (...args) => this.chain(new IncrByFloatCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/keys
     */
    keys = (...args) => this.chain(new KeysCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/lindex
     */
    lindex = (...args) => this.chain(new LIndexCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/linsert
     */
    linsert = (key, direction, pivot, value) => this.chain(new LInsertCommand([key, direction, pivot, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/llen
     */
    llen = (...args) => this.chain(new LLenCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/lmove
     */
    lmove = (...args) => this.chain(new LMoveCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/lpop
     */
    lpop = (...args) => this.chain(new LPopCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/lmpop
     */
    lmpop = (...args) => this.chain(new LmPopCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/lpos
     */
    lpos = (...args) => this.chain(new LPosCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/lpush
     */
    lpush = (key, ...elements) => this.chain(new LPushCommand([key, ...elements], this.commandOptions));
    /**
     * @see https://redis.io/commands/lpushx
     */
    lpushx = (key, ...elements) => this.chain(new LPushXCommand([key, ...elements], this.commandOptions));
    /**
     * @see https://redis.io/commands/lrange
     */
    lrange = (...args) => this.chain(new LRangeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/lrem
     */
    lrem = (key, count, value) => this.chain(new LRemCommand([key, count, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/lset
     */
    lset = (key, index, value) => this.chain(new LSetCommand([key, index, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/ltrim
     */
    ltrim = (...args) => this.chain(new LTrimCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/mget
     */
    mget = (...args) => this.chain(new MGetCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/mset
     */
    mset = (kv2) => this.chain(new MSetCommand([kv2], this.commandOptions));
    /**
     * @see https://redis.io/commands/msetnx
     */
    msetnx = (kv2) => this.chain(new MSetNXCommand([kv2], this.commandOptions));
    /**
     * @see https://redis.io/commands/persist
     */
    persist = (...args) => this.chain(new PersistCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/pexpire
     */
    pexpire = (...args) => this.chain(new PExpireCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/pexpireat
     */
    pexpireat = (...args) => this.chain(new PExpireAtCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/pfadd
     */
    pfadd = (...args) => this.chain(new PfAddCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/pfcount
     */
    pfcount = (...args) => this.chain(new PfCountCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/pfmerge
     */
    pfmerge = (...args) => this.chain(new PfMergeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/ping
     */
    ping = (args) => this.chain(new PingCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/psetex
     */
    psetex = (key, ttl, value) => this.chain(new PSetEXCommand([key, ttl, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/pttl
     */
    pttl = (...args) => this.chain(new PTtlCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/publish
     */
    publish = (...args) => this.chain(new PublishCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/randomkey
     */
    randomkey = () => this.chain(new RandomKeyCommand(this.commandOptions));
    /**
     * @see https://redis.io/commands/rename
     */
    rename = (...args) => this.chain(new RenameCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/renamenx
     */
    renamenx = (...args) => this.chain(new RenameNXCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/rpop
     */
    rpop = (...args) => this.chain(new RPopCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/rpush
     */
    rpush = (key, ...elements) => this.chain(new RPushCommand([key, ...elements], this.commandOptions));
    /**
     * @see https://redis.io/commands/rpushx
     */
    rpushx = (key, ...elements) => this.chain(new RPushXCommand([key, ...elements], this.commandOptions));
    /**
     * @see https://redis.io/commands/sadd
     */
    sadd = (key, member, ...members) => this.chain(new SAddCommand([key, member, ...members], this.commandOptions));
    /**
     * @see https://redis.io/commands/scan
     */
    scan = (...args) => this.chain(new ScanCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/scard
     */
    scard = (...args) => this.chain(new SCardCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/script-exists
     */
    scriptExists = (...args) => this.chain(new ScriptExistsCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/script-flush
     */
    scriptFlush = (...args) => this.chain(new ScriptFlushCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/script-load
     */
    scriptLoad = (...args) => this.chain(new ScriptLoadCommand(args, this.commandOptions));
    /*)*
     * @see https://redis.io/commands/sdiff
     */
    sdiff = (...args) => this.chain(new SDiffCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/sdiffstore
     */
    sdiffstore = (...args) => this.chain(new SDiffStoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/set
     */
    set = (key, value, opts) => this.chain(new SetCommand([key, value, opts], this.commandOptions));
    /**
     * @see https://redis.io/commands/setbit
     */
    setbit = (...args) => this.chain(new SetBitCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/setex
     */
    setex = (key, ttl, value) => this.chain(new SetExCommand([key, ttl, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/setnx
     */
    setnx = (key, value) => this.chain(new SetNxCommand([key, value], this.commandOptions));
    /**
     * @see https://redis.io/commands/setrange
     */
    setrange = (...args) => this.chain(new SetRangeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/sinter
     */
    sinter = (...args) => this.chain(new SInterCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/sinterstore
     */
    sinterstore = (...args) => this.chain(new SInterStoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/sismember
     */
    sismember = (key, member) => this.chain(new SIsMemberCommand([key, member], this.commandOptions));
    /**
     * @see https://redis.io/commands/smembers
     */
    smembers = (...args) => this.chain(new SMembersCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/smismember
     */
    smismember = (key, members) => this.chain(new SMIsMemberCommand([key, members], this.commandOptions));
    /**
     * @see https://redis.io/commands/smove
     */
    smove = (source, destination, member) => this.chain(new SMoveCommand([source, destination, member], this.commandOptions));
    /**
     * @see https://redis.io/commands/spop
     */
    spop = (...args) => this.chain(new SPopCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/srandmember
     */
    srandmember = (...args) => this.chain(new SRandMemberCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/srem
     */
    srem = (key, ...members) => this.chain(new SRemCommand([key, ...members], this.commandOptions));
    /**
     * @see https://redis.io/commands/sscan
     */
    sscan = (...args) => this.chain(new SScanCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/strlen
     */
    strlen = (...args) => this.chain(new StrLenCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/sunion
     */
    sunion = (...args) => this.chain(new SUnionCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/sunionstore
     */
    sunionstore = (...args) => this.chain(new SUnionStoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/time
     */
    time = () => this.chain(new TimeCommand(this.commandOptions));
    /**
     * @see https://redis.io/commands/touch
     */
    touch = (...args) => this.chain(new TouchCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/ttl
     */
    ttl = (...args) => this.chain(new TtlCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/type
     */
    type = (...args) => this.chain(new TypeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/unlink
     */
    unlink = (...args) => this.chain(new UnlinkCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zadd
     */
    zadd = (...args) => {
      if ("score" in args[1]) {
        return this.chain(
          new ZAddCommand([args[0], args[1], ...args.slice(2)], this.commandOptions)
        );
      }
      return this.chain(
        new ZAddCommand(
          [args[0], args[1], ...args.slice(2)],
          this.commandOptions
        )
      );
    };
    /**
     * @see https://redis.io/commands/xadd
     */
    xadd = (...args) => this.chain(new XAddCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xack
     */
    xack = (...args) => this.chain(new XAckCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xdel
     */
    xdel = (...args) => this.chain(new XDelCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xgroup
     */
    xgroup = (...args) => this.chain(new XGroupCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xread
     */
    xread = (...args) => this.chain(new XReadCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xreadgroup
     */
    xreadgroup = (...args) => this.chain(new XReadGroupCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xinfo
     */
    xinfo = (...args) => this.chain(new XInfoCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xlen
     */
    xlen = (...args) => this.chain(new XLenCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xpending
     */
    xpending = (...args) => this.chain(new XPendingCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xclaim
     */
    xclaim = (...args) => this.chain(new XClaimCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xautoclaim
     */
    xautoclaim = (...args) => this.chain(new XAutoClaim(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xtrim
     */
    xtrim = (...args) => this.chain(new XTrimCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xrange
     */
    xrange = (...args) => this.chain(new XRangeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/xrevrange
     */
    xrevrange = (...args) => this.chain(new XRevRangeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zcard
     */
    zcard = (...args) => this.chain(new ZCardCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zcount
     */
    zcount = (...args) => this.chain(new ZCountCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zincrby
     */
    zincrby = (key, increment, member) => this.chain(new ZIncrByCommand([key, increment, member], this.commandOptions));
    /**
     * @see https://redis.io/commands/zinterstore
     */
    zinterstore = (...args) => this.chain(new ZInterStoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zlexcount
     */
    zlexcount = (...args) => this.chain(new ZLexCountCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zmscore
     */
    zmscore = (...args) => this.chain(new ZMScoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zpopmax
     */
    zpopmax = (...args) => this.chain(new ZPopMaxCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zpopmin
     */
    zpopmin = (...args) => this.chain(new ZPopMinCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zrange
     */
    zrange = (...args) => this.chain(new ZRangeCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zrank
     */
    zrank = (key, member) => this.chain(new ZRankCommand([key, member], this.commandOptions));
    /**
     * @see https://redis.io/commands/zrem
     */
    zrem = (key, ...members) => this.chain(new ZRemCommand([key, ...members], this.commandOptions));
    /**
     * @see https://redis.io/commands/zremrangebylex
     */
    zremrangebylex = (...args) => this.chain(new ZRemRangeByLexCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zremrangebyrank
     */
    zremrangebyrank = (...args) => this.chain(new ZRemRangeByRankCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zremrangebyscore
     */
    zremrangebyscore = (...args) => this.chain(new ZRemRangeByScoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zrevrank
     */
    zrevrank = (key, member) => this.chain(new ZRevRankCommand([key, member], this.commandOptions));
    /**
     * @see https://redis.io/commands/zscan
     */
    zscan = (...args) => this.chain(new ZScanCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zscore
     */
    zscore = (key, member) => this.chain(new ZScoreCommand([key, member], this.commandOptions));
    /**
     * @see https://redis.io/commands/zunionstore
     */
    zunionstore = (...args) => this.chain(new ZUnionStoreCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/zunion
     */
    zunion = (...args) => this.chain(new ZUnionCommand(args, this.commandOptions));
    /**
     * @see https://redis.io/commands/?group=json
     */
    get json() {
      return {
        /**
         * @see https://redis.io/commands/json.arrappend
         */
        arrappend: (...args) => this.chain(new JsonArrAppendCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.arrindex
         */
        arrindex: (...args) => this.chain(new JsonArrIndexCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.arrinsert
         */
        arrinsert: (...args) => this.chain(new JsonArrInsertCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.arrlen
         */
        arrlen: (...args) => this.chain(new JsonArrLenCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.arrpop
         */
        arrpop: (...args) => this.chain(new JsonArrPopCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.arrtrim
         */
        arrtrim: (...args) => this.chain(new JsonArrTrimCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.clear
         */
        clear: (...args) => this.chain(new JsonClearCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.del
         */
        del: (...args) => this.chain(new JsonDelCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.forget
         */
        forget: (...args) => this.chain(new JsonForgetCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.get
         */
        get: (...args) => this.chain(new JsonGetCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.merge
         */
        merge: (...args) => this.chain(new JsonMergeCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.mget
         */
        mget: (...args) => this.chain(new JsonMGetCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.mset
         */
        mset: (...args) => this.chain(new JsonMSetCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.numincrby
         */
        numincrby: (...args) => this.chain(new JsonNumIncrByCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.nummultby
         */
        nummultby: (...args) => this.chain(new JsonNumMultByCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.objkeys
         */
        objkeys: (...args) => this.chain(new JsonObjKeysCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.objlen
         */
        objlen: (...args) => this.chain(new JsonObjLenCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.resp
         */
        resp: (...args) => this.chain(new JsonRespCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.set
         */
        set: (...args) => this.chain(new JsonSetCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.strappend
         */
        strappend: (...args) => this.chain(new JsonStrAppendCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.strlen
         */
        strlen: (...args) => this.chain(new JsonStrLenCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.toggle
         */
        toggle: (...args) => this.chain(new JsonToggleCommand(args, this.commandOptions)),
        /**
         * @see https://redis.io/commands/json.type
         */
        type: (...args) => this.chain(new JsonTypeCommand(args, this.commandOptions))
      };
    }
  };
  var EXCLUDE_COMMANDS = /* @__PURE__ */ new Set([
    "scan",
    "keys",
    "flushdb",
    "flushall",
    "dbsize",
    "hscan",
    "hgetall",
    "hkeys",
    "lrange",
    "sscan",
    "smembers",
    "xrange",
    "xrevrange",
    "zscan",
    "zrange",
    "exec"
  ]);
  function createAutoPipelineProxy(_redis, json) {
    const redis = _redis;
    if (!redis.autoPipelineExecutor) {
      redis.autoPipelineExecutor = new AutoPipelineExecutor(redis);
    }
    return new Proxy(redis, {
      get: (redis2, command) => {
        if (command === "pipelineCounter") {
          return redis2.autoPipelineExecutor.pipelineCounter;
        }
        if (command === "json") {
          return createAutoPipelineProxy(redis2, true);
        }
        const commandInRedisButNotPipeline = command in redis2 && !(command in redis2.autoPipelineExecutor.pipeline);
        const isCommandExcluded = EXCLUDE_COMMANDS.has(command);
        if (commandInRedisButNotPipeline || isCommandExcluded) {
          return redis2[command];
        }
        const isFunction3 = json ? typeof redis2.autoPipelineExecutor.pipeline.json[command] === "function" : typeof redis2.autoPipelineExecutor.pipeline[command] === "function";
        if (isFunction3) {
          return (...args) => {
            return redis2.autoPipelineExecutor.withAutoPipeline((pipeline) => {
              if (json) {
                pipeline.json[command](
                  ...args
                );
              } else {
                pipeline[command](...args);
              }
            });
          };
        }
        return redis2.autoPipelineExecutor.pipeline[command];
      }
    });
  }
  var AutoPipelineExecutor = class {
    pipelinePromises = /* @__PURE__ */ new WeakMap();
    activePipeline = null;
    indexInCurrentPipeline = 0;
    redis;
    pipeline;
    // only to make sure that proxy can work
    pipelineCounter = 0;
    // to keep track of how many times a pipeline was executed
    constructor(redis) {
      this.redis = redis;
      this.pipeline = redis.pipeline();
    }
    async withAutoPipeline(executeWithPipeline) {
      const pipeline = this.activePipeline ?? this.redis.pipeline();
      if (!this.activePipeline) {
        this.activePipeline = pipeline;
        this.indexInCurrentPipeline = 0;
      }
      const index = this.indexInCurrentPipeline++;
      executeWithPipeline(pipeline);
      const pipelineDone = this.deferExecution().then(() => {
        if (!this.pipelinePromises.has(pipeline)) {
          const pipelinePromise = pipeline.exec({ keepErrors: true });
          this.pipelineCounter += 1;
          this.pipelinePromises.set(pipeline, pipelinePromise);
          this.activePipeline = null;
        }
        return this.pipelinePromises.get(pipeline);
      });
      const results = await pipelineDone;
      const commandResult = results[index];
      if (commandResult.error) {
        throw new UpstashError(`Command failed: ${commandResult.error}`);
      }
      return commandResult.result;
    }
    async deferExecution() {
      await Promise.resolve();
      await Promise.resolve();
    }
  };
  var PSubscribeCommand = class extends Command {
    constructor(cmd, opts) {
      const sseHeaders = {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      };
      super([], {
        ...opts,
        headers: sseHeaders,
        path: ["psubscribe", ...cmd],
        streamOptions: {
          isStreaming: true,
          onMessage: opts?.streamOptions?.onMessage,
          signal: opts?.streamOptions?.signal
        }
      });
    }
  };
  var Subscriber = class extends EventTarget {
    subscriptions;
    client;
    listeners;
    opts;
    constructor(client, channels, isPattern = false, opts) {
      super();
      this.client = client;
      this.subscriptions = /* @__PURE__ */ new Map();
      this.listeners = /* @__PURE__ */ new Map();
      this.opts = opts;
      for (const channel of channels) {
        if (isPattern) {
          this.subscribeToPattern(channel);
        } else {
          this.subscribeToChannel(channel);
        }
      }
    }
    subscribeToChannel(channel) {
      const controller = new AbortController();
      const command = new SubscribeCommand([channel], {
        streamOptions: {
          signal: controller.signal,
          onMessage: (data) => this.handleMessage(data, false)
        }
      });
      command.exec(this.client).catch((error) => {
        if (error.name !== "AbortError") {
          this.dispatchToListeners("error", error);
        }
      });
      this.subscriptions.set(channel, {
        command,
        controller,
        isPattern: false
      });
    }
    subscribeToPattern(pattern) {
      const controller = new AbortController();
      const command = new PSubscribeCommand([pattern], {
        streamOptions: {
          signal: controller.signal,
          onMessage: (data) => this.handleMessage(data, true)
        }
      });
      command.exec(this.client).catch((error) => {
        if (error.name !== "AbortError") {
          this.dispatchToListeners("error", error);
        }
      });
      this.subscriptions.set(pattern, {
        command,
        controller,
        isPattern: true
      });
    }
    handleMessage(data, isPattern) {
      const messageData = data.replace(/^data:\s*/, "");
      const firstCommaIndex = messageData.indexOf(",");
      const secondCommaIndex = messageData.indexOf(",", firstCommaIndex + 1);
      const thirdCommaIndex = isPattern ? messageData.indexOf(",", secondCommaIndex + 1) : -1;
      if (firstCommaIndex !== -1 && secondCommaIndex !== -1) {
        const type = messageData.slice(0, firstCommaIndex);
        if (isPattern && type === "pmessage" && thirdCommaIndex !== -1) {
          const pattern = messageData.slice(firstCommaIndex + 1, secondCommaIndex);
          const channel = messageData.slice(secondCommaIndex + 1, thirdCommaIndex);
          const messageStr = messageData.slice(thirdCommaIndex + 1);
          try {
            const message = this.opts?.automaticDeserialization === false ? messageStr : JSON.parse(messageStr);
            this.dispatchToListeners("pmessage", { pattern, channel, message });
            this.dispatchToListeners(`pmessage:${pattern}`, { pattern, channel, message });
          } catch (error) {
            this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`));
          }
        } else {
          const channel = messageData.slice(firstCommaIndex + 1, secondCommaIndex);
          const messageStr = messageData.slice(secondCommaIndex + 1);
          try {
            if (type === "subscribe" || type === "psubscribe" || type === "unsubscribe" || type === "punsubscribe") {
              const count = Number.parseInt(messageStr);
              this.dispatchToListeners(type, count);
            } else {
              const message = this.opts?.automaticDeserialization === false ? messageStr : parseWithTryCatch(messageStr);
              this.dispatchToListeners(type, { channel, message });
              this.dispatchToListeners(`${type}:${channel}`, { channel, message });
            }
          } catch (error) {
            this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`));
          }
        }
      }
    }
    dispatchToListeners(type, data) {
      const listeners = this.listeners.get(type);
      if (listeners) {
        for (const listener of listeners) {
          listener(data);
        }
      }
    }
    on(type, listener) {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, /* @__PURE__ */ new Set());
      }
      this.listeners.get(type)?.add(listener);
    }
    removeAllListeners() {
      this.listeners.clear();
    }
    async unsubscribe(channels) {
      if (channels) {
        for (const channel of channels) {
          const subscription = this.subscriptions.get(channel);
          if (subscription) {
            try {
              subscription.controller.abort();
            } catch {
            }
            this.subscriptions.delete(channel);
          }
        }
      } else {
        for (const subscription of this.subscriptions.values()) {
          try {
            subscription.controller.abort();
          } catch {
          }
        }
        this.subscriptions.clear();
        this.removeAllListeners();
      }
    }
    getSubscribedChannels() {
      return [...this.subscriptions.keys()];
    }
  };
  var SubscribeCommand = class extends Command {
    constructor(cmd, opts) {
      const sseHeaders = {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      };
      super([], {
        ...opts,
        headers: sseHeaders,
        path: ["subscribe", ...cmd],
        streamOptions: {
          isStreaming: true,
          onMessage: opts?.streamOptions?.onMessage,
          signal: opts?.streamOptions?.signal
        }
      });
    }
  };
  var parseWithTryCatch = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  };
  var Script = class {
    script;
    /**
     * @deprecated This property is initialized to an empty string and will be set in the init method
     * asynchronously. Do not use this property immidiately after the constructor.
     *
     * This property is only exposed for backwards compatibility and will be removed in the
     * future major release.
     */
    sha1;
    redis;
    constructor(redis, script) {
      this.redis = redis;
      this.script = script;
      this.sha1 = "";
      void this.init(script);
    }
    /**
     * Initialize the script by computing its SHA-1 hash.
     */
    async init(script) {
      if (this.sha1)
        return;
      this.sha1 = await this.digest(script);
    }
    /**
     * Send an `EVAL` command to redis.
     */
    async eval(keys, args) {
      await this.init(this.script);
      return await this.redis.eval(this.script, keys, args);
    }
    /**
     * Calculates the sha1 hash of the script and then calls `EVALSHA`.
     */
    async evalsha(keys, args) {
      await this.init(this.script);
      return await this.redis.evalsha(this.sha1, keys, args);
    }
    /**
     * Optimistically try to run `EVALSHA` first.
     * If the script is not loaded in redis, it will fall back and try again with `EVAL`.
     *
     * Following calls will be able to use the cached script
     */
    async exec(keys, args) {
      await this.init(this.script);
      const res = await this.redis.evalsha(this.sha1, keys, args).catch(async (error) => {
        if (error instanceof Error && error.message.toLowerCase().includes("noscript")) {
          return await this.redis.eval(this.script, keys, args);
        }
        throw error;
      });
      return res;
    }
    /**
     * Compute the sha1 hash of the script and return its hex representation.
     */
    async digest(s) {
      const data = new TextEncoder().encode(s);
      const hashBuffer = await subtle.digest("SHA-1", data);
      const hashArray = [...new Uint8Array(hashBuffer)];
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  };
  var ScriptRO = class {
    script;
    /**
     * @deprecated This property is initialized to an empty string and will be set in the init method
     * asynchronously. Do not use this property immidiately after the constructor.
     *
     * This property is only exposed for backwards compatibility and will be removed in the
     * future major release.
     */
    sha1;
    redis;
    constructor(redis, script) {
      this.redis = redis;
      this.sha1 = "";
      this.script = script;
      void this.init(script);
    }
    async init(script) {
      if (this.sha1)
        return;
      this.sha1 = await this.digest(script);
    }
    /**
     * Send an `EVAL_RO` command to redis.
     */
    async evalRo(keys, args) {
      await this.init(this.script);
      return await this.redis.evalRo(this.script, keys, args);
    }
    /**
     * Calculates the sha1 hash of the script and then calls `EVALSHA_RO`.
     */
    async evalshaRo(keys, args) {
      await this.init(this.script);
      return await this.redis.evalshaRo(this.sha1, keys, args);
    }
    /**
     * Optimistically try to run `EVALSHA_RO` first.
     * If the script is not loaded in redis, it will fall back and try again with `EVAL_RO`.
     *
     * Following calls will be able to use the cached script
     */
    async exec(keys, args) {
      await this.init(this.script);
      const res = await this.redis.evalshaRo(this.sha1, keys, args).catch(async (error) => {
        if (error instanceof Error && error.message.toLowerCase().includes("noscript")) {
          return await this.redis.evalRo(this.script, keys, args);
        }
        throw error;
      });
      return res;
    }
    /**
     * Compute the sha1 hash of the script and return its hex representation.
     */
    async digest(s) {
      const data = new TextEncoder().encode(s);
      const hashBuffer = await subtle.digest("SHA-1", data);
      const hashArray = [...new Uint8Array(hashBuffer)];
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  };
  var Redis = class {
    client;
    opts;
    enableTelemetry;
    enableAutoPipelining;
    /**
     * Create a new redis client
     *
     * @example
     * ```typescript
     * const redis = new Redis({
     *  url: "<UPSTASH_REDIS_REST_URL>",
     *  token: "<UPSTASH_REDIS_REST_TOKEN>",
     * });
     * ```
     */
    constructor(client, opts) {
      this.client = client;
      this.opts = opts;
      this.enableTelemetry = opts?.enableTelemetry ?? true;
      if (opts?.readYourWrites === false) {
        this.client.readYourWrites = false;
      }
      this.enableAutoPipelining = opts?.enableAutoPipelining ?? true;
    }
    get readYourWritesSyncToken() {
      return this.client.upstashSyncToken;
    }
    set readYourWritesSyncToken(session) {
      this.client.upstashSyncToken = session;
    }
    get json() {
      return {
        /**
         * @see https://redis.io/commands/json.arrappend
         */
        arrappend: (...args) => new JsonArrAppendCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.arrindex
         */
        arrindex: (...args) => new JsonArrIndexCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.arrinsert
         */
        arrinsert: (...args) => new JsonArrInsertCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.arrlen
         */
        arrlen: (...args) => new JsonArrLenCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.arrpop
         */
        arrpop: (...args) => new JsonArrPopCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.arrtrim
         */
        arrtrim: (...args) => new JsonArrTrimCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.clear
         */
        clear: (...args) => new JsonClearCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.del
         */
        del: (...args) => new JsonDelCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.forget
         */
        forget: (...args) => new JsonForgetCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.get
         */
        get: (...args) => new JsonGetCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.merge
         */
        merge: (...args) => new JsonMergeCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.mget
         */
        mget: (...args) => new JsonMGetCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.mset
         */
        mset: (...args) => new JsonMSetCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.numincrby
         */
        numincrby: (...args) => new JsonNumIncrByCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.nummultby
         */
        nummultby: (...args) => new JsonNumMultByCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.objkeys
         */
        objkeys: (...args) => new JsonObjKeysCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.objlen
         */
        objlen: (...args) => new JsonObjLenCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.resp
         */
        resp: (...args) => new JsonRespCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.set
         */
        set: (...args) => new JsonSetCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.strappend
         */
        strappend: (...args) => new JsonStrAppendCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.strlen
         */
        strlen: (...args) => new JsonStrLenCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.toggle
         */
        toggle: (...args) => new JsonToggleCommand(args, this.opts).exec(this.client),
        /**
         * @see https://redis.io/commands/json.type
         */
        type: (...args) => new JsonTypeCommand(args, this.opts).exec(this.client)
      };
    }
    /**
     * Wrap a new middleware around the HTTP client.
     */
    use = (middleware) => {
      const makeRequest = this.client.request.bind(this.client);
      this.client.request = (req) => middleware(req, makeRequest);
    };
    /**
     * Technically this is not private, we can hide it from intellisense by doing this
     */
    addTelemetry = (telemetry) => {
      if (!this.enableTelemetry) {
        return;
      }
      try {
        this.client.mergeTelemetry(telemetry);
      } catch {
      }
    };
    /**
     * Creates a new script.
     *
     * Scripts offer the ability to optimistically try to execute a script without having to send the
     * entire script to the server. If the script is loaded on the server, it tries again by sending
     * the entire script. Afterwards, the script is cached on the server.
     *
     * @param script - The script to create
     * @param opts - Optional options to pass to the script `{ readonly?: boolean }`
     * @returns A new script
     *
     * @example
     * ```ts
     * const redis = new Redis({...})
     *
     * const script = redis.createScript<string>("return ARGV[1];")
     * const arg1 = await script.eval([], ["Hello World"])
     * expect(arg1, "Hello World")
     * ```
     * @example
     * ```ts
     * const redis = new Redis({...})
     *
     * const script = redis.createScript<string>("return ARGV[1];", { readonly: true })
     * const arg1 = await script.evalRo([], ["Hello World"])
     * expect(arg1, "Hello World")
     * ```
     */
    createScript(script, opts) {
      return opts?.readonly ? new ScriptRO(this, script) : new Script(this, script);
    }
    /**
     * Create a new pipeline that allows you to send requests in bulk.
     *
     * @see {@link Pipeline}
     */
    pipeline = () => new Pipeline({
      client: this.client,
      commandOptions: this.opts,
      multiExec: false
    });
    autoPipeline = () => {
      return createAutoPipelineProxy(this);
    };
    /**
     * Create a new transaction to allow executing multiple steps atomically.
     *
     * All the commands in a transaction are serialized and executed sequentially. A request sent by
     * another client will never be served in the middle of the execution of a Redis Transaction. This
     * guarantees that the commands are executed as a single isolated operation.
     *
     * @see {@link Pipeline}
     */
    multi = () => new Pipeline({
      client: this.client,
      commandOptions: this.opts,
      multiExec: true
    });
    /**
     * Returns an instance that can be used to execute `BITFIELD` commands on one key.
     *
     * @example
     * ```typescript
     * redis.set("mykey", 0);
     * const result = await redis.bitfield("mykey")
     *   .set("u4", 0, 16)
     *   .incr("u4", "#1", 1)
     *   .exec();
     * console.log(result); // [0, 1]
     * ```
     *
     * @see https://redis.io/commands/bitfield
     */
    bitfield = (...args) => new BitFieldCommand(args, this.client, this.opts);
    /**
     * @see https://redis.io/commands/append
     */
    append = (...args) => new AppendCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/bitcount
     */
    bitcount = (...args) => new BitCountCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/bitop
     */
    bitop = (op, destinationKey, sourceKey, ...sourceKeys) => new BitOpCommand([op, destinationKey, sourceKey, ...sourceKeys], this.opts).exec(
      this.client
    );
    /**
     * @see https://redis.io/commands/bitpos
     */
    bitpos = (...args) => new BitPosCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/copy
     */
    copy = (...args) => new CopyCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/dbsize
     */
    dbsize = () => new DBSizeCommand(this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/decr
     */
    decr = (...args) => new DecrCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/decrby
     */
    decrby = (...args) => new DecrByCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/del
     */
    del = (...args) => new DelCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/echo
     */
    echo = (...args) => new EchoCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/eval_ro
     */
    evalRo = (...args) => new EvalROCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/eval
     */
    eval = (...args) => new EvalCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/evalsha_ro
     */
    evalshaRo = (...args) => new EvalshaROCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/evalsha
     */
    evalsha = (...args) => new EvalshaCommand(args, this.opts).exec(this.client);
    /**
     * Generic method to execute any Redis command.
     */
    exec = (args) => new ExecCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/exists
     */
    exists = (...args) => new ExistsCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/expire
     */
    expire = (...args) => new ExpireCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/expireat
     */
    expireat = (...args) => new ExpireAtCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/flushall
     */
    flushall = (args) => new FlushAllCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/flushdb
     */
    flushdb = (...args) => new FlushDBCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/geoadd
     */
    geoadd = (...args) => new GeoAddCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/geopos
     */
    geopos = (...args) => new GeoPosCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/geodist
     */
    geodist = (...args) => new GeoDistCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/geohash
     */
    geohash = (...args) => new GeoHashCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/geosearch
     */
    geosearch = (...args) => new GeoSearchCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/geosearchstore
     */
    geosearchstore = (...args) => new GeoSearchStoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/get
     */
    get = (...args) => new GetCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/getbit
     */
    getbit = (...args) => new GetBitCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/getdel
     */
    getdel = (...args) => new GetDelCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/getex
     */
    getex = (...args) => new GetExCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/getrange
     */
    getrange = (...args) => new GetRangeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/getset
     */
    getset = (key, value) => new GetSetCommand([key, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hdel
     */
    hdel = (...args) => new HDelCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hexists
     */
    hexists = (...args) => new HExistsCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hexpire
     */
    hexpire = (...args) => new HExpireCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hexpireat
     */
    hexpireat = (...args) => new HExpireAtCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hexpiretime
     */
    hexpiretime = (...args) => new HExpireTimeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/httl
     */
    httl = (...args) => new HTtlCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hpexpire
     */
    hpexpire = (...args) => new HPExpireCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hpexpireat
     */
    hpexpireat = (...args) => new HPExpireAtCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hpexpiretime
     */
    hpexpiretime = (...args) => new HPExpireTimeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hpttl
     */
    hpttl = (...args) => new HPTtlCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hpersist
     */
    hpersist = (...args) => new HPersistCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hget
     */
    hget = (...args) => new HGetCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hgetall
     */
    hgetall = (...args) => new HGetAllCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hincrby
     */
    hincrby = (...args) => new HIncrByCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hincrbyfloat
     */
    hincrbyfloat = (...args) => new HIncrByFloatCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hkeys
     */
    hkeys = (...args) => new HKeysCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hlen
     */
    hlen = (...args) => new HLenCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hmget
     */
    hmget = (...args) => new HMGetCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hmset
     */
    hmset = (key, kv2) => new HMSetCommand([key, kv2], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hrandfield
     */
    hrandfield = (key, count, withValues) => new HRandFieldCommand([key, count, withValues], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hscan
     */
    hscan = (...args) => new HScanCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hset
     */
    hset = (key, kv2) => new HSetCommand([key, kv2], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hsetnx
     */
    hsetnx = (key, field, value) => new HSetNXCommand([key, field, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hstrlen
     */
    hstrlen = (...args) => new HStrLenCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/hvals
     */
    hvals = (...args) => new HValsCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/incr
     */
    incr = (...args) => new IncrCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/incrby
     */
    incrby = (...args) => new IncrByCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/incrbyfloat
     */
    incrbyfloat = (...args) => new IncrByFloatCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/keys
     */
    keys = (...args) => new KeysCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lindex
     */
    lindex = (...args) => new LIndexCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/linsert
     */
    linsert = (key, direction, pivot, value) => new LInsertCommand([key, direction, pivot, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/llen
     */
    llen = (...args) => new LLenCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lmove
     */
    lmove = (...args) => new LMoveCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lpop
     */
    lpop = (...args) => new LPopCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lmpop
     */
    lmpop = (...args) => new LmPopCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lpos
     */
    lpos = (...args) => new LPosCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lpush
     */
    lpush = (key, ...elements) => new LPushCommand([key, ...elements], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lpushx
     */
    lpushx = (key, ...elements) => new LPushXCommand([key, ...elements], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lrange
     */
    lrange = (...args) => new LRangeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lrem
     */
    lrem = (key, count, value) => new LRemCommand([key, count, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/lset
     */
    lset = (key, index, value) => new LSetCommand([key, index, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/ltrim
     */
    ltrim = (...args) => new LTrimCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/mget
     */
    mget = (...args) => new MGetCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/mset
     */
    mset = (kv2) => new MSetCommand([kv2], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/msetnx
     */
    msetnx = (kv2) => new MSetNXCommand([kv2], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/persist
     */
    persist = (...args) => new PersistCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/pexpire
     */
    pexpire = (...args) => new PExpireCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/pexpireat
     */
    pexpireat = (...args) => new PExpireAtCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/pfadd
     */
    pfadd = (...args) => new PfAddCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/pfcount
     */
    pfcount = (...args) => new PfCountCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/pfmerge
     */
    pfmerge = (...args) => new PfMergeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/ping
     */
    ping = (args) => new PingCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/psetex
     */
    psetex = (key, ttl, value) => new PSetEXCommand([key, ttl, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/psubscribe
     */
    psubscribe = (patterns) => {
      const patternArray = Array.isArray(patterns) ? patterns : [patterns];
      return new Subscriber(this.client, patternArray, true, this.opts);
    };
    /**
     * @see https://redis.io/commands/pttl
     */
    pttl = (...args) => new PTtlCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/publish
     */
    publish = (...args) => new PublishCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/randomkey
     */
    randomkey = () => new RandomKeyCommand().exec(this.client);
    /**
     * @see https://redis.io/commands/rename
     */
    rename = (...args) => new RenameCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/renamenx
     */
    renamenx = (...args) => new RenameNXCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/rpop
     */
    rpop = (...args) => new RPopCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/rpush
     */
    rpush = (key, ...elements) => new RPushCommand([key, ...elements], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/rpushx
     */
    rpushx = (key, ...elements) => new RPushXCommand([key, ...elements], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sadd
     */
    sadd = (key, member, ...members) => new SAddCommand([key, member, ...members], this.opts).exec(this.client);
    scan(cursor, opts) {
      return new ScanCommand([cursor, opts], this.opts).exec(this.client);
    }
    /**
     * @see https://redis.io/commands/scard
     */
    scard = (...args) => new SCardCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/script-exists
     */
    scriptExists = (...args) => new ScriptExistsCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/script-flush
     */
    scriptFlush = (...args) => new ScriptFlushCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/script-load
     */
    scriptLoad = (...args) => new ScriptLoadCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sdiff
     */
    sdiff = (...args) => new SDiffCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sdiffstore
     */
    sdiffstore = (...args) => new SDiffStoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/set
     */
    set = (key, value, opts) => new SetCommand([key, value, opts], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/setbit
     */
    setbit = (...args) => new SetBitCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/setex
     */
    setex = (key, ttl, value) => new SetExCommand([key, ttl, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/setnx
     */
    setnx = (key, value) => new SetNxCommand([key, value], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/setrange
     */
    setrange = (...args) => new SetRangeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sinter
     */
    sinter = (...args) => new SInterCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sinterstore
     */
    sinterstore = (...args) => new SInterStoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sismember
     */
    sismember = (key, member) => new SIsMemberCommand([key, member], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/smismember
     */
    smismember = (key, members) => new SMIsMemberCommand([key, members], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/smembers
     */
    smembers = (...args) => new SMembersCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/smove
     */
    smove = (source, destination, member) => new SMoveCommand([source, destination, member], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/spop
     */
    spop = (...args) => new SPopCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/srandmember
     */
    srandmember = (...args) => new SRandMemberCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/srem
     */
    srem = (key, ...members) => new SRemCommand([key, ...members], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sscan
     */
    sscan = (...args) => new SScanCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/strlen
     */
    strlen = (...args) => new StrLenCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/subscribe
     */
    subscribe = (channels) => {
      const channelArray = Array.isArray(channels) ? channels : [channels];
      return new Subscriber(this.client, channelArray, false, this.opts);
    };
    /**
     * @see https://redis.io/commands/sunion
     */
    sunion = (...args) => new SUnionCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/sunionstore
     */
    sunionstore = (...args) => new SUnionStoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/time
     */
    time = () => new TimeCommand().exec(this.client);
    /**
     * @see https://redis.io/commands/touch
     */
    touch = (...args) => new TouchCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/ttl
     */
    ttl = (...args) => new TtlCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/type
     */
    type = (...args) => new TypeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/unlink
     */
    unlink = (...args) => new UnlinkCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xadd
     */
    xadd = (...args) => new XAddCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xack
     */
    xack = (...args) => new XAckCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xdel
     */
    xdel = (...args) => new XDelCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xgroup
     */
    xgroup = (...args) => new XGroupCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xread
     */
    xread = (...args) => new XReadCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xreadgroup
     */
    xreadgroup = (...args) => new XReadGroupCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xinfo
     */
    xinfo = (...args) => new XInfoCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xlen
     */
    xlen = (...args) => new XLenCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xpending
     */
    xpending = (...args) => new XPendingCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xclaim
     */
    xclaim = (...args) => new XClaimCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xautoclaim
     */
    xautoclaim = (...args) => new XAutoClaim(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xtrim
     */
    xtrim = (...args) => new XTrimCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xrange
     */
    xrange = (...args) => new XRangeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/xrevrange
     */
    xrevrange = (...args) => new XRevRangeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zadd
     */
    zadd = (...args) => {
      if ("score" in args[1]) {
        return new ZAddCommand([args[0], args[1], ...args.slice(2)], this.opts).exec(
          this.client
        );
      }
      return new ZAddCommand(
        [args[0], args[1], ...args.slice(2)],
        this.opts
      ).exec(this.client);
    };
    /**
     * @see https://redis.io/commands/zcard
     */
    zcard = (...args) => new ZCardCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zcount
     */
    zcount = (...args) => new ZCountCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zdiffstore
     */
    zdiffstore = (...args) => new ZDiffStoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zincrby
     */
    zincrby = (key, increment, member) => new ZIncrByCommand([key, increment, member], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zinterstore
     */
    zinterstore = (...args) => new ZInterStoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zlexcount
     */
    zlexcount = (...args) => new ZLexCountCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zmscore
     */
    zmscore = (...args) => new ZMScoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zpopmax
     */
    zpopmax = (...args) => new ZPopMaxCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zpopmin
     */
    zpopmin = (...args) => new ZPopMinCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zrange
     */
    zrange = (...args) => new ZRangeCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zrank
     */
    zrank = (key, member) => new ZRankCommand([key, member], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zrem
     */
    zrem = (key, ...members) => new ZRemCommand([key, ...members], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zremrangebylex
     */
    zremrangebylex = (...args) => new ZRemRangeByLexCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zremrangebyrank
     */
    zremrangebyrank = (...args) => new ZRemRangeByRankCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zremrangebyscore
     */
    zremrangebyscore = (...args) => new ZRemRangeByScoreCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zrevrank
     */
    zrevrank = (key, member) => new ZRevRankCommand([key, member], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zscan
     */
    zscan = (...args) => new ZScanCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zscore
     */
    zscore = (key, member) => new ZScoreCommand([key, member], this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zunion
     */
    zunion = (...args) => new ZUnionCommand(args, this.opts).exec(this.client);
    /**
     * @see https://redis.io/commands/zunionstore
     */
    zunionstore = (...args) => new ZUnionStoreCommand(args, this.opts).exec(this.client);
  };
  var VERSION3 = "v1.35.6";

  // node_modules/@upstash/redis/nodejs.mjs
  if (typeof atob === "undefined") {
    global.atob = (b64) => Buffer.from(b64, "base64").toString("utf8");
  }
  var Redis2 = class _Redis extends Redis {
    /**
     * Create a new redis client by providing a custom `Requester` implementation
     *
     * @example
     * ```ts
     *
     * import { UpstashRequest, Requester, UpstashResponse, Redis } from "@upstash/redis"
     *
     *  const requester: Requester = {
     *    request: <TResult>(req: UpstashRequest): Promise<UpstashResponse<TResult>> => {
     *      // ...
     *    }
     *  }
     *
     * const redis = new Redis(requester)
     * ```
     */
    constructor(configOrRequester) {
      if ("request" in configOrRequester) {
        super(configOrRequester);
        return;
      }
      if (!configOrRequester.url) {
        console.warn(
          `[Upstash Redis] The 'url' property is missing or undefined in your Redis config.`
        );
      } else if (configOrRequester.url.startsWith(" ") || configOrRequester.url.endsWith(" ") || /\r|\n/.test(configOrRequester.url)) {
        console.warn(
          "[Upstash Redis] The redis url contains whitespace or newline, which can cause errors!"
        );
      }
      if (!configOrRequester.token) {
        console.warn(
          `[Upstash Redis] The 'token' property is missing or undefined in your Redis config.`
        );
      } else if (configOrRequester.token.startsWith(" ") || configOrRequester.token.endsWith(" ") || /\r|\n/.test(configOrRequester.token)) {
        console.warn(
          "[Upstash Redis] The redis token contains whitespace or newline, which can cause errors!"
        );
      }
      const client = new HttpClient({
        baseUrl: configOrRequester.url,
        retry: configOrRequester.retry,
        headers: { authorization: `Bearer ${configOrRequester.token}` },
        agent: configOrRequester.agent,
        responseEncoding: configOrRequester.responseEncoding,
        cache: configOrRequester.cache ?? "no-store",
        signal: configOrRequester.signal,
        keepAlive: configOrRequester.keepAlive,
        readYourWrites: configOrRequester.readYourWrites
      });
      super(client, {
        automaticDeserialization: configOrRequester.automaticDeserialization,
        enableTelemetry: !process.env.UPSTASH_DISABLE_TELEMETRY,
        latencyLogging: configOrRequester.latencyLogging,
        enableAutoPipelining: configOrRequester.enableAutoPipelining
      });
      this.addTelemetry({
        runtime: (
          // @ts-expect-error to silence compiler
          typeof EdgeRuntime === "string" ? "edge-light" : `node@${process.version}`
        ),
        platform: process.env.UPSTASH_CONSOLE ? "console" : process.env.VERCEL ? "vercel" : process.env.AWS_REGION ? "aws" : "unknown",
        sdk: `@upstash/redis@${VERSION3}`
      });
      if (this.enableAutoPipelining) {
        return this.autoPipeline();
      }
    }
    /**
     * Create a new Upstash Redis instance from environment variables.
     *
     * Use this to automatically load connection secrets from your environment
     * variables. For instance when using the Vercel integration.
     *
     * This tries to load connection details from your environment using `process.env`:
     * - URL: `UPSTASH_REDIS_REST_URL` or fallback to `KV_REST_API_URL`
     * - Token: `UPSTASH_REDIS_REST_TOKEN` or fallback to `KV_REST_API_TOKEN`
     *
     * The fallback variables provide compatibility with Vercel KV and other platforms
     * that may use different naming conventions.
     */
    static fromEnv(config) {
      if (process.env === void 0) {
        throw new TypeError(
          '[Upstash Redis] Unable to get environment variables, `process.env` is undefined. If you are deploying to cloudflare, please import from "@upstash/redis/cloudflare" instead'
        );
      }
      const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
      if (!url) {
        console.warn("[Upstash Redis] Unable to find environment variable: `UPSTASH_REDIS_REST_URL`");
      }
      const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
      if (!token) {
        console.warn(
          "[Upstash Redis] Unable to find environment variable: `UPSTASH_REDIS_REST_TOKEN`"
        );
      }
      return new _Redis({ ...config, url, token });
    }
  };

  // node_modules/@vercel/kv/dist/index.js
  var _kv = null;
  process.env.UPSTASH_DISABLE_TELEMETRY = "1";
  var VercelKV = class extends Redis2 {
    // This API is based on https://github.com/redis/node-redis#scan-iterator which is not supported in @upstash/redis
    /**
     * Same as `scan` but returns an AsyncIterator to allow iteration via `for await`.
     */
    async *scanIterator(options) {
      let cursor = "0";
      let keys;
      do {
        [cursor, keys] = await this.scan(cursor, options);
        for (const key of keys) {
          yield key;
        }
      } while (cursor !== "0");
    }
    /**
     * Same as `hscan` but returns an AsyncIterator to allow iteration via `for await`.
     */
    async *hscanIterator(key, options) {
      let cursor = "0";
      let items;
      do {
        [cursor, items] = await this.hscan(key, cursor, options);
        for (const item of items) {
          yield item;
        }
      } while (cursor !== "0");
    }
    /**
     * Same as `sscan` but returns an AsyncIterator to allow iteration via `for await`.
     */
    async *sscanIterator(key, options) {
      let cursor = "0";
      let items;
      do {
        [cursor, items] = await this.sscan(key, cursor, options);
        for (const item of items) {
          yield item;
        }
      } while (cursor !== "0");
    }
    /**
     * Same as `zscan` but returns an AsyncIterator to allow iteration via `for await`.
     */
    async *zscanIterator(key, options) {
      let cursor = "0";
      let items;
      do {
        [cursor, items] = await this.zscan(key, cursor, options);
        for (const item of items) {
          yield item;
        }
      } while (cursor !== "0");
    }
  };
  function createClient(config) {
    return new VercelKV({
      // The Next.js team recommends no value or `default` for fetch requests's `cache` option
      // upstash/redis defaults to `no-store`, so we enforce `default`
      cache: "default",
      enableAutoPipelining: true,
      ...config
    });
  }
  var src_default = new Proxy(
    {},
    {
      get(target, prop, receiver) {
        if (prop === "then" || prop === "parse") {
          return Reflect.get(target, prop, receiver);
        }
        if (!_kv) {
          if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
            throw new Error(
              "@vercel/kv: Missing required environment variables KV_REST_API_URL and KV_REST_API_TOKEN"
            );
          }
          console.warn(
            '\x1B[33m"The default export has been moved to a named export and it will be removed in version 1, change to import { kv }\x1B[0m"'
          );
          _kv = createClient({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN
          });
        }
        return Reflect.get(_kv, prop);
      }
    }
  );
  var kv = new Proxy(
    {},
    {
      get(target, prop) {
        if (!_kv) {
          if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
            throw new Error(
              "@vercel/kv: Missing required environment variables KV_REST_API_URL and KV_REST_API_TOKEN"
            );
          }
          _kv = createClient({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN
          });
        }
        return Reflect.get(_kv, prop);
      }
    }
  );

  // edge-functions/translate.ts
  var VOLCANO_API_KEY = process.env.VOLCANO_API_KEY || "";
  var VOLCANO_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
  var callTencentTranslateAPI = async (text, from = "auto", to = "zh") => {
    const TENCENT_APP_ID = process.env.TENCENT_APP_ID || "";
    const TENCENT_APP_KEY = process.env.TENCENT_APP_KEY || "";
    const TENCENT_TRANSLATE_URL = process.env.TENCENT_TRANSLATE_URL || "https://api.ai.qq.com/fcgi-bin/nlp/nlp_texttranslate";
    if (!TENCENT_APP_ID || !TENCENT_APP_KEY) {
      throw new Error("\u817E\u8BAF\u7FFB\u8BD1API\u5BC6\u94A5\u672A\u914D\u7F6E");
    }
    const nonceStr = Math.random().toString(36).substr(2, 15);
    const timeStamp = Math.floor(Date.now() / 1e3).toString();
    const params = {
      app_id: TENCENT_APP_ID,
      nonce_str: nonceStr,
      time_stamp: timeStamp,
      text,
      source: from === "auto" ? "auto" : from,
      target: to
    };
    const sortedKeys = Object.keys(params).sort();
    let signStr = "";
    for (const key of sortedKeys) {
      signStr += `${key}=${params[key]}&`;
    }
    signStr += `app_key=${TENCENT_APP_KEY}`;
    const sign = crypto.createHash("md5").update(signStr).digest("hex").toUpperCase();
    params.sign = sign;
    try {
      const response = await axios_default.post(TENCENT_TRANSLATE_URL, new URLSearchParams(params));
      if (response.data.ret === 0 && response.data.data) {
        return response.data.data.target_text;
      } else {
        throw new Error(`\u817E\u8BAFAPI\u9519\u8BEF: ${response.data.msg || "\u672A\u77E5\u9519\u8BEF"}`);
      }
    } catch (error) {
      console.error("\u817E\u8BAF\u7FFB\u8BD1API\u8C03\u7528\u5931\u8D25:", error);
      throw error;
    }
  };
  var callVolcanoAPI = async (text, from = "auto", to = "zh") => {
    if (!VOLCANO_API_KEY) {
      throw new Error("\u706B\u5C71AI API\u5BC6\u94A5\u672A\u914D\u7F6E");
    }
    try {
      const targetLanguage = to === "zh" ? "\u4E2D\u6587" : to === "en" ? "\u82F1\u6587" : to;
      const messages = [
        {
          role: "system",
          content: "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u7FFB\u8BD1\u52A9\u624B\uFF0C\u5C06\u7528\u6237\u63D0\u4F9B\u7684\u6587\u672C\u7FFB\u8BD1\u6210\u6307\u5B9A\u8BED\u8A00\u3002\u53EA\u8FD4\u56DE\u7FFB\u8BD1\u7ED3\u679C\uFF0C\u4E0D\u8981\u6DFB\u52A0\u4EFB\u4F55\u89E3\u91CA\u6216\u5176\u4ED6\u5185\u5BB9\u3002"
        },
        {
          role: "user",
          content: `\u8BF7\u5C06\u4EE5\u4E0B\u6587\u672C\u7FFB\u8BD1\u6210${targetLanguage}\uFF1A

${text}`
        }
      ];
      const response = await axios_default.post(
        VOLCANO_API_URL,
        {
          model: "doubao-1-5-lite-32k-250115",
          messages
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${VOLCANO_API_KEY}`
          },
          timeout: 3e4
        }
      );
      return response.data.choices?.[0]?.message?.content || "";
    } catch (error) {
      console.error("\u706B\u5C71AI API\u8C03\u7528\u5931\u8D25:", error);
      throw error;
    }
  };
  function generateTranslationCacheKey(text, from, to) {
    const contentToHash = `${text}|${from}|${to}`;
    return `translation:${crypto.createHash("md5").update(contentToHash).digest("hex")}`;
  }
  async function getTranslationFromCache(text, from, to) {
    try {
      const cacheKey = generateTranslationCacheKey(text, from, to);
      const cachedTranslation = await kv.get(cacheKey);
      if (cachedTranslation) {
        console.log("\u4ECE\u7F13\u5B58\u83B7\u53D6\u7FFB\u8BD1\u7ED3\u679C");
        return cachedTranslation;
      }
      return null;
    } catch (error) {
      console.error("\u4ECE\u7F13\u5B58\u8BFB\u53D6\u7FFB\u8BD1\u5931\u8D25:", error);
      return null;
    }
  }
  async function cacheTranslationResult(text, from, to, translatedText) {
    try {
      const cacheKey = generateTranslationCacheKey(text, from, to);
      await kv.set(cacheKey, translatedText, { ex: 2592e3 });
      console.log("\u7FFB\u8BD1\u7ED3\u679C\u5DF2\u7F13\u5B58");
    } catch (error) {
      console.error("\u7F13\u5B58\u7FFB\u8BD1\u7ED3\u679C\u5931\u8D25:", error);
    }
  }
  async function onRequest(context) {
    const { request } = context;
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers
      });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
          ...headers,
          "Content-Type": "application/json"
        }
      });
    }
    try {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        console.error("\u89E3\u6790\u8BF7\u6C42\u4F53\u5931\u8D25:", e);
        body = {};
      }
      const { text, from = "auto", to = "zh", skipCache = false } = body;
      if (!text || typeof text !== "string") {
        return new Response(JSON.stringify({ error: "\u7FFB\u8BD1\u6587\u672C\u4E0D\u80FD\u4E3A\u7A7A" }), {
          status: 400,
          headers: {
            ...headers,
            "Content-Type": "application/json"
          }
        });
      }
      if (text.length > 1e3) {
        return new Response(JSON.stringify({ error: "\u7FFB\u8BD1\u6587\u672C\u8FC7\u957F" }), {
          status: 400,
          headers: {
            ...headers,
            "Content-Type": "application/json"
          }
        });
      }
      if (!skipCache) {
        const cachedTranslation = await getTranslationFromCache(text, from, to);
        if (cachedTranslation) {
          return new Response(JSON.stringify({
            translatedText: cachedTranslation,
            from,
            to,
            provider: "cache",
            fromCache: true
          }), {
            status: 200,
            headers: {
              ...headers,
              "Content-Type": "application/json"
            }
          });
        }
      }
      let translatedText;
      let provider;
      const TENCENT_APP_ID = process.env.TENCENT_APP_ID || "";
      const TENCENT_APP_KEY = process.env.TENCENT_APP_KEY || "";
      if (TENCENT_APP_ID && TENCENT_APP_KEY) {
        try {
          translatedText = await callTencentTranslateAPI(text, from, to);
          provider = "tencent";
          await cacheTranslationResult(text, from, to, translatedText);
          return new Response(JSON.stringify({
            translatedText,
            from,
            to,
            provider,
            fromCache: false
          }), {
            status: 200,
            headers: {
              ...headers,
              "Content-Type": "application/json"
            }
          });
        } catch (tencentError) {
          console.error("\u817E\u8BAF\u7FFB\u8BD1API\u8C03\u7528\u5931\u8D25:", tencentError);
        }
      }
      provider = "volcano";
      translatedText = await callVolcanoAPI(text, from, to);
      await cacheTranslationResult(text, from, to, translatedText);
      return new Response(JSON.stringify({
        translatedText,
        from,
        to,
        provider,
        fromCache: false
      }), {
        status: 200,
        headers: {
          ...headers,
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      console.error("\u7FFB\u8BD1\u5904\u7406\u5931\u8D25:", error);
      return new Response(JSON.stringify({
        error: "\u7FFB\u8BD1\u5931\u8D25",
        message: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: {
          ...headers,
          "Content-Type": "application/json"
        }
      });
    }
  }

        pagesFunctionResponse = onRequest;
      })();
          }
        

        const params = {};
        if (routeParams.id) {
          if (routeParams.mode === 1) {
            const value = urlInfo.pathname.match(routeParams.left);        
            for (let i = 1; i < value.length; i++) {
              params[routeParams.id[i - 1]] = value[i];
            }
          } else {
            const value = urlInfo.pathname.replace(routeParams.left, '');
            const splitedValue = value.split('/');
            if (splitedValue.length === 1) {
              params[routeParams.id] = splitedValue[0];
            } else {
              params[routeParams.id] = splitedValue;
            }
          }
          
        }
        if(!matchedFunc){
          pagesFunctionResponse = function() {
            return new Response(null, {
              status: 404,
              headers: {
                "content-type": "text/html; charset=UTF-8",
                "x-edgefunctions-test": "Welcome to use Pages Functions.",
              },
            });
          }
        }
        return pagesFunctionResponse({request, params, env: {"AHA_CHROME_CRASHPAD_PIPE_NAME":"\\\\.\\pipe\\crashpad_8632_ADOEJNXYTXFCKIRM","ALLUSERSPROFILE":"C:\\ProgramData","APPDATA":"C:\\Users\\suo10\\AppData\\Roaming","COLOR":"1","COLORTERM":"truecolor","CommonProgramFiles":"C:\\Program Files\\Common Files","CommonProgramFiles(x86)":"C:\\Program Files (x86)\\Common Files","CommonProgramW6432":"C:\\Program Files\\Common Files","COMPUTERNAME":"DESKTOP-6222K54","ComSpec":"C:\\WINDOWS\\system32\\cmd.exe","DriverData":"C:\\Windows\\System32\\Drivers\\DriverData","EDITOR":"C:\\WINDOWS\\notepad.exe","EFC_8472_1592913036":"1","FPS_BROWSER_APP_PROFILE_STRING":"Internet Explorer","FPS_BROWSER_USER_PROFILE_STRING":"Default","GIT_ASKPASS":"c:\\Users\\suo10\\AppData\\Local\\Programs\\Trae CN\\resources\\app\\extensions\\git\\dist\\askpass.sh","HOME":"C:\\Users\\suo10","HOMEDRIVE":"C:","HOMEPATH":"\\Users\\suo10","INIT_CWD":"D:\\cloze_test","LANG":"zh_CN.UTF-8","LOCALAPPDATA":"C:\\Users\\suo10\\AppData\\Local","LOGONSERVER":"\\\\DESKTOP-6222K54","NODE":"C:\\Program Files\\nodejs\\node.exe","npm_command":"exec","npm_config_cache":"C:\\Users\\suo10\\AppData\\Local\\npm-cache","npm_config_globalconfig":"C:\\Users\\suo10\\AppData\\Roaming\\npm\\etc\\npmrc","npm_config_global_prefix":"C:\\Users\\suo10\\AppData\\Roaming\\npm","npm_config_init_module":"C:\\Users\\suo10\\.npm-init.js","npm_config_local_prefix":"D:\\cloze_test","npm_config_node_gyp":"C:\\Program Files\\nodejs\\node_modules\\npm\\node_modules\\node-gyp\\bin\\node-gyp.js","npm_config_noproxy":"","npm_config_npm_version":"10.9.2","npm_config_prefix":"C:\\Users\\suo10\\AppData\\Roaming\\npm","npm_config_userconfig":"C:\\Users\\suo10\\.npmrc","npm_config_user_agent":"npm/10.9.2 node/v22.17.1 win32 x64 workspaces/false","npm_execpath":"C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js","npm_lifecycle_event":"npx","npm_lifecycle_script":"edgeone","npm_node_execpath":"C:\\Program Files\\nodejs\\node.exe","npm_package_json":"D:\\cloze_test\\package.json","npm_package_name":"cloze_test","npm_package_version":"0.0.0","NUMBER_OF_PROCESSORS":"4","OneDrive":"C:\\Users\\suo10\\OneDrive","ORIGINAL_XDG_CURRENT_DESKTOP":"undefined","OS":"Windows_NT","Path":"C:\\Users\\suo10\\AppData\\Local\\npm-cache\\_npx\\00df61ab4d846258\\node_modules\\.bin;D:\\cloze_test\\node_modules\\.bin;D:\\node_modules\\.bin;C:\\Program Files\\nodejs\\node_modules\\npm\\node_modules\\@npmcli\\run-script\\lib\\node-gyp-bin;c:\\\\Users\\\\suo10\\\\.trae-cn\\\\sdks\\\\workspaces\\\\006cbf83\\\\versions\\\\node\\\\current;c:\\\\Users\\\\suo10\\\\.trae-cn\\\\sdks\\\\versions\\\\node\\\\current;c:\\Users\\suo10\\.trae-cn\\sdks\\workspaces\\006cbf83\\versions\\node\\current;c:\\Users\\suo10\\.trae-cn\\sdks\\versions\\node\\current;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program Files (x86)\\NVIDIA Corporation\\PhysX\\Common;C:\\Program Files\\NVIDIA Corporation\\NVIDIA NvDLISR;C:\\Program Files\\Git\\cmd;C:\\Windows\\System32\\;C:\\Program Files\\nodejs\\;C:\\Users\\suo10\\AppData\\Local\\Programs\\Python\\Python313\\Scripts\\;C:\\Users\\suo10\\AppData\\Local\\Programs\\Python\\Python313\\;C:\\Users\\suo10\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\suo10\\AppData\\Local\\Programs\\cursor\\resources\\app\\bin;C:\\Users\\suo10\\AppData\\Roaming\\npm;C:\\Users\\suo10\\AppData\\Local\\Microsoft\\WindowsApps","PATHEXT":".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL","PROCESSOR_ARCHITECTURE":"AMD64","PROCESSOR_IDENTIFIER":"Intel64 Family 6 Model 158 Stepping 11, GenuineIntel","PROCESSOR_LEVEL":"6","PROCESSOR_REVISION":"9e0b","ProgramData":"C:\\ProgramData","ProgramFiles":"C:\\Program Files","ProgramFiles(x86)":"C:\\Program Files (x86)","ProgramW6432":"C:\\Program Files","PROMPT":"$P$G","PSModulePath":"C:\\Users\\suo10\\Documents\\WindowsPowerShell\\Modules;C:\\Program Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules","PUBLIC":"C:\\Users\\Public","PYTHONSTARTUP":"c:\\Users\\suo10\\AppData\\Roaming\\Trae CN\\User\\workspaceStorage\\006cbf83cc796a47b021867fbebbaa4b\\ms-python.python\\pythonrc.py","PYTHON_BASIC_REPL":"1","SESSIONNAME":"Console","SystemDrive":"C:","SystemRoot":"C:\\WINDOWS","TEMP":"C:\\Users\\suo10\\AppData\\Local\\Temp","TERM_PRODUCT":"Trae","TERM_PROGRAM":"vscode","TERM_PROGRAM_VERSION":"1.104.3","TMP":"C:\\Users\\suo10\\AppData\\Local\\Temp","TRAE_AI_SHELL_ID":"5","USERDOMAIN":"DESKTOP-6222K54","USERDOMAIN_ROAMINGPROFILE":"DESKTOP-6222K54","USERNAME":"suo10","USERPROFILE":"C:\\Users\\suo10","VITE_BAIDU_APP_ID":"20240318001996811","VITE_BAIDU_SECRET_KEY":"60gNiWXnKLq5rAi_e0In","VITE_VOLCANO_API_KEY":"31fb0b92-d606-48ec-827b-45cf2feaa65a","VITE_VOLCANO_API_URL":"https://ark.cn-beijing.volces.com/api/v3/chat/completions","VSCODE_GIT_ASKPASS_EXTRA_ARGS":"","VSCODE_GIT_ASKPASS_MAIN":"c:\\Users\\suo10\\AppData\\Local\\Programs\\Trae CN\\resources\\app\\extensions\\git\\dist\\askpass-main.js","VSCODE_GIT_ASKPASS_NODE":"C:\\Users\\suo10\\AppData\\Local\\Programs\\Trae CN\\Trae CN.exe","VSCODE_GIT_IPC_HANDLE":"\\\\.\\pipe\\vscode-git-12793b60f8-sock","VSCODE_INJECTION":"1","VSCODE_PYTHON_AUTOACTIVATE_GUARD":"1","windir":"C:\\WINDOWS"}, waitUntil });
      }
      addEventListener('fetch', event=>{return event.respondWith(handleRequest({request:event.request,params: {}, env: {"AHA_CHROME_CRASHPAD_PIPE_NAME":"\\\\.\\pipe\\crashpad_8632_ADOEJNXYTXFCKIRM","ALLUSERSPROFILE":"C:\\ProgramData","APPDATA":"C:\\Users\\suo10\\AppData\\Roaming","COLOR":"1","COLORTERM":"truecolor","CommonProgramFiles":"C:\\Program Files\\Common Files","CommonProgramFiles(x86)":"C:\\Program Files (x86)\\Common Files","CommonProgramW6432":"C:\\Program Files\\Common Files","COMPUTERNAME":"DESKTOP-6222K54","ComSpec":"C:\\WINDOWS\\system32\\cmd.exe","DriverData":"C:\\Windows\\System32\\Drivers\\DriverData","EDITOR":"C:\\WINDOWS\\notepad.exe","EFC_8472_1592913036":"1","FPS_BROWSER_APP_PROFILE_STRING":"Internet Explorer","FPS_BROWSER_USER_PROFILE_STRING":"Default","GIT_ASKPASS":"c:\\Users\\suo10\\AppData\\Local\\Programs\\Trae CN\\resources\\app\\extensions\\git\\dist\\askpass.sh","HOME":"C:\\Users\\suo10","HOMEDRIVE":"C:","HOMEPATH":"\\Users\\suo10","INIT_CWD":"D:\\cloze_test","LANG":"zh_CN.UTF-8","LOCALAPPDATA":"C:\\Users\\suo10\\AppData\\Local","LOGONSERVER":"\\\\DESKTOP-6222K54","NODE":"C:\\Program Files\\nodejs\\node.exe","npm_command":"exec","npm_config_cache":"C:\\Users\\suo10\\AppData\\Local\\npm-cache","npm_config_globalconfig":"C:\\Users\\suo10\\AppData\\Roaming\\npm\\etc\\npmrc","npm_config_global_prefix":"C:\\Users\\suo10\\AppData\\Roaming\\npm","npm_config_init_module":"C:\\Users\\suo10\\.npm-init.js","npm_config_local_prefix":"D:\\cloze_test","npm_config_node_gyp":"C:\\Program Files\\nodejs\\node_modules\\npm\\node_modules\\node-gyp\\bin\\node-gyp.js","npm_config_noproxy":"","npm_config_npm_version":"10.9.2","npm_config_prefix":"C:\\Users\\suo10\\AppData\\Roaming\\npm","npm_config_userconfig":"C:\\Users\\suo10\\.npmrc","npm_config_user_agent":"npm/10.9.2 node/v22.17.1 win32 x64 workspaces/false","npm_execpath":"C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js","npm_lifecycle_event":"npx","npm_lifecycle_script":"edgeone","npm_node_execpath":"C:\\Program Files\\nodejs\\node.exe","npm_package_json":"D:\\cloze_test\\package.json","npm_package_name":"cloze_test","npm_package_version":"0.0.0","NUMBER_OF_PROCESSORS":"4","OneDrive":"C:\\Users\\suo10\\OneDrive","ORIGINAL_XDG_CURRENT_DESKTOP":"undefined","OS":"Windows_NT","Path":"C:\\Users\\suo10\\AppData\\Local\\npm-cache\\_npx\\00df61ab4d846258\\node_modules\\.bin;D:\\cloze_test\\node_modules\\.bin;D:\\node_modules\\.bin;C:\\Program Files\\nodejs\\node_modules\\npm\\node_modules\\@npmcli\\run-script\\lib\\node-gyp-bin;c:\\\\Users\\\\suo10\\\\.trae-cn\\\\sdks\\\\workspaces\\\\006cbf83\\\\versions\\\\node\\\\current;c:\\\\Users\\\\suo10\\\\.trae-cn\\\\sdks\\\\versions\\\\node\\\\current;c:\\Users\\suo10\\.trae-cn\\sdks\\workspaces\\006cbf83\\versions\\node\\current;c:\\Users\\suo10\\.trae-cn\\sdks\\versions\\node\\current;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program Files (x86)\\NVIDIA Corporation\\PhysX\\Common;C:\\Program Files\\NVIDIA Corporation\\NVIDIA NvDLISR;C:\\Program Files\\Git\\cmd;C:\\Windows\\System32\\;C:\\Program Files\\nodejs\\;C:\\Users\\suo10\\AppData\\Local\\Programs\\Python\\Python313\\Scripts\\;C:\\Users\\suo10\\AppData\\Local\\Programs\\Python\\Python313\\;C:\\Users\\suo10\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\suo10\\AppData\\Local\\Programs\\cursor\\resources\\app\\bin;C:\\Users\\suo10\\AppData\\Roaming\\npm;C:\\Users\\suo10\\AppData\\Local\\Microsoft\\WindowsApps","PATHEXT":".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL","PROCESSOR_ARCHITECTURE":"AMD64","PROCESSOR_IDENTIFIER":"Intel64 Family 6 Model 158 Stepping 11, GenuineIntel","PROCESSOR_LEVEL":"6","PROCESSOR_REVISION":"9e0b","ProgramData":"C:\\ProgramData","ProgramFiles":"C:\\Program Files","ProgramFiles(x86)":"C:\\Program Files (x86)","ProgramW6432":"C:\\Program Files","PROMPT":"$P$G","PSModulePath":"C:\\Users\\suo10\\Documents\\WindowsPowerShell\\Modules;C:\\Program Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules","PUBLIC":"C:\\Users\\Public","PYTHONSTARTUP":"c:\\Users\\suo10\\AppData\\Roaming\\Trae CN\\User\\workspaceStorage\\006cbf83cc796a47b021867fbebbaa4b\\ms-python.python\\pythonrc.py","PYTHON_BASIC_REPL":"1","SESSIONNAME":"Console","SystemDrive":"C:","SystemRoot":"C:\\WINDOWS","TEMP":"C:\\Users\\suo10\\AppData\\Local\\Temp","TERM_PRODUCT":"Trae","TERM_PROGRAM":"vscode","TERM_PROGRAM_VERSION":"1.104.3","TMP":"C:\\Users\\suo10\\AppData\\Local\\Temp","TRAE_AI_SHELL_ID":"5","USERDOMAIN":"DESKTOP-6222K54","USERDOMAIN_ROAMINGPROFILE":"DESKTOP-6222K54","USERNAME":"suo10","USERPROFILE":"C:\\Users\\suo10","VITE_BAIDU_APP_ID":"20240318001996811","VITE_BAIDU_SECRET_KEY":"60gNiWXnKLq5rAi_e0In","VITE_VOLCANO_API_KEY":"31fb0b92-d606-48ec-827b-45cf2feaa65a","VITE_VOLCANO_API_URL":"https://ark.cn-beijing.volces.com/api/v3/chat/completions","VSCODE_GIT_ASKPASS_EXTRA_ARGS":"","VSCODE_GIT_ASKPASS_MAIN":"c:\\Users\\suo10\\AppData\\Local\\Programs\\Trae CN\\resources\\app\\extensions\\git\\dist\\askpass-main.js","VSCODE_GIT_ASKPASS_NODE":"C:\\Users\\suo10\\AppData\\Local\\Programs\\Trae CN\\Trae CN.exe","VSCODE_GIT_IPC_HANDLE":"\\\\.\\pipe\\vscode-git-12793b60f8-sock","VSCODE_INJECTION":"1","VSCODE_PYTHON_AUTOACTIVATE_GUARD":"1","windir":"C:\\WINDOWS"}, waitUntil: event.waitUntil }))});