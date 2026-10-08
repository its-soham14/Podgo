import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeJSScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0A0F');
    scene.fog = new THREE.FogExp2('#0A0A0F', 0.05);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight('#1E1B4B', 1.5);
    scene.add(ambientLight);

    const pointLightPrimary = new THREE.PointLight('#6366F1', 2, 50);
    pointLightPrimary.position.set(5, 5, 5);
    scene.add(pointLightPrimary);

    const pointLightAccent = new THREE.PointLight('#14B8A6', 2, 50);
    pointLightAccent.position.set(-5, 5, -5);
    scene.add(pointLightAccent);

    // Grid (Road Network)
    const gridHelper = new THREE.GridHelper(40, 40, '#1E1B4B', '#111118');
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Particles (Ambient depth)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 30;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: '#2DD4BF',
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Floating Nodes (Pickup/Dropoff points)
    const nodeGeometry = new THREE.OctahedronGeometry(0.2, 0);
    const nodeMaterial = new THREE.MeshStandardMaterial({ 
      color: '#6366F1', 
      emissive: '#4338CA',
      emissiveIntensity: 0.5,
      wireframe: true 
    });

    const nodes = [];
    for (let i = 0; i < 10; i++) {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(
        (Math.random() - 0.5) * 20,
        Math.random() * 2,
        (Math.random() - 0.5) * 20
      );
      nodes.push(node);
      scene.add(node);
    }

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Rotate camera slowly
      camera.position.x = Math.sin(elapsedTime * 0.1) * 12;
      camera.position.z = Math.cos(elapsedTime * 0.1) * 12;
      camera.lookAt(0, 0, 0);

      // Animate particles
      particlesMesh.rotation.y = elapsedTime * 0.05;

      // Animate nodes
      nodes.forEach((node, index) => {
        node.rotation.y += 0.01;
        node.position.y += Math.sin(elapsedTime * 2 + index) * 0.005;
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      // Dispose Geometries and Materials
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 -z-10" />;
}
