class_name HUD
extends CanvasLayer

signal mission_started(mission_id: String)
signal vehicle_chosen(vehicle_id: String)

@onready var speed_label: Label = $TopLeft/Panel/VBox/SpeedLabel
@onready var slope_label: Label = $TopLeft/Panel/VBox/SlopeLabel
@onready var elevation_label: Label = $TopLeft/Panel/VBox/ElevationLabel
@onready var wind_label: Label = $TopLeft/Panel/VBox/WindLabel
@onready var temp_label: Label = $TopLeft/Panel/VBox/TempLabel
@onready var pressure_label: Label = $TopLeft/Panel/VBox/PressureLabel
@onready var weather_label: Label = $TopLeft/Panel/VBox/WeatherLabel

@onready var compass_ribbon: CompassRibbon = $TopCenter/CompassRibbon
@onready var quest_title: Label = $TopRight/QuestPanel/VBox/QuestHeader/Title
@onready var quest_dist: Label = $TopRight/QuestPanel/VBox/QuestHeader/DistLabel
@onready var quest_bar: ProgressBar = $TopRight/QuestPanel/VBox/QuestBar

@onready var battery_bar: ProgressBar = $BottomRight/BatteryPanel/VBox/HBox/BatteryBar
@onready var battery_pct: Label = $BottomRight/BatteryPanel/VBox/HBox/PctLabel
@onready var battery_icon: Label = $BottomRight/BatteryPanel/VBox/HBox/Icon

@onready var menu_button: Button = $TopRight/MenuButton
@onready var mission_modal: Control = $MissionSelectModal
@onready var vehicle_modal: Control = $VehicleSelectModal
@onready var pause_modal: Control = $PauseMenuModal
@onready var science_modal: ScienceDebriefModal = $ScienceDebriefModal

@onready var center_prompt: Control = $CenterPrompt
@onready var collect_label: Label = $CenterPrompt/PromptPanel/HBox/CollectLabel
@onready var key_box: PanelContainer = $CenterPrompt/PromptPanel/HBox/KeyBox
@onready var drill_label: Label = $CenterPrompt/PromptPanel/HBox/DrillLabel

var _selected_mission: String = "mission_1"
var _selected_vehicle: String = "heavy"
var target_outcrop_pos: Vector3 = Vector3(45.0, 0.0, -45.0)
var max_quest_distance: float = 65.0
var _bar_fill_style: StyleBoxFlat = null
var _sample_collected: bool = false

func _ready() -> void:
	_bar_fill_style = StyleBoxFlat.new()
	_bar_fill_style.corner_radius_top_left = 3
	_bar_fill_style.corner_radius_top_right = 3
	_bar_fill_style.corner_radius_bottom_left = 3
	_bar_fill_style.corner_radius_bottom_right = 3
	if battery_bar:
		battery_bar.add_theme_stylebox_override("fill", _bar_fill_style)

	var player: Node = get_tree().get_first_node_in_group("player")
	if not player:
		player = get_parent().get_node_or_null("Player")
	if player and player.has_signal("telemetry_updated"):
		player.connect("telemetry_updated", _on_telemetry_updated)
	
	if menu_button:
		menu_button.pressed.connect(_on_menu_button_pressed)
	
	if mission_modal:
		mission_modal.mission_selected.connect(_on_mission_selected)
		mission_modal.open()
	
	if vehicle_modal:
		vehicle_modal.vehicle_selected.connect(_on_vehicle_selected)
		vehicle_modal.back_to_missions_requested.connect(_on_back_to_missions)
	
	if pause_modal:
		pause_modal.restart_mission_requested.connect(_on_restart_mission)
		pause_modal.change_vehicle_requested.connect(_on_change_vehicle_requested)
		pause_modal.change_mission_requested.connect(_on_change_mission_requested)
	
	if science_modal:
		science_modal.debrief_closed.connect(_on_debrief_closed)

	# Connect sample site signal if present in scene
	var sample_site: Node = get_tree().get_first_node_in_group("sample_site")
	if not sample_site:
		sample_site = get_parent().get_node_or_null("SampleSite")
	if sample_site and sample_site.has_signal("sample_extracted"):
		sample_site.connect("sample_extracted", _on_sample_extracted)
		target_outcrop_pos = (sample_site as Node3D).global_position
		if compass_ribbon:
			compass_ribbon.target_position = target_outcrop_pos
	if sample_site and sample_site.has_signal("collect_prompt_changed"):
		sample_site.connect("collect_prompt_changed", _on_collect_prompt_changed)

func _process(_delta: float) -> void:
	if _sample_collected:
		return

	# Update quest distance countdown and proximity bar
	var player: Node3D = get_tree().get_first_node_in_group("player") as Node3D
	if player and quest_dist and quest_bar:
		var dist: float = player.global_position.distance_to(target_outcrop_pos)
		quest_dist.text = "[%.0fm]" % dist
		var progress: float = clampf(1.0 - (dist / max_quest_distance), 0.05, 1.0) * 100.0
		quest_bar.value = progress
		if dist <= 4.5:
			quest_dist.text = "[PRESS E]"
			quest_dist.modulate = Color(0.3, 1.0, 0.4)
		else:
			quest_dist.modulate = Color(1.0, 0.85, 0.3)

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		if pause_modal:
			if pause_modal.visible:
				pause_modal.close()
			elif not mission_modal.visible and not vehicle_modal.visible:
				pause_modal.open()

