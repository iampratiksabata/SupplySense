from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime
import json
from fastapi import HTTPException

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    try:
        # Read the CSV file
        contents = await file.read()
        df = pd.read_csv(pd.io.common.BytesIO(contents))
        
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/recommendations")
async def recommendations(request: Request):
    try:
        payload = await request.json()
        data = payload.get("data")
        if not data:
            return []
        supplier_metrics = data.get("supplier_metrics", [])
        flakiest_suppliers = data.get("flakiest_suppliers", [])
        recommendations = []
        # Supplier Optimization
        for s in supplier_metrics:
            if s["on_time_delivery_rate"] < 0.8 and s["total_order_value"] > 10000:
                recommendations.append({
                    "id": 1,
                    "type": "danger",
                    "title": "Supplier Optimization",
                    "message": f"{s['supplier_id']} is {int((1-s['on_time_delivery_rate'])*100)}% late on orders >$10k.",
                    "recommendation": f"Split large orders across suppliers or switch for orders >$5k."
                })
        # Diversification Suggestions
        region_counts = {}
        for s in supplier_metrics:
            region = s.get("region", "A")
            region_counts[region] = region_counts.get(region, 0) + 1
        total = sum(region_counts.values())
        for region, count in region_counts.items():
            if total > 0 and count / total > 0.8:
                recommendations.append({
                    "id": 2,
                    "type": "warning",
                    "title": "Diversification Suggestions",
                    "message": f"{int(count/total*100)}% of your supply comes from Region {region}.",
                    "recommendation": f"Add suppliers from other regions to reduce geo-risk."
                })
        # Order Timing
        # (Placeholder: real logic would need order date info)
        recommendations.append({
            "id": 3,
            "type": "info",
            "title": "Order Timing",
            "message": "Supplier Y performs 30% better on Tuesday deliveries. Adjust order schedule.",
            "recommendation": "Adjust order schedule to optimize for supplier performance."
        })
        # Quality Improvements
        for s in supplier_metrics:
            if s["avg_quality_score"] < 0.85 and s["total_orders"] > 10:
                recommendations.append({
                    "id": 4,
                    "type": "warning",
                    "title": "Quality Improvements",
                    "message": f"{s['supplier_id']}'s quality drops after {s['total_orders']} orders.",
                    "recommendation": "Cap orders or negotiate capacity expansion."
                })
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 