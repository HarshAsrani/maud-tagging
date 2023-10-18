
const insertPosition = "/html/body/div[3]/div[2]/div[2]/p/";
// New code: to be tested
function getXPathLabelMap(csvRows) {
    // 1. Extract info from CSV file
    // 2. Initialize xpathMap: {xpath:[text,tagged_sequence]}
    // Each CSV row is an array of values representing a row
    const xpathMap = new Map();
    const xpathCount = xpathPreprocessing(csvRows);
    for (const csvRow of csvRows) {
      const tagged_sequence = csvRow[4]; // Assuming the preds are in the third column
      if (tagged_sequence !== "o") {
        const xpathOriginal = csvRow[2]; // Assuming the XPath is in the first column
        const sliceIndex = "/html/body/".length;
        xpath = insertPosition + xpathOriginal.slice(sliceIndex); // update xpath as original html is rendered inside a p tag
        count = xpathCount[xpath];
        xpathCount[xpath] = count + 1;
        xpath = xpath + "/span["+count+"]";
        const text = csvRow[3];
        xpathMap.set(xpath, [text, tagged_sequence]);
      }
    }
    console.log("Successfully get <xpath,label> map");
    console.log("xpathMap: ");
    console.log(xpathMap);
    return xpathMap;
}

  
function xpathPreprocessing(csvRows) {
    try {
        const xpathCount = new Map();
        for (const csvRow of csvRows) {
            const tagged_sequence = csvRow[4];
            if (tagged_sequence !== "o") {
                const xpathOriginal = csvRow[2]; // Assuming the XPath is in the first column
                const sliceIndex = "/html/body/".length;
                xpath = insertPosition + xpathOriginal.slice(sliceIndex);
                xpathCount[xpath] = 1;
            }
        }
    
        for (const xpath in xpathCount) {
            var result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
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
        console.log("xpathCount: ");
        console.log(xpathCount);
        return xpathCount;
        
    }
    catch (error) {
        location.reload();
        setTimeout(() => {
            console.log("Wait for reloading")
        }, 500);
        // console.log("Wait for reloading")
    }
}