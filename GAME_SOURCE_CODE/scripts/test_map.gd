class_name TestMap
extends Node2D

@onready var cliffs_node: StaticBody2D = $Cliffs

func _ready() -> void:
	_create_colliders()
	_create_elevation_zones()
	queue_redraw()

func _create_colliders() -> void:
	if not cliffs_node:
		cliffs_node = StaticBody2D.new()
		cliffs_node.name = "Cliffs"
		add_child(cliffs_node)
	
	# Wall definitions: Rect2(x, y, width, height)
	var walls: Array[Rect2] = [
		# Outer world bounds
		Rect2(0, -20, 2600, 20),
		Rect2(0, 1600, 2600, 20),
		Rect2(-20, 0, 20, 1600),
		Rect2(2600, 0, 20, 1600),
		
		# Z2 Cliff perimeter (opening at y: 700-900)
		Rect2(700, 190, 1700, 20),
		Rect2(700, 1400, 1700, 20),
		Rect2(2400, 200, 20, 1200),
		Rect2(690, 200, 20, 500),
		Rect2(690, 900, 20, 500),
		
		# Ramp 1->2 guard rails
		Rect2(500, 690, 200, 15),
		Rect2(500, 895, 200, 15),
		
		# Z3 Cliff perimeter (opening at y: 700-900)
		Rect2(1450, 390, 800, 20),
		Rect2(1450, 1200, 800, 20),
		Rect2(2250, 400, 20, 800),
		Rect2(1440, 400, 20, 300),
		Rect2(1440, 900, 20, 300),
		
		# Ramp 2->3 guard rails
		Rect2(1250, 690, 200, 15),
		Rect2(1250, 895, 200, 15),
	]
	
	for w in walls:
		var col := CollisionShape2D.new()
		var box := RectangleShape2D.new()
		box.size = w.size
		col.shape = box
		col.position = w.position + (w.size * 0.5)
		cliffs_node.add_child(col)

func _create_elevation_zones() -> void:
	var zones_data: Array[Dictionary] = [
		{
			"name": "Zone_Z1",
			"rect": Rect2(0, 0, 2600, 1600),
			"level": 1,
			"elevation": 0.0,
			"slope": 0.0,
			"label": "Basin Floor (Z1)"
		},
		{
			"name": "Zone_Ramp12",
			"rect": Rect2(500, 700, 200, 200),
			"level": 1,
			"elevation": 25.0,
			"slope": 12.0,
			"label": "Ramp 1->2 (+12° Slope)"
		},
		{
			"name": "Zone_Z2",
			"rect": Rect2(700, 200, 1700, 1200),
			"level": 2,
			"elevation": 50.0,
			"slope": 0.0,
			"label": "Midland Plains (Z2)"
		},
		{
			"name": "Zone_Ramp23",
			"rect": Rect2(1250, 700, 200, 200),
			"level": 2,
			"elevation": 85.0,
			"slope": 18.0,
			"label": "Ramp 2->3 (+18° Slope)"
		},
		{
			"name": "Zone_Z3",
			"rect": Rect2(1450, 400, 800, 800),
			"level": 3,
			"elevation": 120.0,
			"slope": 0.0,
			"label": "Highland Rim (Z3)"
		}
	]
	
	for d in zones_data:
		var zone := ElevationZone.new()
		zone.name = d["name"]
		zone.z_level = d["level"]
		zone.elevation_m = d["elevation"]
		zone.slope_deg = d["slope"]
		zone.zone_name = d["label"]
		
		var col := CollisionShape2D.new()
		var box := RectangleShape2D.new()
		var r: Rect2 = d["rect"]
		box.size = r.size
		col.shape = box
		col.position = r.position + (r.size * 0.5)
		
		zone.add_child(col)
		add_child(zone)

func _draw() -> void:
	# Draw styled cliff outlines and ramp arrows for clear visual feedback
	var cliff_color := Color(0.15, 0.15, 0.15, 0.8)
	var ramp_arrow_color := Color(1.0, 1.0, 1.0, 0.9)
	
	# Z2 Cliff Line (excluding ramp opening)
	draw_line(Vector2(700, 200), Vector2(2400, 200), cliff_color, 4.0)
	draw_line(Vector2(2400, 200), Vector2(2400, 1400), cliff_color, 4.0)
	draw_line(Vector2(2400, 1400), Vector2(700, 1400), cliff_color, 4.0)
	draw_line(Vector2(700, 200), Vector2(700, 700), cliff_color, 4.0)
	draw_line(Vector2(700, 900), Vector2(700, 1400), cliff_color, 4.0)
	
	# Z3 Cliff Line (excluding ramp opening)
	draw_line(Vector2(1450, 400), Vector2(2250, 400), cliff_color, 4.0)
	draw_line(Vector2(2250, 400), Vector2(2250, 1200), cliff_color, 4.0)
	draw_line(Vector2(2250, 1200), Vector2(1450, 1200), cliff_color, 4.0)
	draw_line(Vector2(1450, 400), Vector2(1450, 700), cliff_color, 4.0)
	draw_line(Vector2(1450, 900), Vector2(1450, 1200), cliff_color, 4.0)
	
	# Ramp border rails
	draw_line(Vector2(500, 700), Vector2(700, 700), cliff_color, 3.0)
	draw_line(Vector2(500, 900), Vector2(700, 900), cliff_color, 3.0)
	draw_line(Vector2(1250, 700), Vector2(1450, 700), cliff_color, 3.0)
	draw_line(Vector2(1250, 900), Vector2(1450, 900), cliff_color, 3.0)
