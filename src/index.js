import "./css/base.css";
import Paradox from "penrose-paradox"

import { sayHello } from "./js/utils";

function Main() {
  const raw = {
    tag: "section",
    options: {
      classList: "main",
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

console.log(sayHello("Hello"));
