shader_type spatial;

varying vec3 world_position;
varying vec3 world_normal;

float hash_value(vec2 point) {
	point = fract(point * vec2(123.34, 456.21));
	point += dot(point, point + 45.32);
	return fract(point.x * point.y);
}

float value_noise(vec2 point) {
	vec2 cell = floor(point);
	vec2 fraction = fract(point);
	fraction = fraction * fraction * (3.0 - 2.0 * fraction);
	float lower = mix(hash_value(cell), hash_value(cell + vec2(1.0, 0.0)), fraction.x);
	float upper = mix(hash_value(cell + vec2(0.0, 1.0)), hash_value(cell + vec2(1.0, 1.0)), fraction.x);
	return mix(lower, upper, fraction.y);
}

float fractal_noise(vec2 point) {
	float value = 0.0;
	float amplitude = 0.5;
	float amplitude_sum = 0.0;
	for (int octave = 0; octave < 4; octave++) {
		value += value_noise(point) * amplitude;
		amplitude_sum += amplitude;
		point = point * 2.03 + vec2(17.1, 9.2);
		amplitude *= 0.5;
	}
	return value / amplitude_sum;
}

float pebble_distance(vec2 point) {
	vec2 cell = floor(point);
	vec2 local = fract(point);
	float nearest = 1.0;
	for (int y = -1; y <= 1; y++) {
		for (int x = -1; x <= 1; x++) {
			vec2 neighbor = vec2(float(x), float(y));
			vec2 seed = cell + neighbor;
			vec2 offset = vec2(
				hash_value(seed),
				hash_value(seed + vec2(19.19, 73.73))
			);
			vec2 delta = neighbor + offset - local;
			nearest = min(nearest, dot(delta, delta));
		}
	}
	return sqrt(nearest);
}

void vertex() {
	world_position = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	world_normal = normalize(MODEL_NORMAL_MATRIX * NORMAL);
}

void fragment() {
	vec2 terrain_position = world_position.xz;
	float broad_variation = fractal_noise(terrain_position * 0.025);
	float medium_variation = value_noise(terrain_position * 0.42);
	float grain_variation = value_noise(terrain_position * 7.0);
	float fine_variation = value_noise(terrain_position * 20.0);

	float footprint = fwidth(terrain_position.x) + fwidth(terrain_position.y);
	float detail_fade = 1.0 - smoothstep(0.045, 0.18, footprint);
	float cell_distance = pebble_distance(terrain_position * 10.0);
	float pebble_edge = max(fwidth(cell_distance), 0.025);
	float pebbles = 1.0 - smoothstep(
		0.24 - pebble_edge,
		0.36 + pebble_edge,
		cell_distance
	);
	pebbles *= detail_fade;

	float slope = 1.0 - clamp(normalize(world_normal).y, 0.0, 1.0);
	float exposed_rock = smoothstep(0.16, 0.4, slope);

	vec3 dark_dust = vec3(0.34, 0.075, 0.032);
	vec3 light_dust = vec3(0.68, 0.20, 0.075);
	vec3 dust_color = mix(
		dark_dust,
		light_dust,
		smoothstep(0.18, 0.82, broad_variation)
	);
	dust_color *= mix(0.76, 1.16, medium_variation);
	dust_color *= mix(0.84, 1.16, grain_variation);
	dust_color *= mix(0.93, 1.07, fine_variation * detail_fade);

	vec3 dark_gravel = vec3(0.22, 0.065, 0.034);
	vec3 light_gravel = vec3(0.55, 0.19, 0.075);
	vec3 gravel_color = mix(dark_gravel, light_gravel, grain_variation);
	dust_color = mix(dust_color, gravel_color, pebbles * 0.82);

	vec3 dark_rock = vec3(0.22, 0.065, 0.037);
	vec3 light_rock = vec3(0.43, 0.16, 0.08);
	vec3 rock_color = mix(dark_rock, light_rock, medium_variation);
	vec3 terrain_color = mix(dust_color, rock_color, exposed_rock * 0.55);

	float micro_height = (
		(grain_variation - 0.5) * 0.012 +
		(pebbles - 0.5) * 0.035
	) * detail_fade;
	vec3 base_normal = normalize(NORMAL);
	vec3 position_dx = dFdx(VERTEX);
	vec3 position_dy = dFdy(VERTEX);
	vec3 perpendicular_x = cross(position_dy, base_normal);
	vec3 perpendicular_y = cross(base_normal, position_dx);
	float determinant = dot(position_dx, perpendicular_x);
	float height_dx = dFdx(micro_height);
	float height_dy = dFdy(micro_height);
	if (abs(determinant) > 0.00001) {
		vec3 surface_gradient = sign(determinant) * (
			height_dx * perpendicular_x + height_dy * perpendicular_y
		);
		NORMAL = normalize(base_normal - surface_gradient * 0.7);
	}

	ALBEDO = terrain_color;
	ROUGHNESS = 1.0;
	METALLIC = 0.0;
	SPECULAR = 0.04;
	AO = mix(0.95, 0.72, pebbles * 0.7);
}
