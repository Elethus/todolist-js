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
  element
  /**
   * @type {string}
   */
  title
  /**
   * @type {number}
   */
  id
  /**
   * @type {boolean}
   */
  completed

  /**
   * @param {Todo} task
   */
  constructor(task) {
    this.completed = task.completed
    this.title = task.title
    this.id = task.id
    this.element = document.querySelector("#todolist-item").content.cloneNode(true).firstElementChild

    const checkbox = this.element.querySelector(".todo-check")
    const label = this.element.querySelector(".todo-title")
    const editButton = this.element.querySelector(".todo-edit")
    const removeButton = this.element.querySelector(".todo-remove")
    const editForm = this.element.querySelector("form")

    checkbox.id = `todo-${this.id}`
    if (this.completed) {
      checkbox.checked = true
      this.element.classList.add("is-completed")
    }
    label.htmlFor = `todo-${this.id}`
    label.innerText = this.title

    checkbox.addEventListener("change", (e) => { this.toggle(e) })
    editButton.addEventListener("click", (e) => { this.edit(e) })
    removeButton.addEventListener("click", () => { this.remove() })
    editForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const newTitle = new FormData(editForm).get("newTitle").trim()

      if (newTitle !== "" && newTitle !== this.title) {
        this.title = newTitle
        label.innerText = this.title

        this.element.dispatchEvent(new CustomEvent("edit", { bubbles: true }))
      }

      editForm.hidden = true
      label.hidden = false
      editButton.disabled = false
    })
  }

  /**
   * Remove current TodoListItem from the DOM
   */
  remove() {
    this.element.dispatchEvent(
      new CustomEvent("delete", { detail: this, bubbles: true })
    )
    this.element.remove()
  }

  /**
   * Toggles the state of the current TodoListItem
   * @param {Event} e
   */
  toggle(e) {
    e.preventDefault()
    const checkbox = e.currentTarget
    this.completed = !this.completed
    checkbox.checked = this.completed

    if (checkbox.checked) {
      this.element.classList.add("is-completed")
    } else {
      this.element.classList.remove("is-completed")
    }
    this.element.dispatchEvent(new CustomEvent("toggle", { bubbles: true }))
  }

  /**
   * Edits the title of the current TodoListItem
   * @param {PointerEvent} e
   */
  edit(e) {
    e.preventDefault()
    const editBtn = e.currentTarget
    const label = this.element.querySelector(".todo-title")
    const editForm = this.element.querySelector("form")
    const input = editForm.querySelector("input")

    editBtn.disabled = true
    label.hidden = true
    editForm.hidden = false

    input.focus()
    input.value = this.title
  }

  toJSON() {
    return {
      title: this.title,
      id: this.id,
      completed: this.completed
    }
  }
}

export class TodoList {
  /**
   * @type {HTMLElement}
   */
  element
  /**
   * @type {HTMLULElement}
   */
  listElement
  /**
   * @type {TodoListItem[]}
   */
  todoData = []

  /**
   * @param {Todo[]} taskList
   */
  constructor(taskList) {
    this.element = document.querySelector("#todolist-layout").content.cloneNode(true).firstElementChild
    this.listElement = this.element.querySelector(".list-group")

    for (let task of taskList) {
      const todolistItem = new TodoListItem(task)
      this.todoData.push(todolistItem)
      this.listElement.append(todolistItem.element)
    }
    this.updateLocalStorage()

    const filterButtons = this.element.querySelectorAll(".btn-filter")
    const clearButton = this.element.querySelector(".btn-clear")
    const newTaskForm = this.element.querySelector("form")

    filterButtons.forEach((button) => {
      button.addEventListener("click", (e) => this.toggleFilter(e))
    })
    clearButton.addEventListener("click", (e) => this.removeCompleted(e))
    newTaskForm.addEventListener("submit", (e) => this.addTask(e))

    this.listElement.addEventListener("delete", ({ detail: deletedTask }) => {
      this.todoData = this.todoData.filter(task => task !== deletedTask)
      this.updateLocalStorage()
    })
    this.listElement.addEventListener("toggle", () => this.updateLocalStorage())
    this.listElement.addEventListener("edit", () => this.updateLocalStorage())
  }

  /**
   * Toggle the classes on the filters and the todolist element
   * @param {PointerEvent} e
   */
  toggleFilter(e) {
    e.preventDefault()
    e.currentTarget.parentElement.querySelector(".active").classList.remove("active")
    e.currentTarget.classList.add("active")

    const filter = e.currentTarget.getAttribute("data-filter")
    switch (filter) {
      case "todo":
        this.listElement.classList.add("hide-completed")
        this.listElement.classList.remove("hide-todo")
        break
      case "done":
        this.listElement.classList.add("hide-todo")
        this.listElement.classList.remove("hide-completed")
        break
      default:
        this.listElement.classList.remove("hide-todo")
        this.listElement.classList.remove("hide-completed")
        break
    }
  }

  /**
   * Creates and add a new task from the form
   * @param {SubmitEvent} e
   */
  addTask(e) {
    e.preventDefault()
    const addTaskForm = e.currentTarget
    const taskName = new FormData(addTaskForm).get("title").trim()
    if (taskName === "") {
      return addTaskForm.reset()
    }
    const task = new TodoListItem({
      id: Date.now(),
      title: taskName,
      completed: false
    })
    this.todoData.unshift(task)
    this.listElement.prepend(task.element)
    this.updateLocalStorage()
    addTaskForm.reset()
  }

  updateLocalStorage() {
    localStorage.setItem("todolist", JSON.stringify(this.todoData))
  }

  /**
   * Remove all completed task from the DOM
   *
   * NEED FIX :
   * Calling the 'remove()' method multiple times causes the 'UpdateLocalStorage()'
   * method to repeatedly execute n times (where n is the number of items to remove),
   * which is not necessary.
   */
  removeCompleted() {
    const message = "Do you want to delete all COMPLETED tasks ?"
    if (confirm(message)) {
      this.todoData.forEach((todolistItem) => {
        if (todolistItem.completed) {
          todolistItem.remove()
        }
      })
      this.todoData = this.todoData.filter((todolistItem) => !todolistItem.completed)
    }
  }
}