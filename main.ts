import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { getObsidianLanguage, t, Translations, Language } from './locales';

// ==================== ИНТЕРФЕЙСЫ ДАННЫХ ====================

export interface Loan {
	id: string;
	name: string;
	totalAmount: number;
	interestRate: number;
	termMonths: number;
	startDate: string;
	paymentType: 'annuity' | 'differentiated';
	currency: string;
	notes: string;
	createdAt: string;
	updatedAt: string;
	hidden?: boolean;
}

export interface Payment {
	id: string;
	loanId: string;
	date: string;
	amount: number;
	principal: number;
	interest: number;
	status: 'pending' | 'paid' | 'overdue';
	paidAmount?: number;
	paidDate?: string;
	notes: string;
}

export interface LoanStats {
	loan: Loan;
	totalPaid: number;
	remainingPrincipal: number;
	overpaid: number;
	nextPaymentDate?: string;
	nextPaymentAmount?: number;
	progress: number;
}

// ==================== НАСТРОЙКИ ====================

interface LoansPluginSettings {
	storageFile: string;
	defaultCurrency: string;
	showNotifications: boolean;
	autoCalculatePayments: boolean;
}

const DEFAULT_SETTINGS: LoansPluginSettings = {
	storageFile: 'loans-data.json',
	defaultCurrency: 'RUB',
	showNotifications: true,
	autoCalculatePayments: true
};

// ==================== ГЛАВНЫЙ ПЛАГИН ====================

export default class LoansPlugin extends Plugin {
	settings: LoansPluginSettings = DEFAULT_SETTINGS;
	loans: Loan[] = [];
	payments: Payment[] = [];
	language: Language = 'en';

	async onload() {
		await this.loadSettings();
		await this.loadData();
		this.language = getObsidianLanguage();

		this.addStyle();

		this.addCommand({
			id: 'open-loans-view',
			name: this.tr('openLoansView'),
			callback: () => new LoansView(this.app, this).open()
		});

		this.addCommand({
			id: 'add-new-loan',
			name: this.tr('addLoan'),
			callback: () => new LoanEditModal(this.app, this).open()
		});

		this.addRibbonIcon('dollar-sign', this.tr('pluginName'), () => {
			new LoansView(this.app, this).open();
		});

		this.addSettingTab(new LoansSettingTab(this.app, this));

		this.registerInterval(window.setInterval(() => this.checkOverduePayments(), 60 * 60 * 1000));
	}

	async onunload() {
		await this.saveData();
	}

	addStyle() {
		const style = document.createElement('style');
		style.textContent = `
			.loans-plugin-container { padding: 20px; }
			.loans-overall-stats {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
				gap: 15px;
				margin: 20px 0;
				padding: 15px;
				background: var(--background-secondary);
				border-radius: 8px;
			}
			.loan-item {
				margin: 15px 0;
				padding: 15px;
				background: var(--background-secondary);
				border-radius: 8px;
				border-left: 4px solid var(--interactive-accent);
			}
			.progress-bar {
				height: 8px;
				background: var(--background-modifier-border);
				border-radius: 4px;
				margin: 10px 0;
				overflow: hidden;
			}
			.progress-fill {
				height: 100%;
				background: var(--interactive-accent);
				border-radius: 4px;
			}
			.loans-actions { display: flex; gap: 10px; margin: 20px 0; }
			.loans-actions button {
				padding: 8px 16px;
				background: var(--interactive-accent);
				color: var(--text-on-accent);
				border: none;
				border-radius: 4px;
				cursor: pointer;
			}
			.payment-status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
			.payment-status.pending { background: rgba(255,193,7,0.2); color: #ff9800; }
			.payment-status.paid { background: rgba(76,175,80,0.2); color: #4caf50; }
			.payment-status.overdue { background: rgba(244,67,54,0.2); color: #f44336; }
		`;
		document.head.appendChild(style);
	}

	async loadSettings() {
		const data = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async loadData() {
		try {
			const data = await this.app.vault.adapter.read(this.settings.storageFile);
			return JSON.parse(data);
		} catch {
			return {};
		}
	}

	async saveData(data?: any) {
		if (data) {
			await this.saveData(data);
		} else {
			const content = JSON.stringify({
				loans: this.loans,
				payments: this.payments,
				lastUpdated: new Date().toISOString()
			}, null, 2);
			await this.app.vault.adapter.write(this.settings.storageFile, content);
		}
	}

	// ==================== CRUD КРЕДИТОВ ====================

	addLoan(loan: Loan) {
		loan.id = 'loan_' + Date.now();
		loan.createdAt = new Date().toISOString();
		loan.updatedAt = loan.createdAt;
		this.loans.push(loan);
		this.generatePayments(loan);
		this.saveData();
		new Notice(this.tr('loanAdded', { name: loan.name }));
	}

	updateLoan(loan: Loan) {
		const idx = this.loans.findIndex(l => l.id === loan.id);
		if (idx >= 0) {
			loan.updatedAt = new Date().toISOString();
			this.loans[idx] = loan;
			this.regeneratePayments(loan);
			this.saveData();
			new Notice(this.tr('loanUpdated', { name: loan.name }));
		}
	}

	deleteLoan(loanId: string) {
		const loan = this.loans.find(l => l.id === loanId);
		this.loans = this.loans.filter(l => l.id !== loanId);
		this.payments = this.payments.filter(p => p.loanId !== loanId);
		this.saveData();
		if (loan) new Notice(this.tr('loanDeleted', { name: loan.name }));
	}

	// ==================== ГЕНЕРАЦИЯ ПЛАТЕЖЕЙ ====================

	generatePayments(loan: Loan) {
		const monthlyRate = loan.interestRate / 100 / 12;
		const payments: Payment[] = [];

		for (let i = 1; i <= loan.termMonths; i++) {
			const paymentDate = new Date(loan.startDate);
			paymentDate.setMonth(paymentDate.getMonth() + i);
			const dateStr = paymentDate.toISOString().split('T')[0];

			let amount = 0, principal = 0, interest = 0;
			if (loan.paymentType === 'annuity') {
				const annuityCoeff = monthlyRate * Math.pow(1 + monthlyRate, loan.termMonths) /
									 (Math.pow(1 + monthlyRate, loan.termMonths) - 1);
				amount = loan.totalAmount * annuityCoeff;
				interest = (loan.totalAmount - (i-1) * (loan.totalAmount / loan.termMonths)) * monthlyRate;
				principal = amount - interest;
			} else {
				principal = loan.totalAmount / loan.termMonths;
				interest = (loan.totalAmount - (i-1) * principal) * monthlyRate;
				amount = principal + interest;
			}

			payments.push({
				id: `payment_${loan.id}_${i}`,
				loanId: loan.id,
				date: dateStr,
				amount: Math.round(amount * 100) / 100,
				principal: Math.round(principal * 100) / 100,
				interest: Math.round(interest * 100) / 100,
				status: 'pending',
				notes: `Платеж ${i} из ${loan.termMonths}`
			});
		}

		this.payments.push(...payments);
	}

	regeneratePayments(loan: Loan) {
		this.payments = this.payments.filter(p => p.loanId !== loan.id);
		this.generatePayments(loan);
	}

	// ==================== ОПЕРАЦИИ С ПЛАТЕЖАМИ ====================

	markPaymentAsPaid(paymentId: string, paidAmount: number, paidDate: string) {
		const payment = this.payments.find(p => p.id === paymentId);
		if (payment) {
			payment.status = 'paid';
			payment.paidAmount = paidAmount;
			payment.paidDate = paidDate;
			this.saveData();
			new Notice(`Платеж отмечен как выполненный`);
		}
	}

	getPaymentsForLoan(loanId: string): Payment[] {
		return this.payments.filter(p => p.loanId === loanId).sort((a, b) => a.date.localeCompare(b.date));
	}

	// ==================== СТАТИСТИКА ====================

	getLoanStats(loanId: string): LoanStats {
		const loan = this.loans.find(l => l.id === loanId);
		if (!loan) throw new Error('Кредит не найден');

		const loanPayments = this.getPaymentsForLoan(loanId);
		const paidPayments = loanPayments.filter(p => p.status === 'paid');

		const totalPaid = paidPayments.reduce((sum, p) => sum + (p.paidAmount || p.amount), 0);
		const totalPrincipal = paidPayments.reduce((sum, p) => sum + p.principal, 0);
		const remainingPrincipal = loan.totalAmount - totalPrincipal;
		const totalInterest = paidPayments.reduce((sum, p) => sum + p.interest, 0);
		const overpaid = totalPaid - (totalPrincipal + totalInterest);

		const nextPayment = loanPayments.find(p => p.status === 'pending');

		return {
			loan,
			totalPaid,
			remainingPrincipal,
			overpaid,
			nextPaymentDate: nextPayment?.date,
			nextPaymentAmount: nextPayment?.amount,
			progress: loan.totalAmount > 0 ? (totalPrincipal / loan.totalAmount) * 100 : 0
		};
	}

	getOverallStats() {
		let totalDebt = 0, totalPaid = 0, totalOverpaid = 0;
		this.loans.forEach(loan => {
			const stats = this.getLoanStats(loan.id);
			totalDebt += stats.remainingPrincipal;
			totalPaid += stats.totalPaid;
			totalOverpaid += stats.overpaid;
		});

		return {
			totalLoans: this.loans.length,
			totalDebt,
			totalPaid,
			totalOverpaid,
			avgProgress: this.loans.length > 0 ?
				this.loans.reduce((sum, loan) => sum + this.getLoanStats(loan.id).progress, 0) / this.loans.length : 0
		};
	}

	// ==================== УПРАВЛЕНИЕ ВИДИМОСТЬЮ ====================

	toggleLoanHidden(loanId: string) {
		const loan = this.loans.find(l => l.id === loanId);
		if (loan) {
			loan.hidden = !loan.hidden;
			this.saveData();
			new Notice(loan.hidden ? 'Кредит скрыт' : 'Кредит показан');
		}
	}

	// ==================== ДОСРОЧНЫЙ ПЛАТЕЖ ====================

	makeEarlyRepayment(loanId: string, amount: number, date: string) {
		const loan = this.loans.find(l => l.id === loanId);
		if (!loan) throw new Error('Кредит не найден');

		// Создаем специальный платеж "Досрочное погашение"
		const payment: Payment = {
			id: `early_${loanId}_${Date.now()}`,
			loanId,
			date,
			amount,
			principal: amount, // Вся сумма идет в основной долг
			interest: 0,
			status: 'paid',
			paidAmount: amount,
			paidDate: date,
			notes: 'Досрочное погашение'
		};

		this.payments.push(payment);
		this.saveData();
		new Notice(this.tr('paymentMarkedPaid'));
	}

	// ==================== ЛОКАЛИЗАЦИЯ ====================

	tr(key: keyof Translations, params?: Record<string, string | number>): string {
		return t(key, this.language, params);
	}

	// ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================

	checkOverduePayments() {
		if (!this.settings.showNotifications) return;
		const today = new Date().toISOString().split('T')[0];
		const overdue = this.payments.filter(p => p.status === 'pending' && p.date < today);
		if (overdue.length > 0) {
			new Notice(`Внимание: у вас ${overdue.length} просроченных платежей!`);
		}
	}

	calculateOptimalRepayment(availableAmount: number): Array<{
		loan: Loan;
		amountToRepay: number;
		savedInterest: number;
		newRemaining: number;
	}> {
		const loansWithStats = this.loans.map(loan => ({
			loan,
			stats: this.getLoanStats(loan.id)
		})).filter(item => item.stats.remainingPrincipal > 0)
		  .sort((a, b) => b.loan.interestRate - a.loan.interestRate);

		const result: Array<{
			loan: Loan;
			amountToRepay: number;
			savedInterest: number;
			newRemaining: number;
		}> = [];
		let remaining = availableAmount;

		for (const item of loansWithStats) {
			if (remaining <= 0) break;
			const toRepay = Math.min(item.stats.remainingPrincipal, remaining);
			const savedInterest = toRepay * item.loan.interestRate / 100 / 12 * 6;
			result.push({
				loan: item.loan,
				amountToRepay: toRepay,
				savedInterest,
				newRemaining: item.stats.remainingPrincipal - toRepay
			});
			remaining -= toRepay;
		}

		return result;
	}
}

// ==================== МОДАЛЬНЫЕ ОКНА ====================

class LoanEditModal extends Modal {
	plugin: LoansPlugin;
	loan?: Loan;

	constructor(app: App, plugin: LoansPlugin, loan?: Loan) {
		super(app);
		this.plugin = plugin;
		this.loan = loan;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();

		contentEl.createEl('h2', {text: this.loan ? 'Редактировать кредит' : 'Добавить новый кредит'});

		const form = contentEl.createEl('form');

		// Название
		this.createInput(form, 'Название кредита', 'text', 'name', this.loan?.name || '', true);

		// Сумма, ставка, срок
		this.createInput(form, 'Сумма кредита', 'number', 'totalAmount', this.loan?.totalAmount.toString() || '100000', true);
		this.createInput(form, 'Процентная ставка (% год.)', 'number', 'interestRate', this.loan?.interestRate.toString() || '10', true);
		this.createInput(form, 'Срок (месяцев)', 'number', 'termMonths', this.loan?.termMonths.toString() || '12', true);
		this.createInput(form, 'Дата начала', 'date', 'startDate', this.loan?.startDate || new Date().toISOString().split('T')[0], true);

		// Тип платежа
		const typeGroup = form.createDiv();
		typeGroup.createEl('label', {text: 'Тип платежа'});
		const select = typeGroup.createEl('select', {attr: {name: 'paymentType'}});
		select.createEl('option', {value: 'annuity', text: 'Аннуитетный'});
		select.createEl('option', {value: 'differentiated', text: 'Дифференцированный'});
		if (this.loan?.paymentType) {
			(select as HTMLSelectElement).value = this.loan.paymentType;
		}

		// Валюта
		this.createInput(form, 'Валюта', 'text', 'currency', this.loan?.currency || this.plugin.settings.defaultCurrency, true);

		// Заметки
		const notesGroup = form.createDiv();
		notesGroup.createEl('label', {text: 'Заметки'});
		const textarea = notesGroup.createEl('textarea', {attr: {name: 'notes', rows: '3'}});
		textarea.setText(this.loan?.notes || '');

		// Кнопки
		const buttons = form.createDiv();
		const submit = buttons.createEl('button', {text: 'Сохранить', attr: {type: 'submit'}});
		submit.addClass('mod-cta');

		if (this.loan) {
			const deleteBtn = buttons.createEl('button', {text: 'Удалить'});
			deleteBtn.addEventListener('click', () => {
				if (confirm('Удалить этот кредит?')) {
					this.plugin.deleteLoan(this.loan!.id);
					this.close();
				}
			});
		}

		const cancel = buttons.createEl('button', {text: 'Отмена'});
		cancel.addEventListener('click', () => this.close());

		form.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			const formData = new FormData(form as HTMLFormElement);
			const loan: Loan = {
				id: this.loan?.id || '',
				name: formData.get('name') as string,
				totalAmount: parseFloat(formData.get('totalAmount') as string),
				interestRate: parseFloat(formData.get('interestRate') as string),
				termMonths: parseInt(formData.get('termMonths') as string),
				startDate: formData.get('startDate') as string,
				paymentType: formData.get('paymentType') as 'annuity' | 'differentiated',
				currency: formData.get('currency') as string,
				notes: formData.get('notes') as string,
				createdAt: this.loan?.createdAt || '',
				updatedAt: ''
			};

			if (this.loan) {
				loan.id = this.loan.id;
				loan.createdAt = this.loan.createdAt;
				this.plugin.updateLoan(loan);
			} else {
				this.plugin.addLoan(loan);
			}
			this.close();
		});
	}

	private createInput(parent: HTMLElement, label: string, type: string, name: string, value: string, required = false) {
		const group = parent.createDiv();
		group.createEl('label', {text: label});
		const input = group.createEl('input', {attr: {type, name, value}});
		if (required) input.setAttribute('required', '');
		return input;
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class MarkPaymentModal extends Modal {
	plugin: LoansPlugin;
	paymentId?: string;

	constructor(app: App, plugin: LoansPlugin, paymentId?: string) {
		super(app);
		this.plugin = plugin;
		this.paymentId = paymentId;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();
		contentEl.createEl('h2', {text: 'Отметить платеж как выполненный'});

		if (!this.paymentId) {
			contentEl.createEl('p', {text: 'Платеж не выбран.'});
			return;
		}

		const payment = this.plugin.payments.find(p => p.id === this.paymentId);
		if (!payment) {
			contentEl.createEl('p', {text: 'Платеж не найден.'});
			return;
		}

		const loan = this.plugin.loans.find(l => l.id === payment.loanId);
		const loanName = loan ? loan.name : 'Неизвестный кредит';

		contentEl.createEl('p', {text: `Кредит: ${loanName}`});
		contentEl.createEl('p', {text: `Дата платежа: ${payment.date}`});
		contentEl.createEl('p', {text: `Планируемая сумма: ${payment.amount.toFixed(2)}`});

		const form = contentEl.createEl('form');

		const amountGroup = form.createDiv();
		amountGroup.createEl('label', {text: 'Фактически уплаченная сумма'});
		const amountInput = amountGroup.createEl('input', {attr: {type: 'number', step: '0.01', value: payment.amount.toString()}});

		const dateGroup = form.createDiv();
		dateGroup.createEl('label', {text: 'Дата оплаты'});
		const dateInput = dateGroup.createEl('input', {attr: {type: 'date', value: new Date().toISOString().split('T')[0]}});

		const button = form.createEl('button', {text: 'Отметить как выполненный', attr: {type: 'submit'}});
		button.addClass('mod-cta');

		form.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			const paidAmount = parseFloat((amountInput as HTMLInputElement).value);
			const paidDate = (dateInput as HTMLInputElement).value;

			if (paidAmount <= 0) {
				new Notice('Сумма должна быть положительной');
				return;
			}

			this.plugin.markPaymentAsPaid(this.paymentId!, paidAmount, paidDate);
			this.close();
		});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class PaymentsView extends Modal {
	plugin: LoansPlugin;
	loan: Loan;

	constructor(app: App, plugin: LoansPlugin, loan: Loan) {
		super(app);
		this.plugin = plugin;
		this.loan = loan;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();

		contentEl.createEl('h2', {text: `Платежи: ${this.loan.name}`});

		// Кнопка досрочного платежа
		const earlyBtn = contentEl.createEl('button', {text: '💳 Досрочный платеж'});
		earlyBtn.style.marginBottom = '15px';
		earlyBtn.addEventListener('click', () => {
			new EarlyRepaymentModal(this.app, this.plugin, this.loan).open();
		});

		const payments = this.plugin.getPaymentsForLoan(this.loan.id);

		if (payments.length === 0) {
			contentEl.createEl('p', {text: 'Нет платежей для этого кредита.'});
			return;
		}

		const table = contentEl.createEl('table');
		const header = table.createEl('thead');
		const headerRow = header.createEl('tr');
		['Дата', 'Сумма', 'Основной долг', 'Проценты', 'Статус', 'Действия'].forEach(text => {
			headerRow.createEl('th', {text});
		});

		const body = table.createEl('tbody');
		payments.forEach(p => {
			const row = body.createEl('tr');
			row.createEl('td', {text: p.date});
			row.createEl('td', {text: p.amount.toFixed(2)});
			row.createEl('td', {text: p.principal.toFixed(2)});
			row.createEl('td', {text: p.interest.toFixed(2)});

			const statusCell = row.createEl('td');
			const statusSpan = statusCell.createEl('span', {text: p.status, cls: `payment-status ${p.status}`});

			const actionsCell = row.createEl('td');
			if (p.status === 'pending') {
				const markBtn = actionsCell.createEl('button', {text: 'Отметить оплату'});
				markBtn.addEventListener('click', () => {
					new MarkPaymentModal(this.app, this.plugin, p.id).open();
					this.close();
				});
			} else {
				actionsCell.createEl('span', {text: `Оплачен ${p.paidDate || p.date}`});
			}
		});

		const buttonRow = contentEl.createDiv({cls: 'payments-actions'});
		const backBtn = buttonRow.createEl('button', {text: 'Назад'});
		backBtn.addEventListener('click', () => this.close());

		const refreshBtn = buttonRow.createEl('button', {text: '🔄 Обновить'});
		refreshBtn.addEventListener('click', () => {
			this.onClose();
			this.onOpen();
		});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class EarlyRepaymentModal extends Modal {
	plugin: LoansPlugin;
	loan: Loan;

	constructor(app: App, plugin: LoansPlugin, loan: Loan) {
		super(app);
		this.plugin = plugin;
		this.loan = loan;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();

		const stats = this.plugin.getLoanStats(this.loan.id);
		contentEl.createEl('h2', {text: `Досрочный платеж: ${this.loan.name}`});
		contentEl.createEl('p', {text: `Остаток долга: ${stats.remainingPrincipal.toFixed(2)} ${this.loan.currency}`});

		const form = contentEl.createEl('form');

		const amountGroup = form.createDiv();
		amountGroup.createEl('label', {text: 'Сумма досрочного погашения'});
		const amountInput = amountGroup.createEl('input', {
			attr: {type: 'number', step: '0.01', min: '0', max: stats.remainingPrincipal.toString(), value: stats.remainingPrincipal.toString()}
		});

		const dateGroup = form.createDiv();
		dateGroup.createEl('label', {text: 'Дата погашения'});
		const dateInput = dateGroup.createEl('input', {
			attr: {type: 'date', value: new Date().toISOString().split('T')[0]}
		});

		const button = form.createEl('button', {text: 'Внести досрочный платеж', attr: {type: 'submit'}});
		button.addClass('mod-cta');

		form.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			const amount = parseFloat((amountInput as HTMLInputElement).value);
			const date = (dateInput as HTMLInputElement).value;

			if (amount <= 0) {
				new Notice('Сумма должна быть положительной');
				return;
			}
			if (amount > stats.remainingPrincipal) {
				new Notice('Сумма не может превышать остаток долга');
				return;
			}

			this.plugin.makeEarlyRepayment(this.loan.id, amount, date);
			this.close();
		});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class LoansView extends Modal {
	plugin: LoansPlugin;

	constructor(app: App, plugin: LoansPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();
		contentEl.addClass('loans-plugin-container');

		contentEl.createEl('h1', {text: 'Учет кредитов'});

		// Общая статистика
		const overall = this.plugin.getOverallStats();
		const statsDiv = contentEl.createDiv({cls: 'loans-overall-stats'});
		statsDiv.createEl('div', {text: `Кредитов: ${overall.totalLoans}`});
		statsDiv.createEl('div', {text: `Общий долг: ${overall.totalDebt.toFixed(2)}`});
		statsDiv.createEl('div', {text: `Выплачено: ${overall.totalPaid.toFixed(2)}`});
		statsDiv.createEl('div', {text: `Переплата: ${overall.totalOverpaid.toFixed(2)}`});

		// Список кредитов
		contentEl.createEl('h2', {text: 'Ваши кредиты'});

		const visibleLoans = this.plugin.loans.filter(loan => !loan.hidden);
		if (visibleLoans.length === 0) {
			contentEl.createEl('p', {text: 'Нет активных кредитов. Добавьте новый или покажите скрытые.'});
		} else {
			visibleLoans.forEach(loan => {
				const stats = this.plugin.getLoanStats(loan.id);
				const div = contentEl.createDiv({cls: 'loan-item'});

				div.createEl('h3', {text: loan.name});
				div.createEl('p', {text: `Сумма: ${loan.totalAmount} ${loan.currency} | Ставка: ${loan.interestRate}%`});
				div.createEl('p', {text: `Остаток: ${stats.remainingPrincipal.toFixed(2)} | Прогресс: ${stats.progress.toFixed(1)}%`});

				const progressBar = div.createDiv({cls: 'progress-bar'});
				const progressFill = progressBar.createDiv({cls: 'progress-fill'});
				progressFill.style.width = `${Math.min(stats.progress, 100)}%`;

				// Кнопки действий
				const btnGroup = div.createDiv();
				const editBtn = btnGroup.createEl('button', {text: 'Редактировать'});
				editBtn.addEventListener('click', () => {
					this.close();
					new LoanEditModal(this.app, this.plugin, loan).open();
				});

				const paymentsBtn = btnGroup.createEl('button', {text: 'Платежи'});
				paymentsBtn.addEventListener('click', () => {
					new PaymentsView(this.app, this.plugin, loan).open();
				});

				// Кнопка скрыть для полностью выплаченных кредитов
				if (stats.progress >= 100) {
					const hideBtn = btnGroup.createEl('button', {text: 'Скрыть'});
					hideBtn.addEventListener('click', () => {
						this.plugin.toggleLoanHidden(loan.id);
						this.onClose();
						this.onOpen();
					});
				}
			});
		}

		// Показать скрытые кредиты
		const hiddenLoans = this.plugin.loans.filter(loan => loan.hidden);
		if (hiddenLoans.length > 0) {
			contentEl.createEl('h3', {text: 'Скрытые кредиты'});
			hiddenLoans.forEach(loan => {
				const stats = this.plugin.getLoanStats(loan.id);
				const div = contentEl.createDiv({cls: 'loan-item hidden'});
				div.style.opacity = '0.7';

				div.createEl('h4', {text: `📌 ${loan.name} (скрыт)`});
				div.createEl('p', {text: `Прогресс: ${stats.progress.toFixed(1)}%`});

				const showBtn = div.createEl('button', {text: 'Показать'});
				showBtn.addEventListener('click', () => {
					this.plugin.toggleLoanHidden(loan.id);
					this.onClose();
					this.onOpen();
				});
			});
		}

		// Панель действий
		const actions = contentEl.createDiv({cls: 'loans-actions'});
		const addBtn = actions.createEl('button', {text: '➕ Добавить кредит'});
		addBtn.addEventListener('click', () => {
			this.close();
			new LoanEditModal(this.app, this.plugin).open();
		});

		const calcBtn = actions.createEl('button', {text: '🧮 Калькулятор погашения'});
		calcBtn.addEventListener('click', () => {
			new RepaymentCalculatorModal(this.app, this.plugin).open();
		});

		const refreshBtn = actions.createEl('button', {text: '🔄 Обновить'});
		refreshBtn.addEventListener('click', () => {
			this.onClose();
			this.onOpen();
		});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class RepaymentCalculatorModal extends Modal {
	plugin: LoansPlugin;

	constructor(app: App, plugin: LoansPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();

		contentEl.createEl('h2', {text: 'Калькулятор выгодного погашения'});
		contentEl.createEl('p', {text: 'Введите сумму, которую можете направить на досрочное погашение:'});

		const input = contentEl.createEl('input', {
			attr: {type: 'number', placeholder: 'Сумма', value: '10000'}
		});
		input.style.marginRight = '10px';

		const button = contentEl.createEl('button', {text: 'Рассчитать'});
		button.addClass('mod-cta');

		const resultsDiv = contentEl.createDiv();

		button.addEventListener('click', () => {
			const amount = parseFloat((input as HTMLInputElement).value);
			if (amount <= 0) {
				new Notice('Введите положительную сумму');
				return;
			}

			const recommendations = this.plugin.calculateOptimalRepayment(amount);
			resultsDiv.empty();

			if (recommendations.length === 0) {
				resultsDiv.createEl('p', {text: 'Нет активных кредитов для погашения.'});
				return;
			}

			resultsDiv.createEl('h3', {text: 'Рекомендации:'});
			recommendations.forEach(rec => {
				const div = resultsDiv.createDiv();
				div.createEl('p', {
					text: `Кредит "${rec.loan.name}": погасить ${rec.amountToRepay.toFixed(2)} ${rec.loan.currency}`
				});
				div.createEl('p', {
					text: `Экономия на процентах: ~${rec.savedInterest.toFixed(2)} ${rec.loan.currency}`
				});
			});
		});

		button.click();
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class LoansSettingTab extends PluginSettingTab {
	plugin: LoansPlugin;

	constructor(app: App, plugin: LoansPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		containerEl.createEl('h2', {text: 'Настройки плагина учета кредитов'});

		new Setting(containerEl)
			.setName('Файл хранения данных')
			.setDesc('JSON файл, где хранятся данные о кредитах')
			.addText(text => text
				.setPlaceholder('loans-data.json')
				.setValue(this.plugin.settings.storageFile)
				.onChange(async value => {
					this.plugin.settings.storageFile = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Валюта по умолчанию')
			.setDesc('Валюта для новых кредитов (RUB, USD, EUR и т.д.)')
			.addText(text => text
				.setPlaceholder('RUB')
				.setValue(this.plugin.settings.defaultCurrency)
				.onChange(async value => {
					this.plugin.settings.defaultCurrency = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Уведомления')
			.setDesc('Показывать уведомления о просроченных платежах')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showNotifications)
				.onChange(async value => {
					this.plugin.settings.showNotifications = value;
					await this.plugin.saveSettings();
				}));
	}
}