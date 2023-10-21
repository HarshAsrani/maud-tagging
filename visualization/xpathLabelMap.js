
const insertPosition = "/html/body/div[3]/div[2]/div[2]/p/";

// New code: to be tested
function getXPathLabelMap(csvRows) {
    // 1. Extract info from CSV file
    // 2. Initialize xpathMap: {xpath:[text,tagged_sequence]}
    // Each CSV row is an array of values representing a row
    const newCsvRows = makeCsvWithUniqueXpath(csvRows);
    const xpathMap = new Map();
    for (const csvRow of newCsvRows) {
      const tagged_sequence = csvRow[getTaggedSequence()]; // Assuming the preds are in the third column
      if (tagged_sequence !== "o") {
        const xpathOriginal = csvRow[getHighlightedXPath()]; // Assuming the XPath is in the first column
        const sliceIndex = "/html/body/".length;
        xpath = insertPosition + xpathOriginal.slice(sliceIndex); // update xpath as original html is rendered inside a p tag
        const text = csvRow[getText()];
        const highlightedText = csvRow[getHighlightedText()];
        xpathMap.set(xpath, [text, highlightedText, tagged_sequence]);
      }
    }
    console.log("Successfully get <xpath,label> map");
    console.log("xpathMap: ");
    console.log(xpathMap);
    return xpathMap;
}

  
function makeCsvWithUniqueXpath(csvRows) {
    try {
        const uniqueXpath = getUniqueXpath(csvRows);
        const newCsvRows = Array.from(csvRows);
        uniqueXpath.forEach(([indexList, textList], xpath) => {
            if (textList.length > 1) {
                console.log("xpath is "+xpath);
                var result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                //Iterate through the text nodes that are direct children of the result element and ignore text nodes in deeper elements
                const walker = document.createTreeWalker(
                    result, // Root node
                    NodeFilter.SHOW_TEXT, // Show text nodes
                    {
                    acceptNode: function (node) {
                        // Custom filter function
                        if (node.parentNode === result) {
                        // Text node is a direct child of the result element
                        return NodeFilter.FILTER_ACCEPT;
                        } else {
                        // Text node is in a deeper element, reject it
                        return NodeFilter.FILTER_REJECT;
                        }
                    },
                    },
                    false // Not iterating over entity references
                );

                prevMatchIndex = 0;
                spanNumber = 0;
                console.log("textList is:");
                console.log(textList);
                console.log("indexList is:");
                console.log(textList);
                while (textNode = walker.nextNode()) {
                    currText = textNode.textContent.trim().replace(/[\n\t]/g, ' ');
                    if (currText.length > 0) {
                        // the textNode content corresponds to one row in the csv
                        if (textList.slice(prevMatchIndex).indexOf(currText) !== -1) {
                            const span = document.createElement('span');
                            const parent = textNode.parentNode;
                            parent.insertBefore(span, textNode);
                            span.appendChild(textNode);
                            const index = indexList[textList.slice(prevMatchIndex).indexOf(currText)+prevMatchIndex];
                            console.log("prevMatchIndex is "+prevMatchIndex);
                            console.log("index is "+index)
                            const newCsvRow = newCsvRows[index-1];
                            if (newCsvRows[index-1].length >= 6) {  
                                spanNumber += 1;
                                newCsvRows[index-1][3] = newCsvRow[3] + "/span[" + spanNumber + "]";
                                console.log("text is "+currText);
                                console.log("new csv xpath is "+newCsvRows[index-1][3]);
                            }
                            prevMatchIndex = textList.slice(prevMatchIndex).indexOf(currText)+prevMatchIndex+1;
                        }
                        // the textNode content corresponds to multiple rows in the csv
                        else {
                            [subTextList, prevMatchIndex] = splitCurrText(currText, indexList, textList, prevMatchIndex);
                            const parent = textNode.parentNode;
                            for (let i = 0; i < subTextList.length; i++) {
                                [index, subtext] = subTextList[i];
                                const span = document.createElement('span');
                                span.textContent = subtext;
                                parent.insertBefore(span, textNode);
                                if (newCsvRows[index-1].length >= 6) {    
                                    const newCsvRow = newCsvRows[index-1];
                                    spanNumber = spanNumber + 1
                                    newCsvRows[index-1][3] = newCsvRow[3] + "/span[" + spanNumber + "]";
                                }
                                console.log("text is "+currText);
                                console.log("subtext is "+subtext)
                                console.log("new xpath is"+ newCsvRows[index-1][3])
                            }
                            parent.removeChild(textNode);
                        }
                    }
                }
            }
        });
        return newCsvRows;
    }
    catch (error) {
        // location.reload();
        // setTimeout(() => {
        //     console.log("Wait for reloading")
        // }, 500);
        console.log(error);
        const paragraph = document.getElementById("visualization-status");
        paragraph.innerHTML = "Fail to visualize. Please check console output to figure out the error or refresh to retry";
        paragraph.style.color = "red";
    }
}

function getUniqueXpath(csvRows) {
    const uniqueXpath = new Map();
    for (const csvRow of csvRows) {
        const csvIndex = csvRow[getIndex()];
        const text = csvRow[getText()];
        const xpathOriginal = csvRow[getXPath()];
        const sliceIndex = "/html/body/".length;
        xpath = insertPosition + xpathOriginal.slice(sliceIndex);
        if (uniqueXpath.has(xpath)) {
            [indexList, textList] = uniqueXpath.get(xpath);
            indexList.push(csvIndex);
            textList.push(text);
            uniqueXpath.set(xpath, [indexList, textList]);
        }
        else {
            uniqueXpath.set(xpath, [[csvIndex],[text]]);
        }
    }
    console.log(uniqueXpath);
    return uniqueXpath;
}

function splitCurrText(currText, indexList, textList, prevMatchIndex) {
    subTextList = [];
    index = 0;
    for (let i = prevMatchIndex; i < textList.length; i++) {
        subText = textList[i];
        if (currText.includes(subText)) {
            subTextList.push([indexList[i], subText]);
            prevMatchIndex = i
        }
    }
    return [subTextList, prevMatchIndex];
}