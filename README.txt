POPOYE INSURANCE PAYMENT AUTOMATION — FRONTEND DEMO

FILES
- index.html: page structure
- style.css: responsive styling and animation
- script.js: demo payment flow, filters, transaction table, CSV export, receipt download

HOW TO RUN
1. Keep all three files in the same folder.
2. Open index.html in a browser, or use Visual Studio Code Live Server.
3. Edit the sample customer details and click Pay.
4. A simulated status (PAID / PENDING / FAILED) is created locally in the browser.
5. Use Export to CSV to download a spreadsheet-compatible report.

IMPORTANT
This is a frontend prototype. It does not charge money, send WhatsApp messages, store records in a database,
or verify real payments. For production, add a Node.js backend, secure environment variables, database,
AiSensy API integration, payment gateway order creation, signature-verified webhooks, authentication,
and idempotency/duplicate-payment protection. Never expose API secrets in browser JavaScript.
