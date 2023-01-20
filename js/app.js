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

  if(customer.order.length){
    viewResum()
  }else{
    viewMesaggeEntrie()
  }
 
}

function viewResum (){
  const {desk,hour}= customer

  const resum = document.querySelector("#resumen .contenido");

  const resumContainer = document.createElement("DIV");
  resumContainer.classList.add("col-md-6","card","shadow","my-3","mx-3","p-3")

  const heading = document.createElement("H3")
  heading.classList.add("fw-bold","text-center","my-4")
  heading.textContent = "Lista de pedidos"
  resumContainer.appendChild(heading)

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
  mesaResum.appendChild(mesaSpan)
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

    const subTotalLI = document.createElement("li");
    subTotalLI.classList.add("list-group-item")
    subTotalLI.textContent = `Subtotal: $${precio*cant}`

    const btnDelete = document.createElement("BUTTON");
    btnDelete.classList.add("btn","btn-danger");
    btnDelete.textContent = "Eliminar pedido"

    btnDelete.onclick = function(){
      deleteOrder(id)
    }

    const hr = document.createElement("HR");
  
    // añadir al html
    group.appendChild(nombreLI)
    group.appendChild(priceLI)
    group.appendChild(cantli)
    group.appendChild(subTotalLI)
    group.appendChild(btnDelete)
    group.appendChild(hr)

 
    resumContainer.appendChild(group)
    
  })

  //llamar propinas
  tips()
}

function clear (){
  const content = document.querySelector("#resumen .contenido")

  while(content.firstChild){
    content.removeChild(content.firstChild)
  }
}

function deleteOrder(id){
  
  const {order} = customer
  const result = order.filter(article => article.id !== id);
  customer.order = [...result]

  clear()
  if(customer.order.length){
    viewResum()
  }else{
    viewMesaggeEntrie()
  }
  
  const productDelete = `#producto-${id}`
  const inputDelete = document.querySelector(productDelete)
  inputDelete.value = 0
}

function viewMesaggeEntrie(){
  const contenidoRow = document.querySelector("#resumen .contenido")
  const p = document.createElement("P");
  p.classList.add("text-center");
  p.textContent = "Agrega los elementos del pedido"

  contenidoRow.appendChild(p);

}

// funcion para las propinas
function tips(){
  const resum = document.querySelector("#resumen .contenido");

  const divTip = document.createElement("DIV");
  divTip.classList.add("col-md-5","card","formulario","shadow","my-3","mx-3","p-3")

  const heading = document.createElement("H3")
  heading.classList.add("fw-bold","text-center","my-4")
  heading.textContent = "Propinas"

  // crear los radio para tomar el % de la propina al 10%
  const radio10 = document.createElement("INPUT");
  radio10.type = "radio";
  radio10.value = "10"
  radio10.name = "propina";
  radio10.classList.add("form-check-input")

  const radio10label = document.createElement("LABEL");
  radio10label.textContent = "10%"
  radio10label.classList.add("form-check-label");

  const radio10Div = document.createElement("DIV")
  radio10Div.classList.add("form-check")
  radio10Div.appendChild(radio10);
  radio10Div.appendChild(radio10label)
  radio10.onclick = calculateTips

   // crear los radio para tomar el % de la propina al 25%
   const radio25 = document.createElement("INPUT");
   radio25.type = "radio";
   radio25.value = "25"
   radio25.name = "propina";
   radio25.classList.add("form-check-input");
   radio25.onclick = calculateTips
 
   const radio25label = document.createElement("LABEL");
   radio25label.textContent = "25%"
   radio25label.classList.add("form-check-label");
 
   const radio25Div = document.createElement("DIV")
   radio25Div.classList.add("form-check")
   radio25Div.appendChild(radio25);
   radio25Div.appendChild(radio25label);
   radio25.onclick = calculateTips

    // crear los radio para tomar el % de la propina al 50%
    const radio50 = document.createElement("INPUT");
    radio50.type = "radio";
    radio50.value = "50"
    radio50.name = "propina";
    radio50.classList.add("form-check-input")
    radio50.onclick = calculateTips
  
    const radio50label = document.createElement("LABEL");
    radio50label.textContent = "50%"
    radio50label.classList.add("form-check-label");
  
    const radio50Div = document.createElement("DIV")
    radio50Div.classList.add("form-check")
    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50label)



  // añadirlo al div principal y al doom
  divTip.appendChild(heading)
  divTip.appendChild(radio10Div)
  divTip.appendChild(radio25Div)
  divTip.appendChild(radio50Div)

  resum.appendChild(divTip);

}


  // agregar el valor de la propina

function calculateTips(){
  const {order}= customer
  let subtotal

  order.forEach(order =>{
    subtotal = order.cant * order.precio
  })
  
  const tipValue = document.querySelector(`[name="propina"]:checked`).value;
  
  let totalTips = ((subtotal*parseInt(tipValue))/100) 
  let totalToPay = subtotal + totalTips
  viewTips(subtotal,totalTips,totalToPay)
}

function viewTips(subtotal,propina,total){
  const divTotalContainer = document.querySelector(".formulario");
  const divTotal = document.createElement("DIV");
  divTotal.classList.add("total")


  const subtotalDiv = document.createElement("P")
  subtotalDiv.textContent = "Subtotal: "
  subtotalDiv.classList.add("fw-bold","pt-3")
  const subtotalSpan = document.createElement("SPAN");
  subtotalSpan.classList.add("fw-normal")
  subtotalSpan.textContent = `$${subtotal}`
  subtotalDiv.appendChild(subtotalSpan)


  const tipDiv = document.createElement("P")
  tipDiv.textContent = "Propina: "
  tipDiv.classList.add("fw-bold",)
  const tipSpan = document.createElement("SPAN");
  tipSpan.classList.add("fw-normal")
  tipSpan.textContent = `$${propina}`
  tipDiv.appendChild(tipSpan)

  const totalDiv = document.createElement("P")
  totalDiv.textContent = "Valor a pagar: "
  totalDiv.classList.add("fw-bold",)
  const totalSpan = document.createElement("SPAN");
  totalSpan.classList.add("fw-normal")
  totalSpan.textContent = `$${total}`
  totalDiv.appendChild(totalSpan)

  const totalInfo = document.querySelector(".total")
  if (totalInfo) {
    totalInfo.remove()
  }
  divTotal.appendChild(subtotalDiv);
  divTotal.appendChild(tipDiv);
  divTotal.appendChild(totalDiv);
  
  
  divTotalContainer.appendChild(divTotal);

}