func _on_menu_button_pressed() -> void:
	if pause_modal and not mission_modal.visible and not vehicle_modal.visible:
		pause_modal.open()

func _on_mission_selected(mission_id: String) -> void:
	_selected_mission = mission_id
	mission_started.emit(mission_id)
	
	if _selected_mission == "mission_2":
		_setup_mission_2_environment()
	else:
		_setup_mission_1_environment()
		
	if vehicle_modal:
		vehicle_modal.open()

func _setup_mission_1_environment() -> void:
	target_outcrop_pos = Vector3(35.0, 0.0, -45.0)
	max_quest_distance = 65.0
	
	var site: Node = get_tree().get_first_node_in_group("sample_site")
	if not site:
		site = get_parent().get_node_or_null("SampleSite")
	if site is Node3D:
		var site_node: Node3D = site as Node3D
		site_node.global_position = target_outcrop_pos
		if site.has_method("snap_to_terrain"):
			site.snap_to_terrain()
		if "sample_id" in site:
			site.sample_id = "yellowknife_bay_01"
		if "sample_name" in site:
			site.sample_name = "John Klein Mudstone Outcrop"
		target_outcrop_pos = site_node.global_position
		
	if compass_ribbon:
		compass_ribbon.target_position = target_outcrop_pos
	if quest_title:
		quest_title.text = "MUDSTONE OUTCROP"
	
	# Clear weather lighting & fog
	var world_env: WorldEnvironment = get_tree().root.find_child("WorldEnvironment", true, false) as WorldEnvironment
	if world_env and world_env.environment:
		var env: Environment = world_env.environment
		env.fog_enabled = true
		env.fog_density = 0.008
		env.fog_light_color = Color(0.76, 0.62, 0.42, 1.0)
		env.background_color = Color(0.76, 0.62, 0.42, 1.0)
	
	var sun: DirectionalLight3D = get_tree().root.find_child("Sun", true, false) as DirectionalLight3D
	if sun:
		sun.light_energy = 1.2
		sun.light_color = Color(1.0, 0.94, 0.8, 1.0)
		
	var cam: Camera3D = get_viewport().get_camera_3d()
	if cam:
		cam.far = 220.0

func _setup_mission_2_environment() -> void:
	# Mission 2: Bagnold Dunes severe dust storm with heavy fog & higher winds
	target_outcrop_pos = Vector3(135.0, 0.0, -155.0)
	max_quest_distance = 205.0
	
	var site: Node = get_tree().get_first_node_in_group("sample_site")
	if not site:
		site = get_parent().get_node_or_null("SampleSite")
	if site is Node3D:
		var site_node: Node3D = site as Node3D
		site_node.global_position = target_outcrop_pos
		if site.has_method("snap_to_terrain"):
			site.snap_to_terrain()
		if "sample_id" in site:
			site.sample_id = "bagnold_dunes_02"
		if "sample_name" in site:
			site.sample_name = "Bagnold Basalt Dune Field"
		target_outcrop_pos = site_node.global_position
			
	if compass_ribbon:
		compass_ribbon.target_position = target_outcrop_pos
	if quest_title:
		quest_title.text = "BAGNOLD BASALT DUNE"
	
	# Thick atmospheric dust fog (Tau 2.45 - heavy Martian dust event)
	var world_env: WorldEnvironment = get_tree().root.find_child("WorldEnvironment", true, false) as WorldEnvironment
	if world_env and world_env.environment:
		var env: Environment = world_env.environment
		env.fog_enabled = true
		env.fog_density = 0.038 # ~5x thicker atmospheric fog
		env.fog_light_color = Color(0.68, 0.46, 0.28, 1.0) # Dusky ochre dust haze
		env.background_color = Color(0.68, 0.46, 0.28, 1.0)
	
	# Dimmed sun obscured by dust storm
	var sun: DirectionalLight3D = get_tree().root.find_child("Sun", true, false) as DirectionalLight3D
	if sun:
		sun.light_energy = 0.45
		sun.light_color = Color(0.9, 0.6, 0.35, 1.0)
		
	var cam: Camera3D = get_viewport().get_camera_3d()
	if cam:
		cam.far = 110.0 # Tighter sightlines due to storm
		
	# Update player storm multiplier and start with 20% battery health
	var player: Node = get_tree().get_first_node_in_group("player")
	if player:
		if "dust_storm_multiplier" in player:
			player.dust_storm_multiplier = 2.5
		if "battery" in player:
			player.battery = 20.0
			
	if battery_bar:
		battery_bar.value = 20.0
	_update_battery_visuals(20.0)

