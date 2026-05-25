def get_severity(
    confidence,
    infected_area
):
    """
    Severity based on
    infected area %
    """

    if infected_area < 10:
        return "Mild"

    elif infected_area < 35:
        return "Moderate"

    else:
        return "Severe"