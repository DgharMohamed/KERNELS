extends Node3D

@export var profile: String = "heavy"
@export var rotate_speed: float = 0.8

@onready var rover_model: Node3D = $Visuals

func _ready() -> void:
	if profile == "heavy":
		_setup_heavy()
	else:
		_setup_agile()

func _process(delta: float) -> void:
	if rover_model:
		rover_model.rotate_y(delta * rotate_speed)

func _setup_heavy() -> void:
	var body: MeshInstance3D = $Visuals/Body
	var deck: MeshInstance3D = $Visuals/EquipmentDeck
	var equip: MeshInstance3D = $Visuals/EquipmentModule
	if body:
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color(0.32, 0.38, 0.34)
		mat.metallic = 0.4
		mat.roughness = 0.6
		body.material_override = mat
	if deck:
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color(0.24, 0.28, 0.26)
		deck.material_override = mat
	if equip:
		equip.scale = Vector3(1.3, 1.4, 1.1)
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color(0.15, 0.16, 0.17)
		mat.metallic = 0.7
		equip.material_override = mat

func _setup_agile() -> void:
	var body: MeshInstance3D = $Visuals/Body
	var deck: MeshInstance3D = $Visuals/EquipmentDeck
	var equip: MeshInstance3D = $Visuals/EquipmentModule
	if body:
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color(0.86, 0.88, 0.90)
		mat.metallic = 0.1
		mat.roughness = 0.3
		body.material_override = mat
	if deck:
		deck.scale = Vector3(1.35, 1.0, 1.05)
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color(0.12, 0.16, 0.35)
		mat.metallic = 0.5
		mat.roughness = 0.2
		deck.material_override = mat
	if equip:
		equip.scale = Vector3(0.7, 0.9, 0.7)
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color(0.95, 0.78, 0.22)
		mat.metallic = 0.8
		mat.roughness = 0.2
		equip.material_override = mat
