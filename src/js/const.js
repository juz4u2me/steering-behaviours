// SCALE
export const SCALE = 3;

// Vehicle
export const MAX_SPEED = 2.77778*SCALE; // 10km/h -> 2.77778m/s, 36km/h -> 10m/s
export const MAX_VELOCITY = 2.77778*SCALE;
export const VEHICLE_SIZE = 3.0*SCALE;

// Obstacle
export const OBSTACLE_SIZE = 7.0*SCALE;

// Collision
export const SLOWING_RADIUS = 10*SCALE;
export const MAX_FORCE = 2*SCALE; // Limits the acceleration for more fluid and natural movement
export const MAX_AVOIDANCE = 2*SCALE;
export const MIN_COLLISION_TIME = 15.0*SCALE; // 15 second to collision
export const BUFFER = 20.0*SCALE;