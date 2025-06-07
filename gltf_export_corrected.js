function exportGLTF(scene) {
    const gltf = {
        asset: {
            version: "2.0",
            generator: "THREE.js GLB Exporter"
        },
        scene: 0,
        scenes: [{
            nodes: []
        }],
        nodes: [],
        meshes: [],
        materials: [],
        accessors: [],
        bufferViews: [],
        buffers: [{
            byteLength: 0
        }]
    };

    const binaryData = [];
    let byteOffset = 0;

    function padBuffer(buffer, paddingByte = 0) {
        const padding = (4 - (buffer.length % 4)) % 4;
        if (padding === 0) return buffer;
        
        const padded = new Uint8Array(buffer.length + padding);
        padded.set(buffer);
        for (let i = buffer.length; i < padded.length; i++) {
            padded[i] = paddingByte;
        }
        return padded;
    }

    function calculateMinMax(array, componentCount) {
        const min = new Array(componentCount).fill(Infinity);
        const max = new Array(componentCount).fill(-Infinity);
        
        for (let i = 0; i < array.length; i += componentCount) {
            for (let j = 0; j < componentCount; j++) {
                const value = array[i + j];
                min[j] = Math.min(min[j], value);
                max[j] = Math.max(max[j], value);
            }
        }
        
        return { min, max };
    }

    scene.traverse((object) => {
        if (!object.isMesh) return;

        const geometry = object.geometry;
        if (!geometry || !geometry.attributes.position) return;

        if (!geometry.attributes.normal) {
            geometry.computeVertexNormals();
        }

        const positionAttribute = geometry.attributes.position;
        const normalAttribute = geometry.attributes.normal;
        const indexAttribute = geometry.index;

        const positionArray = new Float32Array(positionAttribute.array);
        let positionBuffer = new Uint8Array(positionArray.buffer.slice(
            positionArray.byteOffset, 
            positionArray.byteOffset + positionArray.byteLength
        ));
        positionBuffer = padBuffer(positionBuffer);
        
        binaryData.push(positionBuffer);
        
        const positionBufferViewIndex = gltf.bufferViews.length;
        gltf.bufferViews.push({
            buffer: 0,
            byteOffset: byteOffset,
            byteLength: positionBuffer.length,
            target: 34962,
            byteStride: 12
        });
        
        const { min: posMin, max: posMax } = calculateMinMax(positionArray, 3);
        const positionAccessorIndex = gltf.accessors.length;
        gltf.accessors.push({
            bufferView: positionBufferViewIndex,
            byteOffset: 0,
            componentType: 5126,
            count: positionAttribute.count,
            type: "VEC3",
            max: posMax,
            min: posMin
        });
        
        byteOffset += positionBuffer.length;

        let normalAccessorIndex = null;
        if (normalAttribute) {
            const normalArray = new Float32Array(normalAttribute.array);
            let normalBuffer = new Uint8Array(normalArray.buffer.slice(
                normalArray.byteOffset,
                normalArray.byteOffset + normalArray.byteLength
            ));
            normalBuffer = padBuffer(normalBuffer);
            
            binaryData.push(normalBuffer);
            
            const normalBufferViewIndex = gltf.bufferViews.length;
            gltf.bufferViews.push({
                buffer: 0,
                byteOffset: byteOffset,
                byteLength: normalBuffer.length,
                target: 34962,
                byteStride: 12
            });
            
            normalAccessorIndex = gltf.accessors.length;
            gltf.accessors.push({
                bufferView: normalBufferViewIndex,
                byteOffset: 0,
                componentType: 5126,
                count: normalAttribute.count,
                type: "VEC3"
            });
            
            byteOffset += normalBuffer.length;
        }

        let indexAccessorIndex = null;
        if (indexAttribute) {
            let indexArray, componentType;
            
            if (indexAttribute.array instanceof Uint16Array) {
                indexArray = new Uint16Array(indexAttribute.array);
                componentType = 5123;
            } else {
                indexArray = new Uint32Array(indexAttribute.array);
                componentType = 5125;
            }
            
            let indexBuffer = new Uint8Array(indexArray.buffer.slice(
                indexArray.byteOffset,
                indexArray.byteOffset + indexArray.byteLength
            ));
            indexBuffer = padBuffer(indexBuffer);
            
            binaryData.push(indexBuffer);
            
            const indexBufferViewIndex = gltf.bufferViews.length;
            gltf.bufferViews.push({
                buffer: 0,
                byteOffset: byteOffset,
                byteLength: indexBuffer.length,
                target: 34963
            });
            
            indexAccessorIndex = gltf.accessors.length;
            gltf.accessors.push({
                bufferView: indexBufferViewIndex,
                byteOffset: 0,
                componentType: componentType,
                count: indexAttribute.count,
                type: "SCALAR"
            });
            
            byteOffset += indexBuffer.length;
        }

        const materialIndex = gltf.materials.length;
        const material = object.material;
        
        gltf.materials.push({
            name: (object.name || "Object") + "_material",
            pbrMetallicRoughness: {
                baseColorFactor: [
                    material.color ? material.color.r : 1.0,
                    material.color ? material.color.g : 1.0,
                    material.color ? material.color.b : 1.0,
                    material.opacity !== undefined ? material.opacity : 1.0
                ],
                metallicFactor: material.metalness !== undefined ? material.metalness : 0.0,
                roughnessFactor: material.roughness !== undefined ? material.roughness : 0.8
            },
            alphaMode: material.transparent ? "BLEND" : "OPAQUE",
            doubleSided: material.side === 2
        });

        const meshIndex = gltf.meshes.length;
        const attributes = {
            POSITION: positionAccessorIndex
        };
        
        if (normalAccessorIndex !== null) {
            attributes.NORMAL = normalAccessorIndex;
        }
        
        const primitive = {
            attributes: attributes,
            material: materialIndex
        };
        
        if (indexAccessorIndex !== null) {
            primitive.indices = indexAccessorIndex;
        }
        
        gltf.meshes.push({
            name: (object.name || "Object") + "_mesh",
            primitives: [primitive]
        });

        const nodeIndex = gltf.nodes.length;
        const node = {
            name: object.name || ("Node_" + nodeIndex),
            mesh: meshIndex
        };
        
        const position = object.position.toArray();
        const rotation = object.quaternion.toArray();
        const scale = object.scale.toArray();
        
        if (position[0] !== 0 || position[1] !== 0 || position[2] !== 0) {
            node.translation = position;
        }
        
        if (rotation[0] !== 0 || rotation[1] !== 0 || rotation[2] !== 0 || rotation[3] !== 1) {
            node.rotation = rotation;
        }
        
        if (scale[0] !== 1 || scale[1] !== 1 || scale[2] !== 1) {
            node.scale = scale;
        }
        
        gltf.nodes.push(node);

        gltf.scenes[0].nodes.push(nodeIndex);
    });

    gltf.buffers[0].byteLength = byteOffset;

    const combinedBuffer = new Uint8Array(byteOffset);
    let offset = 0;
    binaryData.forEach(buffer => {
        combinedBuffer.set(buffer, offset);
        offset += buffer.length;
    });

    return { gltf, binary: combinedBuffer };
}

