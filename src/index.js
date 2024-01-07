import "./css/base.css";

import Paradox from "penrose-paradox"

// List item component
function ListItem(props = {}) {
  const { id, title, completed } = props

  // Toggle completed handler
  function handleToggle(ev) {
    const { checked } = ev.target;
    // Update data changing completed and status
    const newData = setData({
      tasks: data.tasks.map((task) => {
        if (task.id === id) {
          task.completed = checked;
          task.status = checked ? "" : "pending";
        }
        return task;
      }),
    });
    Paradox.pubsub.publish("mydayapp-js:new-todo", newData); // Publish new data
  }

  // Remove handler
  function handleRemove() {
    // Update data removing task and decreasing count
    const newData = setData({
      tasks: data.tasks.filter((task) => task.id !== id),
      count: data.count - 1,
    });
    Paradox.pubsub.publish("mydayapp-js:new-todo", newData); // Publish new data
  }

  function quitEditingMode(item) {
    item.classList.remove("editing");

    const list = item.closest("ul").querySelectorAll("li");
    list.forEach((li) => {
      li.style.display = "block";
    });
  }

  function editingMode(item) {
    item.classList.add("editing");

    const list = item.closest("ul").querySelectorAll("li");
    list.forEach((li) => {
      if (li !== item) {
        li.style.display = "none";
      }
    });

    function handleQuitEditing(ev) {
      console.log("handleQuitEditing");
      const { key } = ev;
      if (key === "Escape") {
        quitEditingMode(item);
        document.removeEventListener("keyup", handleQuitEditing);
      }
    }
    document.addEventListener("keyup", handleQuitEditing);

    function handleEdit(ev) {
      console.log("handleEdit");
      const { key, target } = ev;
      if (key !== "Enter") return;

      const { value: title } = target;
      const { id } = item;

      // Update data changing title
      const newData = setData({
        tasks: data.tasks.map((task) => {
          console.log(task.id, id);
          if (task.id === id) {
            task.title = title;
          }
          return task;
        }),
      });
      quitEditingMode(item);
      Paradox.pubsub.publish("mydayapp-js:new-todo", newData); // Publish new data
    }
    const input = item.querySelector(".edit");
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    input.addEventListener("keyup", handleEdit);
  }

  function handleToggleEdit(ev) {
    const { target } = ev;
    const li = target.closest("li");
    editingMode(li);
  }

  // Prepare raw element tree for Paradox
  const raw = {
    tag: "li",
    options: {
      id: id,
      classList: completed ? "completed" : "",
      style: {
        display: props.hidden ? "none" : "block",
      },
      children: [
        {
          tag: "div",
          options: {
            classList: "view",
            children: [
              {
                tag: "input",
                options: {
                  classList: "toggle",
                  events: {
                    change: handleToggle,
                  },
                  attributes: {
                    type: "checkbox",
                    checked: completed,
                  },
                },
              },
              {
                tag: "label",
                options: {
                  events: {
                    click: handleToggleEdit,
                  },
                  text: title,
                },
              },
              {
                tag: "button",
                options: {
                  classList: "destroy",
                  events: {
                    click: handleRemove,
                  },
                },
              },
            ],
          },
        },
        {
          tag: "input",
          options: {
            classList: "edit",
            attributes: {
              value: title,
            },
          },
        },
      ],
    }
  }

  // Build element with Paradox
  const element = Paradox.buildElement(raw.tag, raw.options)

  return {
    raw,
    element,
  }
}

// Main component
function Main(props = {}) {
  const { tasks = [] } = props

  const main = document.querySelector("#main"); // get main element
  // hide main if there are no tasks
  if (!tasks.length) {
    main.style.display = "none";
    return;
  }

  main.style.display = "block"; // show main (in case it was hidden before)

  // get list element and clear it
  const list = main.querySelector("ul");
  list.innerHTML = "";

  // add tasks to list
  tasks.forEach((task) => {
    const item = ListItem(task).element;
    list.appendChild(item);
  });
}

