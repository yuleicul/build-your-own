import Others from "./examples-deprecated/others";

import BasicUsageDemo from "./01.basic-usage/demo";
import BasicUsageWithoutCache from "./01.basic-usage/homemade/BasicUsageWithoutCache";
import BasicUsage from "./01.basic-usage/homemade/BasicUsage";

import DeduplicationDemo from "./02.deduplication/demo";
import Deduplication from "./02.deduplication/homemade";

import FocusRevalidateDemo from "./03.focus-revalidate/demo";
import FocusRevalidate from "./03.focus-revalidate/homemade";

function App() {
  return (
    <div>
      {/* <BasicUsageDemo /> */}
      {/* <BasicUsageWithoutCache /> */}
      {/* <BasicUsage /> */}

      {/* <DeduplicationDemo /> */}
      {/* <Deduplication /> */}

      {/* <FocusRevalidateDemo /> */}
      <FocusRevalidate />
    </div>
  );
}

export default App;
