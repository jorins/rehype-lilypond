/**
 * @module
 * Utilities surrounding lilypond
 */

import type { StrictLilypondOpts } from './invokeLilypond'

import { multiline } from './util'

/**
 * Add a lilypond version and put music in a \score block. This is required for
 * generating MIDI output. Throws if the input already has a \version tag.
 */
export function wrapMusic(music: string, opts: StrictLilypondOpts): string {
  if (music.includes('\\version')) {
    throw new Error(
      `Asked to wrap music but input already contains \\version: ${music}`,
    )
  }

  const midi = opts.midi ? `  \\midi { }` : null

  const layout = opts.formats.length > 0 ? `  \\layout { }` : null

  return multiline(
    `\\version "${opts.version}"`,
    `\\score {`,
    `  { ${music} }`,
    layout,
    midi,
    `}`,
  )
}

/**
 * Validate lilypond options. Throws if any given options are invalid.
 */
export function validateOptions(opts: StrictLilypondOpts): void {
  // SVG cannot be generated along with other formats, see
  // https://lilypond.org/doc/v2.24/Documentation/usage/command_002dline-usage#basic-command-line-options-for-lilypond
  const hasSvg = opts.formats.includes('svg')

  if (hasSvg && opts.formats.length > 1) {
    const formatsStr = opts.formats.join(', ')
    throw new Error(
      `Cannot generate svg at the same time as other graphical formats (asked to generate ${formatsStr})`,
    )
  }
}

/**
 * Generate the full command to invoke lilypond with.
 */
export function computeArgs(opts: StrictLilypondOpts, outPath: string): string[] {
  const args = []

  for (const format of opts.formats) {
    args.push(`--format=${format}`)
  }

  if (opts.crop === true) {
    args.push('--define-default=crop')
  }

  if (opts.dpi !== null) {
    args.push(`--define-default=resolution=${opts.dpi}`)
  }

  args.push(`--output=${outPath}`)

  args.push('--define-default=no-point-and-click')

  args.push('-')

  return args;
}
