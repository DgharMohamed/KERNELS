class_name MissionSelectModal
extends Control

signal mission_selected(mission_id: String)

@onready var card1: PanelContainer = $CenterContainer/OuterPanel/VBox/Scroll/CardList/Card1
@onready var card2: PanelContainer = $CenterContainer/OuterPanel/VBox/Scroll/CardList/Card2
@onready var card2_tag: Label = $CenterContainer/OuterPanel/VBox/Scroll/CardList/Card2/HBox/InfoVBox/TagLabel

var _card1_style_normal: StyleBoxFlat = null
var _card1_style_hover: StyleBoxFlat = null
var _card2_style_normal: StyleBoxFlat = null
var _card2_style_hover: StyleBoxFlat = null

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS

	# Build hover style for card 1
	var base_style: StyleBoxFlat = card1.get_theme_stylebox("panel") as StyleBoxFlat
	if base_style:
		_card1_style_normal = base_style
		_card1_style_hover = base_style.duplicate() as StyleBoxFlat
		_card1_style_hover.border_color = Color(0.35, 0.7, 1.0, 0.9)
		_card1_style_hover.bg_color = Color(0.1, 0.13, 0.22, 1.0)

	# Build hover style for card 2
	var base_style2: StyleBoxFlat = card2.get_theme_stylebox("panel") as StyleBoxFlat
	if base_style2:
		_card2_style_normal = base_style2
		_card2_style_hover = base_style2.duplicate() as StyleBoxFlat
		_card2_style_hover.border_color = Color(1.0, 0.7, 0.25, 0.9)
		_card2_style_hover.bg_color = Color(0.18, 0.12, 0.08, 1.0)

	card1.gui_input.connect(_on_card1_input)
	card1.mouse_entered.connect(_on_card1_mouse_entered)
	card1.mouse_exited.connect(_on_card1_mouse_exited)

	card2.gui_input.connect(_on_card2_input)
	card2.mouse_entered.connect(_on_card2_mouse_entered)
	card2.mouse_exited.connect(_on_card2_mouse_exited)

func open() -> void:
	visible = true
	get_tree().paused = true

func close() -> void:
	visible = false
	get_tree().paused = false

func _on_card1_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mb: InputEventMouseButton = event as InputEventMouseButton
		if mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
			close()
			mission_selected.emit("mission_1")

func _on_card2_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mb: InputEventMouseButton = event as InputEventMouseButton
		if mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
			close()
			mission_selected.emit("mission_2")

func _on_card1_mouse_entered() -> void:
	if _card1_style_hover:
		card1.add_theme_stylebox_override("panel", _card1_style_hover)

func _on_card1_mouse_exited() -> void:
	if _card1_style_normal:
		card1.add_theme_stylebox_override("panel", _card1_style_normal)

func _on_card2_mouse_entered() -> void:
	if _card2_style_hover:
		card2.add_theme_stylebox_override("panel", _card2_style_hover)

func _on_card2_mouse_exited() -> void:
	if _card2_style_normal:
		card2.add_theme_stylebox_override("panel", _card2_style_normal)
