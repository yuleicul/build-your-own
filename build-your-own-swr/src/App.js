import Others from "./examples/others";

import BasicUsageDemo from "./basic-usage/demo";
import BasicUsageWithoutCache from "./basic-usage/homemade/BasicUsageWithoutCache";
import BasicUsage from "./basic-usage/homemade/BasicUsage";

import DeduplicationDemo from "./deduplication/demo";
import Deduplication from "./deduplication/homemade";

import RaceDemo from "./race/demo";

function App() {
  return (
    <div>
      {/* <BasicUsageDemo /> */}
      {/* <BasicUsageWithoutCache /> */}
      {/* <BasicUsage /> */}

      {/* <DeduplicationDemo /> */}
      {/* <Deduplication /> */}

      <RaceDemo />
    </div>
  );
}

export default App;
