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
  currentRoot: null, // fiber of current root in dom
  wipRoot: null, // fiber of the next root in dom
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
  commitWork(fiber) {
    if (!fiber) return;
    if (fiber.parent) fiber.parent.dom.appendChild(fiber.dom);
    this.commitWork(fiber.child);
    this.commitWork(fiber.nextSibling);
    ReactDOM.currentRoot = fiber;
  },

  /**
   * unitOfWork = fiber = {
   *    dom,
   *    type,
   *    props: { children },
   *    child,
   *    parent,
   *    nextSibling
   * }
   *
   * What does this function do?
   * ~~1. render the current dom~~
   * 2. prepare the next run fiber and return it
   *
   * The main logic inside performUnitWork is to transform Virtual Dom to Fiber, and construct the Fiber Tree. Just add some `point`s, take it easy
   * (but I'm not sure if it's called virtual dom)
   */
  performUnitOfWork(fiber) {
    console.log(fiber);
    if (!fiber.dom) fiber.dom = this.createDom(fiber);

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
      fiber.child = firstChild;
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
    else ReactDOM.commitWork(ReactDOM.wipRoot);
  },

  render(virtualDom, container) {
    ReactDOM.wipRoot = {
      dom: container,
      props: {
        children: [virtualDom],
      },
      // child, parent, nextSibling are all `point` to `fiber`
      child: null,
      parent: null,
      nextSibling: null,
      alternate: ReactDOM.currentRoot,
    };
    ReactDOM.nextUnitOfWork = ReactDOM.wipRoot;

    window.requestIdleCallback(this.workLoop);
  },
};

const container = document.getElementById("root");

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
