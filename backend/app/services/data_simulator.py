import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import time

class WaterDataSimulator:
    """Simulates real-time water consumption data with leak scenarios"""
    
    def __init__(self):
        self.regions = ["North", "South", "East", "West", "Central"]
        self.base_consumption = {
            "North": 12000,
            "South": 8000, 
            "East": 15000,
            "West": 13000,
            "Central": 14000
        }
        # Track elevated risk periods per region (not "leaks")
        self.elevated_risk_periods = {}
        self.last_risk_check = {}
        
    def generate_normal_consumption(self, region: str, timestamp: datetime) -> float:
        """Generate normal consumption with daily/seasonal patterns"""
        base = self.base_consumption[region]
        
        # Daily pattern (higher during day, lower at night)
        hour_factor = 0.7 + 0.6 * np.sin((timestamp.hour - 6) * np.pi / 12)
        
        # Weekly pattern (higher on weekdays)
        weekday_factor = 1.1 if timestamp.weekday() < 5 else 0.9
        
        # Seasonal variation
        seasonal_factor = 1.0 + 0.2 * np.sin((timestamp.month - 1) * np.pi / 6)
        
        # Random noise
        noise = np.random.normal(1.0, 0.1)
        
        return base * hour_factor * weekday_factor * seasonal_factor * noise
    
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
                
                # Calculate risk score based on deviation
                deviation = (consumption - normal_consumption) / normal_consumption
                if risk_period["severity"] == "high":
                    risk_score = min(85, 60 + deviation * 100)
                elif risk_period["severity"] == "medium":
                    risk_score = min(70, 45 + deviation * 80)
                else:
                    risk_score = min(55, 30 + deviation * 60)
                
                risk_status = "elevated"
        else:
            consumption = normal_consumption
            risk_status = "normal"
            risk_score = random.uniform(10, 40)  # Normal range
            
            # Check if we should trigger new elevated risk (much lower probability)
            hours_since_check = (now - self.last_risk_check[region]).total_seconds() / 3600
            
            # Only check every 6 hours, and very low probability (1% chance)
            if hours_since_check >= 6:
                self.last_risk_check[region] = now
                if random.random() < 0.01:  # 1% chance instead of 5%
                    risk_types = ["gradual", "sudden", "persistent"]
                    # Weight towards gradual (most common)
                    weights = [0.6, 0.25, 0.15]
                    risk_type = random.choices(risk_types, weights=weights)[0]
                    
                    self.elevated_risk_periods[region] = {
                        **self.simulate_elevated_risk(region, risk_type),
                        "start_time": now,
                        "type": risk_type
                    }
                    risk_status = "new_elevation"
        
        return {
            "region": region,
            "timestamp": now.isoformat(),
            "consumption": round(consumption, 2),
            "risk_status": risk_status,
            "risk_score": round(risk_score, 1),
            "risk_info": self.elevated_risk_periods.get(region, {})
        }
    
    def get_all_regions_data(self) -> list:
        """Get current data for all regions"""
        return [self.get_current_consumption(region) for region in self.regions]

# Global simulator instance
simulator = WaterDataSimulator()