const datalist = document.getElementById('contract-options');
// Generate 152 options
for (let i = 0; i <= 151; i++) {
    if (i != 149) {
        const option = document.createElement('option');
        option.value = `contract_${i}`;
        datalist.appendChild(option);
    }
}
const inputElement = document.getElementById('select-contract');
inputElement.setAttribute('list', 'contract-options');