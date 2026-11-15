extends CharacterBody3D

signal telemetry_updated(data: Dictionary)

const JIGGLE_SPRING_STRENGTH: float = 54.0
const JIGGLE_DAMPING: float = 12.0
const JIGGLE_IMPACT_COOLDOWN_S: float = 0.22
const JIGGLE_MIN_IMPACT_SPEED_MPS: float = 2.5
const DRIVING_BOB_AMPLITUDE_M: float = 0.035
const DRIVING_BOB_RADIANS_PER_M: float = 1.5
const MAX_JIGGLE_ROTATION_RAD: float = 0.09

@export var max_forward_speed: float = 9.0
@export var max_reverse_speed: float = 4.0
@export var acceleration: float = 8.0
@export var braking_friction: float = 10.0
@export_range(0.0, 40.0, 1.0) var lateral_grip: float = 18.0
@export var turn_speed: float = 1.4
@export var max_climb_height: float = 0.35
@export var max_visual_lean_degrees: float = 45.0
@export var visual_lean_response: float = 8.0
@export var battery_drain_rate: float = 0.5
@export var max_battery: float = 100.0
@export var camera_sensitivity: float = 0.003

var rover_profile: String = "heavy"
var dust_storm_multiplier: float = 1.0
var current_z_level: int = 0
var current_relative_height_m: float = 0.0
var current_slope_deg: float = 0.0
var current_zone_name: String = "Gale Crater"
var battery: float = 100.0
var _starting_height: float = 0.0
var _camera_look_enabled: bool = false
var _visual_base_position: Vector3 = Vector3.ZERO
var _terrain_lean_pitch: float = 0.0
var _terrain_lean_roll: float = 0.0
var _visual_jiggle_offset: Vector3 = Vector3.ZERO
var _visual_jiggle_velocity: Vector3 = Vector3.ZERO
var _visual_jiggle_rotation: Vector3 = Vector3.ZERO
var _visual_jiggle_rotation_velocity: Vector3 = Vector3.ZERO
var _driving_bob_phase: float = 0.0
var _impact_jiggle_cooldown: float = 0.0

@onready var camera_pivot: Node3D = $CameraPivot
@onready var visual_root: Node3D = $Visuals

func _ready() -> void:
	add_to_group("player")
	floor_constant_speed = true
	floor_max_angle = deg_to_rad(60.0)
	floor_snap_length = 0.35
	floor_block_on_wall = false
	safe_margin = 0.04
	wall_min_slide_angle = deg_to_rad(5.0)
	battery = max_battery
	_visual_base_position = visual_root.position
	_terrain_lean_pitch = visual_root.rotation.x
	_terrain_lean_roll = visual_root.rotation.z
	call_deferred("_snap_to_ground_and_init_height")

func _snap_to_ground_and_init_height() -> void:
	await get_tree().physics_frame
	var space_state: PhysicsDirectSpaceState3D = get_world_3d().direct_space_state
	var query: PhysicsRayQueryParameters3D = PhysicsRayQueryParameters3D.create(
		Vector3(global_position.x, global_position.y + 100.0, global_position.z),
		Vector3(global_position.x, global_position.y - 500.0, global_position.z)
	)
	query.collision_mask = 1
	var hit: Dictionary = space_state.intersect_ray(query)
	if not hit.is_empty():
		global_position.y = hit["position"].y + 0.3
	_starting_height = global_position.y

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_RIGHT:
		_camera_look_enabled = event.pressed
	elif event is InputEventMouseMotion and _camera_look_enabled:
		camera_pivot.rotation.y -= event.relative.x * camera_sensitivity
		camera_pivot.rotation.x = clampf(
			camera_pivot.rotation.x - event.relative.y * camera_sensitivity,
			deg_to_rad(-55.0),
			deg_to_rad(20.0)
		)

