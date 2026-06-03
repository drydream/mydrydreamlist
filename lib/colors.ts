export const COLOR_MAP: Record<string, { dot: string; accent: string; text: string }> = {
  violet:  { dot: 'bg-violet-600',  accent: 'bg-violet-500',  text: 'text-violet-400'  },
  emerald: { dot: 'bg-emerald-600', accent: 'bg-emerald-500', text: 'text-emerald-400' },
  blue:    { dot: 'bg-blue-600',    accent: 'bg-blue-500',    text: 'text-blue-400'    },
  zinc:    { dot: 'bg-zinc-600',    accent: 'bg-zinc-500',    text: 'text-zinc-400'    },
  red:     { dot: 'bg-red-600',     accent: 'bg-red-500',     text: 'text-red-400'     },
  orange:  { dot: 'bg-orange-600',  accent: 'bg-orange-500',  text: 'text-orange-400'  },
  yellow:  { dot: 'bg-yellow-500',  accent: 'bg-yellow-400',  text: 'text-yellow-400'  },
  green:   { dot: 'bg-green-600',   accent: 'bg-green-500',   text: 'text-green-400'   },
  pink:    { dot: 'bg-pink-600',    accent: 'bg-pink-500',    text: 'text-pink-400'    },
  sky:     { dot: 'bg-sky-600',     accent: 'bg-sky-500',     text: 'text-sky-400'     },
  indigo:  { dot: 'bg-indigo-600',  accent: 'bg-indigo-500',  text: 'text-indigo-400'  },
  rose:    { dot: 'bg-rose-600',    accent: 'bg-rose-500',    text: 'text-rose-400'    },
}

export const COLORS = Object.keys(COLOR_MAP)
