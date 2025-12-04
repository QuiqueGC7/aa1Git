// API BASE URL
const API_BASE = "http://localhost:3000";

// Variables globales
let categoriaSeleccionada = null;

// ==================== CATEGORÍAS ====================

// Cargar y mostrar todas las categorías
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    const categories = await response.json();
    
    const categoryList = document.getElementById("categoryList");
    categoryList.innerHTML = ""; // Limpiar lista
    
    categories.forEach(cat => {
      const li = document.createElement("li");
      li.style.cursor = "pointer";
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      
      const span = document.createElement("span");
      span.textContent = cat.name;
      span.onclick = () => selectCategory(cat.id, cat.name);
      
      const btnDelete = document.createElement("button");
      btnDelete.textContent = "🗑️";
      btnDelete.style.marginLeft = "10px";
      btnDelete.onclick = (e) => {
        e.stopPropagation();
        deleteCategory(cat.id);
      };
      
      li.appendChild(span);
      li.appendChild(btnDelete);
      categoryList.appendChild(li);
    });
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar las categorías"
    });
  }
}

// Añadir una nueva categoría
async function addCategory() {
  const { value: categoryName } = await Swal.fire({
    title: 'Añadir categoría',
    input: 'text',
    inputLabel: 'Nombre de la categoría',
    inputPlaceholder: 'Escribe el nombre...',
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value || value.trim() === "") {
        return 'El nombre es obligatorio';
      }
    }
  });

  if (categoryName) {
    try {
      const response = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName.trim() })
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Categoría añadida',
          text: `Se añadió "${categoryName}" correctamente`
        });
        loadCategories();
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo añadir la categoría"
      });
    }
  }
}

// Eliminar una categoría
async function deleteCategory(id) {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Se eliminarán también todos los sites de esta categoría",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`${API_BASE}/categories/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Eliminada",
          text: "La categoría ha sido eliminada"
        });
        loadCategories();
        // Si era la categoría seleccionada, limpiar la vista de sites
        if (categoriaSeleccionada === id) {
          categoriaSeleccionada = null;
          document.getElementById("siteList").innerHTML = "";
        }
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar la categoría"
      });
    }
  }
}

// Seleccionar una categoría y mostrar sus sites
async function selectCategory(categoryId, categoryName) {
  categoriaSeleccionada = categoryId;
  
  // Resaltar la categoría seleccionada
  const allLi = document.querySelectorAll("#categoryList li");
  allLi.forEach(li => li.style.backgroundColor = "#ecf0f1");
  event.target.closest("li").style.backgroundColor = "#bdc3c7";
  
  // Actualizar el título de la sección de sites
  document.querySelector("#sites h2").textContent = `Sites - ${categoryName}`;
  
  // Cargar los sites de esta categoría
  loadSitesForCategory(categoryId);
}

// ==================== SITES ====================

// Cargar y mostrar sites de una categoría
async function loadSitesForCategory(categoryId) {
  try {
    const response = await fetch(`${API_BASE}/categories/${categoryId}`);
    const category = await response.json();
    
    const siteList = document.getElementById("siteList");
    siteList.innerHTML = ""; // Limpiar tabla
    
    if (category.sites && category.sites.length > 0) {
      category.sites.forEach(site => {
        const tr = document.createElement("tr");
        
        const tdName = document.createElement("td");
        tdName.textContent = site.name;
        
        const tdUser = document.createElement("td");
        tdUser.textContent = site.user;
        
        const tdDate = document.createElement("td");
        const date = new Date(site.createdAt);
        tdDate.textContent = date.toLocaleDateString('es-ES');
        
        const tdActions = document.createElement("td");
        
        const btnView = document.createElement("button");
        btnView.textContent = "👁️";
        btnView.style.marginRight = "5px";
        btnView.onclick = () => viewSite(site);
        
        const btnEdit = document.createElement("button");
        btnEdit.textContent = "✏️";
        btnEdit.style.marginRight = "5px";
        btnEdit.onclick = () => editSite(site);
        
        const btnDelete = document.createElement("button");
        btnDelete.textContent = "🗑️";
        btnDelete.onclick = () => deleteSite(site.id);
        
        tdActions.appendChild(btnView);
        tdActions.appendChild(btnEdit);
        tdActions.appendChild(btnDelete);
        
        tr.appendChild(tdName);
        tr.appendChild(tdUser);
        tr.appendChild(tdDate);
        tr.appendChild(tdActions);
        
        siteList.appendChild(tr);
      });
    } else {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No hay sites en esta categoría";
      td.style.textAlign = "center";
      tr.appendChild(td);
      siteList.appendChild(tr);
    }
  } catch (error) {
    console.error("Error al cargar sites:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar los sites"
    });
  }
}