func _on_vehicle_selected(vehicle_id: String) -> void:
	_selected_vehicle = vehicle_id
	vehicle_chosen.emit(vehicle_id)
	var player: Node = get_tree().get_first_node_in_group("player")
	if not player:
		player = get_parent().get_node_or_null("Player")
	if player and player.has_method("apply_rover_profile"):
		player.apply_rover_profile(vehicle_id)
	
	if _selected_mission == "mission_2":
		if player and "battery" in player:
			player.battery = 20.0
		_update_battery_visuals(20.0)
	else:
		_update_battery_visuals(battery_bar.value if battery_bar else 100.0)

func _update_battery_visuals(batt: float) -> void:
	var base_col: Color
	if _selected_vehicle == "heavy":
		# Nuclear MMRTG: calm, less-saturated industrial green
		base_col = Color(0.42, 0.68, 0.48)
	else:
		# Solar Array: warm energetic yellowish amber
		base_col = Color(0.95, 0.82, 0.22)
	
	# If battery drops critically low (<20%), tint reddish
	if batt <= 20.0:
		base_col = Color(0.95, 0.28, 0.22)
	
	if _bar_fill_style:
		_bar_fill_style.bg_color = base_col
	if battery_pct:
		battery_pct.text = "%.0f%%" % batt
		battery_pct.modulate = base_col
	if battery_icon:
		battery_icon.modulate = base_col

func _on_back_to_missions() -> void:
	if mission_modal:
		mission_modal.open()

func _on_restart_mission() -> void:
	get_tree().paused = false
	get_tree().reload_current_scene()

func _on_change_vehicle_requested() -> void:
	if vehicle_modal:
		vehicle_modal.open()

func _on_change_mission_requested() -> void:
	if mission_modal:
		mission_modal.open()

func _on_sample_extracted(science_data: Dictionary) -> void:
	_sample_collected = true
	if quest_title:
		quest_title.text = "CORE SAMPLE RETRIEVED"
	if quest_dist:
		quest_dist.text = "[COMPLETE]"
		quest_dist.modulate = Color(0.3, 1.0, 0.4)
	if quest_bar:
		quest_bar.value = 100.0
	
	if science_modal:
		science_modal.display_science(science_data)

func _on_debrief_closed() -> void:
	if weather_label:
		weather_label.text = "MISSION 01 COMPLETE"
		weather_label.modulate = Color(0.3, 1.0, 0.4)

func _on_telemetry_updated(data: Dictionary) -> void:
	if speed_label:
		speed_label.text = "SPEED: %.1f m/s" % data.get("game_speed_mps", 0.0)
	if slope_label:
		slope_label.text = "SLOPE: %+.1f°" % data.get("slope_deg", 0.0)
	if elevation_label:
		elevation_label.text = "ELEV: %.1f m" % data.get("relative_height_m", 0.0)
	
	# NASA REMS Environmental Telemetry (Gale Crater baseline)
	if wind_label:
		if _selected_mission == "mission_2":
			var storm_wind: float = 14.5 + sin(Time.get_ticks_msec() * 0.003) * 3.8
			wind_label.text = "WIND SPEED: %.1f m/s (GALE STORM)" % storm_wind
		else:
			var base_wind: float = 3.8 + sin(Time.get_ticks_msec() * 0.001) * 0.9
			wind_label.text = "WIND SPEED: %.1f m/s (ESE)" % base_wind
	if temp_label:
		if _selected_mission == "mission_2":
			temp_label.text = "SURFACE TEMP: -28°C / -84°C"
		else:
			temp_label.text = "SURFACE TEMP: -14°C / -72°C"
	if pressure_label:
		if _selected_mission == "mission_2":
			pressure_label.text = "PRESSURE: 742 Pa (Dust Depressed)"
		else:
			pressure_label.text = "PRESSURE: 812 Pa (0.8% Earth)"
	if weather_label:
		if _selected_mission == "mission_2":
			weather_label.text = "WEATHER: Severe Dust Storm (Tau 2.45)"
			weather_label.modulate = Color(1.0, 0.75, 0.3, 1.0)
		else:
			weather_label.text = "WEATHER: Clear (No Storm / No Snow)"
			weather_label.modulate = Color(0.35, 1.0, 0.55, 1.0)
	
	var batt: float = data.get("battery", 100.0)
	if battery_bar:
		battery_bar.value = batt
	_update_battery_visuals(batt)

func _on_collect_prompt_changed(visible_flag: bool, drilling: bool, progress: float) -> void:
	if not center_prompt:
		return
	center_prompt.visible = visible_flag
	if not visible_flag:
		return
	if drilling:
		# Show drilling progress instead of "COLLECT SAMPLE"
		collect_label.text = "DRILLING... %.0f%%" % (progress * 100.0)
		collect_label.modulate = Color(1.0, 0.85, 0.2)
		key_box.visible = false
		drill_label.visible = false
	else:
		# Show the collect prompt with E key box
		collect_label.text = "COLLECT SAMPLE"
		collect_label.modulate = Color(0.92, 0.97, 1.0)
		key_box.visible = true
		drill_label.visible = false
