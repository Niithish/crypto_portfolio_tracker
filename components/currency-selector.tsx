'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCurrency, CURRENCIES } from '@/hooks/use-currency'

export function CurrencySelector() {
  const { currency, setCurrency, loading } = useCurrency()

  return (
    <div className="flex items-center gap-2">
      <Select value={currency} onValueChange={setCurrency} disabled={loading}>
        <SelectTrigger className="w-24">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CURRENCIES).map(([code, { symbol }]) => (
            <SelectItem key={code} value={code}>
              {symbol} {code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}