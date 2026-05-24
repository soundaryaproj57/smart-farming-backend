import cv2
import numpy as np


def get_affected_area(image_path):
    """
    Detect infected leaf area
    using color segmentation
    """

    img = cv2.imread(image_path)

    if img is None:
        return (
            "Unable to analyze",
            0
        )

    img = cv2.resize(
        img,
        (512, 512)
    )

    hsv = cv2.cvtColor(
        img,
        cv2.COLOR_BGR2HSV
    )

    # Green healthy leaf
    lower_green = np.array(
        [25, 40, 40]
    )

    upper_green = np.array(
        [95, 255, 255]
    )

    green_mask = cv2.inRange(
        hsv,
        lower_green,
        upper_green
    )

    # Diseased regions
    lower_disease = np.array(
        [5, 40, 20]
    )

    upper_disease = np.array(
        [30, 255, 255]
    )

    disease_mask = cv2.inRange(
        hsv,
        lower_disease,
        upper_disease
    )

    # Pixel count
    leaf_pixels = cv2.countNonZero(
        green_mask
    )

    disease_pixels = (
        cv2.countNonZero(
            disease_mask
        )
    )

    total_pixels = (
        leaf_pixels
        + disease_pixels
    )

    if total_pixels == 0:
        return (
            "Unable to analyze",
            0
        )

    infected_area = (
        disease_pixels
        / total_pixels
    ) * 100

    # Area description
    if infected_area < 10:
        area = (
            "Small spotted regions"
        )

    elif infected_area < 30:
        area = (
            "Leaf margins / edges"
        )

    elif infected_area < 60:
        area = (
            "Large infected regions"
        )

    else:
        area = (
            "Entire leaf affected"
        )

    return (
        area,
        round(
            infected_area,
            2
        )
    )