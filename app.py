from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


def normalize_weights(criteria):
    """Normalize weights so they sum to 1."""
    total = sum(c["weight"] for c in criteria)
    if total == 0:
        return criteria
    for c in criteria:
        c["normalized_weight"] = c["weight"] / total
    return criteria


def score_destinations(destinations, criteria):
    """
    Core scoring engine: Weighted scoring matrix.
    Score(destination) = Σ [ normalized_weight(criterion) × user_score(destination, criterion) ]
    All scores are on a 1–10 scale.
    """
    criteria = normalize_weights(criteria)
    results = []

    for dest in destinations:
        breakdown = []
        total_score = 0

        for criterion in criteria:
            cname = criterion["name"]
            weight = criterion["normalized_weight"]
            raw_score = dest["scores"].get(cname, 0)
            weighted_contribution = weight * raw_score
            total_score += weighted_contribution

            breakdown.append({
                "criterion": cname,
                "raw_score": raw_score,
                "weight": criterion["weight"],
                "normalized_weight": round(weight, 3),
                "contribution": round(weighted_contribution, 3),
            })

        # Sort breakdown by contribution descending (best reasons first)
        breakdown.sort(key=lambda x: x["contribution"], reverse=True)

        results.append({
            "destination": dest["name"],
            "total_score": round(total_score, 2),
            "breakdown": breakdown,
        })

    # Sort by total score descending
    results.sort(key=lambda x: x["total_score"], reverse=True)

    # Add rank and generate explanation
    for i, r in enumerate(results):
        r["rank"] = i + 1
        r["explanation"] = generate_explanation(r, i == 0)

    return results


def generate_explanation(result, is_winner):
    """Generate a human-readable explanation for a destination's score."""
    top = result["breakdown"][0]
    second = result["breakdown"][1] if len(result["breakdown"]) > 1 else None

    if is_winner:
        msg = f"🏆 Top pick! Excels at <strong>{top['criterion']}</strong>"
        if second:
            msg += f" and <strong>{second['criterion']}</strong>"
        msg += f", giving it the highest overall score of <strong>{result['total_score']}/10</strong>."
    else:
        msg = f"Strong in <strong>{top['criterion']}</strong>"
        if second:
            msg += f" and <strong>{second['criterion']}</strong>"
        msg += f", but scored <strong>{result['total_score']}/10</strong> overall."

    return msg


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/evaluate", methods=["POST"])
def evaluate():
    data = request.get_json()

    destinations = data.get("destinations", [])
    criteria = data.get("criteria", [])

    # Basic validation
    if len(destinations) < 2:
        return jsonify({"error": "Please add at least 2 destinations."}), 400
    if len(criteria) < 1:
        return jsonify({"error": "Please add at least 1 criterion."}), 400

    results = score_destinations(destinations, criteria)
    return jsonify({"results": results})


if __name__ == "__main__":
    app.run(debug=True)
