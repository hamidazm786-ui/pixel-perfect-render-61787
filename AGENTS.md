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

- Console pages live under the pathless `_console` layout (AppShell); shared UI primitives in src/components/app/primitives.tsx and demo state in src/lib/store.tsx with mock data in src/lib/mock-data.ts — keeps all pages on one design system until a real backend replaces the mocks.
