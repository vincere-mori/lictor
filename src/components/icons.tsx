import type { SVGProps } from 'react'

export function IconRegistry(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  )
}

export function IconBrain(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5.5a3 3 0 0 0-3 3 2.5 2.5 0 0 0-1.2 4.7A2.5 2.5 0 0 0 9 18a2.8 2.8 0 0 0 3 .9" />
      <path d="M12 5.5a3 3 0 0 1 3 3 2.5 2.5 0 0 1 1.2 4.7A2.5 2.5 0 0 1 15 18a2.8 2.8 0 0 1-3 .9" />
      <path d="M12 5.5V18.9" />
    </svg>
  )
}

export function IconMode(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7h8M16 7h4M4 12h4M12 12h8M4 17h12M18 17h2" />
      <circle cx="14" cy="7" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="16" cy="17" r="2" />
    </svg>
  )
}
