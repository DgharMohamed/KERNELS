extends Node3D

const ROCK_SCENE: PackedScene = preload("res://assets/mars_rocks.glb")
const MAP_CENTER_M: Vector2 = Vector2.ZERO
const MAP_HALF_SIZE_M: float = 400.0
const MAP_EDGE_MARGIN_M: float = 35.0
const SPAWN_CLEAR_RADIUS_M: float = 45.0
const SMALL_ROCK_SPAWN_CLEAR_RADIUS_M: float = 28.0
const PLACEMENT_ATTEMPTS_PER_ROCK: int = 8
const LARGE_ROCK_CHANCE: float = 0.12
const SMALL_ROCK_MIN_HEIGHT_M: float = 0.15
const SMALL_ROCK_MAX_HEIGHT_M: float = 0.30
const LARGE_ROCK_MIN_HEIGHT_M: float = 1.5
const LARGE_ROCK_MAX_HEIGHT_M: float = 2.5
const LARGE_ROCK_COLLISION_MIN_HEIGHT_M: float = 0.8
const COLLISION_CACHE_SIZE_STEP_M: float = 0.05
const SMALL_COLLISION_FOOTPRINT_SCALE: float = 0.85

class RockSource:
	extends RefCounted

	var mesh: Mesh
	var basis: Basis
	var bounds: AABB
	var material_override: Material
	var collision_shapes: Dictionary = {}
	var transforms: Array[Transform3D] = []

class RockCollisionPlacement:
	extends RefCounted

	var shape: Shape3D
	var transform: Transform3D

@export_range(1000, 20000, 500) var rock_count: int = 12000
@export var random_seed: int = 20261114

func _ready() -> void:
	call_deferred("_build_rock_field")

func _build_rock_field() -> void:
	await get_tree().physics_frame
	var sources: Array[RockSource] = _load_rock_sources()
	if sources.is_empty():
		push_error("Rock field source contains no usable meshes.")
		return

	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = random_seed
	var space_state: PhysicsDirectSpaceState3D = get_world_3d().direct_space_state
	var collision_placements: Array[RockCollisionPlacement] = []
	var small_collision_faces: PackedVector3Array = PackedVector3Array()
	var placed_count: int = 0
	var small_rock_count: int = 0
	var large_rock_count: int = 0
	var small_collider_count: int = 0
	var skipped_count: int = 0

	for rock_index: int in range(rock_count):
		var placed: bool = false
		for attempt: int in range(PLACEMENT_ATTEMPTS_PER_ROCK):
			var candidate: Vector2 = _random_map_position(rng)
			var source_index: int = rng.randi_range(0, sources.size() - 1)
			var source: RockSource = sources[source_index]
			var rock_scale: float = _random_rock_scale(rng, source)
			if rock_scale <= 0.0:
				continue
			var scaled_source_bounds: AABB = _scaled_source_bounds(source, rock_scale)
			var is_large_rock: bool = (
				scaled_source_bounds.size.y >= LARGE_ROCK_COLLISION_MIN_HEIGHT_M
			)
			var clear_radius: float = (
				SPAWN_CLEAR_RADIUS_M
				if is_large_rock
				else SMALL_ROCK_SPAWN_CLEAR_RADIUS_M
			)
			if candidate.distance_to(MAP_CENTER_M) < clear_radius:
				continue

			var yaw_basis: Basis = Basis(Vector3.UP, rng.randf_range(0.0, TAU))
			var rock_basis: Basis = yaw_basis * source.basis.scaled(Vector3.ONE * rock_scale)
			var local_bottom_center: Vector3 = Vector3(
				scaled_source_bounds.position.x + scaled_source_bounds.size.x * 0.5,
				scaled_source_bounds.position.y,
				scaled_source_bounds.position.z + scaled_source_bounds.size.z * 0.5
			)
			var bottom_offset: Vector3 = yaw_basis * local_bottom_center
			var ground_y: float = _raycast_ground_height(
				candidate.x + bottom_offset.x,
				candidate.y + bottom_offset.z,
				space_state
			)
			if is_nan(ground_y):
				continue

			var rock_position: Vector3 = Vector3(
				candidate.x,
				ground_y - bottom_offset.y,
				candidate.y
			)
			var rock_transform: Transform3D = Transform3D(rock_basis, rock_position)
			source.transforms.append(rock_transform)
			if is_large_rock:
				var collision_shape: Shape3D = _get_collision_shape(source, rock_scale)
				if collision_shape != null:
					var placement: RockCollisionPlacement = RockCollisionPlacement.new()
					placement.shape = collision_shape
					placement.transform = Transform3D(yaw_basis, rock_position)
					collision_placements.append(placement)
			else:
				_append_small_collision_faces(
					small_collision_faces,
					scaled_source_bounds,
					yaw_basis,
					rock_position
				)
				small_collider_count += 1

			placed_count += 1
			if is_large_rock:
				large_rock_count += 1
			else:
				small_rock_count += 1
			placed = true
			break

		if not placed:
			skipped_count += 1

	_create_multimesh_batches(sources)
	_create_obstacle_colliders(collision_placements)
	_create_small_rock_collision(small_collision_faces)
	print("Scattered %d rocks (%d small, %d large); %d small step surfaces, %d large colliders, %d positions skipped." % [
		placed_count,
		small_rock_count,
		large_rock_count,
		small_collider_count,
		collision_placements.size(),
		skipped_count
	])

