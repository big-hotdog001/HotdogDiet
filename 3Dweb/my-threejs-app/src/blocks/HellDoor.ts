import * as THREE from "three"
import { Obsidian, Portal } from "../obj"
import { scene } from "../config";

export class HellDoor extends THREE.Object3D {
    private url: string;
    private Obsidiancubes: Obsidian[] = []; // ✅ 存放所有 Obsidian 方塊
    private Portalplanes: Portal[] = []; // ✅ 存放 Portal 平面

    constructor(position: THREE.Vector3, url: string) {
        super();
        this.url = url; // ✅ 設定網址

        // ✅ 創建地獄門邊框 (Obsidian 方塊)
        this.createObsidian(new THREE.Vector3(position.x + 8.25, position.y - 4.25, position.z));
        this.createObsidian(new THREE.Vector3(position.x + 8.25, position.y + 1.25, position.z));
        this.createObsidian(new THREE.Vector3(position.x + 8.25, position.x + 6.75, position.z));
        this.createObsidian(new THREE.Vector3(position.x + 8.25, position.x + 12.25, position.z));
        this.createObsidian(new THREE.Vector3(position.x + 8.25, position.x + 17.75, position.z));
        this.createObsidian(new THREE.Vector3(position.x + 2.75, position.x - 4.25, position.z));
        this.createObsidian(new THREE.Vector3(position.x + 2.75, position.x + 17.75, position.z));
        this.createObsidian(new THREE.Vector3(position.x - 2.75, position.x - 4.25, position.z));
        this.createObsidian(new THREE.Vector3(position.x - 2.75, position.x + 17.75, position.z));
        this.createObsidian(new THREE.Vector3(position.x - 8.25, position.x - 4.25, position.z));
        this.createObsidian(new THREE.Vector3(position.x - 8.25, position.x + 1.25, position.z));
        this.createObsidian(new THREE.Vector3(position.x - 8.25, position.x + 6.75, position.z));
        this.createObsidian(new THREE.Vector3(position.x - 8.25, position.x + 12.25, position.z));
        this.createObsidian(new THREE.Vector3(position.x - 8.25, position.x + 17.75, position.z));

        this.createPortal(new THREE.Vector3(position.x + 2.75, position.y + 1.25, position.z));
        this.createPortal(new THREE.Vector3(position.x - 2.75, position.y + 1.25, position.z));
        this.createPortal(new THREE.Vector3(position.x + 2.75, position.y + 6.75, position.z));
        this.createPortal(new THREE.Vector3(position.x - 2.75, position.y + 6.75, position.z));
        this.createPortal(new THREE.Vector3(position.x + 2.75, position.y + 12.25, position.z));
        this.createPortal(new THREE.Vector3(position.x - 2.75, position.y + 12.25, position.z));
    }

    private createObsidian(position: THREE.Vector3) {
        const obsidian = new Obsidian(position);
        this.Obsidiancubes.push(obsidian); // ✅ 存到類別內
        scene.add(obsidian.getCube()); // ✅ 加到場景
    }

    private createPortal(position: THREE.Vector3): void {
        const portal = new Portal(position);
        this.Portalplanes.push(portal); // ✅ 存到類別內
        scene.add(portal.getPortal());
    }

    // ✅ 取得地獄門內部的 Portal (供 Creeper 碰撞使用)
    public getPortal(): THREE.Object3D {
        let portalObject: THREE.Object3D = new THREE.Object3D();
        this.Portalplanes.forEach((portal) => {
            portalObject = portal.getPortal();
        });
        return portalObject;
    }

    public getURL(): string {
        return this.url;
    }
}