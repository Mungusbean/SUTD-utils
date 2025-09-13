Modules.Calendar.getListView = function () {
  return new Promise((resolve, reject) => {
    try {
      let tries = 0;
      let sched_listview = null;

      let interval = setInterval(() => {
        let iframe = document.querySelector("iframe");
        if (iframe && iframe.contentDocument) {
          clearInterval(interval); // stop polling once iframe is found
          let doc = iframe.contentDocument;

          if (!doc) {
            reject(new Error("Iframe inaccessible"));
            return;
          }

          // Try to find the button
          let button = doc.getElementById("DERIVED_REGFRM1_SSR_SCHED_FORMAT$258$");
          if (!button) {
            reject(new Error("Unable to find listview button"));
            return;
          }

          console.log("%cClicking listview button…", "color:green;font-weight:bold;");
          button.click();

          let handled = false;

          // Case 1: handle reload
          iframe.addEventListener("load", function onLoad() {
            if (handled) return;
            handled = true;
            iframe.removeEventListener("load", onLoad);

            let newDoc = iframe.contentDocument;
            if (!newDoc) {
              reject(new Error("Iframe reloaded but contentDocument is null"));
              return;
            }

            sched_listview = newDoc.getElementById("ACE_STDNT_ENRL_SSV2$0");
            if (sched_listview) {
              console.log("%cFound listview element after reload", "color:green;font-weight:bold;");
              sched_listview.style.outline = "3px solid green";
              resolve(sched_listview);
            } else {
              reject(new Error("Listview element not found after reload"));
            }
          });

          // Case 2: already in list view (no reload)
          setTimeout(() => {
            if (handled) return;
            sched_listview = iframe.contentDocument.getElementById("ACE_STDNT_ENRL_SSV2$0");
            if (sched_listview) {
              console.log("%cAlready in listview, found element", "color:green;font-weight:bold;");
              sched_listview.style.outline = "3px solid orange";
              handled = true;
              resolve(sched_listview);
            } else {
              reject(new Error("No reload occurred and listview element not found"));
            }
          }, 1000);
        }

        tries++;
        if (tries > 20) {
          clearInterval(interval);
          reject(new Error("Iframe never became accessible"));
        }
      }, 500);
    } catch (e) {
      reject(e);
    }
  });
};
