//Botón eliminar
const btnEliminar = document.getElementsByClassName("CatEliminar");

  let array = [];
  array.forEach(element => {
    element.addEventListener("click", () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success"
        });
      }
    });
  });
  });  
    
//Botón Añadir

const btnAgregar = document.getElementById("addCategoryBtn").addEventListener("click", () => {
  Swal.fire({
    title: 'Añadir categoría',
    input: 'text',
    inputLabel: 'Nombre de la categoría',
    inputPlaceholder: 'Escribe el nombre...',
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    preConfirm: (value) => {
      if (!value) {
        Swal.showValidationMessage('Debes escribir un nombre');
        return false;
      }
      return value;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      addCategory(result.value);
      loadCategories();

      Swal.fire({
        icon: 'success',
        title: 'Categoría añadida',
        text: `Se añadió "${result.value}" correctamente`
      });
    }
  });
});

  



//Datos
let drawData = (data) => {
    data.forEach(category => {
      let parent = document.getElementsByTagName('ul')[0]
      let child = document.createElement('li')
      child.id = 'lista';
      let btn = document.createElement('button')
      btn.innerText = '🗑️';
      btn.classList.add = 'CatEliminar';


      // child.innerText = JSON.stringify(category)
      child.innerText = category.name + ' '
      parent.appendChild(child)
      child.appendChild(btn)
      
    })
  }

  fetch("http://localhost:3000/categories")
    .then(res => res.json())
    .then(data => drawData(data))

//Cargar
    async function loadCategories() {
    const response = await fetch("http://localhost:3000/categories");
    const categories = await response.json();
  
    categories.forEach(cat => {
      const li = document.createElement("li");
      li.textContent = cat.name;
      const btn = document.createElement('button')
      app.post('/categories', add)
    });
  }
  
//Añadir
async function addCategory(categoria) {
    const categoryName = categoria;
  
    if (!categoryName || categoryName.trim() === "") {
      Swal.fire({text:"El nombre de la categoría es obligatorio."});
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3000/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName })
      });
  
      if (response.ok) {
        Swal.fire({text:"Categoría añadida correctamente."});
        loadCategories();
      } else {
        Swal.fire({text:"Error al añadir la categoría."});
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({text:"No se pudo conectar con el servidor."});
    }
  }
  

//Eliminar
async function deleteCategory(id) {
    const response = await fetch(`http://localhost:3000/categories/${id}`, {
        method: "DELETE"
    });
    
    if (response.ok) {
        Swal.fire({text:"Categoría eliminada."});
        loadCategories();
    } else {
        Swal.fire({text:"Error al eliminar la categoría."});
    }
    }

  