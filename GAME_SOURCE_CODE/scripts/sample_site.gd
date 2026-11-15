class_name SampleSite
extends Area3D

signal sample_extracted(science_data: Dictionary)
signal collect_prompt_changed(show: bool, drilling: bool, progress: float)

@export var sample_id: String = "yellowknife_bay_01"
@export var sample_name: String = "John Klein Mudstone Outcrop"

var _in_range: bool = false
var _extracted: bool = false
var _drill_time_required: float = 2.0
var _current_drill_time: float = 0.0
var _drilling: bool = false

@onready var marker_mesh: MeshInstance3D = $BeaconMarker
@onready var prompt_label: Label3D = $PromptLabel

func _ready() -> void:
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	# Snap SampleSite Y to terrain surface
	call_deferred("snap_to_terrain")
	if prompt_label:
		prompt_label.visible = false

func snap_to_terrain() -> void:
	var space_state: PhysicsDirectSpaceState3D = get_world_3d().direct_space_state
	if space_state:
		var from_pos: Vector3 = Vector3(global_position.x, 100.0, global_position.z)
		var to_pos: Vector3 = Vector3(global_position.x, -100.0, global_position.z)
		var query: PhysicsRayQueryParameters3D = PhysicsRayQueryParameters3D.create(from_pos, to_pos)
		query.exclude = [get_rid()]
		var hit: Dictionary = space_state.intersect_ray(query)
		if not hit.is_empty() and hit.has("position"):
			global_position.y = hit["position"].y

func _process(delta: float) -> void:
	if _extracted:
		return
	
	# Gentle hover/pulse on the visual beacon marker
	if marker_mesh:
		marker_mesh.rotate_y(delta * 1.5)
		marker_mesh.position.y = 1.8 + sin(Time.get_ticks_msec() * 0.003) * 0.25

	if _in_range and not _drilling:
		if Input.is_key_pressed(KEY_E):
			_start_drilling()

	if _drilling:
		_current_drill_time += delta
		var progress: float = clampf(_current_drill_time / _drill_time_required, 0.0, 1.0)
		collect_prompt_changed.emit(true, true, progress)
		
		# Apply battery cost to rover while drilling
		var player: Node = get_tree().get_first_node_in_group("player")
		if player and "battery" in player:
			player.battery = maxf(0.0, player.battery - delta * 4.0)

		if _current_drill_time >= _drill_time_required:
			_complete_extraction()
	elif _in_range and not _extracted:
		collect_prompt_changed.emit(true, false, 0.0)

func _start_drilling() -> void:
	_drilling = true
	_current_drill_time = 0.0

func _complete_extraction() -> void:
	_drilling = false
	_extracted = true
	collect_prompt_changed.emit(false, false, 0.0)
	if marker_mesh:
		marker_mesh.visible = false

	var science_data: Dictionary = {}
	if sample_id == "bagnold_dunes_02":
		science_data = {
			"target_name": "Bagnold Basalt Dune Field (Active Aeolian Bedform)",
			"formation": "Olivine-rich Basaltic Sand Sheet",
			"instruments": "Curiosity CheMin XRD & APXS Alpha Particle X-Ray",
			"minerals": [
				{"name": "Forsteritic Olivine", "percent": "28.5%", "desc": "Unweathered dark volcanic mineral, active transport."},
				{"name": "Augite / Pyroxene", "percent": "35.2%", "desc": "High-calcium basaltic grain matrix."},
				{"name": "Plagioclase Feldspar", "percent": "24.1%", "desc": "Coarse sand grains sorted by wind currents."},
				{"name": "Magnetite / Ilmenite", "percent": "6.8%", "desc": "Dense magnetic grains concentrated at ripple crests."}
			],
			"environmental_metrics": {
				"ambient_pressure": "742 Pa",
				"diurnal_temp": "-28°C / -84°C",
				"optical_depth_tau": "2.45 (Severe Dust Storm)"
			},
			"scientific_verdict": "ACTIVE BASALTIC AEOLIAN SYSTEM: Confirmed modern grain saltation under severe dust storm atmospheric conditions."
		}
	else:
		science_data = {
			"target_name": "John Klein Outcrop (Yellowknife Bay, Gale Crater)",
			"formation": "Sheepbed Member / Lacustrine Mudstone",
			"instruments": "Curiosity CheMin XRD & ChemCam LIBS",
			"minerals": [
				{"name": "Smectite Phyllosilicates (Clay)", "percent": "22.4%", "desc": "Formed in low-salinity, neutral-pH water."},
				{"name": "Plagioclase Feldspar", "percent": "37.8%", "desc": "Detrital volcanic source material."},
				{"name": "Fe-Forsterite (Olivine)", "percent": "18.2%", "desc": "Igneous basaltic provenance."},
				{"name": "Calcium Sulfate Veins (Bassinite)", "percent": "4.6%", "desc": "Post-depositional hydrothermal fluid fractures."}
			],
			"environmental_metrics": {
				"ambient_pressure": "812 Pa",
				"diurnal_temp": "-14°C / -72°C",
				"optical_depth_tau": "0.38 (Clear)"
			},
			"scientific_verdict": "HABITABLE PALEOENVIRONMENT CONFIRMED: Evidence of an ancient freshwater lake bed capable of supporting microbial life."
		}
	sample_extracted.emit(science_data)

func _on_body_entered(body: Node3D) -> void:
	if body.is_in_group("player") and not _extracted:
		_in_range = true
		collect_prompt_changed.emit(true, false, 0.0)

func _on_body_exited(body: Node3D) -> void:
	if body.is_in_group("player"):
		_in_range = false
		_drilling = false
		_current_drill_time = 0.0
		if not _extracted:
			collect_prompt_changed.emit(false, false, 0.0)
