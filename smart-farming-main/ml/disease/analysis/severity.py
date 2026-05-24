def get_severity(confidence, infected_area):
    if confidence > 80:
        return "Severe"
    elif confidence > 50:
        return "Moderate"
    else:
        return "Mild"
