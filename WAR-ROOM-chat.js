export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    };
    if (body._useSearch) {
      delete body._useSearch;
      body.tools = [{ type: "web_search_20250305", name: "web_search" }];
    }
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers, body: JSON.stringify(body)
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch(e) {
    return new Response(JSON.stringify({ error: { message: e.message } }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
}
