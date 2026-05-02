"""Run this once to create and populate business.db"""
import sqlite3
import os
import random
from datetime import date, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "business.db")

PRODUCTS = [
    ("Laptop Pro", "Electronics", 1200),
    ("Wireless Mouse", "Electronics", 25),
    ("Standing Desk", "Furniture", 450),
    ("Office Chair", "Furniture", 320),
    ("Monitor 27\"", "Electronics", 380),
    ("Keyboard Mechanical", "Electronics", 110),
    ("Notebook Set", "Stationery", 15),
    ("Whiteboard", "Office Supplies", 85),
    ("Headphones", "Electronics", 200),
    ("Desk Lamp", "Furniture", 60),
]

REGIONS = ["North", "South", "East", "West"]
EMPLOYEES = [
    ("Alice Johnson", "Sales"),
    ("Bob Smith", "Sales"),
    ("Carol White", "Marketing"),
    ("David Brown", "Sales"),
    ("Emma Davis", "Marketing"),
    ("Frank Wilson", "Sales"),
    ("Grace Lee", "Operations"),
    ("Henry Taylor", "Sales"),
]


def random_date(start: date, end: date) -> date:
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))


conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# --- Tables ---
c.executescript("""
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS expenses;

CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit_price REAL NOT NULL
);

CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL
);

CREATE TABLE sales (
    id INTEGER PRIMARY KEY,
    product_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    region TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    revenue REAL NOT NULL,
    profit REAL NOT NULL,
    sale_date TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE expenses (
    id INTEGER PRIMARY KEY,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    expense_date TEXT NOT NULL
);
""")

# --- Seed products ---
for i, (name, category, price) in enumerate(PRODUCTS, start=1):
    c.execute("INSERT INTO products VALUES (?, ?, ?, ?)", (i, name, category, price))

# --- Seed employees ---
for i, (name, dept) in enumerate(EMPLOYEES, start=1):
    c.execute("INSERT INTO employees VALUES (?, ?, ?)", (i, name, dept))

# --- Seed sales (2 years of data) ---
random.seed(42)
start_date = date(2024, 1, 1)
end_date = date(2025, 12, 31)

for sale_id in range(1, 601):
    product_id = random.randint(1, len(PRODUCTS))
    employee_id = random.randint(1, len(EMPLOYEES))
    region = random.choice(REGIONS)
    qty = random.randint(1, 20)
    name, category, base_price = PRODUCTS[product_id - 1]
    price = round(base_price * random.uniform(0.9, 1.1), 2)
    revenue = round(price * qty, 2)
    profit = round(revenue * random.uniform(0.15, 0.40), 2)
    sale_date = random_date(start_date, end_date).isoformat()
    c.execute(
        "INSERT INTO sales VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (sale_id, product_id, employee_id, region, qty, price, revenue, profit, sale_date),
    )

# --- Seed expenses ---
expense_categories = ["Marketing", "Operations", "Logistics", "HR", "IT Infrastructure"]
for exp_id in range(1, 101):
    cat = random.choice(expense_categories)
    amount = round(random.uniform(500, 15000), 2)
    exp_date = random_date(start_date, end_date).isoformat()
    c.execute(
        "INSERT INTO expenses VALUES (?, ?, ?, ?, ?)",
        (exp_id, cat, amount, f"{cat} expense #{exp_id}", exp_date),
    )

conn.commit()
conn.close()
print(f"Database created at: {DB_PATH}")
print("Tables: products, employees, sales, expenses")
print("Rows: 10 products, 8 employees, 600 sales, 100 expenses")
