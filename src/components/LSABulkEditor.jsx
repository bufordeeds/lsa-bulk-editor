import React, { useState } from 'react';
import { Upload, Download, Play, Pause, CheckCircle, XCircle, AlertCircle, Trash2, Save, Eye } from 'lucide-react';

export default function LSABulkEditor() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [errors, setErrors] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'preview'
  const [bulkEditValues, setBulkEditValues] = useState({
    bidStrategy: '',
    weeklyBudget: '',
    locations: ''
  });

  // Sample data structure for an account
  const sampleAccount = {
    accountId: '123-456-7890',
    accountName: 'Austin Plumbing Services',
    currentBidStrategy: '',
    currentWeeklyBudget: '350.00',
    currentLocations: [],
    ratingScore: '4.5',
    totalReviews: '375',
    chargedLeads: '13',
    phoneCalls: '17',
    totalCost: '$1,235.00',
    status: 'pending' // pending, processing, success, error
  };

  // Handle CSV file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').slice(1); // Skip header

      const parsedAccounts = rows
        .filter(row => row.trim())
        .map((row, index) => {
          // Parse CSV handling quoted fields with commas
          const columns = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              columns.push(current);
              current = '';
            } else {
              current += char;
            }
          }
          columns.push(current);

          const [
            businessName,
            accountId,
            category,
            weeklyBudget,
            bids,
            ratingScore,
            totalReviews,
            impressions,
            currentChargedLeads,
            previousChargedLeads,
            currentPhoneCalls,
            previousPhoneCalls,
            currentConnectedCalls,
            previousConnectedCalls,
            currentTotalCost,
            previousTotalCost
          ] = columns;

          // Clean currency values (remove $, spaces, commas)
          const cleanCurrency = (val) => {
            if (!val) return '0.00';
            return val.replace(/[\$,\s]/g, '');
          };

          return {
            id: index,
            accountId: accountId?.trim() || '',
            accountName: businessName?.trim() || '',
            currentBidStrategy: '',
            currentWeeklyBudget: cleanCurrency(weeklyBudget),
            currentLocations: [],
            ratingScore: ratingScore?.trim() || 'N/A',
            totalReviews: totalReviews?.trim().replace(/,/g, '') || '0',
            chargedLeads: currentChargedLeads?.trim() || '0',
            phoneCalls: currentPhoneCalls?.trim() || '0',
            connectedCalls: currentConnectedCalls?.trim() || '0',
            totalCost: currentTotalCost?.trim() || '$0.00',
            newBidStrategy: '',
            newWeeklyBudget: '',
            newLocations: '',
            status: 'pending',
            errorMessage: ''
          };
        });

      setAccounts(parsedAccounts);
    };
    reader.readAsText(file);
  };

  // Download CSV template
  const downloadTemplate = () => {
    const template = `Business Name,Account ID,Category,Weekly Budget,Bids,Rating Score,Total Review,Impressions Last 2 Days,Current Period Charged Leads,Previous Period Charged Leads,Current Period Phone Calls,Previous Period Phone Calls,Current Period Connected Phone Calls,Previous Period Connected Phone Calls,Current Period Total Cost,Previous Period Total Cost
Aspen Dental,3222772562,,$269.99 ,N/A,4.5,375,0,0,0,0,0,0,0,$0.00 ,$0.00
Aspen Dental,5598182129,,$342.02 ,N/A,4.8,461,0,13,13,17,23,14,7,"$1,235.00 ","$1,235.00 "
Aspen Dental,8744206294,,$324.03 ,N/A,4.3,548,0,15,13,19,19,17,0,"$1,172.52 ","$1,170.00 "`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lsa_accounts_template.csv';
    a.click();
  };

  // Handle individual field updates
  const updateAccount = (id, field, value) => {
    setAccounts(accounts.map(acc =>
      acc.id === id ? { ...acc, [field]: value } : acc
    ));
  };

  // Apply bulk edit to selected accounts
  const applyBulkEdit = () => {
    const updates = {};
    if (bulkEditValues.bidStrategy) updates.newBidStrategy = bulkEditValues.bidStrategy;
    if (bulkEditValues.weeklyBudget) updates.newWeeklyBudget = bulkEditValues.weeklyBudget;
    if (bulkEditValues.locations) updates.newLocations = bulkEditValues.locations;

    setAccounts(accounts.map(acc =>
      selectedAccounts.has(acc.id) ? { ...acc, ...updates } : acc
    ));

    setBulkEditValues({ bidStrategy: '', weeklyBudget: '', locations: '' });
  };

  // Select/deselect all accounts
  const toggleSelectAll = () => {
    if (selectedAccounts.size === accounts.length) {
      setSelectedAccounts(new Set());
    } else {
      setSelectedAccounts(new Set(accounts.map(acc => acc.id)));
    }
  };

  // Toggle individual account selection
  const toggleSelectAccount = (id) => {
    const newSelected = new Set(selectedAccounts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAccounts(newSelected);
  };

  // Simulate API call to process accounts
  const processAccounts = async () => {
    setIsProcessing(true);
    setProcessedCount(0);
    setErrors([]);

    const accountsToProcess = accounts.filter(acc =>
      acc.newBidStrategy || acc.newWeeklyBudget || acc.newLocations
    );

    for (let i = 0; i < accountsToProcess.length; i++) {
      const account = accountsToProcess[i];

      // Update status to processing
      setAccounts(prev => prev.map(acc =>
        acc.id === account.id ? { ...acc, status: 'processing' } : acc
      ));

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate random success/failure (90% success rate)
      const success = Math.random() > 0.1;

      if (success) {
        setAccounts(prev => prev.map(acc =>
          acc.id === account.id ? { ...acc, status: 'success' } : acc
        ));
      } else {
        const errorMsg = 'API Error: Invalid location targeting';
        setAccounts(prev => prev.map(acc =>
          acc.id === account.id ? { ...acc, status: 'error', errorMessage: errorMsg } : acc
        ));
        setErrors(prev => [...prev, { accountId: account.accountId, message: errorMsg }]);
      }

      setProcessedCount(i + 1);
    }

    setIsProcessing(false);
  };

  // Export results
  const exportResults = () => {
    const csv = [
      'Account ID,Account Name,Status,Error Message,Old Bid Strategy,New Bid Strategy,Old Budget,New Budget,Old Locations,New Locations,Rating,Reviews,Charged Leads,Phone Calls,Total Cost'
    ];

    accounts.forEach(acc => {
      csv.push([
        acc.accountId,
        acc.accountName,
        acc.status,
        acc.errorMessage || '',
        acc.currentBidStrategy || 'Not set',
        acc.newBidStrategy || acc.currentBidStrategy || 'Not set',
        acc.currentWeeklyBudget,
        acc.newWeeklyBudget || acc.currentWeeklyBudget,
        (acc.currentLocations || []).join(';'),
        acc.newLocations || (acc.currentLocations || []).join(';'),
        acc.ratingScore,
        acc.totalReviews,
        acc.chargedLeads,
        acc.phoneCalls,
        acc.totalCost
      ].join(','));
    });

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lsa_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing': return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const accountsWithChanges = accounts.filter(acc =>
    acc.newBidStrategy || acc.newWeeklyBudget || acc.newLocations
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LSA Bulk Editor</h1>
          <p className="text-gray-600">
            Manage bids, budgets, and location targeting across {accounts.length > 0 ? accounts.length : 'your'} Local Services Ads accounts
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Import Account Data</h2>
          <div className="flex gap-4">
            <label className="flex-1">
              <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                <Upload className="w-5 h-5" />
                <span className="font-medium">Upload CSV File</span>
              </div>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              <span className="font-medium">Download Template</span>
            </button>
          </div>
          {accounts.length > 0 && (
            <p className="mt-4 text-sm text-green-600 font-medium">
              ✓ Loaded {accounts.length} accounts
            </p>
          )}
        </div>

        {accounts.length > 0 && (
          <>
            {/* Bulk Edit Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">2. Bulk Edit ({selectedAccounts.size} selected)</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bid Strategy</label>
                  <select
                    value={bulkEditValues.bidStrategy}
                    onChange={(e) => setBulkEditValues({...bulkEditValues, bidStrategy: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No change</option>
                    <option value="MANUAL_CPA">Manual CPA</option>
                    <option value="MAXIMIZE_CONVERSIONS">Maximize Conversions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Budget ($)</label>
                  <input
                    type="number"
                    value={bulkEditValues.weeklyBudget}
                    onChange={(e) => setBulkEditValues({...bulkEditValues, weeklyBudget: e.target.value})}
                    placeholder="Leave blank for no change"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Locations (comma-separated zips)</label>
                  <input
                    type="text"
                    value={bulkEditValues.locations}
                    onChange={(e) => setBulkEditValues({...bulkEditValues, locations: e.target.value})}
                    placeholder="78701,78702,78703"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={applyBulkEdit}
                    disabled={selectedAccounts.size === 0}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Apply to Selected
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={toggleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {selectedAccounts.size === accounts.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setSelectedAccounts(new Set())}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Accounts Table */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">3. Review & Edit ({accountsWithChanges} with changes)</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 rounded ${viewMode === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  >
                    Preview Changes
                  </button>
                </div>
              </div>

              {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={selectedAccounts.size === accounts.length}
                            onChange={toggleSelectAll}
                            className="w-4 h-4"
                          />
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Account</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Rating</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Leads</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Calls</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Cost</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Bid Strategy</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Weekly Budget</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Locations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {accounts.map((account) => (
                        <tr key={account.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={selectedAccounts.has(account.id)}
                              onChange={() => toggleSelectAccount(account.id)}
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="px-3 py-2">
                            {getStatusIcon(account.status)}
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-medium text-gray-900">{account.accountName}</div>
                            <div className="text-xs text-gray-500">{account.accountId}</div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span>{account.ratingScore}</span>
                            </div>
                            <div className="text-xs text-gray-500">{account.totalReviews} reviews</div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="font-medium">{account.chargedLeads}</div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="font-medium">{account.phoneCalls}</div>
                            <div className="text-xs text-gray-500">{account.connectedCalls} connected</div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-medium">{account.totalCost}</div>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={account.newBidStrategy || account.currentBidStrategy || ''}
                              onChange={(e) => updateAccount(account.id, 'newBidStrategy', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select...</option>
                              <option value="MANUAL_CPA">Manual CPA</option>
                              <option value="MAXIMIZE_CONVERSIONS">Maximize Conversions</option>
                            </select>
                            {account.newBidStrategy && account.currentBidStrategy && account.newBidStrategy !== account.currentBidStrategy && (
                              <div className="text-xs text-blue-600 mt-1">
                                Was: {account.currentBidStrategy}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={account.newWeeklyBudget || account.currentWeeklyBudget}
                                onChange={(e) => updateAccount(account.id, 'newWeeklyBudget', e.target.value)}
                                className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            {account.newWeeklyBudget && account.newWeeklyBudget !== account.currentWeeklyBudget && (
                              <div className="text-xs text-blue-600 mt-1">
                                Was: ${account.currentWeeklyBudget}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              placeholder="Add zip codes..."
                              value={account.newLocations || (account.currentLocations || []).join(', ')}
                              onChange={(e) => updateAccount(account.id, 'newLocations', e.target.value)}
                              className="w-32 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            {account.newLocations && account.newLocations !== (account.currentLocations || []).join(', ') && (
                              <div className="text-xs text-blue-600 mt-1">
                                {(account.currentLocations || []).length > 0 ? `Was: ${account.currentLocations.join(', ')}` : 'New'}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.filter(acc => acc.newBidStrategy || acc.newWeeklyBudget || acc.newLocations).map((account) => (
                    <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">{account.accountName}</div>
                          <div className="text-sm text-gray-500">{account.accountId}</div>
                          <div className="flex gap-4 text-xs text-gray-600 mt-1">
                            <span>★ {account.ratingScore} ({account.totalReviews} reviews)</span>
                            <span>{account.chargedLeads} leads</span>
                            <span>{account.phoneCalls} calls</span>
                            <span>{account.totalCost}</span>
                          </div>
                        </div>
                        {getStatusIcon(account.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {account.newBidStrategy && (
                          <div>
                            <div className="text-gray-600">Bid Strategy</div>
                            {account.currentBidStrategy ? (
                              <>
                                <div className="font-medium text-red-600 line-through">{account.currentBidStrategy}</div>
                                <div className="font-medium text-green-600">→ {account.newBidStrategy}</div>
                              </>
                            ) : (
                              <div className="font-medium text-green-600">→ {account.newBidStrategy}</div>
                            )}
                          </div>
                        )}
                        {account.newWeeklyBudget && account.newWeeklyBudget !== account.currentWeeklyBudget && (
                          <div>
                            <div className="text-gray-600">Weekly Budget</div>
                            <div className="font-medium text-red-600 line-through">${account.currentWeeklyBudget}</div>
                            <div className="font-medium text-green-600">→ ${account.newWeeklyBudget}</div>
                          </div>
                        )}
                        {account.newLocations && account.newLocations !== (account.currentLocations || []).join(', ') && (
                          <div className="col-span-2">
                            <div className="text-gray-600">Locations</div>
                            {(account.currentLocations || []).length > 0 ? (
                              <>
                                <div className="font-medium text-red-600 line-through">{account.currentLocations.join(', ')}</div>
                                <div className="font-medium text-green-600">→ {account.newLocations}</div>
                              </>
                            ) : (
                              <div className="font-medium text-green-600">→ {account.newLocations}</div>
                            )}
                          </div>
                        )}
                      </div>
                      {account.errorMessage && (
                        <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                          {account.errorMessage}
                        </div>
                      )}
                    </div>
                  ))}
                  {accountsWithChanges === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No changes to preview. Edit accounts in the table view.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Process Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">4. Process Updates</h2>

              {isProcessing && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Processing accounts...</span>
                    <span className="text-sm text-gray-600">{processedCount} / {accountsWithChanges}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(processedCount / accountsWithChanges) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {errors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">Errors ({errors.length})</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((error, i) => (
                      <li key={i}>Account {error.accountId}: {error.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={processAccounts}
                  disabled={isProcessing || accountsWithChanges === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Process {accountsWithChanges} Updates
                    </>
                  )}
                </button>

                <button
                  onClick={exportResults}
                  disabled={accounts.every(acc => acc.status === 'pending')}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  <Download className="w-5 h-5" />
                  Export Results
                </button>

                <button
                  onClick={() => {
                    setAccounts([]);
                    setSelectedAccounts(new Set());
                    setErrors([]);
                    setProcessedCount(0);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold ml-auto"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear All
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
