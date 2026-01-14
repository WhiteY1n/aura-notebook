export const mockSummary = {
  overall: "This document explores the current landscape of multimodal AI systems, focusing on how combining text, audio, and visual data improves performance. It highlights design trade-offs, data quality needs, and evaluation practices to ensure real-world reliability.",
  keyInsights: [
    {
      title: "Multimodal context is additive",
      content: "Models that blend audio, text, and visuals capture intent better than single-modality systems, especially for ambiguous inputs.",
    },
    {
      title: "Grounding beats scale alone",
      content: "Well-curated, domain-specific datasets reduce hallucinations more effectively than simply increasing parameter counts.",
    },
    {
      title: "Evaluation must be scenario-driven",
      content: "Task-oriented benchmarks surface brittleness that generic leaderboards often miss, guiding safer deployments.",
    },
  ],
  passages: [
    { text: "Combining spoken cues with screen content cut misunderstanding rates by 23% in usability tests.", page: 4 },
    { text: "Hallucinations clustered around poorly grounded visual descriptors in long-form answers.", page: 7 },
    { text: "Human-in-the-loop review improved factual accuracy by 12% over automatic filters alone.", page: 12 },
  ],
  pageHighlights: [
    { page: 3, highlights: ["Architecture overview", "Context fusion pipeline", "Latency considerations"] },
    { page: 8, highlights: ["Data quality checklist", "Annotation rubric", "Bias mitigation tactics"] },
    { page: 15, highlights: ["Rollout playbook", "Guardrail metrics", "Monitoring signals"] },
  ],
};
