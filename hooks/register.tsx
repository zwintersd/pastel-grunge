import type { Register, ThemeResult, ThemeSetArgs } from 'claude-code'

type ThemeSetter = { theme: { set: (attributes: ThemeSetArgs) => Promise<ThemeResult> } }

const PLUGIN = 'pastel-grunge'
const COMMAND = 'pastel-grunge'
const STORE_KEY = 'choice'

type Scene = 'dusk' | 'paper'
type Choice = { scene: Scene | 'off'; isTinted: boolean }

const DEFAULT: Choice = { scene: 'dusk', isTinted: false }

type Palette = {
  top: string
  bottom: string
  ink: string
  blobOpacity: number
  grain: number
  vignette: string
  vignetteOpacity: number
  tint: string
}

const PALETTES: Record<Scene, Palette> = {
  // The grunge side: a plum-black void with the pastels glowing through it.
  dusk: {
    top: '#15111c',
    bottom: '#2b1d35',
    ink: '#f6eaff',
    blobOpacity: 0.34,
    grain: 0.16,
    vignette: '#07050a',
    vignetteOpacity: 0.7,
    tint: '#1d1626',
  },
  // The fairytale side: worn pink paper with the grunge inked over it.
  paper: {
    top: '#fbeef3',
    bottom: '#e6dcf4',
    ink: '#2b1d35',
    blobOpacity: 0.6,
    grain: 0.22,
    vignette: '#6b4a6e',
    vignetteOpacity: 0.32,
    tint: '#fbf1f6',
  },
}

const PINK = '#ff9fcf'
const LILAC = '#b9a4ff'
const MINT = '#9be8d0'
const BUTTER = '#ffe59a'

const W = 1600
const H = 1000

// A fixed seed, so the scene is the same drawing on every redraw.
const seeded = (seed: number) => {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...']

const pixelHeart = (x: number, y: number, px: number, fill: string, dur: number, begin: number) => {
  const cells = HEART.flatMap((row, r) =>
    [...row].map((c, col) =>
      c === 'X' ? `<rect x="${col * px}" y="${r * px}" width="${px}" height="${px}"/>` : '',
    ),
  ).join('')
  return `<g transform="translate(${x} ${y})"><g fill="${fill}" shape-rendering="crispEdges">${cells}
<animateTransform attributeName="transform" type="translate" values="0 0;0 -7;0 0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1"/>
<animate attributeName="opacity" values=".85;.5;.85" dur="${dur * 1.7}s" begin="${begin}s" repeatCount="indefinite"/></g></g>`
}

const blob = (id: string, cx: number, cy: number, r: number, drift: string, dur: number, opacity: number) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})" opacity="${opacity}">
<animateTransform attributeName="transform" type="translate" values="0 0;${drift};0 0" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/></circle>`

const gradient = (id: string, color: string) =>
  `<radialGradient id="${id}"><stop offset="0" stop-color="${color}"/><stop offset=".55" stop-color="${color}" stop-opacity=".45"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`

const scene = (name: Scene): string => {
  const p = PALETTES[name]
  const rand = seeded(name === 'dusk' ? 7 : 23)
  const pastels = [PINK, LILAC, MINT, BUTTER, p.ink]

  // Four-point sparkles and stray pixels, each twinkling on its own clock.
  let stars = ''
  for (let i = 0; i < 46; i++) {
    const x = Math.round(rand() * W)
    const y = Math.round(rand() * H * 0.9)
    const size = 3 + rand() * 9
    const color = pastels[Math.floor(rand() * pastels.length)]
    const dur = (4 + rand() * 5).toFixed(1)
    const begin = (rand() * 8).toFixed(1)
    const twinkle = `<animate attributeName="opacity" values=".15;.9;.15" dur="${dur}s" begin="-${begin}s" repeatCount="indefinite"/>`
    stars +=
      i % 4 === 0
        ? `<rect x="${x}" y="${y}" width="4" height="4" fill="${color}" opacity=".15" shape-rendering="crispEdges">${twinkle}</rect>`
        : `<path transform="translate(${x} ${y}) scale(${size.toFixed(1)})" d="M0-1Q.12-.12 1 0Q.12.12 0 1Q-.12.12-1 0Q-.12-.12 0-1Z" fill="${color}" opacity=".15">${twinkle}</path>`
  }

  // Scratches: the worn-photocopy part.
  let scratches = ''
  for (let i = 0; i < 38; i++) {
    const x = rand() * W
    const y = rand() * H
    const len = 30 + rand() * 220
    const tilt = -0.35 + rand() * 0.25
    scratches += `<path d="M${x.toFixed(0)} ${y.toFixed(0)}l${(len * tilt).toFixed(0)} ${len.toFixed(0)}" stroke-width="${(0.4 + rand() * 1.1).toFixed(1)}" opacity="${(0.04 + rand() * 0.09).toFixed(2)}"/>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2=".25" y2="1"><stop offset="0" stop-color="${p.top}"/><stop offset="1" stop-color="${p.bottom}"/></linearGradient>
