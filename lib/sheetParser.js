import { MONTH_LIST, getMonthFromDate } from './dateUtils';

/**
 * Parses raw copy-pasted text from Google Sheets / Excel / Markdown into structured team order data.
 * Extracts HTML clipboard hyperlinks and maps Gross, Net, Payout, and Sheet URLs with high precision.
 */
export function parseRawSheetText(rawInput, overrideUrl = '') {
  if (!rawInput || !rawInput.trim()) return null;

  const raw = rawInput.trim();

  // Extract Markdown Link or Raw URL if present
  let extractedUrl = overrideUrl || '';
  if (!extractedUrl) {
    const markdownLinkMatch = raw.match(/\[.*?\]\((https?:\/\/[^\s\)]+)\)/);
    if (markdownLinkMatch) {
      extractedUrl = markdownLinkMatch[1];
    } else {
      const rawUrlMatch = raw.match(/(https?:\/\/[^\s]+)/);
      if (rawUrlMatch) {
        extractedUrl = rawUrlMatch[1];
      }
    }
  }

  // Tokenize by tabs or newlines
  let tokens = [];
  if (raw.includes('\t')) {
    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
    let dataLine = lines[0];
    if (lines.length >= 2 && lines[0].toLowerCase().includes('sales')) {
      dataLine = lines[1];
    }
    tokens = dataLine.split('\t').map((t) => t.trim());
  } else {
    tokens = raw.split(/\r?\n/).map((t) => t.trim()).filter((t) => t.length > 0);
  }

  // Known headers to remove if present
  const knownHeaders = [
    'sales person', 'date', 'profile name', 'client user id', 'order number',
    'amount', 'assigned name', 'estimated delivery date', 'remark', 'total fresh',
    'order status', 'sheet link', 'team', 'deli_date', 'percentage', 'note'
  ];
  tokens = tokens.filter((t) => !knownHeaders.includes(t.toLowerCase()));

  // Collect currency tokens (e.g. $200.00, $160.00, $40.00)
  const currencyTokens = tokens.filter((t) => t.startsWith('$') || /^\$\d+(\.\d{1,2})?$/.test(t));

  let grossAmount = '';
  let payoutPercentage = '';

  if (currencyTokens.length >= 3) {
    grossAmount = String(parseCurrency(currencyTokens[0]) || '');
    // Currency token 0 is Gross ($200.00), Token 1 is Net ($160.00), Token 2 is Payout ($40.00)
    payoutPercentage = String(parseCurrency(currencyTokens[currencyTokens.length - 1]) || '');
  } else if (currencyTokens.length === 2) {
    grossAmount = String(parseCurrency(currencyTokens[0]) || '');
    payoutPercentage = String(parseCurrency(currencyTokens[1]) || '');
  } else if (currencyTokens.length === 1) {
    grossAmount = String(parseCurrency(currencyTokens[0]) || '');
  }

  let salesPerson = 'Tamim Iqbal';
  let assignDate = new Date().toISOString().split('T')[0];
  let profileName = '';
  let clientUserId = '';
  let orderNumber = '';
  let assignedMembers = [];
  let estimatedDeliveryDate = '';
  let deliveryDate = '';
  let remark = '';
  let orderStatus = 'Wip';
  let teamName = 'EleSquad';

  tokens.forEach((t) => {
    const lower = t.toLowerCase();

    // Check if URL
    if (t.startsWith('http://') || t.startsWith('https://') || t.includes('docs.google.com') || t.startsWith('[')) {
      const u = extractUrlFromText(t);
      if (u && !extractedUrl) extractedUrl = u;
      return;
    }

    // Check if Status
    const knownStatuses = ['wip', 'delivered', 'done', 'nra', 'need requirements', 'cancel', 'issue'];
    if (knownStatuses.some((s) => lower === s || lower.includes('wip') || lower.includes('deliver') || lower.includes('done') || lower.includes('cancel'))) {
      orderStatus = normalizeStatus(t);
      return;
    }

    // Check if Order Number (e.g. FO2231D9D1308)
    if (/^FO[A-Z0-9]+$/i.test(t)) {
      orderNumber = t;
      return;
    }

    // Check if Date (e.g. 14-Sep-2026 or 09/29/2026 2:00:00 PM)
    if (/\d{1,4}[-/\s][A-Za-z0-9]{2,4}[-/\s]\d{2,4}/.test(t) || /\d{1,2}\/\d{1,2}\/\d{4}/.test(t)) {
      const parsedD = parseAndFormatDate(t);
      if (parsedD) {
        if (!assignDate || assignDate === new Date().toISOString().split('T')[0]) {
          assignDate = parsedD;
        } else {
          deliveryDate = parsedD;
        }
      }
      return;
    }

    // Currency tokens handled separately above
    if (t.startsWith('$')) return;

    // Check if known Sales Person
    if (lower.includes('tamim') || lower.includes('shuvo') || lower.includes('rone') || lower.includes('chayon')) {
      salesPerson = t;
      return;
    }

    // Check if Team Name
    if (lower.includes('elesquad') || lower.includes('smt')) {
      teamName = t;
      return;
    }

    // Remaining strings
    if (!profileName && isNaN(t) && !t.includes(' ')) {
      profileName = t;
    } else if (!clientUserId && isNaN(t) && !t.includes(' ')) {
      clientUserId = t;
    } else if (!assignedMembers.length && isNaN(t)) {
      assignedMembers = [t];
    } else if (!remark && isNaN(t) && !t.includes('WordPress_')) {
      remark = t;
    }
  });

  const autoMonth = getMonthFromDate(assignDate, MONTH_LIST[new Date().getMonth()]);
  const validSheetUrl = ensureValidUrl(extractedUrl);

  return {
    salesPerson: salesPerson || 'Tamim Iqbal',
    assignDate: assignDate,
    month: autoMonth,
    profileName: profileName || '',
    clientUserId: clientUserId || '',
    orderNumber: orderNumber || '',
    amount: grossAmount || '',
    assignedMembers: assignedMembers.length > 0 ? assignedMembers : ['Akash'],
    estimatedDeliveryDate: estimatedDeliveryDate || '',
    deliveryDate: deliveryDate || '',
    remark: remark || '',
    orderStatus: orderStatus || 'Wip',
    sheetLink: validSheetUrl || '',
    teamName: teamName || 'EleSquad',
    percentage: payoutPercentage || '',
    note: '',
  };
}

