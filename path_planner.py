import math


class BoustrophedonPlanner:
    def __init__(self, field_boundary, obstacles=None, implement_width=1.2):
        self.field_boundary = field_boundary
        self.obstacles = obstacles or []
        self.implement_width = implement_width
        self.safety_margin = 0.1
        self.row_spacing = self._meters_to_degrees(implement_width - self.safety_margin)

    def _meters_to_degrees(self, meters):
        return meters / 111320.0

    def generate_coverage_path(self):
        if len(self.field_boundary) < 3:
            return []

        rotation_angle = self._find_optimal_rotation()

        rotated_boundary = self._rotate_polygon(self.field_boundary, rotation_angle)

        min_x = min(p[1] for p in rotated_boundary)
        max_x = max(p[1] for p in rotated_boundary)
        min_y = min(p[0] for p in rotated_boundary)
        max_y = max(p[0] for p in rotated_boundary)

        rows = []
        current_y = min_y + self.row_spacing / 2
        row_direction = 1

        while current_y < max_y:
            intersections = []

            for i in range(len(rotated_boundary)):
                p1 = rotated_boundary[i]
                p2 = rotated_boundary[(i + 1) % len(rotated_boundary)]

                if (p1[0] <= current_y <= p2[0]) or (p2[0] <= current_y <= p1[0]):
                    if abs(p2[0] - p1[0]) > 1e-10:
                        t = (current_y - p1[0]) / (p2[0] - p1[0])
                        x = p1[1] + t * (p2[1] - p1[1])
                        intersections.append(x)

            intersections.sort()

            if len(intersections) >= 2:
                if row_direction == 1:
                    row_points = [(current_y, intersections[0]), (current_y, intersections[-1])]
                else:
                    row_points = [(current_y, intersections[-1]), (current_y, intersections[0])]

                rows.append(row_points)

            current_y += self.row_spacing
            row_direction *= -1

        path = []
        for i, row in enumerate(rows):
            path.extend(row)

            if i < len(rows) - 1:
                turn_points = self._generate_smooth_turn(
                    row[-1],
                    rows[i + 1][0],
                    self.row_spacing
                )
                path.extend(turn_points)

        waypoints = [self._rotate_point(p, -rotation_angle) for p in path]

        waypoints_dict = [{'lat': lat, 'lon': lon} for lat, lon in waypoints]

        return waypoints_dict

    def _find_optimal_rotation(self):
        coords = self.field_boundary

        max_distance = 0
        optimal_angle = 0

        for i in range(len(coords)):
            for j in range(i + 1, len(coords)):
                p1 = coords[i]
                p2 = coords[j]

                distance = math.sqrt((p2[1] - p1[1])**2 + (p2[0] - p1[0])**2)

                if distance > max_distance:
                    max_distance = distance
                    angle = math.atan2(p2[0] - p1[0], p2[1] - p1[1])
                    optimal_angle = angle

        return optimal_angle

    def _rotate_polygon(self, coords, angle):
        centroid_lat = sum(p[0] for p in coords) / len(coords)
        centroid_lon = sum(p[1] for p in coords) / len(coords)

        rotated = []
        for lat, lon in coords:
            y, x = lat - centroid_lat, lon - centroid_lon

            new_y = y * math.cos(angle) - x * math.sin(angle)
            new_x = y * math.sin(angle) + x * math.cos(angle)

            rotated.append((new_y + centroid_lat, new_x + centroid_lon))

        return rotated

    def _rotate_point(self, point, angle):
        centroid_lat = sum(p[0] for p in self.field_boundary) / len(self.field_boundary)
        centroid_lon = sum(p[1] for p in self.field_boundary) / len(self.field_boundary)

        y, x = point[0] - centroid_lat, point[1] - centroid_lon

        new_y = y * math.cos(angle) - x * math.sin(angle)
        new_x = y * math.sin(angle) + x * math.cos(angle)

        return (new_y + centroid_lat, new_x + centroid_lon)

    def _generate_smooth_turn(self, start, end, row_spacing):
        start_y, start_x = start
        end_y, end_x = end

        control_offset = row_spacing * 0.5

        if start_x < end_x:
            cp1 = (start_y, start_x + control_offset)
            cp2 = (end_y, end_x - control_offset)
        else:
            cp1 = (start_y, start_x - control_offset)
            cp2 = (end_y, end_x + control_offset)

        turn_points = []
        num_points = 10

        for i in range(1, num_points):
            t = i / num_points

            y = (1-t)**3 * start_y + 3*(1-t)**2*t * cp1[0] + 3*(1-t)*t**2 * cp2[0] + t**3 * end_y
            x = (1-t)**3 * start_x + 3*(1-t)**2*t * cp1[1] + 3*(1-t)*t**2 * cp2[1] + t**3 * end_x

            turn_points.append((y, x))

        return turn_points
