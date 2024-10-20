const apiKey = "OAFHVAELAQT6C7A2";
const stockSearch = document.getElementById("stockSearch");
const searchButton = document.getElementById("searchButton");
const stockDetails = document.getElementById("stockDetails");
const stockTable = document
  .getElementById("stockTable")
  .getElementsByTagName("tbody")[0];
const ctx = document.getElementById("stockChart").getContext("2d");
let stockChart;

const stockDropdown = document.getElementById("stockDropdown");
const loadStockButton = document.getElementById("loadStockButton");

// Fetch stock data with better error handling
async function getStockData(stockSymbol) {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${apiKey}`
    );
    const data = await response.json();

    // Check for API limit or error message
    if (data["Error Message"]) {
      console.error("Error:", data["Error Message"]);
      stockDetails.innerHTML = `<p>Error: Invalid stock symbol "${stockSymbol}".</p>`;
      return null;
    }

    if (data["Note"]) {
      console.error("Note:", data["Note"]);
      stockDetails.innerHTML = `<p>API request limit reached. Try again later.</p>`;
      return null;
    }

    // Return stock data if no errors
    return data["Time Series (Daily)"];
  } catch (error) {
    console.error("Fetch error:", error);
    stockDetails.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
    return null;
  }
}

// Fetch top 10 trending stocks (mocked data)
async function getTrendingStocks() {
  // Mock trending stocks as Alpha Vantage doesn't provide this feature
  const trendingStocks = [
    "AAPL",
    "GOOGL",
    "MSFT",
    "AMZN",
    "TSLA",
    "META",
    "NFLX",
    "NVDA",
    "BABA",
    "INTC",
  ];
  return trendingStocks;
}

// Populate dropdown with trending stocks
async function populateDropdown() {
  const trendingStocks = await getTrendingStocks();
  trendingStocks.forEach((stock) => {
    const option = document.createElement("option");
    option.value = stock;
    option.text = stock;
    stockDropdown.appendChild(option);
  });
}

// Display stock details
function displayStockDetails(stockData, symbol) {
  if (!stockData) return; // Don't proceed if stockData is null

  const latestDate = Object.keys(stockData)[0];
  const latestData = stockData[latestDate];
  const price = latestData["4. close"];
  const volume = latestData["5. volume"];
  const change = (
    latestData["4. close"] - stockData[Object.keys(stockData)[1]]["4. close"]
  ).toFixed(2);

  stockDetails.innerHTML = `
    <h3>${symbol}</h3>
    <p>Price: $${price}</p>
    <p>Change: $${change}</p>
    <p>Volume: ${volume}</p>
  `;

  updateStockTable(symbol, price, change, volume);
}

// Update stock comparison table
function updateStockTable(symbol, price, change, volume) {
  const newRow = stockTable.insertRow();
  newRow.innerHTML = `
    <td>${symbol}</td>
    <td>$${price}</td>
    <td>${change}</td>
    <td>${volume}</td>
  `;
}

// Display stock price graph
function displayStockGraph(stockData) {
  if (!stockData) return; // Don't proceed if stockData is null

  const labels = Object.keys(stockData).slice(0, 30).reverse();
  const data = labels.map((date) => stockData[date]["4. close"]);

  if (stockChart) {
    stockChart.destroy();
  }

  stockChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Stock Price",
          data: data,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: {
          beginAtZero: true,
        },
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

// Handle stock search
searchButton.addEventListener("click", async () => {
  const stockSymbol = stockSearch.value.toUpperCase();
  const stockData = await getStockData(stockSymbol);

  if (stockData) {
    displayStockDetails(stockData, stockSymbol);
    displayStockGraph(stockData);
  }
});

// Load stock from dropdown
loadStockButton.addEventListener("click", async () => {
  const selectedStock = stockDropdown.value;
  const stockData = await getStockData(selectedStock);

  if (stockData) {
    displayStockDetails(stockData, selectedStock);
    displayStockGraph(stockData);
  }
});

// Initialize dropdown with trending stocks
populateDropdown();
