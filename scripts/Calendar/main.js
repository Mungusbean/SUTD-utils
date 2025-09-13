Modules.Calendar.main = async function () {
  try {
    console.log("%c[Main]%c Starting calendar extraction…",
      "color:green;font-weight:bold;", "color:white;");

    // get the schedule table (Promise-based) Thanks GPT
    let table = await Modules.Calendar.getListView();
    if (!table) {
      console.error("%c[Main]%c No schedule table found", "color:red;font-weight:bold;", "color:white;");
      return;
    }

    // parse table into ICS format
    let icsContent = Modules.Calendar.parseScheduleTable(table);
    if (!icsContent) {
      console.error("%c[Main]%c Failed to generate ICS content", "color:red;font-weight:bold;", "color:white;");
      return;
    }

    // trigger download
    let blob = new Blob([icsContent], { type: "text/calendar" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "weekly_schedule.ics"; // filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    console.log("%c[Main]%c Calendar exported successfully as weekly_schedule.ics",
      "color:green;font-weight:bold;", "color:white;");
  } catch (err) {
    console.error("%c[Main]%c Error during execution:", "color:red;font-weight:bold;", "color:white;", err);
  }
};
