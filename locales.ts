// Локализации для плагина Loans Tracker

export type Language = 'ru' | 'en';

export interface Translations {
	// Общие
	pluginName: string;
	addLoan: string;
	editLoan: string;
	deleteLoan: string;
	save: string;
	cancel: string;
	close: string;
	back: string;
	yes: string;
	no: string;

	// Кредит
	loanName: string;
	totalAmount: string;
	interestRate: string;
	termMonths: string;
	startDate: string;
	paymentType: string;
	paymentTypeAnnuity: string;
	paymentTypeDifferentiated: string;
	currency: string;
	notes: string;

	// Платежи
	payments: string;
	paymentDate: string;
	paymentAmount: string;
	principal: string;
	interest: string;
	status: string;
	statusPending: string;
	statusPaid: string;
	statusOverdue: string;
	paidAmount: string;
	paidDate: string;
	markAsPaid: string;

	// Статистика
	overallStats: string;
	totalLoans: string;
	totalDebt: string;
	totalPaid: string;
	totalOverpaid: string;
	remainingPrincipal: string;
	progress: string;
	nextPayment: string;
	nextPaymentDate: string;
	nextPaymentAmount: string;

	// Действия
	actions: string;
	addNewLoan: string;
	repaymentCalculator: string;
	refresh: string;
	openLoansView: string;
	markPaymentPaid: string;

	// Калькулятор
	calculatorTitle: string;
	calculatorDescription: string;
	enterAmount: string;
	calculate: string;
	recommendations: string;
	loanToRepay: string;
	amountToRepay: string;
	savedInterest: string;
	newRemaining: string;
	noActiveLoans: string;

	// Настройки
	settingsTitle: string;
	storageFile: string;
	storageFileDesc: string;
	defaultCurrency: string;
	defaultCurrencyDesc: string;
	showNotifications: string;
	showNotificationsDesc: string;
	autoCalculatePayments: string;
	autoCalculatePaymentsDesc: string;

	// Уведомления
	notificationOverdue: string;
	loanAdded: string;
	loanUpdated: string;
	loanDeleted: string;
	paymentMarkedPaid: string;

	// Ошибки
	errorRequiredField: string;
	errorInvalidNumber: string;
	errorLoanNotFound: string;
	errorPaymentNotFound: string;
}

