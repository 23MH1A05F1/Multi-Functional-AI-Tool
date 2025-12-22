# xlsl-analytics

PROJECT LINK   https://teja-0504.github.io/Excel/


BACKEND LINK(RENDER)   https://dashboard.render.com/web/srv-d1paavje5dus73bkoha0/deploys/dep-d1porkidbo4c73bpg3eg


Backend activation link  https://excel-xz7q.onrender.com


Project: Excel Analytics Platform
Description:
A web-based platform that allows users to upload, analyze, and visualize data from Excel files. It combines a modern React frontend with a Node.js/Express backend, uses Python scripts for advanced data analysis, and provides both basic and advanced charting capabilities.

Key Features


User Authentication: Secure registration and login using JWT.    
Excel File Upload: Users can upload Excel files for analysis.    
Automated Data Analysis:  
    1.Primary: Python scripts pr ocess the data for detailed analytics.
    2.Fallback: If Python is unavailable, JavaScript provides a basic summary.
Chart Generation: Create visual charts based on the uploaded data.
Upload & Chart History: Users can view and manage their history.
Admin Features:
Admin panel to manage users and view platform statistics (e.g., active users, most-used chart types).
Theme Support: Light and dark mode for accessibility.
Performance & Reliability:
Caching prevents redundant processing.
Automatic cleanup of temporary files.
Timeout protection for backend processes.

Technology Stack
Frontend: React + Vite (with Redux Toolkit for state management)
Backend: Node.js, Express, MongoDB
Data Analysis: Python scripts (with JS fallback)
Deployment: Frontend on Vercel, Backend on Render.com

Usage Flow
1.Register/Login to the platform.
2.Upload an Excel file.
3.Analyze data (automatic summary and visualization generation).
4.Generate Charts from your data.
5.Review History of uploads and charts.
6.Admin users can access additional controls and statistics.

Live Project Links
Frontend: https://excel1-three.vercel.app

Backend Activation: https://excel-xz7q.onrender.com

Backend Dashboard: https://dashboard.render.com/web/srv-d1paavje5dus73bkoha0/deploys/dep-d1porkidbo4c73bpg3eg

Project Structure
backend/ – Express API, Python scripts for analytics
frontend/sheet-analysis/ – React app for the user interface
