# pastel-grunge

A Claude Code theme mod: soft fairytale pastels over a scratched, grainy void.
A lightly animated backdrop sits behind the app's frosted panels, with drifting
pink, lilac, mint and butter glows, twinkling sparkles, bobbing pixel hearts, a
crescent moon, a scrolling checker floor and the occasional glitch bar.

The backdrop is drawn by the Claude desktop and mobile apps. A terminal session
loads the mod but draws no backdrop.

## Install

At the prompt of a terminal session:

```
/plugin install pastel-grunge --marketplace zwintersd/pastel-grunge
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install pastel-grunge --marketplace zwintersd/pastel-grunge
```

## Use

The theme applies when a session starts. `/pastel-grunge` changes it, and the
choice is remembered across sessions:

| Command | What it does |
| --- | --- |
| `/pastel-grunge dusk` | The dark scene (default): pastels glowing through plum-black |
| `/pastel-grunge paper` | The light scene: worn pink paper with the grunge inked over it |
| `/pastel-grunge tint` | Colours the panels to match the scene |
| `/pastel-grunge plain` | Panels go back to the app's own colour |
| `/pastel-grunge off` | Clears the theme |

Scene and panel words combine: `/pastel-grunge paper tint`.

Panels are untinted by default so text stays readable in both light and dark
mode. The mod sets the backdrop and panel glass only; it does not recolour the
app's text, borders or accents.
