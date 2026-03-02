BUILD_PROCESS.md — How WanderDecide Was Built

Overview
I prioritised avoiding the use of AI in any way in the implementation. Fuzzy logic seems more complex and Weighted Sum Model (WSM) is a much simpler approach to meet the requirement mentioned in the task given. 
My priority is to demonstrate my ability to fulfil the given requirements in the simplest and a hastle-free way. I believe in minimalism and a straight-to-the-point approach.  
->For ease of access visit : https://decision-companion-s2mv.onrender.com/ -> Deployed & Working!

How I Started
The first step was understanding what the assignment was actually evaluating. Re-reading the brief, it's clear the evaluators care more about thinking process and transparency than feature count. So I started by defining the algorithm before writing any code.
First decision made: What algorithm to use.
I considered three options:

Weighted Scoring Matrix — simple arithmetic, fully explainable
Decision Tree — rule-based branching, harder to generalize
Fuzzy logic - Handles Linguistic uncertainty well, immensely complex especially when compared to the benefit it provides.
AHP (Analytic Hierarchy Process) — more rigorous, but complex to explain to non-experts

I chose Weighted Scoring Matrix because:

It directly satisfies the "not a black box" constraint
A user can verify the math themselves
It's used in real-world procurement and policy decisions — so it's defensible


How Thinking Evolved
Initial idea: Build a simple CLI tool.
Evolved to: A web app, because:

Visual scoring matrix is much clearer in a table
Users can see results update without re-running commands
It's easier to demo in a portfolio context

Score input approach changed:

First thought: Let the system auto-score destinations using web data
Rejected: Too dependent on external APIs, adds failure points, harder to explain
Final: User self-scores — keeps the system honest and the logic transparent


Alternative Approaches Considered
ApproachWhy Rejected Machine learning model No training data; overkill for 3–8 options. Decision tree: Hard to generalize; becomes a long if/else chainGoogle Sheets integrationAdds OAuth complexity for no benefitReact frontendOverkill — vanilla JS is sufficient and has no build stepExternal destination data APIAdds network dependency, harder to explain scores

Refactoring Decisions

Normalization moved to backend: Initially considered doing weight normalization in JS, but moved it to app.py so the logic is in one place and testable
Explanation generation: First version just returned scores. Added generate_explanation() to make results human-readable without needing AI
Breakdown sorting: Results breakdown is sorted by contribution (highest first) so the most impactful criterion appears at the top — makes the explanation immediately clear


Mistakes and Corrections

Mistake: Initially used raw weights in the score formula instead of normalized weights. This meant that adding more criteria artificially inflated scores.
Fix: Added normalize_weights() to convert weights to fractions summing to 1, so adding criteria doesn't change the 0–10 output scale.
Mistake: Score input IDs used destination names directly, causing JS bugs when names had spaces or special characters.
Fix: Added a sanitize() function to replace non-alphanumeric characters with underscores for safe DOM IDs.


What Changed During Development

Added quick-add buttons for common criteria (Budget, Weather, Safety) — reduces friction and helps users understand what kinds of criteria to use
Added score bars in the results view — purely visual, but makes ranking differences immediately obvious
Added collapsible breakdown per destination — lets users drill into why a destination scored the way it did

Added keyboard support (Enter key to add items) — small UX improvement that makes the flow feel faster
