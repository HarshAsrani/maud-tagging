let dom;
let json;

const htmlFileSelector = document.getElementById('html-file-selector');
const csvFileSelector = document.getElementById('csv-file-selector');
const contractSelector = document.getElementById('select-contract');
const htmlPreview = document.getElementById('html-preview');

const colorMap = new Map();
const xpathMap = new Map();

function checkContractString(str) {
  const regex = /^contract_(?:[1-9]|[1-9][0-9]|[1][0-4][0-9]|152)$/;
  return regex.test(str);
}

htmlFileSelector.addEventListener('change', (event) => {
  const file = event.target.files[0];
  readHTML(file);
})

csvFileSelector.addEventListener('change', (event) => {
  const file = event.target.files[0];
  readCSV(file);
})

contractSelector.addEventListener('input', () => {
  const selectedValue = contractSelector.value;
  console.log('User selected:', selectedValue);
  if (checkContractString(selectedValue)) {
    console.log("True");
    loadFile("contract/html/"+selectedValue+".html", "html");
    loadFile("contract/csv/"+selectedValue+".csv", "csv");
  }
});

function readHTML(file) {
  const reader = new FileReader();
  //TODO: Read text encoding from header of file
  reader.readAsText(file, "windows-1252");
  reader.addEventListener(
    "load", () => {
      processHTML(reader.result);
    }
  )
}

function readCSV(file) {
  const reader = new FileReader();
  // TODO: Read text encoding from header of file
  reader.readAsText(file, "windows-1252");
  reader.addEventListener("load", () => {
    text = reader.result;
    processCSV(text);
  });
}

function loadFile(path, fileType) {
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (fileType === "html") {
          // const text = xhr.responseText;
          const text = xhr.response;
          const decoder = new TextDecoder('windows-1252');
          const decodedText = decoder.decode(text);
          processHTML(decodedText);
        }
        else if (fileType === "csv") {
          const text = xhr.response;
          const decoder = new TextDecoder('windows-1252');
          const decodedText = decoder.decode(text);
          processCSV(decodedText);
        }
      } else {
        console.error('Error loading file:', xhr.status);
      }
    }
  };
  xhr.open('GET', path, true);
  xhr.responseType = 'arraybuffer';
  xhr.send();
  return "";
}

function processHTML(text) {
  const parser = new DOMParser();
  dom = parser.parseFromString(text, 'text/html');
  htmlPreview.innerHTML = text;
}

function processCSV(text) {
  const csvRows = text.trim().split('\n').map(row => row.replace(/\r$/, ''));
  const csvData = parseCSV(csvRows.join('\n'));
  // Assuming the CSV has comma-separated values
  // Now you can process the CSV data (e.g., display, parse, etc.)
  parseXPaths(csvData.slice(1))
  colorize();
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

const xpathCount = new Map();

function xpathPreprocessing(csvRows) {
  for (const csvRow of csvRows) {
    const tagged_sequence = csvRow[4];
    if (tagged_sequence !== "o") {
      const xpathOriginal = csvRow[2]; // Assuming the XPath is in the first column
      const sliceIndex = "/html/body/".length;
      xpathNew = xpathOriginal.slice(0, sliceIndex) + "div/div/div/p/" + xpathOriginal.slice(sliceIndex);
      xpathCount[xpathNew] = 1;
    }
  }
  
  for (const xpath in xpathCount) {
    var result = document.evaluate(xpath, document, null, 9, null).singleNodeValue;
    const walker = document.createTreeWalker(result, NodeFilter.SHOW_TEXT, null, false);
    while (textNode = walker.nextNode()) {
      if (textNode.textContent.trim().length > 0) {
        const span = document.createElement('span');
        const parent = textNode.parentNode;
        parent.insertBefore(span, textNode);
        span.appendChild(textNode);
      }
    }
  }
}

// New code: to be tested
function parseXPaths(csvRows) {
  // 1. Extract info from CSV file
  // 2. Initialize xpathMap: {xpath:[text,tagged_sequence]}
  // Each CSV row is an array of values representing a row
  xpathPreprocessing(csvRows);
  for (const csvRow of csvRows) {
    const tagged_sequence = csvRow[4]; // Assuming the preds are in the third column
    if (tagged_sequence !== "o") {
      const xpathOriginal = csvRow[2]; // Assuming the XPath is in the first column
      const sliceIndex = "/html/body/".length;
      xpath = xpathOriginal.slice(0, sliceIndex) + "div/div/div/p/" + xpathOriginal.slice(sliceIndex); // update xpath as original html is rendered inside a p tag
      count = xpathCount[xpath];
      xpathCount[xpath] = count + 1;
      xpath = xpath + "/span["+count+"]";
      const text = csvRow[3];
      xpathMap.set(xpath, [text, tagged_sequence]);
    }
  }
}

function colorize() {
  console.log("Start to colorize");
  let test = document.getElementById('test');
  // 1. Traverse to the node that needs highlight
  for (let [xpath, [text, tagged_sequence]] of xpathMap){
    // Check if tag is not 'outside'
    if (tagged_sequence.includes('_')) {
      var tag = tagged_sequence.split('_')[1];
    } else {
      var tag = 'o';
    };
    var highlightColor = colorMapper.get(tag);
    var result = document.evaluate(xpath, document, null, 9, null).singleNodeValue;
    const walker = document.createTreeWalker(result, NodeFilter.SHOW_TEXT, null, false);
    let textNode;

    while (textNode = walker.nextNode()) {
      if (textNode.textContent.trim().length > 0) {
        const span = document.createElement('span');
        span.className = highlightColor;
        const parent = textNode.parentNode;
        parent.insertBefore(span, textNode);
        span.appendChild(textNode);
      }
    }
  }

};
//---------------------------------------------------------------------------------------

// Object Version of colorMapper
const colorMapperObj = {
  t: "DarkOrange",
  tn: "DarkSalmon",
  n: "Gold",
  st: "LightCoral",
  sn: "IndianRed",
  sst: "Plum",
  ssn: "Salmon",
  ssst: "CadetBlue",
  sssn: "LightSteelBlue",
  sssst: "PaleGreen",
  ssssn: "MediumAquaMarine",
  // o: "Gainsboro"
};
// Convert object to map for easy iteration
const colorMapper = new Map(Object.entries(colorMapperObj));

// create mapping of pred -> color
function populateColorMap(preds) {
  let predsSplit;
  if (preds != "o"){
      predsSplit = preds.split("_")[1];
  }
  else {
      predsSplit = preds;
  }
  const colorMapValue = colorMapper[predsSplit];
  colorMap.set(preds, colorMapValue);
}