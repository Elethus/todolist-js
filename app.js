import { fetchJSON } from "./functions/api.js"
import { TodoList } from "./components/Todolist.js";
import { createElement } from "./functions/dom.js";


try {
  const loader = document.getElementById("loader-layout").content.cloneNode(true)
  document.body.prepend(loader)

  const todoData = (localStorage.getItem("todolist"))
    ? JSON.parse(localStorage.getItem("todolist").toString())
    : await fetchJSON("https://jsonplaceholder.typicode.com/todos?_limit=10&_delay=1500") // added a delay to see the loader

  const todoList = new TodoList(todoData)
  document.body.prepend(todoList.element)
}
catch (error) {
  const alertElement = createElement("div", {
    class: "container pt-4"
  })
  alertElement.innerHTML = `<div class="alert alert-danger" role="alert">${error}</div>`

  document.body.prepend(alertElement)
  console.error(error)
}
finally {
  document.getElementById("loader").remove()
}
