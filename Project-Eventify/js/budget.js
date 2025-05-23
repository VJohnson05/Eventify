// Select elements
const budgetForm = document.getElementById('budget-form');
const totalBudgetInput = document.getElementById('total-budget');
const expenseForm = document.getElementById('expense-form');
const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseList = document.getElementById('expense-items');

const displayBudget = document.getElementById('display-budget');
const displayExpenses = document.getElementById('display-expenses');
const displayBalance = document.getElementById('display-balance');

const resetBudgetBtn = document.getElementById('reset-budget');
const clearExpensesBtn = document.getElementById('clear-expenses');

// Initialize values
let totalBudget = parseInt(localStorage.getItem('totalBudget')) || 0;
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Save to LocalStorage
function saveToLocalStorage() {
  localStorage.setItem('totalBudget', totalBudget);
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Update Summary
function updateSummary() {
  const totalExpenses = expenses.reduce((acc, item) => acc + item.amount, 0);
  const balance = totalBudget - totalExpenses;

  displayBudget.textContent = totalBudget;
  displayExpenses.textContent = totalExpenses;
  displayBalance.textContent = balance;
}

// Render Expense List
function renderExpenses() {
  expenseList.innerHTML = '';

  if (expenses.length === 0) {
    expenseList.innerHTML = '<li>No expenses added yet.</li>';
    return;
  }

  expenses.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${item.name}</strong>: ₹${item.amount}
      <button onclick="deleteExpense(${index})" style="margin-left: 10px; color: red;">✕</button>
    `;
    expenseList.appendChild(li);
  });
}

// Delete Expense
function deleteExpense(index) {
  expenses.splice(index, 1);
  saveToLocalStorage();
  renderExpenses();
  updateSummary();
}

// Budget Form Submit
budgetForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const value = parseInt(totalBudgetInput.value);
  if (value > 0) {
    totalBudget = value;
    saveToLocalStorage();
    updateSummary();
    totalBudgetInput.value = '';
  }
});

// Expense Form Submit
expenseForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = expenseNameInput.value.trim();
  const amount = parseInt(expenseAmountInput.value);

  if (name && amount > 0) {
    expenses.push({ name, amount });
    saveToLocalStorage();
    renderExpenses();
    updateSummary();
    expenseNameInput.value = '';
    expenseAmountInput.value = '';
  }
});

// Reset Budget Button
resetBudgetBtn.addEventListener('click', function () {
  if (confirm("Are you sure you want to reset the budget?")) {
    totalBudget = 0;
    saveToLocalStorage();
    updateSummary();
  }
});

// Clear Expenses Button
clearExpensesBtn.addEventListener('click', function () {
  if (confirm("Clear all expenses?")) {
    expenses = [];
    saveToLocalStorage();
    renderExpenses();
    updateSummary();
  }
});

// Initial Load
renderExpenses();
updateSummary();