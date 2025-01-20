// Selecting Elements
const form = document.getElementById('budget-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const transactionList = document.getElementById('transaction-list');
const totalIncomeDisplay = document.getElementById('total-income');
const totalExpensesDisplay = document.getElementById('total-expenses');
const balanceDisplay = document.getElementById('balance');
const chartCanvas = document.getElementById('chart');
const categorySelect = document.getElementById('category'); // New element for categories
const categoryChartCanvas = document.getElementById('category-chart'); // New chart for categories
const trendChartCanvas = document.getElementById('trend-chart'); // New chart for trends

// Data
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let chart;
let categoryChart;
let trendChart;

// Update Local Storage
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update Totals and Balance
function updateTotals() {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  totalIncomeDisplay.textContent = income;
  totalExpensesDisplay.textContent = expenses;
  balanceDisplay.textContent = income - expenses;

  updateChart(income, expenses);
  updateCategoryChart();
  updateTrendChart();
}

// Add Transaction
function addTransaction(e) {
  e.preventDefault();

  const description = descriptionInput.value;
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const category = categorySelect.value;

  if (description && !isNaN(amount) && amount > 0) {
    const transaction = { description, amount, type, category, id: Date.now() };
    transactions.push(transaction);
    renderTransaction(transaction);
    updateTotals();
    updateLocalStorage();
    form.reset();
  }
}

// Render Transaction
function renderTransaction(transaction) {
  const li = document.createElement('li');
  li.className = transaction.type;
  li.innerHTML = `
    ${transaction.description} <span>${transaction.type === 'income' ? '+' : '-'}Rs. ${transaction.amount}</span>
    <button onclick="removeTransaction(${transaction.id})">x</button>
  `;
  transactionList.appendChild(li);
}

// Remove Transaction
function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  renderTransactions();
  updateTotals();
  updateLocalStorage();
}

// Render All Transactions
function renderTransactions() {
  transactionList.innerHTML = '';
  transactions.forEach(renderTransaction);
}

// Update Main Chart
function updateChart(income, expenses) {
  if (chart) {
    chart.destroy();
  }
  chart = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [
        {
          data: [income, expenses],
          backgroundColor: ['#007bff', '#ff4757'],
        },
      ],
    },
  });
}

// Update Category Chart
function updateCategoryChart() {
  const categories = {};

  transactions.forEach(t => {
    if (t.type === 'expense') {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    }
  });

  const labels = Object.keys(categories);
  const data = Object.values(categories);

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(categoryChartCanvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Expenses by Category',
          data: data,
          backgroundColor: ['#ff9f40', '#ff6384', '#36a2eb', '#4bc0c0'],
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

// Update Trend Chart
function updateTrendChart() {
  const dates = {};

  transactions.forEach(t => {
    const date = new Date(t.id).toLocaleDateString();
    dates[date] = (dates[date] || 0) + (t.type === 'income' ? t.amount : -t.amount);
  });

  const labels = Object.keys(dates);
  const data = Object.values(dates);

  if (trendChart) {
    trendChart.destroy();
  }

  trendChart = new Chart(trendChartCanvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Balance Over Time',
          data: data,
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          fill: true,
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Balance',
          },
        },
      },
    },
  });
}

// Initial Render
function init() {
  renderTransactions();
  updateTotals();
}

// Event Listener
form.addEventListener('submit', addTransaction);

// Initialize App
init();
