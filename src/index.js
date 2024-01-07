import "./css/base.css";
import Paradox from "penrose-paradox"

import { sayHello } from "./js/utils";
import pubsub from "penrose-paradox/src/core/pubsub";

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

  const raw = {
    tag: "section",
    options: {
      classList: "main",
      style: {
        display: tasks.length ? "block" : "none",
      },
      children: [
        {
          tag: "ul",
          options: {
            classList: "todo-list",
            children: tasks.map((task) => ListItem(task).raw),
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

function Footer(props = {}) {
  const { pluralize = () => null, count = 0 } = props

  const raw = {
    tag: "footer",
    options: {
      classList: "footer",
      style: {
        display: count ? "block" : "none",
      },
      children: [
        {
          tag: "span",
          options: {
            classList: "todo-count",
            children: [
              {
                tag: "strong",
                options: {
                  textContent: count,
                },
              },
              {
                tag: "span",
                options: {
                  textContent: ` ${pluralize("item", 0)} left`,
                },
              },
            ],
          },
        },
        {
          tag: "ul",
          options: {
            classList: "filters",
            children: [
              {
                tag: "li",
                options: {
                  children: [
                    {
                      tag: "a",
                      options: {
                        href: "#/",
                        textContent: "All",
                        classList: "selected",
                      },
                    },
                  ],
                },
              },
              {
                tag: "li",
                options: {
                  children: [
                    {
                      tag: "a",
                      options: {
                        href: "#/pending",
                        textContent: "Compleated",
                      },
                    },
                  ],
                },
              },
              {
                tag: "li",
                options: {
                  children: [
                    {
                      tag: "a",
                      options: {
                        href: "#/completed",
                        textContent: "Completed",
                      },
                    },
                  ],
                },
              },
            ],
          },
        }
      ],
    }
  }

  const element = Paradox.buildElement(raw.tag, raw.options)

  return {
    raw,
    element,
  }
}

Paradox.pubsub.subscribe("mydayapp-js:store", (data) => {
  localStorage.setItem("mydayapp-js:store", JSON.stringify(data));
});

const initialData = {
  tasks: [],
  count: 0,
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
  // if (data.tasks && data.tasks.length) data.count = data.tasks.length;

  const root = document.querySelector("#root");
  root.innerHTML = "";
  root.appendChild(Main(data).element);
  root.appendChild(Footer(data).element);

  // console.log(sayHello("Hello"));
}

function handleNewTodoChange(ev) {
  const { value:title } = ev.target;
  if (!title) return;
  const id = `${Date.now()}-${generateRandomNumber()}`;
  const todo = {
    id,
    title,
    completed: false,
  };
  const newData = setData({
    tasks: [...data?.tasks || [], todo],
    count: data?.count + 1 || 1,
  });
  Paradox.pubsub.publish("mydayapp-js:new-todo", newData);
}

const newTodo = document.querySelector("#new-todo");
newTodo.addEventListener("change", handleNewTodoChange);

Paradox.pubsub.subscribe("mydayapp-js:new-todo", (data) => {
  console.log(data);
  render(data);
});

render(data);
