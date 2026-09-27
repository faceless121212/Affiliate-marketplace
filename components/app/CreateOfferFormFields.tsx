import { Field, FieldRow, inputClass } from '@/components/ui/Field'
import { CATEGORIES } from '@/lib/types'
import { EXAMPLE_OFFER } from './createOfferExample'
import type { OfferFormState } from './CreateOfferForm'

const groupHeading = 'text-[11px] font-semibold uppercase tracking-wide text-muted'

type FieldProps = {
  form: OfferFormState
  set: (k: keyof OfferFormState) => (e: { target: { value: string } }) => void
}

/** The narrative half of the form: what the offer is, and where it sends traffic. */
export function OfferDetailsFields({ form, set }: FieldProps) {
  return (
    <div className="space-y-3">
      <h3 className={groupHeading}>What you’re offering</h3>

      <Field label="Offer name">
        <input
          aria-label="Offer name"
          className={inputClass}
          placeholder={EXAMPLE_OFFER.name}
          value={form.name}
          onChange={set('name')}
        />
      </Field>

      <Field label="Description">
        <textarea
          aria-label="Description"
          rows={3}
          className={inputClass}
          placeholder={EXAMPLE_OFFER.description}
          value={form.description}
          onChange={set('description')}
        />
      </Field>

      <Field label="Target URL">
        <input
          aria-label="Target URL"
          className={`${inputClass} font-mono text-[12px]`}
          placeholder={EXAMPLE_OFFER.targetUrl}
          value={form.targetUrl}
          onChange={set('targetUrl')}
        />
      </Field>

      <Field label="Conversion terms" hint="Be specific. This is what affiliates get paid for.">
        <textarea
          aria-label="Conversion terms"
          rows={2}
          className={inputClass}
          placeholder={EXAMPLE_OFFER.conversionTerms}
          value={form.conversionTerms}
          onChange={set('conversionTerms')}
        />
      </Field>
    </div>
  )
}

/** The classification and money half: category, commission and the escrow budget. */
export function PayoutFields({
  form,
  set,
  error,
}: FieldProps & { error: string | null }) {
  return (
    <div className="space-y-3 border-t border-line pt-3">
      <h3 className={groupHeading}>Category &amp; payout</h3>

      <FieldRow>
        <Field label="Category" hint="e.g. Ecommerce, SaaS, or iGaming" align="row">
          <select
            aria-label="Category"
            className={inputClass}
            value={form.category}
            onChange={set('category')}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Commission per conversion (USD)"
          hint="CPA: a fixed amount per conversion."
          align="row"
        >
          <input
            aria-label="Commission per conversion (USD)"
            inputMode="decimal"
            className={`${inputClass} font-mono tnum`}
            placeholder={EXAMPLE_OFFER.commission}
            value={form.commission}
            onChange={set('commission')}
          />
        </Field>
      </FieldRow>

      <Field
        label="Escrow budget (USD)"
        hint="Locked before launch. Affiliates see the real balance."
        error={error ?? undefined}
      >
        <input
          aria-label="Escrow budget (USD)"
          inputMode="decimal"
          className={`${inputClass} font-mono tnum`}
          placeholder={EXAMPLE_OFFER.budget}
          value={form.budget}
          onChange={set('budget')}
        />
      </Field>
    </div>
  )
}
