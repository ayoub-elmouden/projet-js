const API_BASE_URL = "http://localhost:5001";

async function request(endpoint, method = "GET", data) {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (data) {
    config.body = JSON.stringify(data);
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "API request failed");
  }
  return response.json();
}

export async function get(endpoint) {
  return request(endpoint, "GET");
}

export async function post(endpoint, data) {
  return request(endpoint, "POST", data);
}

export async function put(endpoint, data) {
  return request(endpoint, "PUT", data);
}

export async function del(endpoint) {
  return request(endpoint, "DELETE");
}
