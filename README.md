# AquaGuard

AquaGuard is an ML-based early-warning system for identifying abnormal water consumption patterns in urban water supply networks.

The system learns normal consumption behavior from historical smart-meter data and flags statistically abnormal deviations to help utilities prioritize inspection and maintenance efforts.

## Problem Motivation

Urban water utilities often detect leaks and inefficiencies only after large volumes of treated water have already been wasted. Limited sensor coverage and lack of labeled leak data make early detection difficult at scale.

## Our Approach

- Analyze historical water consumption time-series data
- Learn normal demand patterns at a regional (zone) level
- Detect statistically abnormal deviations from expected usage
- Assign risk scores to prioritize inspection and maintenance efforts

## Project Structure

- `src/` – Core data processing and ML scripts  
- `data/` – Water consumption dataset  
- `outputs/` – Generated plots and results  
- `kiro/` – Planning and execution documentation (Kiro framework)

## Tech Stack

- Python
- Pandas, NumPy
- Matplotlib
- Prophet / statistical forecasting
- Scikit-learn (anomaly detection)

## Status

This project is under active development as part of HackXios.