func _get_collision_shape(source: RockSource, rock_scale: float) -> Shape3D:
	var scaled_bounds: AABB = _scaled_source_bounds(source, rock_scale)
	var size_key: int = roundi(scaled_bounds.size.y / COLLISION_CACHE_SIZE_STEP_M)
	var cache_key: String = "%d_convex" % size_key
	var cached_shape: Shape3D = source.collision_shapes.get(cache_key) as Shape3D
	if cached_shape != null:
		return cached_shape

	var points: PackedVector3Array = source.mesh.get_faces()
	if points.is_empty():
		push_error("Rock mesh contains no triangle faces for collision.")
		return null

	var scaled_basis: Basis = source.basis.scaled(Vector3.ONE * rock_scale)
	for point_index: int in range(points.size()):
		points[point_index] = scaled_basis * points[point_index]

	var convex_shape: ConvexPolygonShape3D = ConvexPolygonShape3D.new()
	convex_shape.points = points
	var collision_shape: Shape3D = convex_shape

	source.collision_shapes[cache_key] = collision_shape
	return collision_shape

func _append_small_collision_faces(
	faces: PackedVector3Array,
	bounds: AABB,
	yaw_basis: Basis,
	rock_position: Vector3
) -> void:
	var center: Vector3 = bounds.get_center()
	var hw: float = bounds.size.x * 0.5 * SMALL_COLLISION_FOOTPRINT_SCALE
	var hl: float = bounds.size.z * 0.5 * SMALL_COLLISION_FOOTPRINT_SCALE
	var y_bot: float = bounds.position.y
	var y_top: float = bounds.position.y + bounds.size.y
	const TOP_SCALE: float = 0.35

	var b0: Vector3 = rock_position + yaw_basis * Vector3(center.x - hw, y_bot, center.z - hl)
	var b1: Vector3 = rock_position + yaw_basis * Vector3(center.x + hw, y_bot, center.z - hl)
	var b2: Vector3 = rock_position + yaw_basis * Vector3(center.x + hw, y_bot, center.z + hl)
	var b3: Vector3 = rock_position + yaw_basis * Vector3(center.x - hw, y_bot, center.z + hl)

	var t0: Vector3 = rock_position + yaw_basis * Vector3(center.x - hw * TOP_SCALE, y_top, center.z - hl * TOP_SCALE)
	var t1: Vector3 = rock_position + yaw_basis * Vector3(center.x + hw * TOP_SCALE, y_top, center.z - hl * TOP_SCALE)
	var t2: Vector3 = rock_position + yaw_basis * Vector3(center.x + hw * TOP_SCALE, y_top, center.z + hl * TOP_SCALE)
	var t3: Vector3 = rock_position + yaw_basis * Vector3(center.x - hw * TOP_SCALE, y_top, center.z + hl * TOP_SCALE)

	# Top face
	faces.append(t0); faces.append(t1); faces.append(t2)
	faces.append(t0); faces.append(t2); faces.append(t3)

	# Front slope (-Z)
	faces.append(b0); faces.append(t0); faces.append(t1)
	faces.append(b0); faces.append(t1); faces.append(b1)

	# Right slope (+X)
	faces.append(b1); faces.append(t1); faces.append(t2)
	faces.append(b1); faces.append(t2); faces.append(b2)

	# Back slope (+Z)
	faces.append(b2); faces.append(t2); faces.append(t3)
	faces.append(b2); faces.append(t3); faces.append(b3)

	# Left slope (-X)
	faces.append(b3); faces.append(t3); faces.append(t0)
	faces.append(b3); faces.append(t0); faces.append(b0)

func _create_small_rock_collision(faces: PackedVector3Array) -> void:
	if faces.is_empty():
		return

	var collision_shape: ConcavePolygonShape3D = ConcavePolygonShape3D.new()
	collision_shape.set_faces(faces)
	var obstacle_body: StaticBody3D = StaticBody3D.new()
	obstacle_body.name = "SmallRockStepSurfaces"
	add_child(obstacle_body)

	var shape_node: CollisionShape3D = CollisionShape3D.new()
	shape_node.name = "SmallRockStepCollision"
	shape_node.shape = collision_shape
	obstacle_body.add_child(shape_node)

func _scaled_source_bounds(source: RockSource, rock_scale: float) -> AABB:
	var scaled_basis: Basis = source.basis.scaled(Vector3.ONE * rock_scale)
	return source.bounds * Transform3D(scaled_basis, Vector3.ZERO)

