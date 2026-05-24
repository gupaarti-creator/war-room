export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const useSearch = body._useSearch;
    delete body._useSearch;

    const headers = {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    };

    if (useSearch) {
      headers["anthropic-beta"] = "web-search-2025-03-05";
      body.tools = [{ type: "web_search_20250305", name: "web_search" }];
      body.tool_choice = { type: "auto" };
    }

    let response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers, body: JSON.stringify(body)
    });

    // If search fails, retry without it
    if (!response.ok && useSearch) {
      delete body.tools;
      delete body.tool_choice;
      delete headers["anthropic-beta"];
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers, body: JSON.stringify(body)
      });
    }

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
