extends Node3D

const PARTICLE_COUNT_PER_WHEEL: int = 18
const PARTICLE_LIFETIME_S: float = 1.0
const MIN_FORWARD_SPEED_MPS: float = 0.8
const FULL_DUST_SPEED_MPS: float = 7.0

var _rover: CharacterBody3D
var _left_emitter: CPUParticles3D
var _right_emitter: CPUParticles3D

func _ready() -> void:
	_rover = get_parent() as CharacterBody3D
	if _rover == null:
		push_error("DustTrail must be a child of a CharacterBody3D.")
		set_physics_process(false)
		return

	var dust_mesh: SphereMesh = _create_dust_mesh()
	_left_emitter = _create_emitter("LeftDust", -1.0, dust_mesh)
	_right_emitter = _create_emitter("RightDust", 1.0, dust_mesh)

func _physics_process(_delta: float) -> void:
	if _rover == null:
		return

	var horizontal_velocity: Vector3 = Vector3(_rover.velocity.x, 0.0, _rover.velocity.z)
	var forward_direction: Vector3 = -_rover.global_basis.z
	var forward_speed: float = horizontal_velocity.dot(forward_direction)
	var lateral_speed: float = horizontal_velocity.dot(_rover.global_basis.x)
	var steering: float = Input.get_axis("move_left", "move_right")
	var should_emit: bool = _rover.is_on_floor() and forward_speed > MIN_FORWARD_SPEED_MPS
	var speed_ratio: float = clampf(forward_speed / FULL_DUST_SPEED_MPS, 0.0, 1.0)
	var lateral_bias: float = clampf(
		-steering * 0.55 + lateral_speed / FULL_DUST_SPEED_MPS * 0.3,
		-0.8,
		0.8
	)

	_update_emitter(_left_emitter, -1.0, should_emit, speed_ratio, steering, lateral_bias)
	_update_emitter(_right_emitter, 1.0, should_emit, speed_ratio, steering, lateral_bias)

func _create_emitter(
	emitter_name: String,
	wheel_side: float,
	dust_mesh: SphereMesh
) -> CPUParticles3D:
	var emitter: CPUParticles3D = CPUParticles3D.new()
	emitter.name = emitter_name
	emitter.position = Vector3(wheel_side * 1.24, 0.16, 1.35)
	emitter.amount = PARTICLE_COUNT_PER_WHEEL
	emitter.lifetime = PARTICLE_LIFETIME_S
	emitter.emitting = false
	emitter.local_coords = false
	emitter.direction = Vector3(0.0, 0.2, 1.0)
	emitter.spread = 18.0
	emitter.gravity = Vector3(0.0, -0.7, 0.0)
	emitter.initial_velocity_min = 0.4
	emitter.initial_velocity_max = 1.0
	emitter.damping_min = 0.5
	emitter.damping_max = 1.1
	emitter.scale_amount_min = 0.6
	emitter.scale_amount_max = 1.5
	emitter.color = Color.WHITE
	emitter.color_ramp = _create_dust_gradient()
	emitter.mesh = dust_mesh
	emitter.visibility_aabb = AABB(
		Vector3(-4.0, -2.0, -4.0),
		Vector3(8.0, 4.0, 8.0)
	)
	add_child(emitter)
	return emitter

func _update_emitter(
	emitter: CPUParticles3D,
	wheel_side: float,
	should_emit: bool,
	speed_ratio: float,
	steering: float,
	lateral_bias: float
) -> void:
	emitter.emitting = should_emit
	if not should_emit:
		return

	var outside_turn: float = maxf(0.0, -steering * wheel_side)
	emitter.direction = Vector3(lateral_bias, 0.2, 1.0).normalized()
	emitter.spread = lerpf(
		12.0,
		34.0,
		clampf(absf(lateral_bias) + speed_ratio * 0.2, 0.0, 1.0)
	)
	emitter.initial_velocity_min = lerpf(0.35, 0.75, speed_ratio)
	emitter.initial_velocity_max = lerpf(0.8, 1.6, speed_ratio) + outside_turn * 0.4

func _create_dust_mesh() -> SphereMesh:
	var material: StandardMaterial3D = StandardMaterial3D.new()
	material.albedo_color = Color.WHITE
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	material.vertex_color_use_as_albedo = true
	material.roughness = 1.0

	var mesh: SphereMesh = SphereMesh.new()
	mesh.radius = 0.17
	mesh.height = 0.15
	mesh.radial_segments = 6
	mesh.rings = 3
	mesh.material = material
	return mesh

func _create_dust_gradient() -> Gradient:
	var gradient: Gradient = Gradient.new()
	gradient.set_color(0, Color(0.77, 0.39, 0.21, 0.56))
	gradient.set_color(1, Color(0.77, 0.39, 0.21, 0.0))
	return gradient
