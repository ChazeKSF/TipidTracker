document.addEventListener("DOMContentLoaded", function () {
    loadCategories();
    loadExpenses();
});

// Switch between tabs
function switchTab(tab) {
    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
    document.querySelector(`#${tab}`).classList.add("active");

    document.querySelectorAll(".tab-button").forEach(button => button.classList.remove("active"));
    event.target.classList.add("active");
}

// Add a new category
function addCategory() {
    let category = document.getElementById("new-category").value.trim();
    if (!category) {
        alert("Please enter a category name.");
        return;
    }

    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    if (categories.some(cat => cat.name.toLowerCase() === category.toLowerCase())) {
        alert("Category already exists!");
        return;
    }

    categories.push({ name: category, budget: 0, spent: 0 });
    localStorage.setItem("categories", JSON.stringify(categories));

    document.getElementById("new-category").value = "";
    loadCategories(); // Refresh categories immediately
    loadCategoryDropdown(); // Refresh delete dropdown
}

// Set budget for a category
function setBudget() {
    let category = document.getElementById("budget-category").value;
    let amount = parseFloat(document.getElementById("budget-amount").value);

    if (!amount || amount <= 0) {
        alert("Please enter a valid budget amount.");
        return;
    }

    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    categories.forEach(cat => {
        if (cat.name === category) {
            cat.budget = amount;
        }
    });

    localStorage.setItem("categories", JSON.stringify(categories));
    loadCategories(); // Update category budgets
}

// Add an expense
function addExpense() {
    let name = document.getElementById("expense-name").value.trim();
    let amount = parseFloat(document.getElementById("expense-amount").value);
    let category = document.getElementById("expense-category").value;
    let date = new Date().toLocaleString();

    if (!name || !amount || amount <= 0 || !category) {
        alert("Please fill in all fields correctly.");
        return;
    }

    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    expenses.push({ name, amount, category, date });
    localStorage.setItem("expenses", JSON.stringify(expenses));

    // Update category spending
    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    categories.forEach(cat => {
        if (cat.name === category) {
            cat.spent += amount;
        }
    });
    localStorage.setItem("categories", JSON.stringify(categories));

    document.getElementById("expense-name").value = "";
    document.getElementById("expense-amount").value = "";

    loadExpenses(); // Refresh list
    loadCategories(); // Update progress bars
}

// Load categories into dropdowns and budget bars
function loadCategories() {
    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    let expenseDropdown = document.getElementById("expense-category");
    let budgetDropdown = document.getElementById("budget-category");
    let budgetBars = document.getElementById("budget-bars");

    expenseDropdown.innerHTML = "";
    budgetDropdown.innerHTML = "";
    budgetBars.innerHTML = "";

    categories.forEach(cat => {
        expenseDropdown.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
        budgetDropdown.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;

        let percentage = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
        let color = percentage > 100 ? "red" : "#d9a404"; // Over-budget turns red

        budgetBars.innerHTML += `
            <p>${cat.name} (₱${cat.spent} / ₱${cat.budget})</p>
            <div style="width: 100%; background: #ddd; border-radius: 5px; overflow: hidden;">
                <div style="width: ${Math.min(percentage, 100)}%; height: 20px; background: ${color}; border-radius: 5px;"></div>
            </div>
        `;
    });

    loadCategoryDropdown(); // Refresh delete dropdown
}

// Load delete category dropdown
function loadCategoryDropdown() {
    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    let deleteDropdown = document.getElementById("delete-category");

    deleteDropdown.innerHTML = "";
    categories.forEach(cat => {
        deleteDropdown.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
    });
}

// Delete a category
function deleteCategory() {
    let category = document.getElementById("delete-category").value;
    if (!category) {
        alert("Please select a category to delete.");
        return;
    }

    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    categories = categories.filter(cat => cat.name !== category);
    localStorage.setItem("categories", JSON.stringify(categories));

    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    expenses = expenses.filter(exp => exp.category !== category);
    localStorage.setItem("expenses", JSON.stringify(expenses));

    loadCategories();
    loadExpenses();
}

// Load expenses into the new "Expense List" tab
function loadExpenses() {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let expenseList = document.getElementById("expense-list");
    expenseList.innerHTML = "";

    expenses.forEach((exp, index) => {
        let li = document.createElement("li");
        li.innerHTML = `${exp.name} - ₱${exp.amount} (${exp.category}) <span class="date">${exp.date}</span> 
                        <button onclick="deleteExpense(${index})">Delete</button>`;
        expenseList.appendChild(li);
    });
}

// Delete an expense
function deleteExpense(index) {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let removedExpense = expenses.splice(index, 1)[0];
    localStorage.setItem("expenses", JSON.stringify(expenses));

    // Update category spending after deletion
    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    categories.forEach(cat => {
        if (cat.name === removedExpense.category) {
            cat.spent -= removedExpense.amount;
        }
    });
    localStorage.setItem("categories", JSON.stringify(categories));

    loadExpenses();
    loadCategories();
}
