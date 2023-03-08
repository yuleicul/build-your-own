import { useEffect } from "react";
import { useState } from "react";

const createGlobalState = (initialState) => {
  const globalState = initialState;
  const setters = {};

  const useGlobalState = (key) => {
    const [state, setState] = useState(globalState[key]);

    useEffect(() => {
      if (setters[key]) setters[key].add(setState);
      else setters[key] = new Set();
      return () => {
        setters[key].delete(setState);
      };
    }, []);

    const setGlobalState = (state) => {
      globalState[key] = state;
      for (const setter of setters[key]) {
        setter(state);
      }
      console.log(globalState, setters);
    };

    return [state, setGlobalState];
  };

  return {
    useGlobalState,
  };
};

const initialState = {
  count: 0,
  text: "hello",
};
const { useGlobalState } = createGlobalState(initialState);

const Counter = () => {
  const [value, update] = useGlobalState("count");
  return (
    <div>
      <span>Count: {value}</span>
      <button type="button" onClick={() => update(value + 1)}>
        +1
      </button>
      <button type="button" onClick={() => update(value - 1)}>
        -1
      </button>
    </div>
  );
};

const TextBox = () => {
  const [value, update] = useGlobalState("text");
  return (
    <div>
      <span>Text: {value}</span>
      <input value={value} onChange={(event) => update(event.target.value)} />
    </div>
  );
};

const App = () => (
  <>
    <h1>Counter</h1>
    <Counter />
    <Counter />
    <h1>TextBox</h1>
    <TextBox />
    <TextBox />
  </>
);

export default App;
