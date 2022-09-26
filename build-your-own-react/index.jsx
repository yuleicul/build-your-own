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
  deletions: [],
  isEvent(prop) {
    return prop.startsWith("on");
  },
  // virtualDom is inside fiber
  createDom(fiber) {
    const { type, props } = fiber;

    if (type === ReactDOM.TEXT_OR_NUMBER) {
      return document.createTextNode(fiber.props.value);
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
    if (fiber.effectTag === "UPDATE") {
      // todo
    } else if (fiber.effectTag === "PLACEMENT") {
      fiber.parent.dom.appendChild(fiber.dom);
    } else if (fiber.effectTag === "DELETION") {
      // this will remove all the child tree
      fiber.parent.dom.removeChild(fiber.dom);
      return;
    }
    ReactDOM.commitWork(fiber.child);
    ReactDOM.commitWork(fiber.nextSibling);
    ReactDOM.currentRoot = fiber;
  },

  /**
   * Tasks:
   * 1. .child .nextSiblings .parent
   * 2. .alternate .effectTag .dom - compare with alternate and add `effectTag` to fiber
   */
  reconcileChildren(wipFiber) {
    const children = wipFiber.props.children;
    let currentFiber = wipFiber.alternate?.child;
    let i = 0;

    while (i <= children.length || currentFiber) {
      if (!children?.[i]) {
        if (!currentFiber) break;
        currentFiber.effectTag = "DELETION";
        ReactDOM.deletions.push(currentFiber);
        currentFiber = currentFiber.nextSibling;
        break;
      }

      // handle TEXT_OR_NUMBER
      if (typeof children[i] === "string" || typeof children[i] === "number") {
        const temp = children[i];
        children[i] = {
          type: ReactDOM.TEXT_OR_NUMBER,
          props: { value: temp, children: [] },
        };
      }

      // handle `.child` `.parent` and `.nextSibling`
      if (i === 0) wipFiber.child = children[i];
      children[i].parent = wipFiber;
      if (i - 1 >= 0) {
        children[i - 1].nextSibling = children[i];
      }

      // handle `.alternate` and `.effectTag`
      if (children[i].type === currentFiber?.type) {
        children[i].effectTag = "UPDATE";
        children[i].alternate = currentFiber;
        children[i].dom = currentFiber.dom;
      } else {
        children[i].effectTag = "PLACEMENT";
        children[i].alternate = null;
        children[i].dom = null;

        if (currentFiber) {
          currentFiber.effectTag = "DELETION";
          ReactDOM.deletions.push(currentFiber);
        }
      }

      currentFiber = currentFiber?.nextSibling;
      i++;
    }
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

    ReactDOM.reconcileChildren(fiber, fiber.props.children);

    if (fiber.child) {
      return fiber.child;
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
    else {
      ReactDOM.deletions.forEach(ReactDOM.commitWork);
      ReactDOM.deletions = [];
      ReactDOM.commitWork(ReactDOM.wipRoot);
    }
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
  rerender(e.target.value, <h2>PLACEMENT</h2>);
};

const rerender = (value, append) => {
  const element = (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
      {append}
    </div>
  );
  ReactDOM.render(element, container);
};

rerender("World", <h1>placement</h1>);
