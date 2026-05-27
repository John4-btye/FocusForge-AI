const embers = [
  { x: '5%', size: '4px', delay: '0s', duration: '19s', drift: '22px' },
  { x: '11%', size: '3px', delay: '6s', duration: '24s', drift: '-18px' },
  { x: '18%', size: '5px', delay: '12s', duration: '28s', drift: '24px' },
  { x: '27%', size: '3px', delay: '3s', duration: '22s', drift: '-22px' },
  { x: '36%', size: '4px', delay: '15s', duration: '30s', drift: '16px' },
  { x: '45%', size: '3px', delay: '9s', duration: '21s', drift: '-26px' },
  { x: '54%', size: '5px', delay: '18s', duration: '29s', drift: '20px' },
  { x: '63%', size: '3px', delay: '4s', duration: '23s', drift: '-14px' },
  { x: '71%', size: '4px', delay: '11s', duration: '27s', drift: '26px' },
  { x: '80%', size: '3px', delay: '20s', duration: '31s', drift: '-20px' },
  { x: '88%', size: '4px', delay: '7s', duration: '25s', drift: '18px' },
  { x: '95%', size: '3px', delay: '16s', duration: '33s', drift: '-24px' },
  { x: '24%', size: '2px', delay: '21s', duration: '26s', drift: '18px' },
  { x: '74%', size: '2px', delay: '14s', duration: '24s', drift: '-18px' },
]

export default function ForgeEmbers() {
  // Ambient embers are decorative only; CSS keeps them behind content and non-interactive.
  return (
    <div className="forge-embers" aria-hidden="true">
      {embers.map((ember, index) => (
        <span
          key={`${ember.x}-${index}`}
          className="forge-ember-particle"
          style={{
            '--ember-x': ember.x,
            '--ember-size': ember.size,
            '--ember-delay': ember.delay,
            '--ember-duration': ember.duration,
            '--ember-drift': ember.drift,
          }}
        />
      ))}
    </div>
  )
}