// Añadir un nuevo site
async function addSite() {
  if (!categoriaSeleccionada) {
    Swal.fire({
      icon: "warning",
      title: "Atención",
      text: "Primero selecciona una categoría"
    });
    return;
  }

  const { value: formValues } = await Swal.fire({
    title: 'Añadir Site',
    html:
      '<input id="swal-name" class="swal2-input" placeholder="Nombre del sitio *">' +
      '<input id="swal-url" class="swal2-input" placeholder="URL (opcional)">' +
      '<input id="swal-user" class="swal2-input" placeholder="Usuario *">' +
      '<input id="swal-password" type="password" class="swal2-input" placeholder="Contraseña *">' +
      '<textarea id="swal-description" class="swal2-textarea" placeholder="Descripción (opcional)"></textarea>',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const name = document.getElementById('swal-name').value;
      const url = document.getElementById('swal-url').value;
      const user = document.getElementById('swal-user').value;
      const password = document.getElementById('swal-password').value;
      const description = document.getElementById('swal-description').value;

      if (!name || !user || !password) {
        Swal.showValidationMessage('Los campos Nombre, Usuario y Contraseña son obligatorios');
        return false;
      }

      return { name, url, user, password, description };
    }
  });

  if (formValues) {
    try {
      const response = await fetch(`${API_BASE}/categories/${categoriaSeleccionada}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Site añadido',
          text: 'El site se ha guardado correctamente'
        });
        loadSitesForCategory(categoriaSeleccionada);
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo añadir el site"
      });
    }
  }
}

// Ver detalles de un site
function viewSite(site) {
  Swal.fire({
    title: site.name,
    html: `
      <div style="text-align: left;">
        <p><strong>URL:</strong> ${site.url || 'No especificada'}</p>
        <p><strong>Usuario:</strong> ${site.user}</p>
        <p><strong>Contraseña:</strong> ${site.password}</p>
        <p><strong>Descripción:</strong> ${site.description || 'Sin descripción'}</p>
        <p><strong>Creado:</strong> ${new Date(site.createdAt).toLocaleString('es-ES')}</p>
        <p><strong>Actualizado:</strong> ${new Date(site.updatedAt).toLocaleString('es-ES')}</p>
      </div>
    `,
    confirmButtonText: 'Cerrar'
  });
}

// Editar un site
async function editSite(site) {
  const { value: formValues } = await Swal.fire({
    title: 'Editar Site',
    html:
      `<input id="swal-name" class="swal2-input" placeholder="Nombre del sitio *" value="${site.name}">` +
      `<input id="swal-url" class="swal2-input" placeholder="URL" value="${site.url || ''}">` +
      `<input id="swal-user" class="swal2-input" placeholder="Usuario *" value="${site.user}">` +
      `<input id="swal-password" type="password" class="swal2-input" placeholder="Contraseña *" value="${site.password}">` +
      `<textarea id="swal-description" class="swal2-textarea" placeholder="Descripción">${site.description || ''}</textarea>`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const name = document.getElementById('swal-name').value;
      const url = document.getElementById('swal-url').value;
      const user = document.getElementById('swal-user').value;
      const password = document.getElementById('swal-password').value;
      const description = document.getElementById('swal-description').value;

      if (!name || !user || !password) {
        Swal.showValidationMessage('Los campos Nombre, Usuario y Contraseña son obligatorios');
        return false;
      }

      return { name, url, user, password, description };
    }
  });

  if (formValues) {
    try {
      const response = await fetch(`${API_BASE}/sites/${site.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Site actualizado',
          text: 'Los cambios se han guardado correctamente'
        });
        loadSitesForCategory(categoriaSeleccionada);
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el site"
      });
    }
  }
}

// Eliminar un site
async function deleteSite(id) {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`${API_BASE}/sites/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El site ha sido eliminado"
        });
        loadSitesForCategory(categoriaSeleccionada);
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el site"
      });
    }
  }
}

// ==================== EVENT LISTENERS ====================

document.addEventListener("DOMContentLoaded", () => {
  // Cargar categorías al iniciar
  loadCategories();
  
  // Botón añadir categoría
  document.getElementById("addCategoryBtn").addEventListener("click", addCategory);
  
  // Botón añadir site
  document.getElementById("addSiteBtn").addEventListener("click", addSite);
});