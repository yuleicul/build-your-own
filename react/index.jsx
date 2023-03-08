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

  wipFiber: null,
  hookIndex: 0,

  // Todo: How to reduce rerender
  useState(initial) {
    // Handle 4 things:
    // 1. is this the first call?
    // 2. return state
    // 3. return setState, more than one calls
    // 4. rerender
    const oldHook = this.wipFiber?.alternate?.hooks?.[this.hookIndex];

    const hook = {
      state: oldHook ? oldHook.state : initial,
      setterExecuteQueue: [],
    };

    if (oldHook) {
      oldHook.setterExecuteQueue.forEach((newStateOrFn) => {
        if (typeof newStateOrFn === "function") {
          hook.state = newStateOrFn(hook.state);
        } else {
          hook.state = newStateOrFn;
        }
      });
    } else {
      this.wipFiber.hooks.push(hook);
    }

    this.hookIndex++;

    const setState = (newStateOrFn) => {
      hook.setterExecuteQueue.push(newStateOrFn);

      // rerender
      this.hookIndex = 0;
      this.wipRoot = {
        dom: this.currentRoot.dom,
        props: {
          children: this.currentRoot.props.children,
        },
        child: null,
        parent: null,
        nextSibling: null,
        alternate: this.currentRoot,
      };
      this.nextUnitOfWork = this.wipRoot;
      window.requestIdleCallback(this.workLoop);
    };

    return [hook.state, setState];
  },

  isEvent(prop) {
    return prop.startsWith("on");
  },
  // virtualDom is inside fiber
  createDom(fiber) {
    const { type, props } = fiber;

    if (type === ReactDOM.TEXT_OR_NUMBER) {
      return document.createTextNode(fiber.props.nodeValue);
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
   * This is just a incomplete function, just for learning
   */
  updateDom(fiber) {
    const element = fiber.dom;
    const { props } = fiber;

    for (const prop in props) {
      if (prop !== "children") {
        if (ReactDOM.isEvent(prop)) {
          element.addEventListener(prop.slice(2).toLowerCase(), props[prop]);
        } else {
          element[prop] = props[prop];
        }
      }
    }
  },
  commitWork(fiber) {
    if (!fiber) return;
    if (typeof fiber.type !== "function") {
      if (fiber.effectTag === "UPDATE") {
        ReactDOM.updateDom(fiber);
      } else if (fiber.effectTag === "PLACEMENT") {
        let parent = fiber.parent;
        // if parent is function component
        while (!parent.dom) parent = parent.parent;
        parent.dom.appendChild(fiber.dom);
      } else if (fiber.effectTag === "DELETION") {
        let parent = fiber.parent;
        // if parent is function component
        while (!parent.dom) parent = parent.parent;
        parent.dom.removeChild(fiber.dom);
      }
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
          props: { nodeValue: temp, children: [] },
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
    // KEY POINT:
    // 1. The fiber of function component is fiber WITHOUT `dom`!
    // 2. The fiber of function component is fiber WITH `hooks`!
    if (typeof fiber.type === "function") {
      // prepare for hooks
      ReactDOM.wipFiber = fiber;
      if (!fiber.hooks) fiber.hooks = [];

      fiber.props.children = [fiber.type(fiber.props)];
      ReactDOM.reconcileChildren(fiber);
    } else {
      if (!fiber.dom) fiber.dom = this.createDom(fiber);
      ReactDOM.reconcileChildren(fiber);
    }

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

//////////////////
/// App
//////////////////

function Counter() {
  const [count1, setCount1] = ReactDOM.useState(1); // Todo: how to remove to React instead of ReactDDM
  const [count2, setCount2] = ReactDOM.useState(2);
  return (
    <div>
      <h1 onClick={() => setCount1((prev) => prev + 2)}>Count1: {count1}</h1>
      <h1 onClick={() => setCount2((prev) => prev + 2)}>Count2: {count2}</h1>
    </div>
  );
}

const container = document.getElementById("root");
ReactDOM.render(<Counter />, container);
