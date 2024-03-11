
function colorize(xpathMap) {
    console.log("Start to colorize");
    var colorizeCount = 0
    try {
        // 1. Traverse to the node that needs highlight
        for (let [xpath, [text, highlightedText, tagged_sequence]] of xpathMap) {
            // Check if tag is not 'outside'
            if (tagged_sequence.includes('_')) {
                var tag_type = tagged_sequence.split('_')[0];
                var tag = tagged_sequence.split('_')[1];
            } else {
                continue;
            };

            highlightElement(xpath, text, highlightedText, tag);
            colorizeCount += 1;
        }
        const paragraph = document.getElementById("visualization-status");
        paragraph.innerHTML = "Successfully visualize. Colorize " + colorizeCount + " tokens";
        paragraph.style.color = "green";
    }
    catch (error) {
      console.log(error)
      const paragraph = document.getElementById("visualization-status");
      paragraph.innerHTML = "Fail to visualize. Please check console output to figure out the error or refresh to retry";
      paragraph.style.color = "red";
    }
};

window.highlightElement = function(xpath, text, highlightedText, tag) {
    // Retrieve highlight color based on tag
    const colorMap = getColorMap();
    const highlightColor = colorMap.get(tag);

    // Find the result element in the main window
    let result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    // Create a tree walker
    const walker = document.createTreeWalker(
        result, // Root node
        NodeFilter.SHOW_TEXT, // Show text nodes
        {
            acceptNode: function(node) {
                // Custom filter function
                if (node.parentNode === result) {
                    // Text node is a direct child of the result element
                    return NodeFilter.FILTER_ACCEPT;
                } else {
                    // Text node is in a deeper element, reject it
                    return NodeFilter.FILTER_REJECT;
                }
            }
        },
        false // Not iterating over entity references
    );

    // Iterate over text nodes and apply highlighting
    while (textNode = walker.nextNode()) {
        if (textNode.textContent.trim().length > 0) {
            const index = text.indexOf(highlightedText);
            const beforeText = text.substring(0, index);
            const afterText = text.substring(index + highlightedText.length);

            const parent = textNode.parentNode;

            if (beforeText.length > 0) {
                const beforeNode = document.createTextNode(beforeText);
                parent.replaceChild(beforeNode, textNode);
            }

            const span = document.createElement('span');
            span.className = highlightColor;
            span.textContent = highlightedText;
            span.style.cursor = "pointer";
            span.onclick = function() {
                remove_highlight(span);
            };
            parent.insertBefore(span, textNode);

            if (afterText.length > 0) {
                const afterNode = document.createTextNode(afterText);
                parent.insertBefore(afterNode, textNode);
            }

            parent.removeChild(textNode);
        }
    }
};


function remove_highlight(span) {
    // Get the parent node of the span
    const parent = span.parentNode;

    // Create a text node containing the text of the span
    const textNode = document.createTextNode(span.textContent);

    // Replace the span with the text node
    parent.replaceChild(textNode, span);
}
// function colorize(xpathMap) {
//   console.log("Start to colorize");
//   var colorizeCount = 0;
//   try {
//       const colorMap = getColorMap();
//       // Convert xpathMap to an array
//       const xpathMapArray = Array.from(xpathMap);
//       const xpathMapLength = xpathMapArray.length;
//       // Traverse the xpathMap using an index variable
//       for (let i = 0; i < xpathMapLength-1; i++) {
//           const [xpath, [text, highlightedText, tagged_sequence]] = xpathMapArray[i];
//           // Check if tag is not 'outside'
//           if (!tagged_sequence.includes('_')) {
//               continue;
//           }
//           const tag_type = tagged_sequence.split('_')[0];
//           const tag = tagged_sequence.split('_')[1];
//           if (tag_type === 's' || tag_type === 'b') {
//             if (xpathMapArray[i+1][1][2].split('_')[0] === 'b' ||  xpathMapArray[i+1][1][2].split('_')[0] === 's') {
//               console.log(xpathMapArray[i][1][2]);
//               console.log(xpathMapArray[i+1][1][2]);
//               const highlightColor = colorMap.get(tag);

