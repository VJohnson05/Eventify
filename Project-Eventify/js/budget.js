// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase, ref, set, get, child, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCFqA-ND0ZUPI-zeXJDPia4FlbYUkFFi_g",
  authDomain: "planitnow-4.firebaseapp.com",
  databaseURL: "https://planitnow-4-default-rtdb.firebaseio.com",
  projectId: "planitnow-4",
  storageBucket: "planitnow-4.appspot.com",
  messagingSenderId: "459500688850",
  appId: "1:459500688850:web:8654582d843e0e4979a40b",
  measurementId: "G-NEBHY93TQW",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Elements
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

// Global state
let currentUserId = null;
let totalBudget = 0;
let expenses = [];

// Initialize
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
    loadBudgetData();
  } else {
    alert("You must be logged in.");
    window.location.href = "auth.html";
  }
});

// Load Budget Data from Firebase
function loadBudgetData() {
  const userBudgetRef = ref(db, `budget/${currentUserId}`);
  onValue(userBudgetRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      totalBudget = data.totalBudget || 0;
      expenses = data.expenses ? Object.values(data.expenses) : [];
    } else {
      totalBudget = 0;
      expenses = [];
    }
    renderExpenses();
    updateSummary();
  });
}

// Save Budget and Expenses to Firebase
function saveBudgetData() {
  const userBudgetRef = ref(db, `budget/${currentUserId}`);
  const data = {
    totalBudget: totalBudget,
    expenses: {},
  };
  expenses.forEach((item, index) => {
    data.expenses[index] = item;
  });
  set(userBudgetRef, data);
}

// Update Summary
function updateSummary() {
  const totalExpenses = expenses.reduce((acc, item) => acc + item.amount, 0);
  const balance = totalBudget - totalExpenses;

  displayBudget.textContent = totalBudget;
  displayExpenses.textContent = totalExpenses;
  displayBalance.textContent = balance;
}

// Render Expenses
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
window.deleteExpense = function(index) {
  expenses.splice(index, 1);
  saveBudgetData();
  renderExpenses();
  updateSummary();
}

// Budget Form Submit
budgetForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = parseInt(totalBudgetInput.value);
  if (value > 0) {
    totalBudget = value;
    saveBudgetData();
    updateSummary();
    totalBudgetInput.value = '';
  }
});

// Expense Form Submit
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = expenseNameInput.value.trim();
  const amount = parseInt(expenseAmountInput.value);

  if (name && amount > 0) {
    expenses.push({ name, amount });
    saveBudgetData();
    renderExpenses();
    updateSummary();
    expenseNameInput.value = '';
    expenseAmountInput.value = '';
  }
});

// Reset Budget Button
resetBudgetBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to reset the budget?")) {
    totalBudget = 0;
    saveBudgetData();
    updateSummary();
  }
});

// Clear Expenses Button
clearExpensesBtn.addEventListener('click', () => {
  if (confirm("Clear all expenses?")) {
    expenses = [];
    saveBudgetData();
    renderExpenses();
    updateSummary();
  }
});