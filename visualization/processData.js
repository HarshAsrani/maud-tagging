function processHTML(text) {
  console.log("Start to insert the html text");
  let dom;
  const parser = new DOMParser();
  dom = parser.parseFromString(text, 'text/html');
  const htmlPreview = document.getElementById('html-preview');
  htmlPreview.innerHTML = text;
  console.log("Successfully insert html text");
}

function processCSV(text) {
  const csvRows = text.trim().split('\n').map(row => row.replace(/\r$/, ''));
  const csvData = parseCSV(csvRows.join('\n'));
  // Assuming the CSV has comma-separated values
  // Now you can process the CSV data (e.g., display, parse, etc.)
  console.log("Successfully extract csv text");
  return csvData;
}
  
function parseCSV(csv) {
    const regex = /(\s*"[^"]+"\s*|\s*[^,]+|,)(?=,|$)/g;
    const lines = csv.split('\n');
    const data = [];
  
    for (let i = 0; i < lines.length; i++) {
      const rowMatches = lines[i].match(regex);
      if (rowMatches) {
        const row = rowMatches.map(field => field.trim().replace(/^"(.+)"$/, '$1'));
        data.push(row);
      }
    }
    return data;
}