function createGLB(gltfData) {
    const { gltf, binary } = gltfData;
    
    const jsonText = JSON.stringify(gltf);
    const jsonBuffer = new TextEncoder().encode(jsonText);
    
    const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
    const jsonPadded = new Uint8Array(jsonBuffer.length + jsonPadding);
    jsonPadded.set(jsonBuffer);
    for (let i = jsonBuffer.length; i < jsonPadded.length; i++) {
        jsonPadded[i] = 0x20;
    }

    const binaryPadding = (4 - (binary.length % 4)) % 4;
    const binaryPadded = new Uint8Array(binary.length + binaryPadding);
    binaryPadded.set(binary);

    const headerLength = 12;
    const jsonChunkHeaderLength = 8;
    const binaryChunkHeaderLength = 8;
    const totalLength = headerLength + 
                       jsonChunkHeaderLength + jsonPadded.length + 
                       binaryChunkHeaderLength + binaryPadded.length;

    const glb = new ArrayBuffer(totalLength);
    const view = new DataView(glb);
    let offset = 0;

    view.setUint32(offset, 0x46546C67, true);
    offset += 4;
    view.setUint32(offset, 2, true);
    offset += 4;
    view.setUint32(offset, totalLength, true);
    offset += 4;

    view.setUint32(offset, jsonPadded.length, true);
    offset += 4;
    view.setUint32(offset, 0x4E4F534A, true);
    offset += 4;
    
    new Uint8Array(glb, offset, jsonPadded.length).set(jsonPadded);
    offset += jsonPadded.length;

    if (binaryPadded.length > 0) {
        view.setUint32(offset, binaryPadded.length, true);
        offset += 4;
        view.setUint32(offset, 0x004E4942, true);
        offset += 4;
        
        new Uint8Array(glb, offset, binaryPadded.length).set(binaryPadded);
    }

    return glb;
}

document.getElementById('downloadGLB').addEventListener('click', async () => {
    const loadingText = document.getElementById('loadingText');
    const downloadBtn = document.getElementById('downloadGLB');
    
    if (loadingText) loadingText.style.display = 'block';
    if (downloadBtn) downloadBtn.disabled = true;
    
    try {
        if (typeof scene === 'undefined') {
            throw new Error('Scene is not defined. Make sure your Three.js scene is available.');
        }

        const gltfData = exportGLTF(scene);
        const glb = createGLB(gltfData);
        
        const blob = new Blob([glb], { type: 'model/gltf-binary' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'workspace_scene.glb';
        link.setAttribute('download', 'workspace_scene.glb');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        alert('Scene exported successfully as GLB file!');
        
    } catch (error) {
        console.error('Export error:', error);
        alert('Export failed: ' + error.message + '\nCheck the console for more details.');
    } finally {
        if (loadingText) loadingText.style.display = 'none';
        if (downloadBtn) downloadBtn.disabled = false;
    }
});

function validateGLTF(gltf) {
    const errors = [];
    
    if (!gltf.asset || !gltf.asset.version) {
        errors.push('Missing required asset.version');
    }
    
    if (!gltf.scenes || gltf.scenes.length === 0) {
        errors.push('No scenes defined');
    }
    
    if (gltf.scene === undefined) {
        errors.push('No default scene specified');
    }
    
    gltf.scenes?.forEach((scene, sceneIndex) => {
        scene.nodes?.forEach((nodeIndex, i) => {
            if (nodeIndex >= gltf.nodes.length) {
                errors.push(`Scene ${sceneIndex} references invalid node ${nodeIndex}`);
            }
        });
    });
    
    gltf.nodes?.forEach((node, nodeIndex) => {
        if (node.mesh !== undefined && node.mesh >= gltf.meshes.length) {
            errors.push(`Node ${nodeIndex} references invalid mesh ${node.mesh}`);
        }
    });
    
    return errors;
}