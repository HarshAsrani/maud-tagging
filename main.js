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

function findNextOccurrence(xpath, startIndex) {
  for (let i = startIndex + 1; i < xpaths.length; i++) {
      if (xpaths[i] === xpath) {
          return i;
      }
  }
  return -1; // If not found
}

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
                    let flag = 0;
                    let flag_bef = 0;
                    let flag_aft = 0;
                    let xpathIndex;
                    for (let i = 0; i < highlightedSegmentedText.length; i++) {
                      let taggedSeq;
                      if (i - flag_bef === 0) {
                        taggedSeq = 's_' + sequence;
                      } else if (i === highlightedSegmentedText.length - 1) {
                        taggedSeq = 'e_' + sequence;
                      } else {
                        taggedSeq = 'i_' + sequence;
                      }                   
                      const commonPart = [...highlightedSegmentedText[i]].filter(char => [...highlightedText].includes(char)).join('');
                      console.log(commonPart);
                      if (commonPart != '') {
                        flag = 1
                        highlightElement(highlightedXpaths[i], highlightedSegmentedText[i], commonPart, sequence);
                        imp_part_with_span = highlightedXpaths[i].substring(0, 11) + highlightedXpaths[i].substring(34);
                        let imp_part;
                        if (imp_part_with_span.indexOf('/span[') != -1) {
                          imp_part = imp_part_with_span.substring(0, imp_part_with_span.lastIndexOf('/span['));
                        } else {
                          imp_part = imp_part_with_span;
                        }
                        xpathIndex = xpaths.indexOf(imp_part);
                        if (xpathIndex != -1) {
                          if (tagged_sequence[xpathIndex] !== 'o') {
                            while(tagged_sequence[xpathIndex] !== 'o') {
                              const nextIndex = findNextOccurrence(imp_part, xpathIndex);
                              if (nextIndex !== -1) {
                                  // Next occurrence found
                                  console.log("Next occurrence index:", nextIndex);
                                  xpathIndex = nextIndex; // Update xpathIndex for the next iteration
                              } else {
                                  console.log("No next occurrence found.");
                                  break; // Exit the loop if no next occurrence is found
                              }

                            }
                          }
                          sTexts[xpathIndex] = highlightedSegmentedText[i];
                          tagged_sequence[xpathIndex] = taggedSeq;
                          highlighted_xpaths[xpathIndex] = imp_part;
                        } 
                      } else {
                        if (flag == 0) flag_bef += 1;
                        else flag_aft += 1;
                      }
                    }
                    if (flag_aft > 0) {
                      console.log(tagged_sequence[xpathIndex][0]);
                      if (tagged_sequence[xpathIndex][0] !== 's') {
                  
                        tagged_sequence[xpathIndex] = 'e_'+sequence;
                      }
                      console.log(tagged_sequence[xpathIndex][0]);
                    }
                    updateStorage(xpaths, texts, highlighted_xpaths, sTexts, tagged_sequence);
                  } else {
                    highlightElement(highlightedXpaths, text, highlightedText, sequence);
                    imp_part_with_span = highlightedXpaths[0].substring(0, 11) + highlightedXpaths[0].substring(34);
                    let imp_part;
                    if (imp_part_with_span.indexOf('/span[') != -1) {
                      imp_part = imp_part_with_span.substring(0, imp_part_with_span.lastIndexOf('/span['));
                    } else {
                      imp_part = imp_part_with_span;
                    }
                    const xpathIndex = xpaths.indexOf(imp_part);
                    if (xpathIndex != -1) {
                      sTexts[xpathIndex] = highlightedSegmentedText;
                      tagged_sequence[xpathIndex] = sequence;
                      highlighted_xpaths[xpathIndex] = imp_part;
                    } 
                    updateStorage(xpaths, texts, xpaths, sTexts, tagged_sequence);
                  }
                  
                  
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
  }
});

function downloadJson() {
  downloadObjectAsJson(sessionStorage, 'contract_saved');
}
function downloadObjectAsJson(exportObj, exportName) {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function getAllXPathsAndTexts() {
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(document.body);
  sel.removeAllRanges();
  sel.addRange(range);

  const xpaths_text = getElementInfo(sel, range);
  const highlightedXpaths = xpaths_text.xpaths;
  const highlightedSegmentedText = xpaths_text.selectedTexts;
  
  return [highlightedSegmentedText, highlightedXpaths];
}

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