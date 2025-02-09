// api.js
export const headers = {
  Authorization: 'Basic ZGl0cmF2b3llYnNwOmRpdHJhMzQhdm8u',
  'Content-Type': 'application/json',
};

export async function postRequest(url, body) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers,
    });
    return response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
