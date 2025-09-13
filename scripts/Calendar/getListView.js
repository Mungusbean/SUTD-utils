Modules.Calendar.getListView = function () {
  return new Promise((resolve, reject) => {
    try {
      let tries = 0;
      let sched_listview = null;
      let resolved = false;

      let interval = setInterval(() => {
        let iframe = document.querySelector("iframe");
        if (iframe && iframe.contentDocument) {
          clearInterval(interval);
          let doc = iframe.contentDocument;

          if (!doc) {
            reject(new Error("Iframe inaccessible"));
            return;
          }

          let button = doc.getElementById("DERIVED_REGFRM1_SSR_SCHED_FORMAT$258$");
          if (!button) {
            reject(new Error("Unable to find listview button"));
            return;
          }

          console.log("%cClicking listview button…", "color:green;font-weight:bold;");
          button.click();

          let handled = false;

          // Case 1: iframe reload
          iframe.addEventListener("load", function onLoad() {
            if (handled || resolved) return;
            handled = true;

            let newDoc = iframe.contentDocument;
            if (!newDoc) {
              reject(new Error("Iframe reloaded but contentDocument is null"));
              return;
            }

            sched_listview = newDoc.getElementById("ACE_STDNT_ENRL_SSV2$0");
            if (sched_listview) {
              console.log("%cFound listview element after reload", "color:green;font-weight:bold;");
              // sched_listview.style.outline = "3px solid green"; //DEBUG
              resolved = true;
              resolve(sched_listview);
            } else {
              reject(new Error("Listview element not found after reload"));
            }
          });

          // Case 2: already in list view
          setTimeout(() => {
            if (handled || resolved) return;

            sched_listview = iframe.contentDocument.getElementById("ACE_STDNT_ENRL_SSV2$0");
            if (sched_listview) {
              console.log("%cAlready in listview, found element", "color:green;font-weight:bold;");
              // sched_listview.style.outline = "3px solid orange"; //DEBUG
              resolved = true;
              resolve(sched_listview);
            } else {
              console.warn("Still waiting for listview element…"); // DO NOT REJECT HERE (rejected here breaks the function when we are not already in list view (we have 2 possible promise cases))
            }
          }, 1000);
        }

        tries++;
        if (tries > 20 && !resolved) {
          clearInterval(interval);
          reject(new Error("Iframe never became accessible"));
        }
      }, 500);
    } catch (e) {
      reject(e);
    }
  });
};
