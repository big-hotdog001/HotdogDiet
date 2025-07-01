import * as THREE from "three";
import * as CANNON from "cannon-es"
import { Creeper } from "./obj";
import { HellDoor } from "./blocks/HellDoor";
import {
  renderer,
  scene,
  world,
  camera,
  cameraControl,
  stats,
  ambientLight,
  pointLight,
  spotLight,
  directionalLight,
  setupRenderer,
  setupCameraControls,
  setupGUI,
  setupStats,
  createGround,
  //rotateAngle,
  sphereLightMesh,
  datGUIControls,
} from "./config"; // ✅ 匯入設定檔
let rotateAngle: number = 0, walkOffset: number = 0, rotateHeadOffset: number = 0;
let creeperObj: Creeper;
let helldoors: HellDoor[] = [];
let isJumping: boolean = false;
let isTeleporting: boolean = false;
let lastCheckTime = 0;
const checkInterval = 500; // ✅ 每 500ms 檢查一次
// **控制變數**
const moveSpeed = 18;
const jumpForce = 15;
// const turnSpeed = 0.05;
const keyState: Record<string, boolean> = {};

// **初始化場景**
function init(): void {
  setupRenderer(); // ✅ 初始化 Renderer
  setupCameraControls(); // ✅ 初始化 Camera & Controls
  setupStats(); // ✅ 初始化 Stats
  setupGUI(); // ✅ 初始化 GUI

  // **燈光**
  scene.add(ambientLight);
  scene.add(pointLight);
  scene.add(sphereLightMesh);
  scene.add(spotLight);
  scene.add(directionalLight);

  let axes = new THREE.AxesHelper(20)
  scene.add(axes)

  // **地板**
  createGround(scene);

  // **產生 Creeper 角色**
  createCreeper();
  createHellDoor(0, -40, "https://github.com/big-hotdog001");
  createHellDoor(0, 40, "https://www.youtube.com/");

}

// **點光源繞 Y 軸旋轉動畫**

function pointLightAnimation(): void {
  if (rotateAngle > 2 * Math.PI) {
    rotateAngle = 0; // ✅ 超過 360 度後歸零
  } else {
    rotateAngle += 0.03; // ✅ 遞增角度
  }

  // ✅ 光源沿橢圓軌道繞 Y 軸旋轉
  sphereLightMesh.position.x = 8 * Math.cos(rotateAngle);
  sphereLightMesh.position.z = 4 * Math.sin(rotateAngle);

  // ✅ 點光源位置與球體同步
  pointLight.position.copy(sphereLightMesh.position);
}

// **生成苦力怕並加到場景**
function createCreeper() {
  creeperObj = new Creeper();
  scene.add(creeperObj.getMesh());
}



function createHellDoor(x_offset: number, z_offset: number, url: string) {

  const helldoor = new HellDoor(new THREE.Vector3(0 + x_offset, 0, 0 + z_offset), url)
  helldoors.push(helldoor)
  scene.add(helldoor)
}


// 苦力怕擺頭
function creeperHeadRotate(): void {
  rotateHeadOffset += 0.04
  if (datGUIControls.HeadRotateOpen) {
    creeperObj.getHead().rotation.y = Math.sin(rotateHeadOffset)
  }
}

// 苦力怕走動
function creeperFeetWalk(): void {
  walkOffset += 0.04
  if (datGUIControls.WalkingOpen) {
    creeperObj.getFeet(1).rotation.x = Math.sin(walkOffset) / 4 // 前腳左
    creeperObj.getFeet(2).rotation.x = -Math.sin(walkOffset) / 4 // 後腳左
    creeperObj.getFeet(3).rotation.x = -Math.sin(walkOffset) / 4 // 前腳右
    creeperObj.getFeet(4).rotation.x = Math.sin(walkOffset) / 4 // 後腳右
  }
}

function creeperJump(): void {
  if (isJumping) return;

  // ✅ 檢查 Creeper 是否接觸地面
  const contact = world.contacts.find((c) =>
    c.bi === creeperObj.getBody() || c.bj === creeperObj.getBody()
  );

  if (!contact) return; // ✅ 沒有接觸地面，不能跳
  isJumping = true;
  creeperObj.getBody().velocity.y = jumpForce;
  setTimeout(() => { isJumping = false; },);

}

// **監聽鍵盤事件**
window.addEventListener("keydown", (event) => (keyState[event.code] = true));
window.addEventListener("keyup", (event) => (keyState[event.code] = false));

// **控制 Creeper 移動**
function moveCreeper(): void {
  const creeperMesh = creeperObj.getMesh();
  const creeperBox = creeperObj.getBody();
  const direction = new THREE.Vector3();
  direction.y = 0;
  creeperMesh.getWorldDirection(direction);
  direction.normalize(); // ✅ 確保方向單位長度

  if (keyState["ArrowUp"] || keyState["KeyW"]) {
    //creeperMesh.translateZ(moveSpeed); // ✅ 向前移動 (沿 Z 軸)

    creeperBox.velocity.x = direction.x * moveSpeed;
    creeperBox.velocity.z = direction.z * moveSpeed;
  }
  if (keyState["ArrowDown"] || keyState["KeyS"]) {
    //creeperMesh.translateZ(-moveSpeed); // ✅ 向後移動
    creeperBox.velocity.x = -direction.x * moveSpeed;
    creeperBox.velocity.z = -direction.z * moveSpeed;
  }
  if (keyState["ArrowLeft"] || keyState["KeyA"]) {
    // creeperMesh.rotation.y += turnSpeed; // ✅ 左轉
    creeperBox.angularVelocity.set(0, Math.PI / 3, 0); // ✅ 左轉
  }
  if (keyState["ArrowRight"] || keyState["KeyD"]) {
    //creeperMesh.rotation.y -= turnSpeed; // ✅ 右轉
    creeperBox.angularVelocity.set(0, -Math.PI / 3, 0); // ✅ 左轉
  }
  checkPortalCollision()
}