func _load_rock_sources() -> Array[RockSource]:
	var sources: Array[RockSource] = []
	var source_root: Node3D = ROCK_SCENE.instantiate() as Node3D
	if source_root == null:
		push_error("Could not instantiate the Mars rock asset.")
		return sources

	add_child(source_root)
	var mesh_instances: Array[MeshInstance3D] = []
	_collect_mesh_instances(source_root, mesh_instances)
	var root_inverse: Transform3D = source_root.global_transform.affine_inverse()
	for mesh_instance: MeshInstance3D in mesh_instances:
		if mesh_instance.mesh == null:
			continue

		var source: RockSource = RockSource.new()
		source.mesh = mesh_instance.mesh
		source.bounds = mesh_instance.mesh.get_aabb()
		source.material_override = mesh_instance.material_override
		var relative_transform: Transform3D = root_inverse * mesh_instance.global_transform
		source.basis = relative_transform.basis
		sources.append(source)

	remove_child(source_root)
	source_root.free()
	return sources

func _create_multimesh_batches(sources: Array[RockSource]) -> void:
	var field_bounds: AABB = AABB(
		Vector3(MAP_CENTER_M.x - MAP_HALF_SIZE_M, -1000.0, MAP_CENTER_M.y - MAP_HALF_SIZE_M),
		Vector3(MAP_HALF_SIZE_M * 2.0, 4000.0, MAP_HALF_SIZE_M * 2.0)
	)
	for source_index: int in range(sources.size()):
		var source: RockSource = sources[source_index]
		if source.transforms.is_empty():
			continue

		var multimesh: MultiMesh = MultiMesh.new()
		multimesh.transform_format = MultiMesh.TRANSFORM_3D
		multimesh.mesh = source.mesh
		multimesh.instance_count = source.transforms.size()
		for instance_index: int in range(source.transforms.size()):
			multimesh.set_instance_transform(instance_index, source.transforms[instance_index])

		var batch: MultiMeshInstance3D = MultiMeshInstance3D.new()
		batch.name = "RockBatch_%02d" % source_index
		batch.multimesh = multimesh
		batch.material_override = source.material_override
		batch.custom_aabb = field_bounds
		add_child(batch)

func _create_obstacle_colliders(placements: Array[RockCollisionPlacement]) -> void:
	if placements.is_empty():
		return

	var obstacle_body: StaticBody3D = StaticBody3D.new()
	obstacle_body.name = "RockObstacles"
	add_child(obstacle_body)
	for placement_index: int in range(placements.size()):
		var collision_shape: CollisionShape3D = CollisionShape3D.new()
		collision_shape.name = "RockObstacle_%03d" % placement_index
		collision_shape.shape = placements[placement_index].shape
		collision_shape.transform = placements[placement_index].transform
		obstacle_body.add_child(collision_shape)

	print("Created %d large rock obstacles." % placements.size())

func _random_map_position(rng: RandomNumberGenerator) -> Vector2:
	var usable_half_size: float = MAP_HALF_SIZE_M - MAP_EDGE_MARGIN_M
	return Vector2(
		MAP_CENTER_M.x + rng.randf_range(-usable_half_size, usable_half_size),
		MAP_CENTER_M.y + rng.randf_range(-usable_half_size, usable_half_size)
	)

func _random_rock_scale(rng: RandomNumberGenerator, source: RockSource) -> float:
	var source_height: float = _scaled_source_bounds(source, 1.0).size.y
	if source_height <= 0.001:
		return 0.0

	var target_height: float
	if rng.randf() < LARGE_ROCK_CHANCE:
		target_height = rng.randf_range(LARGE_ROCK_MIN_HEIGHT_M, LARGE_ROCK_MAX_HEIGHT_M)
	else:
		target_height = rng.randf_range(SMALL_ROCK_MIN_HEIGHT_M, SMALL_ROCK_MAX_HEIGHT_M)
	target_height = roundf(target_height / COLLISION_CACHE_SIZE_STEP_M) * COLLISION_CACHE_SIZE_STEP_M
	return target_height / source_height

func _raycast_ground_height(
	x: float,
	z: float,
	space_state: PhysicsDirectSpaceState3D
) -> float:
	var query: PhysicsRayQueryParameters3D = PhysicsRayQueryParameters3D.create(
		Vector3(x, 20000.0, z),
		Vector3(x, -20000.0, z)
	)
	query.collision_mask = 1
	var hit: Dictionary = space_state.intersect_ray(query)
	if hit.is_empty():
		return NAN
	var ground_position: Vector3 = hit["position"]
	return ground_position.y

func _collect_mesh_instances(node: Node, result: Array[MeshInstance3D]) -> void:
	if node is MeshInstance3D:
		result.append(node)

	for child: Node in node.get_children():
		_collect_mesh_instances(child, result)
