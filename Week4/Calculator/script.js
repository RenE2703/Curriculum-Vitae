const currentDisplay = document.getElementById('display');
const historyDisplay = document.getElementById('history');
const buttons = document.querySelector('.buttons');

let currentValue = '0';
let previousValue = null;
let currentOperator = null;
let shouldReset = false;

const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => (b === 0 ? NaN : a / b),
  modulo: (a, b) => (b === 0 ? NaN : a % b),
  power: (a, b) => Math.pow(a, b)
};

function updateDisplay() {
  currentDisplay.textContent = currentValue;
  const operatorSymbol = getOperatorSymbol(currentOperator);
  historyDisplay.textContent = previousValue !== null && operatorSymbol
    ? `${previousValue} ${operatorSymbol}`
    : '';
  adjustFontSize(currentValue);
}

function getOperatorSymbol(action) {
  switch (action) {
    case 'add':
      return '+';
    case 'subtract':
      return '−';
    case 'multiply':
      return '×';
    case 'divide':
      return '÷';
    case 'modulo':
      return 'mod';
    case 'power':
      return '^';
    default:
      return '';
  }
}

function handleNumber(value) {
  if (currentValue === 'Error') {
    currentValue = '0';
    previousValue = null;
    currentOperator = null;
  }

  if (shouldReset) {
    currentValue = value === '.' ? '0.' : value;
    shouldReset = false;
    updateDisplay();
    return;
  }

  if (value === '.') {
    if (!currentValue.includes('.')) {
      currentValue += '.';
    } 
  } else {
    currentValue = currentValue === '0' ? value : currentValue + value;
  }

  updateDisplay();
}

function setOperator(action) {
  if (currentValue === 'Error') {
    return;
  } 

  const numericValue = parseFloat(currentValue);
  if (previousValue === null) {
    previousValue = numericValue;
  } else if (!shouldReset) {
    const result = calculate(numericValue);
    if (result === 'Error') {
      handleError();
      return;
    }
    previousValue = result;
    currentValue = formatResult(result);
  }

  currentOperator = action;
  shouldReset = true;
  updateDisplay();
}

function calculate(secondOperand) {
  if (currentOperator && operations[currentOperator]) {
    const result = operations[currentOperator](previousValue, secondOperand);
    if (Number.isNaN(result) || !Number.isFinite(result)) {
      return 'Error';
    }
    return result;
  }
  return secondOperand;
}

function formatResult(result) {
  if (result === 'Error') {
    return 'Error';
  } 
  const rounded = Math.round(result * 1e10) / 1e10;
  return rounded.toString();
}

function adjustFontSize(value) {
  const cleanLength = value.replace('-', '').length;
  const baseSize = 2.75;
  const minSize = 1.1;
  if (cleanLength <= 10) {
    currentDisplay.style.fontSize = `${baseSize}rem`;
    return;
  }
  const extraChars = cleanLength - 10;
  const newSize = Math.max(minSize, baseSize - extraChars * 0.12);
  currentDisplay.style.fontSize = `${newSize}rem`;
}

function evaluate() {
  if (currentOperator === null || previousValue === null || shouldReset) {
    return;
  }
  const secondOperand = parseFloat(currentValue);
  const result = calculate(secondOperand);
  if (result === 'Error') {
    handleError();
    return;
  }
  currentValue = formatResult(result);
  previousValue = null;
  currentOperator = null;
  shouldReset = true;
  historyDisplay.textContent = '';
  updateDisplay();
}

function clearAll() {
  currentValue = '0';
  previousValue = null;
  currentOperator = null;
  shouldReset = false;
  updateDisplay();
}

function clearEntry() {
  if (currentValue === 'Error') {
    clearAll();
    return;
  }
  currentValue = '0';
  shouldReset = false;
  updateDisplay();
}

function handleError() {
  currentValue = 'Error';
  previousValue = null;
  currentOperator = null;
  shouldReset = true;
  historyDisplay.textContent = '';
  updateDisplay();
}

function toggleSign() {
  if (currentValue === '0' || currentValue === 'Error') {
    return;
  } 
  currentValue = currentValue.startsWith('-')
    ? currentValue.slice(1)
    : `-${currentValue}`;
  updateDisplay();
}

function applyPercent() {
  if (currentValue === 'Error') {
    return;
  } 
  const number = parseFloat(currentValue);
  if (Number.isNaN(number)) {
    currentValue = '0';
    updateDisplay();
    return;
  }
  currentValue = formatResult(number / 100);
  shouldReset = false;
  updateDisplay();
}

// Multi-language support
const translations = {
    EN: {
        Memory: "Memory",
        'Calculate History': "Calculation History",
        'Clear History': "Clear History",
        MC: "MC",
        MR: "MR",
    },
    VN: {
        Memory: "Bộ nhớ",
        'Calculation History': "Lịch sử tính toán",
        'Clear History': "Xóa lịch sử",
        MC: "XN",
        MR: "GN",
    }
};

let currentLang = 'EN';
let isDarkMode = localStorage.getItem('darkMode') === 'true';

let state = {
    display: '0',
    previousValue: null,
    currentOperator: null,
    shouldReset: false,
    memory: parseFloat(localStorage.getItem('calculatorMemory')) || 0,
    history: JSON.parse(localStorage.getItem('calculatorHistory')) || []
};

