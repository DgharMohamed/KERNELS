extends StaticBody3D

const PLAYABLE_REGION_SIZE_M: Vector2 = Vector2(800.0, 800.0)
const PLAYABLE_REGION_CENTER_M: Vector2 = Vector2.ZERO
const BOUNDARY_WALL_THICKNESS_M: float = 4.0
const BOUNDARY_VERTICAL_PADDING_M: float = 100.0
const TERRAIN_MATERIAL: ShaderMaterial = preload("res://assets/gale_crater_terrain.tres")

func _ready() -> void:
	var mesh_instances: Array[MeshInstance3D] = []
	_collect_mesh_instances(self, mesh_instances)

	if mesh_instances.is_empty():
		push_error("Terrain collider has no MeshInstance3D children.")
		return

	var terrain_min_y: float = INF
	var terrain_max_y: float = -INF
	for mesh_instance: MeshInstance3D in mesh_instances:
		if mesh_instance.mesh == null:
			push_error("Terrain mesh '%s' has no mesh resource." % mesh_instance.name)
			continue

		var cropped_mesh: ArrayMesh = _crop_mesh_to_playable_region(mesh_instance)
		if cropped_mesh.get_surface_count() == 0:
			push_error("No terrain geometry falls inside the playable region.")
			continue

		mesh_instance.mesh = cropped_mesh
		mesh_instance.material_override = TERRAIN_MATERIAL
		var local_bounds: AABB = cropped_mesh.get_aabb()
		var local_bounds_max: Vector3 = local_bounds.position + local_bounds.size
		for local_x: float in [local_bounds.position.x, local_bounds_max.x]:
			for local_y: float in [local_bounds.position.y, local_bounds_max.y]:
				for local_z: float in [local_bounds.position.z, local_bounds_max.z]:
					var world_position: Vector3 = mesh_instance.global_transform * Vector3(
						local_x,
						local_y,
						local_z
					)
					terrain_min_y = minf(terrain_min_y, world_position.y)
					terrain_max_y = maxf(terrain_max_y, world_position.y)
		var shape: ConcavePolygonShape3D = cropped_mesh.create_trimesh_shape()
		if shape == null:
			push_error("Could not create terrain collision for '%s'." % mesh_instance.name)
			continue

		var collision_shape := CollisionShape3D.new()
		collision_shape.name = "%sCollision" % mesh_instance.name
		collision_shape.shape = shape
		add_child(collision_shape)
		collision_shape.global_transform = mesh_instance.global_transform

	if terrain_min_y == INF or terrain_max_y == -INF:
		push_error("Could not determine terrain bounds for map boundary walls.")
		return
	_create_map_boundary_walls(terrain_min_y, terrain_max_y)

func _create_map_boundary_walls(terrain_min_y: float, terrain_max_y: float) -> void:
	var center: Vector2 = PLAYABLE_REGION_CENTER_M
	var half_size: Vector2 = PLAYABLE_REGION_SIZE_M * 0.5
	var min_x: float = center.x - half_size.x
	var max_x: float = center.x + half_size.x
	var min_z: float = center.y - half_size.y
	var max_z: float = center.y + half_size.y
	var wall_height: float = maxf(
		200.0,
		terrain_max_y - terrain_min_y + BOUNDARY_VERTICAL_PADDING_M * 2.0
	)
	var wall_center_y: float = (terrain_min_y + terrain_max_y) * 0.5
	var wall_thickness: float = BOUNDARY_WALL_THICKNESS_M
	var full_x_length: float = PLAYABLE_REGION_SIZE_M.x + wall_thickness * 2.0
	var full_z_length: float = PLAYABLE_REGION_SIZE_M.y + wall_thickness * 2.0

	_add_map_boundary_wall(
		"NorthBoundaryCollision",
		Vector3(full_x_length, wall_height, wall_thickness),
		Vector3(center.x, wall_center_y, max_z + wall_thickness * 0.5)
	)
	_add_map_boundary_wall(
		"SouthBoundaryCollision",
		Vector3(full_x_length, wall_height, wall_thickness),
		Vector3(center.x, wall_center_y, min_z - wall_thickness * 0.5)
	)
	_add_map_boundary_wall(
		"EastBoundaryCollision",
		Vector3(wall_thickness, wall_height, full_z_length),
		Vector3(max_x + wall_thickness * 0.5, wall_center_y, center.y)
	)
	_add_map_boundary_wall(
		"WestBoundaryCollision",
		Vector3(wall_thickness, wall_height, full_z_length),
		Vector3(min_x - wall_thickness * 0.5, wall_center_y, center.y)
	)
	print("Created invisible collision boundaries around the playable map.")

