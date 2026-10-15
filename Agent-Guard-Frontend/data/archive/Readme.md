# 🛡️ Fraud Detection Dataset

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![ML Ready](https://img.shields.io/badge/ML-Ready-orange.svg)
![Dataset](https://img.shields.io/badge/Type-Dataset-purple.svg)

> A comprehensive financial fraud detection dataset designed for training, evaluating, and benchmarking machine learning models against real-world fraudulent transaction patterns.

---

## 📖 Table of Contents

- [Dataset Description](#-dataset-description)
- [Dataset Structure](#-dataset-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [Contributing](#-contributing)
- [License](#-license)
- [Authors](#-authors)

---

## 🔒 Dataset Description

The **Financial Fraud Detection Dataset** contains richly annotated data related to financial transactions and fraudulent patterns. It is purpose-built for training and evaluating machine learning models for fraud detection, covering transaction records, customer profiles, anomaly scores, and merchant information.

---

## 📁 Dataset Structure

```
data/
├── 📂 Transaction Data/
│   ├── transaction_records.csv       # Transaction ID, date, amount, customer ID
│   └── transaction_metadata.csv      # Additional metadata per transaction
│
├── 📂 Customer Profiles/
│   ├── customer_data.csv             # Name, age, address, contact details
│   └── account_activity.csv          # Balance, transaction history, account status
│
├── 📂 Fraudulent Patterns/
│   ├── fraud_indicators.csv          # Indicators of fraudulent/suspicious activity
│   └── suspicious_activity.csv       # Transactions flagged as suspicious
│
├── 📂 Transaction Amounts/
│   ├── amount_data.csv               # Transaction amounts per transaction
│   └── anomaly_scores.csv            # Anomaly scores indicating potential fraud
│
└── 📂 Merchant Information/
    ├── merchant_data.csv             # Merchant details involved in transactions
    └── transaction_category_labels.csv  # Category labels for transaction types

src/
└── data.py                           # Script to generate dataset from real-world data
```

---

## ⚙️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/fraud-detection-dataset.git
   cd fraud-detection-dataset
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Generate the dataset** *(optional — if CSV files are not pre-included)*:
   ```bash
   python src/data.py
   ```

---

## 💡 Usage

This dataset is suitable for a wide range of applications:

| Use Case | Description |
|----------|-------------|
| 🤖 **Model Training** | Train ML/DL models for financial fraud classification |
| 🔬 **Research** | Benchmark novel fraud detection algorithms and techniques |
| 📚 **Education** | Teach data analysts and scientists fraud detection methodologies |
| 📊 **Visualization** | Build dashboards and exploratory analysis notebooks |

**Quick Start Example:**

```python
import pandas as pd

# Load transaction data
transactions = pd.read_csv('data/Transaction Data/transaction_records.csv')
anomaly_scores = pd.read_csv('data/Transaction Amounts/anomaly_scores.csv')

# Merge and explore
df = transactions.merge(anomaly_scores, on='transaction_id')
print(df.head())
```

---

## 🤝 Contributing

Contributions are welcome and appreciated! To contribute:

1. **Fork** this repository
2. **Create a new branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and commit: `git commit -m 'Add some feature'`
4. **Push to your branch**: `git push origin feature/your-feature-name`
5. **Open a Pull Request**

Please ensure your contributions align with the dataset's focus on fraud detection and follow existing formatting conventions.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Project Maintainers** — *Agent Guard Team*
- Contributions are welcome from the community!

---

> ⭐ If you find this dataset useful, please consider **starring** the repository to show your support!
