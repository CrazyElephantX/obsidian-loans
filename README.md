# Obsidian Loans Tracker

**Multi‑language plugin for tracking loans, payments, and calculating optimal early repayment.**

![Languages](https://img.shields.io/badge/languages-English%20%7C%20Russian-blue)

## Choose your language / Выберите язык

- **[English documentation](README_EN.md)** – full guide in English
- **[Документация на русском](README_RU.md)** – полное руководство на русском

## Quick Overview

This Obsidian plugin helps you manage loans, track payments, and decide which loan to pay off first when you have extra money.

### Key Features
- 📊 **Loan management** – add, edit, delete loans with detailed parameters
- 📅 **Automatic payment schedules** – annuity or differentiated
- ✅ **Payment tracking** – mark payments as paid, view status (pending/paid/overdue)
- 📈 **Visual statistics** – progress bars, remaining debt, total overpayment
- 🧮 **Optimal repayment calculator** – suggests the best loan to pay off first
- 🔔 **Notifications** – alerts for overdue payments
- ⚙️ **Customizable settings** – currency, storage file, notifications
- 🌐 **Auto‑detected language** – English or Russian based on Obsidian’s language

## Installation

### Via BRAT (recommended)
1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin.
2. Add this repository: `https://github.com/your‑username/obsidian‑loans`.
3. Enable the plugin in Obsidian’s community plugins.

### Manual Installation
1. Download the latest release.
2. Extract to `.obsidian/plugins/obsidian‑loans/` in your vault.
3. Enable the plugin in settings.

## Usage Example

1. Click the `$` icon in the sidebar.
2. Add a loan (e.g., “Mortgage”, 5 000 000 RUB, 7.5 %, 240 months).
3. See the generated payment schedule.
4. Mark payments as you pay them.
5. Use the calculator to see which loan to repay first with extra funds.

## Development

```bash
npm install
npm run build   # production build
npm run dev     # development with watch mode
```

## License

MIT – see [LICENSE](LICENSE).

## Author

**Vladimir Burmistrov**  
Website: https://bv‑dev.ru/  
Support: https://boosty.to/crazyelephant

---

*The plugin automatically switches between English and Russian based on your Obsidian language setting.*