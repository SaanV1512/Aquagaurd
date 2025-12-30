# 🚰 AquaGuard - Smart Water Supply Risk Monitoring System

AquaGuard is an **ML-based early-warning and prioritization system** for identifying abnormal water consumption patterns in urban water supply networks. The system learns normal consumption behavior from historical smart-meter data and flags statistically abnormal deviations to help utilities prioritize inspection and maintenance efforts.
Check out the [LinkedIn post here](https://www.linkedin.com/posts/saanvi-choudhary-8a2985347_buildwithkiroathackxios2k25-hackxios-machinelearning-activity-7411827374746566656-GF63?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFbRyroBuJv7u2sEAljRXdKOsHCaXRMPZ6o)

## 🎯 **What AquaGuard Does**

AquaGuard is **not a leak detector** in the classical sense. It is a **risk monitoring and prioritization system** that:

- ✅ **Monitors consumption patterns** to identify deviations from normal behavior
- ✅ **Calculates risk scores** based on statistical analysis of usage data
- ✅ **Prioritizes regions** for inspection efforts based on severity and persistence
- ✅ **Provides early warning** of potential issues requiring attention
- ✅ **Helps utilities** allocate resources efficiently for maximum impact

---

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

---

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

---

## 📁 **Project Structure**

```
AquaGuard/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── api/               # API routes and endpoints
│   │   ├── services/          # Business logic and ML models
│   │   │   ├── aquaguard_service.py    # Main ML service
│   │   │   ├── improved_model.py       # Enhanced ML model
│   │   │   └── data_simulator.py       # Real-time data simulation
│   │   └── main.py           # FastAPI application
│   ├── data/                  # Water consumption datasets
│   │   ├── water_consumption_cleaned.csv      # Historical data
│   │   └── water_consumption_forecasting.csv  # Processed data
│   ├── models/               # Trained ML models
│   │   └── aquaguard_model.pkl        # Serialized model
│   └── requirements.txt      # Python dependencies
├── frontend/                  # Next.js React frontend
│   ├── src/app/              # Application pages and components
│   │   ├── dashboard/        # Historical analysis pages
│   │   │   ├── [region]/     # Individual region analysis
│   │   │   ├── ranking/      # Inspection priority ranking
│   │   │   └── page.tsx      # Main dashboard
│   │   ├── live/            # Real-time monitoring page
│   │   └── page.tsx         # Landing page
│   ├── package.json         # Node.js dependencies
│   └── tailwind.config.js   # Styling configuration
├── kiro/                     # Planning and execution docs
├── outputs/                  # Generated analysis results
└── README.md                # This file
```

---

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

---

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

---

## 📊 **Data & Model Information**

### **Current Dataset**
- **Source**: Historical water consumption data (2023)
- **Format**: Daily consumption per region (5,916 - 19,892 liters/day)
- **Regions**: North, South, East, West, Central
- **Time Period**: Full year of consumption patterns
- **Data Points**: ~1,825 records (365 days × 5 regions)

### **ML Model Features**
- **Multi-region analysis** with region-specific baselines
- **Anomaly detection** using statistical and ML approaches
- **Risk scoring** based on deviation magnitude and persistence
- **Priority calculation** combining multiple risk factors

---

## 🔄 **Current Data Synthesis & Simulation**

### **How Data is Currently Generated**
The system currently uses a **realistic data simulator** for demonstration purposes:

```python
# Real-time data simulation
class WaterDataSimulator:
    def generate_normal_consumption(self, region, timestamp):
        # Daily patterns (higher during day, lower at night)
        # Weekly patterns (higher on weekdays)
        # Realistic variations with smooth transitions
        # Base consumption: 8,000-15,000 L/day per region
        
    def simulate_elevated_risk(self, region, risk_type):
        # Gradual: 1.2-1.6x consumption (infrastructure aging)
        # Sudden: 1.4-2.2x consumption (operational issues)
        # Persistent: 1.3-1.8x consumption (systematic problems)
```

### **Simulation Features**
- **Realistic daily cycles**: Higher consumption during business hours
- **Weekly patterns**: Slightly elevated weekday usage
- **Smooth transitions**: 80% previous + 20% new value for realistic changes
- **Risk scenarios**: Pre-configured elevated risk periods for demonstration
- **Live updates**: New data points every 10 seconds

---

## 🔌 **Connecting to Real Sensors & Data Sources**

### **Option 1: IoT Water Meters**
```python
# Replace simulator with real meter API
import requests

def get_real_consumption(region: str):
    response = requests.get(f"https://water-meter-api.city.gov/region/{region}")
    return response.json()["current_consumption"]

# Update data_simulator.py
def get_current_consumption(self, region: str):
    # Replace simulated data with real sensor readings
    real_consumption = get_real_consumption(region)
    return self.process_real_data(real_consumption, region)
```

### **Option 2: SCADA System Integration**
```python
# Connect to existing SCADA system
from scada_client import SCADAClient

class RealDataService:
    def __init__(self):
        self.scada = SCADAClient("192.168.1.100")
    
    def read_meter_data(self, region):
        meter_id = self.region_to_meter_map[region]
        return self.scada.read_meter(meter_id)
```

### **Option 3: Database Integration**
```python
# Read from water utility database
import psycopg2
import pandas as pd

def fetch_live_data():
    conn = psycopg2.connect("postgresql://user:pass@db.water.gov/meters")
    query = """
        SELECT region, consumption, timestamp 
        FROM water_meters 
        WHERE timestamp > NOW() - INTERVAL '1 minute'
    """
    return pd.read_sql(query, conn)
```

### **Option 4: CSV/File-based Integration**
```python
# For utilities with file-based data exports
def process_meter_files():
    # Read from FTP/SFTP server or shared directory
    latest_file = get_latest_meter_file("/data/meters/")
    df = pd.read_csv(latest_file)
    return process_consumption_data(df)
```

---

## 🎯 **Use Cases & Applications**

### **For Water Utility Operators**
1. **Daily Monitoring**: Check live dashboard for current system status
2. **Inspection Planning**: Use priority rankings to schedule field visits
3. **Resource Allocation**: Focus efforts on highest-risk regions
4. **Trend Analysis**: Monitor consumption patterns over time
5. **Emergency Response**: Rapid identification of unusual consumption spikes

### **For Utility Managers**
1. **Performance Tracking**: Monitor system-wide risk metrics
2. **Efficiency Optimization**: Reduce water loss through targeted inspections
3. **Operational Planning**: Data-driven resource allocation decisions
4. **Reporting**: Generate insights for stakeholders and regulators
5. **Budget Planning**: Prioritize infrastructure investments

### **For Municipal Authorities**
1. **Water Conservation**: Identify areas of excessive consumption
2. **Infrastructure Planning**: Data-driven pipe replacement schedules
3. **Regulatory Compliance**: Monitor and report water system efficiency
4. **Public Health**: Early detection of potential contamination events

---

## 🔧 **API Endpoints**

### **Live Monitoring**
- `GET /live/current` - Current risk data for all regions
- `GET /live/ranking` - Live priority ranking with scores
- `GET /live/elevated` - Regions with elevated risk
- `GET /live/region/{region}` - Specific region live data

### **Historical Analysis**
- `GET /regions` - Available regions list
- `GET /timeseries/{region}` - Historical time series data
- `GET /risk/{region}` - Detailed risk analysis for region
- `GET /ranking` - Historical ranking data

### **Model Management**
- `GET /models/status` - Current model status and metadata

---

## 🎨 **Dashboard Features**

### **Live Risk Monitoring (`/live`)**
- **System Overview**: Key metrics and status indicators
- **Priority Table**: Regions ranked by inspection priority
- **Risk Trends**: Real-time charts showing consumption and risk patterns
- **Explainability**: Clear reasons for each region's priority ranking
- **Interactive Cards**: Hover effects and detailed region information

### **Historical Analysis (`/dashboard`)**
- **Risk Pattern Analysis**: Long-term trend identification
- **Regional Comparisons**: Side-by-side risk assessments
- **Detailed Views**: Individual region deep-dive analysis
- **Time Series Visualization**: Historical consumption and risk data

### **Inspection Ranking (`/dashboard/ranking`)**
- **Priority Queue**: Complete inspection priority list
- **Risk Status**: Current alert levels for each region
- **Scoring Methodology**: Transparent priority calculation explanation
- **Action Items**: Direct links to detailed region analysis

### **Visual Elements**
- **Color Coding**: Green (normal), Yellow (elevated), Amber (medium), Red (high)
- **Priority Indicators**: #1, #2, #3 badges for inspection ranking
- **Status Badges**: Normal, Elevated Risk, New Alert
- **Trend Charts**: Mini visualizations for risk and consumption patterns
- **Interactive Elements**: Hover effects, smooth transitions, live updates

---

## 🚧 **Current Limitations**

### **1. Data Source Limitations**
- **Simulated Data**: Currently uses synthetic data for demonstration
- **Historical Dataset**: Based on 2023 data, not real-time sensor feeds
- **Limited Regions**: Only 5 regions modeled (scalability not tested)
- **No Ground Truth**: No actual leak/failure labels for validation

### **2. Model Limitations**
- **Unsupervised Learning**: No labeled data for supervised training
- **Statistical Approach**: Relies on deviation detection, not predictive modeling
- **Regional Assumptions**: Assumes similar consumption patterns across regions
- **Seasonal Variations**: Limited modeling of long-term seasonal changes

### **3. Technical Limitations**
- **Single Server**: No distributed processing or load balancing
- **In-Memory Storage**: No persistent database for historical data
- **Basic Security**: No authentication or authorization implemented
- **Limited Scalability**: Not tested with large numbers of regions or high-frequency data

### **4. Integration Limitations**
- **No Real Sensors**: Requires integration with actual water meter infrastructure
- **No GIS Integration**: No geographic visualization or mapping
- **No Alert System**: No automated notifications or alarm systems
- **No Mobile App**: Web-only interface, no mobile-specific features

---

## 🔮 **Future Improvements & Roadmap**

### **Phase 1: Data Integration (Next 3 months)**
- **Real Sensor Integration**: Connect to actual IoT water meters
- **Database Implementation**: PostgreSQL/TimescaleDB for time-series data
- **Data Pipeline**: Automated ETL processes for continuous data ingestion
- **Data Validation**: Quality checks and anomaly detection in raw data

### **Phase 2: Model Enhancement (3-6 months)**
- **Advanced ML Models**: LSTM/GRU networks for time-series prediction
- **Ensemble Methods**: Combine multiple algorithms for better accuracy
- **Seasonal Modeling**: Advanced seasonal decomposition and forecasting
- **Labeled Data Integration**: Incorporate actual leak/failure records when available

### **Phase 3: System Scalability (6-9 months)**
- **Microservices Architecture**: Separate services for different functions
- **Container Deployment**: Docker/Kubernetes for scalable deployment
- **Load Balancing**: Handle multiple concurrent users and high data volumes
- **Caching Layer**: Redis for improved performance and response times

### **Phase 4: Advanced Features (9-12 months)**
- **GIS Integration**: Interactive maps with geographic risk visualization
- **Mobile Application**: Native iOS/Android apps for field inspectors
- **Alert System**: SMS/email notifications for critical risk events
- **Predictive Maintenance**: ML models for infrastructure failure prediction

### **Phase 5: Enterprise Features (12+ months)**
- **Multi-Tenant Support**: Support multiple water utilities in single deployment
- **Advanced Analytics**: Machine learning insights and trend prediction
- **Integration APIs**: Connect with existing utility management systems
- **Compliance Reporting**: Automated regulatory reporting and documentation

---

## 🔬 **Potential Enhancements**

### **Machine Learning Improvements**
```python
# Advanced anomaly detection
from sklearn.ensemble import IsolationForest
from tensorflow.keras.models import LSTM

# Seasonal decomposition
from statsmodels.tsa.seasonal import seasonal_decompose

# Real-time streaming ML
from river import anomaly, preprocessing
```

### **Data Sources Integration**
- **Weather Data**: Correlate consumption with weather patterns
- **Population Data**: Adjust baselines based on demographic changes
- **Infrastructure Age**: Factor in pipe age and maintenance history
- **Pressure Sensors**: Combine flow and pressure data for better detection

### **Advanced Visualizations**
- **3D Risk Mapping**: Geographic visualization of risk levels
- **Predictive Dashboards**: Forecast future risk levels
- **Interactive Timeline**: Historical event correlation and analysis
- **Mobile-Optimized Views**: Responsive design for field use

### **Integration Capabilities**
- **SCADA Integration**: Direct connection to existing control systems
- **GIS Systems**: Integration with ArcGIS or QGIS for mapping
- **Work Order Systems**: Automatic generation of inspection tickets
- **Asset Management**: Integration with infrastructure databases

---

## 🤝 **Contributing**

This project was developed as part of **HackXios** hackathon. The system demonstrates advanced ML techniques applied to real-world water utility challenges.

### **Development Team**
- **ML Model Development & Optimization**: Enhanced multi-region anomaly detection
- **Backend API & Data Processing**: FastAPI services and real-time data handling
- **Frontend Dashboard & Visualization**: React/Next.js interface with rich visualizations
- **System Integration & Testing**: End-to-end testing and deployment

### **How to Contribute**
1. **Fork the repository** and create a feature branch
2. **Implement improvements** following the existing code style
3. **Add tests** for new functionality
4. **Update documentation** including API changes
5. **Submit a pull request** with detailed description

---

## 📄 **License**

This project is developed for educational and demonstration purposes as part of HackXios hackathon.

---

## 🎉 **Acknowledgments**

- **HackXios Organizers** for providing the platform and challenge
- **Water Utility Industry** for inspiring real-world problem solving
- **Open Source Community** for the amazing tools and libraries used
- **Team Members** for collaborative development and innovation

---

**AquaGuard** - Transforming water utility operations through intelligent risk monitoring and data-driven decision making. 🚰📊⚡

*Built with ❤️ for sustainable water management and infrastructure optimization.*
