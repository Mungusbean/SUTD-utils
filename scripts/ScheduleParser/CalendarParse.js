(function () {
  try {
    var tries = 0;
    var sched_listview = null; // declare once, fill later

    var interval = setInterval(function () {
      var iframe = document.querySelector("iframe");
      if (iframe && iframe.contentDocument) {
        clearInterval(interval);
        var doc = iframe.contentDocument;

        if (!doc) {
          console.log("%cIframe inaccessible", "color:red;font-weight:bold;");
          return;
        }

        // Try to find the button
        var button = doc.getElementById("DERIVED_REGFRM1_SSR_SCHED_FORMAT$258$");
        if (!button) {
          console.log("%cUnable to find listview button", "color:red;font-weight:bold;");
          return;
        }

        console.log("%cClicking listview button…", "color:green;font-weight:bold;");
        button.click();

        var handled = false;

        // Case 1: handle reload
        iframe.addEventListener("load", function onLoad() {
          if (handled) return;
          handled = true;
          iframe.removeEventListener("load", onLoad);

          var newDoc = iframe.contentDocument;
          if (!newDoc) {
            console.log("%cIframe reloaded but contentDocument is null", "color:red;font-weight:bold;");
            return;
          }

          sched_listview = newDoc.getElementById("ACE_STDNT_ENRL_SSV2$0");
          if (sched_listview) {
            console.log("%cFound listview element after reload", "color:green;font-weight:bold;");
            sched_listview.style.outline = "3px solid green";
          } else {
            console.log("%cListview element not found after reload", "color:red;font-weight:bold;");
          }
        });

        // Case 2: already in list view, iframe will not reload it's contentdocument
        setTimeout(function () {
          if (handled) return;

          sched_listview = iframe.contentDocument.getElementById("ACE_STDNT_ENRL_SSV2$0");
          if (sched_listview) {
            console.log("%cAlready in listview, found element", "color:green;font-weight:bold;");
            sched_listview.style.outline = "3px solid orange";
            handled = true;
          } else {
            console.log("%cNo reload occurred and listview element not found", "color:red;font-weight:bold;");
          }
        }, 1000);

        // Final null check
        setTimeout(function () {
          if (sched_listview) {
            console.log("%cProceeding with parsing", "color:green;font-weight:bold;");
            
            
          } else {
            console.log("%cParsing aborted: listview element not available", "color:red;font-weight:bold;");
          }
        }, 2000);
      }

      tries++;
      if (tries > 20) {
        clearInterval(interval);
        console.log("%cIframe never became accessible", "color:red;font-weight:bold;");
      }
    }, 500);
  } catch (e) {
    console.log("%cError:%c " + e, "color:red;font-weight:bold;", "color:white;");
  }
})();
