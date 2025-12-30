import pandas as pd
from datetime import datetime, timedelta
import random
import math

class WaterDataSimulator:
    """Simulates real-time water consumption data with risk scenarios"""
    
    def __init__(self):
        self.regions = ["North", "South", "East", "West", "Central"]
        # Based on actual dataset: daily_usage ranges from ~6,000 to ~19,000 liters/day
        # Average: ~12,000-15,000 liters/day per region
        self.base_consumption = {
            "North": 12000,    # Liters per day (matching dataset)
            "South": 8000, 
            "East": 15000,
            "West": 13000,
            "Central": 14000
        }
        # Track elevated risk periods per region (not "leaks")
        self.elevated_risk_periods = {}
        self.last_risk_check = {}
        # Store previous values for smoother transitions
        self.previous_risk_scores = {}
        self.previous_consumption = {}
        # Initialize some regions with elevated risk for demo
        self._initialize_demo_risks()
        
    def _initialize_demo_risks(self):
        """Initialize some regions with elevated risk for demonstration"""
        now = datetime.now()
        
        # East region - high persistent risk
        self.elevated_risk_periods["East"] = {
            "multiplier": 1.6,
            "duration_hours": 120,  # 5 days
            "pattern": "persistent",
            "severity": "high",
            "start_time": now - timedelta(hours=48),  # Started 2 days ago
            "type": "persistent"
        }
        
        # West region - medium gradual risk  
        self.elevated_risk_periods["West"] = {
            "multiplier": 1.3,
            "duration_hours": 72,   # 3 days
            "pattern": "increasing",
            "severity": "medium", 
            "start_time": now - timedelta(hours=24),  # Started 1 day ago
            "type": "gradual"
        }
        
        # Initialize last check times
        for region in self.regions:
            self.last_risk_check[region] = now - timedelta(hours=random.randint(1, 6))
        
    def generate_normal_consumption(self, region: str, timestamp: datetime) -> float:
        """Generate normal consumption with realistic daily patterns and variations"""
        base = self.base_consumption[region]
        
        # Daily pattern (higher during day, lower at night) - more gradual
        hour_angle = (timestamp.hour - 6) * math.pi / 12
        hour_factor = 0.7 + 0.3 * (math.sin(hour_angle) + 1) / 2  # Smoother curve
        
        # Weekly pattern (higher on weekdays)
        weekday_factor = 1.05 if timestamp.weekday() < 5 else 0.95
        
        # Add realistic time-based variation (smoother changes)
        minute_variation = 1.0 + 0.02 * math.sin(timestamp.minute * math.pi / 30)
        second_variation = 1.0 + 0.01 * math.sin(timestamp.second * math.pi / 30)
        
        # Random noise (smaller for more realistic data)
        noise = random.uniform(0.98, 1.02)  # Only 2% variation
        
        result = base * hour_factor * weekday_factor * minute_variation * second_variation * noise
        return max(result, base * 0.4)  # Ensure reasonable minimum
    
    def simulate_elevated_risk(self, region: str, risk_type: str = "gradual") -> dict:
        """Simulate different types of elevated risk scenarios"""
        if risk_type == "sudden":
            # Sudden consumption spike - could be many causes
            return {
                "multiplier": random.uniform(1.4, 2.2),
                "duration_hours": random.randint(4, 24),
                "pattern": "constant",
                "severity": "medium"
            }
        elif risk_type == "gradual":
            # Gradual increase - infrastructure aging, usage changes
            return {
                "multiplier": random.uniform(1.2, 1.6),
                "duration_hours": random.randint(48, 336),  # 2-14 days
                "pattern": "increasing",
                "severity": "low"
            }
        elif risk_type == "persistent":
            # Persistent elevated usage - systematic issue
            return {
                "multiplier": random.uniform(1.3, 1.8),
                "duration_hours": random.randint(72, 240),  # 3-10 days
                "pattern": "fluctuating",
                "severity": "high"
            }
    
    def get_current_consumption(self, region: str) -> dict:
        """Get current consumption for a region (simulates real sensor reading)"""
        now = datetime.now()
        normal_consumption = self.generate_normal_consumption(region, now)
        consumption = normal_consumption  # Default value
        
        # Initialize last check time if not exists
        if region not in self.last_risk_check:
            self.last_risk_check[region] = now
        
        # Check if there's an active elevated risk period
        if region in self.elevated_risk_periods:
            risk_period = self.elevated_risk_periods[region]
            elapsed_hours = (now - risk_period["start_time"]).total_seconds() / 3600
            
            if elapsed_hours > risk_period["duration_hours"]:
                # Risk period ended
                del self.elevated_risk_periods[region]
                consumption = normal_consumption
                risk_status = "normal"
                risk_score = random.uniform(15, 35)  # Low risk
            else:
                # Apply risk effect
                if risk_period["pattern"] == "constant":
                    consumption = normal_consumption * risk_period["multiplier"]
                elif risk_period["pattern"] == "increasing":
                    progress = elapsed_hours / risk_period["duration_hours"]
                    multiplier = 1.0 + (risk_period["multiplier"] - 1.0) * progress
                    consumption = normal_consumption * multiplier
                elif risk_period["pattern"] == "fluctuating":
                    # Fluctuating pattern with some randomness
                    base_multiplier = risk_period["multiplier"]
                    fluctuation = random.uniform(0.8, 1.2)
                    consumption = normal_consumption * base_multiplier * fluctuation
                else:
                    consumption = normal_consumption * risk_period.get("multiplier", 1.0)
                
                # Calculate risk score based on deviation with smoother transitions
                deviation = (consumption - normal_consumption) / normal_consumption
                base_risk = 40  # Base risk for elevated periods
                
                if risk_period["severity"] == "high":
                    # Add some randomness for realistic variation
                    risk_variation = random.uniform(-5, 5)
                    risk_score = min(85, base_risk + 35 + deviation * 50 + risk_variation)
                elif risk_period["severity"] == "medium":
                    risk_variation = random.uniform(-3, 3)
                    risk_score = min(70, base_risk + 15 + deviation * 40 + risk_variation)
                else:
                    risk_variation = random.uniform(-2, 2)
                    risk_score = min(55, base_risk + 5 + deviation * 30 + risk_variation)
                
                # Ensure risk score doesn't drop too low during elevated periods
                risk_score = max(risk_score, 45 if risk_period["severity"] == "high" else 
                               35 if risk_period["severity"] == "medium" else 25)
                
                risk_status = "elevated"
        else:
            consumption = normal_consumption
            risk_status = "normal"
            # Add realistic variation to normal risk scores
            base_normal_risk = random.uniform(15, 35)
            time_variation = 5 * math.sin(now.minute * math.pi / 30)  # Gradual changes
            risk_score = max(10, min(45, base_normal_risk + time_variation))
            
            # Check if we should trigger new elevated risk (higher probability for demo)
            hours_since_check = (now - self.last_risk_check[region]).total_seconds() / 3600
            
            # Check every 2 hours, with 3% chance for more activity
            if hours_since_check >= 2:
                self.last_risk_check[region] = now
                if random.random() < 0.03:  # 3% chance for demo purposes
                    risk_types = ["gradual", "sudden", "persistent"]
                    # Weight towards gradual (most common)
                    weights = [0.5, 0.3, 0.2]
                    risk_type = random.choices(risk_types, weights=weights)[0]
                    
                    self.elevated_risk_periods[region] = {
                        **self.simulate_elevated_risk(region, risk_type),
                        "start_time": now,
                        "type": risk_type
                    }
                    risk_status = "new_elevation"
        
        # Smooth transitions using previous values
        if region in self.previous_risk_scores:
            # Smooth transition (80% previous + 20% new)
            risk_score = 0.8 * self.previous_risk_scores[region] + 0.2 * risk_score
        
        if region in self.previous_consumption:
            # Smooth consumption changes
            consumption = 0.9 * self.previous_consumption[region] + 0.1 * consumption
        
        # Store current values for next iteration
        self.previous_risk_scores[region] = risk_score
        self.previous_consumption[region] = consumption
        
        # Prepare risk_info with serializable data
        risk_info = self.elevated_risk_periods.get(region, {})
        if risk_info and "start_time" in risk_info:
            risk_info_serializable = risk_info.copy()
            risk_info_serializable["start_time"] = risk_info["start_time"].isoformat()
        else:
            risk_info_serializable = risk_info
        
        return {
            "region": region,
            "timestamp": now.isoformat(),
            "consumption": round(consumption, 2),
            "risk_status": risk_status,
            "risk_score": round(risk_score, 1),
            "risk_info": risk_info_serializable
        }
    
    def get_all_regions_data(self) -> list:
        """Get current data for all regions"""
        return [self.get_current_consumption(region) for region in self.regions]

# Global simulator instance
simulator = WaterDataSimulator()