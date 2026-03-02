How to Run
bash# 1. Clone or download the project
cd decision-companion

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the server
python app.py

# 4. Open in browser
# http://127.0.0.1:5000

What I Would Improve with More Time

Sensitivity analysis — show how the ranking changes if you tweak a weight by ±1
Preset templates — "Budget travel", "Family vacation", "Adventure trip" with pre-filled criteria
Export to PDF — downloadable decision report
AI-enriched explanations — use an LLM to generate a narrative paragraph justifying the top recommendation
Persistent sessions — save and reload past comparisons
Criteria conflict detection — warn if two criteria are highly correlated (e.g., "Budget" and "Luxury")
Unit tests for the scoring engine