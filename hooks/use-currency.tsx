'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ExchangeRates {
  [key: string]: number
}

interface CurrencyContextType {
  currency: string
  setCurrency: (currency: string) => void
  exchangeRates: ExchangeRates
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => number
  formatCurrency: (amount: number, currency?: string) => string
  loading: boolean
}

const CURRENCIES = {
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  INR: { symbol: '₹', locale: 'en-IN' },
  CAD: { symbol: 'C$', locale: 'en-CA' }
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState('USD')
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({})
  const [loading, setLoading] = useState(true)

  // Load saved currency preference
  useEffect(() => {
    const saved = localStorage.getItem('preferredCurrency')
    if (saved && Object.keys(CURRENCIES).includes(saved)) {
      setCurrencyState(saved)
    }
  }, [])

  // Save currency preference
  useEffect(() => {
    localStorage.setItem('preferredCurrency', currency)
  }, [currency])

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        const data = await response.json()
        setExchangeRates(data.rates)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching exchange rates:', error)
      }
    }

    fetchExchangeRates()

    // Refresh rates every 30 minutes
    const interval = setInterval(fetchExchangeRates, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const setCurrency = (newCurrency: string) => {
    if (Object.keys(CURRENCIES).includes(newCurrency)) {
      setCurrencyState(newCurrency)
    }
  }

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount

    // Convert to USD first, then to target currency
    const usdAmount = amount / (exchangeRates[fromCurrency] || 1)
    return usdAmount * (exchangeRates[toCurrency] || 1)
  }

  const formatCurrency = (amount: number, currencyOverride?: string): string => {
    const targetCurrency = currencyOverride || currency
    const convertedAmount = convertCurrency(amount, 'USD', targetCurrency)
    const currencyInfo = CURRENCIES[targetCurrency as keyof typeof CURRENCIES]

    if (!currencyInfo) return convertedAmount.toFixed(2)

    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertedAmount)
  }

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      exchangeRates,
      convertCurrency,
      formatCurrency,
      loading
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

export { CURRENCIES }