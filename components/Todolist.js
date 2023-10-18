/**
 * @typedef {object} Todo
 * @property {string} title
 * @property {boolean} completed
 * @property {number} id
 */

class TodoListItem {
  /**
   * @type {HTMLLIElement}
   */
  #element
  /**
   * @type {string}
   */
  #title
  /**
   * @type {number}
   */
  #id
  /**
   * @type {boolean}
   */
  #completed

  /**
   * @param {Todo} task
   */
  constructor(task) {
    this.#completed = task.completed
    this.#title = task.title
    this.#id = task.id

    const todoItemTemplate = document.getElementById("todolist-item").content.cloneNode(true)
    this.#element = todoItemTemplate.firstElementChild

    const checkbox = this.#element.querySelector("input[type=checkbox]")
    checkbox.setAttribute("id", `todo-${this.#id}`)
    if (this.#completed) {
      checkbox.checked = true
      this.#element.classList.add("is-completed")
    }
    const label = this.#element.querySelector("label")
    label.setAttribute("for", `todo-${this.#id}`)
    label.innerText = this.#title

    this.#element.querySelector(".todo-edit").addEventListener("click", (e) => {
      e.preventDefault()
      this.edit(e)
    })
    this.#element.querySelector(".todo-remove").addEventListener("click", (e) => {
      e.preventDefault()
      this.remove()
    })
    checkbox.addEventListener("change", (e) => {
      e.preventDefault()
      this.toggle()
    })
  }

  get element() {
    return this.#element
  }

  get title() {
    return this.#title
  }

  get id() {
    return this.#id
  }

  get completed() {
    return this.#completed
  }

  /**
   * Remove current TodoListItem from the DOM
   */
  remove() {
    this.#element.dispatchEvent(
      new CustomEvent("delete", { detail: this, bubbles: true })
    )
    this.#element.remove()
  }

  toggle() {
    const checkbox = this.#element.querySelector("input[type=checkbox]")
    this.#completed = !this.#completed
    checkbox.checked = this.#completed

    if (checkbox.checked) {
      this.#element.classList.add("is-completed")
    } else {
      this.#element.classList.remove("is-completed")
    }
    this.#element.dispatchEvent(
      new CustomEvent("toggle", { bubbles: true })
    )
  }

  edit(e) {
    const editBtn = e.currentTarget
    editBtn.disabled = true

    const label = this.#element.querySelector("label")
    label.setAttribute("hidden", "")

    const editForm = this.#element.querySelector("form")
    editForm.removeAttribute("hidden")

    const input = editForm.querySelector("input")
    input.focus()
    input.value = this.#title

    editForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const newTitle = new FormData(editForm).get("title").trim()

      if (newTitle !== "") {
        this.#title = newTitle
        label.innerText = this.#title

        this.#element.dispatchEvent(
          new CustomEvent("edit", { bubbles: true })
        )
      }

      editForm.setAttribute("hidden", "")
      label.removeAttribute("hidden")
      editBtn.disabled = false
    })
  }

  toJSON() {
    return {
      title: this.#title,
      id: this.#id,
      completed: this.#completed
    }
  }
}

export class TodoList {
  /**
   * @type {HTMLElement}
   */
  #element
  /**
   * @type {HTMLULElement}
   */
  #listElement
  /**
   * @type {TodoListItem[]}
   */
  #todolist = []

  /**
   * @param {Todo[]} taskList
   */
  constructor(taskList) {
    const todoListTemplate = document.getElementById("todolist-layout").content.cloneNode(true)
    this.#element = todoListTemplate.firstElementChild
    this.#listElement = this.#element.querySelector(".list-group")

    for (let task of taskList) {
      const todolistItem = new TodoListItem(task)
      this.#todolist.push(todolistItem)
      this.#listElement.append(todolistItem.element)
    }

    this.#element.querySelectorAll(".btn-filter")
      .forEach((button) => {
        button.addEventListener("click", (e) => this.#toggleFilter(e))
      })

    this.#element.querySelector(".btn-clear")
      .addEventListener("click", () => this.clearCompleted())

    this.#element.querySelector("form")
      .addEventListener("submit", (e) => this.#onSubmit(e))

    this.#listElement
      .addEventListener("delete", ({ detail: deletedTask }) => {
        this.#todolist = this.#todolist.filter(task => task !== deletedTask)
        this.#onUpdate()
      })

    this.#listElement.addEventListener("toggle", () => this.#onUpdate())
    this.#listElement.addEventListener("edit", () => this.#onUpdate())
  }

  get element() {
    return this.#element
  }

  get listElement() {
    return this.#listElement
  }

  /**
   * @param {PointerEvent} e
   */
  #toggleFilter(e) {
    e.preventDefault()
    e.currentTarget.parentElement.querySelector(".active").classList.remove("active")
    e.currentTarget.classList.add("active")

    const filter = e.currentTarget.getAttribute("data-filter")
    if (filter === "todo") {
      this.#listElement.classList.add("hide-completed")
      this.#listElement.classList.remove("hide-todo")
    } else if (filter === "done") {
      this.#listElement.classList.add("hide-todo")
      this.#listElement.classList.remove("hide-completed")
    } else {
      this.#listElement.classList.remove("hide-todo")
      this.#listElement.classList.remove("hide-completed")
    }
  }

  /**
   * @param {SubmitEvent} e
   */
  #onSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const taskName = new FormData(form).get("title").trim()
    if (taskName === "") {
      return form.reset()
    }
    const todolistItem = new TodoListItem({
      id: Date.now(),
      title: taskName,
      completed: false
    })
    this.#todolist.unshift(todolistItem)
    this.#listElement.prepend(todolistItem.element)
    this.#onUpdate()
    form.reset()
  }

  #onUpdate() {
    localStorage.setItem("todolist", JSON.stringify(this.#todolist))
  }

  clearCompleted() {
    const message = "Do you want to delete all COMPLETED tasks ?"
    if (confirm(message)) {
      this.#todolist.forEach((todolistItem) => {
        if (todolistItem.completed) {
          todolistItem.remove()
        }
      })
      this.#todolist = this.#todolist.filter((todolistItem) => !todolistItem.completed)
    }
  }
}