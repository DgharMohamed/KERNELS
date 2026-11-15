class_name VehicleSelectModal
extends Control

signal vehicle_selected(vehicle_id: String)
signal back_to_missions_requested

@onready var heavy_card: PanelContainer = $CenterContainer/OuterPanel/VBox/CardsHBox/HeavyCard
@onready var agile_card: PanelContainer = $CenterContainer/OuterPanel/VBox/CardsHBox/AgileCard
@onready var back_btn: Button = $CenterContainer/OuterPanel/VBox/BackBtn

var _heavy_style_normal: StyleBoxFlat = null
var _heavy_style_hover: StyleBoxFlat = null
var _agile_style_normal: StyleBoxFlat = null
var _agile_style_hover: StyleBoxFlat = null

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS

	# Build hover styles (brighter border + bg on mouse-over)
	_heavy_style_normal = heavy_card.get_theme_stylebox("panel").duplicate() as StyleBoxFlat
	_heavy_style_hover = _heavy_style_normal.duplicate() as StyleBoxFlat
	_heavy_style_hover.border_color = Color(0.3, 0.75, 1.0, 0.9)
	_heavy_style_hover.bg_color = Color(0.1, 0.14, 0.24, 1.0)

	_agile_style_normal = agile_card.get_theme_stylebox("panel").duplicate() as StyleBoxFlat
	_agile_style_hover = _agile_style_normal.duplicate() as StyleBoxFlat
	_agile_style_hover.border_color = Color(1.0, 0.8, 0.3, 0.9)
	_agile_style_hover.bg_color = Color(0.14, 0.12, 0.08, 1.0)

	heavy_card.gui_input.connect(_on_heavy_input)
	heavy_card.mouse_entered.connect(_on_heavy_entered)
	heavy_card.mouse_exited.connect(_on_heavy_exited)

	agile_card.gui_input.connect(_on_agile_input)
	agile_card.mouse_entered.connect(_on_agile_entered)
	agile_card.mouse_exited.connect(_on_agile_exited)

	back_btn.pressed.connect(_on_back_pressed)

func open() -> void:
	visible = true
	get_tree().paused = true

func close() -> void:
	visible = false

func _on_heavy_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mb: InputEventMouseButton = event as InputEventMouseButton
		if mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
			close()
			get_tree().paused = false
			vehicle_selected.emit("heavy")

func _on_agile_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mb: InputEventMouseButton = event as InputEventMouseButton
		if mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
			close()
			get_tree().paused = false
			vehicle_selected.emit("agile")

func _on_heavy_entered() -> void:
	if _heavy_style_hover:
		heavy_card.add_theme_stylebox_override("panel", _heavy_style_hover)

func _on_heavy_exited() -> void:
	if _heavy_style_normal:
		heavy_card.add_theme_stylebox_override("panel", _heavy_style_normal)

func _on_agile_entered() -> void:
	if _agile_style_hover:
		agile_card.add_theme_stylebox_override("panel", _agile_style_hover)

func _on_agile_exited() -> void:
	if _agile_style_normal:
		agile_card.add_theme_stylebox_override("panel", _agile_style_normal)

func _on_back_pressed() -> void:
	close()
	back_to_missions_requested.emit()
