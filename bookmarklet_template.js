javascript:(function(){
  function run() {
    Loader.baseUrl = "base_url";
    Loader.loadNamespace("namespace").then(() => {
      Modules.Calendar.main();
    });
  }

  if (!window.Loader) {
    var s = document.createElement("script");
    s.src = "https://mungusbean.github.io/SUTD-utils/loader.js?v=" + Date.now();
    s.onload = run;
    document.head.appendChild(s);
  } else {
    run();
  }
})();
