import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { getServiceSupabase } from '@/lib/supabase';
import { CadenceGenerator } from '@/lib/cadenceGenerator';
import { Lead } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let csvData = '';
    let campaignId = 'enterprise-outbound';
    let assignedRepId: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      campaignId = (formData.get('campaignId') as string) || campaignId;
      assignedRepId = (formData.get('assignedRepId') as string) || null;
      if (file) {
        csvData = await file.text();
      }
    } else {
      const body = await req.json();
      csvData = body.csvData || '';
      campaignId = body.campaignId || campaignId;
      assignedRepId = body.assignedRepId || null;
    }

    if (!csvData || csvData.trim().length === 0) {
      return NextResponse.json({ error: 'CSV data is empty' }, { status: 400 });
    }

    // 1. Parse CSV with PapaParse
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors && parsed.errors.length > 0) {
      console.warn('[CSV Import] Notice on rows:', parsed.errors.slice(0, 3));
    }

    const rows = parsed.data as Record<string, string>[];
    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data rows found in CSV' }, { status: 400 });
    }

    // 2. Intelligent Auto-Column Mapping
    const mappedLeads: Lead[] = rows.map((row, index) => {
      const keys = Object.keys(row);
      const findKey = (...aliases: string[]) => {
        const lowerAliases = aliases.map(a => a.toLowerCase().replace(/[^a-z0-9]/g, ''));
        return keys.find(k => {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          return lowerAliases.includes(cleanK);
        });
      };

      const emailKey = findKey('email', 'email address', 'e-mail', 'mail');
      const companyKey = findKey('company', 'company name', 'account', 'organization');
      const titleKey = findKey('title', 'job title', 'role', 'position');
      const phoneKey = findKey('phone', 'phone number', 'mobile', 'telephone');
      const firstNameKey = findKey('first name', 'firstname', 'first', 'fname');
      const lastNameKey = findKey('last name', 'lastname', 'last', 'lname');
      const fullNameKey = findKey('name', 'full name', 'contact name');

      let firstName = firstNameKey ? row[firstNameKey] : '';
      let lastName = lastNameKey ? row[lastNameKey] : '';

      if (!firstName && fullNameKey && row[fullNameKey]) {
        const parts = row[fullNameKey].trim().split(' ');
        firstName = parts[0] || '';
        lastName = parts.slice(1).join(' ') || '';
      }

      // Collect custom variables
      const standardKeys = [emailKey, companyKey, titleKey, phoneKey, firstNameKey, lastNameKey, fullNameKey].filter(Boolean);
      const customVars: Record<string, string> = {};
      for (const k of keys) {
        if (!standardKeys.includes(k) && row[k]) {
          customVars[k] = row[k];
        }
      }

      return {
        id: `lead-${Date.now()}-${index}`,
        campaign_id: campaignId,
        assigned_rep_id: assignedRepId || undefined,
        first_name: firstName || 'Prospect',
        last_name: lastName || '',
        email: (emailKey ? row[emailKey] : '') || `lead${index}@example.com`,
        phone: phoneKey ? row[phoneKey] : '',
        company: (companyKey ? row[companyKey] : '') || 'Target Account',
        title: (titleKey ? row[titleKey] : '') || 'Executive',
        status: 'new',
        custom_variables: customVars,
        created_at: new Date().toISOString()
      };
    });

    // 3. Persist into Supabase leads table
    const supabase = getServiceSupabase();
    try {
      const recordsToInsert = mappedLeads.map(l => ({
        campaign_id: campaignId === 'enterprise-outbound' ? null : campaignId,
        assigned_rep_id: assignedRepId,
        first_name: l.first_name,
        last_name: l.last_name,
        email: l.email,
        phone: l.phone,
        company: l.company,
        title: l.title,
        status: l.status,
        custom_variables: l.custom_variables
      }));

      await supabase.from('leads').insert(recordsToInsert);
    } catch (dbErr) {
      console.warn('[CSV Import] Supabase insert notice:', dbErr);
    }

    return NextResponse.json({
      success: true,
      importedCount: mappedLeads.length,
      leads: mappedLeads
    });

  } catch (error: any) {
    console.error('[CSV Import] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import CSV' },
      { status: 500 }
    );
  }
}
