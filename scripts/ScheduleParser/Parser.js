var Parser = (function () {
    function parseScheduleTable(table) {
        if (!table) {
            console.log("%c[Parser]%c No table element provided", "color:red;font-weight:bold;", "color:white;");
            return null;
        }

        let rows = Array.from(table.querySelectorAll("tr"));
        let results = [];

        rows.forEach((row, idx) => {
            let cells = Array.from(row.querySelectorAll("td")).map(td => td.innerText.trim());
            if (cells.length > 0) {
                results.push(cells);
            }
        });

    }
})();