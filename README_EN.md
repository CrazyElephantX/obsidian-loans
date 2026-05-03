# Obsidian Loans Tracker

An Obsidian plugin for tracking loans, monitoring payments, and calculating optimal early repayment strategies.

## Features

- 📊 **Loan Management**: Add, edit, and delete loans with detailed parameters (amount, interest rate, term, payment type).
- 📅 **Payment Schedule**: Automatic generation of payment schedules (annuity or differentiated).
- ✅ **Payment Tracking**: Mark payments as completed, view status (pending, paid, overdue).
- 📈 **Statistics**: Visualize repayment progress, remaining debt, total overpayment.
- 🧮 **Optimal Repayment Calculator**: Determine which loan to pay off first when you have extra funds.
- 🔔 **Notifications**: Automatic reminders for overdue payments.
- ⚙️ **Settings**: Customizable currency, data storage file, and notification preferences.
- 🌐 **Multi‑language Support**: Automatically detects Obsidian's language (English/Russian).

## Installation

### Manual Installation
1. Download the latest release (or clone the repository).
2. Copy the plugin folder to `.obsidian/plugins/obsidian-loans/` in your Obsidian vault.
3. Enable the plugin in Obsidian settings (Community plugins).

### Installation via BRAT (recommended)
1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin.
2. Add this repository: `https://github.com/your-username/obsidian-loans`.
3. Enable the plugin in settings.

## Usage

### Adding a Loan
1. Click the `$` icon in the sidebar or run the command `Loans Tracker: Open Loans Panel`.
2. Click the `➕ Add Loan` button.
3. Fill out the form:
   - **Loan Name**: A descriptive name for identification.
   - **Total Amount**: The full loan amount.
   - **Interest Rate**: Annual interest rate (in percent).
   - **Term**: Number of months.
   - **Start Date**: Date the loan was issued.
   - **Payment Type**: Annuity (equal payments) or Differentiated (decreasing payments).
   - **Currency**: RUB, USD, EUR, etc.
   - **Notes**: Additional information.
4. Click "Save". The plugin will automatically generate a payment schedule.

### Viewing Loans
The main window displays:
- Overall statistics: number of loans, total debt, total paid, overpayment.
- List of loans with a repayment progress bar.
- For each loan: remaining principal and repayment percentage.

### Marking a Payment
1. In the main window, click the "Payments" button for the desired loan.
2. In the payments table, click "Mark as Paid" for a pending payment.
3. Enter the actual paid amount and payment date.

### Optimal Repayment Calculator
1. Click the `🧮 Repayment Calculator` button in the main window.
2. Enter the amount you can allocate for early repayment.
3. The plugin will suggest the optimal strategy: repay the loan with the highest interest rate first to maximize interest savings.

## Settings

Go to `Obsidian Settings → Community Plugins → Loans Tracker`:

- **Storage File**: Path to the JSON file where loan data is stored (default `loans-data.json`).
- **Default Currency**: Currency for new loans.
- **Notifications**: Enable/disable notifications for overdue payments.
- **Auto‑calculate Payments**: Automatically recalculate the payment schedule when loan parameters change.

## Data Structure

Data is stored in a JSON file (default `loans-data.json`) in the root of your Obsidian vault. Example structure:

```json
{
  "loans": [
    {
      "id": "loan_123456789",
      "name": "Mortgage",
      "totalAmount": 5000000,
      "interestRate": 7.5,
      "termMonths": 240,
      "startDate": "2025-01-01",
      "paymentType": "annuity",
      "currency": "RUB",
      "notes": "New apartment",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:00:00.000Z"
    }
  ],
  "payments": [
    {
      "id": "payment_loan_123456789_1",
      "loanId": "loan_123456789",
      "date": "2025-02-01",
      "amount": 40255.42,
      "principal": 25680.42,
      "interest": 14575.00,
      "status": "paid",
      "paidAmount": 40255.42,
      "paidDate": "2025-02-01",
      "notes": "Payment 1 of 240"
    }
  ],
  "lastUpdated": "2025-01-15T12:30:45.123Z"
}
```

## Development

### Requirements
- Node.js 16+
- Obsidian (for testing)

### Install Dependencies
```bash
npm install
```

### Build
```bash
npm run build   # production build
npm run dev     # development with watch mode
```

### Project Structure
```
obsidian-loans/
├── main.ts              # Main plugin code
├── locales.ts           # Localizations (English/Russian)
├── styles.css           # Styles
├── manifest.json        # Plugin metadata
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── esbuild.config.mjs   # Build configuration
├── version-bump.mjs     # Version bump script
└── README.md            # Documentation
```

## License

MIT License. See the [LICENSE](LICENSE) file for details.

## Support

If you find a bug or have a suggestion, please open an issue in the project repository.

---

**Author**: Vladimir Burmistrov  
**Website**: https://bv-dev.ru/  
**Support**: https://boosty.to/crazyelephant