extends Node3D

## Applies a thick dust‑storm fog to the WorldEnvironment at runtime
## and clamps the camera far‑plane so the terrain fades before the clip edge.

const FOG_COLOR: Color = Color(0.76, 0.62, 0.42, 1.0)
const FOG_DENSITY: float = 0.008
const CAMERA_FAR: float = 220.0
const BACKGROUND_COLOR: Color = Color(0.76, 0.62, 0.42, 1.0)

func _ready() -> void:
	# ---- Find or create the Environment ----
	var world_env: WorldEnvironment = _find_world_environment()
	if world_env == null:
		push_error("DustStorm: No WorldEnvironment found in the scene tree.")
		return

	var env: Environment = world_env.environment
	if env == null:
		env = Environment.new()
		world_env.environment = env

	# ---- Background → solid colour matching the fog ----
	env.background_mode = Environment.BG_COLOR
	env.background_color = BACKGROUND_COLOR

	# ---- Fog ----
	env.fog_enabled = true
	env.fog_light_color = FOG_COLOR
	env.fog_light_energy = 1.0
	env.fog_density = FOG_DENSITY
	env.fog_sky_affect = 1.0

	# ---- Camera far‑clip ----
	var camera: Camera3D = get_viewport().get_camera_3d()
	if camera:
		camera.far = CAMERA_FAR

	print("DustStorm: fog_enabled=%s  density=%.3f  camera_far=%.0f" % [
		env.fog_enabled, env.fog_density, CAMERA_FAR
	])


func _find_world_environment() -> WorldEnvironment:
	var nodes: Array[Node] = get_tree().get_nodes_in_group("world_environment")
	if not nodes.is_empty():
		return nodes[0] as WorldEnvironment

	# Fall back to scanning the tree
	return _scan_for_world_environment(get_tree().root)


func _scan_for_world_environment(node: Node) -> WorldEnvironment:
	if node is WorldEnvironment:
		return node as WorldEnvironment
	for child: Node in node.get_children():
		var result: WorldEnvironment = _scan_for_world_environment(child)
		if result != null:
			return result
	return null