func _physics_process(delta: float) -> void:
	_impact_jiggle_cooldown = maxf(0.0, _impact_jiggle_cooldown - delta)
	var throttle: float = Input.get_axis("move_down", "move_up")
	var steering: float = Input.get_axis("move_left", "move_right")
	var forward_direction: Vector3 = -global_basis.z
	var horizontal_velocity: Vector3 = Vector3(velocity.x, 0.0, velocity.z)
	var forward_speed: float = horizontal_velocity.dot(forward_direction)

	if absf(steering) > 0.0:
		var travel_direction: float = signf(forward_speed)
		if is_zero_approx(travel_direction):
			travel_direction = signf(throttle)
		if is_zero_approx(travel_direction):
			travel_direction = 1.0
		var speed_factor: float = clampf(horizontal_velocity.length() / 2.0, 0.75, 1.0)
		rotate_y(-steering * turn_speed * speed_factor * travel_direction * delta)

	forward_direction = -global_basis.z
	if is_on_floor():
		var lateral_direction: Vector3 = global_basis.x
		var lateral_speed: float = horizontal_velocity.dot(lateral_direction)
		var lateral_velocity: Vector3 = lateral_direction * lateral_speed
		horizontal_velocity = horizontal_velocity.move_toward(
			horizontal_velocity - lateral_velocity,
			lateral_grip * delta
		)

	var target_speed: float = throttle * max_forward_speed
	if throttle < 0.0:
		target_speed = throttle * max_reverse_speed
	if current_slope_deg > 0.0:
		target_speed *= maxf(0.45, 1.0 - current_slope_deg / 90.0)

	if not is_zero_approx(throttle):
		var target_velocity: Vector3 = forward_direction * target_speed
		horizontal_velocity = horizontal_velocity.move_toward(target_velocity, acceleration * delta)
		var uphill_drain: float = 1.0 + maxf(0.0, current_slope_deg / 15.0)
		var storm_drain: float = dust_storm_multiplier if rover_profile == "agile" else 1.0
		battery = maxf(0.0, battery - delta * battery_drain_rate * uphill_drain * storm_drain)
	else:
		horizontal_velocity = horizontal_velocity.move_toward(Vector3.ZERO, braking_friction * delta)

	velocity.x = horizontal_velocity.x
	velocity.z = horizontal_velocity.z
	if is_on_floor():
		velocity.y = 0.0
	else:
		velocity += get_gravity() * delta

	var starting_position: Vector3 = global_position
	var requested_motion: Vector3 = horizontal_velocity * delta
	var incoming_velocity: Vector3 = velocity
	var pre_collision_horizontal_velocity: Vector3 = horizontal_velocity
	move_and_slide()
	_trigger_obstacle_jiggle(incoming_velocity)
	var remaining_motion: Vector3 = requested_motion - Vector3(
		global_position.x - starting_position.x,
		0.0,
		global_position.z - starting_position.z
	)
	_try_climb_step(remaining_motion, pre_collision_horizontal_velocity)
	_update_visual_lean(delta)
	_update_visual_jiggle(delta, Vector2(velocity.x, velocity.z).length())
	_update_surface_telemetry()
	telemetry_updated.emit({
		"z_level": current_z_level,
		"relative_height_m": current_relative_height_m,
		"slope_deg": current_slope_deg,
		"zone_name": current_zone_name,
		"game_speed_mps": Vector2(velocity.x, velocity.z).length(),
		"battery": battery
	})

func _try_climb_step(remaining_motion: Vector3, pre_impact_velocity: Vector3) -> void:
	if max_climb_height <= 0.0 or remaining_motion.length_squared() < 0.0001:
		return

	var motion_direction: Vector3 = remaining_motion.normalized()
	var blocked_by_wall: bool = false
	for collision_index: int in range(get_slide_collision_count()):
		var collision: KinematicCollision3D = get_slide_collision(collision_index)
		var collision_normal: Vector3 = collision.get_normal()
		if collision_normal.dot(Vector3.UP) < cos(floor_max_angle) and collision_normal.dot(motion_direction) < -0.1:
			blocked_by_wall = true
			break
	if not blocked_by_wall or not is_on_floor():
		return

	var starting_transform: Transform3D = global_transform
	var raised_transform: Transform3D = starting_transform
	raised_transform.origin += Vector3.UP * max_climb_height
	if test_move(starting_transform, Vector3.UP * max_climb_height):
		return
	if test_move(raised_transform, remaining_motion):
		return

	global_transform = raised_transform
	var forward_collision: KinematicCollision3D = move_and_collide(remaining_motion)
	if forward_collision != null:
		global_transform = starting_transform
		return

	var drop_collision: KinematicCollision3D = move_and_collide(
		Vector3.DOWN * (max_climb_height + floor_snap_length + 0.15)
	)
	if drop_collision == null or drop_collision.get_normal().dot(Vector3.UP) < cos(floor_max_angle):
		global_transform = starting_transform
		return

	velocity.x = pre_impact_velocity.x
	velocity.z = pre_impact_velocity.z
	velocity.y = 0.0

