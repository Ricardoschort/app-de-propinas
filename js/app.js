let customer= {
  desk: "",
  hour: "",
  order:[]

}

//objeto para las categorias 
const categoryObj = {
  1:"Comida",
  2:"Bebidas",
  3:"Postres"
}


const form = document.querySelector("#form")
const btnSave = document.querySelector("#guardar");
btnSave.addEventListener("click",validate);

function validate(){
  const desk = document.querySelector("#mesa").value;
  const hour = document.querySelector("#hora").value;
  
  const validateField = [desk,hour].some(field => field ==="");

  if(validateField ){

    const isAlert = document.querySelector(".invalid-feedback");
      if(!isAlert){
        const alertNote = document.createElement("DIV");
        alertNote.classList.add("invalid-feedback","d-block","text-center","mt-4")
        alertNote.textContent = "Todos los campos son obligatorios"
        document.querySelector(".modal-body").appendChild(alertNote)
    
        setTimeout(() => {
          alertNote.remove()
        }, 2500);
      }
    return
  }
  customer = {...customer,desk,hour};
  
  const modalForm = document.querySelector("#idModal");
  const modalBootstrap = bootstrap.Modal.getInstance(modalForm);
  modalBootstrap.hide()
  form.reset() 
  

  viewSection()
  consultingAPI()


}

function viewSection(){
  const sections = document.querySelectorAll(".d-none");
  sections.forEach(section => section.classList.remove("d-none"))
}

function consultingAPI(){
  const url = "http://localhost:4000/platillos"

  fetch(url)
    .then( respons => respons.json())
    .then (result => viewReport(result))
    .catch(err =>console.log(err))
}

// creacion del reporte para los alimentos
function viewReport(report){

  const divPlatillos = document.querySelector("#platillos .contenido");

  report.forEach(order => {
   const {nombre,precio,categoria, id} = order
   const divRow = document.createElement("DIV")
   divRow.classList.add("row","my-4","py-2","border-top");

   const name = document.createElement("DIV");
   name.classList.add("col-md-3");
   name.textContent = nombre;
   divRow.appendChild(name);

   const price = document.createElement("DIV");
   price.classList.add("col-md-3");
   price.textContent = `$${precio}`;
   divRow.appendChild(price);

   const category = document.createElement("DIV");
   category.classList.add("col-md-4");
   category.textContent = categoryObj[categoria];
   divRow.appendChild(category);

   const cantInput = document.createElement("INPUT");
   cantInput.type = "number";
   cantInput.min = 0
   cantInput.value = 0
   cantInput.id = `producto-${id}`
   cantInput.classList.add("form-control");
   
   // evento 
   cantInput.onchange = function(){
      let cant = parseInt(cantInput.value)
      changeCant({...order,cant})
   }

   const cantDiv = document.createElement("DIV");
   cantDiv.classList.add("col-md-2");
   cantDiv.appendChild(cantInput);
   divRow.appendChild(cantDiv)

   divPlatillos.appendChild(divRow);

  });
}

function changeCant(orders){
  let { order } = customer;

  if(orders.cant > 0){
    if(order.some(article => article.id === orders.id)){
     
      //actualizar la cantidad
      const newOrder = order.map(article =>{
        if (article.id === orders.id) {
            article.cant = orders.cant
        }
        return article;
        
      })
      customer.order = [...newOrder];
    }else{
      customer.order = [...order,orders]

    }

  }else{
    // eliminar si es 0 en el arreglo

    const result = order.filter(article => article.id !==orders.id);
    customer.order = [...result]
  }

  clear()
  viewResum()

 
 
}

function viewResum (){
  const {desk,hour}= customer

  const resum = document.querySelector("#resumen .contenido");

  const resumContainer = document.createElement("DIV");
  resumContainer.classList.add("col-md-6","card","shadow","my-3","mx-3","p-3")

  //crear html de la mesa
  const mesaResum = document.createElement("P")
  mesaResum.textContent = "Mesa: "
  mesaResum.classList.add("fw-bold")
  const mesaSpan = document.createElement("SPAN");
  mesaSpan.classList.add("fw-normal")
  mesaSpan.textContent = desk
    //crear html de la hora
  const houResume = document.createElement("P")
  houResume.textContent = "Hora: "
  houResume.classList.add("fw-bold")
  const hourResume = document.createElement("SPAN");
  hourResume.classList.add("fw-normal")
  hourResume.textContent = hour
  
  //añadirlos a sus respectivos container
  houResume.appendChild(hourResume)
  mesaResum.appendChild(houResume)
  resumContainer.appendChild(mesaResum)
  resum.appendChild(resumContainer)

  // crear la lista de los articulos consumidos por la mesa
  
  const group = document.createElement("UL");
  group.classList.add("list-group");

  const {order} = customer
   order.filter(order =>{
    const {nombre,precio, id,cant} = order

    const nombreLI = document.createElement("li");
    nombreLI.classList.add("list-group-item")
    nombreLI.textContent = nombre

    const priceLI = document.createElement("li");
    priceLI.classList.add("list-group-item")
    priceLI.textContent = `Precio: $${precio}`

    const cantli = document.createElement("li");
    cantli.classList.add("list-group-item")
    cantli.textContent = `Cantidad: $${cant}`

    const hr = document.createElement("HR")
  



    // añadir al html
    group.appendChild(nombreLI)
    group.appendChild(priceLI)
    group.appendChild(cantli)
    group.appendChild(hr)

 
    resumContainer.appendChild(group)
    
  })

}

function clear (){
  const content = document.querySelector("#resumen .contenido")

  while(content.firstChild){
    content.removeChild(content.firstChild)
  }
}