const React = {
  createElement(...args) {
    const [tagName, props, children] = args;

    const newElement = document.createElement(tagName);

    for (const prop in props) {
      newElement.setAttribute(prop, props[prop]);
    }

    if (typeof children === "string" || typeof children === "number") {
      const textNode = document.createTextNode(children);
      newElement.appendChild(textNode);
    } else {
      newElement.appendChild(children);
    }

    return newElement;
  },
};

const element = <h1 title="foo">Hello</h1>;
const container = document.getElementById("root");
// ReactDOM.render(element, container);
container.appendChild(element);
