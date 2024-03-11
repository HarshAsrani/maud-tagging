const htmlFileSelector = document.getElementById('html-file-selector');
const csvFileSelector = document.getElementById('csv-file-selector');
const contractSelector = document.getElementById('select-contract');
let xpaths = []
let texts = []
let highlighted_xpaths = []
let sTexts = []
let tagged_sequence = []
updateStorage(xpaths, texts, highlighted_xpaths, sTexts, tagged_sequence)
// Listen to event - read a HTML file with Option 1
htmlFileSelector.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const htmlText = await readHTML(file);
    if (htmlText !== undefined) {
        // console.log("Successfully read html text");
        processHTML(htmlText);
    }
})

// Listen to event - read a CSV file with Option 1 -> Colornize
csvFileSelector.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const csvText = await readCSV(file);
    if (csvText !== undefined) {
        // console.log("Successfully read csv text");
        visualizeGroundTruth(csvText);
    }
})

// Listen to event - select a contract to visualize with Option 2 -> Colornize
contractSelector.addEventListener('input', async () => {
    const selectedValue = contractSelector.value;
    // console.log('User selected:', selectedValue);
    if (checkContractString(selectedValue)) {
        // console.log("True");
        const htmlText = await loadFile("contract/html/"+selectedValue+".html", "html");
        const csvText = await loadFile("contract/csv/"+selectedValue+".csv", "csv");
        if (htmlText !== undefined && csvText !== undefined) {
            // console.log("Successfully load html file and csv file");
            processHTML(htmlText);
            visualizeGroundTruth(csvText);
        }
    }
});

// Visualize the ground truth with CSV text
function visualizeGroundTruth(csvText) {
    const csvData = processCSV(csvText);
    const xpathMap = getXPathLabelMap(csvData.slice(1));
    colorize(xpathMap);
}