// **檢查 Creeper 是否進入任何地獄門**
function checkPortalCollision(): void {
  if (isTeleporting) return; // ✅ 如果已經在傳送中，就不要再執行

  const creeperBox = new THREE.Box3().setFromObject(creeperObj.getMesh());

  helldoors.forEach((helldoor) => {
    const portalBox = new THREE.Box3().setFromObject(helldoor.getPortal());

    if (creeperBox.intersectsBox(portalBox)) {
      console.log("Creeper 進入地獄門！前往：" + helldoor.getURL());
      isTeleporting = true; // ✅ 設定標誌，避免重複執行
      setTimeout(() => {
        window.location.href = helldoor.getURL();
      }, 1000); // ✅ 延遲 1 秒跳轉，避免瞬間觸發多次
    }
  });
}


// **渲染函數**
function render(): void {
  requestAnimationFrame(render);
  stats.update();
  world.step(1 / 60);
  creeperObj.update();
  pointLightAnimation();
  creeperHeadRotate();
  creeperFeetWalk();
  moveCreeper();
  const now = Date.now();
  if (now - lastCheckTime > checkInterval) {
    lastCheckTime = now;
    checkPortalCollision(); // ✅ 只在間隔時間內執行
  }
  cameraControl.update();
  renderer.render(scene, camera);
}

// **讓跳躍觸發 (按鍵觸發)**
window.addEventListener("keypress", (event) => {
  if (event.code === "Space") {
    creeperJump(); // ✅ 按空白鍵執行跳躍
  }
});

world.addEventListener("postStep", () => {
  if (creeperObj.getBody().position.y <= 1) {
    isJumping = false; // ✅ 當 Creeper 落地時，允許再次跳躍
  }
});

// **視窗大小變化時更新相機與渲染器**
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// **初始化並開始渲染**
init();
render();



// let Obsidiancubes: Obsidian[] = [];
// let Portalplanes: Portal[] = [];

// function checkCreeperOnObsidian(): void {
//   const creeperBox = new THREE.Box3().setFromObject(creeperObj.getMesh());
//   let isOnObsidian = false;
//   let highestY = -Infinity;

//   Obsidiancubes.forEach((obsidian) => {
//     const obsidianBox = new THREE.Box3().setFromObject(obsidian.getCube());

//     if (creeperBox.intersectsBox(obsidianBox)) {
//       highestY = Math.max(highestY, obsidian.getCube().position.y);
//       isOnObsidian = true;
//     }
//   });

//   if (isOnObsidian) {
//     creeperObj.getMesh().position.y = highestY + 2.75; // ✅ 讓 Creeper 站在黑曜石上
//   } else {
//     isJumping // ✅ 如果沒有站在黑曜石上，讓 Creeper 掉下去
//   }
// }

// function createPortal(position: THREE.Vector3) {
//   const newPortal = new Portal(position)
//   Portalplanes.push(newPortal)
//   scene.add(newPortal.getPortal())
// }

// function createObsidian(position: THREE.Vector3) {
//   const obsidian = new Obsidian(position);
//   Obsidiancubes.push(obsidian)
//   scene.add(obsidian.getCube())
// }

// createObsidian(new THREE.Vector3(8.25,-4.25,40 + offset));
// createObsidian(new THREE.Vector3(8.25,1.25,40 + offset));
// createObsidian(new THREE.Vector3(8.25,6.75,40 + offset));
// createObsidian(new THREE.Vector3(8.25,12.25,40 + offset));
// createObsidian(new THREE.Vector3(8.25,17.75,40 + offset));
// createObsidian(new THREE.Vector3(2.75,-4.25,40 + offset));
// createObsidian(new THREE.Vector3(2.75,17.75,40 + offset));
// createObsidian(new THREE.Vector3(-2.75,-4.25,40 + offset));
// createObsidian(new THREE.Vector3(-2.75,17.75,40 + offset));
// createObsidian(new THREE.Vector3(-8.25,-4.25,40 + offset));
// createObsidian(new THREE.Vector3(-8.25,1.25,40 + offset));
// createObsidian(new THREE.Vector3(-8.25,6.75,40 + offset));
// createObsidian(new THREE.Vector3(-8.25,12.25,40 + offset));
// createObsidian(new THREE.Vector3(-8.25,17.75,40 + offset));
// createPortal(new THREE.Vector3(2.75,1.25,40 + offset));
// createPortal(new THREE.Vector3(-2.75,1.25,40 + offset));
// createPortal(new THREE.Vector3(2.75,6.75,40 + offset));
// createPortal(new THREE.Vector3(-2.75,6.75,40 + offset));
// createPortal(new THREE.Vector3(2.75,12.25,40 + offset));
// createPortal(new THREE.Vector3(-2.75,12.25,40 + offset));

// const planeGeometry = new THREE.PlaneGeometry(60, 60);
// const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// plane.rotation.x = -Math.PI / 2;
// plane.position.y = -7;
// plane.receiveShadow = true;