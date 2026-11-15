extends StaticBody3D

func _ready() -> void:
	call_deferred("_create_rock_collisions")

func _create_rock_collisions() -> void:
	await get_tree().physics_frame
	var mesh_instances: Array[MeshInstance3D] = []
	_collect_mesh_instances(self, mesh_instances)

	if mesh_instances.is_empty():
		push_error("Rock cluster contains no mesh instances.")
		return

	var space_state: PhysicsDirectSpaceState3D = get_world_3d().direct_space_state
	var obstacle_count: int = 0
	for mesh_instance: MeshInstance3D in mesh_instances:
		if mesh_instance.mesh == null:
			push_error("Rock mesh '%s' has no mesh resource." % mesh_instance.name)
			continue

		_place_on_terrain(mesh_instance, space_state)
		var shape: ConvexPolygonShape3D = mesh_instance.mesh.create_convex_shape()
		if shape == null:
			push_error("Could not create a convex obstacle for '%s'." % mesh_instance.name)
			continue

		var collision_shape: CollisionShape3D = CollisionShape3D.new()
		collision_shape.name = "%sCollision" % mesh_instance.name
		collision_shape.shape = shape
		add_child(collision_shape)
		collision_shape.global_transform = mesh_instance.global_transform
		obstacle_count += 1

	print("Created %d rock obstacles." % obstacle_count)

func _place_on_terrain(
	mesh_instance: MeshInstance3D,
	space_state: PhysicsDirectSpaceState3D
) -> void:
	var mesh_bounds: AABB = mesh_instance.mesh.get_aabb()
	var local_bottom_center: Vector3 = Vector3(
		mesh_bounds.position.x + mesh_bounds.size.x * 0.5,
		mesh_bounds.position.y,
		mesh_bounds.position.z + mesh_bounds.size.z * 0.5
	)
	var bottom_world: Vector3 = mesh_instance.global_transform * local_bottom_center
	var ray_start: Vector3 = Vector3(bottom_world.x, 20000.0, bottom_world.z)
	var ray_end: Vector3 = Vector3(bottom_world.x, -20000.0, bottom_world.z)
	var query: PhysicsRayQueryParameters3D = PhysicsRayQueryParameters3D.create(ray_start, ray_end)
	query.collision_mask = 1
	query.exclude = [get_rid()]
	var hit: Dictionary = space_state.intersect_ray(query)

	if hit.is_empty():
		push_warning("Could not find terrain beneath rock '%s'." % mesh_instance.name)
		return

	var ground_position: Vector3 = hit["position"]
	var rock_position: Vector3 = mesh_instance.global_position
	rock_position.y += ground_position.y - bottom_world.y
	mesh_instance.global_position = rock_position

func _collect_mesh_instances(node: Node, result: Array[MeshInstance3D]) -> void:
	if node is MeshInstance3D:
		result.append(node)

	for child: Node in node.get_children():
		_collect_mesh_instances(child, result)
