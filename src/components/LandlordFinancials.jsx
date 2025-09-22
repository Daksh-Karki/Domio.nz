import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import UserLayout from './UserLayout.jsx';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Building2,
  Users,
  Wrench,
  FileText,
  Download,
  Plus,
  Edit,
  Trash2,
  PieChart,
  BarChart3,
  CreditCard,
  Banknote
} from 'lucide-react';
import '../styles/shared.css';

const LandlordFinancials = () => {
  const { user } = useAuth();
  const [financialData, setFinancialData] = useState({
    transactions: [],
    properties: [],
    tenants: [],
    summary: {}
  });
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // month, quarter, year
  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    amount: '',
    description: '',
    propertyId: '',
    category: 'rent',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Simulate loading financial data
    setTimeout(() => {
      setFinancialData({
        transactions: [
          {
            id: 1,
            type: 'income',
            amount: 650,
            description: 'Rent payment - Downtown Apartment',
            propertyId: 1,
            propertyName: 'Downtown Apartment',
            tenantName: 'John Smith',
            category: 'rent',
            date: '2024-01-15',
            status: 'paid',
            reference: 'RENT-001'
          },
          {
            id: 2,
            type: 'income',
            amount: 450,
            description: 'Rent payment - Studio Unit',
            propertyId: 3,
            propertyName: 'Cozy Studio Unit',
            tenantName: 'Sarah Johnson',
            category: 'rent',
            date: '2024-01-20',
            status: 'paid',
            reference: 'RENT-002'
          },
          {
            id: 3,
            type: 'expense',
            amount: 75,
            description: 'Window latch repair - Studio Unit',
            propertyId: 3,
            propertyName: 'Cozy Studio Unit',
            category: 'maintenance',
            date: '2024-01-17',
            status: 'paid',
            reference: 'MAINT-001'
          },
          {
            id: 4,
            type: 'expense',
            amount: 120,
            description: 'Property insurance - All properties',
            propertyId: null,
            propertyName: 'All Properties',
            category: 'insurance',
            date: '2024-01-01',
            status: 'paid',
            reference: 'INS-001'
          },
          {
            id: 5,
            type: 'expense',
            amount: 200,
            description: 'Property management fees',
            propertyId: null,
            propertyName: 'All Properties',
            category: 'management',
            date: '2024-01-01',
            status: 'paid',
            reference: 'MGMT-001'
          },
          {
            id: 6,
            type: 'income',
            amount: 650,
            description: 'Rent payment - Downtown Apartment',
            propertyId: 1,
            propertyName: 'Downtown Apartment',
            tenantName: 'John Smith',
            category: 'rent',
            date: '2023-12-15',
            status: 'paid',
            reference: 'RENT-003'
          },
          {
            id: 7,
            type: 'income',
            amount: 450,
            description: 'Rent payment - Studio Unit',
            propertyId: 3,
            propertyName: 'Cozy Studio Unit',
            tenantName: 'Sarah Johnson',
            category: 'rent',
            date: '2023-12-20',
            status: 'paid',
            reference: 'RENT-004'
          }
        ],
        properties: [
          { id: 1, name: 'Downtown Apartment', rent: 650, status: 'rented' },
          { id: 2, name: 'Family Home with Garden', rent: 850, status: 'available' },
          { id: 3, name: 'Cozy Studio Unit', rent: 450, status: 'rented' }
        ],
        tenants: [
          { id: 1, name: 'John Smith', propertyId: 1, rent: 650, lastPayment: '2024-01-15' },
          { id: 2, name: 'Sarah Johnson', propertyId: 3, rent: 450, lastPayment: '2024-01-20' }
        ],
        summary: {
          totalIncome: 2200,
          totalExpenses: 395,
          netIncome: 1805,
          occupancyRate: 67,
          averageRent: 550,
          monthlyRent: 1100
        }
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const newTrans = {
      id: financialData.transactions.length + 1,
      ...newTransaction,
      amount: parseFloat(newTransaction.amount) || 0,
      status: 'paid',
      reference: `${newTransaction.type.toUpperCase()}-${Date.now()}`
    };
    
    setFinancialData(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTrans]
    }));
    
    setShowAddTransaction(false);
    setNewTransaction({
      type: 'income',
      amount: '',
      description: '',
      propertyId: '',
      category: 'rent',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteTransaction = (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setFinancialData(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== transactionId)
      }));
    }
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate;
    
    switch (selectedPeriod) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return financialData.transactions.filter(transaction => 
      new Date(transaction.date) >= startDate
    );
  };

  const getPeriodSummary = () => {
    const filtered = getFilteredTransactions();
    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expenses,
      netIncome: income - expenses,
      transactionCount: filtered.length
    };
  };

  const getCategoryBreakdown = () => {
    const filtered = getFilteredTransactions();
    const categories = {};
    
    filtered.forEach(transaction => {
      if (!categories[transaction.category]) {
        categories[transaction.category] = { income: 0, expense: 0 };
      }
      categories[transaction.category][transaction.type] += transaction.amount;
    });
    
    return categories;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'income':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'expense':
        return <TrendingDown size={16} className="text-red-600" />;
      default:
        return <DollarSign size={16} />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'rent':
        return <Building2 size={16} />;
      case 'maintenance':
        return <Wrench size={16} />;
      case 'insurance':
        return <FileText size={16} />;
      case 'management':
        return <Users size={16} />;
      case 'utilities':
        return <CreditCard size={16} />;
      default:
        return <Banknote size={16} />;
    }
  };

  if (loading) {
    return (
      <UserLayout title="Financial Management" subtitle="Loading financial data...">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading financial data...</p>
        </div>
      </UserLayout>
    );
  }

  const periodSummary = getPeriodSummary();
  const categoryBreakdown = getCategoryBreakdown();
  const filteredTransactions = getFilteredTransactions();

  return (
    <UserLayout 
      title="Financial Management" 
      subtitle="Track income, expenses, and financial performance"
    >
      <div className="applications-wrapper">
        {/* Header Controls */}
        <div className="applications-header">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('month')}
            >
              This Month
            </button>
            <button 
              className={`filter-btn ${selectedPeriod === 'quarter' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('quarter')}
            >
              This Quarter
            </button>
            <button 
              className={`filter-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('year')}
            >
              This Year
            </button>
          </div>

          <div className="header-actions">
            <button 
              className="add-property-btn"
              onClick={() => setShowAddTransaction(true)}
            >
              <Plus size={16} />
              Add Transaction
            </button>
            <button className="action-btn secondary">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{formatCurrency(periodSummary.income)}</h3>
              <p className="stat-label">Total Income</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingDown size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{formatCurrency(periodSummary.expenses)}</h3>
              <p className="stat-label">Total Expenses</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <DollarSign size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{formatCurrency(periodSummary.netIncome)}</h3>
              <p className="stat-label">Net Income</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FileText size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{periodSummary.transactionCount}</h3>
              <p className="stat-label">Transactions</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <PieChart size={24} className="section-icon" />
              Category Breakdown
            </h2>
          </div>

          <div className="category-breakdown">
            {Object.entries(categoryBreakdown).map(([category, amounts]) => (
              <div key={category} className="category-item">
                <div className="category-header">
                  <div className="category-info">
                    {getCategoryIcon(category)}
                    <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                  </div>
                  <div className="category-amounts">
                    {amounts.income > 0 && (
                      <span className="income-amount">+{formatCurrency(amounts.income)}</span>
                    )}
                    {amounts.expense > 0 && (
                      <span className="expense-amount">-{formatCurrency(amounts.expense)}</span>
                    )}
                  </div>
                </div>
                <div className="category-bar">
                  <div 
                    className="income-bar" 
                    style={{ width: `${(amounts.income / (amounts.income + amounts.expense)) * 100}%` }}
                  ></div>
                  <div 
                    className="expense-bar" 
                    style={{ width: `${(amounts.expense / (amounts.income + amounts.expense)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <BarChart3 size={24} className="section-icon" />
              Recent Transactions
            </h2>
          </div>

          <div className="transactions-list">
            {filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <DollarSign size={64} className="empty-icon" />
                <h3>No Transactions Found</h3>
                <p>No transactions found for the selected period.</p>
                <button 
                  className="add-property-btn"
                  onClick={() => setShowAddTransaction(true)}
                >
                  <Plus size={16} />
                  Add First Transaction
                </button>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-icon">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="transaction-info">
                    <div className="transaction-header">
                      <h4 className="transaction-description">{transaction.description}</h4>
                      <span className="transaction-reference">{transaction.reference}</span>
                    </div>
                    
                    <div className="transaction-details">
                      <div className="detail-item">
                        {getCategoryIcon(transaction.category)}
                        <span>{transaction.category}</span>
                      </div>
                      {transaction.propertyName && (
                        <div className="detail-item">
                          <Building2 size={14} />
                          <span>{transaction.propertyName}</span>
                        </div>
                      )}
                      {transaction.tenantName && (
                        <div className="detail-item">
                          <Users size={14} />
                          <span>{transaction.tenantName}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <Calendar size={14} />
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="transaction-amount">
                    <span className={`amount ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <div className="transaction-actions">
                      <button 
                        className="action-btn small"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <div className="modal-overlay" onClick={() => setShowAddTransaction(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Transaction</h3>
                <button className="close-modal-btn" onClick={() => setShowAddTransaction(false)}>
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAddTransaction} className="modal-form">
                <div className="form-group">
                  <label htmlFor="transaction-type">Transaction Type</label>
                  <select
                    id="transaction-type"
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                    required
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="transaction-amount">Amount ($)</label>
                  <input
                    type="number"
                    id="transaction-amount"
                    min="0"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="transaction-description">Description</label>
                  <input
                    type="text"
                    id="transaction-description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="transaction-category">Category</label>
                    <select
                      id="transaction-category"
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                      required
                    >
                      <option value="rent">Rent</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="insurance">Insurance</option>
                      <option value="management">Management</option>
                      <option value="utilities">Utilities</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="transaction-date">Date</label>
                    <input
                      type="date"
                      id="transaction-date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="transaction-property">Property (Optional)</label>
                  <select
                    id="transaction-property"
                    value={newTransaction.propertyId}
                    onChange={(e) => setNewTransaction({...newTransaction, propertyId: e.target.value})}
                  >
                    <option value="">Select Property</option>
                    {financialData.properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowAddTransaction(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Add Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default LandlordFinancials;

