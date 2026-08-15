<script setup>
const modelPipelines = [
  {
    title: "Fallback Chain Execution",
    cmd: '.wb/bin/wbRun opencode run -m openrouter/meta-llama/llama-3.3-70b-instruct "hi" || .wb/bin/wbRun agy --model gemini-3.1-pro-high -p "what s your name as a model"',
    logs: [
      { text: "--------------------------------------------------------------------------------", type: "sys" },
      { text: "▶ Executing: opencode run -m openrouter/meta-llama/llama-3.3-70b-instruct hi", type: "sys" },
      { text: "--------------------------------------------------------------------------------", type: "sys" },
      { text: "> build · meta-llama/llama-3.3-70b-instruct", type: "gen" },
      { text: "Error: Insufficient credits. This account never purchased credits. Make sure your key is on the correct account or org, and if so, purchase more at https://openrouter.ai/settings/credits", type: "error" },
      { text: "⚠️  [wbRun] Error detected in: opencode run -m openrouter/meta-llama/llama-3.3-70b-instruct hi", type: "warn" },
      { text: "--------------------------------------------------------------------------------", type: "sys" },
      { text: "--------------------------------------------------------------------------------", type: "sys" },
      { text: "▶ Executing: agy --model gemini-3.1-pro-high -p what s your name as a model", type: "sys" },
      { text: "--------------------------------------------------------------------------------", type: "sys" },
      { text: "You are currently using the Gemini 3.1 Pro (High) model. How can I help you today?", type: "ok" }
    ],
    note: "This demonstrates the seamless failover from a third-party model (OpenRouter Llama) to a first-party model (Gemini Pro) using the shell || operator and wbRun wrapper.",
    noteType: "warning"
  }
];
</script>

# `/wbModel` — Live Terminal Demo

Below is an authentic terminal log snapshot demonstrating `/wbModel` fallback chain execution and visual banners:

<LiveDemoAnimation command="wbModel" :pipelines="modelPipelines" />
