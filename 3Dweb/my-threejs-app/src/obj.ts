import * as THREE from "three";
import * as CANNON from "cannon-es"
import { world } from "./config"

export class Creeper {
    public readonly creeper: THREE.Group;
    private head: THREE.Mesh;
    private body: THREE.Mesh;
    private foot1: THREE.Mesh;
    private foot2: THREE.Mesh;
    private foot3: THREE.Mesh;
    private foot4: THREE.Mesh;
    private feet: THREE.Group;
    private bodyPhysics: CANNON.Body; // ✅ 物理剛體

    constructor() {
        // 設定幾何形狀（頭、身體、腳）
        const headGEO = new THREE.BoxGeometry(4, 4, 4);
        const bodyGEO = new THREE.BoxGeometry(4, 8, 2);
        const legGEO = new THREE.BoxGeometry(2, 3, 2);

        // 苦力怕臉部貼圖
        const headTEX = new THREE.TextureLoader().load("./assets/Creeper_Face.png");

        // 苦力怕皮膚貼圖
        const skinTEX = new THREE.TextureLoader().load('./assets/Creeper.png')

        // 設定頭部材質
        const headMaterials = [];
        for (let i = 0; i < 6; i++) {
            let mat;
            if (i == 4) {
                mat = headTEX;
            }
            else mat = skinTEX;
            headMaterials.push(new THREE.MeshPhongMaterial({ map: mat }));
        }

        // 設定身體材質
        const skinMAT = new THREE.MeshPhongMaterial({
            map: skinTEX
        });

        // 頭
        this.head = new THREE.Mesh(headGEO, headMaterials);
        this.head.position.set(0, 6, 0);

        // 身體
        this.body = new THREE.Mesh(bodyGEO, skinMAT);
        this.body.position.set(0, 0, 0);

        // 四隻腳
        this.foot1 = new THREE.Mesh(legGEO, skinMAT)
        this.foot1.position.set(-1, -5.5, 2)
        this.foot2 = new THREE.Mesh(legGEO, skinMAT)
        this.foot2.position.set(-1, -5.5, -2)
        this.foot3 = new THREE.Mesh(legGEO, skinMAT)
        this.foot3.position.set(1, -5.5, 2)
        this.foot4 = new THREE.Mesh(legGEO, skinMAT)
        this.foot4.position.set(1, -5.5, -2)
        this.feet = new THREE.Group();
        this.feet.add(this.foot1, this.foot2, this.foot3, this.foot4);


        // 將頭、身體、腳組合為一個 group
        this.creeper = new THREE.Group();
        this.creeper.add(this.head, this.body, this.feet);

        // 苦力怕投影設定
        this.creeper.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        // ✅ 創建 `cannon.js` 剛體 (碰撞箱)
        this.bodyPhysics = new CANNON.Body({
            mass: 1, // ✅ 具有質量，會受重力影響
            shape: new CANNON.Box(new CANNON.Vec3(2, 4, 1)), // ✅ 大小與 Creeper 身體匹配
            fixedRotation: true,
            position: new CANNON.Vec3(0, 0, 0), // ✅ 初始位置
            linearDamping: 0.5,
            angularDamping: 0.9 // ✅ **減少旋轉影響**
        });
        this.bodyPhysics.updateMassProperties();

        world.addBody(this.bodyPhysics); // ✅ 加入物理世界
    }

    // 取得 Creeper 物件
    public getMesh(): THREE.Group {
        return this.creeper;
    }

    public getHead(): THREE.Mesh {
        return this.head;
    }

    // 取得剛體 (物理世界用)
    public getBody(): CANNON.Body {
        return this.bodyPhysics;
    }

    public getFeet(foot: number): THREE.Mesh {
        switch (foot) {
            case 1: return this.foot1;
            case 2: return this.foot2;
            case 3: return this.foot3;
            case 4: return this.foot4;
            default: throw new Error("Invalid foot index! Use 1~4.");
        }
    }

    // **每幀同步物理剛體到 Three.js Mesh**
    public update() {
        this.creeper.position.copy(this.bodyPhysics.position);
        this.creeper.quaternion.copy(this.bodyPhysics.quaternion);
    }
}



export class Obsidian {
    private cube: THREE.Mesh
    private body: CANNON.Body
    constructor(position: THREE.Vector3) {

        const cubeGEO: THREE.BoxGeometry = new THREE.BoxGeometry(5.5, 5.5, 5.5)
        const cubeTEX = new THREE.TextureLoader().load("./assets/Obsidian.png")
        const cubeMaterial = new THREE.MeshPhongMaterial({ map: cubeTEX })
        this.cube = new THREE.Mesh(cubeGEO, cubeMaterial)
        this.cube.position.copy(position)

        // **Obsidian 剛體**
        this.body = new CANNON.Body({
            mass: 0, // ✅ 靜態方塊
            shape: new CANNON.Box(new CANNON.Vec3(5.5, 5.5, 5.5)),
            position: new CANNON.Vec3(position.x, position.y, position.z),
        });

        world.addBody(this.body)
    }
    public getCube(): THREE.Mesh {
        return this.cube;
    }

    public getBody(): CANNON.Body {
        return this.body
    }
}

export class Portal {
    private portal: THREE.Mesh
    constructor(position: THREE.Vector3) {
        const portalGEO: THREE.BoxGeometry = new THREE.BoxGeometry(5.5, 5.5, 0.1)
        const portalTEX = new THREE.TextureLoader().load("./assets/NetherPortal.gif")
        const portalMat = new THREE.MeshStandardMaterial({
            map: portalTEX,
            transparent: true, // ✅ 確保紋理透明
            opacity: 0.8,
            emissive: 0x5500aa, // ✅ 讓地獄門發光
            emissiveIntensity: 1,
        })
        this.portal = new THREE.Mesh(portalGEO, portalMat)
        this.portal.position.copy(position)
    }
    public getPortal(): THREE.Mesh {
        return this.portal;
    }
}

