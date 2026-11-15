class_name ElevationZone
extends Area2D

signal entered_zone(zone: ElevationZone)

@export var z_level: int = 1
@export var elevation_m: float = 0.0
@export var slope_deg: float = 0.0
@export var zone_name: String = "Basin (Z1)"

func _ready() -> void:
	body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node2D) -> void:
	if body is CharacterBody2D:
		entered_zone.emit(self)
		if body.has_method("set_elevation_data"):
			body.call("set_elevation_data", z_level, elevation_m, slope_deg, zone_name)
