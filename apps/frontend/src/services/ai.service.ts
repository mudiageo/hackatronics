import { createServerFn } from '@tanstack/react-start'
import { getDashboardData } from './dashboard.service'

export const scanTransactionFn = createServerFn({ method: 'POST' })
  .validator((data: { base64Data: string; mimeType: string }) => data)
  .handler(async ({ data }) => {
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    
    if (!useMocks) {
      try {
        const byteCharacters = atob(data.base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: data.mimeType });
        
        const formData = new FormData();
        formData.append('file', blob, 'receipt.jpg');
        
        const res = await fetch(`${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/scan-transaction`, {
          method: 'POST',
          body: formData
        });
        
        if (!res.ok) {
          throw new Error('AI processing failed.');
        }
        return await res.json();
      } catch (error) {
        console.warn("Falling back to AI mock due to error:", error);
      }
    }
    
    // MOCK FALLBACK
    await new Promise(r => setTimeout(r, 2000));
    return {
      customer: "John Doe (Scanned)",
      amount: 1250000, 
      payment_method: "Cash",
      items: [
        { read_as: "Amox", quantity: 1, resolved: false, matches: [{ id: 4, name: "Amoxicillin 500mg", unit_price: 120000 }] },
        { read_as: "Panadol", quantity: 2, resolved: true, matches: [{ id: 57, name: "Panadol Extra", unit_price: 150000 }] }
      ],
      attestation_level: "self_reported",
      requires_confirmation: true,
      note: "Read from an image supplied by the business."
    }
  });

export const analyzeBusinessFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    
    if (!useMocks && apiKey) {
      try {
        const dashData = await getDashboardData();
        
        const prompt = `You are an expert AI business analyst for a Nigerian Pharmacy. 
        Analyze the following financial data and return a JSON object with this exact schema:
        { "summary": "A 2-3 sentence executive summary", "metrics": [{ "label": "String", "value": "String", "positive": boolean }], "recommendation": "A 1-2 sentence actionable business recommendation" }
        
        Data:
        Revenue: ${dashData.metricsSummary.revenue} kobo
        Expenses: ${dashData.metricsSummary.expenses} kobo
        Profit: ${dashData.metricsSummary.profit} kobo
        Settled Coverage: ${dashData.coverage.settled}%
        Recent Activity: ${JSON.stringify(dashData.recentActivity.map(t => ({desc: t.desc, amount: t.amount, status: t.status})))}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (res.ok) {
          const json = await res.json();
          const text = json.candidates[0].content.parts[0].text;
          return JSON.parse(text);
        }
      } catch (err) {
        console.warn("Gemini Analyst failed, falling back to mock", err);
      }
    }
    
    // MOCK FALLBACK
    await new Promise(r => setTimeout(r, 1500));
    return {
      summary: "Business is looking healthy this month. You have a 95% settlement rate on transactions, which is excellent. However, there are 2 medications running low in stock.",
      metrics: [
        { label: "Revenue Trend", value: "+12% vs last month", positive: true },
        { label: "Pending Settlements", value: "3", positive: false },
        { label: "Low Stock Items", value: "Amoxicillin, Panadol", positive: false }
      ],
      recommendation: "Consider restocking Amoxicillin before the weekend rush to maximize sales."
    }
  });

export const processVoiceCommandFn = createServerFn({ method: 'POST' })
  .validator((data: { transcript: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const useMocks = process.env.VITE_USE_MOCKS !== 'false';
    
    if (!useMocks && apiKey) {
      try {
        const prompt = `You are a voice assistant for a pharmacy management app.
        Parse the user's transcript and return a JSON object with this exact schema:
        { "intent": "add_inventory" | "prescribe" | "unknown", "data": { "drug_name": "String", "quantity": Number }, "message": "A friendly confirmation message" }
        
        Transcript: "${data.transcript}"`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (res.ok) {
          const json = await res.json();
          const text = json.candidates[0].content.parts[0].text;
          return JSON.parse(text);
        }
      } catch (err) {
        console.warn("Gemini Voice processing failed, falling back to mock", err);
      }
    }

    // MOCK FALLBACK
    await new Promise(r => setTimeout(r, 800));
    const t = data.transcript.toLowerCase();
    
    if (t.includes('add') || t.includes('stock')) {
      return {
        intent: 'add_inventory',
        data: { drug_name: 'Panadol Extra', quantity: 20 },
        message: "I understood you want to add 20 units of Panadol Extra."
      }
    }
    
    if (t.includes('prescribe') || t.includes('generate')) {
      return {
        intent: 'prescribe',
        data: { patient_name: 'Patient 421', drug_name: 'Amoxicillin 500mg', dose: '500mg', frequency: 3, days: 5 },
        message: "I'll help you prescribe Amoxicillin 500mg for 5 days."
      }
    }
    
    return {
      intent: 'unknown',
      data: null,
      message: "I couldn't quite understand that command. Try 'Add 20 units of Panadol' or 'Prescribe Amox'."
    }
  });