const displayEl = document.getElementById('display');
const historyEl = document.getElementById('history');
const memoryValueEl = document.getElementById('memoryValue');
const historyListEl = document.getElementById('historyList');
const langBtn = document.getElementById('langBtn');
const themeBtn = document.getElementById('themeBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateMemoryDisplay();
    renderHistory();
    setupEventListeners();
});

function initTheme() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeBtn.textContent = '☀️';
    }
}

themeBtn.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    themeBtn.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDarkMode);
});

langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'EN' ? 'VN' : 'EN';
    langBtn.textContent = currentLang === 'EN' ? 'EN | VN' : 'VN | EN';
    updateLanguage();
});

function updateLanguage() {
    document.querySelectorAll('[data-en][data-vn]').forEach(el => {
        el.textContent = currentLang === 'EN' ? el.dataset.en : el.dataset.vn;
    });
}

function setupEventListeners() {
    document.querySelectorAll('.btn-number').forEach(btn => {
        btn.addEventListener('click', (e) => appendNumber(e.target.dataset.number));
    });

    document.querySelectorAll('.btn-operator').forEach(btn => {
        btn.addEventListener('click', (e) => setOperator(e.target.dataset.operator));
    });

    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'clear') clear();
            else if (action === 'delete') deleteLast();
            else if (action === 'percent') percent();
            else if (action === 'equals') calculate();
        });
    });

    document.getElementById('mcBtn').addEventListener('click', () => memoryClear());
    document.getElementById('mrBtn').addEventListener('click', () => memoryRecall());
    document.getElementById('mpBtn').addEventListener('click', () => memoryAdd());
    document.getElementById('mmBtn').addEventListener('click', () => memorySubtract());

    clearHistoryBtn.addEventListener('click', clearHistory);

    document.addEventListener('keydown', handleKeyboard);
}

function handleKeyboard(e) {
    if (/[0-9]/.test(e.key)) appendNumber(e.key);
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        e.preventDefault();
        setOperator(e.key);
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        calculate();
    }
    if (e.key === 'Escape') clear();
    if (e.key === 'Backspace') {
        e.preventDefault();
        deleteLast();
    }
    if (e.key === '.') appendNumber('.');
}

function appendNumber(num) {
    if (state.shouldReset) {
        state.display = num;
        state.shouldReset = false;
    } else {
        state.display = state.display === '0' ? num : state.display + num;
    }
    updateDisplay();
}

function setOperator(op) {
    if (state.currentOperator !== null) {
        calculate();
    }
    state.previousValue = parseFloat(state.display);
    state.currentOperator = op;
    state.shouldReset = true;
    updateHistoryDisplay();
}

function calculate() {
    if (state.currentOperator === null) return;

    const prev = state.previousValue;
    const current = parseFloat(state.display);
    const op = state.currentOperator;
    let result;

    switch (op) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            result = current !== 0 ? prev / current : 0;
            break;
        case '^':
            result = Math.pow(prev, current);
            break;
        case '%':
            result = prev % current;
            break;
        default:
            return;
    }

    const expression = `${prev} ${op} ${current} = ${result}`;
    addToHistory(expression);

    state.display = result.toString();
    state.previousValue = null;
    state.currentOperator = null;
    state.shouldReset = true;
    updateDisplay();
}

function clear() {
    state.display = '0';
    state.previousValue = null;
    state.currentOperator = null;
    state.shouldReset = false;
    historyEl.textContent = '';
    updateDisplay();
}

function deleteLast() {
    state.display = state.display.slice(0, -1) || '0';
    updateDisplay();
}

function percent() {
    state.display = (parseFloat(state.display) / 100).toString();
    updateDisplay();
}

function memoryClear() {
    state.memory = 0;
    localStorage.setItem('calculatorMemory', state.memory);
    updateMemoryDisplay();
}

function memoryRecall() {
    state.display = state.memory.toString();
    state.shouldReset = true;
    updateDisplay();
}

function memoryAdd() {
    state.memory += parseFloat(state.display);
    localStorage.setItem('calculatorMemory', state.memory);
    state.shouldReset = true;
    updateMemoryDisplay();
}

function memorySubtract() {
    state.memory -= parseFloat(state.display);
    localStorage.setItem('calculatorMemory', state.memory);
    state.shouldReset = true;
    updateMemoryDisplay();
}

function updateMemoryDisplay() {
    memoryValueEl.textContent = state.memory.toFixed(2);
}

function addToHistory(expression) {
    state.history.unshift(expression);
    if (state.history.length > 10) state.history.pop();
    localStorage.setItem('calculatorHistory', JSON.stringify(state.history));
    renderHistory();
}

function renderHistory() {
    historyListEl.innerHTML = state.history.map((item, idx) => 
        `<div class="history-item">${item}</div>`
    ).join('');
}

function clearHistory() {
    state.history = [];
    localStorage.setItem('calculatorHistory', JSON.stringify(state.history));
    renderHistory();
}

function updateDisplay() {
    displayEl.textContent = state.display;
}

function updateHistoryDisplay() {
    historyEl.textContent = `${state.previousValue} ${state.currentOperator}`;
}
