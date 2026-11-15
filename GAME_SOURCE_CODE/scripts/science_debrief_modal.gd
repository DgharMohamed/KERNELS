class_name ScienceDebriefModal
extends Control

signal debrief_closed

@onready var target_label: Label = $CenterContainer/Panel/VBox/TargetLabel
@onready var formation_label: Label = $CenterContainer/Panel/VBox/FormationLabel
@onready var instruments_label: Label = $CenterContainer/Panel/VBox/InstrumentsLabel
@onready var minerals_container: VBoxContainer = $CenterContainer/Panel/VBox/MineralsPanel/VBox/Grid
@onready var verdict_label: Label = $CenterContainer/Panel/VBox/VerdictPanel/VBox/VerdictLabel
@onready var close_btn: Button = $CenterContainer/Panel/VBox/CloseBtn

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	close_btn.pressed.connect(_on_close_pressed)

func display_science(data: Dictionary) -> void:
	visible = true
	get_tree().paused = true

	if target_label:
		target_label.text = "TARGET: " + str(data.get("target_name", "Unknown Outcrop"))
	if formation_label:
		formation_label.text = "GEOLOGICAL UNIT: " + str(data.get("formation", "Gale Crater Sediment"))
	if instruments_label:
		instruments_label.text = "INSTRUMENTS: " + str(data.get("instruments", "PDS Spectrometer"))
	
	if minerals_container:
		# Clear any placeholder children
		for child: Node in minerals_container.get_children():
			child.queue_free()

		var minerals: Array = data.get("minerals", [])
		for m_dict: Variant in minerals:
			if m_dict is Dictionary:
				var item_panel := PanelContainer.new()
				var item_style := StyleBoxFlat.new()
				item_style.bg_color = Color(0.1, 0.13, 0.17, 0.75)
				item_style.corner_radius_top_left = 6
				item_style.corner_radius_top_right = 6
				item_style.corner_radius_bottom_left = 6
				item_style.corner_radius_bottom_right = 6
				item_style.content_margin_left = 14
				item_style.content_margin_right = 14
				item_style.content_margin_top = 8
				item_style.content_margin_bottom = 8
				item_panel.add_theme_stylebox_override("panel", item_style)

				var item_vbox := VBoxContainer.new()
				item_vbox.add_theme_constant_override("separation", 2)

				var top_row := HBoxContainer.new()
				var name_lbl := Label.new()
				name_lbl.text = "◆ " + str(m_dict.get("name", ""))
				name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
				name_lbl.add_theme_color_override("font_color", Color(0.96, 0.98, 1.0))
				name_lbl.add_theme_font_size_override("font_size", 16)

				var pct_lbl := Label.new()
				pct_lbl.text = str(m_dict.get("percent", ""))
				pct_lbl.add_theme_color_override("font_color", Color(0.35, 1.0, 0.5))
				pct_lbl.add_theme_font_size_override("font_size", 18)

				top_row.add_child(name_lbl)
				top_row.add_child(pct_lbl)
				item_vbox.add_child(top_row)

				var desc_lbl := Label.new()
				desc_lbl.text = str(m_dict.get("desc", ""))
				desc_lbl.add_theme_color_override("font_color", Color(0.78, 0.84, 0.9))
				desc_lbl.add_theme_font_size_override("font_size", 13)
				item_vbox.add_child(desc_lbl)

				item_panel.add_child(item_vbox)
				minerals_container.add_child(item_panel)

	if verdict_label:
		verdict_label.text = str(data.get("scientific_verdict", "Mission Objectives Accomplished."))

func _on_close_pressed() -> void:
	visible = false
	get_tree().paused = false
	debrief_closed.emit()
