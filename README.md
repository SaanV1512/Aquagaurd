# 🚰 AquaGuard - Smart Water Supply Risk Monitoring System

AquaGuard is an **ML-based early-warning and prioritization system** for identifying abnormal water consumption patterns in urban water supply networks. The system learns normal consumption behavior from historical smart-meter data and flags statistically abnormal deviations to help utilities prioritize inspection and maintenance efforts.

## 🎯 **What AquaGuard Does**

AquaGuard is **not a leak detector** in the classical sense. It is a **risk monitoring and prioritization system** that:

- ✅ **Monitors consumption patterns** to identify deviations from normal behavior
- ✅ **Calculates risk scores** based on statistical analysis of usage data
- ✅ **Prioritizes regions** for inspection efforts based on severity and persistence
- ✅ **Provides early warning** of potential issues requiring attention
- ✅ **Helps utilities** allocate resources efficiently for maximum impact

## 🚀 **Key Features**

### **🔴 Live Risk Monitoring**
- **Real-time monitoring** of water consumption across all regions
- **Priority-based ranking** (#1, #2, #3) for inspection scheduling
- **Risk score visualization** with color-coded indicators
- **Trend analysis** with historical data tracking
- **Explainable decisions** ("Why is this region ranked high?")

### **📊 Historical Analysis**
- **Pattern recognition** from time-series consumption data
- **Anomaly detection** using advanced ML algorithms
- **Regional comparisons** and detailed breakdowns
- **Risk persistence tracking** over time

### **📋 Inspection Prioritization**
- **Priority scoring algorithm** combining risk, persistence, and severity
- **Resource allocation guidance** for field teams
- **Inspection ranking table** with actionable insights

## 🏗️ **System Architecture**

### **Backend (Python/FastAPI)**
- **ML Model**: Improved multi-region anomaly detection system
- **Data Processing**: Real-time consumption analysis and risk scoring
- **API Endpoints**: RESTful services for live monitoring and historical data
- **Data Simulator**: Realistic water consumption patterns for demonstration

### **Frontend (Next.js/React)**
- **Live Dashboard**: Real-time risk monitoring with priority rankings
- **Historical Analysis**: Detailed pattern analysis and regional views
- **Responsive Design**: Professional interface for water utility operators
- **Rich Visualizations**: Charts, trends, and status indicators

## 📁 **Project Structure**

```
AquaGuard/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── api/               # API routes and endpoints
│   │   ├── services/          # Business logic and ML models
│   │   └── main.py           # FastAPI application
│   ├── data/                  # Water consumption datasets
│   ├── models/               # Trained ML models
│   └── requirements.txt      # Python dependencies
├── frontend/                  # Next.js React frontend
│   ├── src/app/              # Application pages and components
│   │   ├── dashboard/        # Historical analysis pages
│   │   ├── live/            # Real-time monitoring page
│   │   └── page.tsx         # Landing page
│   ├── package.json         # Node.js dependencies
│   └── tailwind.config.js   # Styling configuration
├── kiro/                     # Planning and execution docs
├── outputs/                  # Generated analysis results
└── README.md                # This file
```

## 🛠️ **Tech Stack**

### **Backend**
- **Python 3.12** - Core language
- **FastAPI** - Modern web framework for APIs
- **Pandas & NumPy** - Data processing and analysis
- **Scikit-learn** - Machine learning algorithms
- **Prophet** - Time series forecasting
- **Uvicorn** - ASGI server

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management and effects

### **Data & ML**
- **Time Series Analysis** - Prophet forecasting models
- **Anomaly Detection** - Statistical and ML-based approaches
- **Risk Scoring** - Multi-factor priority algorithms
- **Real-time Processing** - Live data simulation and analysis

## 🚀 **Quick Start**

### **Prerequisites**
- Python 3.12+
- Node.js 18+
- npm or yarn

### **1. Clone Repository**
```bash
git clone <repository-url>
cd AquaGuard
```

### **2. Setup Backend**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
Backend will be available at: `http://127.0.0.1:8000`

### **3. Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at: `http://localhost:3000`

### **4. Access the System**
- **🔴 Live Monitoring**: `http://localhost:3000/live`
- **📊 Historical Analysis**: `http://localhost:3000/dashboard`
- **📋 Inspection Ranking**: `http://localhost:3000/dashboard/ranking`
- **🔧 API Documentation**: `http://127.0.0.1:8000/docs`

## 📊 **Data & Model Information**

### **Dataset**
- **Source**: Historical water consumption data (2023)
- **Format**: Daily consumption per region (5,916 - 19,892 liters/day)
- **Regions**: North, South, East, West, Central
- **Time Period**: Full year of consumption patterns

### **ML Model Features**
- **Multi-region analysis** with region-specific baselines
- **Anomaly detection** using statistical and ML approaches
- **Risk scoring** based on deviation magnitude and persistence
- **Priority calculation** combining multiple risk factors

## 🎯 **Use Cases**

### **For Water Utility Operators**
1. **Daily Monitoring**: Check live dashboard for current system status
2. **Inspection Planning**: Use priority rankings to schedule field visits
3. **Resource Allocation**: Focus efforts on highest-risk regions
4. **Trend Analysis**: Monitor consumption patterns over time

### **For Utility Managers**
1. **Performance Tracking**: Monitor system-wide risk metrics
2. **Efficiency Optimization**: Reduce water loss through targeted inspections
3. **Operational Planning**: Data-driven resource allocation decisions
4. **Reporting**: Generate insights for stakeholders and regulators

## 🔧 **API Endpoints**

### **Live Monitoring**
- `GET /live/current` - Current risk data for all regions
- `GET /live/ranking` - Live priority ranking with scores
- `GET /live/elevated` - Regions with elevated risk

### **Historical Analysis**
- `GET /regions` - Available regions list
- `GET /timeseries/{region}` - Historical time series data
- `GET /risk/{region}` - Detailed risk analysis for region
- `GET /ranking` - Historical ranking data

## 🎨 **Dashboard Features**

### **Live Risk Monitoring**
- **System Overview**: Key metrics and status indicators
- **Priority Table**: Regions ranked by inspection priority
- **Risk Trends**: Real-time charts showing consumption and risk patterns
- **Explainability**: Clear reasons for each region's priority ranking

### **Visual Elements**
- **Color Coding**: Green (normal), Yellow (elevated), Amber (medium), Red (high)
- **Priority Indicators**: #1, #2, #3 badges for inspection ranking
- **Status Badges**: Normal, Elevated Risk, New Alert
- **Trend Charts**: Mini visualizations for risk and consumption patterns

## 🤝 **Contributing**

This project was developed as part of **HackXios** hackathon. The system demonstrates advanced ML techniques applied to real-world water utility challenges.

### **Development Team**
- ML Model Development & Optimization
- Backend API & Data Processing
- Frontend Dashboard & Visualization
- System Integration & Testing

## 📄 **License**

This project is developed for educational and demonstration purposes as part of HackXios hackathon.

---

**AquaGuard** - Transforming water utility operations through intelligent risk monitoring and data-driven decision making. 🚰📊⚡