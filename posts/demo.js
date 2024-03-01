import * as THREE from 'three';

const h = 0.05;
const g = new THREE.Vector3(0, -9.8, 0);
const mass = 1.0;
const dv = g.multiplyScalar(h/mass);
const dv0dp = new THREE.Matrix3().identity();
let target_position = new THREE.Vector3(0, 5, -10);
const learning_rate = 0.1;

function new_target_position() {
	target_position.x = Math.random() * (2 - (-2)) + (-2);
	target_position.y = Math.random() * 10;
	target_position.z = Math.random() * -10;
}

function phi(position) {
	return position.distanceTo(target_position);
}

function partial_dphi_dx(position) {
	const dphi_dx = new THREE.Vector3();
	dphi_dx.copy(position).sub(target_position).multiplyScalar(2);
	return dphi_dx;
}

function F(position, velocity) {
	const new_velocity = new THREE.Vector3();
	new_velocity.copy(velocity).add(dv);

	const dx = new THREE.Vector3();
	dx.copy(velocity).multiplyScalar(h);
	const new_position = new THREE.Vector3();
	new_position.copy(position).add(dx);

	return {
		new_position: new_position,
		new_velocity: new_velocity
	};
}

function partial_dF_dx(position, velocity) {
	const dvdx = new THREE.Matrix3().identity();
	const dxdx = new THREE.Matrix3().identity();
	return {
		dv_dx:  dvdx.multiplyScalar(0),
		dx_dx: dxdx.multiplyScalar(h)
	};
}

function partial_dF_dv(position, velocity) {
	const dvdv = new THREE.Matrix3().identity();
	const dxdv = new THREE.Matrix3().identity();
	return {
		dv_dv: dvdv,
		dx_dv: dxdv
	};
}

// Back-propagation
function compute_dphi_dp(positions, velocities) {
	// Number of simulation steps
	const Ns = positions.length - 1;
	// console.log(Ns);

	// Initialize the array of total derivatives
	let dphi_dx_array = [];
	let dphi_dv_array = [];
	for (let i = 0; i < Ns + 1; i++) {
		dphi_dx_array.push(new THREE.Vector3(0, 0, 0));
		dphi_dv_array.push(new THREE.Vector3(0, 0, 0));
	}
	// Only the last state has a cost function derivative different than zero
	// Initialize the last two total derivatives
	const partial_dphi_dxNs = partial_dphi_dx(positions[Ns]);
	dphi_dx_array[Ns].copy(partial_dphi_dxNs);
	dphi_dv_array[Ns].multiplyScalar(0);

	// Backward loop
	for (let i = Ns - 1; i >= 0; i--) {
		const dF_dx = partial_dF_dx(positions[i], velocities[i]);
		const dF_dv = partial_dF_dv(positions[i], velocities[i]);

		// Update dphi_dx_array and dphi_dv_array
		dphi_dx_array[i]
			.copy(dphi_dx_array[i + 1])
			.applyMatrix3(dF_dx.dx_dx)
			.add(dphi_dv_array[i + 1].clone().applyMatrix3(dF_dx.dv_dx));

		dphi_dv_array[i]
			.copy(dphi_dx_array[i + 1].clone().applyMatrix3(dF_dv.dx_dv))
			.add(dphi_dv_array[i + 1].clone().applyMatrix3(dF_dv.dv_dv));
	}

	const dphi_dp = new THREE.Vector3();
	// Use clone() to ensure the original vector is not modified
	dphi_dp.copy(dphi_dv_array[0].clone().applyMatrix3(dv0dp));
	// console.log(dphi_dp);
	return dphi_dp;
}

