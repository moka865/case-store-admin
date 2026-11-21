/**
 * Accessible 4px switch staying neutral (charcoal/graphite on gallery-white)
 * so Klein blue stays strictly under ~5% for primary CTAs, focus rings, and selections.
 */
export function SwitchToggle({ checked, onChange, label, id = undefined }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[30px] w-[52px] shrink-0 items-center rounded-[4px] border p-1 transition-colors duration-150 cursor-pointer ${
        checked
          ? 'border-[var(--charcoal)] bg-[var(--gallery-white)]'
          : 'border-[rgba(38,40,43,0.22)] bg-[var(--plaster)]'
      }`}
    >
      <span
        className={`block h-[20px] w-[20px] rounded-[3px] transition-transform duration-150 ${
          checked ? 'bg-[var(--charcoal)] -translate-x-[22px]' : 'bg-[var(--graphite)] translate-x-0'
        }`}
      />
    </button>
  );
}
