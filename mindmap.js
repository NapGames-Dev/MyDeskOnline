/* ═══════════════════════════════════════════════════════════
   CARTES MENTALES
   Chargé avant script.js (cœur : données, traductions, onglets, démarrage).
   ═══════════════════════════════════════════════════════════ */

let selectedNodeId = null;
let linkMode = false;
let linkSourceId = null;

function getActiveMindmap() {
  let mutated = false;
  if (!appData.mindmap || !Array.isArray(appData.mindmap.maps)) {
    const fallbackId = uid();
    appData.mindmap = {
      maps: [{ id: fallbackId, name: t('mindmap.defaultMapName', { index: 1 }), nodes: [], links: [] }],
      activeMapId: fallbackId
    };
    mutated = true;
  }
  if (appData.mindmap.maps.length === 0) {
    const fallbackId = uid();
    appData.mindmap.maps.push({ id: fallbackId, name: t('mindmap.defaultMapName', { index: 1 }), nodes: [], links: [] });
    appData.mindmap.activeMapId = fallbackId;
    mutated = true;
  }
  let active = appData.mindmap.maps.find((map) => map.id === appData.mindmap.activeMapId);
  if (!active) {
    appData.mindmap.activeMapId = appData.mindmap.maps[0].id;
    active = appData.mindmap.maps[0];
    mutated = true;
  }
  if (mutated) {
    saveData();
  }
  return active;
}

function setActiveMindmap(mapId) {
  if (!appData.mindmap.maps.some((map) => map.id === mapId)) return;
  appData.mindmap.activeMapId = mapId;
  selectedNodeId = null;
  setLinkMode(false);
  renderMindmapList();
  renderMindmap();
  saveData();
}

function renderMindmapList() {
  const list = document.getElementById('mindmap-list');
  if (!list) return;
  const active = getActiveMindmap();
  list.innerHTML = '';
  appData.mindmap.maps.forEach((map) => {
    const item = document.createElement('li');
    item.classList.toggle('active', map.id === active.id);
    const nameSpan = document.createElement('span');
    nameSpan.textContent = map.name || t('mindmap.untitledMap');
    item.appendChild(nameSpan);
    item.addEventListener('click', () => {
      if (appData.mindmap.activeMapId === map.id) return;
      setActiveMindmap(map.id);
    });
    list.appendChild(item);
  });
}

function initMindmap() {
  const addBtn = document.getElementById('add-node');
  const deleteBtn = document.getElementById('delete-node');
  const linkBtn = document.getElementById('link-nodes');
  const colorInput = document.getElementById('node-color');
  const canvas = document.getElementById('mindmap-canvas');
  const addMapBtn = document.getElementById('add-map');
  const renameMapBtn = document.getElementById('rename-map');
  const deleteMapBtn = document.getElementById('delete-map');

  function addNode() {
    const rect = canvas.getBoundingClientRect();
    const node = {
      id: uid(),
      title: t('mindmap.newBubble'),
      color: colorInput.value,
      x: rect.width / 2 - 60,
      y: rect.height / 2 - 40
    };
    const map = getActiveMindmap();
    map.nodes.push(node);
    saveData();
    renderMindmap();
    selectNode(node.id);
  }

  addBtn.addEventListener('click', addNode);

  deleteBtn.addEventListener('click', () => {
    if (!selectedNodeId) return;
    const map = getActiveMindmap();
    map.nodes = map.nodes.filter((node) => node.id !== selectedNodeId);
    map.links = map.links.filter((link) => link.from !== selectedNodeId && link.to !== selectedNodeId);
    selectedNodeId = null;
    setLinkMode(false);
    saveData();
    renderMindmap();
  });

  linkBtn.addEventListener('click', () => {
    if (!selectedNodeId) return;
    setLinkMode(!linkMode);
  });

  colorInput.addEventListener('input', () => {
    if (!selectedNodeId) return;
    const map = getActiveMindmap();
    const node = map.nodes.find((n) => n.id === selectedNodeId);
    if (!node) return;
    node.color = colorInput.value;
    saveDataSoon();
    renderMindmap();
  });

  if (addMapBtn) {
    addMapBtn.addEventListener('click', () => {
      const newMap = {
        id: uid(),
        name: t('mindmap.defaultMapName', { index: appData.mindmap.maps.length + 1 }),
        nodes: [],
        links: []
      };
      appData.mindmap.maps.push(newMap);
      setActiveMindmap(newMap.id);
    });
  }

  if (renameMapBtn) {
    renameMapBtn.addEventListener('click', () => {
      const map = getActiveMindmap();
      const newName = prompt(t('mindmap.renamePrompt'), map.name || t('mindmap.untitledMap'));
      if (newName === null) return;
      const trimmed = newName.trim();
      map.name = trimmed || t('mindmap.untitledMap');
      saveData();
      renderMindmapList();
    });
  }

  if (deleteMapBtn) {
    deleteMapBtn.addEventListener('click', () => {
      if (appData.mindmap.maps.length <= 1) {
        alert(t('mindmap.lastMapAlert'));
        return;
      }
      const map = getActiveMindmap();
      if (!confirm(t('mindmap.deleteConfirm', { name: map.name || t('mindmap.untitledMap') }))) return;
      appData.mindmap.maps = appData.mindmap.maps.filter((m) => m.id !== map.id);
      const fallback = getActiveMindmap();
      appData.mindmap.activeMapId = fallback.id;
      selectedNodeId = null;
      setLinkMode(false);
      saveData();
      renderMindmapList();
      renderMindmap();
    });
  }

  renderMindmap();
  renderMindmapList();
  selectNode(selectedNodeId);
  syncLinkButton();

  window.addEventListener('resize', () => {
    requestAnimationFrame(() => updateLinkPositions());
  });
}

