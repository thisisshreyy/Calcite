import { useMemo, useState } from "react"
import {
  ArrowDown,
CircleDollarSign,
  Plus,
  Settings2,
  Trash2,
  X,
} from "lucide-react"

type Expense = {
  id: string
  amount: number
  category: string
  note: string
  date: string
}

const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Stationery",
  "College",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Travel",
  "Other",
]

const DEFAULT_AMOUNTS = [20, 50, 100, 200, 500, 1000]

const EXPENSES_KEY = "calcite_expenses"
const CATEGORIES_KEY = "calcite_expense_categories"
const AMOUNTS_KEY = "calcite_expense_amounts"

function load<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    load<Expense[]>(EXPENSES_KEY, []),
  )

  const [categories, setCategories] = useState<string[]>(() =>
    load<string[]>(CATEGORIES_KEY, DEFAULT_CATEGORIES),
  )

  const [amounts, setAmounts] = useState<number[]>(() =>
    load<number[]>(AMOUNTS_KEY, DEFAULT_AMOUNTS),
  )

  const [category, setCategory] = useState("Food")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showAmountManager, setShowAmountManager] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [newAmount, setNewAmount] = useState("")

  const persistExpenses = (next: Expense[]) => {
    setExpenses(next)
    save(EXPENSES_KEY, next)
  }

  const addExpense = () => {
    const numericAmount = Number(amount)

    if (!numericAmount || numericAmount <= 0) {
      return
    }

    const expense: Expense = {
      id: `expense_${Date.now()}`,
      amount: numericAmount,
      category,
      note: note.trim(),
      date: new Date().toISOString(),
    }

    persistExpenses([expense, ...expenses])
    setAmount("")
    setNote("")
  }

  const removeExpense = (id: string) => {
    persistExpenses(expenses.filter((expense) => expense.id !== id))
  }

  const addCategory = () => {
    const value = newCategory.trim()

    if (!value || categories.includes(value)) {
      return
    }

    const next = [...categories, value]
    setCategories(next)
    save(CATEGORIES_KEY, next)
    setCategory(value)
    setNewCategory("")
  }

  const deleteCategory = (value: string) => {
    if (categories.length <= 1) {
      return
    }

    const next = categories.filter((item) => item !== value)
    setCategories(next)
    save(CATEGORIES_KEY, next)

    if (category === value) {
      setCategory(next[0])
    }
  }

  const addAmountPreset = () => {
    const value = Number(newAmount)

    if (!value || value <= 0 || amounts.includes(value)) {
      return
    }

    const next = [...amounts, value].sort((a, b) => a - b)
    setAmounts(next)
    save(AMOUNTS_KEY, next)
    setNewAmount("")
  }

  const deleteAmountPreset = (value: number) => {
    const next = amounts.filter((item) => item !== value)
    setAmounts(next)
    save(AMOUNTS_KEY, next)
  }

  const total = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  )

  const todayTotal = useMemo(() => {
    const today = new Date().toDateString()

    return expenses
      .filter((expense) => new Date(expense.date).toDateString() === today)
      .reduce((sum, expense) => sum + expense.amount, 0)
  }, [expenses])

  const monthTotal = useMemo(() => {
    const now = new Date()

    return expenses
      .filter((expense) => {
        const date = new Date(expense.date)
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        )
      })
      .reduce((sum, expense) => sum + expense.amount, 0)
  }, [expenses])

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {}

    for (const expense of expenses) {
      totals[expense.category] =
        (totals[expense.category] ?? 0) + expense.amount
    }

    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  }, [expenses])

  const formatMoney = (value: number) =>
    `?${value.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`

  return (
    <main className="min-w-0 flex-1 overflow-y-auto pb-24 md:pb-0">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
        <p className="text-sm text-[#9A91AA]">Personal finance</p>

        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#F4F0FF]">
              Expenses
            </h1>
            <p className="mt-2 text-[#777080]">
              Quickly record and understand where your money goes.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCategoryManager(true)}
              className="flex items-center gap-2 rounded-xl border border-[#2B213A] bg-[#14101D] px-4 py-2.5 text-sm text-[#B9AEC9] transition hover:bg-[#1C1628]"
            >
              <Settings2 size={16} />
              Categories
            </button>

            <button
              onClick={() => setShowAmountManager(true)}
              className="flex items-center gap-2 rounded-xl border border-[#2B213A] bg-[#14101D] px-4 py-2.5 text-sm text-[#B9AEC9] transition hover:bg-[#1C1628]"
            >
              <Settings2 size={16} />
              Amounts
            </button>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-5">
            <p className="text-sm text-[#777080]">Today</p>
            <p className="mt-2 text-3xl font-semibold text-[#F4F0FF]">
              {formatMoney(todayTotal)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-5">
            <p className="text-sm text-[#777080]">This month</p>
            <p className="mt-2 text-3xl font-semibold text-[#F4F0FF]">
              {formatMoney(monthTotal)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-5">
            <p className="text-sm text-[#777080]">All recorded</p>
            <p className="mt-2 text-3xl font-semibold text-[#F4F0FF]">
              {formatMoney(total)}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#2B213A] bg-[#14101D] p-5 md:p-6">
          <div className="flex items-center gap-2">
            <CircleDollarSign size={20} className="text-[#9B6CFF]" />
            <h2 className="font-semibold text-[#F4F0FF]">Add expense</h2>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-xs uppercase tracking-wider text-[#777080]">
              Category
            </p>

            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-xl px-4 py-2.5 text-sm transition ${
                    category === item
                      ? "bg-[#9B6CFF] text-white"
                      : "border border-[#2B213A] bg-[#1C1628] text-[#B9AEC9] hover:bg-[#251C32]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-xs uppercase tracking-wider text-[#777080]">
              Amount
            </p>

            <div className="flex flex-wrap gap-2">
              {amounts.map((value) => (
                <button
                  key={value}
                  onClick={() => setAmount(String(value))}
                  className={`rounded-xl px-4 py-2.5 text-sm transition ${
                    amount === String(value)
                      ? "bg-[#9B6CFF] text-white"
                      : "border border-[#2B213A] bg-[#1C1628] text-[#B9AEC9] hover:bg-[#251C32]"
                  }`}
                >
                  ?{value.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[180px_1fr_auto]">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777080]">
                ?
              </span>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                min="0"
                placeholder="Amount"
                className="w-full rounded-xl border border-[#2B213A] bg-[#0F0B16] py-3 pl-9 pr-4 text-[#F4F0FF] outline-none placeholder:text-[#5F586A] focus:border-[#9B6CFF]"
              />
            </div>

            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note — e.g. college canteen"
              className="rounded-xl border border-[#2B213A] bg-[#0F0B16] px-4 py-3 text-[#F4F0FF] outline-none placeholder:text-[#5F586A] focus:border-[#9B6CFF]"
            />

            <button
              onClick={addExpense}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#9B6CFF] px-5 py-3 font-medium text-white transition hover:brightness-110"
            >
              <Plus size={18} />
              Add
            </button>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-2xl border border-[#2B213A] bg-[#14101D]">
            <div className="border-b border-[#2B213A] px-5 py-4">
              <h2 className="font-semibold text-[#F4F0FF]">
                Recent expenses
              </h2>
            </div>

            {expenses.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <ArrowDown className="mx-auto text-[#5F586A]" size={26} />
                <p className="mt-3 text-[#9A91AA]">No expenses yet.</p>
                <p className="mt-1 text-sm text-[#5F586A]">
                  Your spending history will appear here.
                </p>
              </div>
            ) : (
              <div>
                {expenses.slice(0, 20).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-4 border-b border-[#21192C] px-5 py-4 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[#F4F0FF]">
                        {expense.category}
                      </p>

                      <p className="mt-1 truncate text-sm text-[#777080]">
                        {expense.note || "No note"} ·{" "}
                        {new Date(expense.date).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold text-[#F4F0FF]">
                        {formatMoney(expense.amount)}
                      </span>

                      <button
                        onClick={() => removeExpense(expense.id)}
                        className="rounded-lg p-2 text-[#777080] transition hover:bg-[#251C32] hover:text-[#E9A7C0]"
                        title="Delete expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-5">
            <h2 className="font-semibold text-[#F4F0FF]">
              Spending by category
            </h2>

            {categoryTotals.length === 0 ? (
              <p className="mt-8 text-sm text-[#777080]">
                Add some expenses to see the breakdown.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {categoryTotals.map(([name, value]) => (
                  <div key={name}>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#B9AEC9]">{name}</span>
                      <span className="font-medium text-[#F4F0FF]">
                        {formatMoney(value)}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#0F0B16]">
                      <div
                        className="h-full rounded-full bg-[#9B6CFF]"
                        style={{
                          width: `${Math.min((value / Math.max(total, 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {showCategoryManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2B213A] bg-[#14101D] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#F4F0FF]">
                Expense categories
              </h2>

              <button
                onClick={() => setShowCategoryManager(false)}
                className="text-[#777080] hover:text-[#F4F0FF]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 flex gap-2">
              <input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    addCategory()
                  }
                }}
                placeholder="New category"
                className="min-w-0 flex-1 rounded-xl border border-[#2B213A] bg-[#0F0B16] px-4 py-3 text-[#F4F0FF] outline-none focus:border-[#9B6CFF]"
              />

              <button
                onClick={addCategory}
                className="rounded-xl bg-[#9B6CFF] px-4 text-white"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="mt-5 max-h-72 space-y-2 overflow-y-auto">
              {categories.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl bg-[#1C1628] px-4 py-3"
                >
                  <span className="text-sm text-[#F4F0FF]">{item}</span>

                  <button
                    onClick={() => deleteCategory(item)}
                    className="text-[#777080] hover:text-[#E9A7C0]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAmountManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2B213A] bg-[#14101D] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#F4F0FF]">
                Amount presets
              </h2>

              <button
                onClick={() => setShowAmountManager(false)}
                className="text-[#777080] hover:text-[#F4F0FF]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 flex gap-2">
              <input
                value={newAmount}
                onChange={(event) => setNewAmount(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    addAmountPreset()
                  }
                }}
                type="number"
                min="1"
                placeholder="e.g. 30"
                className="min-w-0 flex-1 rounded-xl border border-[#2B213A] bg-[#0F0B16] px-4 py-3 text-[#F4F0FF] outline-none focus:border-[#9B6CFF]"
              />

              <button
                onClick={addAmountPreset}
                className="rounded-xl bg-[#9B6CFF] px-4 text-white"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {amounts.map((value) => (
                <div
                  key={value}
                  className="flex items-center justify-between rounded-xl bg-[#1C1628] px-4 py-3"
                >
                  <span className="text-sm text-[#F4F0FF]">
                    ?{value.toLocaleString("en-IN")}
                  </span>

                  <button
                    onClick={() => deleteAmountPreset(value)}
                    className="text-[#777080] hover:text-[#E9A7C0]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Expenses

