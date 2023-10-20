
function colorize(xpathMap) {
    console.log("Start to colorize");
    try {
      const colorMap = getColorMap();
      // 1. Traverse to the node that needs highlight
      for (let [xpath, [text, tagged_sequence]] of xpathMap){
        // Check if tag is not 'outside'
        if (tagged_sequence.includes('_')) {
          var tag = tagged_sequence.split('_')[1];
        } else {
          var tag = 'o';
        };
        var highlightColor = colorMap.get(tag);
        var result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
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
      console.log("Successfully colorize");
    }
    catch (error) {
      // location.reload();
      //   setTimeout(() => {
      //      console.log("Wait for reloading")
      // }, 500);
      console.log(error)
    }
};