func _update_visual_lean(delta: float) -> void:
	var space_state: PhysicsDirectSpaceState3D = get_world_3d().direct_space_state
	var front_left_height: float = _sample_ground_height(Vector3(-1.24, 0.0, -1.2), space_state)
	var front_right_height: float = _sample_ground_height(Vector3(1.24, 0.0, -1.2), space_state)
	var rear_left_height: float = _sample_ground_height(Vector3(-1.24, 0.0, 1.2), space_state)
	var rear_right_height: float = _sample_ground_height(Vector3(1.24, 0.0, 1.2), space_state)
	if (
		is_nan(front_left_height)
		or is_nan(front_right_height)
		or is_nan(rear_left_height)
		or is_nan(rear_right_height)
	):
		return

	var front_height: float = (front_left_height + front_right_height) * 0.5
	var rear_height: float = (rear_left_height + rear_right_height) * 0.5
	var left_height: float = (front_left_height + rear_left_height) * 0.5
	var right_height: float = (front_right_height + rear_right_height) * 0.5
	var lean_limit: float = deg_to_rad(max_visual_lean_degrees)
	var target_pitch: float = clampf(atan2(front_height - rear_height, 2.4), -lean_limit, lean_limit)
	var target_roll: float = clampf(atan2(right_height - left_height, 2.48), -lean_limit, lean_limit)
	var blend: float = clampf(delta * visual_lean_response, 0.0, 1.0)
	_terrain_lean_pitch = lerp_angle(_terrain_lean_pitch, target_pitch, blend)
	_terrain_lean_roll = lerp_angle(_terrain_lean_roll, target_roll, blend)

func _trigger_obstacle_jiggle(incoming_velocity: Vector3) -> void:
	if _impact_jiggle_cooldown > 0.0:
		return

	var incoming_horizontal_velocity: Vector3 = Vector3(
		incoming_velocity.x,
		0.0,
		incoming_velocity.z
	)
	var strongest_impact_speed: float = 0.0
	var strongest_impact_normal: Vector3 = Vector3.ZERO
	for collision_index: int in range(get_slide_collision_count()):
		var collision: KinematicCollision3D = get_slide_collision(collision_index)
		var collision_normal: Vector3 = collision.get_normal()
		if collision_normal.dot(Vector3.UP) >= 0.65:
			continue

		var horizontal_normal: Vector3 = Vector3(
			collision_normal.x,
			0.0,
			collision_normal.z
		).normalized()
		var impact_speed: float = maxf(
			0.0,
			-incoming_horizontal_velocity.dot(horizontal_normal)
		)
		if impact_speed > strongest_impact_speed:
			strongest_impact_speed = impact_speed
			strongest_impact_normal = collision_normal

	if strongest_impact_speed < JIGGLE_MIN_IMPACT_SPEED_MPS:
		return

	var local_normal: Vector3 = global_basis.inverse() * strongest_impact_normal
	local_normal.y = 0.0
	local_normal = local_normal.normalized()
	var speed_reference: float = maxf(absf(max_forward_speed), 0.1)
	var impact_ratio: float = clampf(
		strongest_impact_speed / speed_reference,
		0.0,
		1.25
	)
	_visual_jiggle_velocity += Vector3(
		local_normal.x * impact_ratio * 0.12,
		0.2 + impact_ratio * 0.35,
		local_normal.z * impact_ratio * 0.16
	)
	_visual_jiggle_rotation_velocity.x += local_normal.z * impact_ratio * 0.45
	_visual_jiggle_rotation_velocity.z -= local_normal.x * impact_ratio * 0.5
	_impact_jiggle_cooldown = JIGGLE_IMPACT_COOLDOWN_S

