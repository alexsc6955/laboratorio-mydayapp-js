import "./css/base.css";
import Paradox from "penrose-paradox"

import { sayHello } from "./js/utils";

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
            classList: "main__list",
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

const root = document.querySelector("#root");
root.innerHTML = "";
root.appendChild(Main().element);
root.appendChild(Footer().element);

const data = []
function setData(newData = {}) {
  data.push(newData)
  console.log(data)
  return data
}

function generateRandomNumber() {
  let randomNumber = "" + Math.floor(Math.random() * 9 + 1);
  for (let i = 0; i < 15; i++) {
      randomNumber += Math.floor(Math.random() * 10);
  }
  return Number(randomNumber);
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
  const data = setData(todo);
}

const newTodo = document.querySelector("#new-todo");
newTodo.addEventListener("change", handleNewTodoChange);

console.log(sayHello("Hello"));