${gradient('g-pink', PINK)}${gradient('g-lilac', LILAC)}${gradient('g-mint', MINT)}${gradient('g-butter', BUTTER)}
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".45" stop-color="${p.vignette}" stop-opacity="0"/><stop offset="1" stop-color="${p.vignette}" stop-opacity="${p.vignetteOpacity}"/></radialGradient>
<linearGradient id="floor-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
<mask id="floor-mask"><rect x="-800" y="0" width="${W + 1600}" height="420" fill="url(#floor-fade)"/></mask>
<pattern id="checker" width="120" height="120" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="${p.ink}"/><rect x="60" y="60" width="60" height="60" fill="${p.ink}"/></pattern>
<pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="2.6" fill="${p.ink}"/></pattern>
<radialGradient id="dots-fade"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="dots-mask"><circle cx="190" cy="230" r="330" fill="url(#dots-fade)"/></mask>
<mask id="moon-mask"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="1352" cy="158" r="74" fill="#000"/></mask>
<clipPath id="moon-clip"><circle cx="1310" cy="180" r="92"/></clipPath>
<radialGradient id="moon-body" cx=".3" cy=".68" r=".8"><stop offset="0" stop-color="#fffbe6"/><stop offset=".45" stop-color="${BUTTER}"/><stop offset="1" stop-color="#ffb9a6"/></radialGradient>
<radialGradient id="moon-halo"><stop offset=".3" stop-color="${BUTTER}" stop-opacity=".34"/><stop offset=".6" stop-color="${PINK}" stop-opacity=".12"/><stop offset="1" stop-color="${PINK}" stop-opacity="0"/></radialGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .5  0 0 0 ${p.grain * 4} -${p.grain * 1.4}"/></filter>
<filter id="smudge" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006 .012" numOctaves="3" seed="11"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.6 -.75"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
${blob('g-pink', 300, 250, 430, '90 60', 71, p.blobOpacity)}
${blob('g-lilac', 1250, 380, 520, '-110 50', 89, p.blobOpacity)}
${blob('g-mint', 760, 860, 420, '70 -80', 63, p.blobOpacity * 0.8)}
${blob('g-butter', 1420, 900, 300, '-60 -50', 77, p.blobOpacity * 0.7)}
<g transform="translate(0 ${H - 420})" mask="url(#floor-mask)" opacity=".07"><rect x="-800" y="0" width="${W + 1600}" height="420" fill="url(#checker)" transform="skewX(-38)"><animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;120 0" dur="48s" repeatCount="indefinite"/></rect></g>
<rect width="640" height="620" fill="url(#dots)" mask="url(#dots-mask)" opacity=".1"/>
<circle cx="1310" cy="180" r="230" fill="url(#moon-halo)"><animate attributeName="opacity" values="1;.6;1" dur="11s" repeatCount="indefinite"/></circle>
<circle cx="1310" cy="180" r="92" fill="${LILAC}" opacity=".1"/>
<circle cx="1310" cy="180" r="92" fill="none" stroke="${p.ink}" stroke-width="1" stroke-dasharray="2 7" opacity=".25"/>
<g mask="url(#moon-mask)" clip-path="url(#moon-clip)">
<circle cx="1310" cy="180" r="92" fill="url(#moon-body)"/>
<g fill="#c98a7a" opacity=".38"><circle cx="1250" cy="215" r="10"/><circle cx="1272" cy="246" r="6.5"/><circle cx="1238" cy="178" r="5.5"/><circle cx="1295" cy="258" r="4"/><circle cx="1262" cy="150" r="3.5"/><circle cx="1232" cy="236" r="3"/></g>
<g fill="none" stroke="#fff8dc" stroke-width="1.4" opacity=".7"><path d="M1242 209a10 10 0 0 1 14-3"/><path d="M1267 242a6.5 6.5 0 0 1 9-2"/><path d="M1234 175a5.5 5.5 0 0 1 7-2"/></g>
<g fill="none" stroke="#7a4a5e" stroke-width="1.1" stroke-linecap="round" opacity=".3"><path d="M1222 232l34 40M1230 222l42 50M1240 214l44 54M1226 248l20 24M1292 262l14 10M1300 254l18 14"/></g>
<path d="M1226 150a92 92 0 0 0 30 106" fill="none" stroke="#fffdf0" stroke-width="3" stroke-linecap="round" opacity=".75"/>
</g>
${stars}
${pixelHeart(1120, 610, 9, PINK, 6, 0)}
${pixelHeart(240, 700, 6, LILAC, 7.5, 2)}
${pixelHeart(880, 150, 5, MINT, 5.2, 1)}
<g fill="none" stroke="${p.ink}" stroke-linecap="round">${scratches}
<path d="M-10 46Q400 20 800 44T1610 38" stroke-width="2.2" stroke-dasharray="14 12" opacity=".28"><animate attributeName="stroke-dashoffset" values="0;-260" dur="60s" repeatCount="indefinite"/></path>
<path d="M-10 ${H - 38}Q420 ${H - 62} 820 ${H - 40}T1610 ${H - 50}" stroke-width="2.2" stroke-dasharray="14 12" opacity=".2"><animate attributeName="stroke-dashoffset" values="0;260" dur="60s" repeatCount="indefinite"/></path>
<path d="M1010 792l14-36 20 26 22-34 20 34 20-26 14 36zM1006 806h118" stroke-width="2.4" stroke-linejoin="round" opacity=".22" transform="rotate(-8 1065 780)"/>
</g>
<rect width="${W}" height="${H}" fill="${p.ink}" filter="url(#smudge)" opacity=".1"/>
<rect width="${W}" height="${H}" filter="url(#grain)"/>
<rect x="0" y="412" width="${W}" height="5" fill="${p.ink}" opacity="0"><animate attributeName="opacity" values="0;0;.22;0;.12;0" keyTimes="0;.95;.96;.97;.985;1" dur="19s" repeatCount="indefinite"/><animate attributeName="y" values="412;412;690;690;236;236" keyTimes="0;.33;.34;.66;.67;1" dur="57s" calcMode="discrete" repeatCount="indefinite"/></rect>
<rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`
}

const isScene = (word: string): word is Scene => word === 'dusk' || word === 'paper'

const readChoice = (stored: unknown): Choice => {
  if (typeof stored !== 'object' || stored === null) return DEFAULT
  const { scene: named, isTinted } = stored as Partial<Choice>
  return {
    scene: named === 'off' || (typeof named === 'string' && isScene(named)) ? named : DEFAULT.scene,
    isTinted: isTinted === true,
  }
}

// Two engine builds spell the backdrop differently: newer ones name it
// `scene` with the mode beside it, older ones `id` with the mode inside.
// A build refuses the spelling it does not know, so try the newer first.
const apply = async ($: ThemeSetter, choice: Choice) => {
  if (choice.scene === 'off') return undefined
  const palette = PALETTES[choice.scene]
  const mode = choice.scene === 'dusk' ? 'dark' : 'light'
  // Untinted, the panels keep the app's own colour, so text stays readable
  // in light and dark mode alike; `tint` commits to the scene.
  const glass = choice.isTinted
    ? { blur: 1, tint: palette.tint, opacity: 0.16 }
    : { blur: 1, opacity: 0.1 }
  try {
    return await $.theme.set({ backdrop: { scene: choice.scene, glass }, overrideColorScheme: mode })
  } catch {
    const older = { backdrop: { id: choice.scene, glass, colorScheme: mode } }
    return await $.theme.set(older as unknown as ThemeSetArgs)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: 'Pastel-grunge theme: dusk | paper | off, add "tint" to colour the panels too',
    })
    await apply($, readChoice(await $.store.get(STORE_KEY)))

    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const words = e.args.toLowerCase().split(/\s+/).filter(Boolean)
    const before = readChoice(await $.store.get(STORE_KEY))

    if (words.includes('off')) {
      await $.store.set(STORE_KEY, { ...before, scene: 'off' })
      await $.theme.clear()
      return { text: 'Pastel-grunge theme off. /pastel-grunge dusk or paper brings it back.' }
    }

    const named = words.find(isScene)
    const choice: Choice = {
      scene: named ?? (before.scene === 'off' ? DEFAULT.scene : before.scene),
      isTinted: words.includes('tint') ? true : words.includes('plain') ? false : before.isTinted,
    }
    await $.store.set(STORE_KEY, choice)
    const set = await apply($, choice)
    const drawn = set?.isDrawn ? '' : ` Not drawn here: ${set && !set.isDrawn ? set.reason : 'no surface'}.`

    return {
      text: `Pastel-grunge: ${choice.scene}${choice.isTinted ? ', tinted panels' : ''}.${drawn} Options: dusk | paper | off, plus tint | plain.`,
    }
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    const props: { plugin: string; scene?: string; id?: string } = e.props
    const name = props.scene ?? props.id ?? ''
    if (props.plugin !== PLUGIN || !isScene(name)) return next(e)
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)
    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={scene(name)}
        alt="Pastel-grunge backdrop: soft pastel glows, sparkles and pixel hearts over a scratched, grainy field"
        isInteractive
      />
    )
  })
}