func _update_visual_jiggle(delta: float, horizontal_speed: float) -> void:
	var jiggle_acceleration: Vector3 = (
		-_visual_jiggle_offset * JIGGLE_SPRING_STRENGTH
		-_visual_jiggle_velocity * JIGGLE_DAMPING
	)
	_visual_jiggle_velocity += jiggle_acceleration * delta
	_visual_jiggle_offset += _visual_jiggle_velocity * delta
	_visual_jiggle_offset.x = clampf(_visual_jiggle_offset.x, -0.05, 0.05)
	_visual_jiggle_offset.y = clampf(_visual_jiggle_offset.y, -0.1, 0.1)
	_visual_jiggle_offset.z = clampf(_visual_jiggle_offset.z, -0.05, 0.05)

	var rotation_acceleration: Vector3 = (
		-_visual_jiggle_rotation * JIGGLE_SPRING_STRENGTH
		-_visual_jiggle_rotation_velocity * JIGGLE_DAMPING
	)
	_visual_jiggle_rotation_velocity += rotation_acceleration * delta
	_visual_jiggle_rotation += _visual_jiggle_rotation_velocity * delta
	_visual_jiggle_rotation.x = clampf(
		_visual_jiggle_rotation.x,
		-MAX_JIGGLE_ROTATION_RAD,
		MAX_JIGGLE_ROTATION_RAD
	)
	_visual_jiggle_rotation.z = clampf(
		_visual_jiggle_rotation.z,
		-MAX_JIGGLE_ROTATION_RAD,
		MAX_JIGGLE_ROTATION_RAD
	)

	_driving_bob_phase = wrapf(
		_driving_bob_phase + horizontal_speed * DRIVING_BOB_RADIANS_PER_M * delta,
		0.0,
		TAU
	)
	var speed_ratio: float = clampf(
		horizontal_speed / maxf(absf(max_forward_speed), 0.1),
		0.0,
		1.0
	)
	var driving_bob: float = sin(_driving_bob_phase) * DRIVING_BOB_AMPLITUDE_M * speed_ratio
	visual_root.position = _visual_base_position + _visual_jiggle_offset
	visual_root.position.y += driving_bob
	visual_root.rotation.x = _terrain_lean_pitch + _visual_jiggle_rotation.x
	visual_root.rotation.z = _terrain_lean_roll + _visual_jiggle_rotation.z

func _sample_ground_height(
	local_offset: Vector3,
	space_state: PhysicsDirectSpaceState3D
) -> float:
	var ray_start: Vector3 = global_transform * Vector3(
		local_offset.x,
		max_climb_height + 1.0,
		local_offset.z
	)
	var ray_end: Vector3 = global_transform * Vector3(
		local_offset.x,
		-max_climb_height - 0.75,
		local_offset.z
	)
	var query: PhysicsRayQueryParameters3D = PhysicsRayQueryParameters3D.create(ray_start, ray_end)
	query.collision_mask = 1
	query.exclude = [get_rid()]
	var hit: Dictionary = space_state.intersect_ray(query)
	if hit.is_empty():
		return NAN
	var hit_position: Vector3 = hit["position"]
	return hit_position.y

func _update_surface_telemetry() -> void:
	current_relative_height_m = global_position.y - _starting_height
	if not is_on_floor():
		return

	var floor_normal: Vector3 = get_floor_normal()
	var slope_magnitude: float = rad_to_deg(
		acos(clampf(floor_normal.dot(Vector3.UP), -1.0, 1.0))
	)
	var downhill_direction: Vector3 = Vector3.DOWN.slide(floor_normal)
	var horizontal_velocity: Vector3 = Vector3(velocity.x, 0.0, velocity.z)
	if slope_magnitude < 0.1 or downhill_direction.is_zero_approx():
		current_slope_deg = 0.0
		return

	current_slope_deg = slope_magnitude
	if horizontal_velocity.is_zero_approx():
		return
	if horizontal_velocity.normalized().dot(downhill_direction.normalized()) > 0.0:
		current_slope_deg = -slope_magnitude

