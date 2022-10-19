import Others from "./examples/others";

import BasicUsageDemo from "./basic-usage/demo";
import BasicUsage from "./basic-usage/homemade/BasicUsage";
import BasicUsageWithCache from "./basic-usage/homemade/BasicUsageWithCache";

function App() {
  return (
    <div>
      {/* <BasicUsageDemo /> */}
      {/* <BasicUsage /> */}
      <BasicUsageWithCache />
    </div>
  );
}

export default App;
