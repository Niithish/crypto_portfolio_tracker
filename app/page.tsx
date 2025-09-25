"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Search, Plus, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, Sun, Moon } from 'lucide-react'
import { useCurrency } from '@/hooks/use-currency'
import { CurrencySelector } from '@/components/currency-selector'
import { useTheme } from '@/hooks/use-theme'

interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
}

interface PortfolioHolding {
  id: string
  coinId: string
  amount: number
  purchasePrice: number
}

interface PortfolioItem extends PortfolioHolding {
  coin: Coin
  currentValue: number
  profitLoss: number
  profitLossPercentage: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function CryptoPortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>([])
  const [coins, setCoins] = useState<Coin[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null)
  const [amount, setAmount] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const { currency, formatCurrency, convertCurrency } = useCurrency()
  const { isDarkMode, setIsDarkMode } = useTheme()

  useEffect(() => {
    const saved = localStorage.getItem('cryptoPortfolio')
    if (saved) {
      try {
        setPortfolio(JSON.parse(saved))
      } catch (error) {
        console.error('Error parsing saved portfolio:', error)
      }
    }
  }, [])

  const savePortfolio = (holdings: PortfolioHolding[]) => {
    localStorage.setItem('cryptoPortfolio', JSON.stringify(holdings))
    setPortfolio(holdings)
  }

  const fetchCoins = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.toLowerCase()}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
        { cache: 'no-store' }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch coins: ${response.status} ${response.statusText}`)
      }

      const data: Coin[] = await response.json()
      setCoins(data)
      setSelectedCoin((previous) => {
        if (!previous) return previous
        return data.find((coin) => coin.id === previous.id) ?? null
      })
    } catch (error) {
      console.error('Error fetching coins:', error)
    }
  }, [currency])

  useEffect(() => {
    fetchCoins()
  }, [fetchCoins])

  const addCoin = () => {
    if (selectedCoin && amount && purchasePrice) {
      // Convert purchase price from selected currency to USD for storage
      const purchasePriceUSD = convertCurrency(parseFloat(purchasePrice), currency, 'USD')

      const newHolding: PortfolioHolding = {
        id: Date.now().toString(),
        coinId: selectedCoin.id,
        amount: parseFloat(amount),
        purchasePrice: purchasePriceUSD,
      }
      savePortfolio([...portfolio, newHolding])
      setIsAddDialogOpen(false)
      setSelectedCoin(null)
      setAmount('')
      setPurchasePrice('')
    }
  }

  const removeCoin = (id: string) => {
    savePortfolio(portfolio.filter(holding => holding.id !== id))
  }

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const portfolioItems: PortfolioItem[] = portfolio.map(holding => {
    const coin = coins.find(c => c.id === holding.coinId)
    if (!coin) return null

    const currentValue = holding.amount * coin.current_price
    const profitLoss = currentValue - (holding.amount * holding.purchasePrice)
    const profitLossPercentage = ((coin.current_price - holding.purchasePrice) / holding.purchasePrice) * 100

    return {
      ...holding,
      coin,
      currentValue,
      profitLoss,
      profitLossPercentage
    }
  }).filter(Boolean) as PortfolioItem[]

  const totalPortfolioValue = portfolioItems.reduce((sum, item) => sum + item.currentValue, 0)
  const totalProfitLoss = portfolioItems.reduce((sum, item) => sum + item.profitLoss, 0)

  const pieChartData = portfolioItems.map(item => ({
    name: item.coin.symbol.toUpperCase(),
    value: item.currentValue,
    percentage: (item.currentValue / totalPortfolioValue) * 100,
    fullName: item.coin.name
  }))

  // Local format function - context formatCurrency is used instead
  const formatCurrencyLocal = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B'
    if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M'
    if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K'
    return value.toFixed(2)
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="container mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Crypto Portfolio Tracker</h1>
          <div className="flex items-center gap-4">
            <CurrencySelector />
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Coin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Cryptocurrency</DialogTitle>
                  <DialogDescription>
                    Search and add a cryptocurrency to your portfolio
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search coins..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredCoins.slice(0, 10).map((coin) => (
                      <div
                        key={coin.id}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                        onClick={() => setSelectedCoin(coin)}
                      >
                        <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                        <div className="flex-1">
                          <div className="font-medium">{coin.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {coin.symbol.toUpperCase()} • {formatCurrency(coin.current_price)}
                          </div>
                        </div>
                        <div className={`text-right ${coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedCoin && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <img src={selectedCoin.image} alt={selectedCoin.name} className="w-10 h-10" />
                        <div>
                          <div className="font-medium">{selectedCoin.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedCoin.symbol.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Amount</label>
                          <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Purchase Price ({currency})</label>
                          <Input
                            type="number"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addCoin} disabled={!selectedCoin || !amount || !purchasePrice}>
                    Add to Portfolio
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
              <p className="text-xs text-muted-foreground">
                Across {portfolioItems.length} cryptocurrencies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit/Loss</CardTitle>
              {totalProfitLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalProfitLoss)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalPortfolioValue > 0 ? ((totalProfitLoss / totalPortfolioValue) * 100).toFixed(2) : 0}% overall
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assets</CardTitle>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioItems.length}</div>
              <p className="text-xs text-muted-foreground">
                Active holdings
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Distribution</CardTitle>
              <CardDescription>Your portfolio allocation by cryptocurrency</CardDescription>
            </CardHeader>
            <CardContent>
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percentage }) => `${name} ${(percentage as number).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        formatCurrency(value),
                        `${props.payload.fullName} (${props.payload.percentage.toFixed(1)}%)`
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => `${entry.payload.name} (${entry.payload.percentage.toFixed(1)}%)`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-300 text-muted-foreground">
                  No assets in portfolio
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
              <CardDescription>Top cryptocurrencies by market cap</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {coins.slice(0, 5).map((coin) => (
                  <div key={coin.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                      <div>
                        <div className="font-medium">{coin.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {coin.symbol.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(coin.current_price)}</div>
                      <div className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Holdings</CardTitle>
            <CardDescription>Manage your cryptocurrency portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            {portfolioItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coin</TableHead>
                    <TableHead>Holdings</TableHead>
                    <TableHead>Avg Buy Price</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Profit/Loss</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolioItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img src={item.coin.image} alt={item.coin.name} className="w-8 h-8" />
                          <div>
                            <div className="font-medium">{item.coin.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.coin.symbol.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.amount.toFixed(4)}</TableCell>
                      <TableCell>{formatCurrency(convertCurrency(item.purchasePrice, 'USD', currency))}</TableCell>
                      <TableCell>{formatCurrency(item.coin.current_price)}</TableCell>
                      <TableCell>{formatCurrency(item.currentValue)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={item.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(item.profitLoss)}
                          </span>
                          <span className={`text-sm ${item.profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.profitLossPercentage.toFixed(2)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCoin(item.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No assets in portfolio. Click "Add Coin" to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}