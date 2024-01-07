import "./css/base.css";

import Paradox from "penrose-paradox"

function ListItem(props = {}) {
  const { id, title, completed } = props

  function handleToggle(ev) {
    const { checked } = ev.target;
    const newData = setData({
      tasks: data.tasks.map((task) => {
        if (task.id === id) {
          task.completed = checked;
        }
        return task;
      }),
    });
    Paradox.pubsub.publish("mydayapp-js:new-todo", newData);
  }

  function handleRemove() {
    const newData = setData({
      tasks: data.tasks.filter((task) => task.id !== id),
      count: data.count - 1,
    });
    Paradox.pubsub.publish("mydayapp-js:new-todo", newData);
  }

  const raw = {
    tag: "li",
    options: {
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

  const element = Paradox.buildElement(raw.tag, raw.options)

  return {
    raw,
    element,
  }
}

function Main(props = {}) {
  const { tasks = [] } = props
  const main = document.querySelector("#main");
  if (!tasks.length) {
    main.style.display = "none";
    return;
  }

  const list = main.querySelector("ul");
  list.innerHTML = "";
  tasks.forEach((task) => {
    const item = ListItem(task).element;
    list.appendChild(item);
  });
}

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

Paradox.pubsub.subscribe("mydayapp-js:store", (data) => {
  localStorage.setItem("mydayapp-js:store", JSON.stringify(data));
});


function pluralize(word, count) {
  return count === 1 ? word : `${word}s`;
}

const initialData = {
  tasks: [],
  count: 0,
  route: "#/",
};

const data = JSON.parse(localStorage.getItem("mydayapp-js:store")) || initialData;
function setData(newData = {}) {
  Object.assign(data, newData)
  Paradox.pubsub.publish("mydayapp-js:store", data);
  return data
}

function generateRandomNumber() {
  let randomNumber = "" + Math.floor(Math.random() * 9 + 1);
  for (let i = 0; i < 15; i++) {
      randomNumber += Math.floor(Math.random() * 10);
  }
  return Number(randomNumber);
}

function render(data) {
  location.href = data.route;
  data.pluralize = pluralize;

  Main(data)
  Footer(data)
}

function handleNewTodoChange(ev) {
  const { target: { value:title }, key } = ev;
  if (key !== "Enter") return;
  if (!title) return;
  const id = `${Date.now()}-${generateRandomNumber()}`;
  const todo = {
    id,
    title: title.trim(),
    completed: false,
    hidden: false,
  };
  const newData = setData({
    tasks: [...data?.tasks || [], todo],
    count: data?.count + 1 || 1,
  });
  Paradox.pubsub.publish("mydayapp-js:new-todo", newData);
  ev.target.value = "";
}

const newTodo = document.querySelector("#new-todo");
newTodo.addEventListener("keyup", handleNewTodoChange);

Paradox.pubsub.subscribe("mydayapp-js:new-todo", (data) => {
  console.log(data);
  render(data);
});

render(data);
