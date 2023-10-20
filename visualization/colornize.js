
function colorize(xpathMap) {
    console.log("Start to colorize");
    var colorizeCount = 0
    try {
      const colorMap = getColorMap();
      // 1. Traverse to the node that needs highlight
      for (let [xpath, [text, highlightedText, tagged_sequence]] of xpathMap){
        // Check if tag is not 'outside'
        if (tagged_sequence.includes('_')) {
          var tag = tagged_sequence.split('_')[1];
        } else {
          var tag = 'o';
        };
        var highlightColor = colorMap.get(tag);
        var result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
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
        while (textNode = walker.nextNode()) {
          if (textNode.textContent.trim().length > 0) {
            // const span = document.createElement('span');
            // span.className = highlightColor;
            // const parent = textNode.parentNode;
            // parent.insertBefore(span, textNode);
            // span.appendChild(textNode);
            // colorizeCount += 1
            const index = text.indexOf(highlightedText);
            const beforeText = text.substring(0, index);
            const afterText = text.substring(index + highlightedText.length);
            console.log("completeText is "+text);
            console.log("xpath is "+xpath);
            console.log("index is "+index);
            console.log("beforeText is "+beforeText);
            console.log("highlithedText is "+highlightedText);
            console.log("afterText is "+ afterText);
            
            const parent = textNode.parentNode;

            if (beforeText.length > 0) {
              const beforeNode = document.createTextNode(beforeText);
              parent.insertBefore(beforeNode, textNode);
            }

            const span = document.createElement('span');
            span.className = highlightColor;
            span.textContent = highlightedText;
            parent.insertBefore(span, textNode);

            if (afterText.length > 0) {
              const afterNode = document.createTextNode(afterText);
              parent.insertBefore(afterNode, textNode);
            }

            parent.removeChild(textNode);
            colorizeCount += 1;
          }
        }
      }
      console.log("Successfully colorize. Colorize "+colorizeCount+" tokens");
      const paragraph = document.getElementById("visualization-status");
      paragraph.innerHTML = "Successfully visualize. Colorize "+colorizeCount+" tokens";
      paragraph.style.color = "green";
    }
    catch (error) {
      // location.reload();
      //   setTimeout(() => {
      //      console.log("Wait for reloading")
      // }, 500);
      console.log(error)
      const paragraph = document.getElementById("visualization-status");
      paragraph.innerHTML = "Fail to visualize. Please check console output to figure out the error or refresh to retry";
      paragraph.style.color = "red";
    }
};