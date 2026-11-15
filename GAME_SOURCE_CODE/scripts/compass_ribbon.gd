class_name CompassRibbon
extends Control

var player_node: Node3D = null
var target_position: Vector3 = Vector3(50.0, 0.0, -50.0)

const CARDINALS: Array[Dictionary] = [
	{"angle": 0.0, "label": "N"},
	{"angle": 45.0, "label": "NE"},
	{"angle": 90.0, "label": "E"},
	{"angle": 135.0, "label": "SE"},
	{"angle": 180.0, "label": "S"},
	{"angle": 225.0, "label": "SW"},
	{"angle": 270.0, "label": "W"},
	{"angle": 315.0, "label": "NW"}
]

func _process(_delta: float) -> void:
	if not player_node:
		var p: Node = get_tree().get_first_node_in_group("player")
		if p is Node3D:
			player_node = p as Node3D
	queue_redraw()

func _draw() -> void:
	var w: float = size.x
	var h: float = size.y
	var center_x: float = w * 0.5

	# Background dark strip
	draw_rect(Rect2(0, 0, w, h), Color(0.06, 0.07, 0.09, 0.72), true)
	draw_rect(Rect2(0, 0, w, h), Color(0.25, 0.35, 0.45, 0.8), false, 1.0)

	var current_heading_deg: float = 0.0
	if player_node:
		# Rover forward is -Z in Godot coordinates
		var forward: Vector3 = -player_node.global_transform.basis.z
		current_heading_deg = rad_to_deg(atan2(forward.x, -forward.z))
		if current_heading_deg < 0.0:
			current_heading_deg += 360.0

	var px_per_deg: float = (w * 0.8) / 180.0

	# Draw tick marks & cardinal text
	for c: Dictionary in CARDINALS:
		var deg_diff: float = float(c["angle"]) - current_heading_deg
		while deg_diff < -180.0:
			deg_diff += 360.0
		while deg_diff > 180.0:
			deg_diff -= 360.0

		var x: float = center_x + deg_diff * px_per_deg
		if x >= 4.0 and x <= w - 4.0:
			# Tick line
			draw_line(Vector2(x, h - 8.0), Vector2(x, h), Color(0.7, 0.75, 0.8, 0.9), 1.5)
			# Cardinal Label
			var font: Font = ThemeDB.fallback_font
			var font_size: int = 11
			var text_str: String = String(c["label"])
			var string_size: Vector2 = font.get_string_size(text_str, HORIZONTAL_ALIGNMENT_CENTER, -1, font_size)
			draw_string(
				font,
				Vector2(x - string_size.x * 0.5, h - 11.0),
				text_str,
				HORIZONTAL_ALIGNMENT_CENTER,
				-1,
				font_size,
				Color(0.9, 0.92, 0.95, 1.0)
			)

	# Objective Heading Marker (Vibrant large Chevron/Arrow pointing to target)
	if player_node:
		var to_target: Vector3 = target_position - player_node.global_position
		var target_deg: float = rad_to_deg(atan2(to_target.x, -to_target.z))
		if target_deg < 0.0:
			target_deg += 360.0

		var obj_diff: float = target_deg - current_heading_deg
		while obj_diff < -180.0:
			obj_diff += 360.0
		while obj_diff > 180.0:
			obj_diff -= 360.0

		var obj_x: float = clampf(center_x + obj_diff * px_per_deg, 18.0, w - 18.0)
		
		# Vibrant glowing neon green colors
		var arrow_col: Color = Color(0.1, 1.0, 0.45, 1.0)
		var arrow_border: Color = Color(0.01, 0.15, 0.05, 1.0)
		
		# Outer / border polygon for high contrast readability against sky and dark ribbon
		var border_pts: PackedVector2Array = [
			Vector2(obj_x, 22.0),
			Vector2(obj_x - 14.0, 0.0),
			Vector2(obj_x - 6.0, 4.5),
			Vector2(obj_x, 12.0),
			Vector2(obj_x + 6.0, 4.5),
			Vector2(obj_x + 14.0, 0.0)
		]
		draw_colored_polygon(border_pts, arrow_border)

		# Inner vibrant arrow polygon
		var arrow_pts: PackedVector2Array = [
			Vector2(obj_x, 19.5),
			Vector2(obj_x - 11.5, 2.0),
			Vector2(obj_x - 5.0, 6.0),
			Vector2(obj_x, 10.5),
			Vector2(obj_x + 5.0, 6.0),
			Vector2(obj_x + 11.5, 2.0)
		]
		draw_colored_polygon(arrow_pts, arrow_col)

	# Center reticle mark (Current heading pointer)
	draw_line(Vector2(center_x, h - 16.0), Vector2(center_x, h), Color(1.0, 0.85, 0.25, 1.0), 2.0)
