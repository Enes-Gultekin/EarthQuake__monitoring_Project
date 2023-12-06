async function fetchData() {
  try {
    const response = await fetch("data/fault_line.geojson");

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    // Now you can work with the JSON data
    console.log(data);
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}

// Call the function to fetch data
fetchData();