func _add_map_boundary_wall(
	wall_name: String,
	wall_size: Vector3,
	world_position: Vector3
) -> void:
	var wall_shape: BoxShape3D = BoxShape3D.new()
	wall_shape.size = wall_size
	var collision_shape: CollisionShape3D = CollisionShape3D.new()
	collision_shape.name = wall_name
	collision_shape.shape = wall_shape
	add_child(collision_shape)
	collision_shape.global_position = world_position

func _crop_mesh_to_playable_region(mesh_instance: MeshInstance3D) -> ArrayMesh:
	var source_mesh: Mesh = mesh_instance.mesh
	var cropped_mesh: ArrayMesh = ArrayMesh.new()
	var half_size: Vector2 = PLAYABLE_REGION_SIZE_M * 0.5
	var min_x: float = PLAYABLE_REGION_CENTER_M.x - half_size.x
	var max_x: float = PLAYABLE_REGION_CENTER_M.x + half_size.x
	var min_z: float = PLAYABLE_REGION_CENTER_M.y - half_size.y
	var max_z: float = PLAYABLE_REGION_CENTER_M.y + half_size.y
	var mesh_transform: Transform3D = mesh_instance.global_transform
	var total_triangles: int = 0

	for surface_index: int in range(source_mesh.get_surface_count()):
		if source_mesh.surface_get_primitive_type(surface_index) != Mesh.PRIMITIVE_TRIANGLES:
			push_error("Terrain mesh '%s' contains a non-triangle surface." % mesh_instance.name)
			continue

		var surface_arrays: Array = source_mesh.surface_get_arrays(surface_index)
		var vertices: PackedVector3Array = surface_arrays[Mesh.ARRAY_VERTEX]
		var indices: PackedInt32Array = PackedInt32Array()
		var normals: PackedVector3Array = PackedVector3Array()
		var uvs: PackedVector2Array = PackedVector2Array()
		var colors: PackedColorArray = PackedColorArray()
		if surface_arrays[Mesh.ARRAY_INDEX] is PackedInt32Array:
			indices = surface_arrays[Mesh.ARRAY_INDEX]
		if surface_arrays[Mesh.ARRAY_NORMAL] is PackedVector3Array:
			normals = surface_arrays[Mesh.ARRAY_NORMAL]
		if surface_arrays[Mesh.ARRAY_TEX_UV] is PackedVector2Array:
			uvs = surface_arrays[Mesh.ARRAY_TEX_UV]
		if surface_arrays[Mesh.ARRAY_COLOR] is PackedColorArray:
			colors = surface_arrays[Mesh.ARRAY_COLOR]

		var has_normals: bool = not normals.is_empty()
		var has_uvs: bool = not uvs.is_empty()
		var has_colors: bool = not colors.is_empty()
		var triangle_count: int = indices.size() if not indices.is_empty() else vertices.size()
		var surface_tool: SurfaceTool = SurfaceTool.new()
		surface_tool.begin(Mesh.PRIMITIVE_TRIANGLES)
		var kept_triangles: int = 0

		for triangle_start: int in range(0, triangle_count, 3):
			var index_a: int = indices[triangle_start] if not indices.is_empty() else triangle_start
			var index_b: int = indices[triangle_start + 1] if not indices.is_empty() else triangle_start + 1
			var index_c: int = indices[triangle_start + 2] if not indices.is_empty() else triangle_start + 2
			var position_a: Vector3 = vertices[index_a]
			var position_b: Vector3 = vertices[index_b]
			var position_c: Vector3 = vertices[index_c]

			# Filter out base/bottom cap geometry of the 3D print model
			if position_a.y < 0.1 and position_b.y < 0.1 and position_c.y < 0.1:
				continue
			var world_a: Vector3 = mesh_transform * position_a
			var world_b: Vector3 = mesh_transform * position_b
			var world_c: Vector3 = mesh_transform * position_c

			if maxf(world_a.x, maxf(world_b.x, world_c.x)) < min_x:
				continue
			if minf(world_a.x, minf(world_b.x, world_c.x)) > max_x:
				continue
			if maxf(world_a.z, maxf(world_b.z, world_c.z)) < min_z:
				continue
			if minf(world_a.z, minf(world_b.z, world_c.z)) > max_z:
				continue

			var polygon: Array[Dictionary] = [
				_create_vertex_data(position_a, world_a, index_a, normals, uvs, colors, has_normals, has_uvs, has_colors),
				_create_vertex_data(position_b, world_b, index_b, normals, uvs, colors, has_normals, has_uvs, has_colors),
				_create_vertex_data(position_c, world_c, index_c, normals, uvs, colors, has_normals, has_uvs, has_colors)
			]
			polygon = _clip_polygon(polygon, 0, min_x, true)
			polygon = _clip_polygon(polygon, 0, max_x, false)
			polygon = _clip_polygon(polygon, 2, min_z, true)
			polygon = _clip_polygon(polygon, 2, max_z, false)
			if polygon.size() < 3:
				continue

			for fan_index: int in range(1, polygon.size() - 1):
				var triangle: Array[Dictionary] = [polygon[0], polygon[fan_index], polygon[fan_index + 1]]
				for vertex_data: Dictionary in triangle:
					if has_normals:
						surface_tool.set_normal(vertex_data["normal"])
					if has_uvs:
						surface_tool.set_uv(vertex_data["uv"])
					if has_colors:
						surface_tool.set_color(vertex_data["color"])
					surface_tool.add_vertex(vertex_data["position"])
				kept_triangles += 1

		if kept_triangles == 0:
			continue
		if not has_normals:
			surface_tool.generate_normals()
		var cropped_surface: ArrayMesh = surface_tool.commit()
		if cropped_surface.get_surface_count() == 0:
			continue

		cropped_mesh.add_surface_from_arrays(
			Mesh.PRIMITIVE_TRIANGLES,
			cropped_surface.surface_get_arrays(0)
		)
		var new_surface_index: int = cropped_mesh.get_surface_count() - 1
		cropped_mesh.surface_set_material(
			new_surface_index,
			source_mesh.surface_get_material(surface_index)
		)
		total_triangles += kept_triangles

	if total_triangles == 0:
		push_error("Terrain crop retained no triangles for '%s'." % mesh_instance.name)
	else:
		print("Cropped '%s' to %.0f m x %.0f m (%d triangles)." % [
			mesh_instance.name,
			PLAYABLE_REGION_SIZE_M.x,
			PLAYABLE_REGION_SIZE_M.y,
			total_triangles
		])
	return cropped_mesh

