# LSA Bulk Editor

A React-based bulk editor for managing Google Local Services Ads (LSA) accounts. Designed to handle 145+ accounts with capabilities to edit bids, bid strategies, weekly budgets, and location targeting (zip codes).

## Features

- **CSV Import/Export**: Upload account data via CSV or download a template to get started
- **Bulk Editing**: Apply changes to multiple selected accounts at once
- **Individual Editing**: Fine-tune each account directly in the table
- **Preview Mode**: Review all changes before processing
- **Progress Tracking**: Real-time status updates during batch processing
- **Error Handling**: Detailed error reporting for failed updates

## What You Can Edit

Based on Google Ads API documentation for Local Services campaigns:

- ✅ **Bid Strategy**: Switch between Manual CPA and Maximize Conversions
- ✅ **Bids**: Set category-level bids (when using Manual CPA)
- ✅ **Weekly Budget**: Update campaign budget amounts
- ✅ **Location Targeting**: Add/remove zip codes and service areas

## Project Structure

```
lsa-bulk-editor/
├── src/
│   └── components/
│       └── LSABulkEditor.jsx    # Main React component
├── package.json
└── README.md
```

## Component Features

### 1. Import Accounts
- Upload CSV file with account data
- Download CSV template with sample data
- Parses and validates account information

### 2. Bulk Edit Panel
- Select multiple accounts (select all/clear selection)
- Apply changes to bid strategy, weekly budget, and locations simultaneously
- Shows count of selected accounts

### 3. Review & Edit Table
- Two view modes: Table and Preview
- Edit accounts individually in table view
- See before/after comparisons for changes
- Track which accounts have pending changes

### 4. Process Updates
- Real-time progress bar
- Status indicators (pending, processing, success, error)
- Error reporting with detailed messages
- Export results to CSV

## CSV Format

The CSV should contain the following columns:

```csv
Account ID,Account Name,Current Bid Strategy,Current Bid ($),Current Weekly Budget ($),Current Locations (semicolon separated)
123-456-7890,Austin Plumbing Services,MANUAL_CPA,45.00,350.00,78701;78702;78703
```

## Google Ads API Integration

This frontend is designed to work with the Google Ads API for Local Services campaigns. The backend should handle:

- OAuth 2.0 authentication
- Google Ads API calls for campaign updates
- Location ID conversion (zip codes to Google location IDs)
- Queue-based processing for bulk updates

### API Endpoints Needed

- `POST /api/lsa/process` - Process account updates
- `GET /api/lsa/accounts` - Fetch current account data
- `POST /api/lsa/validate` - Validate zip codes/locations

## Next Steps

1. Set up backend API (Laravel recommended)
2. Implement Google Ads API authentication
3. Create processing queue for bulk updates
4. Replace simulated API calls with real endpoints
5. Add authentication/authorization

## Dependencies

- **React 18**: UI framework
- **Lucide React**: Icon library
- **Tailwind CSS**: Styling (utility classes)

## Development

```bash
npm install
npm run dev
```

## Notes

- Each LSA account can only have ONE Local Services campaign
- Bids are set per service category when using Manual CPA strategy
- Zip codes need to be converted to Google's location IDs via the API
- The Google Ads API does not allow creation of new LSA campaigns programmatically