function renderMindmap() {
  const canvas = document.getElementById('mindmap-canvas');
  const linksLayer = document.getElementById('mindmap-links');
  if (!canvas || !linksLayer) return;
  const map = getActiveMindmap();

  if (selectedNodeId && !map.nodes.some((node) => node.id === selectedNodeId)) {
    selectedNodeId = null;
  }

  canvas.innerHTML = '';
  linksLayer.innerHTML = '';
  linksLayer.setAttribute('width', canvas.clientWidth);
  linksLayer.setAttribute('height', canvas.clientHeight);

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'mindmap-arrow');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '10');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '6');
  marker.setAttribute('markerHeight', '6');
  marker.setAttribute('orient', 'auto');
  const markerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const linkColor = 'rgba(79, 70, 229, 0.55)';
  markerPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
  markerPath.setAttribute('fill', linkColor);
  marker.appendChild(markerPath);
  defs.appendChild(marker);
  linksLayer.appendChild(defs);

  map.nodes.forEach((node) => {
    const nodeEl = document.createElement('div');
    nodeEl.className = 'mindmap-node';
    if (node.id === selectedNodeId) {
      nodeEl.classList.add('selected');
    }
    nodeEl.style.left = `${node.x}px`;
    nodeEl.style.top = `${node.y}px`;
    nodeEl.style.background = node.color || '#4e73df';
    nodeEl.dataset.id = node.id;
    nodeEl.textContent = node.title;

    nodeEl.addEventListener('click', (event) => {
      event.stopPropagation();
      if (linkMode && linkSourceId && linkSourceId !== node.id) {
        const exists = map.links.some((link) => (link.from === linkSourceId && link.to === node.id) || (link.from === node.id && link.to === linkSourceId));
        if (!exists) {
          map.links.push({ id: uid(), from: linkSourceId, to: node.id });
          saveData();
          renderMindmap();
        }
        setLinkMode(false);
      } else {
        selectNode(node.id);
      }
    });

    nodeEl.addEventListener('dblclick', (event) => {
      event.stopPropagation();
      editNodeTitle(node);
    });

    enableDrag(nodeEl, node);

    canvas.appendChild(nodeEl);
  });

  const linesFragment = document.createDocumentFragment();
  map.links.forEach(() => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', linkColor);
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('marker-end', 'url(#mindmap-arrow)');
    linesFragment.appendChild(line);
  });
  linksLayer.appendChild(linesFragment);
  updateLinkPositions();

  document.getElementById('mindmap-canvas').onclick = () => {
    if (!linkMode) {
      selectNode(null);
    }
  };

  const fallbackId = selectedNodeId !== null ? selectedNodeId : null;
  if (!fallbackId) {
    setLinkMode(false);
    selectNode(null);
  } else {
    selectNode(fallbackId);
    if (linkMode) {
      linkSourceId = fallbackId;
    }
    syncLinkButton();
  }
}

