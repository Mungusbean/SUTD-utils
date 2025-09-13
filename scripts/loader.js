// Set up globals should only be run once
window.Modules = window.Modules || {};
window.ModuleStatus = window.ModuleStatus || {};

// Loader singleton
window.Loader = window.Loader || {};
Loader.promises = Loader.promises || {};

/**
 * Load a namespace (modules + dependencies + entrypoint).
 * @param {string} namespace
 * @returns {Promise<void>}
 */
Loader.loadNamespace = function (namespace) {
  // Check if a module is already loaded
  if (window.ModuleStatus[namespace] === "loaded") {
    console.log(`[Loader] ${namespace} already loaded`);
    return Promise.resolve();
  }

  // In progress we have a pending namespace promise (return it again)
  if (Loader.promises[namespace]) {
    return Loader.promises[namespace];
  }

  console.log(`[Loader] Loading ${namespace}...`);
  window.ModuleStatus[namespace] = "pending";

  // Construct manifest URL
  const baseUrl = Loader.baseUrl || ""; // Loader.baseUrl will be set in the bookmarklet by the time this function is called
  const manifestUrl = `${baseUrl}/${namespace}/manifest.json`;

  let promise = fetch(manifestUrl)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to fetch manifest for ${namespace}`);
      return res.json();
    })
    .then(manifest => {
      if (!manifest.namespace) throw new Error("Manifest missing namespace");

      // Ensure namespace exists
      if (!window.Modules[manifest.namespace]) {
        window.Modules[manifest.namespace] = {};
      }

      // Load dependencies first
      let depPromises = (manifest.dependencies || []).map(dep =>
        Loader.loadNamespace(dep)
      );

      return Promise.all(depPromises).then(() => manifest);
    })
    .then(manifest => {
      // Load module files
      let modulePromises = (manifest.modules || []).map(file =>
        Loader.loadScript(`${baseUrl}/${manifest.namespace}/${file}`)
      );

      return Promise.all(modulePromises).then(() => manifest);
    })
    .then(manifest => {
      // Load entrypoint if defined
      if (manifest.entrypoint) {
        return Loader.loadScript(`${baseUrl}/${manifest.namespace}/${manifest.entrypoint}`)
          .then(() => manifest);
      }
      return manifest;
    })
    .then(manifest => {
      window.ModuleStatus[manifest.namespace] = "loaded";
      console.log(`[Loader] ${manifest.namespace} loaded successfully`);
    })
    .catch(err => {
      window.ModuleStatus[namespace] = "error";
      console.error(`[Loader] Failed to load ${namespace}:`, err);
      throw err;
    });

  Loader.promises[namespace] = promise;
  return promise;
};

/**
 * Injects a <script> tag for a given URL.
 * @param {string} url
 * @returns {Promise<void>}
 */
Loader.loadScript = function (url) {
  return new Promise((resolve, reject) => {
    let s = document.createElement("script");
    s.src = url;
    s.async = false; // preserve order
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(s);
  });
};
