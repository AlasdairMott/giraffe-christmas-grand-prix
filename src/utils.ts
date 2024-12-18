import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { SCALE } from "./CityScene";

const TREE_MATERIAL = new THREE.MeshStandardMaterial({ color: "#33aa33" });
const RAMP_MATERIAL = new THREE.MeshStandardMaterial({ color: "#ff0000" });

export const getBuildingTextureUrls = () => {
  const name = "./highrise/highrise";
  const fileExtension = "jpeg";
  const numberOfTextures = 11;
  const textureUrls = [];
  for (let i = 1; i <= numberOfTextures; i++) {
    textureUrls.push(`${name}${i}.${fileExtension}`);
  }
  return textureUrls;
};

export const isMesh = (child: THREE.Object3D): child is THREE.Mesh => {
  return child instanceof THREE.Mesh;
};

export const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/examples/jsm/libs/draco/");
loader.setDRACOLoader(dracoLoader);

export const formatTexture = (texture: THREE.Texture, size: number) => {
  texture.repeat.set(size, size);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

type Textures = {
  highrise: THREE.Texture[];
  road: THREE.Texture;
};

export function processImportedGeometry(
  group: THREE.Group,
  textures: Textures
) {
  const highRiseMaterials = textures.highrise.map(
    (texture) =>
      new THREE.MeshStandardMaterial({
        map: texture,
      })
  );

  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      mesh.geometry.computeBoundingBox();
      mesh.geometry.computeVertexNormals();

      const bbox = mesh.geometry.boundingBox!;
      const height = (bbox.max.z - bbox.min.z) * SCALE;

      if (
        (mesh as THREE.InstancedMesh).isInstancedMesh ||
        mesh instanceof THREE.InstancedMesh ||
        mesh.userData["instanceIxToFeatureMap"] !== undefined ||
        mesh.name.includes("instance")
      ) {
        // mesh.material = TREE_MATERIAL;
        return;
      } else if (height > 0.5) {
        if (height < 5) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: "#0f0f0f",
            map: textures.road,
          });
        } else {
          const material =
            highRiseMaterials[
              Math.floor(Math.random() * highRiseMaterials.length)
            ];
          mesh.material = material;
        }
      } else {
        mesh.userData.isRoad = true;
        mesh.material = new THREE.MeshStandardMaterial({
          color: height < 0.2 ? "#555555" : "#aaaaaa",
          map: textures.road,
        });
      }
    }
  });

  addTreesToGroup(group);
}

export const addTreesToGroup = (group: THREE.Group) => {
  const groupBBox = new THREE.Box3().setFromObject(group);

  const getRandomPositionInBox = (box: THREE.Box3) => {
    const x = THREE.MathUtils.randFloat(box.min.x, box.max.x);
    const y = THREE.MathUtils.randFloat(box.min.y, box.max.y);
    const z = THREE.MathUtils.randFloat(box.min.z, box.max.z);
    return new THREE.Vector3(x, y, z);
  };

  const numberOfRays = 250;
  const raycaster = new THREE.Raycaster();
  const direction = new THREE.Vector3(0, -1, 0);
  const rayYHeight = groupBBox.max.y + 1;
  raycaster.far = groupBBox.max.y - groupBBox.min.y + 100;

  const tree = new THREE.Mesh(new THREE.ConeGeometry(4, 16, 5), TREE_MATERIAL);

  const ramp = new THREE.Mesh(createWedge(10, 10, 4), RAMP_MATERIAL);

  const chanceOfRamp = 0.1;

  for (let i = 0; i < numberOfRays; i++) {
    const rayOrigin = getRandomPositionInBox(groupBBox);
    rayOrigin.y = rayYHeight;
    raycaster.set(rayOrigin, direction);
    const intersects = raycaster.intersectObjects(group.children, true);

    if (intersects.length === 0) {
      if (Math.random() < chanceOfRamp) {
        const rampInstance = ramp.clone(false);
        const rampPosition = rayOrigin.clone();
        rampPosition.y = 0;

        rampInstance.position.copy(rampPosition);
        rampInstance.rotation.y = Math.random() * Math.PI;
        group.add(rampInstance);
      } else {
        const treeInstance = tree.clone(false);

        const randomScale = new THREE.Vector3(1, 1, 1).add(
          getRandomVector3().multiplyScalar(0.8)
        );
        treeInstance.scale.copy(randomScale);

        const treePosition = rayOrigin.clone();
        treePosition.y = 0;

        treeInstance.position.copy(treePosition);
        // tree.rotation.y = Math.random() * Math.PI;
        group.add(treeInstance);
      }
    }
  }
};

const getRandomVector3 = () => {
  return new THREE.Vector3(Math.random(), Math.random(), Math.random());
};

const createWedge = (width: number, length: number, height: number) => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(length, 0);
  shape.lineTo(length, height);
  shape.lineTo(0, 0);
  const extrudeSettings = {
    steps: 1,
    depth: width,
    bevelEnabled: false,
  };
  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};