//               const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
//               const walker = document.createTreeWalker(
//                   result, // Root node
//                   NodeFilter.SHOW_TEXT, // Show text nodes
//                   {
//                       acceptNode: function(node) {
//                           // Custom filter function
//                           return node.parentNode === result ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
//                       },
//                   },
//                   false // Not iterating over entity references
//               );
//               let textNode;
//               while ((textNode = walker.nextNode())) {
//                   if (textNode.textContent.trim().length > 0) {
//                       const index = text.indexOf(highlightedText);
//                       const beforeText = text.substring(0, index);
//                       const afterText = text.substring(index + highlightedText.length);

//                       const parent = textNode.parentNode;

//                       if (beforeText.length > 0) {
//                           const beforeNode = document.createTextNode(beforeText);
//                           parent.insertBefore(beforeNode, textNode);
//                       }

//                       const span = document.createElement('span');
//                       span.className = highlightColor;
//                       span.textContent = highlightedText;
//                       span.style.cursor = "pointer";
//                       span.onclick = function() {
//                           remove_highlight(span);
//                       };
//                       parent.insertBefore(span, textNode);

//                       if (afterText.length > 0) {
//                           const afterNode = document.createTextNode(afterText);
//                           parent.insertBefore(afterNode, textNode);
//                       }

//                       parent.removeChild(textNode);
//                       colorizeCount++;
//                   }
//               }
//             } else {
//               const highlightColor = colorMap.get(tag);

//               const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
//               const walker = document.createTreeWalker(
//                   result, // Root node
//                   NodeFilter.SHOW_TEXT, // Show text nodes
//                   {
//                       acceptNode: function(node) {
//                           // Custom filter function
//                           return node.parentNode === result ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
//                       },
//                   },
//                   false // Not iterating over entity references
//               );
//               console.log(walker);
//               let textNode;
//               while ((textNode = walker.nextNode())) {
//                   if (textNode.textContent.trim().length > 0) {
//                       const index = text.indexOf(highlightedText);
//                       const beforeText = text.substring(0, index);
//                       const afterText = text.substring(index + highlightedText.length);

//                       const parent = textNode.parentNode;

//                       if (beforeText.length > 0) {
//                           const beforeNode = document.createTextNode(beforeText);
//                           parent.insertBefore(beforeNode, textNode);
//                       }

//                       const span = document.createElement('span');
//                       span.className = highlightColor;
//                       span.textContent = highlightedText;
//                       span.style.cursor = "pointer";
//                       span.onclick = function() {
//                           remove_highlight(span);
//                       };
//                       parent.insertBefore(span, textNode);

//                       if (afterText.length > 0) {
//                           const afterNode = document.createTextNode(afterText);
//                           parent.insertBefore(afterNode, textNode);
//                       }

//                       parent.removeChild(textNode);
//                       colorizeCount++;
//                   }
//               }
//             }
//           }
//       }
//       const paragraph = document.getElementById("visualization-status");
//       paragraph.innerHTML = "Successfully visualize. Colorize " + colorizeCount + " tokens";
//       paragraph.style.color = "green";
//   } catch (error) {
//       console.log(error);
//       const paragraph = document.getElementById("visualization-status");
//       paragraph.innerHTML = "Fail to visualize. Please check console output to figure out the error or refresh to retry";
//       paragraph.style.color = "red";
//   }
// }


// function remove_highlight(span) {
//   // Get the parent node of the span
//   const parent = span.parentNode;

//   // Create a text node containing the text of the span
//   const textNode = document.createTextNode(span.textContent);

//   // Replace the span with the text node
//   parent.replaceChild(textNode, span);
// }