const React = {
  createElement(...args) {
    const [tagName, props, ...children] = args;
    console.log(children);

    const newElement = document.createElement(tagName);

    for (const prop in props) {
      newElement.setAttribute(prop, props[prop]);
    }

    for (const child of children) {
      if (typeof child === "string" || typeof child === "number") {
        const textNode = document.createTextNode(child);
        newElement.appendChild(textNode);
      } else {
        newElement.appendChild(child);
      }
    }

    return newElement;
  },
};

const element = (
  <div id="foo">
    <a>bar</a>
    <b />
    <p>hello world</p>
  </div>
);
const container = document.getElementById("root");
// ReactDOM.render(element, container);
container.appendChild(element);
