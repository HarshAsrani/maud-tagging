function processHTML(text) {
  // console.log("Start to insert the html text");
  let dom;
  const parser = new DOMParser();
  dom = parser.parseFromString(text, 'text/html');
  const htmlPreview = document.getElementById('html-preview');
  htmlPreview.innerHTML = text;
  // console.log("Successfully insert html text");
}

function processCSV(text) {
  const csvRows = text.trim().split('\n').map(row => row.replace(/\r$/, ''));
  const csvData = parseCSV(csvRows.join('\n'));
  // console.log(csvData);
  checkCSV(csvData);
  // Assuming the CSV has comma-separated values
  // Now you can process the CSV data (e.g., display, parse, etc.)
  // console.log("Successfully extract csv text");
  return csvData;
}

function checkCSV(csvData) {
  // for (let i = 1; i < csvData.length; i++) {
  i = 0
  for (const csvRow of csvData.slice(1)) {
    i++;
    // console.log(csvRow);
    if (csvRow.length < 6 || (csvRow[5] !== "o" && csvRow[3].trim() == "")) {
      // console.log(csvRow);
      const paragraph = document.getElementById("visualization-status");
      paragraph.innerHTML = "Fail to visualize. Original CSV file exists error on line "+i;
      paragraph.style.color = "red";
      throw new Error("CSV file exists error.");
    }
  }
}
  
function parseCSV(csv) {
    xpaths = []
    texts = []
    highlighted_xpaths = []
    sTexts = []
    tagged_sequence = []
    console.log('Aaya CSV Parser Call');
    // const regex = /(\s*"[^"]+"\s*|\s*[^,]+|,)(?=,|$)/g;
    const lines = csv.split('\n');
    const data = [];
  
    for (let i = 0; i < lines.length; i++) {
      const fields = [];
      let inQuotes = false;
      let field = '';
      const row = lines[i];
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          // If it's a comma outside of quotes, push the field
          fields.push(field);
          field = ''; // Reset the field
        } else {
          field += char;
        }
      }
      fields.push(field);
      // const rowMatches = lines[i].match(regex);
      // if (rowMatches) {
      //   const row = rowMatches.map(field => field.trim().replace(/^"(.+)"$/, '$1'));
      //   row.unshift(i);
      //   data.push(row);
      // }
      fields.unshift(i);
      if (i!==0) {
        xpaths.push(fields[1]);
        texts.push(fields[2]);
        highlighted_xpaths.push(fields[3]);
        sTexts.push(fields[4]);
        tagged_sequence.push(fields[5]);
      }
      data.push(fields);
    }
    updateStorage(xpaths, texts, highlighted_xpaths, sTexts, tagged_sequence);
    return data;
}