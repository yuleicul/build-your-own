const React = {
  createElement(...args) {
    const [tagName, props, ...children] = args;
    return {
      type: tagName,
      props: {
        ...props,
        children,
      },
    };
  },
};

/**
 * Fiber {
 *   dom, // only this property is dom!
 *   type,
 *   props {
 *     children
 *   },
 *   child,
 *   nextSibling,
 *   parent
 * }
 *
 * Virtual Dom is inside Fiber.
 */

const ReactDOM = {
  TEXT_OR_NUMBER: "TEXT_OR_NUMBER",
  isEvent(prop) {
    return prop.startsWith("on");
  },
  // virtualDom is inside fiber
  createDom(fiber) {
    const { type, props } = fiber;

    if (type === ReactDOM.TEXT_OR_NUMBER) {
      return document.createTextNode(fiber.props);
    } else {
      const element = document.createElement(type);

      for (const prop in props) {
        if (prop !== "children") {
          if (ReactDOM.isEvent(prop)) {
            element.addEventListener(prop.slice(2).toLowerCase(), props[prop]);
          } else {
            element.setAttribute(prop, props[prop]);
          }
        }
      }
      return element;
    }
  },

  /**
   * unitOfWork = fiber = {
   *    dom,
   *    type,
   *    props: { children },
   *    parent,
   *    nextSibling
   * }
   *
   * What does this function do?
   * 1. render the current dom
   * 2. prepare the next run fiber and return it
   *
   * The main logic inside performUnitWork is to transform Virtual Dom to Fiber, and construct the Fiber Tree. Just add some `point`s, take it easy
   * (but I'm not sure if it's called virtual dom)
   */
  performUnitOfWork(fiber) {
    console.log(fiber);
    if (!fiber.dom) fiber.dom = this.createDom(fiber);

    // main task: render the current child to parent!
    if (fiber.parent) fiber.parent.dom.appendChild(fiber.dom);

    // prepare for the next run:
    // main task is to link all children one by one, at the same time link them to the same parent
    let firstChild;
    const children = fiber.props.children;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        if (
          typeof children[i] === "string" ||
          typeof children[i] === "number"
        ) {
          const temp = children[i];
          children[i] = {
            type: ReactDOM.TEXT_OR_NUMBER,
            props: temp,
          };
        }

        if (i === 0) firstChild = children[i];

        children[i].parent = fiber;

        if (i - 1 >= 0) {
          children[i - 1].nextSibling = children[i];
        }
      }
    }

    if (firstChild) {
      return firstChild;
    }

    // HACK: literate version of tree's traverse
    let currentFiber = fiber;
    while (currentFiber) {
      if (currentFiber.nextSibling) {
        return currentFiber.nextSibling;
      }
      currentFiber = currentFiber.parent;
    }
  },

  workLoop(deadline) {
    console.log("deadline.timeRemaining", deadline.timeRemaining());

    while (deadline.timeRemaining() >= 1 && ReactDOM.nextUnitOfWork) {
      ReactDOM.nextUnitOfWork = ReactDOM.performUnitOfWork(
        ReactDOM.nextUnitOfWork
      );
    }

    if (ReactDOM.nextUnitOfWork) window.requestIdleCallback(ReactDOM.workLoop);
  },

  render(virtualDom, container) {
    ReactDOM.nextUnitOfWork = {
      dom: container,
      props: {
        children: [virtualDom],
      },
      // parent, nextSibling are all `point` to `fiber`
      parent: null,
      nextSibling: null,
    };

    window.requestIdleCallback(this.workLoop);
  },
};

// const element = (
//   <div id="foo">
//     <a>bar</a>
//     <b />
//     <p>hello world</p>
//     <h1>react</h1>
//   </div>
// );
const container = document.getElementById("root");
// ReactDOM.render(element, container);

const updateValue = (e) => {
  rerender(e.target.value);
};

const rerender = (value) => {
  const element = (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
    </div>
  );
  ReactDOM.render(element, container);
};

rerender("World");
