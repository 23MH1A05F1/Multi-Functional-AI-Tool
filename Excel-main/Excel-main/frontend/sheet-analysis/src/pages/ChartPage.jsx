import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserCharts, saveChart } from '../store/chartSlice';
import { addSavedChart } from '../store/localHistorySlice';
import { useLocation } from 'react-router-dom';
import Chart from 'chart.js/auto';
import SideNav from '../components/SideNav.jsx';
import jsPDF from 'jspdf';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const chartTypes = [
  { label: '2D Charts', options: [
    { label: 'Bar Chart', value: 'bar' },
    { label: 'Line Chart', value: 'line' },
    { label: 'Pie Chart', value: 'pie' },
    { label: 'Scatter Plot', value: 'scatter' },
  ]},
  { label: '3D Charts', options: [
    { label: '3D Column Chart', value: '3d-column' },
    { label: '3D Bar Chart', value: '3d-bar' },
    { label: '3D Pie Chart', value: '3d-pie' },
    { label: '3D Scatter Plot', value: '3d-scatter' },
  ]},
];

const ChartPage = () => {
  const dispatch = useDispatch();
  // const navigate = useNavigate();
  const location = useLocation();
  const uploads = useSelector((state) => state.upload.uploads || []);
  // const userCharts = useSelector((state) => state.chart.charts);
  const savedCharts = useSelector((state) => state.localHistory ? state.localHistory.savedCharts : []);
  const user = useSelector((state) => state.auth.user);
  const adminThemeMode = useSelector((state) => state.adminSettings.settings.themeMode);
  const userThemeMode = useSelector((state) => state.userSettings?.settings?.themeMode);
  const themeMode = user && user.role === 'admin' ? adminThemeMode : userThemeMode || 'white';
  const [selectedUploadIndex, setSelectedUploadIndex] = useState(0);
  const [title, setTitle] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartInstance, setChartInstance] = useState(null);

  // New state to track selected charts for deletion
  const [selectedCharts, setSelectedCharts] = useState([]);

  // Toggle selection of a chart by ID
  const toggleSelectChart = (chartId) => {
    setSelectedCharts((prevSelected) =>
      prevSelected.includes(chartId)
        ? prevSelected.filter((id) => id !== chartId)
        : [...prevSelected, chartId]
    );
  };

  // Delete selected charts
  const handleDeleteSelectedCharts = () => {
    if (selectedCharts.length === 0) {
      alert('Please select at least one chart to delete.');
      return;
    }
   
    setSelectedCharts([]);
  };

  useEffect(() => {
    dispatch(fetchUserCharts());
  }, [dispatch]);

  useEffect(() => {
    if (location.state && typeof location.state.selectedUploadIndex === 'number') {
      setSelectedUploadIndex(location.state.selectedUploadIndex);
    }
  }, [location.state]);

  const uploadedData = uploads.length > 0 ? uploads[selectedUploadIndex]?.data || [] : [];
  const columns = uploadedData.length > 0 ? Object.keys(uploadedData[0]) : [];

  const colorPalette = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(199, 199, 199, 0.6)',
    'rgba(83, 102, 255, 0.6)',
    'rgba(255, 99, 255, 0.6)',
    'rgba(99, 255, 132, 0.6)',
  ];

  const borderColorPalette = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(199, 199, 199, 1)',
    'rgba(83, 102, 255, 1)',
    'rgba(255, 99, 255, 1)',
    'rgba(99, 255, 132, 1)',
  ];

  const threeContainerRef = React.useRef(null);
  const threeRendererRef = React.useRef(null);
  const threeSceneRef = React.useRef(null);
  const threeCameraRef = React.useRef(null);
  const threeAnimationIdRef = React.useRef(null);

  // Cleanup Three.js scene and renderer
  const cleanupThree = () => {
    if (threeAnimationIdRef.current) {
      cancelAnimationFrame(threeAnimationIdRef.current);
    }
    if (threeRendererRef.current) {
      threeRendererRef.current.dispose();
      if (threeRendererRef.current.domElement && threeRendererRef.current.domElement.parentNode) {
        threeRendererRef.current.domElement.parentNode.removeChild(threeRendererRef.current.domElement);
      }
      threeRendererRef.current = null;
    }
    if (threeSceneRef.current) {
      threeSceneRef.current.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      threeSceneRef.current = null;
    }
    threeCameraRef.current = null;
    if (threeTooltipDivRef.current) {
      document.body.removeChild(threeTooltipDivRef.current);
      threeTooltipDivRef.current = null;
    }
  };

  // Tooltip div for 3D chart
  const threeTooltipDivRef = React.useRef(null);

  // Utility: create or update tooltip
  const showThreeTooltip = (x, y, text) => {
    if (!threeTooltipDivRef.current) {
      const div = document.createElement('div');
      div.style.position = 'fixed';
      div.style.pointerEvents = 'none';
      div.style.background = 'rgba(0,0,0,0.8)';
      div.style.color = 'white';
      div.style.padding = '6px 12px';
      div.style.borderRadius = '6px';
      div.style.fontSize = '14px';
      div.style.zIndex = 10000;
      document.body.appendChild(div);
      threeTooltipDivRef.current = div;
    }
    threeTooltipDivRef.current.style.left = `${x + 10}px`;
    threeTooltipDivRef.current.style.top = `${y + 10}px`;
    threeTooltipDivRef.current.innerText = text;
    threeTooltipDivRef.current.style.display = 'block';
  };
  const hideThreeTooltip = () => {
    if (threeTooltipDivRef.current) {
      threeTooltipDivRef.current.style.display = 'none';
    }
  };

  // Render loop for Three.js
  const animateThree = () => {
    if (threeRendererRef.current && threeSceneRef.current && threeCameraRef.current) {
      threeRendererRef.current.render(threeSceneRef.current, threeCameraRef.current);
      threeAnimationIdRef.current = requestAnimationFrame(animateThree);
    }
  };

  // Add axis lines and labels
  const addAxes = (scene, length = 20) => {
    // Custom axes with thicker lines and high-contrast colors
    const axisMaterialX = new THREE.LineBasicMaterial({ color: 0xff2222, linewidth: 4 });
    const axisMaterialY = new THREE.LineBasicMaterial({ color: 0x22bb22, linewidth: 4 });
    const axisMaterialZ = new THREE.LineBasicMaterial({ color: 0x2222ff, linewidth: 4 });
    const pointsX = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0)];
    const pointsY = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0)];
    const pointsZ = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length)];
    const axisX = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsX), axisMaterialX);
    const axisY = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsY), axisMaterialY);
    const axisZ = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsZ), axisMaterialZ);
    scene.add(axisX);
    scene.add(axisY);
    scene.add(axisZ);
    // Add bold, large, dark axis labels
    const makeLabel = (text, color) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.font = 'bold 36px Arial';
      ctx.fillStyle = color;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(6, 1.5, 1);
      return sprite;
    };
    const xLabel = makeLabel('X', '#b80000');
    xLabel.position.set(length + 1, 0, 0);
    scene.add(xLabel);
    const yLabel = makeLabel('Y', '#008800');
    yLabel.position.set(0, length + 1, 0);
    scene.add(yLabel);
    const zLabel = makeLabel('Z', '#0000b8');
    zLabel.position.set(0, 0, length + 1);
    scene.add(zLabel);
  };

  // Add ground plane
  const addGroundPlane = (scene, size = 40) => {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshPhongMaterial({ color: 0xf0f0f0, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.01;
    scene.add(plane);
  };

  // Create 3D column chart with Three.js (with animation, orbit controls, tooltips, axes, ground)
  const create3DColumnChart = () => {
    cleanupThree();
    const width = threeContainerRef.current.clientWidth;
    const height = threeContainerRef.current.clientHeight;
    const scene = new THREE.Scene();
    threeSceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 20, 40);
    threeCameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    threeContainerRef.current.appendChild(renderer.domElement);
    threeRendererRef.current = renderer;
    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
    // Axes and ground
    addAxes(scene, 18);
    addGroundPlane(scene, 40);
    // Create columns with animation
    const dataLength = uploadedData.length;
    const maxVal = Math.max(...uploadedData.map(row => Number(row[yAxis])));
    const columnWidth = 1;
    const gap = 0.5;
    const columns3D = [];
    uploadedData.forEach((row, index) => {
      const heightVal = (Number(row[yAxis]) / maxVal) * 15;
      const geometry = new THREE.BoxGeometry(columnWidth, 0.01, columnWidth); // Start tiny for animation
      const color = new THREE.Color(colorPalette[index % colorPalette.length]);
      const material = new THREE.MeshPhongMaterial({ color });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(index * (columnWidth + gap) - (dataLength * (columnWidth + gap)) / 2, 0.01 / 2, 0);
      cube.userData = { label: row[xAxis], value: row[yAxis] };
      scene.add(cube);
      columns3D.push({ mesh: cube, targetHeight: heightVal });
    });
    // Animation: grow bars
    let animFrame = 0;
    const growBars = () => {
      let done = true;
      columns3D.forEach(({ mesh, targetHeight }) => {
        const currH = mesh.scale.y * targetHeight || mesh.geometry.parameters.height;
        if (mesh.scale.y < 1) {
          mesh.scale.y += 0.08;
          if (mesh.scale.y > 1) mesh.scale.y = 1;
          mesh.position.y = (mesh.scale.y * targetHeight) / 2;
          done = false;
        }
      });
      renderer.render(scene, camera);
      controls.update();
      if (!done) {
        animFrame = requestAnimationFrame(growBars);
      } else {
        animateThree();
      }
    };
    columns3D.forEach(({ mesh }) => { mesh.scale.y = 0.01; });
    growBars();
    // Interactivity: tooltips on hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('mousemove', (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(columns3D.map(c => c.mesh));
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        showThreeTooltip(event.clientX, event.clientY, `${obj.userData.label}: ${obj.userData.value}`);
        obj.material.emissive.setHex(0x333333);
      } else {
        hideThreeTooltip();
        columns3D.forEach(({ mesh }) => mesh.material.emissive.setHex(0x000000));
      }
    });
    renderer.domElement.addEventListener('mouseleave', hideThreeTooltip);
  };

  // Create 3D bar chart with Three.js (horizontal bars, with animation, orbit controls, tooltips, axes, ground)
  const create3DBarChart = () => {
    cleanupThree();
    const width = threeContainerRef.current.clientWidth;
    const height = threeContainerRef.current.clientHeight;
    const scene = new THREE.Scene();
    threeSceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(40, 20, 0);
    camera.lookAt(0, 0, 0);
    threeCameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    threeContainerRef.current.appendChild(renderer.domElement);
    threeRendererRef.current = renderer;
    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
    // Axes and ground
    addAxes(scene, 18);
    addGroundPlane(scene, 40);
    // Create bars with animation
    const dataLength = uploadedData.length;
    const maxVal = Math.max(...uploadedData.map(row => Number(row[yAxis])));
    const barHeight = 1;
    const gap = 0.5;
    const bars3D = [];
    uploadedData.forEach((row, index) => {
      const lengthVal = (Number(row[yAxis]) / maxVal) * 15;
      const geometry = new THREE.BoxGeometry(0.01, barHeight, barHeight); // Start tiny for animation
      const color = new THREE.Color(colorPalette[index % colorPalette.length]);
      const material = new THREE.MeshPhongMaterial({ color });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.set(0.01 / 2 - (maxVal * 15) / 2, index * (barHeight + gap) - (dataLength * (barHeight + gap)) / 2, 0);
      bar.userData = { label: row[xAxis], value: row[yAxis] };
      scene.add(bar);
      bars3D.push({ mesh: bar, targetLength: lengthVal });
    });
    // Animation: grow bars
    let animFrame = 0;
    const growBars = () => {
      let done = true;
      bars3D.forEach(({ mesh, targetLength }) => {
        if (mesh.scale.x < 1) {
          mesh.scale.x += 0.08;
          if (mesh.scale.x > 1) mesh.scale.x = 1;
          mesh.position.x = (mesh.scale.x * targetLength) / 2 - (maxVal * 15) / 2;
          done = false;
        }
      });
      renderer.render(scene, camera);
      controls.update();
      if (!done) {
        animFrame = requestAnimationFrame(growBars);
      } else {
        animateThree();
      }
    };
    bars3D.forEach(({ mesh }) => { mesh.scale.x = 0.01; });
    growBars();
    // Interactivity: tooltips on hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('mousemove', (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(bars3D.map(b => b.mesh));
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        showThreeTooltip(event.clientX, event.clientY, `${obj.userData.label}: ${obj.userData.value}`);
        obj.material.emissive.setHex(0x333333);
      } else {
        hideThreeTooltip();
        bars3D.forEach(({ mesh }) => mesh.material.emissive.setHex(0x000000));
      }
    });
    renderer.domElement.addEventListener('mouseleave', hideThreeTooltip);
  };

  // Create 3D Pie Chart with Three.js
  const create3DPieChart = () => {
    cleanupThree();
    const width = threeContainerRef.current.clientWidth;
    const height = threeContainerRef.current.clientHeight;
    const scene = new THREE.Scene();
    threeSceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 20, 40);
    threeCameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    threeContainerRef.current.appendChild(renderer.domElement);
    threeRendererRef.current = renderer;
    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
    // Axes and ground
    addAxes(scene, 18);
    addGroundPlane(scene, 40);
    // Pie chart logic
    const total = uploadedData.reduce((sum, row) => sum + Number(row[yAxis]), 0);
    let startAngle = 0;
    uploadedData.forEach((row, index) => {
      const value = Number(row[yAxis]);
      const angle = (value / total) * Math.PI * 2;
      const geometry = new THREE.CylinderGeometry(0, 10, 2, 32, 1, false, startAngle, angle);
      const color = new THREE.Color(colorPalette[index % colorPalette.length]);
      const material = new THREE.MeshPhongMaterial({ color });
      const slice = new THREE.Mesh(geometry, material);
      slice.rotation.x = Math.PI / 2;
      slice.userData = { label: row[xAxis], value: row[yAxis] };
      scene.add(slice);
      startAngle += angle;
    });
    // Tooltips
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('mousemove', (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children.filter(obj => obj.type === 'Mesh'));
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        showThreeTooltip(event.clientX, event.clientY, `${obj.userData.label}: ${obj.userData.value}`);
        obj.material.emissive.setHex(0x333333);
      } else {
        hideThreeTooltip();
        scene.children.forEach(obj => { if(obj.material) obj.material.emissive && obj.material.emissive.setHex(0x000000); });
      }
    });
    renderer.domElement.addEventListener('mouseleave', hideThreeTooltip);
    animateThree();
  };

  // Create 3D Scatter Plot with Three.js
  const create3DScatterPlot = () => {
    cleanupThree();
    const width = threeContainerRef.current.clientWidth;
    const height = threeContainerRef.current.clientHeight;
    const scene = new THREE.Scene();
    threeSceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 20, 40);
    threeCameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    threeContainerRef.current.appendChild(renderer.domElement);
    threeRendererRef.current = renderer;
    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
    // Axes and ground
    addAxes(scene, 18);
    addGroundPlane(scene, 40);
    // Scatter plot logic (assume xAxis, yAxis, and a third column for z)
    const zCol = columns.find(col => col !== xAxis && col !== yAxis) || columns[0];
    uploadedData.forEach((row, index) => {
      const x = Number(row[xAxis]);
      const y = Number(row[yAxis]);
      const z = Number(row[zCol]);
      const geometry = new THREE.SphereGeometry(0.6, 16, 16);
      const color = new THREE.Color(colorPalette[index % colorPalette.length]);
      const material = new THREE.MeshPhongMaterial({ color });
      const point = new THREE.Mesh(geometry, material);
      point.position.set(x, y, z);
      point.userData = { label: `${xAxis}: ${x}, ${yAxis}: ${y}, ${zCol}: ${z}` };
      scene.add(point);
    });
    // Tooltips
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('mousemove', (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children.filter(obj => obj.type === 'Mesh'));
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        showThreeTooltip(event.clientX, event.clientY, obj.userData.label);
        obj.material.emissive.setHex(0x333333);
      } else {
        hideThreeTooltip();
        scene.children.forEach(obj => { if(obj.material) obj.material.emissive && obj.material.emissive.setHex(0x000000); });
      }
    });
    renderer.domElement.addEventListener('mouseleave', hideThreeTooltip);
    animateThree();
  };

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSaveAnalysis = async () => {
    if (!title || !chartType || !xAxis || !yAxis) {
      alert('Please fill all fields before saving');
      return;
    }
    const dataToSave = uploadedData;
    const savedTitle = title || 'saved';

    let chartImage = null;
    if (chartType === '3d-column' || chartType === '3d-bar' || chartType === '3d-pie' || chartType === '3d-scatter') {
      if (threeRendererRef.current) {
        // Wait for one animation frame to ensure rendering is complete
        await new Promise((resolve) => requestAnimationFrame(resolve));
        chartImage = threeRendererRef.current.domElement.toDataURL('image/png');
      }
    } else {
      const canvas = document.getElementById('chartCanvas');
      chartImage = canvas ? canvas.toDataURL('image/png') : null;
    }

    setSaveLoading(true);
    setSaveError(null);
    try {
      await dispatch(saveChart({ fileName: uploads[selectedUploadIndex]?.filename || '', title: savedTitle, chartType, xAxis, yAxis, data: dataToSave, chartImage })).unwrap();
      dispatch(addSavedChart({ fileName: uploads[selectedUploadIndex]?.filename || '', title: savedTitle, chartType, xAxis, yAxis, data: dataToSave, chartImage }));
      alert('Chart saved successfully');
      await dispatch(fetchUserCharts());
    } catch (error) {
      setSaveError(error || 'Failed to save chart');
    } finally {
      setSaveLoading(false);
    }
  };

  const downloadChartAsPNG = () => {
    if (chartType.startsWith('3d-')) {
      if (!threeRendererRef.current || !threeSceneRef.current || !threeCameraRef.current) {
        alert('Please generate a chart first');
        return;
      }
      const renderer = threeRendererRef.current;
      // Defensive: ensure clear color is always set
      let prevClearColor;
      try {
        prevClearColor = renderer.getClearColor() ? renderer.getClearColor().clone() : new THREE.Color('#fff');
      } catch (e) {
        prevClearColor = new THREE.Color('#fff');
      }
      const prevAlpha = renderer.getClearAlpha ? renderer.getClearAlpha() : 1;
      const prevSceneBg = threeSceneRef.current.background;
      renderer.setClearColor('#fff', 1);
      threeSceneRef.current.background = new THREE.Color('#fff');
      renderer.clear();
      renderer.render(threeSceneRef.current, threeCameraRef.current);
      const link = document.createElement('a');
      link.download = `${title || 'chart'}.png`;
      link.href = renderer.domElement.toDataURL('image/png');
      link.click();
      // Restore previous background
      renderer.setClearColor(prevClearColor, prevAlpha);
      threeSceneRef.current.background = prevSceneBg;
      renderer.render(threeSceneRef.current, threeCameraRef.current);
    } else {
      if (!chartInstance) {
        alert('Please generate a chart first');
        return;
      }
      // Draw white background before exporting
      const canvas = document.getElementById('chartCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      const link = document.createElement('a');
      link.download = `${title || 'chart'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      // Restore original image (optional, for live preview)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    }
  };

  const downloadChartAsPDF = () => {
    if (chartType.startsWith('3d-')) {
      if (!threeRendererRef.current || !threeSceneRef.current || !threeCameraRef.current) {
        alert('Please generate a chart first');
        return;
      }
      const renderer = threeRendererRef.current;
      let prevClearColor;
      try {
        prevClearColor = renderer.getClearColor() ? renderer.getClearColor().clone() : new THREE.Color('#fff');
      } catch (e) {
        prevClearColor = new THREE.Color('#fff');
      }
      const prevAlpha = renderer.getClearAlpha ? renderer.getClearAlpha() : 1;
      const prevSceneBg = threeSceneRef.current.background;
      renderer.setClearColor('#fff', 1);
      threeSceneRef.current.background = new THREE.Color('#fff');
      renderer.clear();
      renderer.render(threeSceneRef.current, threeCameraRef.current);
      const imgData = renderer.domElement.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${title || 'chart'}.pdf`);
      // Restore previous background
      renderer.setClearColor(prevClearColor, prevAlpha);
      threeSceneRef.current.background = prevSceneBg;
      renderer.render(threeSceneRef.current, threeCameraRef.current);
    } else {
      if (!chartInstance) {
        alert('Please generate a chart first');
        return;
      }
      // Draw white background before exporting
      const canvas = document.getElementById('chartCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${title || 'chart'}.pdf`);
      // Restore original image (optional, for live preview)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    }
  };

  // Generate Chart (2D/3D)
  const generateChart = () => {
    if (!title || !chartType || !xAxis || !yAxis) {
      alert('Please fill all fields');
      return;
    }
    // 3D charts
    if (chartType === '3d-column') {
      if (threeContainerRef.current) threeContainerRef.current.style.display = 'block';
      const canvas = document.getElementById('chartCanvas');
      if (canvas) canvas.style.display = 'none';
      create3DColumnChart();
      setChartInstance(null);
      return;
    } else if (chartType === '3d-bar') {
      if (threeContainerRef.current) threeContainerRef.current.style.display = 'block';
      const canvas = document.getElementById('chartCanvas');
      if (canvas) canvas.style.display = 'none';
      create3DBarChart();
      setChartInstance(null);
      return;
    } else if (chartType === '3d-pie') {
      if (threeContainerRef.current) threeContainerRef.current.style.display = 'block';
      const canvas = document.getElementById('chartCanvas');
      if (canvas) canvas.style.display = 'none';
      create3DPieChart();
      setChartInstance(null);
      return;
    } else if (chartType === '3d-scatter') {
      if (threeContainerRef.current) threeContainerRef.current.style.display = 'block';
      const canvas = document.getElementById('chartCanvas');
      if (canvas) canvas.style.display = 'none';
      create3DScatterPlot();
      setChartInstance(null);
      return;
    } else {
      // 2D charts
      if (threeContainerRef.current) threeContainerRef.current.style.display = 'none';
      const canvas = document.getElementById('chartCanvas');
      if (canvas) canvas.style.display = 'block';
      const ctx = canvas.getContext('2d');
      if (chartInstance) {
        chartInstance.destroy();
      }
      // Generate colors for each data point or dataset
      const dataLength = uploadedData.length;
      const backgroundColors = [];
      const borderColors = [];
      if (chartType === 'line' || chartType === 'scatter') {
        backgroundColors.push(colorPalette[0]);
        borderColors.push(borderColorPalette[0]);
      } else {
        for (let i = 0; i < dataLength; i++) {
          backgroundColors.push(colorPalette[i % colorPalette.length]);
          borderColors.push(borderColorPalette[i % borderColorPalette.length]);
        }
      }
      const data = {
        labels: uploadedData.map((row) => row[xAxis]),
        datasets: [
          {
            label: yAxis,
            data: uploadedData.map((row) => row[yAxis]),
            backgroundColor:
              chartType === 'pie' || chartType === 'doughnut'
                ? backgroundColors
                : chartType === 'bar'
                ? backgroundColors
                : chartType === 'line' || chartType === 'scatter'
                ? backgroundColors[0]
                : 'rgba(54, 162, 235, 0.6)',
            borderColor:
              chartType === 'pie' || chartType === 'doughnut'
                ? borderColors
                : chartType === 'bar'
                ? borderColors
                : chartType === 'line' || chartType === 'scatter'
                ? borderColors[0]
                : 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            fill: chartType === 'line' ? false : true,
            pointBackgroundColor: chartType === 'scatter' ? backgroundColors[0] : undefined,
            pointBorderColor: chartType === 'scatter' ? borderColors[0] : undefined,
          },
        ],
      };
      const newChartInstance = new Chart(ctx, {
        type: chartType,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 2.5,
          animation: {
            duration: 0,
          },
          layout: {
            padding: {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
          },
          plugins: {
            legend: { display: true },
            title: { display: true, text: title },
          },
          scales: {
            x: {
              ticks: {
                color: themeMode === 'dark' ? 'white' : 'black',
              },
              grid: {
                color: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              },
            },
            y: {
              ticks: {
                color: themeMode === 'dark' ? 'white' : 'black',
              },
              grid: {
                color: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              },
            },
          },
        },
        onResize: (chart) => {
          chart.canvas.style.height = '900px';
          chart.canvas.style.width = '100%';
          chart.resize();
        },
      });
      setChartInstance(newChartInstance);
    }
  };

  return (
    <div className={`flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 p-6 min-h-screen ${themeMode === 'dark' ? 'bg-gray-900 text-white' : themeMode === 'creative' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white text-black'}`} style={{ height: '100vh' }}>
      <SideNav />
      <div className="flex-1 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6" style={{ height: '100%' }}>
        <div className={`md:w-1/3 rounded-lg shadow-lg flex flex-col ${themeMode === 'dark' ? 'bg-gray-800' : themeMode === 'creative' ? 'bg-purple-700 bg-opacity-80' : 'bg-white'}`} style={{ padding: '1.5rem' }}>
          <h2 className="text-2xl font-extrabold mb-6 text-gray-800">Create a New Chart</h2>
          <select
            className="w-full border border-gray-300 rounded-md p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedUploadIndex}
            onChange={(e) => setSelectedUploadIndex(Number(e.target.value))}
          >
            {uploads.map((upload, index) => (
              <option key={upload._id} value={index}>
                {upload.filename}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Enter chart title"
            className="w-full border border-gray-300 rounded-md p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            className="w-full border border-gray-300 rounded-md p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            {chartTypes.map((ct) => (
              ct.options ? (
                <optgroup key={ct.label} label={ct.label}>
                  {ct.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <option key={ct.value} value={ct.value}>
                  {ct.label}
                </option>
              )
            ))}
          </select>
          <select
            className="w-full border border-gray-300 rounded-md p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
          >
            <option value="">Select X-Axis Column</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
          <select
            className="w-full border border-gray-300 rounded-md p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
          >
            <option value="">Select Y-Axis Column</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md mb-5 transition duration-300"
            onClick={generateChart}
          >
            Generate Chart
          </button>
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md mb-5 transition duration-300"
            onClick={handleSaveAnalysis}
            disabled={saveLoading}
          >
            {saveLoading ? 'Saving...' : 'Save Analysis'}
          </button>
          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md mb-5 transition duration-300"
            onClick={downloadChartAsPNG}
          >
            Download as PNG
          </button>
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md transition duration-300"
            onClick={downloadChartAsPDF}
          >
            Download as PDF
          </button>
          {saveError && <p className="text-red-600 mt-3">{typeof saveError === 'string' ? saveError : saveError.message}</p>}
        </div>
      <div className={`md:w-2/3 rounded-lg shadow-lg overflow-hidden flex flex-col ${themeMode === 'dark' ? 'bg-gray-800' : themeMode === 'creative' ? 'bg-purple-700 bg-opacity-80' : 'bg-white'}`} style={{ height: 'auto', maxHeight: 'calc(100vh - 3rem)', minHeight: 'calc(100vh - 3rem)' }}>
          {/* Chart Display: 2D or 3D */}
          <div className="flex-1 w-full flex justify-center items-start" style={{ minHeight: 0, height: '100%' }}>
            {/* 2D Chart.js Canvas */}
            <canvas id="chartCanvas" className="w-full h-full" style={{ display: (chartType === '3d-column' || chartType === '3d-bar') ? 'none' : 'block', height: '100%', width: '100%', maxHeight: '100%', maxWidth: '100%' }} />
            {/* 3D Three.js Container */}
            <div ref={threeContainerRef} style={{ width: '100%', height: '100%', display: (chartType === '3d-column' || chartType === '3d-bar') ? 'block' : 'none' }} />
          </div>
          
          {savedCharts.length === 0 ? (
            <>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCharts.map((chart, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 shadow hover:shadow-lg transition duration-300 ${
                    selectedCharts.includes(chart._id) ? 'ring-4 ring-red-400' : ''
                  }`}
                >
                  <label className="flex items-center mb-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedCharts.includes(chart._id)}
                      onChange={() => toggleSelectChart(chart._id)}
                      className="mr-2"
                    />
                    <strong className="block text-lg font-bold mb-2">{chart.title}</strong>
                  </label>
                  <p className="mb-2 text-gray-700">{chart.chartType}</p>
                  {chart.chartImage && (
                    <img src={chart.chartImage} alt={chart.title} className="w-full h-48 object-contain rounded" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartPage;