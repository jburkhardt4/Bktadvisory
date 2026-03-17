function doPost(e) {
  try {
    // 1. Parse the incoming data
    var requestData = JSON.parse(e.postData.contents);
    var formData = requestData.formData;
    var fileData = requestData.fileData;
    
    // --- CONFIGURATION ---
    var folderId = "1F0-6JO4qve8xjuG68Je5v1evgLda7Uqt"; 
    var sheetId = "1OIvpv4rb8_V1qH4KCF_oV_3P9-IFEfLa9LD3bU8brwE"; 
    var adminEmail = "john@bktadvisory.com";
    // ---------------------

    // --- DATA CLEANING ---
    
    // Phone: Remove non-digits, then remove leading '1' if it's 11 digits (US format)
    var rawPhone = String(formData.mobilePhone || "").replace(/\D/g, '');
    var cleanPhone = (rawPhone.length === 11 && rawPhone.startsWith('1')) 
      ? rawPhone.substring(1) 
      : rawPhone;

    // Overview: Remove ##, **, and replace * with •
    var cleanOverview = (formData.projectOverview || "")
      .replace(/##/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "•");

    // ---------------------

    // 2. Handle the File (PDF Quote)
    var folder = DriveApp.getFolderById(folderId);
    var blob = Utilities.newBlob(Utilities.base64Decode(fileData.base64), "application/pdf", fileData.name);
    var file = folder.createFile(blob);
    var fileUrl = file.getUrl();

    // 3. Append to Google Sheet
    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheetByName("Inbound Leads - Website") || ss.getSheets()[0]; 
    
    // --- Hyperlink Formulas for Contact Info ---
    var emailHyperlink = '=HYPERLINK("https://mail.google.com/mail/u/0/?tf=cm&fs=1&to=' + formData.workEmail + '", "' + formData.workEmail + '")';
    var hyperLinkFormula = '=HYPERLINK("' + fileUrl + '", "' + fileData.name + '")';
    var locationAIformula = '=AI("What is this lead\'s general location (City, State)?")';

  // --- 3. Append to Google Sheet ---
  sheet.appendRow([
    new Date(),                                     // A: Date Received
    formData.companyName,                           // B: Company Name
    formData.firstName + " " + formData.lastName,   // C: Lead Name
    locationAIformula,                              // D: Location (The Switch Variable)
    formData.website,                               // E: Website URL
    emailHyperlink,                                 // F: Email (Active Link)
    cleanPhone,                                     // G: Phone (CLEANED)
    "New",                                          // H: Status
    formData.estimatedWeeks,                        // I: Total Weeks
    formData.hoursPerWeek,                          // J: Hours / Week
    formData.adjustedHours,                         // K: Total Hours
    formData.finalHourlyRate,                       // L: Hourly Rate
    formData.totalCost,                             // M: Estimated Cost
    cleanOverview,                                  // N: Project Overview
    hyperLinkFormula                                // O: Quote Link
  ]);

    // !!! CRITICAL: Force changes to save before formatting !!!
    SpreadsheetApp.flush();

    // 4. Formatting & Style
    var lastRow = sheet.getLastRow();
    
    // Set Row Height to exactly 24
    sheet.setRowHeight(lastRow, 24);

    // Apply custom Date Format to Column A: "Fri, 2/13/26 | 4:40 PM "
    sheet.getRange(lastRow, 1).setNumberFormat("ddd, M/d/yy | h:mm AM/PM ");
    
    // Optional: Format Currency Columns (L & K)
    sheet.getRange(lastRow, 12, 1, 2).setNumberFormat("$#,##0.00");

    // Format Phone (Column E): "(555) 123-4567 "
    sheet.getRange(lastRow, 7).setNumberFormat("(###) ###-#### ");

// 5. Send Emails
    var emailSubject = "BKT Advisory - Quote: " + formData.companyName;
    
  // HTML Signature Definition
    const signatureTable = `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html;charset=utf-8"/></head><body><table id="zs-output-sig" border="0" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;line-height:0px;font-size:1px;padding:0px!important;border-spacing:0px;margin:0px;border-collapse:collapse; width:425px;"><tbody><tr><td style="padding: 0px !important; width: inherit; height: inherit;"><table id="inner-table" border="0" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;line-height:0px;font-size:1px;padding:0px!important;border-spacing:0px;margin:0px;border-collapse:collapse;"><tbody><tr><td style="border-collapse: collapse; font-family: Verdana, Geneva, sans-serif; font-size: 16px; font-style: normal; line-height: 18px; font-weight: 700; padding-bottom: 8px; width: inherit; height: inherit;"><p style="margin: 0.04px;"><span style="font-family:Verdana,Geneva,sans-serif;font-size:16px;font-style:normal;line-height:18px;font-weight:700;color:#000001;display:inline;">JOHN BURKHARDT</span></p></td></tr></tbody></table></td></tr><tr><td style="padding: 0px !important; width: inherit; height: inherit;"><table id="inner-table" border="0" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;line-height:0px;font-size:1px;padding:0px!important;border-spacing:0px;margin:0px;border-collapse:collapse;"><tbody><tr><td style="border-collapse: collapse; font-family: &quot;Trebuchet MS&quot;, Helvetica, sans-serif; font-size: 14px; font-style: normal; line-height: 16px; font-weight: 400; padding-bottom: 12px; width: inherit; height: inherit;"><p style="margin: 0.04px;"><span style="font-family:'Trebuchet MS',Helvetica,sans-serif;font-size:14px;font-style:normal;line-height:16px;font-weight:400;color:#404040;display:inline;">Salesforce Consultant</span></p></td></tr><tr><td style="border-collapse: collapse; line-height: 0px; padding-bottom: 10px; width: inherit; height: inherit;"><p style="margin: 0.04px;"><a style="font-size:0px;line-height:0px;" target="_blank" rel="nofollow" href="https://bktadvisory.com"><img height="49" width="200" alt="image" border="0" src="https://img2.gimm.io/e90291ff-f539-47d8-a07c-bfcae5054aca/-/resize/400x98/image.png"></a></p></td></tr><tr><td style="border-collapse: collapse; background-color: rgb(201, 201, 201); height: 1px; padding: 0px !important; width: inherit;"></td></tr><tr><td style="border-collapse: collapse; padding-bottom: 4px; width: inherit; height: inherit;"></td></tr></tbody></table></td></tr><tr><td style="padding: 0px !important; width: inherit; height: inherit;"><table id="inner-table" border="0" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;line-height:0px;font-size:1px;padding:0px!important;border-spacing:0px;margin:0px;border-collapse:collapse;"><tbody><tr><td style="padding-right: 4px; width: inherit; height: inherit;"><p style="margin: 0.04px;"><a style="font-size:0px;line-height:0px;" target="_blank" rel="nofollow" href="http://9523346093tel:9523346093"><img height="24" width="24" alt="email" border="0" src="https://img2.gimm.io/86e6fca5-701c-463f-b946-10bd9878c02f/image.png"></a></p></td><td style="padding: 0px !important; width: inherit; height: inherit;"><p style="margin: 0.04px;"><span><a target="_blank" rel="nofollow" href="mailto:john@bktadvisory.com" style="font-family:Verdana,Geneva,sans-serif;font-size:12px;font-style:normal;line-height:14px;font-weight:400;color:#0085ff;display:inline;text-decoration:none;"> john@bktadvisory.com&nbsp; </a></span></p></td></tr></tbody></table></td></tr><tr><td style="padding: 0px !important; width: inherit; height: inherit;"><table id="inner-table" border="0" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;line-height:0px;font-size:1px;padding:0px!important;border-spacing:0px;margin:0px;border-collapse:collapse;"><tbody><tr><td style="padding-right: 4px; width: inherit; height: inherit;"><p style="margin: 0.04px;"><a style="font-size:0px;line-height:0px;" target="_blank" rel="nofollow" href="tel:9523346093"><img height="24" width="24" alt="telephone" border="0" src="https://img2.gimm.io/3ec94e35-3b38-4f65-91d1-477cd382b4b6/image.png"></a></p></td><td style="padding: 0px !important; width: inherit; height: inherit;"><p style="margin: 0.04px;"><span><a target="_blank" rel="nofollow" href="tel:9523346093" style="font-family:Verdana,Geneva,sans-serif;font-size:12px;font-style:normal;line-height:14px;font-weight:400;color:#0085ff;display:inline;text-decoration:none;"> (952) 334-6093&nbsp; </a></span></p></td></tr><tr><td style="border-collapse: collapse; padding-bottom: 12px; width: inherit; height: inherit;"></td></tr></tbody></table></td></tr><tr><td style="padding: 0px !important; width: inherit; height: inherit;"><table id="inner-table" border="0" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;line-height:0px;font-size:1px;padding:0px!important;border-spacing:0px;margin:0px;border-collapse:collapse;"><tbody><tr><td style="padding-right: 6px; width: inherit; height: inherit;"><p style="margin: 0.04px;"><a style="font-size:0px;line-height:0px;" target="_blank" rel="nofollow" href="https://www.linkedin.com/in/johndavisburkhardt/"><img height="24" width="24" alt="linkedin" border="0" src="https://img2.gimm.io/bf77ee7e-d0fc-434d-a4d1-67905a0a162f/image.png"></a></p></td><td style="padding-right: 6px; width: inherit; height: inherit;"><p style="margin: 0.04px;"><a style="font-size:0px;line-height:0px;" target="_blank" rel="nofollow" href="https://www.salesforce.com/trailblazer/johnburkhardt"><img height="25" width="25" alt="soundcloud" border="0" src="https://img2.gimm.io/e41f2800-db2d-4c85-9c9f-f2813868c067/-/resize/50x50/image.png"></a></p></td><td style="padding-right: 6px; width: inherit; height: inherit;"><p style="margin: 0.04px;"><a style="font-size:0px;line-height:0px;" target="_blank" rel="nofollow" href="https://www.upwork.com/freelancers/~01dd56d750898225c0"><img height="24" width="24" alt="upwork" border="0" src="https://img2.gimm.io/6324a560-c71f-4a88-9cbf-035168bae574/image.png"></a></p></td><td style="padding-right: 6px; width: inherit; height: inherit;"><p style="margin: 0.04px;"><a style="font-size:0px;line-height:0px;" target="_blank" rel="nofollow" href="https://calendly.com/bktadvisory-john-burkhardt"><img height="24" width="24" alt="calendly" border="0" src="https://img2.gimm.io/21987a87-3e00-4dcf-a460-19d4962f1d03/image.png"></a></p></td><td style="padding: 0px !important; width: inherit; height: inherit;"></td></tr></tbody></table></td></tr><tr><td style="border-collapse: collapse; padding-bottom: 16px; width: inherit; height: inherit;"><span></span></td></tr></tbody></table></body></html>`;

    // Combine
    const mySignature = signatureTable;
 
// --- FIX START ---
    
    // 1. Define plainBody (This was missing in your NEW version)
    var plainBody = "Hi " + formData.firstName + ",\n\nThank you for completing our BKT Project Estimator. We hope this gives you an idea on cost and timeline. Please see the attached project quote ready for your review and signature. \n\nBest,\nBKT Advisory";

    // 2. Define Client HTML Body
    var clientHtmlBody = 
      '<p style="font-family: sans-serif; font-size: 14px;">Hi ' + formData.firstName + ',<br><br>' +
      'Thank you for completing our BKT Project Estimator. We hope this gives you an idea on cost and timeline. Please see the attached project quote ready for your review and signature.<br><br>' +
      'Best,</p><br>' + 
      mySignature;

    // 3. Send to Client (use blob, NOT the Drive file, to prevent duplicate-attachment quirk)
    var pdfAttachment = blob.setName(fileData.name);
    GmailApp.sendEmail(formData.workEmail, emailSubject, plainBody, {
      htmlBody: clientHtmlBody,
      attachments: [pdfAttachment],
      from: "sales@bktadvisory.com",
      name: "BKT Advisory, Sales"
    });

// --- FORMATTING LOGIC START ---
    
    // Helper to format phone as (XXX) XXX-XXXX
    var formattedPhone = cleanPhone;
    var match = ('' + cleanPhone).match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      formattedPhone = '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    
    // Format Quote as Currency (e.g. $23,760)
    var formattedQuote = '$' + Number(formData.totalCost).toLocaleString('en-US', {
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0
    });

    // --- FORMATTING LOGIC END ---

    // 4. Define Admin HTML Body
    var adminHtmlBody = 
      '<p><strong>New lead captured:</strong></p>' +
      '<p>' +
        '<strong>Company:</strong> ' + formData.companyName + '<br>' +
        '<strong>Client:</strong> ' + formData.firstName + ' ' + formData.lastName + '<br>' +
        // Use raw 'formData.phone' for the link, but 'formattedPhone' for the display text
        '<strong>Phone:</strong> <a href="tel:' + cleanPhone + '">' + formattedPhone + '</a><br>' +
        '<strong>Email:</strong> <a href="mailto:' + formData.workEmail + '">' + formData.workEmail + '</a><br>' +
        // Use the new 'formattedQuote' variable here
        '<strong>Estimated Quote:</strong> ' + formattedQuote + '<br><br>' +
        '<strong>File:</strong> <a href="' + fileUrl + '">Open ' + fileData.name + '</a>' +
      '</p><br><br>' + 
      mySignature;

    // 5. Send to Admin (reuse the same single blob — never the Drive file)
    GmailApp.sendEmail(adminEmail, "NEW LEAD: Quote - " + formData.companyName, 
      "New lead captured.\n\nCompany: " + formData.companyName + "\nClient: " + formData.firstName + " " + formData.lastName + "\nFile: " + fileUrl, 
      {
        htmlBody: adminHtmlBody,
        attachments: [pdfAttachment],
        from: "sales@bktadvisory.com",
        name: "BKT Advisory, Sales"
      }
    );

    // --- FIX END ---
    
    return ContentService.createTextOutput(JSON.stringify({status: "success", fileUrl: fileUrl}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function forceRowResize() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Inbound Leads - Website");
  
  // Safety check: if sheet name is wrong, stop
  if (!sheet) {
    Logger.log("Sheet not found!");
    return; 
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  // Ensure there is actually data below the header (Row 1)
  if (lastRow > 1) {
    // 1. Select all data from Row 2 down
    var fullRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    
    // 2. CRITICAL: Force text to "CLIP" (Cut off). 
    // If this is set to WRAP, rows will refuse to shrink.
    fullRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    
    // 3. Force Vertical Alignment to Middle (looks cleaner)
    fullRange.setVerticalAlignment("middle");

    // 4. Hard set the row heights
    sheet.setRowHeights(2, lastRow - 1, 24);
    
    // 5. Force Google to update the view immediately
    SpreadsheetApp.flush();
  }
}