// Check whether user inputs a valid contract number for Option 2
function checkContractString(str) {
    if (str=="149") {
        return false;
    }
    const regex = /^contract_(?:[0-9]|[1-9][0-9]|1[0-4][0-9]|150|151)$/;
    return regex.test(str);
}
let isMenuOpen = false;
let selectedOption = null;

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
      event.preventDefault();
      let highlightedText = window.getSelection().toString();
      console.log(highlightedText);
      let selectionRange = window.getSelection().getRangeAt(0);
      let text = selectionRange.startContainer.textContent;
      console.log(text);
      let sel = window.getSelection();
      let range = sel.getRangeAt(0);
      let xpaths_text = getElementInfo(sel, range);
      console.log(xpaths_text);
      let highlightedXpaths = xpaths_text.xpaths;
      let highlightedSegmentedText = xpaths_text.selectedTexts;

      if (!isMenuOpen) {
          isMenuOpen = true;
          const menuWindow = window.open("", "Dialog Box", `width=700,height=700`);
          const dialog = menuWindow.document.createElement("div");
          dialog.style.display = "flex";
          dialog.style.flexDirection = "column";
          dialog.style.justifyContent = "center";
          dialog.style.alignItems = "center";
          dialog.style.backgroundColor = "gray";
          menuWindow.document.body.appendChild(dialog);
          const message = menuWindow.document.createElement("p");
          const xpath_text_message = menuWindow.document.createElement("p");
          xpath_text_message.textContent = "XPATHS: " + highlightedXpaths.map(xpath_ => xpath_ + '\n\n');
          message.textContent = "Classes: t, tn, n, st, sn, sst, ... , ssssn. Press SPACE when done; any other key to reset";
          message.style.fontSize = "12px";
          xpath_text_message.style.fontSize = "12px";
          dialog.appendChild(message);
          dialog.appendChild(xpath_text_message);

          let sequence = '';
          const allowedKeys = new Set(['t', 'n', 's'])
          const labelTypes = new Set(['t', 'tn', 'n', 'st', 'sn', 'sst', 'ssn', 'ssst', 'sssn', 'ssssn', 'sssst'])

          function handleKeyDown(event) {
              if (allowedKeys.has(event.key)) {
                  sequence += event.key;
              } else if (event.code === 'Space' && sequence.length > 0 && labelTypes.has(sequence)) {
                  // Pass the information to the main window for highlighting
                  if (highlightedXpaths.length > 1) {
                    concatXpaths = highlightedXpaths.join('|');
                    highlightElement(concatXpaths, text, highlightedSegmentedText, 's_' + sequence);
                  } else {
                    highlightElement(highlightedXpaths, xpaths_text, highlightedText, 's_' + sequence);
                  }
                  
                  tagged_sequence.push(sequence);
                  xpaths.push(highlightedXpaths);
                  sTexts.push(highlightedSegmentedText);
                  texts.push(highlightedText);
                  highlighted_xpaths.push(highlightedXpaths)
                  updateStorage(xpaths, highlightedText, xpaths, highlightedSegmentedText, 's_'+sequence)

                  isMenuOpen = false;
                  menuWindow.close();
              } else {
                  sequence = '';
              }
              console.log(sequence);
              const currSeq = menuWindow.document.createElement("p");
              currSeq.textContent = `Curr sequence: ${sequence}`;
              currSeq.style.fontSize = "12px";
              dialog.appendChild(currSeq);
          }

          menuWindow.addEventListener('keydown', handleKeyDown);

          menuWindow.addEventListener('unload', function() {
              menuWindow.removeEventListener('keydown', handleKeyDown);
              isMenuOpen = false;
          });
      }
  } else if (event.key === 'p') {
      downloadObjectAsJson(localStorage, 'contract_saved')
  } else if ((event.altKey || event.metaKey) && event.key === "a") {
      let XPathsAndTexts = getAllXPathsAndTexts();
      updateStorage(XPathsAndTexts[1], '', XPathsAndTexts[0], '', '');
      downloadObjectAsJson(localStorage, 'all_contract_text');
  } else if ((event.altKey || event.metaKey) && event.key === "0") {
      updateStorage('', '', '', '', '');
      console.log('ERASED');
  }
});


  function getElementInfo(sel, range) {
    const container = range.commonAncestorContainer;
    const nodeXPaths = [];
    const nodeTexts = [];
    let currSelectCopy = sel.toString().trim();
  
    function getXPath(node) {
      let xpath = "";
      for (; node && node.nodeType == Node.ELEMENT_NODE; node = node.parentNode) {
        let siblings = Array.from(node.parentNode.childNodes).filter(
          (sibling) => sibling.nodeName === node.nodeName
        );
        if (siblings.length > 1) {
          let index = siblings.indexOf(node) + 1;
          xpath = `/${node.nodeName.toLowerCase()}[${index}]${xpath}`;
        } else {
          xpath = `/${node.nodeName.toLowerCase()}${xpath}`;
        }
      }
      return xpath;
    }
  
    function traverse(node) {
      if (range.intersectsNode(node)) {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent.trim().length > 0) {
            let nodeXPath = getXPath(node.parentNode);
            let nodeText = node.textContent.trim();
            let startIndex = Math.max(nodeText.indexOf(currSelectCopy), 0);
            let endIndex = Math.min(
              startIndex + currSelectCopy.length,
              nodeText.length
            );
            if (startIndex !== -1) {
              let selectedText = nodeText.substring(startIndex, endIndex);
              currSelectCopy = currSelectCopy.replace(selectedText, "");
              nodeTexts.push(selectedText);
              nodeXPaths.push(nodeXPath);
            }
          }
        } else {
          if (node.childNodes.length > 0) {
            for (let i = 0; i < node.childNodes.length; i++) {
              traverse(node.childNodes[i]);
            }
          } else {
            if (node.textContent.trim().length > 0) {
              let nodeXPath = getXPath(node);
              let nodeText = node.textContent.trim();
              let startIndex = Math.max(nodeText.indexOf(currSelectCopy), 0);
              let endIndex = Math.min(
                startIndex + currSelectCopy.length,
                nodeText.length
              );
              if (startIndex !== -1) {
                let selectedText = nodeText.substring(startIndex, endIndex);
                currSelectCopy = currSelectCopy.replace(selectedText, "");
                nodeTexts.push(selectedText);
                nodeXPaths.push(nodeXPath);
              }
            }
          }
        }
      }
    }
  
    traverse(container);
  
    return { xpaths: nodeXPaths, selectedTexts: nodeTexts };
  }