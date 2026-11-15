class_name PauseMenuModal
extends Control

signal resume_requested
signal restart_mission_requested
signal change_vehicle_requested
signal change_mission_requested

@onready var resume_btn: Button = $CenterContainer/Panel/VBox/ResumeBtn
@onready var change_vehicle_btn: Button = $CenterContainer/Panel/VBox/ChangeVehicleBtn
@onready var change_mission_btn: Button = $CenterContainer/Panel/VBox/ChangeMissionBtn
@onready var restart_btn: Button = $CenterContainer/Panel/VBox/RestartBtn

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	resume_btn.pressed.connect(_on_resume_pressed)
	change_vehicle_btn.pressed.connect(_on_change_vehicle_pressed)
	change_mission_btn.pressed.connect(_on_change_mission_pressed)
	restart_btn.pressed.connect(_on_restart_pressed)
	
	_setup_hover_styles()

func _setup_hover_styles() -> void:
	# Primary resume hover
	var resume_hover: StyleBoxFlat = resume_btn.get_theme_stylebox("normal").duplicate() as StyleBoxFlat
	if resume_hover:
		resume_hover.bg_color = Color(0.18, 0.38, 0.58, 1.0)
		resume_hover.border_color = Color(0.5, 0.85, 1.0, 1.0)
		resume_btn.add_theme_stylebox_override("hover", resume_hover)
	
	# Normal buttons hover
	for btn: Button in [change_vehicle_btn, change_mission_btn]:
		var h: StyleBoxFlat = btn.get_theme_stylebox("normal").duplicate() as StyleBoxFlat
		if h:
			h.bg_color = Color(0.12, 0.16, 0.24, 1.0)
			h.border_color = Color(0.35, 0.65, 0.95, 0.9)
			btn.add_theme_stylebox_override("hover", h)
			
	# Restart warn hover
	var restart_hover: StyleBoxFlat = restart_btn.get_theme_stylebox("normal").duplicate() as StyleBoxFlat
	if restart_hover:
		restart_hover.bg_color = Color(0.2, 0.1, 0.1, 1.0)
		restart_hover.border_color = Color(0.9, 0.4, 0.35, 1.0)
		restart_btn.add_theme_stylebox_override("hover", restart_hover)

func open() -> void:
	visible = true
	get_tree().paused = true

func close() -> void:
	visible = false
	get_tree().paused = false

func _on_resume_pressed() -> void:
	close()
	resume_requested.emit()

func _on_change_vehicle_pressed() -> void:
	visible = false
	change_vehicle_requested.emit()

func _on_change_mission_pressed() -> void:
	visible = false
	change_mission_requested.emit()

func _on_restart_pressed() -> void:
	close()
	restart_mission_requested.emit()
