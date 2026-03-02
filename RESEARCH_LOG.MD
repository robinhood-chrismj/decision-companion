RESEARCH_LOG.md — Research & AI Usage Log

AI Prompts Used
This project was developed with AI assistance. Below are the key prompts and what was accepted, modified, or rejected. The project would have taken more than a week if it wasn't with the help of AI. Helped me cut it short into 3 days!
PromptOutputDecision "How should I structure a weighted scoring matrix for a decision support system?"Explanation of MCDA methods, formula for weighted scoringAccepted — used as the core algorithm , "What are edge cases I should handle in a scoring system with user-defined weights?, "Division by zero, single criterion, all-equal scoresAccepted and implemented in normalize_weights()"Generate a Flask app structure for a decision companion tool"Full project scaffoldModified — simplified folder structure, removed database"Write a CSS design for a travel-themed web app"Design system with variables, typography, and components", "Accepted and extended with custom animations"

Concepts & References That Influenced the Approach

Multi-Criteria Decision Analysis (MCDA): Established field in operations research. The weighted scoring method is described in procurement literature (e.g., UK government procurement guidelines use a similar approach).
Weighted Sum Model (WSM): The formal name for the algorithm used. Formula: Score = Σ(w_i × s_i) where w_i is normalized weight and s_i is the raw score.
Likert scale for weights: Using 1–5 for importance weights is a standard UX pattern from survey design.
Fuzzy scoring inputs — replace integer scores with fuzzy membership functions (e.g., triangular sets for Low/Medium/High) to better model 
the natural uncertainty in human judgment, using a defuzzification step (centroid method) to produce final crisp scores for ranking.
Flask documentation: Used for route setup and jsonify response format.

Search Queries

"multi criteria decision analysis weighted scoring python"
"flask REST API POST request JSON"
"how to normalize weights decision matrix"
"travel destination comparison criteria examples"
"CSS design system variables tutorial"
"Fuzzy Logic for Decision Systems, handling human uncertaining"


What Was Accepted vs. Modified
Accepted from AI:

The core scoring formula and normalization approach
Edge case list (division by zero, single criterion)
CSS variable naming conventions

Modified from AI:

Suggested using a database for persistence — rejected in favor of stateless per-request design (simpler, no setup friction)
Suggested auto-scoring destinations via web APIs — rejected in favor of user-provided scores (more explainable)
AI generated verbose explanation text — simplified to concise, template-based strings

Rejected from AI:

Suggestion to use React — vanilla JS is sufficient and removes the build step. React seems to be an overkill.

Suggestion to include an AI scoring model — conflicts with the "explainable, not a black box" requirement. Was one of the requirements put forward when the task as assigned.



