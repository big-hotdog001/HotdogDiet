import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import GUI from "lil-gui"; // ✅ 使用 `lil-gui` (較新的 dat.GUI 替代方案)

let planePhysics: CANNON.Body;

// **定義 datGUI 的控制介面**
export interface DatGUIControls {
    HeadRotateOpen: boolean;
    WalkingOpen: boolean;
    DirectionOpen: boolean;
}

// **創建物理世界**
export const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // 設定 Minecraft 風格重力
world.broadphase = new CANNON.NaiveBroadphase(); // 設定碰撞偵測的演算法，NaiveBroadphase是最簡單的碰撞演算法，適合小型場景。
(world.solver as CANNON.GSSolver).iterations = 10; //設定每幀內解決碰撞的次數

// **全域變數**
export const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });
export const scene: THREE.Scene = new THREE.Scene();
export const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
export let cameraControl: OrbitControls;
export const stats: Stats = new Stats();
export const gui: GUI = new GUI();

// **燈光變數**
export let ambientLight: THREE.AmbientLight;
export let pointLight: THREE.PointLight;
export let spotLight: THREE.SpotLight;
export let directionalLight: THREE.DirectionalLight;
export let sphereLightMesh: THREE.Mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.3),
    new THREE.MeshBasicMaterial({ color: 0xccffcc })
);

// 設置環境光 AmbientLight
ambientLight = new THREE.AmbientLight(0x404040)
scene.add(ambientLight)

// 基本點光源 PointLight
pointLight = new THREE.PointLight(0xccffcc, 150, 100) // 顏色, 強度, 距離
pointLight.castShadow = true
pointLight.visible = true
scene.add(pointLight)
// pointLight.position.set(-10, 20, 20)
// let pointLightHelper = new THREE.PointLightHelper(pointLight)
// scene.add(pointLightHelper)
// pointLight.visible = false
// pointLightHelper.visible = false

// 小球體模擬點光源實體
sphereLightMesh.castShadow = true;
sphereLightMesh.position.y = 16;

// 設置聚光燈 SpotLight
spotLight = new THREE.SpotLight(0xf0f0f0, 150)
spotLight.position.set(-10, 20, 20)
spotLight.castShadow = true
scene.add(spotLight)
spotLight.visible = true

// 基本平行光 DirectionalLight
directionalLight = new THREE.DirectionalLight(0x404040)
directionalLight.position.set(-10, 20, 20)
directionalLight.castShadow = true
scene.add(directionalLight)
directionalLight.visible = true

// **載入紋理**
const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load("./assets/grass.png");

// **讓紋理重複 (避免模糊放大)**
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(10, 10); // ✅ 讓草地紋理重複 10x10 次，變成 Minecraft 格子狀

// **創建地板**
export function createGround(scene: THREE.Scene) {
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: grassTexture, // ✅ 使用 Minecraft 草地紋理
        roughness: 0.8, // ✅ 讓材質更真實
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // ✅ 讓地板水平
    plane.position.y = -7;
    plane.receiveShadow = true; // ✅ 允許接收陰影
    scene.add(plane)

    // **物理剛體 (`cannon.js`)**
    planePhysics = new CANNON.Body({
        mass: 0, // ✅ `0` 代表靜態地板，不會移動
        shape: new CANNON.Plane(),
        position: new CANNON.Vec3(0, -4, 0) // ✅ 地板 Y 軸位置
    });
    planePhysics.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // ✅ 確保地板水平

    world.addBody(planePhysics); // ✅ 加入物理世界
}
// **datGUI 設定物件**
export const datGUIControls: DatGUIControls = {
    HeadRotateOpen: false,
    WalkingOpen: false,
    DirectionOpen: false,
};

// **初始化 Renderer**
export function setupRenderer(): void {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = 2;
    document.body.appendChild(renderer.domElement);
}

// **初始化 Camera & Controls**
export function setupCameraControls(): void {
    camera.position.set(30, 30, 30);
    camera.lookAt(scene.position);
    cameraControl = new OrbitControls(camera, renderer.domElement);
    cameraControl.enableDamping = true;
    cameraControl.dampingFactor = 0.25;
    cameraControl.enableZoom = true;
}

// **初始化 dat.GUI**
export function setupGUI(): void {
    gui.add(datGUIControls, "HeadRotateOpen").onChange((value: boolean) => {
        datGUIControls.HeadRotateOpen = value;
    });
    gui.add(datGUIControls, "WalkingOpen").onChange((value: boolean) => {
        datGUIControls.WalkingOpen = value;
    });
    gui.add(datGUIControls, "DirectionOpen").onChange((value: boolean) => {
        datGUIControls.DirectionOpen = value;
    });
}

// **初始化 Stats**
export function setupStats(): void {
    document.body.appendChild(stats.dom);
}