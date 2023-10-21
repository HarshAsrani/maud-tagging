function readHTML(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    //TODO: Read text encoding from header of file
    reader.readAsText(file, "windows-1252");
    reader.addEventListener(
      "load", () => {
        console.log("start to load html file");
        const htmlText = reader.result;
        resolve(htmlText);
      }
    );
    reader.addEventListener("error", () => {
      reject(new Error("Error reading html file."));
    });
  });
}
  
function readCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    // TODO: Read text encoding from header of file
    reader.readAsText(file, "utf-8");
    reader.addEventListener("load", () => {
      csvText = reader.result;
      resolve(csvText);
    });
    reader.addEventListener("error", () => {
      reject(new Error("Error reading csv file."));
    });
  });
}
  
function loadFile(path, fileType) {
  return new Promise((resolve, reject) => {
    console.log("Start to load "+fileType+" file: " + path);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          if (fileType === "html") {
            // const text = xhr.responseText;
            const text = xhr.response;
            const decoder = new TextDecoder('windows-1252');
            const decodedText = decoder.decode(text);
            resolve(decodedText);
          }
          else if (fileType === "csv") {
            // const text = xhr.responseText;
            const text = xhr.response;
            const decoder = new TextDecoder('utf-8');
            const decodedText = decoder.decode(text);
            resolve(decodedText);
          }
          else {
            reject(new Error('Invalid fileType. Must be "html" or "csv".'));
          }
        } else {
          reject(new Error('Error loading file: ' + xhr.status));
        }
      }
    };
    xhr.open('GET', path, true);
    xhr.responseType = 'arraybuffer';
    xhr.send();
  });
}