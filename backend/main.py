from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime
import json

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Add both ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    # Read the CSV file
    df = pd.read_csv(file.file)
    
    # Convert date columns to datetime
    df['expected_delivery'] = pd.to_datetime(df['expected_delivery'])
    df['actual_delivery'] = pd.to_datetime(df['actual_delivery'])
    
    # Calculate metrics
    total_suppliers = len(df['supplier_id'].unique())
    total_orders = len(df)
    total_order_value = float(df['order_value'].sum())  # Convert to float
    avg_quality_score = float(df['quality_score'].mean())  # Convert to float
    
    # Calculate on-time delivery rate
    df['is_on_time'] = df['actual_delivery'] <= df['expected_delivery']
    on_time_delivery_rate = float(df['is_on_time'].mean())  # Convert to float
    
    # Calculate supplier metrics
    supplier_metrics = []
    for supplier_id in df['supplier_id'].unique():
        supplier_data = df[df['supplier_id'] == supplier_id]
        metrics = {
            'supplier_id': supplier_id,
            'total_orders': int(len(supplier_data)),  # Convert to int
            'avg_delay': float((supplier_data['actual_delivery'] - supplier_data['expected_delivery']).dt.days.mean()),  # Convert to float
            'on_time_delivery_rate': float(supplier_data['is_on_time'].mean()),  # Convert to float
            'avg_quality_score': float(supplier_data['quality_score'].mean()),  # Convert to float
            'total_order_value': float(supplier_data['order_value'].sum())  # Convert to float
        }
        supplier_metrics.append(metrics)
    
    # Detect anomalies using Isolation Forest
    features = ['order_value', 'quality_score']
    X = df[features].values
    clf = IsolationForest(contamination=0.1, random_state=42)
    df['anomaly_score'] = clf.fit_predict(X)
    
    # Get flakiest suppliers
    flakiest_suppliers = []
    for supplier_id in df['supplier_id'].unique():
        supplier_data = df[df['supplier_id'] == supplier_id]
        if len(supplier_data) > 0:  # Only include suppliers with data
            flakiest_suppliers.append({
                'supplier_id': supplier_id,
                'anomaly_score': int(supplier_data['anomaly_score'].iloc[0]),  # Convert to int
                'delay_days': float((supplier_data['actual_delivery'] - supplier_data['expected_delivery']).dt.days.mean()),  # Convert to float
                'quality_score': float(supplier_data['quality_score'].mean()),  # Convert to float
                'order_value': float(supplier_data['order_value'].sum())  # Convert to float
            })
    
    return {
        'total_suppliers': total_suppliers,
        'total_orders': total_orders,
        'total_order_value': total_order_value,
        'avg_quality_score': avg_quality_score,
        'on_time_delivery_rate': on_time_delivery_rate,
        'supplier_metrics': supplier_metrics,
        'flakiest_suppliers': flakiest_suppliers
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 