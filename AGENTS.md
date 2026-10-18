<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Adaptive logic lives in pure functions in src/lib/engine.ts and the assistant behind the AssistantProvider interface in src/lib/assistant.ts — so a real AI model can replace the rule-based/simulated parts without touching UI.
- Demo state is client-only (localStorage via src/lib/store.tsx), loaded in useEffect — no backend needed for the prototype.