export function extractUrlFromHtmlOrText(htmlData, textData) {
  if (htmlData) {
    const hrefMatches = htmlData.match(/href=["']?(https?:\/\/[^\s"'>]+)["']?/gi);
    if (hrefMatches && hrefMatches.length > 0) {
      for (const m of hrefMatches) {
        const clean = m.replace(/^href=["']?/i, '').replace(/["']?$/, '');
        if (clean.includes('google.com') || clean.includes('docs.google.com') || clean.includes('sheets') || clean.startsWith('http')) {
          return clean;
        }
      }
    }

    const googleUrlMatch = htmlData.match(/(https?:\/\/(docs|sheets|drive)\.google\.com\/[^\s"<'>]+)/i);
    if (googleUrlMatch) {
      return googleUrlMatch[1];
    }
  }

  if (textData) {
    const mdMatch = textData.match(/\[.*?\]\((https?:\/\/[^\s\)]+)\)/);
    if (mdMatch) return mdMatch[1];

    const rawMatch = textData.match(/(https?:\/\/[^\s]+)/);
    if (rawMatch) return rawMatch[1];
  }

  return '';
}

export function ensureValidUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.includes('docs.google.com') || trimmed.includes('sheets.google.com') || trimmed.includes('drive.google.com') || trimmed.includes('github.com')) {
    return `https://${trimmed}`;
  }
  return '';
}

function parseCurrency(str) {
  if (!str) return null;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
}

function extractUrlFromText(text) {
  if (!text) return '';
  const mdMatch = text.match(/\[.*?\]\((https?:\/\/[^\s\)]+)\)/);
  if (mdMatch) return mdMatch[1];
  const match = text.match(/(https?:\/\/[^\s]+)/);
  return match ? match[1] : '';
}

function normalizeStatus(s) {
  if (!s) return 'Wip';
  const lower = s.toLowerCase();
  if (lower.includes('deliver')) return 'Delivered';
  if (lower.includes('done')) return 'Done';
  if (lower.includes('nra')) return 'NRA';
  if (lower.includes('cancel')) return 'Cancel';
  if (lower.includes('need')) return 'Need Requirements';
  return 'Wip';
}

function parseAndFormatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const cleanStr = dateStr.split(' ')[0];
    const d = new Date(cleanStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {}
  return null;
}

export function parsePersonalSheetText(rawInput, overrideUrl = '') {
  if (!rawInput || !rawInput.trim()) return null;

  const raw = rawInput.trim();

  let extractedUrl = overrideUrl || '';
  if (!extractedUrl) {
    const markdownLinkMatch = raw.match(/\[.*?\]\((https?:\/\/[^\s\)]+)\)/);
    if (markdownLinkMatch) {
      extractedUrl = markdownLinkMatch[1];
    } else {
      const rawUrlMatch = raw.match(/(https?:\/\/[^\s]+)/);
      if (rawUrlMatch) {
        extractedUrl = rawUrlMatch[1];
      }
    }
  }

  let tokens = [];
  if (raw.includes('\t')) {
    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
    tokens = lines[0].split('\t').map((t) => t.trim());
  } else {
    tokens = raw.split(/\r?\n/).map((t) => t.trim()).filter((t) => t.length > 0);
  }

  const currencyTokens = tokens.filter((t) => t.startsWith('$') || /^\$\d+(\.\d{1,2})?$/.test(t));
  let amount = '';
  if (currencyTokens.length > 0) {
    amount = String(parseCurrency(currencyTokens[0]) || '');
  }

  let assignDate = new Date().toISOString().split('T')[0];
  let clientUsername = '';
  let profileName = '';
  let orderStatus = 'Wip';
  let deadline = '';
  let timeSchedule = 'Fresh Query';
  let notes = '';

  tokens.forEach((t) => {
    const lower = t.toLowerCase();

    if (t.startsWith('http://') || t.startsWith('https://') || t.includes('docs.google.com') || t.startsWith('[')) {
      const u = extractUrlFromText(t);
      if (u && !extractedUrl) extractedUrl = u;
      return;
    }

    const knownStatuses = ['wip', 'delivered', 'done', 'issue', 'cancel'];
    if (knownStatuses.some((s) => lower === s || lower.includes('wip') || lower.includes('deliver') || lower.includes('done') || lower.includes('cancel'))) {
      if (lower.includes('deliver')) orderStatus = 'Delivered';
      else if (lower.includes('done')) orderStatus = 'Done';
      else if (lower.includes('cancel')) orderStatus = 'Cancel';
      else if (lower.includes('issue')) orderStatus = 'Issue';
      else orderStatus = 'Wip';
      return;
    }

    if (/\d{1,4}[-/\s][A-Za-z0-9]{2,4}[-/\s]\d{2,4}/.test(t) || /\d{1,2}\/\d{1,2}\/\d{4}/.test(t)) {
      const parsedD = parseAndFormatDate(t);
      if (parsedD) {
        if (!assignDate || assignDate === new Date().toISOString().split('T')[0]) {
          assignDate = parsedD;
        } else {
          deadline = parsedD;
        }
      }
      return;
    }

    if (t.startsWith('$')) return;

    if (lower === 'fresh query' || lower === 'fresh' || lower === 'late' || lower.includes('repeat') || lower.includes('add-on')) {
      if (lower.includes('late')) timeSchedule = 'Late';
      else if (lower.includes('repeat')) timeSchedule = 'Repeat Order';
      else if (lower.includes('add')) timeSchedule = 'Add-on';
      else timeSchedule = 'Fresh Query';
      return;
    }

    if (!clientUsername && isNaN(t) && !t.includes(' ')) {
      clientUsername = t;
    } else if (!profileName && isNaN(t) && !t.includes(' ')) {
      profileName = t;
    } else if (!notes && isNaN(t)) {
      notes = t;
    }
  });

  const autoMonth = getMonthFromDate(assignDate, MONTH_LIST[new Date().getMonth()]);
  const validSheetUrl = ensureValidUrl(extractedUrl);

  return {
    assignDate: assignDate,
    month: autoMonth,
    clientUsername: clientUsername || '',
    profileName: profileName || '',
    amount: amount || '',
    orderStatus: orderStatus || 'Wip',
    deadline: deadline || '',
    instructionSheet: validSheetUrl || '',
    timeSchedule: timeSchedule || 'Fresh Query',
    notes: notes || '',
  };
}
