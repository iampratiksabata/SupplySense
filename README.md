# SupplySense

SupplySense is a supply chain analytics platform that helps identify and analyze supplier reliability using machine learning and data visualization.

## Features

- CSV file upload for supplier delivery data
- Anomaly detection using Isolation Forest
- Interactive dashboard with real-time charts
- Supplier network visualization
- AI-powered insights and recommendations

## Tech Stack

- Frontend: React + Vite + TailwindCSS
- Backend: FastAPI (Python)
- ML: scikit-learn (Isolation Forest)
- Charts: Recharts + D3.js
- Data: CSV upload (no database for MVP)

## Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Git

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/supplysense.git
cd supplysense
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Set up Python virtual environment and install backend dependencies:
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running the Application

1. Start the backend server:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload
```

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Testing the Application

1. Use the sample data file provided in `backend/sample_data.csv`
2. Upload the CSV file through the web interface
3. Explore the dashboard, network graph, and insights

## CSV File Format

The application expects a CSV file with the following columns:
- supplier_id: Unique identifier for the supplier
- expected_delivery: Expected delivery timestamp
- actual_delivery: Actual delivery timestamp
- order_value: Value of the order in currency units
- quality_score: Quality score between 0 and 1

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
