/**
 * HATSUNE MIKU 3D DIGITAL WORLD & INTERACTIVE EXPLORATION ENGINE
 * Built with Three.js (r128) - Lightweight, 60fps, low-poly / voxel aesthetics.
 */

class DigitalWorld3D {
    constructor(canvasContainerId) {
        this.container = document.getElementById(canvasContainerId);
        if (!this.container || typeof THREE === 'undefined') {
            console.warn("DigitalWorld3D: Three.js or container not available.");
            return;
        }

        this.data = window.PORTFOLIO_DATA || {};
        this.checkpointsData = this.data.checkpoints || [];

        // Scene, Camera, Renderer
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Character & Movement
        this.miku = null;
        this.mikuLimbs = {};
        this.mikuPos = new THREE.Vector3(0, 0, 8);
        this.targetPos = null;
        this.moveSpeed = 6.2; // units per second
        this.keys = { up: false, down: false, left: false, right: false };
        this.isMoving = false;
        this.currentAngle = 0;
        this.targetAngle = 0;

        // Camera Smooth Follow
        this.cameraOffset = new THREE.Vector3(0, 11, 13);
        this.cameraLookTarget = new THREE.Vector3(0, 0, 8);

        // Checkpoints & Landmarks
        this.checkpointMeshes = [];
        this.activeCheckpoint = null;
        this.activeCheckpointDist = Infinity;
        this.nearestCheckpoint = null;

        // Interactive States
        this.clock = new THREE.Clock();
        this.animTime = 0;
        this.isPaused = false;
        this.arcadePaused = false;
        this.animationFrameId = null;
        this.raycaster = new THREE.Raycaster();
        this.mouseVec = new THREE.Vector2();

        // Parallax & Mouse
        this.mouseParallax = { x: 0, y: 0, targetX: 0, targetY: 0 };

        this.init();
    }

    init() {
        this.setupRenderer();
        this.setupLights();
        this.setupTerrain();
        this.setupCheckpoints();
        this.setupChibiMiku();
        this.setupAvatarSkins();
        this.setupParticles();
        this.setupControls();
        this.setupEventListeners();
        this.setupHUD();

        this.animate = this.animate.bind(this);
        this.animationFrameId = requestAnimationFrame(this.animate);
    }

