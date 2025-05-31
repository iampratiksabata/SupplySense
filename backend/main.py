from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime
import json
from fastapi import HTTPException
import openai
import os
from dotenv import load_dotenv
import google.generativeai as genai
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY environment variable not set.")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

class ChatMessage(BaseModel):
    message: str
    csv_data: Optional[str] = None

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

@app.post("/recommendation")
async def get_recommendation(request: Request):
    body = await request.json()
    analyze_result = body.get("analyze_result")
    csv_data = body.get("csv_data")
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not set.")
    if not analyze_result or not csv_data:
        raise HTTPException(status_code=400, detail="Missing analyze_result or csv_data.")

    try:
        # Prepare context for Gemini
        context = f"""
        Supply Chain Analysis Data:
        - Total Suppliers: {analyze_result.get('total_suppliers')}
        - Total Orders: {analyze_result.get('total_orders')}
        - Total Order Value: ${analyze_result.get('total_order_value'):,.2f}
        - Average Quality Score: {analyze_result.get('avg_quality_score'):.2%}
        - On-Time Delivery Rate: {analyze_result.get('on_time_delivery_rate'):.2%}

        Supplier Metrics:
        {json.dumps(analyze_result.get('supplier_metrics', []), indent=2)}

        Anomalous Suppliers:
        {json.dumps(analyze_result.get('flakiest_suppliers', []), indent=2)}

        Raw Data Sample:
        {csv_data[:1000]}  # First 1000 chars of CSV data for context
        """

        prompt = f"""You are a supply chain optimization expert. Analyze the following data and provide recommendations in a specific JSON format.

        Data to analyze:
        {context}

        Return a JSON object with two main sections:
        1. recommendations: An array of recommendation objects
        2. supplier_analysis: An object containing:
           - underperforming_suppliers: Array of supplier objects with poor performance
           - verified_suppliers: Array of supplier objects with good performance

        Each recommendation must be a JSON object with exactly these fields:
        {{
            "id": "unique_id",
            "title": "short_title",
            "description": "detailed_explanation",
            "recommendation": "specific_action_items",
            "severity": "critical|warning|info",
            "category": "supplier_performance|delivery_reliability|quality_control|cost_optimization|inventory_management|risk_mitigation|process_efficiency",
            "impact_score": number_1_to_10,
            "effort_score": number_1_to_10,
            "estimated_savings": "financial_or_operational_impact",
            "timeline": "immediate|short_term|long_term",
            "metrics": {{
                "current_value": "current_metric",
                "target_value": "target_metric",
                "improvement": "improvement_metric"
            }},
            "tags": ["tag1", "tag2"],
            "risk_level": "high|medium|low",
            "implementation_complexity": "high|medium|low",
            "department": "procurement|logistics|quality|inventory|finance",
            "priority": "p0|p1|p2"
        }}

        Each supplier object in underperforming_suppliers must have:
        {{
            "supplier_id": "id",
            "issues": ["issue1", "issue2"],
            "performance_metrics": {{
                "quality_score": number,
                "on_time_rate": number,
                "total_orders": number,
                "total_value": number
            }},
            "risk_level": "high|medium|low",
            "recommended_actions": ["action1", "action2"]
        }}

        Each supplier object in verified_suppliers must have:
        {{
            "supplier_id": "id",
            "strengths": ["strength1", "strength2"],
            "performance_metrics": {{
                "quality_score": number,
                "on_time_rate": number,
                "total_orders": number,
                "total_value": number
            }},
            "reliability_score": number,
            "recommended_usage": ["usage1", "usage2"]
        }}

        Focus on:
        1. Supplier performance issues (especially those with low on-time delivery rates)
        2. Quality control improvements (for suppliers with quality scores below 0.85)
        3. Delivery reliability (given the 46.67% on-time delivery rate)
        4. Cost optimization opportunities
        5. Risk mitigation strategies

        IMPORTANT: Return ONLY the JSON object with recommendations and supplier_analysis, no other text or explanation. The response must be valid JSON that can be parsed directly.
        """

        # Get recommendations from Gemini
        response = model.generate_content(prompt)
        
        # Clean the response to ensure it's valid JSON
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        response_data = json.loads(response_text)
        recommendations = response_data.get('recommendations', [])
        supplier_analysis = response_data.get('supplier_analysis', {
            'underperforming_suppliers': [],
            'verified_suppliers': []
        })

        # Add metadata
        return {
            "recommendations": recommendations,
            "supplier_analysis": supplier_analysis,
            "total_count": len(recommendations),
            "categories": [
                "supplier_performance",
                "delivery_reliability",
                "quality_control",
                "cost_optimization",
                "inventory_management",
                "risk_mitigation",
                "process_efficiency"
            ],
            "departments": [
                "procurement",
                "logistics",
                "quality",
                "inventory",
                "finance"
            ],
            "severity_counts": {
                "critical": sum(1 for rec in recommendations if rec["severity"] == "critical"),
                "warning": sum(1 for rec in recommendations if rec["severity"] == "warning"),
                "info": sum(1 for rec in recommendations if rec["severity"] == "info")
            },
            "priority_counts": {
                "p0": sum(1 for rec in recommendations if rec["priority"] == "p0"),
                "p1": sum(1 for rec in recommendations if rec["priority"] == "p1"),
                "p2": sum(1 for rec in recommendations if rec["priority"] == "p2")
            },
            "risk_distribution": {
                "high": sum(1 for rec in recommendations if rec["risk_level"] == "high"),
                "medium": sum(1 for rec in recommendations if rec["risk_level"] == "medium"),
                "low": sum(1 for rec in recommendations if rec["risk_level"] == "low")
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@app.post("/chat")
async def chat(message: ChatMessage):
    try:
        # Build a system prompt that instructs Gemini to use the CSV data
        prompt = f"""
You are a supply chain assistant. You will receive a user question and a CSV containing supplier data. The CSV columns are: supplier_id, expected_delivery, actual_delivery, order_value, quality_score.

When the user asks about a supplier (e.g., 'Tell me more about my supplier SUP003'), you must:
- Parse the CSV.
- Find the row(s) matching the supplier_id (e.g., SUP003).
- Summarize delivery performance (on-time or delayed, by how many days), order value, and quality score for that supplier.
- If the supplier is not found, say so.
- If the user asks for overall stats, analyze the CSV and provide insights.

Example:
User: Tell me more about my supplier SUP003
CSV: (see below)

Response:
Supplier SUP003 had 1 order:
- Expected delivery: 2024-03-02, Actual delivery: 2024-03-04 (2 days late)
- Order value: $30,000
- Quality score: 0.78 (below average)

Instructions:
- Always answer using only the CSV data provided.
- If the user asks for a summary, provide aggregate stats (average quality, % on-time, etc.).
- If the user asks about a specific supplier, show their delivery and quality details.
- Do not say you lack access to data—use the CSV.
- Be concise and clear.

User question: {message.message}
CSV data:
{message.csv_data or ''}
"""
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)