function main() {

	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
	renderer.shadowMap.enabled = true;

	const fov = 80;
	const aspect = 8 / 6; // the canvas default
	const near = 0.1;
	const far = 20;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	// camera.position.z = 10;
	camera.position.set(10, 2, -5);

	// Set the camera's target (lookAt point)
	camera.lookAt(0, camera.position.y, camera.position.z);

	const scene = new THREE.Scene();
	const pageBackgroundColor = getComputedStyle(document.body).backgroundColor;
	scene.background = new THREE.Color(pageBackgroundColor);
	const wireframe_color = new THREE.Color(1.0 - scene.background.r, 1.0 - scene.background.g, 1.0 - scene.background.b);
	{

		const color = 0xFFFFFF;
		const intensity = 3;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(0, 30, 0);
		light.castShadow = true;
		light.shadow.camera.near = 1;
		light.shadow.camera.far = 400;
		// light.shadow.mapSize.width = 1024;
		// light.shadow.mapSize.height = 1024;
		scene.add(light);

	}

	const sphere_radius = 1;
	const sphere_geometry = new THREE.SphereGeometry(sphere_radius);
	const target_geometry = new THREE.TorusGeometry(sphere_radius*1.5, 0.2);
	const plane_geometry = new THREE.PlaneGeometry(50, 50, 10, 10);
	const cylinder_geometry = new THREE.CylinderGeometry(0.02,0.02,30, 1000);

	const wireframe_material = new THREE.MeshBasicMaterial({ color: wireframe_color, wireframe: true });
	const plane_material = new THREE.MeshPhongMaterial({ color: 0x44aa88 }); // greenish blue
	const material = new THREE.MeshPhongMaterial({ color: 0x3498eb }); // greenish blue
	const target_material = new THREE.MeshPhongMaterial({ color: 0xFFA500 }); // greenish blue

	const red_material = new THREE.MeshBasicMaterial({ color: 0xFF0000 }); // greenish blue
	const blue_material = new THREE.MeshBasicMaterial({ color: 0x00FF00 }); // greenish blue
	const green_material = new THREE.MeshBasicMaterial({ color: 0x0000FF }); // greenish blue

	const ball = new THREE.Mesh(sphere_geometry, material);
	const plane = new THREE.Mesh(plane_geometry, plane_material);
	const target = new THREE.Mesh(target_geometry, target_material);

	const x_axis = new THREE.Mesh(cylinder_geometry, red_material);
	const y_axis = new THREE.Mesh(cylinder_geometry, blue_material);
	const z_axis = new THREE.Mesh(cylinder_geometry, green_material);
	x_axis.rotation.x -= Math.PI / 2.;
	z_axis.rotation.x -= Math.PI / 2.;
	z_axis.rotation.z -= Math.PI / 2.;
	scene.add(x_axis);
	scene.add(y_axis);
	scene.add(z_axis);

	plane.receiveShadow = true;
	ball.castShadow = true;
	target.castShadow = true;

	scene.add(ball);
	plane.position.set(0, -sphere_radius*2.0, camera.position.z);
	plane.rotation.x -= Math.PI/2.;
	scene.add(plane);
	target.rotation.x -= Math.PI/2.;
	scene.add(target);

	target.position.copy(target_position);

	let position = new THREE.Vector3(0, 0, 0);
	let velocity = new THREE.Vector3(0, 0, 0);

	const initial_position = new THREE.Vector3(0, 0, 0);
	let initial_velocity = new THREE.Vector3(0, 1, 0);

	const DIFF_ITER = 50;
	const MAX_ITER = 80;
	let positions_array = [];
	let velocities_array = [];
	let achieved_position = new THREE.Vector3(0,0,0);

	function render(time) {
		time *= 0.001;  // convert time to seconds
		positions_array.push(position);
		velocities_array.push(velocity);
		ball.position.copy(position);
		x_axis.position.copy(position);
		y_axis.position.copy(position);
		z_axis.position.copy(position);
		if (positions_array.length === DIFF_ITER) {
			achieved_position.copy(position);
			let dphi_dp = compute_dphi_dp(positions_array, velocities_array);

			// Gradient descent
			initial_velocity.sub(dphi_dp.clone().multiplyScalar(learning_rate));
			// console.log(phi(position))
			// console.log(position)
		}
		if (positions_array.length > MAX_ITER) {
			// New target if current has already converged
			if (phi(achieved_position) < 0.01) {
				new_target_position();
				target.position.copy(target_position);
			}

			// Reset simulation
			position.copy(initial_position);
			velocity.copy(initial_velocity);
			positions_array = [];
			velocities_array = [];
		}
		let result = F(position, velocity);
		position.copy(result.new_position);
		velocity.copy(result.new_velocity);
		renderer.render(scene, camera);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}



main();