    setupRenderer() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x071116);
        this.scene.fog = new THREE.FogExp2(0x071116, 0.035);

        this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
        this.camera.position.copy(this.mikuPos).add(this.cameraOffset);
        this.camera.lookAt(this.mikuPos);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
    }

    setupLights() {
        // Soft Ambient Deep Teal Light
        const ambientLight = new THREE.AmbientLight(0x061418, 0.75);
        this.scene.add(ambientLight);

        // Directional Key Light (Soft moonlight)
        const dirLight = new THREE.DirectionalLight(0xbefcf5, 0.75);
        dirLight.position.set(12, 22, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 40;
        const d = 16;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.bias = -0.001;
        this.scene.add(dirLight);

        // Subtle Cyan Fill Light
        const rimLight = new THREE.DirectionalLight(0x289e90, 0.45);
        rimLight.position.set(-15, 10, -12);
        this.scene.add(rimLight);

        // Miku Personal Aura Light
        this.mikuLight = new THREE.PointLight(0x39e6d0, 1.8, 8);
        this.mikuLight.position.set(0, 1.5, 8);
        this.scene.add(this.mikuLight);
    }

    setupTerrain() {
        const islandGroup = new THREE.Group();

        // 1. Main Island Platform (Dark Charcoal Teal Slate)
        const islandGeo = new THREE.CylinderGeometry(15, 13.5, 2.2, 8);
        const islandMat = new THREE.MeshStandardMaterial({
            color: 0x08161b,
            roughness: 0.92,
            metalness: 0.08,
            flatShading: true
        });
        const island = new THREE.Mesh(islandGeo, islandMat);
        island.position.y = -1.1;
        island.receiveShadow = true;
        islandGroup.add(island);

        // Island Edge Trim (Neon Cyan Rim)
        const rimGeo = new THREE.CylinderGeometry(15.08, 15.08, 0.16, 8);
        const rimMat = new THREE.MeshBasicMaterial({
            color: 0x39e6d0,
            wireframe: false,
            transparent: true,
            opacity: 0.7
        });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.y = 0.04;
        islandGroup.add(rim);

        // Island Underside (Tapered digital core)
        const underGeo = new THREE.ConeGeometry(13.5, 4.5, 8);
        const underMat = new THREE.MeshStandardMaterial({
            color: 0x040b0e,
            roughness: 0.95,
            metalness: 0.2,
            flatShading: true
        });
        const under = new THREE.Mesh(underGeo, underMat);
        under.position.y = -4.4;
        under.rotation.x = Math.PI;
        islandGroup.add(under);

        // 2. Stepping Stones / Circuit Pathway connecting checkpoints
        const circuitMat = new THREE.MeshBasicMaterial({
            color: 0x39e6d0,
            transparent: true,
            opacity: 0.65
        });

        // Generate gentle pathway rings
        const ringGeo = new THREE.RingGeometry(5.8, 6.0, 32);
        const ring = new THREE.Mesh(ringGeo, circuitMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.02;
        islandGroup.add(ring);

        const outerRingGeo = new THREE.RingGeometry(8.2, 8.35, 32);
        const outerRing = new THREE.Mesh(outerRingGeo, circuitMat);
        outerRing.rotation.x = -Math.PI / 2;
        outerRing.position.y = 0.02;
        islandGroup.add(outerRing);

        // Radial circuit lines
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const lineGeo = new THREE.PlaneGeometry(0.12, 10);
            const line = new THREE.Mesh(lineGeo, circuitMat);
            line.rotation.x = -Math.PI / 2;
            line.rotation.z = angle;
            line.position.y = 0.025;
            islandGroup.add(line);
        }

        // 3. Decorative Low-poly Flora / Digital Crystals on the island edges
        const crystalGeo = new THREE.OctahedronGeometry(0.45, 0);
        const crystalMat = new THREE.MeshStandardMaterial({
            color: 0x8ffff5,
            emissive: 0x39e6d0,
            emissiveIntensity: 0.45,
            roughness: 0.2,
            metalness: 0.8
        });

        const crystalPositions = [
            [-11, 0.4, 4], [-10, 0.35, -5], [-4, 0.5, -11], [5, 0.45, -10],
            [10.5, 0.4, -4], [11, 0.35, 3], [5, 0.4, 10.5], [-5, 0.35, 10]
        ];

        this.floatingCrystals = [];
        crystalPositions.forEach(([x, y, z]) => {
            const cluster = new THREE.Group();
            cluster.position.set(x, y, z);

            const c1 = new THREE.Mesh(crystalGeo, crystalMat);
            c1.scale.set(0.7, 1.3, 0.7);
            c1.position.y = 0.3;
            c1.castShadow = true;
            cluster.add(c1);

            const c2 = new THREE.Mesh(crystalGeo, crystalMat);
            c2.scale.set(0.45, 0.8, 0.45);
            c2.position.set(0.35, 0.1, 0.25);
            cluster.add(c2);

            islandGroup.add(cluster);
            this.floatingCrystals.push(cluster);
        });

        // 4. Distant Floating Mini-Islands (Layered Parallax Environment)
        this.distantIslands = [];
        const distantData = [
            { pos: [-24, -3, -15], scale: 0.35 },
            { pos: [26, 4, -18], scale: 0.4 },
            { pos: [-22, 5, 16], scale: 0.3 },
            { pos: [24, -2, 14], scale: 0.38 }
        ];

        distantData.forEach(item => {
            const distIsland = new THREE.Group();
            distIsland.position.set(...item.pos);
            distIsland.scale.setScalar(item.scale);

            const dMesh = new THREE.Mesh(islandGeo, islandMat);
            distIsland.add(dMesh);

            const dCrystal = new THREE.Mesh(crystalGeo, crystalMat);
            dCrystal.scale.set(2, 4.5, 2);
            dCrystal.position.y = 3;
            distIsland.add(dCrystal);

            this.scene.add(distIsland);
            this.distantIslands.push(distIsland);
        });

        this.scene.add(islandGroup);
        this.islandMesh = island; // for raycasting click-to-walk
    }

    setupCheckpoints() {
        this.checkpointGroup = new THREE.Group();

        this.checkpointsData.forEach(cp => {
            const group = new THREE.Group();
            group.position.set(cp.x, 0.05, cp.z);
            group.userData = { ...cp };

            // Base Pedestal
            const baseGeo = new THREE.CylinderGeometry(0.9, 1.1, 0.18, 16);
            const baseMat = new THREE.MeshStandardMaterial({
                color: 0x0e242b,
                roughness: 0.4,
                metalness: 0.6
            });
            const base = new THREE.Mesh(baseGeo, baseMat);
            base.position.y = 0.09;
            base.receiveShadow = true;
            group.add(base);

            // Pulsing Neon Base Ring
            const ringGeo = new THREE.TorusGeometry(0.95, 0.035, 8, 24);
            const ringMat = new THREE.MeshBasicMaterial({
                color: cp.color ? new THREE.Color(cp.color) : new THREE.Color(0x39e6d0),
                transparent: true,
                opacity: 0.8
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 0.16;
            group.add(ring);

            // Floating Holographic Beacon Diamond / Crystal
            const beaconGeo = new THREE.OctahedronGeometry(0.38, 0);
            const beaconMat = new THREE.MeshStandardMaterial({
                color: cp.color ? new THREE.Color(cp.color) : new THREE.Color(0x8ffff5),
                emissive: cp.color ? new THREE.Color(cp.color) : new THREE.Color(0x39e6d0),
                emissiveIntensity: 0.65,
                roughness: 0.2,
                metalness: 0.7,
                wireframe: false
            });
            const beacon = new THREE.Mesh(beaconGeo, beaconMat);
            beacon.position.y = 1.35;
            beacon.castShadow = true;
            group.add(beacon);

            // Outer Wireframe Hologram Ring (Rotating)
            const holoRingGeo = new THREE.RingGeometry(0.55, 0.62, 16);
            const holoRingMat = new THREE.MeshBasicMaterial({
                color: cp.color ? new THREE.Color(cp.color) : new THREE.Color(0x39e6d0),
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const holoRing = new THREE.Mesh(holoRingGeo, holoRingMat);
            holoRing.position.y = 1.35;
            holoRing.rotation.x = Math.PI / 3;
            group.add(holoRing);

            // Light Pillar Beam (Subtle vertical ray)
            const beamGeo = new THREE.CylinderGeometry(0.25, 0.25, 2.4, 12, 1, true);
            const beamMat = new THREE.MeshBasicMaterial({
                color: cp.color ? new THREE.Color(cp.color) : new THREE.Color(0x39e6d0),
                transparent: true,
                opacity: 0.18,
                side: THREE.DoubleSide
            });
            const beam = new THREE.Mesh(beamGeo, beamMat);
            beam.position.y = 1.2;
            group.add(beam);

            group.userData.beaconMesh = beacon;
            group.userData.holoRingMesh = holoRing;
            group.userData.beamMesh = beam;
            group.userData.ringMesh = ring;

            this.checkpointGroup.add(group);
            this.checkpointMeshes.push(group);
        });

        this.scene.add(this.checkpointGroup);
    }

    setupChibiMiku() {
        this.miku = new THREE.Group();
        this.miku.position.copy(this.mikuPos);

        // Palette Materials
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.6 });
        const mikuTealMat = new THREE.MeshStandardMaterial({
            color: 0x39e6d0,
            roughness: 0.35,
            metalness: 0.15,
            emissive: 0x165c53,
            emissiveIntensity: 0.25
        });
        const darkGrayMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7 });
        const lightGrayMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.5 });
        const pinkRibbonMat = new THREE.MeshStandardMaterial({
            color: 0xff2a85,
            emissive: 0xff2a85,
            emissiveIntensity: 0.4,
            roughness: 0.4
        });
        const eyeBlackMat = new THREE.MeshBasicMaterial({ color: 0x0a1118 });
        const eyeCyanMat = new THREE.MeshBasicMaterial({ color: 0x39e6d0 });
        const blushMat = new THREE.MeshBasicMaterial({ color: 0xff99aa, transparent: true, opacity: 0.6 });

        // 1. Torso / Sleeveless Shirt
        const torsoGeo = new THREE.BoxGeometry(0.55, 0.65, 0.38);
        const torso = new THREE.Mesh(torsoGeo, lightGrayMat);
        torso.position.y = 0.95;
        torso.castShadow = true;
        this.miku.add(torso);

        // Teal Necktie
        const tieGeo = new THREE.BoxGeometry(0.12, 0.42, 0.06);
        const tie = new THREE.Mesh(tieGeo, mikuTealMat);
        tie.position.set(0, 0.95, 0.21);
        this.miku.add(tie);

        // Skirt (Dark Pleated Mini)
        const skirtGeo = new THREE.CylinderGeometry(0.34, 0.46, 0.25, 12);
        const skirt = new THREE.Mesh(skirtGeo, darkGrayMat);
        skirt.position.y = 0.62;
        skirt.castShadow = true;
        this.miku.add(skirt);

        // Skirt Teal Trim
        const skirtTrimGeo = new THREE.TorusGeometry(0.46, 0.02, 6, 16);
        const skirtTrim = new THREE.Mesh(skirtTrimGeo, mikuTealMat);
        skirtTrim.rotation.x = Math.PI / 2;
        skirtTrim.position.y = 0.51;
        this.miku.add(skirtTrim);

        // 2. Chibi Head Group
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.58, 0);

        // Head Base Cube (Stylized rounded low-poly box)
        const headGeo = new THREE.BoxGeometry(0.72, 0.68, 0.64);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.castShadow = true;
        headGroup.add(head);

        // Front Bangs / Fringe (Teal)
        const bangsGeo = new THREE.BoxGeometry(0.74, 0.32, 0.22);
        const bangs = new THREE.Mesh(bangsGeo, mikuTealMat);
        bangs.position.set(0, 0.22, 0.26);
        headGroup.add(bangs);

        // Bangs Center Strand
        const strandGeo = new THREE.BoxGeometry(0.16, 0.38, 0.12);
        const strand = new THREE.Mesh(strandGeo, mikuTealMat);
        strand.position.set(0, 0.06, 0.34);
        headGroup.add(strand);

        // Back Hair Cap
        const backHairGeo = new THREE.BoxGeometry(0.74, 0.66, 0.42);
        const backHair = new THREE.Mesh(backHairGeo, mikuTealMat);
        backHair.position.set(0, 0.04, -0.16);
        headGroup.add(backHair);

        // Cute Pixel Eyes (Left & Right)
        const eyeGeo = new THREE.BoxGeometry(0.12, 0.16, 0.02);
        const leftEye = new THREE.Mesh(eyeGeo, eyeBlackMat);
        leftEye.position.set(-0.18, 0.02, 0.33);
        headGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeBlackMat);
        rightEye.position.set(0.18, 0.02, 0.33);
        headGroup.add(rightEye);

        // Eye Cyan Highlights
        const eyePupilGeo = new THREE.BoxGeometry(0.08, 0.07, 0.025);
        const leftPupil = new THREE.Mesh(eyePupilGeo, eyeCyanMat);
        leftPupil.position.set(-0.18, -0.02, 0.335);
        headGroup.add(leftPupil);

        const rightPupil = new THREE.Mesh(eyePupilGeo, eyeCyanMat);
        rightPupil.position.set(0.18, -0.02, 0.335);
        headGroup.add(rightPupil);

        // Cheerful Blush Cheek Pixels
        const blushGeo = new THREE.BoxGeometry(0.1, 0.05, 0.02);
        const leftBlush = new THREE.Mesh(blushGeo, blushMat);
        leftBlush.position.set(-0.24, -0.11, 0.33);
        headGroup.add(leftBlush);

        const rightBlush = new THREE.Mesh(blushGeo, blushMat);
        rightBlush.position.set(0.24, -0.11, 0.33);
        headGroup.add(rightBlush);

        // Headset with Pink LED Ribbons
        const headsetBandGeo = new THREE.BoxGeometry(0.78, 0.08, 0.12);
        const headsetBand = new THREE.Mesh(headsetBandGeo, darkGrayMat);
        headsetBand.position.set(0, 0.34, 0);
        headGroup.add(headsetBand);

        const earpieceGeo = new THREE.BoxGeometry(0.14, 0.22, 0.2);
        const leftEar = new THREE.Mesh(earpieceGeo, darkGrayMat);
        leftEar.position.set(-0.41, 0.08, 0);
        headGroup.add(leftEar);

        const rightEar = new THREE.Mesh(earpieceGeo, darkGrayMat);
        rightEar.position.set(0.41, 0.08, 0);
        headGroup.add(rightEar);

        // 3. Iconic Twin-Tails (Left & Right) with Physics Sway Pivots
        const makeTwinTail = (isLeft) => {
            const pivot = new THREE.Group();
            const sign = isLeft ? -1 : 1;
            pivot.position.set(sign * 0.44, 0.26, -0.08);

            // Pink Hair Ribbon
            const ribbonGeo = new THREE.BoxGeometry(0.14, 0.12, 0.14);
            const ribbon = new THREE.Mesh(ribbonGeo, pinkRibbonMat);
            pivot.add(ribbon);

            // Upper Hair Segment
            const upperGeo = new THREE.BoxGeometry(0.22, 0.65, 0.22);
            const upper = new THREE.Mesh(upperGeo, mikuTealMat);
            upper.position.set(sign * 0.1, -0.35, -0.05);
            upper.rotation.z = sign * -0.15;
            upper.castShadow = true;
            pivot.add(upper);

            // Lower Hair Segment (curving downward)
            const lowerPivot = new THREE.Group();
            lowerPivot.position.set(sign * 0.18, -0.65, -0.08);

            const lowerGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
            const lower = new THREE.Mesh(lowerGeo, mikuTealMat);
            lower.position.set(sign * 0.05, -0.4, 0.05);
            lower.castShadow = true;
            lowerPivot.add(lower);

            pivot.add(lowerPivot);
            pivot.userData.lowerPivot = lowerPivot;

            return pivot;
        };

        const leftTail = makeTwinTail(true);
        const rightTail = makeTwinTail(false);
        headGroup.add(leftTail);
        headGroup.add(rightTail);

        this.miku.add(headGroup);

        const makeAccessory = (kind, color) => {
            const group = new THREE.Group();
            const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.18, roughness: 0.35, metalness: 0.25 });
            if (kind === 'visor') {
                const visor = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 0.36), material);
                visor.position.set(0, 0.32, 0.3);
                group.add(visor);
            } else if (kind === 'crown') {
                const band = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 6, 16), material);
                band.position.y = 0.34;
                group.add(band);
                [-0.2, 0, 0.2].forEach((x, index) => {
                    const point = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2 + (index === 1 ? 0.08 : 0), 5), material);
                    point.position.set(x, 0.49, 0);
                    group.add(point);
                });
            } else if (kind === 'halo') {
                const halo = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.025, 6, 24), material);
                halo.position.set(0, 0.54, -0.24);
                halo.rotation.x = Math.PI / 2.8;
                group.add(halo);
            }
            group.visible = false;
            headGroup.add(group);
            return group;
        };
        const skinAccessories = {
            stage: makeAccessory('crown', 0xf5e050),
            street: makeAccessory('visor', 0x263d4a),
            wonderland: makeAccessory('crown', 0xff75bb),
            empty: makeAccessory('halo', 0x8a7bff)
        };

        // 4. Arms & Detached Black Sleeves with Teal Highlights
        const makeArm = (isLeft) => {
            const armPivot = new THREE.Group();
            const sign = isLeft ? -1 : 1;
            armPivot.position.set(sign * 0.38, 1.2, 0);

            // Bare shoulder
            const shoulderGeo = new THREE.BoxGeometry(0.14, 0.18, 0.14);
            const shoulder = new THREE.Mesh(shoulderGeo, skinMat);
            shoulder.position.y = -0.09;
            armPivot.add(shoulder);

            // Detached Cyber Sleeve (Flared at wrist)
            const sleeveGeo = new THREE.BoxGeometry(0.17, 0.46, 0.17);
            const sleeve = new THREE.Mesh(sleeveGeo, darkGrayMat);
            sleeve.position.y = -0.38;
            sleeve.castShadow = true;
            armPivot.add(sleeve);

            // Teal sleeve accent panel
            const sleeveAccentGeo = new THREE.BoxGeometry(0.18, 0.08, 0.18);
            const sleeveAccent = new THREE.Mesh(sleeveAccentGeo, mikuTealMat);
            sleeveAccent.position.y = -0.22;
            armPivot.add(sleeveAccent);

            return armPivot;
        };

        const leftArm = makeArm(true);
        const rightArm = makeArm(false);
        this.miku.add(leftArm);
        this.miku.add(rightArm);

        // 5. Legs with Thigh-High Black Boots & Teal Soles
        const makeLeg = (isLeft) => {
            const legPivot = new THREE.Group();
            const sign = isLeft ? -1 : 1;
            legPivot.position.set(sign * 0.16, 0.52, 0);

            // Thigh (Skin)
            const thighGeo = new THREE.BoxGeometry(0.15, 0.18, 0.16);
            const thigh = new THREE.Mesh(thighGeo, skinMat);
            thigh.position.y = -0.09;
            legPivot.add(thigh);

            // Boot (Thigh-high dark gray)
            const bootGeo = new THREE.BoxGeometry(0.17, 0.42, 0.2);
            const boot = new THREE.Mesh(bootGeo, darkGrayMat);
            boot.position.set(0, -0.32, 0.02);
            boot.castShadow = true;
            legPivot.add(boot);

            // Teal Sole / Trim
            const soleGeo = new THREE.BoxGeometry(0.18, 0.06, 0.22);
            const sole = new THREE.Mesh(soleGeo, mikuTealMat);
            sole.position.set(0, -0.52, 0.03);
            legPivot.add(sole);

            return legPivot;
        };

        const leftLeg = makeLeg(true);
        const rightLeg = makeLeg(false);
        this.miku.add(leftLeg);
        this.miku.add(rightLeg);

        // 6. Soft Shadow Circle underneath Miku
        const shadowGeo = new THREE.CircleGeometry(0.48, 16);
        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x03080b,
            transparent: true,
            opacity: 0.55
        });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.02;
        this.mikuShadow = shadow;
        this.scene.add(shadow);

        // Store Limbs for Animation
        this.mikuLimbs = {
            headGroup,
            leftTail,
            rightTail,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg,
            torso
        };

        this.miku.userData.skinMaterials = {
            hair: mikuTealMat,
            outfit: lightGrayMat,
            dark: darkGrayMat,
            accent: pinkRibbonMat,
            tie: mikuTealMat
        };
        this.miku.userData.skinAccessories = skinAccessories;

        this.scene.add(this.miku);
    }

    setupAvatarSkins() {
        this.avatarSkins = {
            original: { hair: 0x39e6d0, outfit: 0xd1d5db, dark: 0x1f2937, accent: 0xff2a85 },
            stage: { hair: 0x39e6d0, outfit: 0xf3a8d0, dark: 0x3a3150, accent: 0xf5e050 },
            street: { hair: 0x39e6d0, outfit: 0x263d4a, dark: 0x101820, accent: 0x39e6d0 },
            wonderland: { hair: 0xb59cff, outfit: 0xffe6a6, dark: 0x514477, accent: 0xff75bb },
            empty: { hair: 0xa9c5d8, outfit: 0x3a4e69, dark: 0x182638, accent: 0x8a7bff }
        };
        const applySkin = (skinName) => {
            const palette = this.avatarSkins[skinName];
            if (!palette || !this.miku) return;
            const materials = this.miku.userData.skinMaterials;
            materials.hair.color.setHex(palette.hair);
            materials.tie.color.setHex(palette.hair);
            materials.outfit.color.setHex(palette.outfit);
            materials.dark.color.setHex(palette.dark);
            materials.accent.color.setHex(palette.accent);
            materials.hair.emissive?.setHex(palette.hair);
            materials.hair.emissiveIntensity = skinName === 'original' || skinName === 'street' ? 0.25 : 0.16;
            Object.entries(this.miku.userData.skinAccessories).forEach(([name, accessory]) => {
                accessory.visible = name === skinName;
            });
            localStorage.setItem('miku_avatar_skin', skinName);
            document.querySelectorAll('.avatar-skin-btn').forEach(button => {
                const selected = button.dataset.skin === skinName;
                button.classList.toggle('active', selected);
                button.setAttribute('aria-pressed', String(selected));
            });
        };

        document.querySelectorAll('.avatar-skin-btn').forEach(button => {
            button.addEventListener('click', () => applySkin(button.dataset.skin));
        });
        applySkin(localStorage.getItem('miku_avatar_skin') || 'original');
    }

    setupParticles() {
        // Floating Cyber Spores / Digital Fireflies around the world
        const particleCount = 75;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color(0x39e6d0);
        const color2 = new THREE.Color(0x8ffff5);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 26;
            positions[i * 3 + 1] = Math.random() * 8 + 0.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 26;

            const c = Math.random() > 0.5 ? color1 : color2;
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.16,
            vertexColors: true,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending
        });

        this.ambientParticles = new THREE.Points(geo, mat);
        this.scene.add(this.ambientParticles);
    }

    setupControls() {
        // Keyboard Controls (WASD & Arrows)
        window.addEventListener('keydown', (e) => {
            // Prevent interference if typing in an input
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') { this.keys.up = true; e.preventDefault(); }
            if (key === 's' || key === 'arrowdown') { this.keys.down = true; e.preventDefault(); }
            if (key === 'a' || key === 'arrowleft') { this.keys.left = true; e.preventDefault(); }
            if (key === 'd' || key === 'arrowright') { this.keys.right = true; e.preventDefault(); }

            // Interact Key [E] or [Enter]
            if (key === 'e' || key === 'enter') {
                if (this.nearestCheckpoint && this.activeCheckpointDist < 2.8) {
                    e.preventDefault();
                    this.triggerCheckpoint(this.nearestCheckpoint);
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') this.keys.up = false;
            if (key === 's' || key === 'arrowdown') this.keys.down = false;
            if (key === 'a' || key === 'arrowleft') this.keys.left = false;
            if (key === 'd' || key === 'arrowright') this.keys.right = false;
        });

        // Click / Tap on the Island to Move Miku
        this.container.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.avatar-skin-btn')) return;
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mouseVec, this.camera);

            // First check if clicked directly on a checkpoint beacon
            const cpIntersects = this.raycaster.intersectObjects(this.checkpointMeshes, true);
            if (cpIntersects.length > 0) {
                let cpGroup = cpIntersects[0].object;
                while (cpGroup.parent && !cpGroup.userData.id) {
                    cpGroup = cpGroup.parent;
                }
                if (cpGroup && cpGroup.userData.id) {
                    this.moveToTarget(new THREE.Vector3(cpGroup.userData.x, 0, cpGroup.userData.z));
                    if (window.cyberAudio) window.cyberAudio.playHover();
                    return;
                }
            }

            // Otherwise raycast to island floor
            if (this.islandMesh) {
                const intersects = this.raycaster.intersectObject(this.islandMesh);
                if (intersects.length > 0) {
                    const hit = intersects[0].point;
                    this.moveToTarget(new THREE.Vector3(hit.x, 0, hit.z));
                }
            }
        });
    }

    moveToTarget(target, targetCheckpoint = null) {
        // Constrain to island bounds
        const distFromCenter = Math.hypot(target.x, target.z);
        if (distFromCenter > 13) {
            target.multiplyScalar(13 / distFromCenter);
        }
        this.targetPos = target;
        this.targetCheckpoint = targetCheckpoint;
    }

    setupEventListeners() {
        // Window Resize
        window.addEventListener('resize', () => {
            if (!this.container || !this.renderer || !this.camera) return;
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });

        // Mouse Parallax on Desktop
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(pointer: fine)').matches) {
            window.addEventListener('mousemove', (e) => {
                this.mouseParallax.targetX = (e.clientX / window.innerWidth - 0.5) * 1.8;
                this.mouseParallax.targetY = (e.clientY / window.innerHeight - 0.5) * 1.2;
            }, { passive: true });
        }

        // Check visibility to pause when tab inactive
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.pauseAnimation();
            else if (!this.arcadePaused) this.resumeAnimation();
        });
    }

    pauseForArcade() {
        this.arcadePaused = true;
        this.pauseAnimation();
    }

    resumeAfterArcade() {
        this.arcadePaused = false;
        if (!document.hidden) this.resumeAnimation();
    }

    pauseAnimation() {
        this.isPaused = true;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    resumeAnimation() {
        this.isPaused = false;
        this.clock.getDelta(); // reset the delta so paused time is not applied
        if (this.animationFrameId === null) this.animationFrameId = requestAnimationFrame(this.animate);
    }

    setupHUD() {
        // Bind UI Elements in World Header / Controls
        const promptEl = document.getElementById('world-interaction-prompt');
        const openBtn = document.getElementById('world-open-btn');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                if (this.nearestCheckpoint) {
                    this.triggerCheckpoint(this.nearestCheckpoint);
                }
            });
        }

        // On-screen Mobile D-Pad Buttons
        const dpadBtns = document.querySelectorAll('.world-dpad-btn');
        dpadBtns.forEach(btn => {
            const dir = btn.dataset.dir;
            const handleStart = (e) => {
                e.preventDefault();
                this.targetPos = null; // cancel click-to-walk
                if (dir === 'up') this.keys.up = true;
                if (dir === 'down') this.keys.down = true;
                if (dir === 'left') this.keys.left = true;
                if (dir === 'right') this.keys.right = true;
            };
            const handleEnd = (e) => {
                e.preventDefault();
                if (dir === 'up') this.keys.up = false;
                if (dir === 'down') this.keys.down = false;
                if (dir === 'left') this.keys.left = false;
                if (dir === 'right') this.keys.right = false;
            };

            btn.addEventListener('pointerdown', handleStart);
            btn.addEventListener('pointerup', handleEnd);
            btn.addEventListener('pointerleave', handleEnd);
            btn.addEventListener('pointercancel', handleEnd);
        });

        // HUD Checkpoint Quick-Jump Pills
        const cpNavBtns = document.querySelectorAll('.world-checkpoint-nav-btn');
        cpNavBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetId = btn.dataset.checkpoint;
                const cp = this.checkpointsData.find(c => c.id === targetId);
                if (cp) {
                    this.moveToTarget(new THREE.Vector3(cp.x, 0, cp.z), cp);
                    if (window.cyberAudio) window.cyberAudio.playClick();
                }
            });
        });
    }

    triggerCheckpoint(checkpoint) {
        if (!checkpoint) return;
        if (window.cyberAudio) window.cyberAudio.playOpen();

        // Dispatch Custom Event for main.js to show the Checkpoint HUD Drawer/Modal
        const event = new CustomEvent('checkpoint:activate', {
            detail: { ...checkpoint }
        });
        window.dispatchEvent(event);
    }

    updateMovement(delta) {
        let moveX = 0;
        let moveZ = 0;

        // 1. Keyboard Input
        if (this.keys.up) moveZ -= 1;
        if (this.keys.down) moveZ += 1;
        if (this.keys.left) moveX -= 1;
        if (this.keys.right) moveX += 1;

        if (moveX !== 0 || moveZ !== 0) {
            this.targetPos = null; // Manual keys override click target

            const len = Math.hypot(moveX, moveZ);
            moveX = (moveX / len) * this.moveSpeed * delta;
            moveZ = (moveZ / len) * this.moveSpeed * delta;

            this.mikuPos.x += moveX;
            this.mikuPos.z += moveZ;
            this.isMoving = true;

            this.targetAngle = Math.atan2(moveX, moveZ);
        } else if (this.targetPos) {
            // 2. Click / Tap Target Navigation
            const dx = this.targetPos.x - this.mikuPos.x;
            const dz = this.targetPos.z - this.mikuPos.z;
            const dist = Math.hypot(dx, dz);

            if (dist > 0.15) {
                const step = Math.min(this.moveSpeed * delta, dist);
                this.mikuPos.x += (dx / dist) * step;
                this.mikuPos.z += (dz / dist) * step;
                this.isMoving = true;
                this.targetAngle = Math.atan2(dx, dz);
            } else {
                this.mikuPos.x = this.targetPos.x;
                this.mikuPos.z = this.targetPos.z;
                this.targetPos = null;
                this.isMoving = false;
                if (this.targetCheckpoint) {
                    this.triggerCheckpoint(this.targetCheckpoint);
                    this.targetCheckpoint = null;
                }
            }
        } else {
            this.isMoving = false;
        }

        // Constrain Miku to island radius (12.8 units)
        const distFromCenter = Math.hypot(this.mikuPos.x, this.mikuPos.z);
        if (distFromCenter > 12.8) {
            this.mikuPos.x *= 12.8 / distFromCenter;
            this.mikuPos.z *= 12.8 / distFromCenter;
        }

        // Smooth Character Rotation (Lerp angle)
        let diff = this.targetAngle - this.currentAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.currentAngle += diff * Math.min(delta * 14, 1);

        if (this.miku) {
            this.miku.position.x = this.mikuPos.x;
            this.miku.position.z = this.mikuPos.z;
            this.miku.rotation.y = this.currentAngle;

            // Update Shadow position
            if (this.mikuShadow) {
                this.mikuShadow.position.x = this.mikuPos.x;
                this.mikuShadow.position.z = this.mikuPos.z;
            }

            // Update Aura Point Light
            if (this.mikuLight) {
                this.mikuLight.position.set(this.mikuPos.x, 1.4, this.mikuPos.z);
            }
        }
    }

    animateLimbs(delta) {
        if (!this.mikuLimbs.leftLeg) return;

        const limbs = this.mikuLimbs;
        const t = this.animTime;

        if (this.isMoving) {
            // Walking Animation Cycle
            const walkSpeed = 12;
            const legSwing = Math.sin(t * walkSpeed) * 0.65;
            const armSwing = Math.sin(t * walkSpeed) * 0.55;
            const bounce = Math.abs(Math.sin(t * walkSpeed)) * 0.12;

            limbs.leftLeg.rotation.x = legSwing;
            limbs.rightLeg.rotation.x = -legSwing;
            limbs.leftArm.rotation.x = -armSwing;
            limbs.rightArm.rotation.x = armSwing;

            // Hair Twin-tail bounce & sway back
            limbs.leftTail.rotation.x = 0.28 + Math.sin(t * 8) * 0.12;
            limbs.rightTail.rotation.x = 0.28 + Math.cos(t * 8) * 0.12;
            limbs.leftTail.rotation.z = -0.15 + Math.sin(t * walkSpeed) * 0.12;
            limbs.rightTail.rotation.z = 0.15 - Math.sin(t * walkSpeed) * 0.12;

            // Subtle head tilt
            limbs.headGroup.position.y = 1.58 + bounce * 0.5;
            this.miku.position.y = bounce;
        } else {
            // Idle Animation (Gentle breathing, floating bob, hair sway)
            const breath = Math.sin(t * 2.2) * 0.04;
            const hairSway = Math.sin(t * 1.8) * 0.06;

            limbs.leftLeg.rotation.x = THREE.MathUtils.lerp(limbs.leftLeg.rotation.x, 0, delta * 8);
            limbs.rightLeg.rotation.x = THREE.MathUtils.lerp(limbs.rightLeg.rotation.x, 0, delta * 8);
            limbs.leftArm.rotation.x = THREE.MathUtils.lerp(limbs.leftArm.rotation.x, 0, delta * 8);
            limbs.rightArm.rotation.x = THREE.MathUtils.lerp(limbs.rightArm.rotation.x, 0, delta * 8);

            limbs.headGroup.position.y = 1.58 + breath * 0.6;
            this.miku.position.y = breath;

            limbs.leftTail.rotation.x = THREE.MathUtils.lerp(limbs.leftTail.rotation.x, 0.05, delta * 6);
            limbs.rightTail.rotation.x = THREE.MathUtils.lerp(limbs.rightTail.rotation.x, 0.05, delta * 6);
            limbs.leftTail.rotation.z = -0.12 + hairSway;
            limbs.rightTail.rotation.z = 0.12 - hairSway;
        }
    }

    updateCheckpoints(delta) {
        let closestCP = null;
        let closestDist = Infinity;

        this.checkpointMeshes.forEach(mesh => {
            const data = mesh.userData;
            const dist = Math.hypot(this.mikuPos.x - data.x, this.mikuPos.z - data.z);

            // Floating beacon spin & gentle float
            if (data.beaconMesh) {
                data.beaconMesh.rotation.y += delta * 1.4;
                data.beaconMesh.position.y = 1.35 + Math.sin(this.animTime * 2.5 + data.x) * 0.1;
            }
            if (data.holoRingMesh) {
                data.holoRingMesh.rotation.z += delta * 0.9;
                data.holoRingMesh.rotation.y += delta * 0.5;
            }

            // Proximity Highlight
            const isNear = dist < 2.8;
            if (data.ringMesh) {
                const targetOpacity = isNear ? 0.95 : 0.35;
                data.ringMesh.material.opacity = THREE.MathUtils.lerp(data.ringMesh.material.opacity, targetOpacity, delta * 6);
                data.ringMesh.scale.setScalar(isNear ? 1.15 : 1.0);
            }
            if (data.beamMesh) {
                const targetBeam = isNear ? 0.45 : 0.12;
                data.beamMesh.material.opacity = THREE.MathUtils.lerp(data.beamMesh.material.opacity, targetBeam, delta * 6);
            }

            if (dist < closestDist) {
                closestDist = dist;
                closestCP = data;
            }
        });

        this.nearestCheckpoint = closestCP;
        this.activeCheckpointDist = closestDist;

        // Update UI Prompt & Status
        const promptContainer = document.getElementById('world-interaction-prompt');
        const promptTitle = document.getElementById('world-prompt-title');
        const promptSubtitle = document.getElementById('world-prompt-subtitle');
        const statusText = document.getElementById('world-status-indicator');

        if (closestDist < 2.8 && closestCP) {
            if (promptContainer) promptContainer.classList.add('active');
            if (promptTitle) promptTitle.textContent = `${closestCP.name} // ${closestCP.title}`;
            if (promptSubtitle) promptSubtitle.textContent = closestCP.subtitle;
            if (statusText) statusText.textContent = `Near Checkpoint: ${closestCP.name} — Press [E] or Click to Open`;

            // Auto-highlight corresponding HUD button
            document.querySelectorAll('.world-checkpoint-nav-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.checkpoint === closestCP.id);
            });
        } else {
            if (promptContainer) promptContainer.classList.remove('active');
            if (statusText) statusText.textContent = `Guide Miku with WASD / Arrow Keys / Click on ground`;
            document.querySelectorAll('.world-checkpoint-nav-btn').forEach(b => b.classList.remove('active'));
        }
    }

    animate() {
        if (this.isPaused) {
            this.animationFrameId = null;
            return;
        }

        const delta = Math.min(this.clock.getDelta(), 0.1);
        this.animTime += delta;

        this.updateMovement(delta);
        this.animateLimbs(delta);
        this.updateCheckpoints(delta);

        // Smooth Camera Follow with Lerp Damping & Camera Lag (Requirement #10)
        this.cameraLookTarget.lerp(this.mikuPos, delta * 4.2);

        // Subtle Mouse Parallax on Desktop
        this.mouseParallax.x = THREE.MathUtils.lerp(this.mouseParallax.x, this.mouseParallax.targetX, delta * 3);
        this.mouseParallax.y = THREE.MathUtils.lerp(this.mouseParallax.y, this.mouseParallax.targetY, delta * 3);

        const desiredCamPos = this.cameraLookTarget.clone().add(this.cameraOffset);
        desiredCamPos.x += this.mouseParallax.x;
        desiredCamPos.y += this.mouseParallax.y;

        this.camera.position.lerp(desiredCamPos, delta * 3.8);
        this.camera.lookAt(this.cameraLookTarget.clone().add(new THREE.Vector3(0, 0.8, 0)));

        // Subtle floating crystal bobbing & distant island bobbing
        if (this.floatingCrystals) {
            this.floatingCrystals.forEach((c, idx) => {
                c.rotation.y += delta * (0.3 + idx * 0.05);
            });
        }
        if (this.distantIslands) {
            this.distantIslands.forEach((di, idx) => {
                di.position.y += Math.sin(this.animTime * 0.8 + idx) * 0.003;
            });
        }

        // Ambient particles rotation
        if (this.ambientParticles) {
            this.ambientParticles.rotation.y += delta * 0.03;
        }

        this.renderer.render(this.scene, this.camera);
        this.animationFrameId = requestAnimationFrame(this.animate);
    }
}

// Global Export
window.DigitalWorld3D = DigitalWorld3D;