// Footer component
function Footer(props = {}) {
  const { pluralize = () => null, count = 0, route = "#/" } = props

  function handleFilter(ev) {
    const { href } = ev.target;
    const newData = setData({
      route: href,
    });
    const changedTasks = newData.tasks.map((task) => {
      if (href.includes("#/pending")) {
        task.hidden = task.completed;
      } else if (href.includes("#/completed")) {
        task.hidden = !task.completed;
      } else {
        task.hidden = false;
      }
      console.log(task);
      return task;
    });
    const finaleData = setData({
      tasks: changedTasks,
    });
    Paradox.pubsub.publish("mydayapp-js:new-todo", finaleData);
  }

  const footer = document.querySelector("#footer");
  if (!count) {
    footer.style.display = "none";
    return;
  }

  footer.style.display = "block";

  const counter = footer.querySelector(".todo-count");
  counter.innerHTML = "";
  counter.appendChild(
    Paradox.buildElement("strong", {
      text: count,
    })
  );
  counter.appendChild(
    Paradox.buildElement("span", {
      text: ` ${pluralize("item", count)} left`,
    })
  );
  const links = footer.querySelectorAll("a");
  links.forEach((link) => {
    link.classList.remove("selected");
    if (link.href === route) {
      link.classList.add("selected");
    }
    link.addEventListener("click", handleFilter);
  });

  function handleClearCompleted() {
    const newData = setData({
      tasks: data.tasks.filter((task) => !task.completed),
      count: data.tasks.filter((task) => !task.completed).length,
    });
    Paradox.pubsub.publish("mydayapp-js:new-todo", newData);
  }
  const clearCompleted = footer.querySelector(".clear-completed");
  clearCompleted.style.display = data.tasks.some((task) => task.completed)
    ? "block"
    : "none";
  clearCompleted.addEventListener("click", handleClearCompleted);
}

// pluralize function
function pluralize(word, count) {
  return count === 1 ? word : `${word}s`; // add s if count is greater than 1
}

// generate random number
function generateRandomNumber() {
  let randomNumber = "" + Math.floor(Math.random() * 9 + 1);
  for (let i = 0; i < 15; i++) {
      randomNumber += Math.floor(Math.random() * 10);
  }
  return Number(randomNumber);
}

// render function
function render(data) {
  location.href = data.route;
  data.pluralize = pluralize;

  Main(data)
  Footer(data)
}

// storage subscription that saves data to localStorage
Paradox.pubsub.subscribe("mydayapp-js:store", (data) => {
  localStorage.setItem("mydayapp-js:store", JSON.stringify(data));
});

// initial data
const initialData = {
  tasks: [],
  count: 0,
  route: "#/",
};

// get data from localStorage or use initial data
const data = JSON.parse(localStorage.getItem("mydayapp-js:store")) || initialData;

// set data
function setData(newData = {}) {
  Object.assign(data, newData) // merge data
  Paradox.pubsub.publish("mydayapp-js:store", data); // publish data for storage
  return data
}

// create todo handler
function handleCreateTodo(ev) {
  const { target: { value:title }, key } = ev;

  // Validation
  if (key !== "Enter") return;
  if (!title) return;
  if (typeof title !== "string") return;

  // Create todo
  const todo = {
    id: `${Date.now()}-${generateRandomNumber()}`, // unique id
    title: title.trim(), // remove spaces
    completed: false,
    hidden: false,
    status: "pending",
  };
  // Update data
  const newData = setData({
    tasks: [...data?.tasks || [], todo],
    count: data?.count + 1 || 1,
  });

  // Publish data
  Paradox.pubsub.publish("mydayapp-js:new-todo", newData);
  ev.target.value = ""; // clear input
}

// select new todo input and add event listener
const newTodo = document.querySelector("#new-todo");
document.addEventListener("keyup", handleCreateTodo);

// subscribe to new todo event that renders the app
Paradox.pubsub.subscribe("mydayapp-js:new-todo", (data) => {
  render(data);
});

render(data); // render app