func _create_vertex_data(
	local_position: Vector3,
	world_position: Vector3,
	vertex_index: int,
	normals: PackedVector3Array,
	uvs: PackedVector2Array,
	colors: PackedColorArray,
	has_normals: bool,
	has_uvs: bool,
	has_colors: bool
) -> Dictionary:
	var vertex_data: Dictionary = {
		"position": local_position,
		"world_position": world_position
	}
	if has_normals:
		vertex_data["normal"] = normals[vertex_index]
	if has_uvs:
		vertex_data["uv"] = uvs[vertex_index]
	if has_colors:
		vertex_data["color"] = colors[vertex_index]
	return vertex_data

func _clip_polygon(
	polygon: Array[Dictionary],
	axis: int,
	boundary: float,
	keep_greater: bool
) -> Array[Dictionary]:
	var clipped_polygon: Array[Dictionary] = []
	if polygon.is_empty():
		return clipped_polygon

	var previous: Dictionary = polygon[polygon.size() - 1]
	var previous_position: Vector3 = previous["world_position"]
	var previous_coordinate: float = previous_position[axis]
	var previous_inside: bool = previous_coordinate >= boundary if keep_greater else previous_coordinate <= boundary

	for current: Dictionary in polygon:
		var current_position: Vector3 = current["world_position"]
		var current_coordinate: float = current_position[axis]
		var current_inside: bool = current_coordinate >= boundary if keep_greater else current_coordinate <= boundary
		if current_inside != previous_inside:
			var interpolation: float = (boundary - previous_coordinate) / (current_coordinate - previous_coordinate)
			clipped_polygon.append(_interpolate_vertex_data(previous, current, interpolation))
		if current_inside:
			clipped_polygon.append(current)
		previous = current
		previous_position = current_position
		previous_coordinate = current_coordinate
		previous_inside = current_inside
	return clipped_polygon

func _interpolate_vertex_data(a: Dictionary, b: Dictionary, weight: float) -> Dictionary:
	var data_a: Dictionary = a
	var data_b: Dictionary = b
	var position_a: Vector3 = data_a["position"]
	var position_b: Vector3 = data_b["position"]
	var world_position_a: Vector3 = data_a["world_position"]
	var world_position_b: Vector3 = data_b["world_position"]
	var interpolated: Dictionary = {
		"position": position_a.lerp(position_b, weight),
		"world_position": world_position_a.lerp(world_position_b, weight)
	}
	if data_a.has("normal"):
		var normal_a: Vector3 = data_a["normal"]
		var normal_b: Vector3 = data_b["normal"]
		interpolated["normal"] = normal_a.lerp(normal_b, weight).normalized()
	if data_a.has("uv"):
		var uv_a: Vector2 = data_a["uv"]
		var uv_b: Vector2 = data_b["uv"]
		interpolated["uv"] = uv_a.lerp(uv_b, weight)
	if data_a.has("color"):
		var color_a: Color = data_a["color"]
		var color_b: Color = data_b["color"]
		interpolated["color"] = color_a.lerp(color_b, weight)
	return interpolated

func _collect_mesh_instances(node: Node, result: Array[MeshInstance3D]) -> void:
	if node is MeshInstance3D:
		result.append(node)

	for child: Node in node.get_children():
		_collect_mesh_instances(child, result)