function editNodeTitle(node) {
  const canvas = document.getElementById('mindmap-canvas');
  const nodeEl = canvas.querySelector(`.mindmap-node[data-id="${node.id}"]`);
  if (!nodeEl) return;
  nodeEl.innerHTML = '';
  const input = document.createElement('input');
  input.type = 'text';
  input.value = node.title;
  nodeEl.appendChild(input);
  input.focus();
  input.select();
  input.addEventListener('blur', () => {
    const trimmed = input.value.trim();
    node.title = trimmed || t('mindmap.untitledNode');
    saveData();
    renderMindmap();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      input.blur();
    }
  });
}

function selectNode(nodeId) {
  selectedNodeId = nodeId;
  const nodes = document.querySelectorAll('.mindmap-node');
  nodes.forEach((node) => {
    node.classList.toggle('selected', node.dataset.id === nodeId);
  });
  const colorInput = document.getElementById('node-color');
  const deleteBtn = document.getElementById('delete-node');
  const linkBtn = document.getElementById('link-nodes');
  const map = getActiveMindmap();
  if (!nodeId) {
    colorInput.disabled = true;
    deleteBtn.disabled = true;
    linkBtn.disabled = true;
    syncLinkButton();
  } else {
    colorInput.disabled = false;
    deleteBtn.disabled = false;
    linkBtn.disabled = false;
    const node = map.nodes.find((n) => n.id === nodeId);
    if (node) {
      colorInput.value = node.color || '#4e73df';
    }
    if (linkMode) {
      linkSourceId = nodeId;
      syncLinkButton();
    }
  }
}

function enableDrag(element, node) {
  let offsetX = 0;
  let offsetY = 0;

  element.addEventListener('pointerdown', (event) => {
    const linkingToOtherNode = linkMode && linkSourceId && linkSourceId !== node.id;
    if (linkingToOtherNode) {
      return;
    }
    event.preventDefault();
    selectNode(node.id);
    offsetX = event.clientX - node.x;
    offsetY = event.clientY - node.y;
    element.setPointerCapture(event.pointerId);
    const move = (e) => {
      node.x = e.clientX - offsetX;
      node.y = e.clientY - offsetY;
      element.style.left = `${node.x}px`;
      element.style.top = `${node.y}px`;
      updateLinkPositions();
    };
    const up = (e) => {
      element.releasePointerCapture(event.pointerId);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up);
      element.removeEventListener('pointercancel', up);
      saveData();
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
  });
}

function updateLinkPositions() {
  const canvas = document.getElementById('mindmap-canvas');
  const linksLayer = document.getElementById('mindmap-links');
  if (!linksLayer || !canvas) return;
  const lines = Array.from(linksLayer.querySelectorAll('line'));
  const canvasRect = canvas.getBoundingClientRect();
  const map = getActiveMindmap();
  lines.forEach((line, index) => {
    const link = map.links[index];
    if (!link) return;
    const fromEl = canvas.querySelector(`.mindmap-node[data-id="${link.from}"]`);
    const toEl = canvas.querySelector(`.mindmap-node[data-id="${link.to}"]`);
    if (!fromEl || !toEl) return;
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const x1 = fromRect.left - canvasRect.left + fromRect.width / 2;
    const y1 = fromRect.top - canvasRect.top + fromRect.height / 2;
    const x2 = toRect.left - canvasRect.left + toRect.width / 2;
    const y2 = toRect.top - canvasRect.top + toRect.height / 2;
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
  });
}

function syncLinkButton() {
  const btn = document.getElementById('link-nodes');
  if (!btn) return;
  btn.classList.toggle('active', linkMode);
  btn.textContent = linkMode ? t('mindmap.linkNodesActive') : t('mindmap.linkNodes');
}

function setLinkMode(active) {
  if (active && !selectedNodeId) {
    linkMode = false;
    linkSourceId = null;
    syncLinkButton();
    return;
  }
  linkMode = active;
  if (linkMode) {
    linkSourceId = selectedNodeId;
  } else {
    linkSourceId = null;
  }
  syncLinkButton();
}