export const translations: Record<Language, Translations> = {
	ru: {
		pluginName: 'Учет кредитов',
		addLoan: 'Добавить кредит',
		editLoan: 'Редактировать кредит',
		deleteLoan: 'Удалить кредит',
		save: 'Сохранить',
		cancel: 'Отмена',
		close: 'Закрыть',
		back: 'Назад',
		yes: 'Да',
		no: 'Нет',

		loanName: 'Название кредита',
		totalAmount: 'Сумма кредита',
		interestRate: 'Процентная ставка (% год.)',
		termMonths: 'Срок (месяцев)',
		startDate: 'Дата начала',
		paymentType: 'Тип платежа',
		paymentTypeAnnuity: 'Аннуитетный',
		paymentTypeDifferentiated: 'Дифференцированный',
		currency: 'Валюта',
		notes: 'Заметки',

		payments: 'Платежи',
		paymentDate: 'Дата',
		paymentAmount: 'Сумма',
		principal: 'Основной долг',
		interest: 'Проценты',
		status: 'Статус',
		statusPending: 'ожидает',
		statusPaid: 'оплачен',
		statusOverdue: 'просрочен',
		paidAmount: 'Фактически уплаченная сумма',
		paidDate: 'Дата оплаты',
		markAsPaid: 'Отметить оплату',

		overallStats: 'Общая статистика',
		totalLoans: 'Всего кредитов',
		totalDebt: 'Общий долг',
		totalPaid: 'Выплачено',
		totalOverpaid: 'Переплата',
		remainingPrincipal: 'Остаток долга',
		progress: 'Прогресс',
		nextPayment: 'Следующий платеж',
		nextPaymentDate: 'Дата',
		nextPaymentAmount: 'Сумма',

		actions: 'Действия',
		addNewLoan: '➕ Добавить кредит',
		repaymentCalculator: '🧮 Калькулятор погашения',
		refresh: '🔄 Обновить',
		openLoansView: 'Открыть панель учета кредитов',
		markPaymentPaid: 'Отметить платеж как выполненный',

		calculatorTitle: 'Калькулятор выгодного погашения',
		calculatorDescription: 'Введите сумму, которую можете направить на досрочное погашение:',
		enterAmount: 'Сумма',
		calculate: 'Рассчитать',
		recommendations: 'Рекомендации:',
		loanToRepay: 'Кредит',
		amountToRepay: 'Сумма к погашению',
		savedInterest: 'Экономия на процентах',
		newRemaining: 'Новый остаток',
		noActiveLoans: 'Нет активных кредитов для погашения.',

		settingsTitle: 'Настройки плагина учета кредитов',
		storageFile: 'Файл хранения данных',
		storageFileDesc: 'JSON файл, где хранятся данные о кредитах',
		defaultCurrency: 'Валюта по умолчанию',
		defaultCurrencyDesc: 'Валюта для новых кредитов (RUB, USD, EUR и т.д.)',
		showNotifications: 'Уведомления',
		showNotificationsDesc: 'Показывать уведомления о просроченных платежах',
		autoCalculatePayments: 'Авторасчет платежей',
		autoCalculatePaymentsDesc: 'Автоматически пересчитывать график платежей при изменении кредита',

		notificationOverdue: 'Внимание: у вас {count} просроченных платежей!',
		loanAdded: 'Кредит "{name}" добавлен',
		loanUpdated: 'Кредит "{name}" обновлен',
		loanDeleted: 'Кредит "{name}" удален',
		paymentMarkedPaid: 'Платеж отмечен как выполненный',

		errorRequiredField: 'Это поле обязательно',
		errorInvalidNumber: 'Введите корректное число',
		errorLoanNotFound: 'Кредит не найден',
		errorPaymentNotFound: 'Платеж не найден',
	},
	en: {
		pluginName: 'Loans Tracker',
		addLoan: 'Add Loan',
		editLoan: 'Edit Loan',
		deleteLoan: 'Delete Loan',
		save: 'Save',
		cancel: 'Cancel',
		close: 'Close',
		back: 'Back',
		yes: 'Yes',
		no: 'No',

		loanName: 'Loan Name',
		totalAmount: 'Total Amount',
		interestRate: 'Interest Rate (% annual)',
		termMonths: 'Term (months)',
		startDate: 'Start Date',
		paymentType: 'Payment Type',
		paymentTypeAnnuity: 'Annuity',
		paymentTypeDifferentiated: 'Differentiated',
		currency: 'Currency',
		notes: 'Notes',

		payments: 'Payments',
		paymentDate: 'Date',
		paymentAmount: 'Amount',
		principal: 'Principal',
		interest: 'Interest',
		status: 'Status',
		statusPending: 'pending',
		statusPaid: 'paid',
		statusOverdue: 'overdue',
		paidAmount: 'Paid Amount',
		paidDate: 'Paid Date',
		markAsPaid: 'Mark as Paid',

		overallStats: 'Overall Statistics',
		totalLoans: 'Total Loans',
		totalDebt: 'Total Debt',
		totalPaid: 'Total Paid',
		totalOverpaid: 'Overpaid',
		remainingPrincipal: 'Remaining Principal',
		progress: 'Progress',
		nextPayment: 'Next Payment',
		nextPaymentDate: 'Date',
		nextPaymentAmount: 'Amount',

		actions: 'Actions',
		addNewLoan: '➕ Add Loan',
		repaymentCalculator: '🧮 Repayment Calculator',
		refresh: '🔄 Refresh',
		openLoansView: 'Open Loans Panel',
		markPaymentPaid: 'Mark Payment as Paid',

		calculatorTitle: 'Optimal Repayment Calculator',
		calculatorDescription: 'Enter the amount you can allocate for early repayment:',
		enterAmount: 'Amount',
		calculate: 'Calculate',
		recommendations: 'Recommendations:',
		loanToRepay: 'Loan',
		amountToRepay: 'Amount to Repay',
		savedInterest: 'Interest Saved',
		newRemaining: 'New Remaining',
		noActiveLoans: 'No active loans to repay.',

		settingsTitle: 'Loans Tracker Plugin Settings',
		storageFile: 'Storage File',
		storageFileDesc: 'JSON file where loan data is stored',
		defaultCurrency: 'Default Currency',
		defaultCurrencyDesc: 'Currency for new loans (RUB, USD, EUR, etc.)',
		showNotifications: 'Notifications',
		showNotificationsDesc: 'Show notifications for overdue payments',
		autoCalculatePayments: 'Auto-calculate Payments',
		autoCalculatePaymentsDesc: 'Automatically recalculate payment schedule when loan changes',

		notificationOverdue: 'Warning: you have {count} overdue payments!',
		loanAdded: 'Loan "{name}" added',
		loanUpdated: 'Loan "{name}" updated',
		loanDeleted: 'Loan "{name}" deleted',
		paymentMarkedPaid: 'Payment marked as paid',

		errorRequiredField: 'This field is required',
		errorInvalidNumber: 'Enter a valid number',
		errorLoanNotFound: 'Loan not found',
		errorPaymentNotFound: 'Payment not found',
	},
};

// Определение языка Obsidian
export function getObsidianLanguage(): Language {
	// @ts-ignore
	const appLang = window.app?.settings?.language || navigator.language || 'en';
	return appLang.startsWith('ru') ? 'ru' : 'en';
}

// Хелпер для форматирования строк с параметрами
export function t(key: keyof Translations, lang: Language, params?: Record<string, string | number>): string {
	let text = translations[lang][key];
	if (params) {
		Object.entries(params).forEach(([k, v]) => {
			text = text.replace(`{${k}}`, String(v));
		});
	}
	return text;
}