func set_elevation_data(z_lvl: int, elev: float, slope: float, z_name: String) -> void:
	current_z_level = z_lvl
	current_relative_height_m = elev
	current_slope_deg = slope
	current_zone_name = z_name

func apply_rover_profile(profile_type: String) -> void:
	rover_profile = profile_type
	var body_mesh_inst: MeshInstance3D = visual_root.get_node_or_null("Body") as MeshInstance3D
	var deck_mesh_inst: MeshInstance3D = visual_root.get_node_or_null("EquipmentDeck") as MeshInstance3D
	var equip_mesh_inst: MeshInstance3D = visual_root.get_node_or_null("EquipmentModule") as MeshInstance3D

	if profile_type == "heavy":
		# HEAVY SURVEYOR (Curiosity / MMRTG Analog)
		max_forward_speed = 6.0
		max_reverse_speed = 3.0
		acceleration = 5.5
		braking_friction = 12.0
		turn_speed = 1.1
		max_climb_height = 0.25 # Lower clearance: bumps into rocks
		battery_drain_rate = 0.35 # Slow steady nuclear drain
		
		# Visual styling: Industrial olive-slate armored body with dark nuclear housing
		if body_mesh_inst:
			var mat := StandardMaterial3D.new()
			mat.albedo_color = Color(0.32, 0.38, 0.34) # Dark olive armored plate
			mat.metallic = 0.4
			mat.roughness = 0.6
			body_mesh_inst.material_override = mat
		if deck_mesh_inst:
			var mat := StandardMaterial3D.new()
			mat.albedo_color = Color(0.24, 0.28, 0.26)
			deck_mesh_inst.material_override = mat
		if equip_mesh_inst:
			# Cylindrical MMRTG look (compact, industrial charcoal)
			equip_mesh_inst.scale = Vector3(1.3, 1.4, 1.1)
			var mat := StandardMaterial3D.new()
			mat.albedo_color = Color(0.15, 0.16, 0.17)
			mat.metallic = 0.7
			equip_mesh_inst.material_override = mat

	elif profile_type == "agile":
		# AGILE SCOUT (Spirit / Opportunity Solar Analog)
		max_forward_speed = 11.0
		max_reverse_speed = 5.0
		acceleration = 9.5
		braking_friction = 9.0
		turn_speed = 1.6
		max_climb_height = 0.42 # High clearance: hops over surface rocks easily
		battery_drain_rate = 0.45 # Moderate in sun, but spikes in storm
		
		# Visual styling: Gold solar wings & crisp white aerodynamic chassis
		if body_mesh_inst:
			var mat := StandardMaterial3D.new()
			mat.albedo_color = Color(0.86, 0.88, 0.90) # Clean white aerodynamic body
			mat.metallic = 0.1
			mat.roughness = 0.3
			body_mesh_inst.material_override = mat
		if deck_mesh_inst:
			# Extended wide solar panel deck
			deck_mesh_inst.scale = Vector3(1.35, 1.0, 1.05)
			var mat := StandardMaterial3D.new()
			mat.albedo_color = Color(0.12, 0.16, 0.35) # Dark blue solar cells
			mat.metallic = 0.5
			mat.roughness = 0.2
			deck_mesh_inst.material_override = mat
		if equip_mesh_inst:
			# Solar antenna / gold satellite dish accent
			equip_mesh_inst.scale = Vector3(0.7, 0.9, 0.7)
			var mat := StandardMaterial3D.new()
			mat.albedo_color = Color(0.95, 0.78, 0.22) # Gold foil thermal coating
			mat.metallic = 0.8
			mat.roughness = 0.2
			equip_mesh_inst.material_override = mat

