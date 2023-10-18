const htmlFileSelector = document.getElementById('html-file-selector');
const csvFileSelector = document.getElementById('csv-file-selector');
const contractSelector = document.getElementById('select-contract');

// Listen to event - read a HTML file with Option 1
htmlFileSelector.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const htmlText = await readHTML(file);
    if (htmlText !== undefined) {
        console.log("Successfully read html text");
        processHTML(htmlText);
    }
})

// Listen to event - read a CSV file with Option 1 -> Colornize
csvFileSelector.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const csvText = await readCSV(file);
    if (csvText !== undefined) {
        console.log("Successfully read csv text");
        visualizeGroundTruth(csvText);
    }
})

// Listen to event - select a contract to visualize with Option 2 -> Colornize
contractSelector.addEventListener('input', async () => {
    const selectedValue = contractSelector.value;
    console.log('User selected:', selectedValue);
    if (checkContractString(selectedValue)) {
        console.log("True");
        const htmlText = await loadFile("contract/html/"+selectedValue+".html", "html");
        const csvText = await loadFile("contract/csv/"+selectedValue+".csv", "csv");
        if (htmlText !== undefined && csvText !== undefined) {
            console.log("Successfully load html file and csv file");
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