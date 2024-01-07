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

console.log(sayHello("Hello"));
