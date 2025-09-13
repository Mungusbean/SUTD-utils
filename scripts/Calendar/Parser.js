Modules.Calendar.parseScheduleTable = function(table) {
    if (!table) {
        console.log("%c[Parser]%c No table element provided", "color:red;font-weight:bold;", "color:white;");
        return null;
    }

    function alignStartDateToDay(startDate, byDay) { // Ty GPT again
        const dayIndexMap = { SU:0, MO:1, TU:2, WE:3, TH:4, FR:5, SA:6 };
        const target = dayIndexMap[byDay];
        const current = startDate.getUTCDay();
        startDate.setDate(startDate.getDate() + (target - current + 7)%7);
        return startDate;
    }

    const classname_numcells = 1;
    const classtimes_numcells = 7;

    function isClassName(cols) {
        return cols.length === classname_numcells && cols[0].trim().length !== 0;
    }

    function isClassTimes(cols) {
        return cols.length === classtimes_numcells;
    }

    let rows = Array.from(table.querySelectorAll("tr"))
        .map(r => Array.from(r.querySelectorAll("td")).map(td => td.innerText.trim()))
        .filter(cols => isClassName(cols) || isClassTimes(cols));

    let icsEvents = [];
    let curr_classname = "";

    for (const cols of rows) {
        if (isClassName(cols)) {
            curr_classname = cols[0];
            continue;
        }

        if (isClassTimes(cols)) {
            let days_and_time = cols[3];
            let room = cols[4];
            let instructor = cols[5];
            let start_end = cols[6];

            let dayMatch = days_and_time.match(/^(\w{2})\s+(\d{1,2}:\d{2}[AP]M)\s*-\s*(\d{1,2}:\d{2}[AP]M)$/);
            if (!dayMatch) continue;
            let dayAbbr = dayMatch[1];
            let startTimeStr = dayMatch[2];
            let endTimeStr = dayMatch[3];

            let byDay = dayAbbr.toUpperCase();

            let dateMatch = start_end.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*-\s*(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (!dateMatch) continue;

            let startDay = dateMatch[1].padStart(2, "0");
            let startMonth = dateMatch[2].padStart(2, "0");
            let startYear = dateMatch[3];
            let endDay = dateMatch[4].padStart(2, "0");
            let endMonth = dateMatch[5].padStart(2, "0");
            let endYear = dateMatch[6];

            let startDate = alignStartDateToDay(new Date(`${startYear}-${startMonth}-${startDay}T00:00:00`), byDay);
            let endDate = new Date(`${endYear}-${endMonth}-${endDay}T00:00:00`);
            endDate.setHours(23, 59, 59, 0);

            function formatDateTime(date, timeStr) {
                let [_, h, m, ampm] = timeStr.match(/(\d{1,2}):(\d{2})(AM|PM)/);
                h = parseInt(h, 10);
                if (ampm === "PM" && h < 12) h += 12;
                if (ampm === "AM" && h === 12) h = 0;

                let dt = new Date(date);
                dt.setHours(h, parseInt(m), 0, 0);

                return dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
            }

            let dtStart = formatDateTime(startDate, startTimeStr);
            let dtEnd = formatDateTime(startDate, endTimeStr);
            let until = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

            // Thanks GPT
            let event = [
                "BEGIN:VEVENT",
                `UID:${curr_classname}-${dtStart}@customcalendar`,
                `SUMMARY:${curr_classname}`,
                `DTSTART:${dtStart}`,
                `DTEND:${dtEnd}`,
                `LOCATION:${room}`,
                `DESCRIPTION:${instructor}`,
                `RRULE:FREQ=WEEKLY;UNTIL=${until};BYDAY=${byDay}`,
                "END:VEVENT"
            ].join("\n");

            icsEvents.push(event);
        }
    }

    let icsFile = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//CustomCalendar//EN",
        ...icsEvents,
        "END:VCALENDAR"
    ].join("\n");

    console.log("ICS Output:\n", icsFile);
    return icsFile;
};
